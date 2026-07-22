/**
 * Unit tests: review importer (M006, specs/002-operator-review-dashboard
 * MVP-0). Importer mapping, flag carry (FR-003), malformed tolerance,
 * dedup idempotency (FR-002), dedup_key normalization.
 */

import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import { createDb, type Db } from "@/db/client.js";
import { importCsv, dedupKey } from "@/domain/review/importer.js";
import * as ReviewPackageRepo from "@/domain/review/review-package.js";
import { logger } from "@/lib/logger.js";

const HEADER =
  "prospect,company,research_summary,pain_point,bfv_link_telegram,bfv_link_video,personalized_message,approval_status";

function csv(...rows: string[]): string {
  return [HEADER, ...rows].join("\n") + "\n";
}

const ROW_ACME = `Jane,Acme Co,"Acme sells widgets.","Slow quoting",https://t.me/bot?start=tok1,<<paste video link for Acme Co>>,"Hi Jane, quick idea. {{BFV_LINK}}",pending`;

describe("dedupKey", () => {
  it("normalizes case and whitespace", () => {
    expect(dedupKey("Acme Co", "Jane")).toBe(dedupKey("  acme   CO ", "JANE "));
  });

  it("distinguishes different contacts at the same company", () => {
    expect(dedupKey("Acme Co", "Jane")).not.toBe(dedupKey("Acme Co", "Bob"));
  });

  it("works with empty contact", () => {
    expect(dedupKey("Acme Co", "")).toBe("acme co|");
  });
});

describe("importCsv", () => {
  let db: Db;
  beforeEach(async () => {
    db = await createDb();
  });

  it("maps a first-100 row to a package", async () => {
    const summary = await importCsv(db, csv(ROW_ACME), "test.csv");
    expect(summary).toMatchObject({ rowsRead: 1, added: 1, duplicates: 0 });
    expect(summary.malformed).toEqual([]);

    const pkg = await ReviewPackageRepo.getNext(db);
    expect(pkg).toMatchObject({
      company: "Acme Co",
      contact: "Jane",
      researchSummary: "Acme sells widgets.",
      painPoint: "Slow quoting",
      bfvLinkTelegram: "https://t.me/bot?start=tok1",
      videoUrl: null, // <<paste...>> placeholder → null
      messageBody: "Hi Jane, quick idea. {{BFV_LINK}}",
      decision: "pending",
      generatorFlag: null,
      position: 1,
    });
  });

  it("carries needs_research as a visible generator flag (FR-003)", async () => {
    const row = ROW_ACME.replace(/pending$/, "needs_research");
    await importCsv(db, csv(row), "test.csv");
    const pkg = await ReviewPackageRepo.getNext(db);
    expect(pkg?.generatorFlag).toBe("needs_research");
    expect(pkg?.decision).toBe("pending");
  });

  it("carries source approved as an approved decision, not reset to pending (FR-003)", async () => {
    const row = ROW_ACME.replace(/pending$/, "approved");
    const summary = await importCsv(db, csv(row), "test.csv");
    expect(summary.added).toBe(1);
    // Approved ⇒ not pending ⇒ not in the review queue.
    expect(await ReviewPackageRepo.getNext(db)).toBeNull();
    const counts = await ReviewPackageRepo.getCounts(db);
    expect(counts).toEqual({ total: 1, reviewed: 1 });
  });

  it("flags a row with an empty message as missing_message", async () => {
    const row = `Jane,Acme Co,summary,pain,tg,vid,,pending`;
    await importCsv(db, csv(row), "test.csv");
    const pkg = await ReviewPackageRepo.getNext(db);
    expect(pkg?.generatorFlag).toBe("missing_message");
  });

  it("skips and reports a malformed row without aborting the rest", async () => {
    const bad = `only,three,fields`;
    const row2 = ROW_ACME.replaceAll("Acme Co", "Beta LLC").replaceAll("Jane", "Bob");
    const summary = await importCsv(db, csv(bad, ROW_ACME, row2), "test.csv");
    expect(summary.rowsRead).toBe(3);
    expect(summary.added).toBe(2);
    expect(summary.malformed).toEqual([
      { rowNumber: 2, reason: expect.stringContaining("fields") },
    ]);
  });

  it("skips and reports a row with no company", async () => {
    const row = `Jane,,summary,pain,tg,vid,msg,pending`;
    const summary = await importCsv(db, csv(row), "test.csv");
    expect(summary.added).toBe(0);
    expect(summary.malformed).toEqual([{ rowNumber: 2, reason: "empty company" }]);
  });

  it("rejects a file missing required columns as a whole-file error", async () => {
    const summary = await importCsv(db, "foo,bar\n1,2\n", "bad.csv");
    expect(summary.added).toBe(0);
    expect(summary.malformed[0]?.reason).toContain("missing required column");
  });

  it("dedups within one file", async () => {
    const summary = await importCsv(db, csv(ROW_ACME, ROW_ACME), "test.csv");
    expect(summary).toMatchObject({ rowsRead: 2, added: 1, duplicates: 1 });
  });

  it("re-import is a no-op: adds nothing, resets nothing (FR-002/SC-004)", async () => {
    await importCsv(db, csv(ROW_ACME), "day1.csv");
    const pkg = await ReviewPackageRepo.getNext(db);
    await ReviewPackageRepo.recordDecision(db, pkg!.id, "approved");

    const second = await importCsv(db, csv(ROW_ACME), "day1.csv");
    expect(second).toMatchObject({ rowsRead: 1, added: 0, duplicates: 1 });

    const after = await ReviewPackageRepo.getById(db, pkg!.id);
    expect(after?.decision).toBe("approved"); // decision untouched
    expect((await ReviewPackageRepo.getCounts(db)).total).toBe(1);
  });

  it("mixed file: only new prospects added, existing decisions untouched", async () => {
    await importCsv(db, csv(ROW_ACME), "day1.csv");
    const row2 = ROW_ACME.replaceAll("Acme Co", "Beta LLC").replaceAll("Jane", "Bob");
    const summary = await importCsv(db, csv(ROW_ACME, row2), "day2.csv");
    expect(summary).toMatchObject({ added: 1, duplicates: 1 });
    expect((await ReviewPackageRepo.getCounts(db)).total).toBe(2);
  });

  describe("all-duplicates collision warn (D10)", () => {
    afterEach(() => vi.restoreAllMocks());

    it("warns when rowsRead>0, added==0, duplicates>0", async () => {
      const warn = vi.spyOn(logger, "warn");
      await importCsv(db, csv(ROW_ACME), "day1.csv");
      warn.mockClear();
      await importCsv(db, csv(ROW_ACME), "day2.csv"); // same company again
      expect(warn).toHaveBeenCalledWith("review_import_all_duplicates", {
        sourceName: "day2.csv",
        rowsRead: 1,
        duplicates: 1,
      });
    });

    it("does not warn when anything was added or the file was empty", async () => {
      const warn = vi.spyOn(logger, "warn");
      await importCsv(db, csv(ROW_ACME), "day1.csv"); // added=1
      await importCsv(db, HEADER + "\n", "empty.csv"); // rowsRead=0
      expect(warn).not.toHaveBeenCalledWith(
        "review_import_all_duplicates",
        expect.anything(),
      );
    });
  });
});
