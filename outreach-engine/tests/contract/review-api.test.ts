/**
 * Contract tests: the four MVP-0 review endpoints (M007,
 * specs/002-operator-review-dashboard). Factory handlers + per-test
 * PGLite, no server — the engine's established pattern.
 */

import { describe, expect, it, beforeEach } from "vitest";
import { createDb, type Db } from "@/db/client.js";
import { createReviewImportHandler } from "@/api/review/imports/route.js";
import { createNextPackageHandler } from "@/api/review/packages/next/route.js";
import { createGetReviewPackageHandler } from "@/api/review/packages/[id]/route.js";
import { createDecisionHandler } from "@/api/review/packages/[id]/decision/route.js";

const HEADER =
  "prospect,company,research_summary,pain_point,bfv_link_telegram,bfv_link_video,personalized_message,approval_status";
const ROW_A = `Jane,Acme Co,summary A,pain A,https://t.me/b?start=1,<<paste video link for Acme Co>>,"msg A {{BFV_LINK}}",pending`;
const ROW_B = `Bob,Beta LLC,summary B,pain B,https://t.me/b?start=2,<<paste video link for Beta LLC>>,"msg B {{BFV_LINK}}",pending`;
const CSV = [HEADER, ROW_A, ROW_B].join("\n") + "\n";

function postJson(url: string, body: unknown): Request {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Contract tests assert shapes via expect(); `any` here mirrors the loose read the assertions pin down. */
async function json(res: Response): Promise<any> {
  return (await res.json()) as any;
}

describe("review API contracts", () => {
  let db: Db;
  beforeEach(async () => {
    db = await createDb();
  });

  async function importFixture(): Promise<void> {
    const res = await createReviewImportHandler(db)(
      postJson("http://x/review/imports", { sourceName: "fx.csv", csv: CSV }),
    );
    expect(res.status).toBe(201);
  }

  describe("POST /review/imports", () => {
    it("returns 201 with the summary shape", async () => {
      const res = await createReviewImportHandler(db)(
        postJson("http://x/review/imports", { sourceName: "fx.csv", csv: CSV }),
      );
      expect(res.status).toBe(201);
      expect(await json(res)).toEqual({
        sourceName: "fx.csv",
        rowsRead: 2,
        added: 2,
        duplicates: 0,
        malformed: [],
      });
    });

    it("double import: added 0, zero state change (SC-004)", async () => {
      await importFixture();
      const res = await createReviewImportHandler(db)(
        postJson("http://x/review/imports", { sourceName: "fx.csv", csv: CSV }),
      );
      const body = await json(res);
      expect(body).toMatchObject({ added: 0, duplicates: 2 });
    });

    it("400 on missing csv", async () => {
      const res = await createReviewImportHandler(db)(
        postJson("http://x/review/imports", { sourceName: "fx.csv" }),
      );
      expect(res.status).toBe(400);
      expect((await json(res)).error.code).toBe("invalid_request");
    });

    it("400 on non-JSON body", async () => {
      const res = await createReviewImportHandler(db)(
        new Request("http://x/review/imports", { method: "POST", body: "not json" }),
      );
      expect(res.status).toBe(400);
    });
  });

  describe("GET /review/packages/next", () => {
    it("returns the first package with counts", async () => {
      await importFixture();
      const res = await createNextPackageHandler(db)();
      expect(res.status).toBe(200);
      const body = await json(res);
      expect(body.package).toMatchObject({
        company: "Acme Co",
        contact: "Jane",
        researchSummary: "summary A",
        painPoint: "pain A",
        messageBody: "msg A {{BFV_LINK}}",
        bfvLinkTelegram: "https://t.me/b?start=1",
        decision: "pending",
      });
      expect(body.counts).toEqual({ total: 2, reviewed: 0 });
    });

    it("exhausted queue: 200 with package null, never 404", async () => {
      const res = await createNextPackageHandler(db)();
      expect(res.status).toBe(200);
      expect(await json(res)).toEqual({
        package: null,
        counts: { total: 0, reviewed: 0 },
      });
    });
  });

  describe("GET /review/packages/:id", () => {
    it("returns one package; 404 unknown", async () => {
      await importFixture();
      const nextBody = await json(await createNextPackageHandler(db)());
      const id = nextBody.package.id as string;

      const ok = await createGetReviewPackageHandler(db)(
        new Request("http://x"), { params: { id } },
      );
      expect(ok.status).toBe(200);
      expect((await json(ok)).package.id).toBe(id);

      const missing = await createGetReviewPackageHandler(db)(
        new Request("http://x"), { params: { id: "nope" } },
      );
      expect(missing.status).toBe(404);
    });
  });

  describe("POST /review/packages/:id/decision", () => {
    async function firstId(): Promise<string> {
      const body = await json(await createNextPackageHandler(db)());
      return body.package.id as string;
    }

    it("approve persists and returns the next package inline", async () => {
      await importFixture();
      const id = await firstId();
      const res = await createDecisionHandler(db)(
        postJson("http://x", { action: "approve" }), { params: { id } },
      );
      expect(res.status).toBe(200);
      const body = await json(res);
      expect(body.package).toMatchObject({ id, decision: "approved" });
      expect(body.next).toMatchObject({ company: "Beta LLC" });
      expect(body.counts).toEqual({ total: 2, reviewed: 1 });
    });

    it("reject persists", async () => {
      await importFixture();
      const id = await firstId();
      const body = await json(
        await createDecisionHandler(db)(
          postJson("http://x", { action: "reject" }), { params: { id } },
        )
      );
      expect(body.package.decision).toBe("rejected");
    });

    it("next advances without deciding; the package is never lost", async () => {
      await importFixture();
      const id = await firstId();
      const body = await json(
        await createDecisionHandler(db)(
          postJson("http://x", { action: "next" }), { params: { id } },
        )
      );
      expect(body.package.decision).toBe("pending"); // no decision recorded
      expect(body.next.company).toBe("Beta LLC");
      expect(body.counts.reviewed).toBe(0);
    });

    it("re-decide replaces (last-write-wins, FR-010)", async () => {
      await importFixture();
      const id = await firstId();
      const decide = (action: string) =>
        createDecisionHandler(db)(postJson("http://x", { action }), { params: { id } });
      await decide("reject");
      const body = await json(await decide("approve"));
      expect(body.package.decision).toBe("approved");
      expect(body.counts.reviewed).toBe(1);
    });

    it("400 invalid action, 404 unknown id", async () => {
      await importFixture();
      const bad = await createDecisionHandler(db)(
        postJson("http://x", { action: "destroy" }), { params: { id: "any" } },
      );
      expect(bad.status).toBe(400);

      const missing = await createDecisionHandler(db)(
        postJson("http://x", { action: "approve" }), { params: { id: "nope" } },
      );
      expect(missing.status).toBe(404);
    });

    it("refuses approve on a false video claim (Q006 / 002 FR-022, 409)", async () => {
      // Import a package whose message claims a video exists while the
      // video field is still the generator placeholder (golden defect D1).
      const row = `Pat,Claimy Co,summary,pain,https://t.me/b?start=9,<<paste video link for Claimy Co>>,"I made you a short personal video. Watch it here: {{BFV_LINK}}",pending`;
      const res = await createReviewImportHandler(db)(
        postJson("http://x/review/imports", {
          sourceName: "claim.csv",
          csv: [HEADER, row].join("\n") + "\n",
        }),
      );
      expect(res.status).toBe(201);
      const id = await firstId();

      const refused = await createDecisionHandler(db)(
        postJson("http://x", { action: "approve" }), { params: { id } },
      );
      expect(refused.status).toBe(409);
      const body = await json(refused);
      expect(body.error.code).toBe("not_send_ready");
      expect(body.error.message).toMatch(/claims a video/i);

      // Decision unchanged; reject still allowed on the same package.
      const after = await createGetReviewPackageHandler(db)(
        new Request("http://x"), { params: { id } },
      );
      expect((await json(after)).package.decision).toBe("pending");
      const rejected = await createDecisionHandler(db)(
        postJson("http://x", { action: "reject" }), { params: { id } },
      );
      expect((await json(rejected)).package.decision).toBe("rejected");
    });
  });
});
