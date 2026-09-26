import type { SiteContent } from "@/content/site";
import Reveal from "./motion/Reveal";
import Terminal from "./motion/Terminal";

type Props = { t: SiteContent["problem"] };

// Dark "the problem" section, mirroring the EMPOWER clone: a two-column split
// with the narrative on the start side and an animated diagnostics terminal on
// the end side, followed by the three problem points as a numbered list. Grid
// columns reorder naturally under RTL; directional spacing uses logical
// properties. The blue eyebrow + gradient-free heading keep it readable on
// near-black.
export default function Problem({ t }: Props) {
  return (
    <section className="bg-inverse text-white">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-400">
            The Problem
          </p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight tracking-[-0.03em] sm:text-4xl">
            {t.title}
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <Reveal>
            <p className="text-base leading-[1.75] text-zinc-400">{t.body}</p>
            <ol className="mt-10 space-y-8">
              {t.points.map((point, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[auto_1fr] gap-x-5 sm:gap-x-6"
                >
                  <span
                    aria-hidden="true"
                    className="text-3xl font-black leading-none text-gradient sm:text-4xl"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold leading-snug text-white">
                      {point.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                      {point.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal delay={150}>
            <Terminal
              title={t.terminal.title}
              statusLabel={t.terminal.statusLabel}
              badge={t.terminal.badge}
              rows={t.terminal.rows}
              errorText={t.terminal.errorText}
              actionLabel={t.terminal.actionLabel}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
