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
 * Contract test (T026) for POST /internal/dispatch/process — see
 * contracts/outreach-api.md and contracts/dispatch-client-interface.md.
 */
describe("Contract: POST /internal/dispatch/process", () => {
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

  async function approvedAttemptId(): Promise<string> {
    const deps = createPipelineTestDeps();
    const result = await runBatch(db, deps, {
      prospectList: [{ businessName: "Sam's Bakery", sourceUrl: `${fixtures.url}/complete` }],
      batchDate: "2026-07-12",
    });
    const attemptId = result.processing[0]!.outreachAttemptId;
    const approveHandler = createApproveHandler(db);
    await approveHandler(new Request("http://x", { method: "POST" }), { params: { id: attemptId } });
    return attemptId;
  }

  it("on success: approved -> sent, with provider_thread_id set, response body reports { processed, sent, failed }", async () => {
    const attemptId = await approvedAttemptId();
    const dispatchClient = new MockDispatchClient();
    const handler = createDispatchProcessHandler(db, dispatchClient);

    const res = await handler();
    expect(res.status).toBe(200);
    const body = (await res.json()) as { processed: number; sent: number; failed: number };
    expect(body).toEqual({ processed: 1, sent: 1, failed: 0 });

    const attempt = await AttemptRepo.getById(db, attemptId);
    expect(attempt?.workflowState).toBe("sent");
    expect(attempt?.providerThreadId).toBeTruthy();
  });

  it("on failure: approved -> dispatch_failed, with last_dispatch_error set", async () => {
    const attemptId = await approvedAttemptId();
    const dispatchClient = new MockDispatchClient();
    dispatchClient.setBehavior({ mode: "failed", reason: "smtp rejected" });
    const handler = createDispatchProcessHandler(db, dispatchClient);

    const res = await handler();
    const body = (await res.json()) as { processed: number; sent: number; failed: number };
    expect(body).toEqual({ processed: 1, sent: 0, failed: 1 });

    const attempt = await AttemptRepo.getById(db, attemptId);
    expect(attempt?.workflowState).toBe("dispatch_failed");
    expect(attempt?.lastDispatchError).toBe("smtp rejected");
    expect(attempt?.providerThreadId).toBeNull();
  });

  it("idempotencyKey passed to DispatchClient.send equals the OutreachAttempt id", async () => {
    const attemptId = await approvedAttemptId();
    const dispatchClient = new MockDispatchClient();
    const handler = createDispatchProcessHandler(db, dispatchClient);

    await handler();
    expect(dispatchClient.calls).toHaveLength(1);
    expect(dispatchClient.calls[0]!.idempotencyKey).toBe(attemptId);
  });

  it("processes nothing (processed: 0) when there is no dispatchable attempt", async () => {
    const dispatchClient = new MockDispatchClient();
    const handler = createDispatchProcessHandler(db, dispatchClient);
    const res = await handler();
    const body = (await res.json()) as { processed: number; sent: number; failed: number };
    expect(body).toEqual({ processed: 0, sent: 0, failed: 0 });
  });
});
