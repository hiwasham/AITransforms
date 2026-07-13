/**
 * Workflow State Machine (T041, data-model.md).
 *
 * generated -> quality_checked -> human_review_queue -> approved
 *   -> dispatching -> sent -> response_tracking
 * quality_checked -> revision_requested -> quality_checked (bounded loop)
 *   -> needs_manual_draft (cap exceeded)
 * (initial)/generated -> needs_attention (incomplete snapshot or BFV
 *   verification failure)
 * approved/dispatch_failed -> dispatching -> sent | dispatch_failed
 *   (the separate, retriable dispatch sub-machine — CHK003 correction:
 *   `sent` is reachable ONLY via `dispatching`, never directly from
 *   `approved` — this is what makes it structurally impossible for
 *   `/approve` to also dispatch.)
 */

import type { WorkflowState } from "@/domain/prospects/outreach-attempt.js";

export { TERMINAL_TO_BATCH_RESUME } from "@/domain/prospects/outreach-attempt.js";

const LEGAL_TRANSITIONS: Record<WorkflowState, ReadonlySet<WorkflowState>> = {
  generated: new Set(["quality_checked", "needs_attention"]),
  quality_checked: new Set(["human_review_queue", "revision_requested"]),
  revision_requested: new Set(["quality_checked", "needs_manual_draft"]),
  needs_manual_draft: new Set([]),
  needs_attention: new Set([]),
  human_review_queue: new Set(["approved"]),
  approved: new Set(["dispatching"]),
  dispatching: new Set(["sent", "dispatch_failed"]),
  dispatch_failed: new Set(["dispatching"]),
  sent: new Set(["response_tracking"]),
  response_tracking: new Set([]),
};

export function isValidTransition(
  from: WorkflowState,
  to: WorkflowState,
): boolean {
  return LEGAL_TRANSITIONS[from]?.has(to) ?? false;
}

/** `sent` is reachable only through `dispatching` — never directly from `approved`, and never a same-call side effect of `/approve` (CHK003). */
export function canReachSentDirectlyFromApproved(): boolean {
  return isValidTransition("approved", "sent");
}

export const ALL_WORKFLOW_STATES: readonly WorkflowState[] = [
  "generated",
  "quality_checked",
  "revision_requested",
  "needs_manual_draft",
  "needs_attention",
  "human_review_queue",
  "approved",
  "dispatching",
  "dispatch_failed",
  "sent",
  "response_tracking",
];
