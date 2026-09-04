import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AuditControls from "./AuditControls";

describe("AuditControls", () => {
  beforeEach(() => {
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 0,
    });
  });

  it("opens and closes the mobile navigation", () => {
    render(<AuditControls />);

    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(
      screen.getByRole("button", { name: "Close navigation" }),
    ).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(window, { key: "Escape" });
    expect(
      screen.getByRole("button", { name: "Open navigation" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("shows the back-to-top control after scrolling", () => {
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo;
    render(<AuditControls />);

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 800,
    });
    fireEvent.scroll(window);
    fireEvent.click(screen.getByRole("button", { name: "Back to top" }));

    expect(scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: expect.stringMatching(/auto|smooth/),
    });
  });
});
