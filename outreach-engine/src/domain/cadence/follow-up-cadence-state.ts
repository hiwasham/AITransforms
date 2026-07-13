/**
 * FollowUpCadenceState — minimal creation-only slice needed by MVP-1's
 * dispatch success path (data-model.md: "created automatically the
 * instant a dispatch attempt succeeds"). The cadence-tracking domain
 * logic that reads/advances this (US3) is Future — out of the named
 * 8-stage vertical slice.
 */

import { randomUUID } from "node:crypto";
import type { Db } from "@/db/client.js";

export async function createOnSend(
  db: Db,
  outreachAttemptId: string,
  sendDate: string,
): Promise<void> {
  await db.query(
    `INSERT INTO follow_up_cadence_states (id, outreach_attempt_id, send_date)
     VALUES ($1, $2, $3)
     ON CONFLICT (outreach_attempt_id) DO NOTHING`,
    [randomUUID(), outreachAttemptId, sendDate],
  );
}

/** Halts further cadence surfacing once a reply is detected (FR-022). */
export async function markInactive(
  db: Db,
  outreachAttemptId: string,
): Promise<void> {
  await db.query(
    `UPDATE follow_up_cadence_states SET exhausted_at = now()
     WHERE outreach_attempt_id = $1 AND exhausted_at IS NULL`,
    [outreachAttemptId],
  );
}
