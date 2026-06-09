"use client";

import { useEffect, useRef } from "react";

// Radial hero glow with a subtle scroll parallax. The `.hero-glow` element
// pulses via CSS; this island nudges it vertically as the page scrolls for
// depth. Parallax is skipped under prefers-reduced-motion (the pulse is also
// disabled there by the CSS). aria-hidden, purely decorative.
export default function HeroGlow() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `translateY(${window.scrollY * 0.14}px)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={ref} aria-hidden="true" className="hero-glow" />;
}
