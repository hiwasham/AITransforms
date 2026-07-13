import { describe, expect, it } from "vitest";
import {
  TelegramBFVBotClient,
  InMemoryBFVContextStore,
} from "@/services/telegram/telegram-bfv-bot-client.js";
import { MockLLMClient } from "@/services/llm/llm-client.js";

/**
 * Unit tests for the production Telegram BFVBotClient (T106). No live
 * network — fetch is injected. Covers deep-link token generation, bot
 * health, context resolution, /start session serving, and the
 * bot-token-never-in-errors guarantee.
 */

const BOT_TOKEN = "7000000001:AAsecret-bot-token-XYZ";

interface CapturedCall {
  url: string;
  body: Record<string, unknown> | null;
}

function telegramOk(result: unknown): Response {
  return new Response(JSON.stringify({ ok: true, result }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function makeClient(overrides: {
  fetchImpl?: typeof fetch;
  llm?: MockLLMClient;
  store?: InMemoryBFVContextStore;
  capture?: CapturedCall[];
} = {}) {
  const llm = overrides.llm ?? new MockLLMClient();
  const store = overrides.store ?? new InMemoryBFVContextStore();
  const capture = overrides.capture;
  const fetchImpl: typeof fetch =
    overrides.fetchImpl ??
    (async (url, init) => {
      capture?.push({
        url: String(url),
        body: init?.body ? (JSON.parse(init.body as string) as Record<string, unknown>) : null,
      });
      if (String(url).endsWith("/getMe")) {
        return telegramOk({ username: "AITransformsBot" });
      }
      return telegramOk({ message_id: 1 });
    });
  const client = new TelegramBFVBotClient({
    botToken: BOT_TOKEN,
    botUsername: "AITransformsBot",
    contextStore: store,
    llmClient: llm,
    fetchImpl,
  });
  return { client, llm, store };
}

describe("TelegramBFVBotClient (T106)", () => {
  it("refuses construction without a bot token", () => {
    expect(() =>
      new TelegramBFVBotClient({
        botToken: "",
        botUsername: "x",
        contextStore: new InMemoryBFVContextStore(),
        llmClient: new MockLLMClient(),
      }),
    ).toThrow(/bot token/i);
  });

  describe("provisionContext / deep-link generation", () => {
    it("returns a token valid as a Telegram ?start= payload and a resolvable context", async () => {
      const { client } = makeClient();
      const { contextRef, telegramDeepLinkToken } = await client.provisionContext(
        "attempt-1",
        { excerpt: "We sell bread" },
      );

      // Telegram deep-link payload rules: [A-Za-z0-9_-], 1..64 chars.
      expect(telegramDeepLinkToken).toMatch(/^[A-Za-z0-9_-]{16,64}$/);
      expect(await client.contextResolves(contextRef)).toBe(true);
      expect(client.deepLinkUrl(telegramDeepLinkToken)).toBe(
        `https://t.me/AITransformsBot?start=${telegramDeepLinkToken}`,
      );
    });

    it("generates a distinct unguessable token per attempt", async () => {
      const { client } = makeClient();
      const a = await client.provisionContext("attempt-1", {});
      const b = await client.provisionContext("attempt-2", {});
      expect(a.telegramDeepLinkToken).not.toBe(b.telegramDeepLinkToken);
      expect(a.contextRef).not.toBe(b.contextRef);
    });
  });

  describe("isBotHealthy", () => {
    it("true when getMe returns ok", async () => {
      const capture: CapturedCall[] = [];
      const { client } = makeClient({ capture });
      expect(await client.isBotHealthy()).toBe(true);
      expect(capture[0]!.url).toContain("/getMe");
    });

    it("false on HTTP failure and on a thrown fetch — health checks never throw", async () => {
      const { client: httpFail } = makeClient({
        fetchImpl: async () => new Response("bad gateway", { status: 502 }),
      });
      expect(await httpFail.isBotHealthy()).toBe(false);

      const { client: netFail } = makeClient({
        fetchImpl: async () => {
          throw new TypeError("fetch failed");
        },
      });
      expect(await netFail.isBotHealthy()).toBe(false);
    });
  });

  it("contextResolves is false for an unknown ref", async () => {
    const { client } = makeClient();
    expect(await client.contextResolves("ctx-nope")).toBe(false);
  });

  describe("update handling (/start deep-link resolution + LLM session)", () => {
    it("/start <valid token> resolves the context and replies with an LLM answer grounded in wrapped facts", async () => {
      const capture: CapturedCall[] = [];
      const llm = new MockLLMClient();
      const prompts: string[] = [];
      llm.setResponder((p) => {
        prompts.push(p);
        return "Hi! I read your bakery site — ask me anything.";
      });
      const { client } = makeClient({ capture, llm });

      const { telegramDeepLinkToken } = await client.provisionContext("attempt-1", {
        excerpt: "Fresh sourdough daily",
      });
      await client.processUpdate({
        message: { chat: { id: 42 }, text: `/start ${telegramDeepLinkToken}` },
      });

      const send = capture.find((c) => c.url.endsWith("/sendMessage"));
      expect(send!.body!.chat_id).toBe(42);
      expect(send!.body!.text).toBe("Hi! I read your bakery site — ask me anything.");
      // T016: scraped facts must cross into the prompt only inside the
      // untrusted-content boundary.
      expect(prompts[0]).toContain("<untrusted_scraped_content>");
      expect(prompts[0]).toContain("Fresh sourdough daily");
    });

    it("/start with an unknown token sends a fallback and never calls the LLM", async () => {
      const capture: CapturedCall[] = [];
      const llm = new MockLLMClient();
      let llmCalls = 0;
      llm.setResponder(() => {
        llmCalls += 1;
        return "should not happen";
      });
      const { client } = makeClient({ capture, llm });

      await client.processUpdate({
        message: { chat: { id: 7 }, text: "/start not-a-real-token" },
      });

      expect(llmCalls).toBe(0);
      const send = capture.find((c) => c.url.endsWith("/sendMessage"));
      expect(send!.body!.chat_id).toBe(7);
      expect(String(send!.body!.text)).toMatch(/link/i);
    });

    it("a follow-up message in an active session answers via the LLM; without a session it points at the link", async () => {
      const capture: CapturedCall[] = [];
      const llm = new MockLLMClient();
      llm.setResponder((p) => (p.includes("sourdough") ? "We bake it every morning." : "?"));
      const { client } = makeClient({ capture, llm });

      const { telegramDeepLinkToken } = await client.provisionContext("attempt-1", {
        excerpt: "sourdough",
      });
      await client.processUpdate({
        message: { chat: { id: 9 }, text: `/start ${telegramDeepLinkToken}` },
      });
      await client.processUpdate({
        message: { chat: { id: 9 }, text: "When do you bake?" },
      });
      const sends = capture.filter((c) => c.url.endsWith("/sendMessage"));
      expect(sends[1]!.body!.text).toBe("We bake it every morning.");

      // Unknown chat: no session.
      await client.processUpdate({
        message: { chat: { id: 555 }, text: "hello?" },
      });
      const last = capture.filter((c) => c.url.endsWith("/sendMessage")).at(-1)!;
      expect(String(last.body!.text)).toMatch(/link/i);
    });
  });

  describe("bot token protection", () => {
    it("sendMessage failures never expose the bot token, even when the underlying error embeds the request URL", async () => {
      const { client } = makeClient({
        fetchImpl: async (url) => {
          throw new Error(`connect ECONNREFUSED for ${String(url)}`);
        },
      });
      const { telegramDeepLinkToken } = await client.provisionContext("a1", {});
      const err = await client
        .processUpdate({ message: { chat: { id: 1 }, text: `/start ${telegramDeepLinkToken}` } })
        .then(
          () => null,
          (e: Error) => e,
        );
      expect(err).toBeInstanceOf(Error);
      expect(err!.message).not.toContain(BOT_TOKEN);
    });

    it("HTTP error messages carry status but not the token", async () => {
      const { client } = makeClient({
        fetchImpl: async () =>
          new Response(JSON.stringify({ ok: false, description: "Unauthorized" }), {
            status: 401,
          }),
      });
      const { telegramDeepLinkToken } = await client.provisionContext("a1", {});
      const err = await client
        .processUpdate({ message: { chat: { id: 1 }, text: `/start ${telegramDeepLinkToken}` } })
        .then(
          () => null,
          (e: Error) => e,
        );
      expect(err!.message).toContain("401");
      expect(err!.message).not.toContain(BOT_TOKEN);
    });
  });
});
