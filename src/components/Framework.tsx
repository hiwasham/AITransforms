import type { SiteContent } from "@/content/site";
import Reveal from "./motion/Reveal";

type Props = { t: SiteContent["framework"] };

// Map → Structure → Implement → Adapt as a light card grid (EMPOWER "prereq"
// style): centered eyebrow + heading + intro, then four hover-lift cards each
// led by a large gradient step numeral. Replaces the prior horizontal hairline
// flow. The numerals come locale-typeset from site.ts (01 / ۰۱ / ٠١). Grid and
// spacing are direction-agnostic so RTL mirrors cleanly.
export default function Framework({ t }: Props) {
  return (
    <section id="process" className="bg-page">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
        <Reveal>
          <p className="text-center text-xs font-bold uppercase tracking-[0.14em] text-accent">
            System Architecture
          </p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="mx-auto mt-3 max-w-3xl text-center text-3xl font-extrabold tracking-[-0.03em] text-ink sm:text-4xl">
            {t.title}
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p className="mx-auto mt-5 max-w-2xl text-center text-base leading-[1.75] text-body">
            {t.intro}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.steps.map((step, i) => (
            <Reveal key={step.number} delay={(i % 4) * 100} className="h-full">
              <div className="h-full rounded-2xl border border-rule bg-surface p-7 transition hover:-translate-y-1 hover:border-zinc-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.09)]">
                <span className="block text-5xl font-black leading-none text-gradient">
                  {step.number}
                </span>
                <h3 className="mt-4 text-lg font-bold leading-snug text-ink">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-body">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
