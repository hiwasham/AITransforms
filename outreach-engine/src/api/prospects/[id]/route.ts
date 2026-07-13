/**
 * GET /prospects/:id (T045) — full package for one prospect's current attempt.
 */

import type { Db } from "@/db/client.js";
import * as ProspectRepo from "@/domain/prospects/prospect.js";
import * as SnapshotRepo from "@/domain/pipeline/scraped-site-snapshot.js";
import * as BFVRepo from "@/domain/pipeline/bfv-deliverable.js";
import * as ScriptRepo from "@/domain/pipeline/outreach-script.js";
import { jsonResponse, errorResponse } from "@/api/lib/errors.js";

interface AttemptRow {
  id: string;
  attempt_number: number;
  workflow_state: string;
  provider_thread_id: string | null;
  dispatch_attempts: number;
  last_dispatch_error: string | null;
}

interface LintReportRow {
  id: string;
  verdict: string;
  revision_feedback: string | null;
}

interface CadenceRow {
  id: string;
  send_date: string;
  exhausted_at: string | null;
}

export function createGetProspectHandler(db: Db) {
  return async function GET(
    _req: Request,
    ctx: { params: { id: string } },
  ): Promise<Response> {
    const prospect = await ProspectRepo.getById(db, ctx.params.id);
    if (!prospect) {
      return errorResponse("not_found", "Prospect not found", 404);
    }

    const attemptResult = await db.query<AttemptRow>(
      `SELECT id, attempt_number, workflow_state, provider_thread_id,
              dispatch_attempts, last_dispatch_error
       FROM outreach_attempts WHERE prospect_id = $1
       ORDER BY attempt_number DESC LIMIT 1`,
      [prospect.id],
    );
    const currentAttempt = attemptResult.rows[0] ?? null;

    const snapshot = currentAttempt
      ? await SnapshotRepo.getByAttemptId(db, currentAttempt.id)
      : null;
    const bfv = currentAttempt
      ? await BFVRepo.getByAttemptId(db, currentAttempt.id)
      : null;
    const script = currentAttempt
      ? await ScriptRepo.getCurrentByAttemptId(db, currentAttempt.id)
      : null;

    const lintReports = script
      ? (
          await db.query<LintReportRow>(
            `SELECT id, verdict, revision_feedback FROM lint_reports
             WHERE outreach_script_id = $1 ORDER BY checked_at ASC`,
            [script.id],
          )
        ).rows
      : [];

    const cadence = currentAttempt
      ? (
          await db.query<CadenceRow>(
            `SELECT id, send_date, exhausted_at FROM follow_up_cadence_states
             WHERE outreach_attempt_id = $1`,
            [currentAttempt.id],
          )
        ).rows[0] ?? null
      : null;

    return jsonResponse({
      prospect: {
        id: prospect.id,
        businessName: prospect.businessName,
        currentOutcomeStatus: prospect.currentOutcomeStatus,
      },
      currentAttempt: currentAttempt && {
        id: currentAttempt.id,
        workflowState: currentAttempt.workflow_state,
        providerThreadId: currentAttempt.provider_thread_id,
        dispatchAttempts: currentAttempt.dispatch_attempts,
        lastDispatchError: currentAttempt.last_dispatch_error,
      },
      snapshot: snapshot && { status: snapshot.status },
      bfv: bfv && {
        verificationStatus: bfv.verificationStatus,
        telegramDeepLinkToken: bfv.telegramDeepLinkToken,
      },
      script: script && { bodyText: script.bodyText, revisionNumber: script.revisionNumber },
      lintReports: lintReports.map((r) => ({
        id: r.id,
        verdict: r.verdict,
        revisionFeedback: r.revision_feedback,
      })),
      cadence: cadence && { sendDate: cadence.send_date, exhaustedAt: cadence.exhausted_at },
    });
  };
}
