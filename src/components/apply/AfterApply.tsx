import { Fragment } from "react";
import type { ApplyContent } from "@/content/apply";
import Arrow from "../Arrow";

type Props = { t: ApplyContent["afterApply"] };

// 3-step process flow. Mirrors the home Framework component: vertical
// hairline stack on mobile/sm, horizontal flex with clay arrow separators
// at lg. Step numerals use Instrument Serif via font-display; titles stay
// in Geist. Strong visual break from the rows-and-spacing layouts above.
export default function AfterApply({ t }: Props) {
  return (
    <section id="process">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-24 lg:px-12 lg:py-32">
        <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {t.title}
        </h2>

        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-body">
          {t.intro}
        </p>

        <ol className="mt-12 sm:mt-16 lg:mt-20 lg:flex lg:items-start">
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
