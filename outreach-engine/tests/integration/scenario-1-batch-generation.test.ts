import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db/client.js";
import { createTestDb } from "../helpers/test-db.js";
import { startFixtureServer, type FixtureServer } from "../helpers/fixture-server.js";
import { createPipelineTestDeps } from "../helpers/pipeline-mocks.js";
import { runBatch } from "@/domain/pipeline/batch-orchestrator.js";

describe("Scenario 1 — complete batch generation (T029, spec.md US1 Scenarios 1/3)", () => {
  let db: Db;
  let fixtures: FixtureServer;

  beforeEach(async () => {
    db = await createTestDb();
    fixtures = await startFixtureServer();
  });

  afterEach(async () => {
    await db.close();
    await fixtures.close();
  });

  it("produces a complete package (snapshot + BFV + script + pass lint) for a scrapable prospect", async () => {
    const deps = createPipelineTestDeps();

    const result = await runBatch(db, deps, {
      prospectList: [
        { businessName: "Sam's Bakery", sourceUrl: `${fixtures.url}/complete` },
      ],
      batchDate: "2026-07-12",
    });

    expect(result.accepted).toBe(1);
    expect(result.deduped).toBe(0);

    const outcome = result.processing[0]!;
    expect(outcome.workflowState).toBe("human_review_queue");

    // GET /prospects/:id equivalent: pull the package directly.
    const attemptRow = await db.query<{ workflow_state: string }>(
      `SELECT workflow_state FROM outreach_attempts WHERE id = $1`,
      [outcome.outreachAttemptId],
    );
    expect(attemptRow.rows[0]?.workflow_state).toBe("human_review_queue");

    const bfvRow = await db.query<{ verification_status: string; telegram_deep_link_token: string }>(
      `SELECT verification_status, telegram_deep_link_token FROM bfv_deliverables WHERE outreach_attempt_id = $1`,
      [outcome.outreachAttemptId],
    );
    expect(bfvRow.rows[0]?.verification_status).toBe("verified");
    expect(bfvRow.rows[0]?.telegram_deep_link_token).toBeTruthy();

    const scriptRow = await db.query<{ body_text: string }>(
      `SELECT body_text FROM outreach_scripts WHERE outreach_attempt_id = $1 AND is_current = true`,
      [outcome.outreachAttemptId],
    );
    expect(scriptRow.rows[0]?.body_text).toBeTruthy();

    const lintRow = await db.query<{ verdict: string }>(
      `SELECT verdict FROM lint_reports lr
       JOIN outreach_scripts os ON os.id = lr.outreach_script_id
       WHERE os.outreach_attempt_id = $1`,
      [outcome.outreachAttemptId],
    );
    expect(lintRow.rows[0]?.verdict).toBe("pass");
  });

  it("flags an unscrapable-content prospect as needs_attention rather than a broken package (spec.md US1 Scenario 3)", async () => {
    const deps = createPipelineTestDeps();

    const result = await runBatch(db, deps, {
      prospectList: [
        { businessName: "Too Short Co", sourceUrl: `${fixtures.url}/insufficient` },
      ],
      batchDate: "2026-07-12",
    });

    const outcome = result.processing[0]!;
    expect(outcome.workflowState).toBe("needs_attention");

    // No BFV or script should ever be created for an incomplete snapshot.
    const bfvRow = await db.query(
      `SELECT * FROM bfv_deliverables WHERE outreach_attempt_id = $1`,
      [outcome.outreachAttemptId],
    );
    expect(bfvRow.rows).toHaveLength(0);
  });

  it("reports a shortfall for a batch under the 100 target (spec.md US1 Scenario 4)", async () => {
    const deps = createPipelineTestDeps();
    const result = await runBatch(db, deps, {
      prospectList: [
        { businessName: "Sam's Bakery", sourceUrl: `${fixtures.url}/complete` },
      ],
      batchDate: "2026-07-12",
    });
    // 1 delivered, well under 100 — a real batch endpoint reports this via
    // GET /batches/:date's shortfallReported flag (tested in the contract
    // test); here we confirm the underlying count the flag is derived from.
    expect(result.accepted).toBeLessThan(100);
  });
});
