import { Fragment } from "react";
import type { SiteContent } from "@/content/site";
import Arrow from "./Arrow";

type Props = { t: SiteContent["framework"] };

// Map → Structure → Implement → Adapt rendered as a vertical hairline stack on
// mobile/sm and a horizontal flex flow at lg, with clay arrow separators
// between steps. The locale-specific step numbers (01 / ۰۱ / ٠١) come from
// site.ts; numerals are typeset in Instrument Serif on Latin and fall back to
// Noto Sans Arabic for fa/ar via the :lang() rule in globals.css.
export default function Framework({ t }: Props) {
  return (
    <section id="process">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-24 lg:px-12 lg:py-32">
        <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {t.title}
        </h2>

        <p className="mt-6 max-w-3xl text-lg text-body">{t.intro}</p>

        <ol className="mt-16 sm:mt-20 lg:mt-24 lg:flex lg:items-start">
          {t.steps.map((step, i) => {
            const isLast = i === t.steps.length - 1;
            return (
              <Fragment key={step.number}>
                <li className="mt-8 border-t border-rule pt-6 first:mt-0 lg:mt-0 lg:flex-1 lg:border-t-0 lg:pt-0">
                  <span className="block font-display text-4xl leading-none text-accent sm:text-5xl lg:text-6xl">
                    {step.number}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-body">
                    {step.body}
                  </p>
                </li>
                {!isLast ? (
                  <li
                    aria-hidden="true"
                    className="hidden text-accent lg:flex lg:items-start lg:px-4 lg:pt-6"
                  >
                    <Arrow size="lg" />
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
