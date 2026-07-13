/**
 * DispatchClient interface (T017, contracts/dispatch-client-interface.md).
 *
 * Called ONLY by POST /internal/dispatch/process and
 * POST /prospects/:id/retry-dispatch — never by the approve handler
 * (CHK003: approval and dispatch are structurally decoupled).
 */

export interface DispatchPackage {
  outreachAttemptId: string;
  recipientContact: string;
  bodyText: string;
}

export type DispatchResult =
  | { status: "sent"; providerThreadId: string }
  | { status: "failed"; reason: string };

export interface DispatchClient {
  /**
   * idempotencyKey is always the OutreachAttempt.id, passed through to the
   * provider so a retry after an ambiguous failure doesn't risk a
   * duplicate real-world send (to the extent the provider honors it —
   * see contracts/dispatch-client-interface.md's Open Assumption, CHK001).
   */
  send(
    pkg: DispatchPackage,
    idempotencyKey: string,
  ): Promise<DispatchResult>;
}
