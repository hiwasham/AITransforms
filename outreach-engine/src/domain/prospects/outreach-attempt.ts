/**
 * OutreachAttempt repository (T007, data-model.md OutreachAttempt entity).
 */

import { randomUUID } from "node:crypto";
import type { Db } from "@/db/client.js";

export type WorkflowState =
  | "generated"
  | "quality_checked"
  | "revision_requested"
  | "needs_manual_draft"
  | "needs_attention"
  | "human_review_queue"
  | "approved"
  | "dispatching"
  | "dispatch_failed"
  | "sent"
  | "response_tracking";

/** Never touched by a POST /batches/generate resume (data-model.md). */
export const TERMINAL_TO_BATCH_RESUME: ReadonlySet<WorkflowState> = new Set([
  "needs_attention",
  "needs_manual_draft",
  "human_review_queue",
  "approved",
  "dispatching",
  "dispatch_failed",
  "sent",
  "response_tracking",
]);

export interface OutreachAttempt {
  id: string;
  prospectId: string;
  attemptNumber: number;
  batchDate: string;
  workflowState: WorkflowState;
  providerThreadId: string | null;
  dispatchAttempts: number;
  lastDispatchError: string | null;
  dispatchingSince: string | null;
  createdAt: string;
}

interface AttemptRow {
  id: string;
  prospect_id: string;
  attempt_number: number;
  batch_date: string;
  workflow_state: WorkflowState;
  provider_thread_id: string | null;
  dispatch_attempts: number;
  last_dispatch_error: string | null;
  dispatching_since: string | null;
  created_at: string;
}

function fromRow(row: AttemptRow): OutreachAttempt {
  return {
    id: row.id,
    prospectId: row.prospect_id,
    attemptNumber: row.attempt_number,
    batchDate: row.batch_date,
    workflowState: row.workflow_state,
    providerThreadId: row.provider_thread_id,
    dispatchAttempts: row.dispatch_attempts,
    lastDispatchError: row.last_dispatch_error,
    dispatchingSince: row.dispatching_since,
    createdAt: row.created_at,
  };
}

export async function create(
  db: Db,
  input: { prospectId: string; attemptNumber: number; batchDate: string },
): Promise<OutreachAttempt> {
  const id = randomUUID();
  const result = await db.query<AttemptRow>(
    `INSERT INTO outreach_attempts (id, prospect_id, attempt_number, batch_date)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id, input.prospectId, input.attemptNumber, input.batchDate],
  );
  return fromRow(result.rows[0]!);
}

export async function getById(
  db: Db,
  id: string,
): Promise<OutreachAttempt | null> {
  const result = await db.query<AttemptRow>(
    `SELECT * FROM outreach_attempts WHERE id = $1`,
    [id],
  );
  return result.rows[0] ? fromRow(result.rows[0]) : null;
}

export async function setWorkflowState(
  db: Db,
  id: string,
  state: WorkflowState,
): Promise<void> {
  await db.query(
    `UPDATE outreach_attempts SET workflow_state = $2 WHERE id = $1`,
    [id, state],
  );
}

/** Rejects (returns false) if `from` doesn't match the current state — the enforcement point for illegal transitions (contracts' 409 semantics). */
export async function transition(
  db: Db,
  id: string,
  from: WorkflowState,
  to: WorkflowState,
): Promise<boolean> {
  const result = await db.query(
    `UPDATE outreach_attempts SET workflow_state = $3
     WHERE id = $1 AND workflow_state = $2`,
    [id, from, to],
  );
  return (result.affectedRows ?? 0) > 0;
}

/**
 * Enter `dispatching` and stamp `dispatching_since` — the timestamp the
 * Dispatch Recovery Rule's stuck-attempt timeout is measured against.
 * Also called on a stuck attempt already at `dispatching` to reset the
 * clock before its retry send.
 */
export async function markDispatching(db: Db, id: string): Promise<void> {
  await db.query(
    `UPDATE outreach_attempts
     SET workflow_state = 'dispatching', dispatching_since = now()
     WHERE id = $1`,
    [id],
  );
}

export async function recordDispatchSuccess(
  db: Db,
  id: string,
  providerThreadId: string,
): Promise<void> {
  await db.query(
    `UPDATE outreach_attempts
     SET workflow_state = 'sent', provider_thread_id = $2
     WHERE id = $1`,
    [id, providerThreadId],
  );
}

export async function recordDispatchFailure(
  db: Db,
  id: string,
  reason: string,
): Promise<void> {
  await db.query(
    `UPDATE outreach_attempts
     SET workflow_state = 'dispatch_failed',
         dispatch_attempts = dispatch_attempts + 1,
         last_dispatch_error = $2
     WHERE id = $1`,
    [id, reason],
  );
}

export async function findByProviderThreadId(
  db: Db,
  providerThreadId: string,
): Promise<OutreachAttempt | null> {
  const result = await db.query<AttemptRow>(
    `SELECT * FROM outreach_attempts WHERE provider_thread_id = $1`,
    [providerThreadId],
  );
  return result.rows[0] ? fromRow(result.rows[0]) : null;
}

/**
 * Attempts a `POST /batches/generate` retry resumes (T104, data-model.md
 * Resume Rule): stranded at exactly `generated` for the batch date — the
 * process died before their pipeline produced any pass/fail verdict.
 * Every TERMINAL_TO_BATCH_RESUME state is excluded by construction.
 */
export async function findResumable(
  db: Db,
  batchDate: string,
): Promise<OutreachAttempt[]> {
  const result = await db.query<AttemptRow>(
    `SELECT * FROM outreach_attempts
     WHERE batch_date = $1 AND workflow_state = 'generated'`,
    [batchDate],
  );
  return result.rows.map(fromRow);
}

/**
 * Attempts the automatic dispatch pass should process: `approved` /
 * `dispatch_failed` below the retry cap, plus attempts stuck at
 * `dispatching` past `stuckTimeoutMinutes` (process died mid-send —
 * treated identically to dispatch_failed per data-model.md's Dispatch
 * Recovery Rule; the idempotency key makes the retry safe).
 */
export async function findDispatchable(
  db: Db,
  automaticRetryCap: number,
  stuckTimeoutMinutes: number,
): Promise<OutreachAttempt[]> {
  const result = await db.query<AttemptRow>(
    `SELECT * FROM outreach_attempts
     WHERE (workflow_state IN ('approved', 'dispatch_failed')
            OR (workflow_state = 'dispatching'
                AND dispatching_since IS NOT NULL
                AND dispatching_since < now() - ($2 * interval '1 minute')))
       AND dispatch_attempts < $1`,
    [automaticRetryCap, stuckTimeoutMinutes],
  );
  return result.rows.map(fromRow);
}
