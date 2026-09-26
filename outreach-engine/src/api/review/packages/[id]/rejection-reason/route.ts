/**
 * POST /review/packages/:id/rejection-reason (Q011, G7/FR-021,
 * specs/002-operator-review-dashboard — CEO plan review 2026-07-18 D3).
 * Body: { reason: "generic" | "false_claim" | "bad_fit" | "creepy" | "other" }.
 *
 * Tags an already-rejected package with a structured reason so both PASS
 * and FAIL Q007 outcomes produce calibration data. Deliberately a
 * dedicated route, not a field on the decision write (D3): the decision
 * HTTP contract stays untouched, and the reason⟹rejected invariant is
 * enforced by an atomic conditional UPDATE in the repo (D12, Codex #1) —
 * no read-then-write race. A later decision write clears the tag (D11),
 * so re-rejecting starts untagged and in-window re-tagging is
 * last-write-wins by design (rejected Codex #4: enables typo correction).
 *
 * 400 unknown enum · 404 unknown id · 409 not currently rejected. Logs
 * only { id, reason } — never message content.
 */

import type { Db } from "@/db/client.js";
import * as Repo from "@/domain/review/review-package.js";
import { REJECTION_REASONS, type RejectionReason } from "@/domain/review/review-package.js";
import { errorResponse, isJsonObject, jsonResponse } from "@/api/lib/errors.js";
import { packagePayload } from "@/api/review/packages/next/route.js";
import { logger } from "@/lib/logger.js";

export function createRejectionReasonHandler(db: Db) {
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

    const reason = body.reason as RejectionReason;
    if (!REJECTION_REASONS.includes(reason)) {
      return errorResponse(
        "invalid_reason",
        `reason must be one of: ${REJECTION_REASONS.join(", ")}`,
        400,
      );
    }

    // Atomic conditional write (D12): tags only if currently rejected.
    // A null result is either an unknown id or a wrong-state package; a
    // single existence probe disambiguates 404 from 409 without widening
    // the race window (the invariant is still enforced by the UPDATE's
    // WHERE clause, not by this read).
    const updated = await Repo.setRejectionReason(db, ctx.params.id, reason);
    if (!updated) {
      const existing = await Repo.getById(db, ctx.params.id);
      if (!existing) {
        return errorResponse("not_found", "Review package not found", 404);
      }
      return errorResponse(
        "not_rejected",
        "Reason can only be set on a currently-rejected package",
        409,
      );
    }

    logger.info("review_rejection_reason_set", {
      packageId: updated.id,
      reason,
    });

    return jsonResponse({ package: packagePayload(updated) });
  };
}
