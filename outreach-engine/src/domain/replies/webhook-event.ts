/**
 * WebhookEvent entity (T062, data-model.md), including
 * `resulted_in_transition` (correction #3) and the `(provider,
 * provider_event_id)` idempotency check the schema's UNIQUE constraint backs.
 */

import { randomUUID } from "node:crypto";
import type { Db } from "@/db/client.js";

export type WebhookProvider = "instantly" | "unipile";

export interface WebhookEvent {
  id: string;
  provider: WebhookProvider;
  providerEventId: string;
  signatureVerified: boolean;
  matchedOutreachAttemptId: string | null;
  resultedInTransition: boolean;
  receivedAt: string;
}

interface WebhookEventRow {
  id: string;
  provider: WebhookProvider;
  provider_event_id: string;
  signature_verified: boolean;
  matched_outreach_attempt_id: string | null;
  resulted_in_transition: boolean;
  received_at: string;
}

function fromRow(row: WebhookEventRow): WebhookEvent {
  return {
    id: row.id,
    provider: row.provider,
    providerEventId: row.provider_event_id,
    signatureVerified: row.signature_verified,
    matchedOutreachAttemptId: row.matched_outreach_attempt_id,
    resultedInTransition: row.resulted_in_transition,
    receivedAt: row.received_at,
  };
}

export async function findByProviderEventId(
  db: Db,
  provider: WebhookProvider,
  providerEventId: string,
): Promise<WebhookEvent | null> {
  const result = await db.query<WebhookEventRow>(
    `SELECT * FROM webhook_events WHERE provider = $1 AND provider_event_id = $2`,
    [provider, providerEventId],
  );
  return result.rows[0] ? fromRow(result.rows[0]) : null;
}

export async function create(
  db: Db,
  input: {
    provider: WebhookProvider;
    providerEventId: string;
    signatureVerified: boolean;
    matchedOutreachAttemptId: string | null;
    resultedInTransition: boolean;
  },
): Promise<WebhookEvent> {
  const id = randomUUID();
  const result = await db.query<WebhookEventRow>(
    `INSERT INTO webhook_events
       (id, provider, provider_event_id, signature_verified,
        matched_outreach_attempt_id, resulted_in_transition)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      id,
      input.provider,
      input.providerEventId,
      input.signatureVerified,
      input.matchedOutreachAttemptId,
      input.resultedInTransition,
    ],
  );
  return fromRow(result.rows[0]!);
}
