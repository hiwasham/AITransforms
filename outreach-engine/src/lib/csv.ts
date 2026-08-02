/** CSV parser for the isolated review-dashboard importer (spec 002 M002). */

export interface CsvRow {
  fields: string[];
  rowNumber: number;
}

export interface CsvParseResult {
  rows: CsvRow[];
  malformed: { rowNumber: number; reason: string }[];
}

interface ParsedRecord {
  fields?: string[];
  error?: string;
  nextOffset: number;
  nextLine: number;
}

function afterPhysicalLine(text: string, offset: number, line: number): ParsedRecord {
  let i = offset;
  while (i < text.length && text[i] !== "\n" && text[i] !== "\r") i++;
  if (text[i] === "\r" && text[i + 1] === "\n") i++;
  return {
    error: "invalid quote syntax",
    nextOffset: i < text.length ? i + 1 : i,
    nextLine: i < text.length ? line + 1 : line,
  };
}

function parseRecord(text: string, offset: number, startLine: number): ParsedRecord {
  const fields: string[] = [];
  let field = "";
  let inQuotes = false;
  let afterQuote = false;
  let line = startLine;
  let firstQuotedBreak: { offset: number; line: number } | null = null;

  const invalidQuote = (at: number): ParsedRecord =>
    firstQuotedBreak
      ? {
          error: "unterminated quoted field",
          nextOffset: firstQuotedBreak.offset,
          nextLine: firstQuotedBreak.line,
        }
      : afterPhysicalLine(text, at, line);

  for (let i = offset; i < text.length; i++) {
    const c = text[i]!;
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
          afterQuote = true;
        }
      } else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        line++;
        field += "\n";
        firstQuotedBreak ??= { offset: i + 1, line };
      } else {
        field += c;
      }
      continue;
    }

    if (afterQuote) {
      if (c === ",") {
        fields.push(field);
        field = "";
        afterQuote = false;
      } else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        fields.push(field);
        return { fields, nextOffset: i + 1, nextLine: line + 1 };
      } else {
        return invalidQuote(i);
      }
      continue;
    }

    if (c === '"') {
      if (field !== "") return invalidQuote(i);
      inQuotes = true;
    } else if (c === ",") {
      fields.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      fields.push(field);
      return { fields, nextOffset: i + 1, nextLine: line + 1 };
    } else {
      field += c;
    }
  }

  if (inQuotes) {
    return {
      error: "unterminated quoted field",
      nextOffset: firstQuotedBreak?.offset ?? text.length,
      nextLine: firstQuotedBreak?.line ?? line,
    };
  }
  if (field !== "" || fields.length > 0 || afterQuote) fields.push(field);
  return { fields, nextOffset: text.length, nextLine: line };
}

/** Parse CSV records while retaining physical row numbers and recoverable quote errors. */
export function parseCsvRecords(text: string): CsvParseResult {
  const result: CsvParseResult = { rows: [], malformed: [] };
  let offset = 0;
  let line = 1;

  while (offset < text.length) {
    const rowNumber = line;
    const record = parseRecord(text, offset, line);
    if (record.error) {
      result.malformed.push({ rowNumber, reason: record.error });
    } else if (record.fields?.some((field) => field.trim() !== "")) {
      result.rows.push({ fields: record.fields, rowNumber });
    }
    if (record.nextOffset <= offset) break;
    offset = record.nextOffset;
    line = record.nextLine;
  }

  return result;
}
