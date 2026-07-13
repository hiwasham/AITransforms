/**
 * POST /batches/generate (T044). MVP-1 scope: processes exactly the
 * supplied prospectList — no Batch Candidate Pool union with
 * re-engagement-eligible prospects (FR-026, Phase 2/Future). A
 * re-invocation for an already-started date resumes attempts stranded at
 * `generated` per the Resume Rule (T104) — handled inside runBatch.
 */

import type { Db } from "@/db/client.js";
import type { BatchOrchestratorDeps } from "@/domain/pipeline/batch-orchestrator.js";
import { runBatch } from "@/domain/pipeline/batch-orchestrator.js";
import { jsonResponse, errorResponse } from "@/api/lib/errors.js";

interface GenerateBatchBody {
  prospectList: Array<{ businessName: string; sourceUrl: string }>;
}

export function createGenerateBatchHandler(db: Db, deps: BatchOrchestratorDeps) {
  return async function POST(req: Request): Promise<Response> {
    let body: GenerateBatchBody;
    try {
      body = (await req.json()) as GenerateBatchBody;
    } catch {
      return errorResponse("invalid_body", "Request body must be valid JSON", 400);
    }
    if (!Array.isArray(body.prospectList)) {
      return errorResponse(
        "invalid_body",
        "prospectList must be an array",
        400,
      );
    }

    const batchDate = new Date().toISOString().slice(0, 10);
    const result = await runBatch(db, deps, {
      prospectList: body.prospectList,
      batchDate,
    });

    return jsonResponse({
      batchDate: result.batchDate,
      accepted: result.accepted,
      deduped: result.deduped,
      reengaged: 0, // MVP-1: re-engagement union not implemented (Phase 2/Future)
      processing: result.processing.length,
    });
  };
}
