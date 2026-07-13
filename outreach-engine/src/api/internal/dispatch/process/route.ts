/**
 * POST /internal/dispatch/process (T047). Service-credential-only in
 * production (auth enforcement itself is T011/Phase 2 — this handler is
 * the business logic contracts/outreach-api.md describes).
 *
 * For every attempt at approved/dispatch_failed below the automatic-retry
 * cap: calls DispatchClient.send() with idempotencyKey = attempt.id.
 * On success: sets provider_thread_id, dispatching -> sent, creates
 * FollowUpCadenceState. On failure: increments dispatch_attempts, records
 * last_dispatch_error, -> dispatch_failed.
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

export async function processDispatchable(
  db: Db,
  dispatchClient: DispatchClient,
): Promise<{ processed: number; sent: number; failed: number }> {
  const dispatchable = await AttemptRepo.findDispatchable(
    db,
    AUTOMATIC_DISPATCH_RETRY_CAP,
  );

  let sent = 0;
  let failed = 0;

  for (const attempt of dispatchable) {
    const fromState = attempt.workflowState; // 'approved' or 'dispatch_failed'
    await AttemptRepo.setWorkflowState(db, attempt.id, "dispatching");
    logger.info("workflow_state_transition", {
      attemptId: attempt.id,
      from: fromState,
      to: "dispatching",
    });

    const script = await ScriptRepo.getCurrentByAttemptId(db, attempt.id);
    const prospect = await ProspectRepo.getById(db, attempt.prospectId);

    const result = await dispatchClient.send(
      {
        outreachAttemptId: attempt.id,
        recipientContact: prospect?.sourceUrl ?? "unknown",
        bodyText: script?.bodyText ?? "",
      },
      attempt.id,
    );

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
