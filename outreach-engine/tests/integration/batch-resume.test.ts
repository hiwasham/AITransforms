import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db/client.js";
import { createTestDb } from "../helpers/test-db.js";
import { createPipelineTestDeps } from "../helpers/pipeline-mocks.js";
import { runBatch } from "@/domain/pipeline/batch-orchestrator.js";
import { MockBFVBotClient } from "@/services/telegram/bfv-bot-client.js";
import type { ScrapeResult } from "@/services/scraper/scraper-client.js";
import { normalizeUrl } from "@/domain/prospects/dedup.js";
import * as ProspectRepo from "@/domain/prospects/prospect.js";
import * as AttemptRepo from "@/domain/prospects/outreach-attempt.js";
import * as SnapshotRepo from "@/domain/pipeline/scraped-site-snapshot.js";
import * as BFVRepo from "@/domain/pipeline/bfv-deliverable.js";
import * as ScriptRepo from "@/domain/pipeline/outreach-script.js";

const BATCH_DATE = "2026-07-13";
const FACTS = { excerpt: "Fresh sourdough daily" };

/** A lint-passing script body, matching the smart-mock LLM's output shape. */
const PASS_SCRIPT =
  "Hey there, I saw your site. Your team seems busy with orders. " +
  "I made a small bot from your site: https://t.me/AITransformsTestBot?start=tok123. Want to try it?";

function stubScraper(result?: Partial<ScrapeResult>) {
  const calls: string[] = [];
  const scrapeUrl = async (url: string): Promise<ScrapeResult> => {
    calls.push(url);
    return {
      status: "complete",
      rawContent: "Fresh sourdough daily.",
      extractedFacts: FACTS,
      ...result,
    };
  };
  return { scrapeUrl, calls };
}

async function seedAttempt(db: Db, businessName: string, sourceUrl: string) {
  const prospect = await ProspectRepo.create(db, {
    businessName,
    sourceUrl,
    normalizedDomain: normalizeUrl(sourceUrl),
  });
  const attempt = await AttemptRepo.create(db, {
    prospectId: prospect.id,
    attemptNumber: 1,
    batchDate: BATCH_DATE,
  });
  return { prospect, attempt };
}

async function countByAttempt(db: Db, table: string, attemptId: string): Promise<number> {
  const r = await db.query<{ count: string }>(
    `SELECT count(*)::text AS count FROM ${table} WHERE outreach_attempt_id = $1`,
    [attemptId],
  );
  return Number(r.rows[0]!.count);
}

async function workflowState(db: Db, attemptId: string): Promise<string> {
  const r = await db.query<{ workflow_state: string }>(
    `SELECT workflow_state FROM outreach_attempts WHERE id = $1`,
    [attemptId],
  );
  return r.rows[0]!.workflow_state;
}

describe("Batch Resume Rule (T104, data-model.md / contracts/outreach-api.md resume semantics)", () => {
  let db: Db;

  beforeEach(async () => {
    db = await createTestDb();
  });

  afterEach(async () => {
    await db.close();
  });

  it("recovers a crash after partial generation: completed items dedup, the stranded one resumes, unprocessed ones run fresh", async () => {
    const scraped: string[] = [];
    let crashOnB = true;
    const deps = createPipelineTestDeps({
      scrapeUrl: async (url: string): Promise<ScrapeResult> => {
        scraped.push(url);
        if (crashOnB && url.includes("b-site")) {
          throw new Error("simulated crash mid-batch");
        }
        return { status: "complete", rawContent: "Fresh sourdough daily.", extractedFacts: FACTS };
      },
    });
    const list = [
      { businessName: "A Co", sourceUrl: "https://a-site.example.com" },
      { businessName: "B Co", sourceUrl: "https://b-site.example.com" },
      { businessName: "C Co", sourceUrl: "https://c-site.example.com" },
    ];

    // First invocation dies mid-batch on B's scrape.
    await expect(
      runBatch(db, deps, { prospectList: list, batchDate: BATCH_DATE }),
    ).rejects.toThrow("simulated crash");

    // A completed, B is stranded at generated with no snapshot, C never ran.
    const attempts = await db.query<{ id: string; workflow_state: string }>(
      `SELECT oa.id, oa.workflow_state FROM outreach_attempts oa
       JOIN prospects p ON p.id = oa.prospect_id
       WHERE p.business_name = $1`,
      ["B Co"],
    );
    expect(attempts.rows[0]!.workflow_state).toBe("generated");
    const strandedId = attempts.rows[0]!.id;
    expect(await countByAttempt(db, "scraped_site_snapshots", strandedId)).toBe(0);

    // Retry with the same list.
    crashOnB = false;
    const retry = await runBatch(db, deps, { prospectList: list, batchDate: BATCH_DATE });

    expect(retry.resumed).toBe(1);
    expect(retry.deduped).toBe(2); // A and B both dedup in the list pass
    expect(retry.accepted).toBe(2); // B (resumed) + C (fresh)

    // All three end in human_review_queue, exactly one attempt each.
    for (const name of ["A Co", "B Co", "C Co"]) {
      const rows = await db.query<{ workflow_state: string }>(
        `SELECT oa.workflow_state FROM outreach_attempts oa
         JOIN prospects p ON p.id = oa.prospect_id
         WHERE p.business_name = $1`,
        [name],
      );
      expect(rows.rows).toHaveLength(1);
      expect(rows.rows[0]!.workflow_state).toBe("human_review_queue");
    }
    // The resumed attempt has exactly one of each artifact — no duplicates.
    expect(await countByAttempt(db, "scraped_site_snapshots", strandedId)).toBe(1);
    expect(await countByAttempt(db, "bfv_deliverables", strandedId)).toBe(1);
    expect(await countByAttempt(db, "outreach_scripts", strandedId)).toBe(1);
  });

  it("resumes from scrape when the attempt has no snapshot, even without the prospect re-supplied", async () => {
    const { attempt } = await seedAttempt(db, "Sam's Bakery", "https://sams.example.com");
    const scraper = stubScraper();
    const deps = createPipelineTestDeps({ scrapeUrl: scraper.scrapeUrl });

    const result = await runBatch(db, deps, { prospectList: [], batchDate: BATCH_DATE });

    expect(result.resumed).toBe(1);
    expect(result.processing[0]!.resumed).toBe(true);
    expect(result.processing[0]!.outreachAttemptId).toBe(attempt.id);
    expect(scraper.calls).toEqual(["https://sams.example.com"]);
    expect(await workflowState(db, attempt.id)).toBe("human_review_queue");
    expect(await countByAttempt(db, "scraped_site_snapshots", attempt.id)).toBe(1);
    expect(await countByAttempt(db, "bfv_deliverables", attempt.id)).toBe(1);
    expect(await countByAttempt(db, "outreach_scripts", attempt.id)).toBe(1);
  });

  it("resumes from BFV when a complete snapshot exists — never re-scrapes", async () => {
    const { attempt } = await seedAttempt(db, "Sam's Bakery", "https://sams.example.com");
    await SnapshotRepo.create(db, {
      outreachAttemptId: attempt.id,
      status: "complete",
      rawContent: "Fresh sourdough daily.",
      extractedFacts: FACTS,
    });
    const scraper = stubScraper();
    const deps = createPipelineTestDeps({ scrapeUrl: scraper.scrapeUrl });

    const result = await runBatch(db, deps, { prospectList: [], batchDate: BATCH_DATE });

    expect(result.resumed).toBe(1);
    expect(scraper.calls).toEqual([]); // snapshot output already exists — step never redone
    expect(await workflowState(db, attempt.id)).toBe("human_review_queue");
    expect(await countByAttempt(db, "scraped_site_snapshots", attempt.id)).toBe(1);
    expect(await countByAttempt(db, "bfv_deliverables", attempt.id)).toBe(1);
  });

  it("resumes from script when a verified BFV exists — never re-provisions", async () => {
    const { attempt } = await seedAttempt(db, "Sam's Bakery", "https://sams.example.com");
    await SnapshotRepo.create(db, {
      outreachAttemptId: attempt.id,
      status: "complete",
      rawContent: "Fresh sourdough daily.",
      extractedFacts: FACTS,
    });
    const bfv = await BFVRepo.create(db, {
      outreachAttemptId: attempt.id,
      telegramDeepLinkToken: "seededtoken123",
      contextRef: `ctx-${attempt.id}`,
    });
    await BFVRepo.markVerified(db, bfv.id);

    const bot = new MockBFVBotClient();
    bot.provisionContext = async () => {
      throw new Error("must not re-provision an existing BFV");
    };
    const deps = createPipelineTestDeps({
      scrapeUrl: stubScraper().scrapeUrl,
      botClient: bot,
    });

    const result = await runBatch(db, deps, { prospectList: [], batchDate: BATCH_DATE });

    expect(result.resumed).toBe(1);
    expect(await workflowState(db, attempt.id)).toBe("human_review_queue");
    expect(await countByAttempt(db, "bfv_deliverables", attempt.id)).toBe(1);
    // The stored token survived — the script's deep link uses it.
    const script = await ScriptRepo.getCurrentByAttemptId(db, attempt.id);
    expect(script!.bodyText).toContain("start=seededtoken123");
  });

  it("resumes at lint when a current script already exists — no new script revision generated", async () => {
    const { attempt } = await seedAttempt(db, "Sam's Bakery", "https://sams.example.com");
    await SnapshotRepo.create(db, {
      outreachAttemptId: attempt.id,
      status: "complete",
      rawContent: "Fresh sourdough daily.",
      extractedFacts: FACTS,
    });
    const bfv = await BFVRepo.create(db, {
      outreachAttemptId: attempt.id,
      telegramDeepLinkToken: "tok123",
      contextRef: `ctx-${attempt.id}`,
    });
    await BFVRepo.markVerified(db, bfv.id);
    const seededScript = await ScriptRepo.createRevision(db, {
      outreachAttemptId: attempt.id,
      bodyText: PASS_SCRIPT,
    });
    const deps = createPipelineTestDeps({ scrapeUrl: stubScraper().scrapeUrl });

    const result = await runBatch(db, deps, { prospectList: [], batchDate: BATCH_DATE });

    expect(result.resumed).toBe(1);
    expect(await workflowState(db, attempt.id)).toBe("human_review_queue");
    expect(await countByAttempt(db, "outreach_scripts", attempt.id)).toBe(1);
    const current = await ScriptRepo.getCurrentByAttemptId(db, attempt.id);
    expect(current!.id).toBe(seededScript.id); // the crash-survivor revision is the one linted
    const lint = await db.query<{ verdict: string }>(
      `SELECT verdict FROM lint_reports WHERE outreach_script_id = $1`,
      [seededScript.id],
    );
    expect(lint.rows).toHaveLength(1);
    expect(lint.rows[0]!.verdict).toBe("pass");
  });

  it("never touches attempts past generated: no duplicate outreach for completed/approved/sent items", async () => {
    const done = await seedAttempt(db, "Done Co", "https://done.example.com");
    await AttemptRepo.setWorkflowState(db, done.attempt.id, "human_review_queue");
    const approved = await seedAttempt(db, "Approved Co", "https://approved.example.com");
    await AttemptRepo.setWorkflowState(db, approved.attempt.id, "approved");
    const sent = await seedAttempt(db, "Sent Co", "https://sent.example.com");
    await AttemptRepo.setWorkflowState(db, sent.attempt.id, "sent");

    const scraper = stubScraper();
    const deps = createPipelineTestDeps({ scrapeUrl: scraper.scrapeUrl });

    // Re-supply all three in the retry list — the worst case for double-production.
    const retry = await runBatch(db, deps, {
      prospectList: [
        { businessName: "Done Co", sourceUrl: "https://done.example.com" },
        { businessName: "Approved Co", sourceUrl: "https://approved.example.com" },
        { businessName: "Sent Co", sourceUrl: "https://sent.example.com" },
      ],
      batchDate: BATCH_DATE,
    });

    expect(retry.resumed).toBe(0);
    expect(retry.deduped).toBe(3);
    expect(retry.accepted).toBe(0);
    expect(scraper.calls).toEqual([]);
    expect(await workflowState(db, done.attempt.id)).toBe("human_review_queue");
    expect(await workflowState(db, approved.attempt.id)).toBe("approved");
    expect(await workflowState(db, sent.attempt.id)).toBe("sent");
    for (const { attempt } of [done, approved, sent]) {
      expect(await countByAttempt(db, "scraped_site_snapshots", attempt.id)).toBe(0);
      expect(await countByAttempt(db, "outreach_scripts", attempt.id)).toBe(0);
    }
  });

  it("is idempotent: a second retry after a successful resume finds nothing to resume", async () => {
    const { attempt } = await seedAttempt(db, "Sam's Bakery", "https://sams.example.com");
    const deps = createPipelineTestDeps({ scrapeUrl: stubScraper().scrapeUrl });

    const first = await runBatch(db, deps, { prospectList: [], batchDate: BATCH_DATE });
    expect(first.resumed).toBe(1);

    const second = await runBatch(db, deps, { prospectList: [], batchDate: BATCH_DATE });
    expect(second.resumed).toBe(0);
    expect(second.processing).toHaveLength(0);
    expect(await workflowState(db, attempt.id)).toBe("human_review_queue");
    expect(await countByAttempt(db, "scraped_site_snapshots", attempt.id)).toBe(1);
    expect(await countByAttempt(db, "bfv_deliverables", attempt.id)).toBe(1);
    expect(await countByAttempt(db, "outreach_scripts", attempt.id)).toBe(1);
  });

  it("re-verifies a pending BFV instead of re-provisioning; a lost context lands in needs_attention", async () => {
    const { attempt } = await seedAttempt(db, "Sam's Bakery", "https://sams.example.com");
    await SnapshotRepo.create(db, {
      outreachAttemptId: attempt.id,
      status: "complete",
      rawContent: "Fresh sourdough daily.",
      extractedFacts: FACTS,
    });
    // Provisioned pre-crash; the fresh bot process no longer holds this context.
    const bfv = await BFVRepo.create(db, {
      outreachAttemptId: attempt.id,
      telegramDeepLinkToken: "orphantoken",
      contextRef: "ctx-lost-after-restart",
    });
    const deps = createPipelineTestDeps({ scrapeUrl: stubScraper().scrapeUrl });

    const result = await runBatch(db, deps, { prospectList: [], batchDate: BATCH_DATE });

    expect(result.resumed).toBe(1);
    expect(result.processing[0]!.workflowState).toBe("needs_attention");
    expect(await workflowState(db, attempt.id)).toBe("needs_attention");
    expect(await countByAttempt(db, "bfv_deliverables", attempt.id)).toBe(1); // never re-provisioned
    const row = await db.query<{ verification_status: string }>(
      `SELECT verification_status FROM bfv_deliverables WHERE id = $1`,
      [bfv.id],
    );
    expect(row.rows[0]!.verification_status).toBe("verification_failed");
  });
});
