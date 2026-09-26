import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import WorkIndexShell from "./WorkIndexShell";
import { listWorkProjects } from "@/content/work";

const projectCount = listWorkProjects("en").length;

// Coverage for the RTL arrow-mirroring fix on the /work index "view case"
// links: each project card's directional glyph is wrapped in an aria-hidden
// span that flips horizontally under RTL (rtl:-scale-x-100), so "→" points the
// reading direction in Persian/Arabic and is not announced by screen readers.

describe("WorkIndexShell view-case arrows", () => {
  it("renders every card arrow as a mirrored, aria-hidden glyph", () => {
    render(<WorkIndexShell locale="en" />);

    const arrows = screen.getAllByText("→");
    // At least one "view case" arrow per project card (a delta metric may add
    // its own mirrored arrow, so assert the lower bound, not an exact count).
    expect(arrows.length).toBeGreaterThanOrEqual(projectCount);
    // Every directional glyph rendered must be mirrored and screen-reader-hidden.
    for (const arrow of arrows) {
      expect(arrow).toHaveAttribute("aria-hidden", "true");
      expect(arrow).toHaveClass("rtl:-scale-x-100");
    }
  });
});
