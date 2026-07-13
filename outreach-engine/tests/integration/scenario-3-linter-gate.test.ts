import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db/client.js";
import { createTestDb } from "../helpers/test-db.js";
import { startFixtureServer, type FixtureServer } from "../helpers/fixture-server.js";
import { MockLLMClient } from "@/services/llm/llm-client.js";
import { MockBFVBotClient } from "@/services/telegram/bfv-bot-client.js";
import { scrapeUrl } from "@/services/scraper/scraper-client.js";
import { runBatch, type BatchOrchestratorDeps } from "@/domain/pipeline/batch-orchestrator.js";

describe("Scenario 3 — Anti-Values Linter blocks and routes for revision (T031, contract: anti-values-linter.md)", () => {
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

  it("a script with jargon is rejected with non-empty revisionFeedback and never reaches human_review_queue directly", async () => {
    const llm = new MockLLMClient();
    let generationCalls = 0;
    llm.setResponder((prompt) => {
      if (prompt.includes("You are judging")) return "PASS";
      generationCalls += 1;
      // Every generation call fails mechanically (jargon) so the attempt
      // is forced through the full bounded retry loop to needs_manual_draft.
      return "Let's leverage synergy to unlock value and circle back. https://t.me/bot?start=x Want to try it?";
    });

    const deps: BatchOrchestratorDeps = {
      scrapeUrl,
      botClient: new MockBFVBotClient(),
      llmClient: llm,
    };

    const result = await runBatch(db, deps, {
      prospectList: [{ businessName: "Jargon Co", sourceUrl: `${fixtures.url}/complete` }],
      batchDate: "2026-07-12",
    });

    const outcome = result.processing[0]!;
    // Never reaches human_review_queue while every revision keeps failing.
    expect(outcome.workflowState).not.toBe("human_review_queue");
    expect(outcome.workflowState).toBe("needs_manual_draft");
    expect(generationCalls).toBeGreaterThan(1); // proves the revision loop actually ran

    const lintRows = await db.query<{ verdict: string; revision_feedback: string | null }>(
      `SELECT verdict, revision_feedback FROM lint_reports lr
       JOIN outreach_scripts os ON os.id = lr.outreach_script_id
       WHERE os.outreach_attempt_id = $1
       ORDER BY checked_at ASC`,
      [outcome.outreachAttemptId],
    );
    expect(lintRows.rows.length).toBeGreaterThan(1);
    for (const row of lintRows.rows) {
      expect(row.verdict).toBe("fail");
      expect(row.revision_feedback).toBeTruthy(); // "failed messages must return for revision" — never empty
    }
  });

  it("a script that fails once then passes on regeneration reaches human_review_queue", async () => {
    const llm = new MockLLMClient();
    let generationCalls = 0;
    llm.setResponder((prompt) => {
      if (prompt.includes("You are judging")) return "PASS";
      generationCalls += 1;
      if (generationCalls === 1) {
        return "Let's leverage synergy. https://t.me/bot?start=x Want to try it?";
      }
      return "Hey, I saw your bakery site. Your team looks busy with orders. I made a bot from your site: https://t.me/bot?start=x. Want to try it?";
    });

    const deps: BatchOrchestratorDeps = {
      scrapeUrl,
      botClient: new MockBFVBotClient(),
      llmClient: llm,
    };

    const result = await runBatch(db, deps, {
      prospectList: [{ businessName: "Fixable Co", sourceUrl: `${fixtures.url}/complete` }],
      batchDate: "2026-07-12",
    });

    expect(result.processing[0]!.workflowState).toBe("human_review_queue");
    expect(generationCalls).toBe(2);
  });
});
