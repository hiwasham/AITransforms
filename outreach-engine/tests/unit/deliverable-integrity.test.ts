/**
 * Q002 (gate G3, FR-029/SC-010): deliverable-integrity mechanical check.
 * The 5 golden rejects are the ground-truth fail fixtures — every one
 * carried the false "I made you a short personal video" claim with a
 * placeholder video field (defect D1, 5/5 of the first real batch).
 */

import { describe, expect, it } from "vitest";
import {
  checkDeliverableIntegrity,
  findVideoClaims,
  findUnresolvedMarkers,
  hasRealVideoUrl,
} from "@/domain/linter/deliverable-integrity.js";
import { GOLDEN_REJECTS } from "../fixtures/golden-rejects.js";

describe("hasRealVideoUrl", () => {
  it("rejects placeholders, empties, and non-URLs", () => {
    expect(hasRealVideoUrl("<<paste video link for Acme>>")).toBe(false);
    expect(hasRealVideoUrl("")).toBe(false);
    expect(hasRealVideoUrl(null)).toBe(false);
    expect(hasRealVideoUrl(undefined)).toBe(false);
    expect(hasRealVideoUrl("coming soon")).toBe(false);
  });

  it("accepts a real URL", () => {
    expect(hasRealVideoUrl("https://www.loom.com/share/abc123")).toBe(true);
  });
});

describe("findVideoClaims", () => {
  it("catches the appended CTA that poisoned the first batch", () => {
    expect(
      findVideoClaims("I made you a short personal video. Watch it here: {{BFV_LINK}}"),
    ).not.toHaveLength(0);
  });

  it("catches 'here is a quick screen-recording' phrasing", () => {
    expect(
      findVideoClaims("Here is a quick 30-second screen-recording of the bot."),
    ).not.toHaveLength(0);
  });

  it("does not flag messages that merely OFFER a video", () => {
    expect(findVideoClaims("Can I show you how in a quick video?")).toHaveLength(0);
    expect(findVideoClaims("Want to see a quick video of how it works?")).toHaveLength(0);
  });
});

describe("findUnresolvedMarkers", () => {
  it("finds {{BFV_LINK}} and <<paste>> markers", () => {
    expect(findUnresolvedMarkers("go {{BFV_LINK}} and <<paste video link>>")).toEqual([
      "{{BFV_LINK}}",
      "<<paste video link>>",
    ]);
  });

  it("returns empty on clean text", () => {
    expect(findUnresolvedMarkers("all substituted: https://t.me/b?start=x")).toEqual([]);
  });
});

describe("checkDeliverableIntegrity", () => {
  it("FAILS all 5 golden rejects (SC-009 regression floor)", () => {
    for (const reject of GOLDEN_REJECTS) {
      const result = checkDeliverableIntegrity({
        messageText: reject.message,
        videoUrl: reject.videoUrl,
      });
      expect(result.pass, `${reject.company} must fail`).toBe(false);
      expect(result.failures.length).toBeGreaterThan(0);
    }
  });

  it("passes a video claim when a real video URL is attached", () => {
    const result = checkDeliverableIntegrity({
      messageText: "I made you a short video. Watch it here: {{BFV_LINK}}",
      videoUrl: "https://www.loom.com/share/abc123",
    });
    expect(result.pass).toBe(true);
  });

  it("passes an offer-only message with no video attached (generation time)", () => {
    const result = checkDeliverableIntegrity({
      messageText:
        "Hi Sam, I saw your bakery takes phone orders. I built a bot from your site. " +
        "Try it here: {{BFV_LINK}}. Want to see how it handles a real order?",
      videoUrl: "<<paste video link for Acme>>",
    });
    expect(result.pass).toBe(true); // marker allowed in stored text (FR-029)
  });

  it("fails final text with an unresolved marker even without a video claim", () => {
    const result = checkDeliverableIntegrity({
      messageText: "Try the bot here: {{BFV_LINK}}. Worth a look?",
      videoUrl: null,
      finalText: true,
    });
    expect(result.pass).toBe(false);
    expect(result.failures[0]).toMatch(/\{\{BFV_LINK\}\}/);
  });

  it("passes fully substituted final text", () => {
    const result = checkDeliverableIntegrity({
      messageText: "Try the bot here: https://t.me/b?start=x. Worth a look?",
      videoUrl: null,
      finalText: true,
    });
    expect(result.pass).toBe(true);
  });
});
