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
 * quickstart.md Scenario 8 (T058): webhook happy path, dedup, bad
 * signature, unmatched thread, late reply, and the outcome-regression
 * guard case, all against the real route handler chain.
 */
describe("Scenario 8 — webhook reply detection (T058)", () => {
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

  async function sentAttempt(name: string): Promise<{ attemptId: string; prospectId: string; threadId: string }> {
    const deps = createPipelineTestDeps();
    const result = await runBatch(db, deps, {
      prospectList: [{ businessName: name, sourceUrl: `${fixtures.url}/complete` }],
      batchDate: "2026-07-12",
    });
    const attemptId = result.processing[0]!.outreachAttemptId;
    await createApproveHandler(db)(new Request("http://x", { method: "POST" }), {
      params: { id: attemptId },
    });
    const dispatchClient = new MockDispatchClient();
    await createDispatchProcessHandler(db, dispatchClient)();
    const attempt = await AttemptRepo.getById(db, attemptId);
    return { attemptId, prospectId: attempt!.prospectId, threadId: attempt!.providerThreadId! };
  }

  it("bad signature: 401, no WebhookEvent created, prospect status untouched", async () => {
    const { prospectId, threadId } = await sentAttempt("Bad Sig Co");
    const handler = createWebhookHandler(db, SECRETS);
    const body = JSON.stringify({ providerEventId: "evt_bad_sig", threadId, eventType: "reply" });

    const res = await handler(
      new Request("http://x", { method: "POST", body, headers: { "x-webhook-signature": "totally-wrong" } }),
      { params: { provider: "instantly" } },
    );
    expect(res.status).toBe(401);

    const events = await db.query(`SELECT * FROM webhook_events WHERE provider_event_id = $1`, ["evt_bad_sig"]);
    expect(events.rows).toHaveLength(0);
    const prospect = await ProspectRepo.getById(db, prospectId);
    expect(prospect?.currentOutcomeStatus).toBe("sent");
  });

  it("unmatched thread: 200, WebhookEvent recorded with matched_outreach_attempt_id null, no prospect exists to touch", async () => {
    await sentAttempt("Unmatched Thread Co"); // establishes secrets/handler context only
    const handler = createWebhookHandler(db, SECRETS);
    const body = JSON.stringify({
      providerEventId: "evt_unmatched",
      threadId: "unknown-thread-id",
      eventType: "reply",
    });
    const signature = sign(body, SECRETS.instantly);

    const res = await handler(
      new Request("http://x", { method: "POST", body, headers: { "x-webhook-signature": signature } }),
      { params: { provider: "instantly" } },
    );
    expect(res.status).toBe(200);
    const responseBody = (await res.json()) as Record<string, unknown>;
    expect(responseBody).toEqual({ processed: true, deduplicated: false, matched: false, applied: false });

    const events = await db.query<{ matched_outreach_attempt_id: string | null }>(
      `SELECT matched_outreach_attempt_id FROM webhook_events WHERE provider_event_id = $1`,
      ["evt_unmatched"],
    );
    expect(events.rows[0]?.matched_outreach_attempt_id).toBeNull();
  });

  it("happy path then dedup: reply transitions sent -> replied and halts cadence; the exact same event replayed is a no-op", async () => {
    const { prospectId, attemptId, threadId } = await sentAttempt("Happy Path Co");
    const handler = createWebhookHandler(db, SECRETS);
    const body = JSON.stringify({ providerEventId: "evt_happy", threadId, eventType: "reply" });
    const signature = sign(body, SECRETS.instantly);
    const req = () =>
      new Request("http://x", { method: "POST", body, headers: { "x-webhook-signature": signature } });

    const firstRes = await handler(req(), { params: { provider: "instantly" } });
    const firstBody = (await firstRes.json()) as Record<string, unknown>;
    expect(firstBody).toEqual({ processed: true, deduplicated: false, matched: true, applied: true });

    let prospect = await ProspectRepo.getById(db, prospectId);
    expect(prospect?.currentOutcomeStatus).toBe("replied");
    const cadence = await db.query<{ exhausted_at: string | null }>(
      `SELECT exhausted_at FROM follow_up_cadence_states WHERE outreach_attempt_id = $1`,
      [attemptId],
    );
    expect(cadence.rows[0]?.exhausted_at).not.toBeNull();

    // Late/duplicate delivery of the same provider event id — dedup, no re-apply.
    const secondRes = await handler(req(), { params: { provider: "instantly" } });
    const secondBody = (await secondRes.json()) as Record<string, unknown>;
    expect(secondBody).toEqual({ processed: true, deduplicated: true, matched: true, applied: false });

    prospect = await ProspectRepo.getById(db, prospectId);
    expect(prospect?.currentOutcomeStatus).toBe("replied"); // unchanged by the duplicate
  });

  it("outcome-regression guard: a reply for a prospect already at call_booked is retained but does not move the funnel backward", async () => {
    const { prospectId, threadId } = await sentAttempt("Already Booked Co");
    await ProspectRepo.setOutcomeStatus(db, prospectId, "call_booked");

    const handler = createWebhookHandler(db, SECRETS);
    const body = JSON.stringify({ providerEventId: "evt_regression_guard", threadId, eventType: "reply" });
    const signature = sign(body, SECRETS.instantly);

    const res = await handler(
      new Request("http://x", { method: "POST", body, headers: { "x-webhook-signature": signature } }),
      { params: { provider: "instantly" } },
    );
    expect(res.status).toBe(200);
    const responseBody = (await res.json()) as Record<string, unknown>;
    expect(responseBody).toEqual({ processed: true, deduplicated: false, matched: true, applied: false });

    const prospect = await ProspectRepo.getById(db, prospectId);
    expect(prospect?.currentOutcomeStatus).toBe("call_booked");

    const eventRow = await db.query<{ resulted_in_transition: boolean }>(
      `SELECT resulted_in_transition FROM webhook_events WHERE provider_event_id = $1`,
      ["evt_regression_guard"],
    );
    expect(eventRow.rows[0]?.resulted_in_transition).toBe(false);
  });
});
