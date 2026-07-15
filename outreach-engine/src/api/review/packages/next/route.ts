/**
 * GET /review/packages/next (M008, specs/002-operator-review-dashboard
 * MVP-0). The review loop's read: next package in review order plus the
 * N-of-M counts. Exhausted queue ⇒ 200 { package: null, counts } — the
 * "review complete" state, never a 404 (spec US1 Scenario 6).
 */

import type { Db } from "@/db/client.js";
import * as Repo from "@/domain/review/review-package.js";
import { jsonResponse } from "@/api/lib/errors.js";
import type { ReviewPackage } from "@/domain/review/review-package.js";

export function packagePayload(pkg: ReviewPackage) {
  return {
    id: pkg.id,
    company: pkg.company,
    contact: pkg.contact,
    researchSummary: pkg.researchSummary,
    painPoint: pkg.painPoint,
    messageBody: pkg.messageBody,
    bfvLinkTelegram: pkg.bfvLinkTelegram,
    videoUrl: pkg.videoUrl,
    generatorFlag: pkg.generatorFlag,
    decision: pkg.decision,
    decidedAt: pkg.decidedAt,
    sourceName: pkg.sourceName,
    position: pkg.position,
  };
}

export function createNextPackageHandler(db: Db) {
  return async function GET(): Promise<Response> {
    const [pkg, counts] = await Promise.all([Repo.getNext(db), Repo.getCounts(db)]);
    return jsonResponse({
      package: pkg ? packagePayload(pkg) : null,
      counts,
    });
  };
}
