/**
 * LintReport entity + combined Anti-Values Linter pass/fail contract
 * (T040, contracts/anti-values-linter.md).
 *
 * "No silent pass-through": a script failing any single check is an
 * overall fail; a fail MUST carry non-empty revisionFeedback.
 */

import { randomUUID } from "node:crypto";
import type { Db } from "@/db/client.js";
import type { LLMClient } from "@/services/llm/llm-client.js";
import { runMechanicalChecks } from "./mechanical-checks.js";
import { judge } from "./llm-judge.js";

export interface LintReport {
  id: string;
  outreachScriptId: string;
  verdict: "pass" | "fail";
  readingGradeScore: number;
  jargonTermsFound: string[];
  specificityVerdict: "pass" | "fail";
  structureVerdict: "pass" | "fail";
  revisionFeedback: string | null;
  checkedAt: string;
}

interface LintReportRow {
  id: string;
  outreach_script_id: string;
  verdict: "pass" | "fail";
  reading_grade_score: string;
  jargon_terms_found: string[];
  specificity_verdict: "pass" | "fail";
  structure_verdict: "pass" | "fail";
  revision_feedback: string | null;
  checked_at: string;
}

function fromRow(row: LintReportRow): LintReport {
  return {
    id: row.id,
    outreachScriptId: row.outreach_script_id,
    verdict: row.verdict,
    readingGradeScore: Number(row.reading_grade_score),
    jargonTermsFound: row.jargon_terms_found,
    specificityVerdict: row.specificity_verdict,
    structureVerdict: row.structure_verdict,
    revisionFeedback: row.revision_feedback,
    checkedAt: row.checked_at,
  };
}

export async function runLint(
  db: Db,
  llmClient: LLMClient,
  input: {
    outreachScriptId: string;
    bodyText: string;
    prospectFacts: Record<string, unknown>;
  },
): Promise<LintReport> {
  const mechanical = runMechanicalChecks(input.bodyText);
  const judgeResult = await judge(llmClient, input.bodyText, input.prospectFacts);

  const structureVerdict: "pass" | "fail" = mechanical.structurePass ? "pass" : "fail";
  const readingPass = mechanical.readingLevelPass;
  const jargonPass = mechanical.jargonPass;

  const overallPass =
    readingPass && jargonPass && mechanical.structurePass &&
    judgeResult.specificityVerdict === "pass";

  const feedbackParts: string[] = [];
  if (!readingPass) {
    feedbackParts.push(
      `Reading level too high (grade ${mechanical.readingGradeScore}) — simplify to ~3rd grade.`,
    );
  }
  if (!jargonPass) {
    feedbackParts.push(
      `Remove corporate jargon: ${mechanical.jargonTermsFound.join(", ")}.`,
    );
  }
  if (!mechanical.structurePass) {
    feedbackParts.push(
      "Missing clear Hook -> Pain -> BFV Link -> Ask structure.",
    );
  }
  if (judgeResult.specificityVerdict === "fail" && judgeResult.revisionFeedback) {
    feedbackParts.push(judgeResult.revisionFeedback);
  }

  const verdict: "pass" | "fail" = overallPass ? "pass" : "fail";
  const revisionFeedback = overallPass ? null : feedbackParts.join(" ");

  const id = randomUUID();
  const result = await db.query<LintReportRow>(
    `INSERT INTO lint_reports
       (id, outreach_script_id, verdict, reading_grade_score, jargon_terms_found,
        specificity_verdict, structure_verdict, revision_feedback)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      id,
      input.outreachScriptId,
      verdict,
      mechanical.readingGradeScore,
      JSON.stringify(mechanical.jargonTermsFound),
      judgeResult.specificityVerdict,
      structureVerdict,
      revisionFeedback,
    ],
  );
  return fromRow(result.rows[0]!);
}

export async function getLatestByScriptId(
  db: Db,
  outreachScriptId: string,
): Promise<LintReport | null> {
  const result = await db.query<LintReportRow>(
    `SELECT * FROM lint_reports WHERE outreach_script_id = $1
     ORDER BY checked_at DESC LIMIT 1`,
    [outreachScriptId],
  );
  return result.rows[0] ? fromRow(result.rows[0]) : null;
}

export async function countReportsForAttempt(
  db: Db,
  outreachAttemptId: string,
): Promise<number> {
  const result = await db.query<{ count: string }>(
    `SELECT count(*)::text AS count FROM lint_reports lr
     JOIN outreach_scripts os ON os.id = lr.outreach_script_id
     WHERE os.outreach_attempt_id = $1`,
    [outreachAttemptId],
  );
  return Number(result.rows[0]?.count ?? "0");
}
