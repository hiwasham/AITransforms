import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db/client.js";
import { createTestDb } from "../helpers/test-db.js";
import { startFixtureServer, type FixtureServer } from "../helpers/fixture-server.js";
import { createPipelineTestDeps } from "../helpers/pipeline-mocks.js";
import { runBatch } from "@/domain/pipeline/batch-orchestrator.js";
import { createApproveHandler } from "@/api/prospects/[id]/approve/route.js";

/**
 * Contract test (T025) for POST /prospects/:id/approve — see
 * contracts/outreach-api.md. Focuses purely on the HTTP response shape,
 * not on downstream side effects (those are covered by
 * tests/integration/scenario-4-approval-gate.test.ts).
 */
describe("Contract: POST /prospects/:id/approve", () => {
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

  it("404s for an unknown attempt id", async () => {
    const handler = createApproveHandler(db);
    const res = await handler(new Request("http://x", { method: "POST" }), {
      params: { id: "00000000-0000-0000-0000-000000000000" },
    });
    expect(res.status).toBe(404);
  });

  it("a successful approve returns exactly { workflowState, approvedAt } — nothing dispatch-related", async () => {
    const deps = createPipelineTestDeps();
    const result = await runBatch(db, deps, {
      prospectList: [{ businessName: "Sam's Bakery", sourceUrl: `${fixtures.url}/complete` }],
      batchDate: "2026-07-12",
    });
    const attemptId = result.processing[0]!.outreachAttemptId;

    const handler = createApproveHandler(db);
    const res = await handler(new Request("http://x", { method: "POST" }), {
      params: { id: attemptId },
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");

    const body = (await res.json()) as Record<string, unknown>;
    expect(body).toEqual({
      workflowState: "approved",
      approvedAt: expect.any(String),
    });
    // Structurally proves approve cannot dispatch: these keys must never appear.
    expect(body).not.toHaveProperty("provider_thread_id");
    expect(body).not.toHaveProperty("providerThreadId");
    expect(body.workflowState).not.toBe("sent");
    expect(body.workflowState).not.toBe("dispatch_failed");
  });

  it("returns 409 illegal_workflow_transition when the attempt is not at human_review_queue", async () => {
    const deps = createPipelineTestDeps();
    const result = await runBatch(db, deps, {
      prospectList: [{ businessName: "Sam's Bakery", sourceUrl: `${fixtures.url}/complete` }],
      batchDate: "2026-07-12",
    });
    const attemptId = result.processing[0]!.outreachAttemptId;
    const handler = createApproveHandler(db);
    const ctx = { params: { id: attemptId } };

    await handler(new Request("http://x", { method: "POST" }), ctx); // now approved

    const res = await handler(new Request("http://x", { method: "POST" }), ctx);
    expect(res.status).toBe(409);
    const body = (await res.json()) as { error: { code: string; message: string } };
    expect(body.error.code).toBe("illegal_workflow_transition");
    expect(typeof body.error.message).toBe("string");
  });
});
