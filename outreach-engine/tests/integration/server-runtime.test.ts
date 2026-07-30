import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import type { Db } from "@/db/client.js";
import { createTestDb } from "../helpers/test-db.js";
import { createApp } from "@/server/app.js";
import { createHttpServer } from "@/server/http.js";
import { assertServableConfig } from "@/server/main.js";
import { MockLLMClient } from "@/services/llm/llm-client.js";
import { MockDispatchClient } from "@/services/dispatch/mock-client.js";
import {
  TelegramBFVBotClient,
  InMemoryBFVContextStore,
} from "@/services/telegram/telegram-bfv-bot-client.js";
import type { Config } from "@/lib/config.js";

/**
 * Served runtime (T100): the factory route handlers, previously invoked
 * only directly by tests, must be reachable over real HTTP. These tests
 * boot the node:http bridge on an ephemeral port and exercise routing,
 * dynamic params, JSON bodies, and the fail-closed webhook path with real
 * network requests.
 */

function makeBotClient() {
  return new TelegramBFVBotClient({
    botToken: "7000000001:AAtest-token",
    botUsername: "AITransformsBot",
    contextStore: new InMemoryBFVContextStore(),
    llmClient: new MockLLMClient(),
    fetchImpl: async () =>
      new Response(JSON.stringify({ ok: true, result: {} }), { status: 200 }),
  });
}

describe("served runtime (T100)", () => {
  let db: Db;
  let server: Server;
  let base: string;

  beforeEach(async () => {
    db = await createTestDb();
    const app = createApp({
      db,
      llmClient: new MockLLMClient(),
      botClient: makeBotClient(),
      dispatchClient: new MockDispatchClient(),
      webhookSecrets: { instantly: "instantly-secret", unipile: "unipile-secret" },
      telegramBotUsername: "AITransformsBot",
    });
    server = createHttpServer(app, { maxBodyBytes: null });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address() as AddressInfo;
    base = `http://127.0.0.1:${port}`;
  });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
  });

  it("serves GET /prospects over real HTTP", async () => {
    const res = await fetch(`${base}/prospects`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");
    const body = (await res.json()) as { prospects: unknown[] };
    expect(Array.isArray(body.prospects)).toBe(true);
  });

  it("extracts dynamic path params (GET /batches/:date)", async () => {
    const res = await fetch(`${base}/batches/2026-07-14`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { batchDate: string };
    expect(body.batchDate).toBe("2026-07-14");
  });

  it("routes JSON POST bodies (POST /batches/generate with an empty list)", async () => {
    const res = await fetch(`${base}/batches/generate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prospectList: [] }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { accepted: number };
    expect(body.accepted).toBe(0);
  });

  it("returns the standard 404 error shape for unknown paths and methods", async () => {
    const missing = await fetch(`${base}/nope`);
    expect(missing.status).toBe(404);
    const body = (await missing.json()) as { error: { code: string } };
    expect(body.error.code).toBe("not_found");

    // Known path, wrong method.
    const wrongMethod = await fetch(`${base}/prospects`, { method: "DELETE" });
    expect(wrongMethod.status).toBe(404);
  });

  it("fails closed with the generic 404 for malformed dynamic path encoding", async () => {
    const res = await fetch(`${base}/review/packages/%E0%A4%A`);
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("not_found");
  });

  it("keeps the webhook fail-closed over HTTP (bad signature -> 401)", async () => {
    const res = await fetch(`${base}/webhooks/instantly`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-webhook-signature": "not-a-real-signature",
      },
      body: JSON.stringify({ eventType: "reply", providerThreadId: "t1" }),
    });
    expect(res.status).toBe(401);
  });

  it("routes provider params (POST /webhooks/:provider unknown -> 404 unknown_provider)", async () => {
    const res = await fetch(`${base}/webhooks/smoke-signals`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    });
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("unknown_provider");
  });

  it("serves POST /prospects/:id/approve (unknown attempt -> 404)", async () => {
    const res = await fetch(`${base}/prospects/00000000-0000-0000-0000-000000000000/approve`, {
      method: "POST",
    });
    expect(res.status).toBe(404);
  });

  it("serves POST /internal/dispatch/process (empty queue -> 200)", async () => {
    const res = await fetch(`${base}/internal/dispatch/process`, { method: "POST" });
    expect(res.status).toBe(200);
  });
});

describe("assertServableConfig (T100 startup validation)", () => {
  const good: Config = {
    dbDataDir: "/var/lib/outreach",
    llmApiKey: "sk-ant-x",
    llmModel: "claude-sonnet-5",
    llmTimeoutMs: 60000,
    telegramBotToken: "7000000001:AAx",
    telegramBotUsername: "AITransformsBot",
    instantlyApiKey: "k",
    instantlyWebhookSecret: "s",
    unipileApiKey: "k",
    unipileWebhookSecret: "s",
  };

  it("accepts a fully-populated config", () => {
    expect(() => assertServableConfig(good)).not.toThrow();
  });

  it.each([
    ["dbDataDir", /OUTREACH_DB_DATA_DIR/],
    ["llmApiKey", /ANTHROPIC_API_KEY/],
    ["telegramBotToken", /TELEGRAM_BOT_TOKEN/],
  ] as const)("rejects a missing %s naming the env var", (field, pattern) => {
    expect(() =>
      assertServableConfig({ ...good, [field]: undefined }),
    ).toThrow(pattern);
  });
});
