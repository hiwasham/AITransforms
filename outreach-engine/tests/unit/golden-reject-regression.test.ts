/**
 * Q004 (gate G5, FR-032/SC-009): the golden-set regression floor.
 *
 * The 5 operator-rejected messages from the first real batch
 * (resources/golden-reject-set-2026-07-16.md) MUST fail the combined
 * mechanical quality gates — deliverable integrity (Q002) plus the
 * mechanical checks with the speculation deny-list (Q003). Any gate
 * change that lets one pass is a regression, regardless of other
 * improvements. This is the permanent strictness pin.
 */

import { describe, expect, it } from "vitest";
import { checkDeliverableIntegrity } from "@/domain/linter/deliverable-integrity.js";
import { runMechanicalChecks } from "@/domain/linter/mechanical-checks.js";
import { GOLDEN_REJECTS } from "../fixtures/golden-rejects.js";
import { buildPackagePrompt } from "../../scripts/first-100.js";

/** The combined mechanical gate verdict as the pipeline applies it. */
function combinedGatesPass(message: string, videoUrl: string): boolean {
  const integrity = checkDeliverableIntegrity({ messageText: message, videoUrl });
  const mechanical = runMechanicalChecks(message);
  return (
    integrity.pass &&
    mechanical.readingLevelPass &&
    mechanical.jargonPass &&
    mechanical.speculationPass
  );
}

describe("golden reject regression (SC-009)", () => {
  it("has all 5 rejects on file", () => {
    expect(GOLDEN_REJECTS).toHaveLength(5);
  });

  for (const reject of GOLDEN_REJECTS) {
    it(`FAILS the golden reject: ${reject.company} (${reject.defects.join(",")})`, () => {
      expect(combinedGatesPass(reject.message, reject.videoUrl)).toBe(false);
    });
  }

  it("still PASSES a message meeting the standard (gates not over-tightened)", () => {
    const good =
      "Hey Sam, I saw your FAQ page answers 40 questions about shipping. " +
      "Handling those one by one takes real time. " +
      "I built a custom AI trained only on your website's data. " +
      "Try to break it here: {{BFV_LINK}}. Open to testing it?";
    expect(combinedGatesPass(good, "<<paste video link for Acme>>")).toBe(true);
  });
});

describe("generation prompt exemplars (FR-032)", () => {
  it("carries the positive standard and the rejected negatives", () => {
    const prompt = buildPackagePrompt(
      { prospect: "Sam", company: "Acme", url: "https://acme.test" },
      "{}",
    );
    expect(prompt).toMatch(/GOOD example/);
    expect(prompt).toMatch(/Try to break it here/); // Day 1 template standard
    expect(prompt).toMatch(/BAD example \(REJECTED/);
    expect(prompt).toMatch(/I made you a short personal video/); // D1 negative
    expect(prompt).toMatch(/I bet your team/); // D2 negative
  });
});
