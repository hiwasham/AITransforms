/**
 * DispatchClient mock/test-double (T018). Configurable to return
 * sent/failed/throw so US1's tests can exercise both the happy path and
 * the dispatch-failure-is-always-recoverable path (T028) without live
 * Instantly/Unipile credentials.
 */

import type {
  DispatchClient,
  DispatchPackage,
  DispatchResult,
} from "./interface.js";

export type MockBehavior =
  | { mode: "sent" }
  | { mode: "failed"; reason: string }
  | { mode: "throw"; error: Error };

export class MockDispatchClient implements DispatchClient {
  private behavior: MockBehavior = { mode: "sent" };
  public calls: Array<{ pkg: DispatchPackage; idempotencyKey: string }> = [];

  setBehavior(behavior: MockBehavior): void {
    this.behavior = behavior;
  }

  async send(
    pkg: DispatchPackage,
    idempotencyKey: string,
  ): Promise<DispatchResult> {
    this.calls.push({ pkg, idempotencyKey });
    if (this.behavior.mode === "throw") {
      throw this.behavior.error;
    }
    if (this.behavior.mode === "failed") {
      return { status: "failed", reason: this.behavior.reason };
    }
    return {
      status: "sent",
      providerThreadId: `mock-thread-${idempotencyKey}`,
    };
  }
}
