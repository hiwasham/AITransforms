/**
 * ScrapedSiteSnapshot entity (T034, data-model.md).
 */

import { randomUUID } from "node:crypto";
import type { Db } from "@/db/client.js";
import type { ScrapeStatus } from "@/services/scraper/scraper-client.js";

export interface ScrapedSiteSnapshot {
  id: string;
  outreachAttemptId: string;
  scrapedAt: string;
  status: ScrapeStatus;
  rawContentRef: string | null;
  extractedFacts: Record<string, unknown> | null;
}

interface SnapshotRow {
  id: string;
  outreach_attempt_id: string;
  scraped_at: string;
  status: ScrapeStatus;
  raw_content_ref: string | null;
  extracted_facts: Record<string, unknown> | null;
}

function fromRow(row: SnapshotRow): ScrapedSiteSnapshot {
  return {
    id: row.id,
    outreachAttemptId: row.outreach_attempt_id,
    scrapedAt: row.scraped_at,
    status: row.status,
    rawContentRef: row.raw_content_ref,
    extractedFacts: row.extracted_facts,
  };
}

export async function create(
  db: Db,
  input: {
    outreachAttemptId: string;
    status: ScrapeStatus;
    rawContent: string | null;
    extractedFacts: Record<string, unknown> | null;
  },
): Promise<ScrapedSiteSnapshot> {
  const id = randomUUID();
  const result = await db.query<SnapshotRow>(
    `INSERT INTO scraped_site_snapshots
       (id, outreach_attempt_id, status, raw_content_ref, extracted_facts)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      id,
      input.outreachAttemptId,
      input.status,
      input.rawContent,
      input.extractedFacts ? JSON.stringify(input.extractedFacts) : null,
    ],
  );
  return fromRow(result.rows[0]!);
}

export async function getByAttemptId(
  db: Db,
  outreachAttemptId: string,
): Promise<ScrapedSiteSnapshot | null> {
  const result = await db.query<SnapshotRow>(
    `SELECT * FROM scraped_site_snapshots WHERE outreach_attempt_id = $1`,
    [outreachAttemptId],
  );
  return result.rows[0] ? fromRow(result.rows[0]) : null;
}
