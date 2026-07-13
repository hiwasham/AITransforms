/**
 * GET /prospects (T045). MVP-1: no `dueToday` filter (that's US3/cadence,
 * Future) — `status` and `workflowState` filters are supported since
 * they're simple, direct queries needed to exercise the review queue.
 */

import type { Db } from "@/db/client.js";
import { jsonResponse } from "@/api/lib/errors.js";

interface ProspectSummaryRow {
  id: string;
  business_name: string;
  current_outcome_status: string;
}

export function createListProspectsHandler(db: Db) {
  return async function GET(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const workflowState = url.searchParams.get("workflowState");

    // `status` filters on the prospect's own outcome column; `workflowState`
    // lives on outreach_attempts, so it's matched via EXISTS against the
    // prospect's attempt(s) (one active per prospect — no row duplication).
    // Both filters compose; either, both, or neither may be present.
    const conditions: string[] = [];
    const params: string[] = [];
    if (status) {
      params.push(status);
      conditions.push(`current_outcome_status = $${params.length}`);
    }
    if (workflowState) {
      params.push(workflowState);
      conditions.push(
        `EXISTS (SELECT 1 FROM outreach_attempts oa
                 WHERE oa.prospect_id = prospects.id
                   AND oa.workflow_state = $${params.length})`,
      );
    }

    const where = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";
    const result = await db.query<ProspectSummaryRow>(
      `SELECT id, business_name, current_outcome_status FROM prospects${where}`,
      params,
    );

    return jsonResponse({
      prospects: result.rows.map((r) => ({
        id: r.id,
        businessName: r.business_name,
        currentOutcomeStatus: r.current_outcome_status,
      })),
    });
  };
}
