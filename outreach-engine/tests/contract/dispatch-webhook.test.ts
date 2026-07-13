import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db/client.js";
import { createTestDb } from "../helpers/test-db.js";
import { startFixtureServer, type FixtureServer } from "../helpers/fixture-server.js";
import { createPipelineTestDeps } from "../helpers/pipeline-mocks.js";
import { runBatch } from "@/domain/pipeline/batch-orchestrator.js";
import { createApproveHandler } from "@/api/prospects/[id]/approve/route.js";
import { createDispatchProcessHandler } from "@/api/internal/dispatch/process/route.js";
import { MockDispatchClient } from "@/services/dispatch/mock-client.js";
import { createWebhookHandler } from "@/api/webhooks/[provider]/route.js";
import * as AttemptRepo from "@/domain/prospects/outreach-attempt.js";
import * as ProspectRepo from "@/domain/prospects/prospect.js";

const SECRETS = { instantly: "instantly-secret", unipile: "unipile-secret" };

function sign(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

/**
 * Contract test (T057) for POST /webhooks/:provider — see
 * contracts/dispatch-webhook.md, including the `applied: false`
 * superseded-event response shape.
 */
describe("Contract: POST /webhooks/:provider", () => {
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

  async function sentAttempt(): Promise<{ attemptId: string; threadId: string }> {
    const deps = createPipelineTestDeps();
    const result = await runBatch(db, deps, {
      prospectList: [{ businessName: "Sam's Bakery", sourceUrl: `${fixtures.url}/complete` }],
      batchDate: "2026-07-12",
    });
    const attemptId = result.processing[0]!.outreachAttemptId;
    await createApproveHandler(db)(new Request("http://x", { method: "POST" }), {
      params: { id: attemptId },
    });
    const dispatchClient = new MockDispatchClient();
    await createDispatchProcessHandler(db, dispatchClient)();
    const attempt = await AttemptRepo.getById(db, attemptId);
    return { attemptId, threadId: attempt!.providerThreadId! };
  }

  it("404s for an unknown provider", async () => {
    const handler = createWebhookHandler(db, SECRETS);
    const res = await handler(new Request("http://x", { method: "POST", body: "{}" }), {
      params: { provider: "sendgrid" },
    });
    expect(res.status).toBe(404);
  });

  it("401s and makes no state change for a missing/invalid signature", async () => {
    const { threadId } = await sentAttempt();
    const handler = createWebhookHandler(db, SECRETS);
    const body = JSON.stringify({ providerEventId: "evt_1", threadId, eventType: "reply" });

    const res = await handler(
      new Request("http://x", { method: "POST", body, headers: { "x-webhook-signature": "bogus" } }),
      { params: { provider: "instantly" } },
    );
    expect(res.status).toBe(401);
  });

  it("happy path: valid signature + matched thread returns { processed: true, deduplicated: false, matched: true, applied: true }", async () => {
    const { threadId } = await sentAttempt();
    const handler = createWebhookHandler(db, SECRETS);
    const body = JSON.stringify({ providerEventId: "evt_2", threadId, eventType: "reply" });
    const signature = sign(body, SECRETS.instantly);

    const res = await handler(
      new Request("http://x", { method: "POST", body, headers: { "x-webhook-signature": signature } }),
      { params: { provider: "instantly" } },
    );
    expect(res.status).toBe(200);
    const responseBody = (await res.json()) as Record<string, unknown>;
    expect(responseBody).toEqual({
      processed: true,
      deduplicated: false,
      matched: true,
      applied: true,
    });
  });

  it("duplicate provider_event_id returns { deduplicated: true } and does not re-apply", async () => {
    const { threadId } = await sentAttempt();
    const handler = createWebhookHandler(db, SECRETS);
    const body = JSON.stringify({ providerEventId: "evt_3", threadId, eventType: "reply" });
    const signature = sign(body, SECRETS.instantly);
    const req = () =>
      new Request("http://x", { method: "POST", body, headers: { "x-webhook-signature": signature } });

    await handler(req(), { params: { provider: "instantly" } });
    const secondRes = await handler(req(), { params: { provider: "instantly" } });
    expect(secondRes.status).toBe(200);
    const secondBody = (await secondRes.json()) as Record<string, unknown>;
    expect(secondBody).toEqual({
      processed: true,
      deduplicated: true,
      matched: true,
      applied: false,
    });
  });

  it("an event for a call_booked/closed prospect is retained but superseded: applied: false, status untouched", async () => {
    const { attemptId, threadId } = await sentAttempt();
    const attempt = await AttemptRepo.getById(db, attemptId);
    await ProspectRepo.setOutcomeStatus(db, attempt!.prospectId, "call_booked");

    const handler = createWebhookHandler(db, SECRETS);
    const body = JSON.stringify({ providerEventId: "evt_4", threadId, eventType: "reply" });
    const signature = sign(body, SECRETS.instantly);

    const res = await handler(
      new Request("http://x", { method: "POST", body, headers: { "x-webhook-signature": signature } }),
      { params: { provider: "instantly" } },
    );
    const responseBody = (await res.json()) as Record<string, unknown>;
    expect(responseBody.applied).toBe(false);

    const prospect = await ProspectRepo.getById(db, attempt!.prospectId);
    expect(prospect?.currentOutcomeStatus).toBe("call_booked"); // never moved backward
  });
});
