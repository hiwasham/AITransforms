/**
 * GET /batches/:date (T044).
 */

import type { Db } from "@/db/client.js";
import { jsonResponse } from "@/api/lib/errors.js";

interface AttemptSummaryRow {
  id: string;
  prospect_id: string;
  workflow_state: string;
}

export function createGetBatchHandler(db: Db) {
  return async function GET(
    _req: Request,
    ctx: { params: { date: string } },
  ): Promise<Response> {
    const { date } = ctx.params;
    const result = await db.query<AttemptSummaryRow>(
      `SELECT id, prospect_id, workflow_state FROM outreach_attempts WHERE batch_date = $1`,
      [date],
    );
    const attempts = result.rows;
    const deliveredCount = attempts.filter(
      (a) => a.workflow_state !== "needs_attention",
    ).length;

    return jsonResponse({
      batchDate: date,
      targetCount: 100,
      deliveredCount,
      shortfallReported: deliveredCount < 100,
      attempts: attempts.map((a) => ({
        id: a.id,
        prospectId: a.prospect_id,
        workflowState: a.workflow_state,
      })),
    });
  };
}
