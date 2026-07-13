/**
 * LLM client wrapper (T036, research.md §9). Every call site that includes
 * scraped text MUST route it through the untrusted-content sanitizer
 * (T016) before calling this.
 *
 * MVP-1 scope note: the real client (reusing this host's Claude access
 * path) is intentionally not wired to a live API key in this pass — the
 * interface below is what real and mock implementations both satisfy, and
 * all MVP-1 tests run against MockLLMClient so the suite has zero live
 * network dependency, matching quickstart.md's own stated testing
 * philosophy ("mocked scraper/Telegram/LLM service adapters"). Wiring a
 * real provider call behind this interface is a Phase 2/Future task, not
 * a design change.
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
