import type { SiteContent } from "@/content/site";
import Reveal from "./motion/Reveal";

type Props = { t: SiteContent["caseStudies"] };

// Selected work as a 3-col card grid (EMPOWER project-card style): hairline
// border, hover lift, title + summary + em-dash highlight list. Content stays
// anonymized and qualitative — no fabricated metrics. Logical spacing for RTL.
export default function CaseStudies({ t }: Props) {
  return (
    <section id="work" className="bg-page">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
            Selected work
          </p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] text-ink sm:text-4xl">
            {t.title}
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p className="mt-5 max-w-2xl text-base leading-[1.75] text-body">
            {t.intro}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {t.items.map((item, i) => (
            <Reveal key={i} delay={(i % 3) * 100} className="h-full">
              <article className="flex h-full flex-col rounded-2xl border border-rule bg-surface p-7 transition hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.09)]">
                <h3 className="text-lg font-bold leading-snug text-ink">
                  {item.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-body">
                  {item.summary}
                </p>
                <ul className="mt-5 space-y-2 border-t border-rule pt-5 text-sm leading-relaxed text-body">
                  {item.highlights.map((h, j) => (
                    <li key={j} className="flex gap-2">
                      <span aria-hidden="true" className="shrink-0 text-accent">
                        —
                      </span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
