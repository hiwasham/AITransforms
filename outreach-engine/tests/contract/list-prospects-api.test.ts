import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db/client.js";
import { createTestDb } from "../helpers/test-db.js";
import { createListProspectsHandler } from "@/api/prospects/route.js";

/**
 * Contract test (T102) for GET /prospects — the `workflowState` filter (and
 * its composition with the existing `status` filter), per
 * contracts/outreach-api.md. `workflow_state` lives on outreach_attempts, so
 * the filter must match a prospect via its attempt, not the prospect row.
 */
describe("Contract: GET /prospects — workflowState filter", () => {
  let db: Db;

  beforeEach(async () => {
    db = await createTestDb();
    // Two prospects, each with one attempt in a distinct workflow_state.
    await db.query(
      `INSERT INTO prospects (id, business_name, source_url, normalized_domain, current_outcome_status)
       VALUES ('p1', 'Ada Bakery', 'https://ada.example', 'ada.example', 'not_yet_sent'),
              ('p2', 'Bo Cafe', 'https://bo.example', 'bo.example', 'sent')`,
    );
    await db.query(
      `INSERT INTO outreach_attempts (id, prospect_id, attempt_number, batch_date, workflow_state)
       VALUES ('a1', 'p1', 1, '2026-07-12', 'human_review_queue'),
              ('a2', 'p2', 1, '2026-07-12', 'sent')`,
    );
  });

  afterEach(async () => {
    await db.close();
  });

  function get(query: string): Request {
    return new Request(`http://x/prospects${query}`, { method: "GET" });
  }

  async function ids(res: Response): Promise<string[]> {
    const body = (await res.json()) as { prospects: { id: string }[] };
    return body.prospects.map((p) => p.id).sort();
  }

  it("filters to only prospects whose attempt is in the given workflowState", async () => {
    const handler = createListProspectsHandler(db);
    const res = await handler(get("?workflowState=human_review_queue"));
    expect(res.status).toBe(200);
    expect(await ids(res)).toEqual(["p1"]);
  });

  it("returns a different single match for a different workflowState", async () => {
    const handler = createListProspectsHandler(db);
    const res = await handler(get("?workflowState=sent"));
    expect(await ids(res)).toEqual(["p2"]);
  });

  it("returns an empty list when no attempt is in the requested state", async () => {
    const handler = createListProspectsHandler(db);
    const res = await handler(get("?workflowState=dispatch_failed"));
    expect(await ids(res)).toEqual([]);
  });

  it("composes with the status filter (both must match the same prospect)", async () => {
    const handler = createListProspectsHandler(db);
    // p2 is sent+sent → matches; p1 is not_yet_sent+human_review_queue → excluded.
    const match = await handler(get("?status=sent&workflowState=sent"));
    expect(await ids(match)).toEqual(["p2"]);
    // Conflicting combo → no prospect satisfies both.
    const none = await handler(get("?status=sent&workflowState=human_review_queue"));
    expect(await ids(none)).toEqual([]);
  });

  it("returns all prospects when no filter is given (unchanged behavior)", async () => {
    const handler = createListProspectsHandler(db);
    const res = await handler(get(""));
    expect(await ids(res)).toEqual(["p1", "p2"]);
  });
});
