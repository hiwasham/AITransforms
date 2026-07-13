/**
 * Shared Telegram BFV bot client (T035). One bot, per-attempt deep-link
 * tokens (research.md §6) — never one bot per prospect.
 *
 * MVP-1 scope: mock only, matching quickstart.md's stated testing
 * philosophy. A real Telegram Bot API client is Phase 2/Future.
 */

import { randomUUID } from "node:crypto";

export interface BFVBotClient {
  /** Provisions a prospect-scoped context and returns its unguessable deep-link token. */
  provisionContext(
    outreachAttemptId: string,
    extractedFacts: Record<string, unknown>,
  ): Promise<{ contextRef: string; telegramDeepLinkToken: string }>;

  /** Server-side readiness check: is the bot process healthy and reachable? */
  isBotHealthy(): Promise<boolean>;

  /** Does this contextRef resolve to a loaded, queryable context? */
  contextResolves(contextRef: string): Promise<boolean>;
}

export class MockBFVBotClient implements BFVBotClient {
  private healthy = true;
  private resolvableContexts = new Set<string>();

  setHealthy(healthy: boolean): void {
    this.healthy = healthy;
  }

  async provisionContext(
    outreachAttemptId: string,
    _extractedFacts: Record<string, unknown>,
  ): Promise<{ contextRef: string; telegramDeepLinkToken: string }> {
    const contextRef = `ctx-${outreachAttemptId}`;
    const telegramDeepLinkToken = randomUUID().replace(/-/g, "");
    this.resolvableContexts.add(contextRef);
    return { contextRef, telegramDeepLinkToken };
  }

  async isBotHealthy(): Promise<boolean> {
    return this.healthy;
  }

  async contextResolves(contextRef: string): Promise<boolean> {
    return this.resolvableContexts.has(contextRef);
  }
}
