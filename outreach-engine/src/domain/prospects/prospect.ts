/**
 * Prospect repository (T006, data-model.md Prospect entity).
 */

import { randomUUID } from "node:crypto";
import type { Db } from "@/db/client.js";

export type OutcomeStatus =
  | "not_yet_sent"
  | "sent"
  | "replied"
  | "call_booked"
  | "closed"
  | "unresponsive";

export interface Prospect {
  id: string;
  businessName: string;
  sourceUrl: string;
  normalizedDomain: string;
  firstProcessedAt: string;
  currentOutcomeStatus: OutcomeStatus;
  attemptCount: number;
}

interface ProspectRow {
  id: string;
  business_name: string;
  source_url: string;
  normalized_domain: string;
  first_processed_at: string;
  current_outcome_status: OutcomeStatus;
  attempt_count: number;
}

function fromRow(row: ProspectRow): Prospect {
  return {
    id: row.id,
    businessName: row.business_name,
    sourceUrl: row.source_url,
    normalizedDomain: row.normalized_domain,
    firstProcessedAt: row.first_processed_at,
    currentOutcomeStatus: row.current_outcome_status,
    attemptCount: row.attempt_count,
  };
}

export async function findByNormalizedDomain(
  db: Db,
  normalizedDomain: string,
): Promise<Prospect | null> {
  const result = await db.query<ProspectRow>(
    `SELECT * FROM prospects WHERE normalized_domain = $1`,
    [normalizedDomain],
  );
  return result.rows[0] ? fromRow(result.rows[0]) : null;
}

export async function getById(db: Db, id: string): Promise<Prospect | null> {
  const result = await db.query<ProspectRow>(
    `SELECT * FROM prospects WHERE id = $1`,
    [id],
  );
  return result.rows[0] ? fromRow(result.rows[0]) : null;
}

export async function create(
  db: Db,
  input: { businessName: string; sourceUrl: string; normalizedDomain: string },
): Promise<Prospect> {
  const id = randomUUID();
  const result = await db.query<ProspectRow>(
    `INSERT INTO prospects (id, business_name, source_url, normalized_domain)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id, input.businessName, input.sourceUrl, input.normalizedDomain],
  );
  return fromRow(result.rows[0]!);
}

export async function setOutcomeStatus(
  db: Db,
  prospectId: string,
  status: OutcomeStatus,
): Promise<void> {
  await db.query(
    `UPDATE prospects SET current_outcome_status = $2 WHERE id = $1`,
    [prospectId, status],
  );
}
