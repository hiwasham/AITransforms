/**
 * Deliverable-integrity mechanical check (Q002, gate G3 — spec 001
 * Amendment 1, FR-029/SC-010). Deterministic, no LLM call, same
 * philosophy as mechanical-checks.ts (Constitution Principle IX).
 *
 * A message MUST NOT assert the existence of an asset that does not
 * exist at package time. Concretely (the defect class D1 that poisoned
 * 5/5 of the first real batch):
 *
 *   (a) The text claims a video/recording/clip exists ("I made you a
 *       short personal video", "watch it here") while the package's
 *       video field is empty or still a `<<paste …>>` placeholder.
 *   (b) Text presented as FINAL (approve/send time) still carries an
 *       unresolved `{{BFV_LINK}}` or `<<…>>` marker. At generation time
 *       the `{{BFV_LINK}}` marker is explicitly permitted in stored
 *       message text (FR-029) — pass `finalText: true` only where the
 *       text is what would actually be sent.
 *
 * Scope note: FR-029 covers "any asset"; this mechanical layer detects
 * video/recording claims — the observed, deterministic-detectable case.
 * Claims about the Telegram bot are backed by the provisioned deep link
 * and are the LLM-judge's territory (Q1/FR-031), not this check's.
 */

/** Phrases that assert a video/recording asset already exists. */
const VIDEO_CLAIM_PATTERNS: RegExp[] = [
  // "I made you a short personal video", "I recorded a quick clip",
  // "I created a 30-second screen recording for you"
  /\bI(?:'ve| have)? (?:made|created|recorded|filmed|prepared)\b[^.!?]{0,60}\b(?:video|clip|recording|loom)\b/i,
  // "watch it here", "watch this here" — presupposes the watchable thing exists
  /\bwatch (?:it|this) here\b/i,
  // "here is a (quick) screen-recording / video of ..."
  /\bhere(?:'s| is) a\b[^.!?]{0,40}\b(?:video|clip|screen[- ]recording|loom)\b/i,
];

/** True when the video field holds a real, usable URL (not a placeholder). */
export function hasRealVideoUrl(videoUrl: string | null | undefined): boolean {
  if (!videoUrl) return false;
  const trimmed = videoUrl.trim();
  if (trimmed.includes("<<") || trimmed.includes(">>")) return false;
  return /^https?:\/\//i.test(trimmed);
}

export function findVideoClaims(messageText: string): string[] {
  const claims: string[] = [];
  for (const pattern of VIDEO_CLAIM_PATTERNS) {
    const match = messageText.match(pattern);
    if (match) claims.push(match[0]);
  }
  return claims;
}

/** Unresolved substitution markers: `{{BFV_LINK}}` (or any `{{…}}`) and `<<…>>`. */
export function findUnresolvedMarkers(text: string): string[] {
  return text.match(/\{\{[^}]*\}\}|<<[^>]*>>/g) ?? [];
}

export interface DeliverableIntegrityInput {
  messageText: string;
  /** The package's video link field: real URL, `<<paste …>>` placeholder, or empty. */
  videoUrl: string | null | undefined;
  /** True when messageText is presented as final send text (approve/send time). */
  finalText?: boolean;
}

export interface DeliverableIntegrityResult {
  pass: boolean;
  /** Human-readable failure reasons; non-empty exactly when pass is false. */
  failures: string[];
}

export function checkDeliverableIntegrity(
  input: DeliverableIntegrityInput,
): DeliverableIntegrityResult {
  const failures: string[] = [];

  if (!hasRealVideoUrl(input.videoUrl)) {
    for (const claim of findVideoClaims(input.messageText)) {
      failures.push(
        `Message claims a video exists ("${claim}") but no real video URL is attached (FR-029/D1).`,
      );
    }
  }

  if (input.finalText) {
    const markers = findUnresolvedMarkers(input.messageText);
    if (markers.length > 0) {
      failures.push(
        `Final text still contains unresolved marker(s): ${markers.join(", ")} (FR-029).`,
      );
    }
  }

  return { pass: failures.length === 0, failures };
}
