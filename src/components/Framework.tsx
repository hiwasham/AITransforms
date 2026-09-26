import { Fragment } from "react";
import type { SiteContent } from "@/content/site";
import Reveal from "./motion/Reveal";
import Arrow from "./Arrow";

type Props = { t: SiteContent["framework"] };

// Map → Structure → Implement → Adapt as a connected horizontal flow (not a
// symmetric card grid — that reads as generic AI slop). Left-aligned header,
// then four steps separated by clay/blue arrow connectors at lg, stacked with a
// leading rule on mobile. Numerals are solid accent blue: the blue→violet→pink
// gradient washes out to ~2.5:1 on the white page background, so the gradient
// is reserved for dark surfaces (hero, Problem). Numerals come locale-typeset
// from site.ts (01 / ۰۱ / ٠١); the arrow mirrors under RTL via Arrow's own
// rtl:-scale-x-100.
export default function Framework({ t }: Props) {
  return (
    <section id="process" className="bg-page">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
            System Architecture
          </p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-[-0.03em] text-ink sm:text-4xl">
            {t.title}
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p className="mt-5 max-w-2xl text-base leading-[1.75] text-body">
            {t.intro}
          </p>
        </Reveal>

        <ol className="mt-14 lg:flex lg:items-start">
          {t.steps.map((step, i) => {
            const isLast = i === t.steps.length - 1;
            return (
              <Fragment key={step.number}>
                <Reveal
                  as="li"
                  delay={(i % 4) * 100}
                  className="mt-8 border-s-2 border-rule ps-5 first:mt-0 lg:mt-0 lg:flex-1 lg:border-s-0 lg:ps-0"
                >
                  <span className="block text-5xl font-black leading-none text-accent lg:text-6xl">
                    {step.number}
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-body lg:pe-8">
                    {step.body}
                  </p>
                </Reveal>
                {!isLast ? (
                  <li
                    aria-hidden="true"
                    className="hidden text-accent lg:flex lg:items-center lg:pt-5"
                  >
                    <Arrow size="md" />
                  </li>
                ) : null}
              </Fragment>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
