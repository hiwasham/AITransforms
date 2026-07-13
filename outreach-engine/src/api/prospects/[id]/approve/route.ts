/**
 * POST /prospects/:id/approve (T046, CHK003 fix).
 *
 * This is the ENTIRE Tier-3 gate. It performs only the
 * human_review_queue -> approved transition. It never calls
 * DispatchClient, never touches provider_thread_id. Dispatch is a fully
 * separate step (T047, POST /internal/dispatch/process).
 */

import type { Db } from "@/db/client.js";
import * as AttemptRepo from "@/domain/prospects/outreach-attempt.js";
import { jsonResponse, errorResponse, CONFLICT_ILLEGAL_TRANSITION } from "@/api/lib/errors.js";
import { logger } from "@/lib/logger.js";

export function createApproveHandler(db: Db) {
  return async function POST(
    _req: Request,
    ctx: { params: { id: string } },
  ): Promise<Response> {
    const attemptId = ctx.params.id;
    const attempt = await AttemptRepo.getById(db, attemptId);
    if (!attempt) {
      return errorResponse("not_found", "OutreachAttempt not found", 404);
    }

    const succeeded = await AttemptRepo.transition(
      db,
      attemptId,
      "human_review_queue",
      "approved",
    );

    if (!succeeded) {
      return errorResponse(
        CONFLICT_ILLEGAL_TRANSITION,
        `Attempt is at '${attempt.workflowState}', not 'human_review_queue' — cannot approve`,
        409,
      );
    }

    logger.info("workflow_state_transition", {
      attemptId,
      from: "human_review_queue",
      to: "approved",
      actor: "operator",
    });

    return jsonResponse({
      workflowState: "approved",
      approvedAt: new Date().toISOString(),
    });
  };
}
