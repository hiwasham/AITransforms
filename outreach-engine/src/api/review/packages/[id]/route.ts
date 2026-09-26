/**
 * GET /review/packages/:id (M008, specs/002-operator-review-dashboard
 * MVP-0). One package by id — back-navigation / re-decide support
 * (FR-010).
 */

import type { Db } from "@/db/client.js";
import * as Repo from "@/domain/review/review-package.js";
import { jsonResponse, errorResponse } from "@/api/lib/errors.js";
import { packagePayload } from "@/api/review/packages/next/route.js";

export function createGetReviewPackageHandler(db: Db) {
  return async function GET(
    _req: Request,
    ctx: { params: { id: string } },
  ): Promise<Response> {
    const pkg = await Repo.getById(db, ctx.params.id);
    if (!pkg) return errorResponse("not_found", "Review package not found", 404);
    const counts = await Repo.getCounts(db);
    return jsonResponse({ package: packagePayload(pkg), counts });
  };
}
