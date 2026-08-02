/**
 * POST /review/packages/:id/decision (M008,
 * specs/002-operator-review-dashboard MVP-0).
 * Body: { action: "approve" | "reject" | "next" }.
 * approve/reject persist a decision (last-write-wins, FR-010); "next"
 * advances without deciding — the package is marked passed-over and
 * returns before the queue reports complete (spec §MVP-0 skip
 * semantics). Response carries the following package inline so the
 * review loop is one round-trip per action (SC-002).
 */

import type { Db } from "@/db/client.js";
import * as Repo from "@/domain/review/review-package.js";
import { checkDeliverableIntegrity } from "@/domain/linter/deliverable-integrity.js";
import { errorResponse, isJsonObject, jsonResponse } from "@/api/lib/errors.js";
import { packagePayload } from "@/api/review/packages/next/route.js";
import { logger } from "@/lib/logger.js";

export const REVIEW_ACTIONS = ["approve", "reject", "next"] as const;
type Action = (typeof REVIEW_ACTIONS)[number];

export function createDecisionHandler(db: Db) {
  return async function POST(
    req: Request,
    ctx: { params: { id: string } },
  ): Promise<Response> {
    let parsed: unknown;
    try {
      parsed = await req.json();
    } catch {
      return errorResponse("invalid_json", "Body must be JSON", 400);
    }
    if (!isJsonObject(parsed)) {
      return errorResponse("invalid_request", "Body must be a JSON object", 400);
    }
    const body = parsed;
    const action = body.action as Action;
    if (!REVIEW_ACTIONS.includes(action)) {
      return errorResponse(
        "invalid_action",
        `action must be one of: ${REVIEW_ACTIONS.join(", ")}`,
        400,
      );
    }

    const before = await Repo.getById(db, ctx.params.id);
    if (!before) {
      return errorResponse("not_found", "Review package not found", 404);
    }

    // Q006 (002 FR-022, gate G3 backstop): approval is refused when the
    // message fails the deterministic deliverable-integrity check — e.g.
    // it claims a video exists while the package has no real video URL
    // (defect D1, 5/5 of the first real batch). The generation pipeline
    // is the primary gate; this guarantees SC-010's "no bypass path"
    // from the review surface. The {{BFV_LINK}} marker itself is fine in
    // stored text (FR-029) — substitution happens at send prep.
    if (action === "approve") {
      const integrity = checkDeliverableIntegrity({
        messageText: before.messageBody,
        videoUrl: before.videoUrl,
      });
      if (!integrity.pass) {
        logger.warn("review_approve_refused_integrity", {
          packageId: before.id,
          failures: integrity.failures,
        });
        return errorResponse(
          "not_send_ready",
          `Cannot approve: ${integrity.failures.join(" ")}`,
          409,
        );
      }
    }

    const updated =
      action === "next"
        ? await Repo.markPassedOver(db, before.id)
        : await Repo.recordDecision(
            db,
            before.id,
            action === "approve" ? "approved" : "rejected",
          );

    logger.info("review_decision_recorded", {
      packageId: before.id,
      action,
      previousDecision: before.decision,
      newDecision: updated!.decision,
    });

    const [next, counts] = await Promise.all([Repo.getNext(db), Repo.getCounts(db)]);
    return jsonResponse({
      package: packagePayload(updated!),
      // May be the same package again when it's the last pending one and
      // was passed over — correct: it is never lost (spec §MVP-0).
      next: next ? packagePayload(next) : null,
      counts,
    });
  };
}
