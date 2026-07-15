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
import { jsonResponse, errorResponse } from "@/api/lib/errors.js";
import { packagePayload } from "@/api/review/packages/next/route.js";
import { logger } from "@/lib/logger.js";

const ACTIONS = ["approve", "reject", "next"] as const;
type Action = (typeof ACTIONS)[number];

export function createDecisionHandler(db: Db) {
  return async function POST(
    req: Request,
    ctx: { params: { id: string } },
  ): Promise<Response> {
    let body: { action?: unknown };
    try {
      body = (await req.json()) as typeof body;
    } catch {
      return errorResponse("invalid_json", "Body must be JSON", 400);
    }
    const action = body.action as Action;
    if (!ACTIONS.includes(action)) {
      return errorResponse(
        "invalid_action",
        `action must be one of: ${ACTIONS.join(", ")}`,
        400,
      );
    }

    const before = await Repo.getById(db, ctx.params.id);
    if (!before) {
      return errorResponse("not_found", "Review package not found", 404);
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
