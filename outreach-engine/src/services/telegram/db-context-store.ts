/**
 * Durable DB-backed BFVContextStore (T112, FR-004/FR-017).
 *
 * The pipeline already persists everything a context needs: the deep-link
 * token and context_ref in bfv_deliverables (BFVRepo.create) and the
 * prospect's extracted facts in scraped_site_snapshots. This store reads
 * those rows back, so an already-dispatched deep link survives a
 * bot-process restart instead of orphaning every provisioned context the
 * way InMemoryBFVContextStore does.
 *
 * put() deliberately does NOT write those tables: they are owned by
 * domain/pipeline, and both carry UNIQUE(outreach_attempt_id), so a second
 * writer here would collide with BFVRepo.create/SnapshotRepo.create. put()
 * only keeps an in-process overlay covering the window between
 * provisionContext() returning and the pipeline persisting the row —
 * durability comes from the database fallback, never the overlay.
 *
 * Boundary note: this adapter receives the Db handle by injection and runs
 * read-only lookups over domain-owned tables; it never imports domain/.
 */

import type { Db } from "@/db/client.js";
import type {
  BFVContext,
  BFVContextStore,
} from "./telegram-bfv-bot-client.js";

interface ContextRow {
  context_ref: string;
  telegram_deep_link_token: string;
  outreach_attempt_id: string;
  extracted_facts: Record<string, unknown> | null;
}

function fromRow(row: ContextRow): BFVContext {
  return {
    contextRef: row.context_ref,
    telegramDeepLinkToken: row.telegram_deep_link_token,
    outreachAttemptId: row.outreach_attempt_id,
    extractedFacts: row.extracted_facts ?? {},
  };
}

const SELECT_CONTEXT = `
  SELECT b.context_ref,
         b.telegram_deep_link_token,
         b.outreach_attempt_id,
         s.extracted_facts
  FROM bfv_deliverables b
  LEFT JOIN scraped_site_snapshots s
    ON s.outreach_attempt_id = b.outreach_attempt_id`;

export class DbBFVContextStore implements BFVContextStore {
  /** Pre-persist overlay only — see the header comment. */
  private readonly byRef = new Map<string, BFVContext>();
  private readonly byToken = new Map<string, BFVContext>();

  constructor(private readonly db: Db) {}

  async put(context: BFVContext): Promise<void> {
    this.byRef.set(context.contextRef, context);
    this.byToken.set(context.telegramDeepLinkToken, context);
  }

  async getByRef(contextRef: string): Promise<BFVContext | null> {
    const cached = this.byRef.get(contextRef);
    if (cached) return cached;
    const result = await this.db.query<ContextRow>(
      `${SELECT_CONTEXT} WHERE b.context_ref = $1`,
      [contextRef],
    );
    return result.rows[0] ? fromRow(result.rows[0]) : null;
  }

  async getByToken(token: string): Promise<BFVContext | null> {
    const cached = this.byToken.get(token);
    if (cached) return cached;
    const result = await this.db.query<ContextRow>(
      `${SELECT_CONTEXT} WHERE b.telegram_deep_link_token = $1`,
      [token],
    );
    return result.rows[0] ? fromRow(result.rows[0]) : null;
  }
}
