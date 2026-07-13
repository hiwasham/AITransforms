/**
 * Production LLMClient (T107, research.md §9): calls the Anthropic
 * Messages API directly over this host's existing Claude access path
 * (key from loadConfig().llmApiKey / ANTHROPIC_API_KEY). No SDK — Node's
 * global fetch keeps the dependency surface at zero.
 *
 * Security: the API key lives only in a private field and the request
 * header. It is never logged and never included in thrown error messages
 * (config.ts / Constitution Principle V). Callers passing scraped text
 * MUST still route it through the untrusted-content sanitizer (T016)
 * first, same as with MockLLMClient.
 *
 * Configuration (all via environment, see config.ts):
 *   ANTHROPIC_API_KEY       — required
 *   OUTREACH_LLM_MODEL      — optional, default "claude-sonnet-5"
 *   OUTREACH_LLM_TIMEOUT_MS — optional, default 60000
 */

import type { LLMClient } from "./llm-client.js";

const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MODEL = "claude-sonnet-5";
const DEFAULT_MAX_TOKENS = 2048;
const DEFAULT_TIMEOUT_MS = 60_000;

export interface AnthropicClientOptions {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  timeoutMs?: number;
  /** Test seam — point at a local fixture instead of api.anthropic.com. */
  baseUrl?: string;
  /** Test seam — inject a fake fetch; defaults to the global. */
  fetchImpl?: typeof fetch;
}

interface MessagesResponse {
  content?: Array<{ type: string; text?: string }>;
}

export class AnthropicLLMClient implements LLMClient {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly maxTokens: number;
  private readonly timeoutMs: number;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: AnthropicClientOptions) {
    if (!options.apiKey) {
      throw new Error(
        "AnthropicLLMClient requires an API key (set ANTHROPIC_API_KEY)",
      );
    }
    this.apiKey = options.apiKey;
    this.model = options.model ?? DEFAULT_MODEL;
    this.maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.baseUrl = options.baseUrl ?? "https://api.anthropic.com";
    this.fetchImpl =
      options.fetchImpl ?? ((...args) => globalThis.fetch(...args));
  }

  async complete(prompt: string): Promise<string> {
    let res: Response;
    try {
      res = await this.fetchImpl(`${this.baseUrl}/v1/messages`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": ANTHROPIC_VERSION,
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: this.maxTokens,
          messages: [{ role: "user", content: prompt }],
        }),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (error) {
      if (error instanceof Error && error.name === "TimeoutError") {
        throw new Error(`LLM request timed out after ${this.timeoutMs}ms`);
      }
      // Surface only the failure message — never headers or the key.
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(`LLM request failed: ${reason}`);
    }

    if (!res.ok) {
      const bodyText = (await res.text().catch(() => "")).slice(0, 500);
      throw new Error(`LLM request failed with HTTP ${res.status}: ${bodyText}`);
    }

    const body = (await res.json()) as MessagesResponse;
    const text = (body.content ?? [])
      .filter((block) => block.type === "text" && typeof block.text === "string")
      .map((block) => block.text)
      .join("");
    if (!text) {
      throw new Error("LLM response contained no text content");
    }
    return text;
  }
}
