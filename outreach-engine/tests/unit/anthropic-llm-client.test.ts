import { describe, expect, it } from "vitest";
import { AnthropicLLMClient } from "@/services/llm/anthropic-client.js";

/**
 * Unit tests for the production LLMClient (T107). No live network — the
 * fetch implementation is injected. Covers success, HTTP failure, network
 * failure, timeout, empty response, and the key-never-in-errors guarantee.
 */
describe("AnthropicLLMClient (T107)", () => {
  const API_KEY = "sk-ant-test-secret-key-000";

  function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    });
  }

  it("POSTs the prompt to /v1/messages with auth headers and returns concatenated text blocks", async () => {
    let captured: { url: string; init: RequestInit } | null = null;
    const client = new AnthropicLLMClient({
      apiKey: API_KEY,
      model: "claude-sonnet-5",
      fetchImpl: async (url, init) => {
        captured = { url: String(url), init: init! };
        return jsonResponse({
          content: [
            { type: "text", text: "hello " },
            { type: "text", text: "world" },
          ],
        });
      },
    });

    const result = await client.complete("write a greeting");
    expect(result).toBe("hello world");

    expect(captured!.url).toBe("https://api.anthropic.com/v1/messages");
    const headers = captured!.init.headers as Record<string, string>;
    expect(headers["x-api-key"]).toBe(API_KEY);
    expect(headers["anthropic-version"]).toBeTruthy();
    const body = JSON.parse(captured!.init.body as string) as {
      model: string;
      messages: Array<{ role: string; content: string }>;
    };
    expect(body.model).toBe("claude-sonnet-5");
    expect(body.messages).toEqual([{ role: "user", content: "write a greeting" }]);
  });

  it("throws on a non-2xx response, without the API key in the error message", async () => {
    const client = new AnthropicLLMClient({
      apiKey: API_KEY,
      fetchImpl: async () =>
        jsonResponse({ error: { type: "authentication_error" } }, 401),
    });

    const err = await client.complete("x").then(
      () => null,
      (e: Error) => e,
    );
    expect(err).toBeInstanceOf(Error);
    expect(err!.message).toContain("HTTP 401");
    expect(err!.message).not.toContain(API_KEY);
  });

  it("throws on a network-level fetch failure, without the API key in the error message", async () => {
    const client = new AnthropicLLMClient({
      apiKey: API_KEY,
      fetchImpl: async () => {
        throw new TypeError("fetch failed");
      },
    });

    const err = await client.complete("x").then(
      () => null,
      (e: Error) => e,
    );
    expect(err!.message).toContain("fetch failed");
    expect(err!.message).not.toContain(API_KEY);
  });

  it("aborts and throws a timeout error when the request exceeds timeoutMs", async () => {
    const client = new AnthropicLLMClient({
      apiKey: API_KEY,
      timeoutMs: 25,
      fetchImpl: (_url, init) =>
        new Promise((_resolve, reject) => {
          init!.signal!.addEventListener("abort", () =>
            reject(init!.signal!.reason as Error),
          );
        }),
    });

    await expect(client.complete("x")).rejects.toThrow(/timed out after 25ms/);
  });

  it("throws when the response contains no text content", async () => {
    const client = new AnthropicLLMClient({
      apiKey: API_KEY,
      fetchImpl: async () => jsonResponse({ content: [] }),
    });

    await expect(client.complete("x")).rejects.toThrow(/no text content/);
  });

  it("refuses construction without an API key", () => {
    expect(() => new AnthropicLLMClient({ apiKey: "" })).toThrow(/API key/);
  });
});
