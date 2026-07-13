import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import type { Db } from "@/db/client.js";
import { createTestDb } from "../helpers/test-db.js";
import { DbBFVContextStore } from "@/services/telegram/db-context-store.js";
import { TelegramBFVBotClient } from "@/services/telegram/telegram-bfv-bot-client.js";
import { MockLLMClient } from "@/services/llm/llm-client.js";
import { normalizeUrl } from "@/domain/prospects/dedup.js";
import * as ProspectRepo from "@/domain/prospects/prospect.js";
import * as AttemptRepo from "@/domain/prospects/outreach-attempt.js";
import * as SnapshotRepo from "@/domain/pipeline/scraped-site-snapshot.js";
import * as BFVRepo from "@/domain/pipeline/bfv-deliverable.js";
import { logger } from "@/lib/logger.js";

/**
 * DbBFVContextStore (T112): already-dispatched deep links must survive a
 * bot-process restart. The pipeline persists token/context_ref in
 * bfv_deliverables and the facts in scraped_site_snapshots; this store
 * reads them back, so a fresh store instance (= restarted process)
 * resolves contexts the old process provisioned.
 */

const BATCH_DATE = "2026-07-13";
const FACTS = { excerpt: "Fresh sourdough daily" };
const TOKEN = "seededtoken_1234567890abcdef";
const CONTEXT_REF = "bfvctx-seeded123";
const BOT_TOKEN = "7000000001:AAsecret-bot-token-XYZ";

/** Seed the rows exactly as the pipeline persists them (prospect → attempt → snapshot → BFV). */
async function seedContextRows(
  db: Db,
  overrides: { token?: string; contextRef?: string } = {},
): Promise<{ attemptId: string }> {
  const prospect = await ProspectRepo.create(db, {
    businessName: "Bakery A",
    sourceUrl: "https://bakery-a.example",
    normalizedDomain: normalizeUrl("https://bakery-a.example"),
  });
  const attempt = await AttemptRepo.create(db, {
    prospectId: prospect.id,
    attemptNumber: 1,
    batchDate: BATCH_DATE,
  });
  await SnapshotRepo.create(db, {
    outreachAttemptId: attempt.id,
    status: "complete",
    rawContent: "Fresh sourdough daily.",
    extractedFacts: FACTS,
  });
  await BFVRepo.create(db, {
    outreachAttemptId: attempt.id,
    telegramDeepLinkToken: overrides.token ?? TOKEN,
    contextRef: overrides.contextRef ?? CONTEXT_REF,
  });
  return { attemptId: attempt.id };
}

interface CapturedCall {
  url: string;
  body: Record<string, unknown> | null;
}

function makeClient(db: Db, llm: MockLLMClient, capture: CapturedCall[]) {
  const fetchImpl: typeof fetch = async (url, init) => {
    capture.push({
      url: String(url),
      body: init?.body
        ? (JSON.parse(init.body as string) as Record<string, unknown>)
        : null,
    });
    return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  return new TelegramBFVBotClient({
    botToken: BOT_TOKEN,
    botUsername: "AITransformsBot",
    contextStore: new DbBFVContextStore(db),
    llmClient: llm,
    fetchImpl,
  });
}

describe("DbBFVContextStore (T112)", () => {
  let db: Db;

  beforeEach(async () => {
    db = await createTestDb();
  });

  it("resolves a persisted deep-link token to the full context", async () => {
    const { attemptId } = await seedContextRows(db);
    const store = new DbBFVContextStore(db);

    const context = await store.getByToken(TOKEN);
    expect(context).toEqual({
      contextRef: CONTEXT_REF,
      telegramDeepLinkToken: TOKEN,
      outreachAttemptId: attemptId,
      extractedFacts: FACTS,
    });
    expect(await store.getByToken("unknown-token")).toBeNull();
  });

  it("resolves by contextRef", async () => {
    const { attemptId } = await seedContextRows(db);
    const store = new DbBFVContextStore(db);

    const context = await store.getByRef(CONTEXT_REF);
    expect(context?.outreachAttemptId).toBe(attemptId);
    expect(context?.extractedFacts).toEqual(FACTS);
    expect(await store.getByRef("bfvctx-unknown")).toBeNull();
  });

  it("context survives restart: a fresh store instance over the same database resolves it", async () => {
    await seedContextRows(db);
    // The store that existed when the context was provisioned is gone —
    // only rows the pipeline persisted remain.
    const restarted = new DbBFVContextStore(db);
    const context = await restarted.getByToken(TOKEN);
    expect(context?.contextRef).toBe(CONTEXT_REF);
    expect(context?.extractedFacts).toEqual(FACTS);
  });

  it("put() covers the pre-persist window without writing the domain-owned tables", async () => {
    const store = new DbBFVContextStore(db);
    await store.put({
      contextRef: "bfvctx-fresh",
      telegramDeepLinkToken: "freshtoken000000",
      outreachAttemptId: "attempt-x",
      extractedFacts: FACTS,
    });

    // Resolvable immediately (before the pipeline has persisted anything)...
    expect((await store.getByRef("bfvctx-fresh"))?.outreachAttemptId).toBe("attempt-x");
    expect((await store.getByToken("freshtoken000000"))?.contextRef).toBe("bfvctx-fresh");

    // ...but the tables stay owned by domain/pipeline: put() wrote nothing.
    const bfv = await db.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM bfv_deliverables`,
    );
    const snap = await db.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM scraped_site_snapshots`,
    );
    expect(bfv.rows[0]!.count).toBe("0");
    expect(snap.rows[0]!.count).toBe("0");

    // The overlay is per-process, not durable: a fresh instance sees nothing.
    const restarted = new DbBFVContextStore(db);
    expect(await restarted.getByToken("freshtoken000000")).toBeNull();
  });

  describe("session continuity through a restarted bot process", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("serves a /start deep link and answers from the persisted facts", async () => {
      await seedContextRows(db);
      const llm = new MockLLMClient();
      const prompts: string[] = [];
      llm.setResponder((prompt) => {
        prompts.push(prompt);
        return "We bake fresh sourdough every morning.";
      });
      const capture: CapturedCall[] = [];
      const client = makeClient(db, llm, capture);

      await client.processUpdate({
        message: { chat: { id: 42 }, text: `/start ${TOKEN}` },
      });
      await client.processUpdate({
        message: { chat: { id: 42 }, text: "When do you bake?" },
      });

      const sent = capture.filter((c) => c.url.includes("/sendMessage"));
      expect(sent).toHaveLength(2);
      // The answer came from the LLM over the DB-persisted facts — not the
      // "open this chat through the personal link" fallback.
      expect(sent[1]!.body?.text).toBe("We bake fresh sourdough every morning.");
      const answerPrompt = prompts.at(-1)!;
      expect(answerPrompt).toContain("Fresh sourdough daily");
      expect(answerPrompt).toContain("When do you bake?");
    });

    it("never leaks the deep-link token into logs while resolving from the database", async () => {
      await seedContextRows(db);
      const logged: string[] = [];
      for (const level of ["info", "warn", "error"] as const) {
        vi.spyOn(logger, level).mockImplementation((event, fields) => {
          logged.push(JSON.stringify({ event, ...fields }));
        });
      }
      const capture: CapturedCall[] = [];
      const client = makeClient(db, new MockLLMClient(), capture);

      await client.processUpdate({
        message: { chat: { id: 42 }, text: `/start ${TOKEN}` },
      });
      await client.processUpdate({
        message: { chat: { id: 42 }, text: "When do you bake?" },
      });

      expect(logged.length).toBeGreaterThan(0);
      const all = logged.join("\n");
      expect(all).not.toContain(TOKEN);
      expect(all).not.toContain(BOT_TOKEN);
      expect(all).not.toContain("Fresh sourdough daily");
    });
  });
});
