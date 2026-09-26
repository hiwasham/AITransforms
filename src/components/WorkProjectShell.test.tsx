import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import WorkProjectShell from "./WorkProjectShell";

// Coverage for the RTL arrow-mirroring fix on the case page "back to work"
// link: the leading "←" glyph is wrapped in an aria-hidden span that flips
// horizontally under RTL (rtl:-scale-x-100), so it points the reading
// direction in Persian/Arabic and is not announced by screen readers.

describe("WorkProjectShell back-to-work arrow", () => {
  it("renders the back arrow as a mirrored, aria-hidden glyph", () => {
    render(<WorkProjectShell locale="en" slug="support-transformation" />);

    const arrow = screen.getByText("←");
    expect(arrow).toHaveAttribute("aria-hidden", "true");
    expect(arrow).toHaveClass("rtl:-scale-x-100");
  });
});
