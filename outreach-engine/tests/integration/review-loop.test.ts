/**
 * Review-loop integration (M010, specs/002-operator-review-dashboard).
 * Drives the operator's real path through the factory handlers over a
 * persistent PGLite datadir: import → review-in-order → reject+tag →
 * approve → restart → the decisions and the Q011 reason tag survive
 * (FR-009 durability). No HTTP server — the engine's established
 * handler-level integration pattern.
 */

import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDb, type Db } from "@/db/client.js";
import { createReviewImportHandler } from "@/api/review/imports/route.js";
import { createNextPackageHandler } from "@/api/review/packages/next/route.js";
import { createDecisionHandler } from "@/api/review/packages/[id]/decision/route.js";
import { createRejectionReasonHandler } from "@/api/review/packages/[id]/rejection-reason/route.js";
import { createGetReviewPackageHandler } from "@/api/review/packages/[id]/route.js";

const HEADER =
  "prospect,company,research_summary,pain_point,bfv_link_telegram,bfv_link_video,personalized_message,approval_status";
const rows = [
  `Jane,Acme Co,sum A,pain A,https://t.me/b?start=1,<<paste video link for Acme Co>>,"msg A {{BFV_LINK}}",pending`,
  `Bob,Beta LLC,sum B,pain B,https://t.me/b?start=2,<<paste video link for Beta LLC>>,"msg B {{BFV_LINK}}",pending`,
  `Cy,Gamma Inc,sum C,pain C,https://t.me/b?start=3,<<paste video link for Gamma Inc>>,"msg C {{BFV_LINK}}",pending`,
];
const CSV = [HEADER, ...rows].join("\n") + "\n";

function postJson(body: unknown): Request {
  return new Request("http://x", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}
/* eslint-disable @typescript-eslint/no-explicit-any */
const read = async (res: Response): Promise<any> => (await res.json()) as any;

const dirs: string[] = [];
function tmp(): string {
  const d = mkdtempSync(join(tmpdir(), "review-loop-"));
  dirs.push(d);
  return d;
}
afterEach(() => {
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
});

async function nextId(db: Db): Promise<string> {
  const body = await read(await createNextPackageHandler(db)());
  return body.package.id as string;
}
const decide = (db: Db, id: string, action: string) =>
  createDecisionHandler(db)(postJson({ action }), { params: { id } });
const tag = (db: Db, id: string, reason: string) =>
  createRejectionReasonHandler(db)(postJson({ reason }), { params: { id } });
const close = (db: Db) =>
  (db as unknown as { close: () => Promise<void> }).close();

describe("review loop end-to-end (M010)", () => {
  it("import → in-order review → reject+tag → approve, counts track each step", async () => {
    const db = await createDb();
    expect((await createReviewImportHandler(db)(
      postJson({ sourceName: "fx.csv", csv: CSV }),
    )).status).toBe(201);

    // In review order: Acme first.
    const acme = await nextId(db);
    const r1 = await read(await decide(db, acme, "reject"));
    expect(r1.package.decision).toBe("rejected");
    expect(r1.next.company).toBe("Beta LLC");
    expect(r1.counts).toEqual({ total: 3, reviewed: 1 });

    // Tag the rejection (Q011).
    const tagged = await read(await tag(db, acme, "bad_fit"));
    expect(tagged.package.rejectionReason).toBe("bad_fit");

    // Approve Beta.
    const beta = await nextId(db);
    const r2 = await read(await decide(db, beta, "approve"));
    expect(r2.package.decision).toBe("approved");
    expect(r2.counts.reviewed).toBe(2);

    // "next" on Gamma advances without deciding; it is never lost.
    const gamma = await nextId(db);
    const r3 = await read(await decide(db, gamma, "next"));
    expect(r3.package.decision).toBe("pending");
    expect(r3.counts.reviewed).toBe(2);
    // Only Gamma remains pending, so it returns again — never lost.
    expect(await nextId(db)).toBe(gamma);
    await close(db);
  });

  it("decisions and the reason tag survive a restart (FR-009)", async () => {
    const dir = tmp();
    const db1 = await createDb(dir);
    await createReviewImportHandler(db1)(postJson({ sourceName: "fx.csv", csv: CSV }));
    const acme = await nextId(db1);
    await decide(db1, acme, "reject");
    await tag(db1, acme, "creepy");
    await close(db1);

    // Restarted process: fresh handlers over the same datadir.
    const db2 = await createDb(dir);
    const reloaded = await read(
      await createGetReviewPackageHandler(db2)(new Request("http://x"), {
        params: { id: acme },
      }),
    );
    expect(reloaded.package.decision).toBe("rejected");
    expect(reloaded.package.rejectionReason).toBe("creepy");
    // Two prospects still pending after the restart.
    expect((await read(await createNextPackageHandler(db2)())).counts).toEqual({
      total: 3,
      reviewed: 1,
    });
    await close(db2);
  });
});
