/**
 * URL normalization (T008 is Phase 2 for the full FR-007 dedup guarantee
 * — redirect resolution, trivial-variant resilience across the whole
 * history table. This is the minimal normalization MVP-1's schema needs
 * (normalized_domain is NOT NULL UNIQUE): lowercase, strip protocol,
 * strip a leading "www.", strip a trailing slash. No redirect-following,
 * no fuzzy matching — those are the Phase 2 additions.
 */
export function normalizeUrl(rawUrl: string): string {
  let s = rawUrl.trim().toLowerCase();
  s = s.replace(/^https?:\/\//, "");
  s = s.replace(/^www\./, "");
  s = s.replace(/\/+$/, "");
  return s;
}
