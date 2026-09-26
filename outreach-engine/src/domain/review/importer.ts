/**
 * Review-package CSV importer (M005, specs/002-operator-review-dashboard
 * MVP-0). Parses the first-100 output CSV (scripts/first-100.ts column
 * shape) into review_packages rows.
 *
 * - Idempotent per prospect via dedup_key (FR-002): re-import adds
 *   nothing, resets nothing.
 * - Carries generator flags (FR-003): needs_research arrives flagged;
 *   source-approved rows arrive as approved decisions.
 * - A malformed row never aborts the import — skipped and reported by
 *   row number (spec Edge Cases). Summary is returned, not persisted
 *   (import history is deferred, plan §MVP-0 Build Scope).
 */

import type { Db } from "@/db/client.js";
import { parseCsvRecords } from "@/lib/csv.js";
import * as ReviewPackageRepo from "@/domain/review/review-package.js";
import { logger } from "@/lib/logger.js";

export interface ImportSummary {
  rowsRead: number;
  added: number;
  duplicates: number;
  malformed: { rowNumber: number; reason: string }[];
}

const EXPECTED_HEADER = [
  "prospect",
  "company",
  "research_summary",
  "pain_point",
  "bfv_link_telegram",
  "bfv_link_video",
  "personalized_message",
  "approval_status",
];

/** The generator's video-link placeholder (`<<paste video link for X>>`) is "no URL yet". */
function normalizeVideoUrl(raw: string): string | null {
  const v = raw.trim();
  if (!v || (v.startsWith("<<") && v.endsWith(">>"))) return null;
  return v;
}

/**
 * Dedup identity: company normalized + the telegram deep link's token
 * host-independent tail is NOT stable across regenerations, so identity
 * is company-based, matching how the operator thinks about "the same
 * prospect" across daily CSVs (spec 002 Key Entities).
 */
export function dedupKey(company: string, contact: string): string {
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  return `${norm(company)}|${norm(contact)}`;
}

function missingCompanyDedupKey(
  sourceIdentity: string,
  contact: string,
  fields: string[],
): string {
  const fallback = sourceIdentity || contact || fields.join("|");
  const identity = fallback.trim().toLowerCase().replace(/\s+/g, " ");
  return `missing-company|${identity}`;
}

export async function importCsv(
  db: Db,
  csvText: string,
  sourceName: string,
): Promise<ImportSummary> {
  const summary: ImportSummary = {
    rowsRead: 0,
    added: 0,
    duplicates: 0,
    malformed: [],
  };

  const parsed = parseCsvRecords(csvText);
  const headerRow = parsed.rows[0];
  const leadingParseErrors = parsed.malformed.filter(
    (error) => !headerRow || error.rowNumber < headerRow.rowNumber,
  );
  if (!headerRow || leadingParseErrors.length > 0) {
    summary.malformed.push(
      ...(leadingParseErrors.length > 0
        ? leadingParseErrors
        : [{ rowNumber: 1, reason: "missing header row" }]),
    );
    return summary;
  }

  const header = headerRow.fields.map((h) => h.trim().toLowerCase());
  const col = (name: string) => header.indexOf(name);
  const missing = EXPECTED_HEADER.filter(
    (h) => !["prospect", "bfv_link_video"].includes(h) && col(h) === -1,
  );
  if (missing.length > 0) {
    // Whole-file shape mismatch: report as row-1 malformed, import nothing.
    summary.malformed.push({
      rowNumber: 1,
      reason: `missing required column(s): ${missing.join(", ")}`,
    });
    return summary;
  }

  const dataParseErrors = parsed.malformed.filter(
    (error) => error.rowNumber > headerRow.rowNumber,
  );
  summary.rowsRead += dataParseErrors.length;
  summary.malformed.push(...dataParseErrors);

  const seenInFile = new Set<string>();
  for (const record of parsed.rows) {
    if (record === headerRow) continue;
    const row = record.fields;
    const rowNumber = record.rowNumber;
    summary.rowsRead++;

    if (row.length !== header.length) {
      summary.malformed.push({
        rowNumber,
        reason: `expected ${header.length} fields, got ${row.length}`,
      });
      continue;
    }

    const get = (name: string) => (col(name) === -1 ? "" : (row[col(name)] ?? "").trim());
    const importedCompany = get("company");
    const company = importedCompany || "(company missing)";
    const messageBody = get("personalized_message");

    const contact = get("prospect");
    const key = importedCompany
      ? dedupKey(company, contact)
      : missingCompanyDedupKey(
          get("bfv_link_telegram") || get("bfv_link_video"),
          contact,
          row,
        );
    if (seenInFile.has(key)) {
      summary.duplicates++;
      continue;
    }
    seenInFile.add(key);

    const sourceStatus = get("approval_status").toLowerCase();
    const generatorFlags = new Set<string>();
    if (sourceStatus && !["pending", "approved"].includes(sourceStatus)) {
      generatorFlags.add(sourceStatus);
    }
    if (!messageBody) generatorFlags.add("missing_message");
    if (!importedCompany) generatorFlags.add("missing_company");
    const created = await ReviewPackageRepo.create(db, {
      dedupKey: key,
      sourceName,
      company,
      contact: contact || null,
      researchSummary: get("research_summary"),
      painPoint: get("pain_point"),
      messageBody,
      bfvLinkTelegram: get("bfv_link_telegram"),
      videoUrl: normalizeVideoUrl(get("bfv_link_video")),
      // Anything that isn't a clean pending/approved is a generator flag
      // the operator must see (needs_research etc., FR-003 / US1 Sc.5).
      generatorFlag:
        generatorFlags.size > 0 ? [...generatorFlags].join(",") : null,
      decision: sourceStatus === "approved" ? "approved" : "pending",
    });

    if (created) summary.added++;
    else summary.duplicates++;
  }

  // D10: the all-duplicates collision signature (the D4 failure mode —
  // regenerating the same companies yields an already-full queue, so a
  // "fresh" import silently adds nothing). Harmless for a legitimate
  // re-import, but the Q007 fresh-10 cohort requires added>0, so surface
  // it. Logged, never thrown.
  if (summary.rowsRead > 0 && summary.added === 0 && summary.duplicates > 0) {
    logger.warn("review_import_all_duplicates", {
      sourceName,
      rowsRead: summary.rowsRead,
      duplicates: summary.duplicates,
    });
  }

  return summary;
}
