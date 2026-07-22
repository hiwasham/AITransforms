/**
 * ReviewPackage entity + repository (M004, specs/002-operator-review-dashboard
 * MVP-0). CSV-imported prospect packages the operator reviews one at a
 * time. Isolated from the outreach workflow state machine by design
 * (spec 002 FR-018) — no import of, or FK to, prospects/outreach_attempts.
 */

import { randomUUID } from "node:crypto";
import type { Db } from "@/db/client.js";

export type ReviewDecision = "pending" | "approved" | "rejected";

/** G7/FR-021 rejection-reason tags (specs/002 D5). UI maps g/f/b/c/o → these. */
export type RejectionReason =
  | "generic"
  | "false_claim"
  | "bad_fit"
  | "creepy"
  | "other";

export const REJECTION_REASONS: readonly RejectionReason[] = [
  "generic",
  "false_claim",
  "bad_fit",
  "creepy",
  "other",
];

export interface ReviewPackage {
  id: string;
  dedupKey: string;
  sourceName: string;
  position: number;
  company: string;
  contact: string | null;
  researchSummary: string;
  painPoint: string;
  messageBody: string;
  bfvLinkTelegram: string;
  videoUrl: string | null;
  generatorFlag: string | null;
  decision: ReviewDecision;
  decidedAt: string | null;
  passedOverAt: string | null;
  rejectionReason: RejectionReason | null;
}

export interface NewReviewPackage {
  dedupKey: string;
  sourceName: string;
  company: string;
  contact: string | null;
  researchSummary: string;
  painPoint: string;
  messageBody: string;
  bfvLinkTelegram: string;
  videoUrl: string | null;
  generatorFlag: string | null;
  /** Import rows already approved in the source arrive pre-decided (FR-003). */
  decision?: ReviewDecision;
}

interface Row {
  id: string;
  dedup_key: string;
  source_name: string;
  position: number;
  company: string;
  contact: string | null;
  research_summary: string;
  pain_point: string;
  message_body: string;
  bfv_link_telegram: string;
  video_url: string | null;
  generator_flag: string | null;
  decision: ReviewDecision;
  decided_at: string | null;
  passed_over_at: string | null;
  rejection_reason: RejectionReason | null;
}

const COLUMNS = `id, dedup_key, source_name, position, company, contact,
  research_summary, pain_point, message_body, bfv_link_telegram, video_url,
  generator_flag, decision, decided_at::text, passed_over_at::text,
  rejection_reason`;

function fromRow(row: Row): ReviewPackage {
  return {
    id: row.id,
    dedupKey: row.dedup_key,
    sourceName: row.source_name,
    position: row.position,
    company: row.company,
    contact: row.contact,
    researchSummary: row.research_summary,
    painPoint: row.pain_point,
    messageBody: row.message_body,
    bfvLinkTelegram: row.bfv_link_telegram,
    videoUrl: row.video_url,
    generatorFlag: row.generator_flag,
    decision: row.decision,
    decidedAt: row.decided_at,
    passedOverAt: row.passed_over_at,
    rejectionReason: row.rejection_reason,
  };
}

/** Insert one package; position is assigned as max(position)+1. Returns null on dedup_key conflict (FR-002 idempotency). */
export async function create(
  db: Db,
  pkg: NewReviewPackage,
): Promise<ReviewPackage | null> {
  const decision = pkg.decision ?? "pending";
  const result = await db.query<Row>(
    `INSERT INTO review_packages (
       id, dedup_key, source_name, position, company, contact,
       research_summary, pain_point, message_body, bfv_link_telegram,
       video_url, generator_flag, decision, decided_at
     )
     VALUES ($1, $2, $3,
       (SELECT COALESCE(MAX(position), 0) + 1 FROM review_packages),
       $4, $5, $6, $7, $8, $9, $10, $11, $12,
       CASE WHEN $12 = 'pending' THEN NULL ELSE now() END)
     ON CONFLICT (dedup_key) DO NOTHING
     RETURNING ${COLUMNS}`,
    [
      randomUUID(),
      pkg.dedupKey,
      pkg.sourceName,
      pkg.company,
      pkg.contact,
      pkg.researchSummary,
      pkg.painPoint,
      pkg.messageBody,
      pkg.bfvLinkTelegram,
      pkg.videoUrl,
      pkg.generatorFlag,
      decision,
    ],
  );
  const row = result.rows[0];
  return row ? fromRow(row) : null;
}

export async function getById(db: Db, id: string): Promise<ReviewPackage | null> {
  const result = await db.query<Row>(
    `SELECT ${COLUMNS} FROM review_packages WHERE id = $1`,
    [id],
  );
  const row = result.rows[0];
  return row ? fromRow(row) : null;
}

/**
 * The next package in review order (spec 002 §MVP-0 skip semantics):
 * first pending never-passed-over by position; when none remain, first
 * pending passed-over by passed_over_at — a passed-over prospect is never
 * lost and returns before the queue reports complete. Null = complete.
 */
export async function getNext(db: Db): Promise<ReviewPackage | null> {
  const result = await db.query<Row>(
    `SELECT ${COLUMNS} FROM review_packages
     WHERE decision = 'pending'
     ORDER BY (passed_over_at IS NOT NULL), passed_over_at, position
     LIMIT 1`,
  );
  const row = result.rows[0];
  return row ? fromRow(row) : null;
}

/** Approve/reject: last-write-wins (FR-010), clears any passed-over mark. */
export async function recordDecision(
  db: Db,
  id: string,
  decision: "approved" | "rejected",
): Promise<ReviewPackage | null> {
  const result = await db.query<Row>(
    `UPDATE review_packages
     SET decision = $2, decided_at = now(), passed_over_at = NULL,
         rejection_reason = NULL
     WHERE id = $1
     RETURNING ${COLUMNS}`,
    [id, decision],
  );
  const row = result.rows[0];
  return row ? fromRow(row) : null;
}

/**
 * Tag a rejection with a structured reason (Q011, specs/002 D3/D11/D12).
 * Atomic conditional write: only a currently-rejected package can be
 * tagged, so the "reason ⟹ rejected" invariant is enforced in one SQL
 * round-trip with no read-then-write race (Codex #1). A subsequent
 * decision write clears the tag (recordDecision, D11), so a re-reject
 * starts untagged. Returns the updated package, or null when no row was
 * currently-rejected (unknown id OR wrong state) — the caller
 * distinguishes 404 vs 409 by first probing existence.
 */
export async function setRejectionReason(
  db: Db,
  id: string,
  reason: RejectionReason,
): Promise<ReviewPackage | null> {
  const result = await db.query<Row>(
    `UPDATE review_packages
     SET rejection_reason = $2
     WHERE id = $1 AND decision = 'rejected'
     RETURNING ${COLUMNS}`,
    [id, reason],
  );
  const row = result.rows[0];
  return row ? fromRow(row) : null;
}

/** "next" without deciding: mark passed-over; decision stays pending. */
export async function markPassedOver(
  db: Db,
  id: string,
): Promise<ReviewPackage | null> {
  const result = await db.query<Row>(
    `UPDATE review_packages
     SET passed_over_at = now()
     WHERE id = $1
     RETURNING ${COLUMNS}`,
    [id],
  );
  const row = result.rows[0];
  return row ? fromRow(row) : null;
}

export interface ReviewCounts {
  total: number;
  reviewed: number; // approved + rejected
}

export async function getCounts(db: Db): Promise<ReviewCounts> {
  const result = await db.query<{ total: number; reviewed: number }>(
    `SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE decision <> 'pending')::int AS reviewed
     FROM review_packages`,
  );
  return result.rows[0] ?? { total: 0, reviewed: 0 };
}
