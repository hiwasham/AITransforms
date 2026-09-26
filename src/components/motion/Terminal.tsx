"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** Terminal window title, e.g. "System Diagnostics". */
  title: string;
  /** Small status label above the badge. */
  statusLabel: string;
  /** Red badge text, e.g. "Critical Disconnect". */
  badge: string;
  /** Diagnostic rows, each rendered with a ✗ marker. */
  rows: readonly string[];
  /** The error string that types out, e.g. "ERROR_CODE_404_CONTEXT". */
  errorText: string;
  /** Footer action line, e.g. "ACTION REQUIRED". */
  actionLabel: string;
};

// Diagnostics terminal with a typewriter error line. Mirrors the EMPOWER
// clone's "System Diagnostics" panel. The error text types character-by-
// character when the panel scrolls into view; under prefers-reduced-motion it
// renders complete immediately. dir="ltr" is pinned on the mono body so the
// code-style content reads left-to-right even on fa/ar pages, while the
// surrounding layout still mirrors.
export default function Terminal({
  title,
  statusLabel,
  badge,
  rows,
  errorText,
  actionLabel,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  // Initialise to the full text so SSR, no-JS, and reduced-motion all render
  // the complete error line. When motion is allowed, the effect clears it and
  // types it out — all setState happens inside the observer callback, never
  // synchronously in the effect body.
  const [typed, setTyped] = useState(errorText);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || done.current) return;
        done.current = true;
        io.disconnect();

        let i = 0;
        setTyped("");
        const step = () => {
          i += 1;
          setTyped(errorText.slice(0, i));
          if (i < errorText.length) {
            window.setTimeout(step, 55 + Math.abs(Math.sin(i)) * 40);
          }
        };
        window.setTimeout(step, 600);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [errorText]);

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#0d1117] font-mono shadow-2xl"
    >
      <div className="flex items-center gap-2 border-b border-zinc-800 bg-[#161b22] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="flex-1 text-center font-sans text-xs text-zinc-500">
          {title}
        </span>
      </div>
      <div className="px-6 py-6" dir="ltr">
        <p className="mb-3 font-sans text-[0.68rem] uppercase tracking-[0.1em] text-zinc-500">
          {statusLabel}
        </p>
        <span className="mb-5 inline-block rounded-md border border-red-500/25 bg-red-500/15 px-3 py-1 font-sans text-xs font-bold text-red-400">
          {badge}
        </span>
        <ul className="space-y-2">
          {rows.map((row, i) => (
            <li
              key={i}
              className="flex items-center gap-2.5 text-[0.8rem] text-zinc-500"
            >
              <span aria-hidden="true" className="shrink-0 text-red-500">
                ✗
              </span>
              {row}
            </li>
          ))}
        </ul>
        <hr className="my-4 border-zinc-800" />
        <p className="text-[0.78rem] tracking-wide text-red-500">
          {typed}
          <span
            aria-hidden="true"
            className="ms-0.5 inline-block h-3.5 w-2 translate-y-0.5 bg-green-500"
            style={{ animation: "caret-blink 0.8s step-end infinite" }}
          />
        </p>
        <hr className="my-4 border-zinc-800" />
        <p className="text-[0.78rem] tracking-wide text-amber-500">
          {actionLabel}
        </p>
      </div>
    </div>
  );
}
