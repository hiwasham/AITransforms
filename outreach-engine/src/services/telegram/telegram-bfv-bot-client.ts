/**
 * Production Telegram BFVBotClient (T106, research.md §6): one shared bot,
 * a unique unguessable per-attempt deep-link token
 * (t.me/<bot>?start=<token>), resolved server-side to that attempt's
 * prospect-scoped context so the interactive session answers only from
 * that prospect's own scraped facts (FR-004).
 *
 * Boundaries: implements the existing BFVBotClient interface — the domain
 * layer (batch orchestrator, BFV readiness check) stays Telegram-unaware.
 * Contexts live behind BFVContextStore, not the Core Engine DB, so this
 * service never imports domain/ or db/. Scraped facts cross into LLM
 * prompts only inside the untrusted-content boundary (T016).
 *
 * Security: the bot token appears only in the request URL Telegram's API
 * requires. It is never logged, and any error text that could embed the
 * URL is scrubbed before rethrow (Constitution Principle V).
 *
 * Configuration (via config.ts): TELEGRAM_BOT_TOKEN (required),
 * OUTREACH_TELEGRAM_BOT_USERNAME (deep-link host).
 *
 * Receiving updates (webhook or long-poll wiring) is part of the served
 * runtime (T100) — this client exposes processUpdate() for that runtime
 * to feed.
 */

import { randomBytes } from "node:crypto";
import type { BFVBotClient } from "./bfv-bot-client.js";
import type { LLMClient } from "@/services/llm/llm-client.js";
import { wrapUntrustedContent } from "@/services/llm/untrusted-content.js";

/** Prospect-scoped context storage, keyed by contextRef and by deep-link token. */
export interface BFVContextStore {
  put(context: BFVContext): Promise<void>;
  getByRef(contextRef: string): Promise<BFVContext | null>;
  getByToken(token: string): Promise<BFVContext | null>;
}

export interface BFVContext {
  contextRef: string;
  telegramDeepLinkToken: string;
  outreachAttemptId: string;
  extractedFacts: Record<string, unknown>;
}

export class InMemoryBFVContextStore implements BFVContextStore {
  private byRef = new Map<string, BFVContext>();
  private byToken = new Map<string, BFVContext>();

  async put(context: BFVContext): Promise<void> {
    this.byRef.set(context.contextRef, context);
    this.byToken.set(context.telegramDeepLinkToken, context);
  }

  async getByRef(contextRef: string): Promise<BFVContext | null> {
    return this.byRef.get(contextRef) ?? null;
  }

  async getByToken(token: string): Promise<BFVContext | null> {
    return this.byToken.get(token) ?? null;
  }
}

/** Minimal shape of the one Telegram update kind this bot handles. */
export interface TelegramUpdate {
  message?: {
    chat: { id: number };
    text?: string;
  };
}

export interface TelegramBotClientOptions {
  botToken: string;
  botUsername: string;
  contextStore: BFVContextStore;
  llmClient: LLMClient;
  /** Test seam — point at a fixture instead of api.telegram.org. */
  baseUrl?: string;
  /** Test seam — inject a fake fetch; defaults to the global. */
  fetchImpl?: typeof fetch;
}

const FALLBACK_REPLY =
  "Hi! Please open this chat through the personal link we sent you, so I " +
  "can show you the demo built for your business.";

export class TelegramBFVBotClient implements BFVBotClient {
  private readonly botToken: string;
  private readonly botUsername: string;
  private readonly contextStore: BFVContextStore;
  private readonly llmClient: LLMClient;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  /** chat id -> contextRef, bound when a valid /start token arrives. */
  private readonly sessions = new Map<number, string>();

  constructor(options: TelegramBotClientOptions) {
    if (!options.botToken) {
      throw new Error(
        "TelegramBFVBotClient requires a bot token (set TELEGRAM_BOT_TOKEN)",
      );
    }
    this.botToken = options.botToken;
    this.botUsername = options.botUsername;
    this.contextStore = options.contextStore;
    this.llmClient = options.llmClient;
    this.baseUrl = options.baseUrl ?? "https://api.telegram.org";
    this.fetchImpl =
      options.fetchImpl ?? ((...args) => globalThis.fetch(...args));
  }

  // --- BFVBotClient interface ---

  async provisionContext(
    outreachAttemptId: string,
    extractedFacts: Record<string, unknown>,
  ): Promise<{ contextRef: string; telegramDeepLinkToken: string }> {
    // base64url of 24 random bytes = 32 chars of [A-Za-z0-9_-], within
    // Telegram's 64-char start-payload limit and unguessable.
    const telegramDeepLinkToken = randomBytes(24).toString("base64url");
    const contextRef = `bfvctx-${randomBytes(12).toString("base64url")}`;
    await this.contextStore.put({
      contextRef,
      telegramDeepLinkToken,
      outreachAttemptId,
      extractedFacts,
    });
    return { contextRef, telegramDeepLinkToken };
  }

  async isBotHealthy(): Promise<boolean> {
    try {
      const res = await this.callApi("getMe", {});
      return res.ok;
    } catch {
      return false;
    }
  }

  async contextResolves(contextRef: string): Promise<boolean> {
    return (await this.contextStore.getByRef(contextRef)) !== null;
  }

  // --- Deep link + update serving (fed by the T100 runtime) ---

  deepLinkUrl(telegramDeepLinkToken: string): string {
    return `https://t.me/${this.botUsername}?start=${telegramDeepLinkToken}`;
  }

  async processUpdate(update: TelegramUpdate): Promise<void> {
    const message = update.message;
    if (!message?.text) return;
    const chatId = message.chat.id;
    const text = message.text.trim();

    const startMatch = /^\/start\s+(\S+)$/.exec(text);
    if (startMatch) {
      const context = await this.contextStore.getByToken(startMatch[1]!);
      if (!context) {
        await this.sendMessage(chatId, FALLBACK_REPLY);
        return;
      }
      this.sessions.set(chatId, context.contextRef);
      const greeting = await this.llmClient.complete(
        this.buildPrompt(context, null),
      );
      await this.sendMessage(chatId, greeting);
      return;
    }

    const contextRef = this.sessions.get(chatId);
    const context = contextRef
      ? await this.contextStore.getByRef(contextRef)
      : null;
    if (!context) {
      await this.sendMessage(chatId, FALLBACK_REPLY);
      return;
    }
    const answer = await this.llmClient.complete(
      this.buildPrompt(context, text),
    );
    await this.sendMessage(chatId, answer);
  }

  // --- internals ---

  private buildPrompt(context: BFVContext, userQuestion: string | null): string {
    const facts = wrapUntrustedContent(JSON.stringify(context.extractedFacts));
    const task = userQuestion
      ? `The prospect asked: "${userQuestion}". Answer briefly and helpfully, using only the facts above.`
      : "Greet the prospect in one or two short sentences, showing you know their business from the facts above, and invite a question.";
    return [
      "You are a friendly AI demo assistant for one specific small business.",
      "Answer only from the scraped facts below. If the answer is not in the",
      "facts, say you are not sure. Keep replies short and simple.",
      facts,
      task,
    ].join("\n\n");
  }

  private async sendMessage(chatId: number, text: string): Promise<void> {
    await this.callApi("sendMessage", { chat_id: chatId, text });
  }

  /**
   * Calls a Bot API method. Telegram puts the token in the URL path, so
   * every failure message is scrubbed before rethrow.
   */
  private async callApi(
    method: string,
    payload: Record<string, unknown>,
  ): Promise<{ ok: boolean }> {
    let res: Response;
    try {
      res = await this.fetchImpl(
        `${this.baseUrl}/bot${this.botToken}/${method}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
    } catch (error) {
      const raw = error instanceof Error ? error.message : String(error);
      throw new Error(`Telegram ${method} failed: ${this.scrub(raw)}`);
    }
    if (!res.ok) {
      throw new Error(`Telegram ${method} failed with HTTP ${res.status}`);
    }
    const body = (await res.json()) as { ok?: boolean };
    return { ok: body.ok === true };
  }

  private scrub(text: string): string {
    return text.replaceAll(this.botToken, "[redacted-bot-token]");
  }
}
