import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db/client.js";
import { createTestDb } from "../helpers/test-db.js";
import { startFixtureServer, type FixtureServer } from "../helpers/fixture-server.js";
import { createPipelineTestDeps } from "../helpers/pipeline-mocks.js";
import { runBatch } from "@/domain/pipeline/batch-orchestrator.js";
import { createApproveHandler } from "@/api/prospects/[id]/approve/route.js";
import { createDispatchProcessHandler } from "@/api/internal/dispatch/process/route.js";
import { MockDispatchClient } from "@/services/dispatch/mock-client.js";
import * as AttemptRepo from "@/domain/prospects/outreach-attempt.js";

/**
 * T028 (trimmed per MVP Execution Plan): proves "dispatch failures must
 * never create unrecoverable states" using ONLY the automatic
 * POST /internal/dispatch/process path (T047, MVP-1). The manual
 * POST /prospects/:id/retry-dispatch endpoint (T048) is Phase 2 scope and
 * is NOT exercised here — automatic re-processing on a later call is
 * sufficient to prove the CHK003 guarantee for MVP-1.
 */
describe("Dispatch failure is always recoverable (T028, CHK003)", () => {
  let db: Db;
  let fixtures: FixtureServer;

  beforeEach(async () => {
    db = await createTestDb();
    fixtures = await startFixtureServer();
  });

  afterEach(async () => {
    await db.close();
    await fixtures.close();
  });

  it("a failed dispatch lands on dispatch_failed with attempts/error recorded, then a later automatic pass sends it", async () => {
    const deps = createPipelineTestDeps();
    const result = await runBatch(db, deps, {
      prospectList: [{ businessName: "Sam's Bakery", sourceUrl: `${fixtures.url}/complete` }],
      batchDate: "2026-07-12",
    });
    const attemptId = result.processing[0]!.outreachAttemptId;

    const approveHandler = createApproveHandler(db);
    await approveHandler(new Request("http://x", { method: "POST" }), { params: { id: attemptId } });

    const dispatchClient = new MockDispatchClient();
    dispatchClient.setBehavior({ mode: "failed", reason: "provider timeout" });
    const dispatchHandler = createDispatchProcessHandler(db, dispatchClient);

    const failRes = await dispatchHandler();
    const failBody = (await failRes.json()) as { processed: number; sent: number; failed: number };
    expect(failBody.failed).toBe(1);
    expect(failBody.sent).toBe(0);

    let attempt = await AttemptRepo.getById(db, attemptId);
    expect(attempt?.workflowState).toBe("dispatch_failed");
    expect(attempt?.dispatchAttempts).toBe(1);
    expect(attempt?.lastDispatchError).toBe("provider timeout");

    // Never a dead end: reconfigure the same client to succeed and run the
    // automatic pass again — findDispatchable() must pick this attempt back up.
    dispatchClient.setBehavior({ mode: "sent" });
    const retryRes = await dispatchHandler();
    const retryBody = (await retryRes.json()) as { processed: number; sent: number; failed: number };
    expect(retryBody.sent).toBe(1);

    attempt = await AttemptRepo.getById(db, attemptId);
    expect(attempt?.workflowState).toBe("sent");
    expect(attempt?.providerThreadId).toBe(`mock-thread-${attemptId}`);
  });

  it("dispatch failures stop being auto-retried once AUTOMATIC_DISPATCH_RETRY_CAP is reached (but state stays dispatch_failed, not a dead end)", async () => {
    const deps = createPipelineTestDeps();
    const result = await runBatch(db, deps, {
      prospectList: [{ businessName: "Sam's Bakery", sourceUrl: `${fixtures.url}/complete` }],
      batchDate: "2026-07-12",
    });
    const attemptId = result.processing[0]!.outreachAttemptId;

    const approveHandler = createApproveHandler(db);
    await approveHandler(new Request("http://x", { method: "POST" }), { params: { id: attemptId } });

    const dispatchClient = new MockDispatchClient();
    dispatchClient.setBehavior({ mode: "failed", reason: "provider timeout" });
    const dispatchHandler = createDispatchProcessHandler(db, dispatchClient);

    // Cap is 3 automatic attempts (AUTOMATIC_DISPATCH_RETRY_CAP).
    await dispatchHandler();
    await dispatchHandler();
    await dispatchHandler();

    let attempt = await AttemptRepo.getById(db, attemptId);
    expect(attempt?.dispatchAttempts).toBe(3);
    expect(attempt?.workflowState).toBe("dispatch_failed");

    const beyondCapRes = await dispatchHandler();
    const beyondCapBody = (await beyondCapRes.json()) as { processed: number };
    expect(beyondCapBody.processed).toBe(0); // findDispatchable excludes attempts at/over the cap

    // State is dispatch_failed, not a silently-lost terminal state — it
    // is exactly what the (Phase 2) manual retry-dispatch endpoint targets.
    attempt = await AttemptRepo.getById(db, attemptId);
    expect(attempt?.workflowState).toBe("dispatch_failed");
    expect(attempt?.dispatchAttempts).toBe(3);
  });
});
