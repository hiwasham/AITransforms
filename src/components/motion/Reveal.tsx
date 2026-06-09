"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Stagger delay in ms applied once the element reveals. */
  delay?: number;
  className?: string;
  /** Render as a different element when needed (e.g. "li"). Defaults to div. */
  as?: "div" | "li" | "section";
};

// Scroll-reveal island. Wraps children, adds `.is-in` when they enter the
// viewport so the `.reveal` CSS transition in globals.css plays once. Honors
// prefers-reduced-motion (the CSS forces the revealed state, and we also reveal
// immediately here so SSR content is never stuck invisible without JS).
export default function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced-motion users are handled purely by CSS (globals.css forces the
    // revealed state under prefers-reduced-motion), so no JS state change is
    // needed here. We still observe so the entrance plays for everyone else;
    // setShown only ever fires inside the observer callback.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -36px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = as;
  return (
    <Tag
      ref={ref as never}
      className={["reveal", shown ? "is-in" : "", className]
        .filter(Boolean)
        .join(" ")}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
