/**
 * Shared CSV helpers (M002, specs/002-operator-review-dashboard).
 *
 * Extracted verbatim from scripts/first-100.ts so the review-dashboard
 * importer and the first-100 operator workflow parse/serialize CSV with
 * the exact same rules. first-100.ts re-exports these, so its existing
 * unit tests pin the behavior of this module unchanged.
 */

/** Split raw CSV text into rows of fields, honoring quotes and escaped quotes. */
export function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
      continue;
    }
    if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((f) => f.trim() !== ""));
}

export function csvEscape(field: string): string {
  return /[",\n\r]/.test(field) ? `"${field.replaceAll('"', '""')}"` : field;
}
