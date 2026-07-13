/**
 * Bounded revision-retry loop (T093). Invoked synchronously by the Batch
 * Orchestrator on `LintReport.verdict = fail` — never a scheduled job or
 * separate process (plan.md Background Jobs). Without this, "Quality
 * validation" has no remediation path — a failed script would be a dead
 * end, not a stage with a fix loop.
 */

export const MAX_REVISION_ATTEMPTS = 3;

/** True while more automatic regeneration attempts remain within the bound. */
export function canRetry(attemptsSoFar: number): boolean {
  return attemptsSoFar < MAX_REVISION_ATTEMPTS;
}
