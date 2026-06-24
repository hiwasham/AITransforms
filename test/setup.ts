import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import { createElement, type AnchorHTMLAttributes, type ReactNode } from "react";

// next/link needs the App Router runtime context to render. Components here use
// it only as a styled anchor, so we mock it to a plain <a> for unit tests.
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children: ReactNode;
  }) => createElement("a", { href, ...rest }, children),
}));

// jsdom has no IntersectionObserver; the Reveal motion island observes one.
class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
