/**
 * LLM client wrapper (T036, research.md §9). Every call site that includes
 * scraped text MUST route it through the untrusted-content sanitizer
 * (T016) before calling this.
 *
 * The production implementation is AnthropicLLMClient (T107,
 * anthropic-client.ts), which reuses this host's Claude access path.
 * All tests still run against MockLLMClient below (plus injected-fetch
 * unit tests for the real client), so the suite keeps zero live network
 * dependency, matching quickstart.md's testing philosophy ("mocked
 * scraper/Telegram/LLM service adapters").
 */

export interface LLMClient {
  complete(prompt: string): Promise<string>;
}

/**
 * Deterministic mock — returns canned or rule-based responses so tests
 * are fast and reproducible. Configurable per-test via `setResponder`.
 */
export class MockLLMClient implements LLMClient {
  private responder: (prompt: string) => string = () => "OK";

  setResponder(fn: (prompt: string) => string): void {
    this.responder = fn;
  }

  async complete(prompt: string): Promise<string> {
    return this.responder(prompt);
  }
}
