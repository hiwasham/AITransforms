/**
 * BFVDeliverable entity + verification (T035, T042-lite for MVP-1).
 *
 * "Verified" means a server-side readiness check (data-model.md
 * BFVDeliverable "What verified means"): bot healthy, token resolves to a
 * loaded context, and a test prompt against that context returns a real
 * LLM response — never a live Telegram click-through, which the Bot API
 * cannot perform.
 *
 * MVP-1 scope: a single verification attempt (pass/fail). The bounded
 * retry loop (multiple attempts before falling back to
 * verification_failed → needs_attention) is T042, Phase 2.
 */

import { randomUUID } from "node:crypto";
import type { Db } from "@/db/client.js";
import type { BFVBotClient } from "@/services/telegram/bfv-bot-client.js";
import type { LLMClient } from "@/services/llm/llm-client.js";

export type VerificationStatus =
  | "pending_verification"
  | "verified"
  | "verification_failed";

export interface BFVDeliverable {
  id: string;
  outreachAttemptId: string;
  telegramDeepLinkToken: string;
  contextRef: string;
  verificationStatus: VerificationStatus;
  verifiedAt: string | null;
  verificationAttempts: number;
}

interface BFVRow {
  id: string;
  outreach_attempt_id: string;
  telegram_deep_link_token: string;
  context_ref: string;
  verification_status: VerificationStatus;
  verified_at: string | null;
  verification_attempts: number;
}

function fromRow(row: BFVRow): BFVDeliverable {
  return {
    id: row.id,
    outreachAttemptId: row.outreach_attempt_id,
    telegramDeepLinkToken: row.telegram_deep_link_token,
    contextRef: row.context_ref,
    verificationStatus: row.verification_status,
    verifiedAt: row.verified_at,
    verificationAttempts: row.verification_attempts,
  };
}

export async function create(
  db: Db,
  input: {
    outreachAttemptId: string;
    telegramDeepLinkToken: string;
    contextRef: string;
  },
): Promise<BFVDeliverable> {
  const id = randomUUID();
  const result = await db.query<BFVRow>(
    `INSERT INTO bfv_deliverables
       (id, outreach_attempt_id, telegram_deep_link_token, context_ref)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id, input.outreachAttemptId, input.telegramDeepLinkToken, input.contextRef],
  );
  return fromRow(result.rows[0]!);
}

export async function getByAttemptId(
  db: Db,
  outreachAttemptId: string,
): Promise<BFVDeliverable | null> {
  const result = await db.query<BFVRow>(
    `SELECT * FROM bfv_deliverables WHERE outreach_attempt_id = $1`,
    [outreachAttemptId],
  );
  return result.rows[0] ? fromRow(result.rows[0]) : null;
}

export async function markVerified(db: Db, id: string): Promise<void> {
  await db.query(
    `UPDATE bfv_deliverables
     SET verification_status = 'verified',
         verified_at = now(),
         verification_attempts = verification_attempts + 1
     WHERE id = $1`,
    [id],
  );
}

export async function markVerificationFailed(db: Db, id: string): Promise<void> {
  await db.query(
    `UPDATE bfv_deliverables
     SET verification_status = 'verification_failed',
         verification_attempts = verification_attempts + 1
     WHERE id = $1`,
    [id],
  );
}

/** The readiness check itself — bot healthy + context resolves + test LLM prompt succeeds. */
export async function checkReadiness(
  botClient: BFVBotClient,
  llmClient: LLMClient,
  contextRef: string,
): Promise<boolean> {
  const healthy = await botClient.isBotHealthy();
  if (!healthy) return false;

  const resolves = await botClient.contextResolves(contextRef);
  if (!resolves) return false;

  const response = await llmClient.complete(
    `Test prompt for context ${contextRef}: respond with any non-empty text.`,
  );
  return typeof response === "string" && response.length > 0;
}
