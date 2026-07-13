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

describe("Scenario 4 — approval is a pure gate, dispatch is a separate step (T032, CHK003)", () => {
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

  it("POST /approve moves human_review_queue -> approved and never touches the dispatch client", async () => {
    const deps = createPipelineTestDeps();
    const result = await runBatch(db, deps, {
      prospectList: [{ businessName: "Sam's Bakery", sourceUrl: `${fixtures.url}/complete` }],
      batchDate: "2026-07-12",
    });
    const attemptId = result.processing[0]!.outreachAttemptId;
    expect(result.processing[0]!.workflowState).toBe("human_review_queue");

    const dispatchClient = new MockDispatchClient();
    const approveHandler = createApproveHandler(db);

    const res = await approveHandler(new Request("http://x/prospects/1/approve", { method: "POST" }), {
      params: { id: attemptId },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { workflowState: string };
    expect(body.workflowState).toBe("approved");

    // Never dispatched by approve itself.
    expect(dispatchClient.calls).toHaveLength(0);
    const attempt = await AttemptRepo.getById(db, attemptId);
    expect(attempt?.workflowState).toBe("approved");
    expect(attempt?.providerThreadId).toBeNull();
  });

  it("approving twice returns 409 illegal_workflow_transition (approval is not re-entrant)", async () => {
    const deps = createPipelineTestDeps();
    const result = await runBatch(db, deps, {
      prospectList: [{ businessName: "Sam's Bakery", sourceUrl: `${fixtures.url}/complete` }],
      batchDate: "2026-07-12",
    });
    const attemptId = result.processing[0]!.outreachAttemptId;
    const approveHandler = createApproveHandler(db);
    const ctx = { params: { id: attemptId } };

    const first = await approveHandler(new Request("http://x", { method: "POST" }), ctx);
    expect(first.status).toBe(200);

    const second = await approveHandler(new Request("http://x", { method: "POST" }), ctx);
    expect(second.status).toBe(409);
    const body = (await second.json()) as { error: { code: string } };
    expect(body.error.code).toBe("illegal_workflow_transition");
  });

  it("only after a separate POST /internal/dispatch/process call does the attempt reach sent", async () => {
    const deps = createPipelineTestDeps();
    const result = await runBatch(db, deps, {
      prospectList: [{ businessName: "Sam's Bakery", sourceUrl: `${fixtures.url}/complete` }],
      batchDate: "2026-07-12",
    });
    const attemptId = result.processing[0]!.outreachAttemptId;

    const approveHandler = createApproveHandler(db);
    await approveHandler(new Request("http://x", { method: "POST" }), { params: { id: attemptId } });

    // Still approved, not sent, before dispatch/process runs.
    let attempt = await AttemptRepo.getById(db, attemptId);
    expect(attempt?.workflowState).toBe("approved");

    const dispatchClient = new MockDispatchClient();
    const dispatchHandler = createDispatchProcessHandler(db, dispatchClient);
    const dispatchRes = await dispatchHandler();
    expect(dispatchRes.status).toBe(200);
    const dispatchBody = (await dispatchRes.json()) as { processed: number; sent: number; failed: number };
    expect(dispatchBody.sent).toBe(1);
    expect(dispatchClient.calls).toHaveLength(1);
    expect(dispatchClient.calls[0]!.idempotencyKey).toBe(attemptId);

    attempt = await AttemptRepo.getById(db, attemptId);
    expect(attempt?.workflowState).toBe("sent");
    expect(attempt?.providerThreadId).toBe(`mock-thread-${attemptId}`);
  });
});
