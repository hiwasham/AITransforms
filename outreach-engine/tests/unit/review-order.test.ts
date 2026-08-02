/**
 * Unit tests: review order (M006, specs/002-operator-review-dashboard
 * MVP-0). Next = first pending never-passed-over by position, then
 * passed-over ones; a passed-over prospect is never lost and returns
 * before the queue reports complete. Decisions are last-write-wins.
 */

import { describe, expect, it, beforeEach } from "vitest";
import { createDb, type Db } from "@/db/client.js";
import * as Repo from "@/domain/review/review-package.js";

async function seed(db: Db, companies: string[]): Promise<string[]> {
  const ids: string[] = [];
  for (const company of companies) {
    const pkg = await Repo.create(db, {
      dedupKey: company.toLowerCase(),
      sourceName: "fixture.csv",
      company,
      contact: null,
      researchSummary: "s",
      painPoint: "p",
      messageBody: "m {{BFV_LINK}}",
      bfvLinkTelegram: "https://t.me/bot?start=x",
      videoUrl: null,
      generatorFlag: null,
    });
    ids.push(pkg!.id);
  }
  return ids;
}

describe("review order", () => {
  let db: Db;
  beforeEach(async () => {
    db = await createDb();
  });

  it("serves pending packages in import position order", async () => {
    await seed(db, ["A", "B", "C"]);
    expect((await Repo.getNext(db))?.company).toBe("A");
  });

  it("advances after a decision", async () => {
    const [a] = await seed(db, ["A", "B"]);
    await Repo.recordDecision(db, a!, "approved");
    expect((await Repo.getNext(db))?.company).toBe("B");
  });

  it("passed-over package yields the queue but is never lost", async () => {
    const [a] = await seed(db, ["A", "B"]);
    await Repo.markPassedOver(db, a!);
    expect((await Repo.getNext(db))?.company).toBe("B");

    const [pkgB] = [await Repo.getNext(db)];
    await Repo.recordDecision(db, pkgB!.id, "rejected");

    // A returns before the queue reports complete (spec §MVP-0).
    expect((await Repo.getNext(db))?.company).toBe("A");
  });

  it("all decided ⇒ next is null (review complete)", async () => {
    const ids = await seed(db, ["A", "B"]);
    await Repo.recordDecision(db, ids[0]!, "approved");
    await Repo.recordDecision(db, ids[1]!, "rejected");
    expect(await Repo.getNext(db)).toBeNull();
  });

  it("re-decide replaces the previous decision (last-write-wins, FR-010)", async () => {
    const [a] = await seed(db, ["A"]);
    await Repo.recordDecision(db, a!, "rejected");
    const redone = await Repo.recordDecision(db, a!, "approved");
    expect(redone?.decision).toBe("approved");
    expect((await Repo.getCounts(db)).reviewed).toBe(1);
  });

  it("deciding a passed-over package clears its passed-over mark", async () => {
    const [a] = await seed(db, ["A"]);
    await Repo.markPassedOver(db, a!);
    const decided = await Repo.recordDecision(db, a!, "approved");
    expect(decided?.passedOverAt).toBeNull();
  });

  it("counts: reviewed = approved + rejected, passed-over still pending", async () => {
    const ids = await seed(db, ["A", "B", "C"]);
    await Repo.recordDecision(db, ids[0]!, "approved");
    await Repo.markPassedOver(db, ids[1]!);
    expect(await Repo.getCounts(db)).toEqual({ total: 3, reviewed: 1 });
  });
});
