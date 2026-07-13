import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db/client.js";
import { createTestDb } from "../helpers/test-db.js";
import { startFixtureServer, type FixtureServer } from "../helpers/fixture-server.js";
import { createPipelineTestDeps } from "../helpers/pipeline-mocks.js";
import { runBatch } from "@/domain/pipeline/batch-orchestrator.js";
import { createApproveHandler } from "@/api/prospects/[id]/approve/route.js";
import { createDispatchProcessHandler } from "@/api/internal/dispatch/process/route.js";
import { MockDispatchClient } from "@/services/dispatch/mock-client.js";
import type { DispatchClient } from "@/services/dispatch/interface.js";
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

  // T105 hardening (FR-028 / data-model.md Dispatch Recovery Rule).
  describe("T105: thrown send() and stuck-dispatching recovery", () => {
    it("a thrown send() records dispatch_failed and does not abort the rest of the pass", async () => {
      const firstAttemptId = await approvedAttemptId();
      // Second prospect needs a distinct domain (dedup is domain-keyed).
      const fixtures2 = await startFixtureServer();
      const deps = createPipelineTestDeps();
      const result = await runBatch(db, deps, {
        prospectList: [
          { businessName: "Rosa's Flowers", sourceUrl: `${fixtures2.url}/complete` },
        ],
        batchDate: "2026-07-12",
      });
      const secondAttemptId = result.processing[0]!.outreachAttemptId;
      const approveHandler = createApproveHandler(db);
      await approveHandler(new Request("http://x", { method: "POST" }), {
        params: { id: secondAttemptId },
      });
      await fixtures2.close();

      let callCount = 0;
      const throwOnFirstCall: DispatchClient = {
        async send(_pkg, idempotencyKey) {
          callCount += 1;
          if (callCount === 1) throw new Error("socket hang up");
          return { status: "sent", providerThreadId: `t-${idempotencyKey}` };
        },
      };
      const handler = createDispatchProcessHandler(db, throwOnFirstCall);

      const res = await handler();
      const body = (await res.json()) as { processed: number; sent: number; failed: number };
      expect(body).toEqual({ processed: 2, sent: 1, failed: 1 });

      const attempts = await Promise.all([
        AttemptRepo.getById(db, firstAttemptId),
        AttemptRepo.getById(db, secondAttemptId),
      ]);
      const failedAttempt = attempts.find((a) => a?.workflowState === "dispatch_failed");
      const sentAttempt = attempts.find((a) => a?.workflowState === "sent");
      expect(failedAttempt).toBeTruthy();
      expect(failedAttempt?.lastDispatchError).toContain("socket hang up");
      expect(failedAttempt?.dispatchAttempts).toBe(1);
      expect(sentAttempt).toBeTruthy();
    });

    it("an attempt stuck at dispatching past the timeout is retried by the automatic pass", async () => {
      const attemptId = await approvedAttemptId();
      // Simulate a process death mid-send: stranded at `dispatching` 30min ago.
      await db.query(
        `UPDATE outreach_attempts
         SET workflow_state = 'dispatching',
             dispatching_since = now() - interval '30 minutes'
         WHERE id = $1`,
        [attemptId],
      );

      const dispatchClient = new MockDispatchClient();
      const handler = createDispatchProcessHandler(db, dispatchClient);
      const res = await handler();
      const body = (await res.json()) as { processed: number; sent: number; failed: number };
      expect(body).toEqual({ processed: 1, sent: 1, failed: 0 });

      const attempt = await AttemptRepo.getById(db, attemptId);
      expect(attempt?.workflowState).toBe("sent");
      expect(attempt?.providerThreadId).toBeTruthy();
    });

    it("an attempt freshly at dispatching (within the timeout) is NOT picked up", async () => {
      const attemptId = await approvedAttemptId();
      await db.query(
        `UPDATE outreach_attempts
         SET workflow_state = 'dispatching', dispatching_since = now()
         WHERE id = $1`,
        [attemptId],
      );

      const dispatchClient = new MockDispatchClient();
      const handler = createDispatchProcessHandler(db, dispatchClient);
      const res = await handler();
      const body = (await res.json()) as { processed: number; sent: number; failed: number };
      expect(body).toEqual({ processed: 0, sent: 0, failed: 0 });

      const attempt = await AttemptRepo.getById(db, attemptId);
      expect(attempt?.workflowState).toBe("dispatching");
    });
  });
});
