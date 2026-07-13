/**
 * POST /internal/dispatch/process (T047). Service-credential-only in
 * production (auth enforcement itself is T011/Phase 2 — this handler is
 * the business logic contracts/outreach-api.md describes).
 *
 * For every attempt at approved/dispatch_failed below the automatic-retry
 * cap — plus attempts stuck at `dispatching` past the stuck timeout (T105,
 * Dispatch Recovery Rule) — calls DispatchClient.send() with
 * idempotencyKey = attempt.id.
 * On success: sets provider_thread_id, dispatching -> sent, creates
 * FollowUpCadenceState. On failure OR a thrown send(): increments
 * dispatch_attempts, records last_dispatch_error, -> dispatch_failed,
 * and continues with the rest of the pass.
 */

import type { Db } from "@/db/client.js";
import type { DispatchClient } from "@/services/dispatch/interface.js";
import * as AttemptRepo from "@/domain/prospects/outreach-attempt.js";
import * as ScriptRepo from "@/domain/pipeline/outreach-script.js";
import * as ProspectRepo from "@/domain/prospects/prospect.js";
import * as CadenceRepo from "@/domain/cadence/follow-up-cadence-state.js";
import { jsonResponse } from "@/api/lib/errors.js";
import { logger } from "@/lib/logger.js";

export const AUTOMATIC_DISPATCH_RETRY_CAP = 3;
export const DISPATCH_STUCK_TIMEOUT_MINUTES = 10;

export async function processDispatchable(
  db: Db,
  dispatchClient: DispatchClient,
): Promise<{ processed: number; sent: number; failed: number }> {
  const dispatchable = await AttemptRepo.findDispatchable(
    db,
    AUTOMATIC_DISPATCH_RETRY_CAP,
    DISPATCH_STUCK_TIMEOUT_MINUTES,
  );

  let sent = 0;
  let failed = 0;

  for (const attempt of dispatchable) {
    // 'approved', 'dispatch_failed', or stuck 'dispatching' (T105)
    const fromState = attempt.workflowState;
    await AttemptRepo.markDispatching(db, attempt.id);
    logger.info("workflow_state_transition", {
      attemptId: attempt.id,
      from: fromState,
      to: "dispatching",
    });

    const script = await ScriptRepo.getCurrentByAttemptId(db, attempt.id);
    const prospect = await ProspectRepo.getById(db, attempt.prospectId);

    let result;
    try {
      result = await dispatchClient.send(
        {
          outreachAttemptId: attempt.id,
          recipientContact: prospect?.sourceUrl ?? "unknown",
          bodyText: script?.bodyText ?? "",
        },
        attempt.id,
      );
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      await AttemptRepo.recordDispatchFailure(db, attempt.id, reason);
      logger.warn("dispatch_failed", {
        attemptId: attempt.id,
        reason,
        thrown: true,
      });
      failed += 1;
      continue;
    }

    if (result.status === "sent") {
      await AttemptRepo.recordDispatchSuccess(db, attempt.id, result.providerThreadId);
      const sendDate = new Date().toISOString().slice(0, 10);
      await CadenceRepo.createOnSend(db, attempt.id, sendDate);
      if (prospect) {
        await ProspectRepo.setOutcomeStatus(db, prospect.id, "sent");
      }
      logger.info("workflow_state_transition", {
        attemptId: attempt.id,
        from: "dispatching",
        to: "sent",
        providerThreadId: result.providerThreadId,
      });
      sent += 1;
    } else {
      await AttemptRepo.recordDispatchFailure(db, attempt.id, result.reason);
      logger.warn("dispatch_failed", {
        attemptId: attempt.id,
        reason: result.reason,
      });
      failed += 1;
    }
  }

  return { processed: dispatchable.length, sent, failed };
}

export function createDispatchProcessHandler(db: Db, dispatchClient: DispatchClient) {
  return async function POST(): Promise<Response> {
    const result = await processDispatchable(db, dispatchClient);
    return jsonResponse(result);
  };
}
