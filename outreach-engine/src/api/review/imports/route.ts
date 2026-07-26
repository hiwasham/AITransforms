/**
 * POST /review/imports (M008, specs/002-operator-review-dashboard MVP-0).
 * Body: { sourceName: string, csv: string }. Imports first-100 CSV rows
 * as review packages; idempotent per prospect (FR-002); malformed rows
 * reported, never aborting (spec Edge Cases). Summary returned, not
 * persisted (import history deferred).
 */

import type { Db } from "@/db/client.js";
import { importCsv } from "@/domain/review/importer.js";
import { jsonResponse, errorResponse } from "@/api/lib/errors.js";
import { logger } from "@/lib/logger.js";

export function createReviewImportHandler(db: Db) {
  return async function POST(req: Request): Promise<Response> {
    let body: { sourceName?: unknown; csv?: unknown };
    try {
      body = (await req.json()) as typeof body;
    } catch {
      return errorResponse("invalid_json", "Body must be JSON", 400);
    }
    if (typeof body.csv !== "string" || body.csv.length === 0) {
      return errorResponse("invalid_request", "csv (string) is required", 400);
    }
    const sourceName =
      typeof body.sourceName === "string" && body.sourceName.trim()
        ? body.sourceName.trim()
        : "unnamed-import";

    const summary = await importCsv(db, body.csv, sourceName);

    logger.info("review_import_completed", {
      sourceName,
      rowsRead: summary.rowsRead,
      added: summary.added,
      duplicates: summary.duplicates,
      malformedCount: summary.malformed.length,
    });
    for (const m of summary.malformed) {
      logger.warn("review_import_malformed_row", { sourceName, ...m });
    }

    return jsonResponse({ sourceName, ...summary }, 201);
  };
}
