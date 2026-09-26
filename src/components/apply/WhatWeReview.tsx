import type { ApplyContent } from "@/content/apply";
import Arrow from "../Arrow";

type Props = { t: ApplyContent["whatWeReview"] };

// Flat 2-col grid of short scope-of-review items, each led by a clay arrow.
// Deliberately not hairlined — relies on whitespace to separate items. This
// breaks the rhythm from the previous two hairlined editorial-row sections
// (ApplyProblem and Diagnostic).
export default function WhatWeReview({ t }: Props) {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
        <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {t.title}
        </h2>

        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-body">
          {t.intro}
        </p>

        <ul className="mt-12 grid gap-x-8 gap-y-4 sm:mt-16 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-5 lg:gap-x-16">
          {t.items.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-base leading-relaxed text-body"
            >
              <span className="shrink-0 pt-1.5 text-accent">
                <Arrow size="sm" />
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
