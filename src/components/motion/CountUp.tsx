"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** Target number to count up to. */
  value: number;
  /** Suffix appended after the number, e.g. "+", "%", ".5%". */
  suffix?: string;
  className?: string;
};

// Count-up stat. Starts at 0 and eases to `value` when scrolled into view.
// Under prefers-reduced-motion (or without JS) it shows the final value
// immediately — the SSR text is the final value, so it degrades gracefully.
export default function CountUp({ value, suffix = "", className }: Props) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(value);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        io.disconnect();

        const duration = 1300;
        const start = performance.now();
        const ease = (t: number) => 1 - Math.pow(1 - t, 3);

        // Reset to 0 and animate up — done inside this observer callback (an
        // event handler), not the effect body, so we never setState
        // synchronously on mount.
        setDisplay(0);
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          setDisplay(Math.round(ease(p) * value));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  );
}
