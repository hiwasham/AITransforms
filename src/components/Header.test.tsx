import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Header from "./Header";
import { siteContent, type SiteContent } from "@/content/site";

// Regression coverage for ISSUE-001: section anchors in the header must point
// at the locale homepage, not resolve relative to the current path. When the
// header renders on a /work page, a bare "#services" became "/work#services"
// (a dead link). The fix anchors them absolutely via homeHref.

function hrefOf(label: string): string | null {
  return screen.getByRole("link", { name: label }).getAttribute("href");
}

describe("Header nav links", () => {
  it("anchors section links to the root homepage on the English locale", () => {
    const nav = siteContent.en.nav;
    render(<Header nav={nav} currentLocale="en" />);
    expect(hrefOf(nav.services)).toBe("/#services");
    expect(hrefOf(nav.process)).toBe("/#process");
    expect(hrefOf(nav.contact)).toBe("/#contact");
    // /work is a real route, not an anchor — no leading "//work".
    expect(hrefOf(nav.work)).toBe("/work");
  });

  it("anchors section links to the locale homepage under RTL locales", () => {
    const nav = siteContent.fa.nav;
    render(<Header nav={nav} currentLocale="fa" />);
    expect(hrefOf(nav.services)).toBe("/fa#services");
    expect(hrefOf(nav.process)).toBe("/fa#process");
    expect(hrefOf(nav.contact)).toBe("/fa#contact");
    expect(hrefOf(nav.work)).toBe("/fa/work");
  });

  it("omits nav items whose label is empty", () => {
    // Empty labels are filtered out of the rendered nav. Cast past the literal
    // content type to model a locale that intentionally drops a section.
    const nav = {
      ...siteContent.en.nav,
      work: "",
      process: "",
      contact: "",
    } as unknown as SiteContent["nav"];
    render(<Header nav={nav} currentLocale="en" />);
    expect(screen.queryByRole("link", { name: siteContent.en.nav.work })).toBeNull();
    expect(
      screen.getByRole("link", { name: siteContent.en.nav.services }),
    ).toBeInTheDocument();
  });
});
