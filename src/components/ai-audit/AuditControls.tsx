"use client";

import { useEffect, useState } from "react";

export default function AuditControls() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <>
      <button
        type="button"
        className="audit-menu-button"
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={menuOpen}
        aria-controls="audit-mobile-nav"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav
        id="audit-mobile-nav"
        aria-label="Mobile navigation"
        className={`audit-mobile-nav${menuOpen ? " is-open" : ""}`}
      >
        <a href="#why" onClick={() => setMenuOpen(false)}>
          Why run it
        </a>
        <a href="#paths" onClick={() => setMenuOpen(false)}>
          Audit paths
        </a>
        <a href="#report" onClick={() => setMenuOpen(false)}>
          Report preview
        </a>
        <a href="#apply" onClick={() => setMenuOpen(false)}>
          Get my free report
        </a>
      </nav>

      {showTop ? (
        <button
          type="button"
          className="audit-back-top"
          aria-label="Back to top"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? "auto"
                : "smooth",
            })
          }
        >
          ↑
        </button>
      ) : null}
    </>
  );
}
