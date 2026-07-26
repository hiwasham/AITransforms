import { describe, expect, it } from "vitest";
import {
  fleschKincaidGrade,
  findJargonTerms,
  findSpeculationTerms,
  checkStructure,
  runMechanicalChecks,
} from "@/domain/linter/mechanical-checks.js";
import { GOLDEN_REJECTS } from "../fixtures/golden-rejects.js";

describe("linter mechanical checks (T020)", () => {
  it("scores simple text at a low grade level", () => {
    const simple = "I saw your shop. You sell hats. I made a bot. Try it. Want to test it?";
    expect(fleschKincaidGrade(simple)).toBeLessThanOrEqual(4);
  });

  it("scores complex, jargon-heavy text at a high grade level", () => {
    const complex =
      "Notwithstanding the aforementioned considerations, our organizational " +
      "framework necessitates a comprehensive reevaluation of foundational " +
      "methodologies underpinning contemporary operational paradigms.";
    expect(fleschKincaidGrade(complex)).toBeGreaterThan(4);
  });

  it("finds jargon terms and reports which ones", () => {
    const text = "Let's leverage synergy to unlock value and circle back later.";
    const found = findJargonTerms(text);
    expect(found).toContain("leverage");
    expect(found).toContain("synergy");
    expect(found).toContain("unlock value");
    expect(found).toContain("circle back");
  });

  it("passes clean text with zero jargon matches", () => {
    expect(findJargonTerms("I built a small tool for your shop.")).toEqual([]);
  });

  it("finds speculation markers and reports which ones (Q003/FR-031)", () => {
    const found = findSpeculationTerms(
      "I bet your team gets asked a lot. They must spend hours. It's probably rough.",
    );
    expect(found).toContain("i bet");
    expect(found).toContain("must spend");
    expect(found).toContain("probably");
  });

  it("passes evidence-grounded text with zero speculation matches", () => {
    expect(
      findSpeculationTerms("Your FAQ page lists 40 questions about shipping."),
    ).toEqual([]);
  });

  it("flags speculation in the golden rejects that carry defect D2/D5 framing", () => {
    // Mozilla ("must spend hours"), Basecamp ("I bet"), Sivers ("I bet") —
    // the speculative-pain rejects from the first real batch.
    const speculative = GOLDEN_REJECTS.filter((r) =>
      ["Mozilla", "Basecamp", "Sivers"].includes(r.company),
    );
    expect(speculative).toHaveLength(3);
    for (const reject of speculative) {
      expect(
        findSpeculationTerms(reject.message),
        `${reject.company} must be flagged`,
      ).not.toHaveLength(0);
    }
  });

  it("detects Hook->Pain->BFVLink->Ask structure when the link sits in the middle", () => {
    const good =
      "Hey Sam, I saw your bakery online. Your team handles a lot of orders by hand. " +
      "I built a bot for you: https://t.me/samplebot?start=abc123. " +
      "Want to try it out?";
    expect(checkStructure(good)).toBe(true);
  });

  it("fails structure when there is no BFV link at all", () => {
    const noLink = "Hey Sam, I saw your bakery online. Your team handles orders by hand. Want to chat?";
    expect(checkStructure(noLink)).toBe(false);
  });

  it("fails structure when the link appears with no hook/pain lead-in", () => {
    const noLeadIn = "https://t.me/samplebot?start=abc123";
    expect(checkStructure(noLeadIn)).toBe(false);
  });

  it("runMechanicalChecks combines all three sub-checks", () => {
    const passing =
      "Hey Sam, I saw your bakery site. Your team seems busy with orders. " +
      "I made a small bot from your site: https://t.me/samplebot?start=abc123. " +
      "Want to try it?";
    const result = runMechanicalChecks(passing);
    expect(result.readingLevelPass).toBe(true);
    expect(result.jargonPass).toBe(true);
    expect(result.speculationPass).toBe(true);
    expect(result.structurePass).toBe(true);
  });

  it("runMechanicalChecks fails speculationPass on guessed pain (Q003)", () => {
    const speculative =
      "Hey Sam, I saw your bakery. I bet your team must spend hours on orders. " +
      "I made a bot: https://t.me/samplebot?start=abc123. Want to try it?";
    const result = runMechanicalChecks(speculative);
    expect(result.speculationPass).toBe(false);
    expect(result.speculationTermsFound).toContain("i bet");
  });

  it("runMechanicalChecks flags a failing script on every axis", () => {
    const failing =
      "Notwithstanding the aforementioned synergistic considerations, we leverage " +
      "comprehensive methodologies to unlock value across your organizational framework.";
    const result = runMechanicalChecks(failing);
    expect(result.readingLevelPass).toBe(false);
    expect(result.jargonPass).toBe(false);
    expect(result.structurePass).toBe(false);
  });
});
