/**
 * Scraper service (T034). Fetches a prospect's website and extracts
 * plain-text content for personalization. Respects `robots.txt` (plan.md
 * Security Considerations — Scraper conduct).
 *
 * Uses Node's built-in fetch — no HTML-parsing dependency: a lightweight
 * regex-based tag-stripper is enough for FAQ/body-text extraction at this
 * scale (Constitution Principle III, avoid unnecessary dependencies).
 */

export type ScrapeStatus = "complete" | "insufficient" | "unreachable";

export interface ScrapeResult {
  status: ScrapeStatus;
  rawContent: string | null;
  extractedFacts: Record<string, unknown> | null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

async function isAllowedByRobots(url: string): Promise<boolean> {
  try {
    const target = new URL(url);
    const robotsUrl = `${target.protocol}//${target.host}/robots.txt`;
    const res = await fetch(robotsUrl, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return true; // no robots.txt (or unreadable) => allowed by default
    const body = await res.text();
    const lines = body.split("\n").map((l) => l.trim());
    let applies = false;
    for (const line of lines) {
      if (/^user-agent:\s*\*/i.test(line)) applies = true;
      else if (/^user-agent:/i.test(line)) applies = false;
      else if (applies && /^disallow:\s*\/$/i.test(line)) return false;
    }
    return true;
  } catch {
    return true; // fail open on robots.txt fetch errors — don't block the batch on an unrelated network hiccup
  }
}

function extractFacts(text: string): Record<string, unknown> {
  // Minimal heuristic extraction for MVP-1: surface a short excerpt and
  // any FAQ-like sentences. Real NLP-based extraction is Phase 2/Future.
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);
  const faqLike = sentences.filter((s) => /\?/.test(s)).slice(0, 5);
  return {
    excerpt: sentences.slice(0, 5).join(" "),
    faqLike,
    sentenceCount: sentences.length,
  };
}

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  const allowed = await isAllowedByRobots(url);
  if (!allowed) {
    return { status: "unreachable", rawContent: null, extractedFacts: null };
  }

  let html: string;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      return { status: "unreachable", rawContent: null, extractedFacts: null };
    }
    html = await res.text();
  } catch {
    return { status: "unreachable", rawContent: null, extractedFacts: null };
  }

  const text = stripHtml(html);
  if (text.length < 40) {
    return { status: "insufficient", rawContent: text, extractedFacts: null };
  }

  return {
    status: "complete",
    rawContent: text,
    extractedFacts: extractFacts(text),
  };
}
