import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CaseStudies from "./CaseStudies";
import { siteContent } from "@/content/site";

// Coverage for the RTL arrow-mirroring fix: directional glyphs are wrapped in
// an aria-hidden span that flips horizontally under RTL (rtl:-scale-x-100), so
// "→" visually points the reading direction in Persian/Arabic and is not
// announced twice by screen readers.

const t = siteContent.en.caseStudies;

describe("CaseStudies more-link arrow", () => {
  it("renders the directional arrow as a mirrored, aria-hidden glyph", () => {
    render(<CaseStudies t={t} more={{ label: "See all work", href: "/work" }} />);

    const arrow = screen.getByText("→");
    expect(arrow).toHaveAttribute("aria-hidden", "true");
    expect(arrow).toHaveClass("rtl:-scale-x-100");
  });

  it("keeps the more-link href and label intact", () => {
    render(<CaseStudies t={t} more={{ label: "See all work", href: "/work" }} />);

    const link = screen.getByRole("link", { name: /See all work/ });
    expect(link).toHaveAttribute("href", "/work");
  });

  it("omits the more-link when no destination is given", () => {
    render(<CaseStudies t={t} />);
    expect(screen.queryByText("→")).toBeNull();
  });
});
