/**
 * Schema durability for the Q011 rejection_reason column (specs/002 D5,
 * T-004). Two guarantees:
 *   1. Re-applying the schema over an existing persistent datadir is
 *      idempotent — the ALTER ... ADD COLUMN IF NOT EXISTS does not error
 *      on the second boot, and previously-written rows (including a
 *      rejection tag) survive intact (Codex #12/#14).
 *   2. The CHECK constraint rejects an out-of-enum value; NULL is allowed
 *      (untagged rejections and every non-rejected row).
 */

import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { createDb, type Db } from "@/db/client.js";
import * as Repo from "@/domain/review/review-package.js";

const dirs: string[] = [];
const tmp = () => {
  const d = mkdtempSync(join(tmpdir(), "review-schema-"));
  dirs.push(d);
  return d;
};

afterEach(() => {
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
});

async function seedRejectedTagged(db: Db): Promise<string> {
  const pkg = await Repo.create(db, {
    dedupKey: randomUUID(),
    sourceName: "durable.csv",
    company: "Durable Co",
    contact: null,
    researchSummary: "s",
    painPoint: "p",
    messageBody: "m",
    bfvLinkTelegram: "https://t.me/b?start=1",
    videoUrl: null,
    generatorFlag: null,
  });
  await Repo.recordDecision(db, pkg!.id, "rejected");
  await Repo.setRejectionReason(db, pkg!.id, "bad_fit");
  return pkg!.id;
}

describe("review_packages rejection_reason schema (D5)", () => {
  it("migrates a pre-Q011 persistent review table without losing its rows", async () => {
    const dir = tmp();
    const legacy = new PGlite(dir);
    await legacy.exec(`
      CREATE TABLE review_packages (
        id TEXT PRIMARY KEY,
        dedup_key TEXT NOT NULL UNIQUE,
        source TEXT NOT NULL DEFAULT 'first100_csv',
        source_name TEXT NOT NULL,
        position INTEGER NOT NULL,
        company TEXT NOT NULL,
        contact TEXT,
        research_summary TEXT NOT NULL DEFAULT '',
        pain_point TEXT NOT NULL DEFAULT '',
        message_body TEXT NOT NULL DEFAULT '',
        bfv_link_telegram TEXT NOT NULL DEFAULT '',
        video_url TEXT,
        generator_flag TEXT,
        decision TEXT NOT NULL DEFAULT 'pending'
          CHECK (decision IN ('pending', 'approved', 'rejected')),
        decided_at TIMESTAMPTZ,
        passed_over_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      INSERT INTO review_packages (
        id, dedup_key, source_name, position, company, message_body,
        bfv_link_telegram
      ) VALUES (
        'legacy-package', 'legacy-dedup', 'legacy.csv', 1, 'Legacy Co',
        'Legacy message', 'https://t.me/example?start=legacy'
      );
    `);
    await legacy.close();

    const migrated = await createDb(dir);
    const pkg = await Repo.getById(migrated, "legacy-package");
    expect(pkg).toMatchObject({
      company: "Legacy Co",
      messageBody: "Legacy message",
      rejectionReason: null,
    });
    await migrated.close();
  });

  it("survives a datadir reopen; the second schema apply is a no-op", async () => {
    const dir = tmp();

    const db1 = await createDb(dir);
    const id = await seedRejectedTagged(db1);
    await (db1 as unknown as { close: () => Promise<void> }).close();

    // Reopen = restarted process; applySchema runs again over the file.
    const db2 = await createDb(dir);
    const reloaded = await Repo.getById(db2, id);
    expect(reloaded).not.toBeNull();
    expect(reloaded!.decision).toBe("rejected");
    expect(reloaded!.rejectionReason).toBe("bad_fit");
    await (db2 as unknown as { close: () => Promise<void> }).close();
  });

  it("CHECK rejects an out-of-enum reason but allows NULL", async () => {
    const db = await createDb();
    const pkg = await Repo.create(db, {
      dedupKey: randomUUID(),
      sourceName: "chk.csv",
      company: "Chk Co",
      contact: null,
      researchSummary: "s",
      painPoint: "p",
      messageBody: "m",
      bfvLinkTelegram: "https://t.me/b?start=2",
      videoUrl: null,
      generatorFlag: null,
    });
    // NULL rejection_reason is fine (default on a fresh row).
    expect(pkg!.rejectionReason).toBeNull();
    // A raw out-of-enum write must be refused by the CHECK.
    await expect(
      db.query(
        `UPDATE review_packages SET rejection_reason = 'nonsense' WHERE id = $1`,
        [pkg!.id],
      ),
    ).rejects.toThrow();
  });
});
