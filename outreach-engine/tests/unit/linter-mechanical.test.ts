import { describe, expect, it } from "vitest";
import {
  fleschKincaidGrade,
  findJargonTerms,
  checkStructure,
  runMechanicalChecks,
} from "@/domain/linter/mechanical-checks.js";

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
    expect(result.structurePass).toBe(true);
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
