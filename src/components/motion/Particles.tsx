"use client";

import { useEffect, useRef } from "react";

// Floating hero particles. Renders nothing on the server; on mount it spawns
// small absolutely-positioned dots that drift upward via the particle-float
// keyframes in globals.css. Skipped entirely under prefers-reduced-motion.
// Purely decorative and aria-hidden — never carries content.
export default function Particles({ count = 28 }: { count?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Index-based jitter so we don't depend on Math.random being stable; small
    // pseudo-random spread keyed off i keeps the field organic without SSR
    // mismatch (this only runs client-side).
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const r = (n: number) => ((Math.sin(i * 12.9898 + n) * 43758.5453) % 1 + 1) % 1;
      const size = 0.8 + r(1) * 2.2;
      const dot = document.createElement("div");
      dot.className = "particle";
      dot.style.cssText = [
        "position:absolute",
        "border-radius:50%",
        `inset-inline-start:${(r(2) * 100).toFixed(2)}%`,
        `width:${size.toFixed(2)}px`,
        `height:${size.toFixed(2)}px`,
        `background:rgba(255,255,255,${(0.15 + r(3) * 0.3).toFixed(3)})`,
        "animation:particle-float linear infinite",
        `animation-duration:${(9 + r(4) * 16).toFixed(2)}s`,
        `animation-delay:${(r(5) * 12).toFixed(2)}s`,
      ].join(";");
      frag.appendChild(dot);
    }
    host.appendChild(frag);
    return () => {
      host.replaceChildren();
    };
  }, [count]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    />
  );
}
