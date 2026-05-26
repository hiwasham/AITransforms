import type { SiteContent } from "@/content/site";

type Props = { t: SiteContent["caseStudies"] };

// Editorial 3-column grid at lg, stacked on mobile/sm. Card chrome removed:
// each engagement is structured by a top hairline + title + summary +
// highlights. Highlights use an em-dash markup (typographic indent) instead of
// bullet glyphs — quieter than Services' clay arrows, in keeping with the
// anonymized, qualitative nature of the section.
export default function CaseStudies({ t }: Props) {
  return (
    <section id="work">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
        <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {t.title}
        </h2>

        <p className="mt-6 max-w-3xl text-lg text-body">{t.intro}</p>

        <div className="mt-16 grid gap-10 sm:mt-20 sm:gap-12 lg:grid-cols-3 lg:gap-12 xl:gap-16">
          {t.items.map((item, i) => (
            <article key={i} className="border-t border-rule pt-8">
              <h3 className="text-xl font-semibold leading-snug text-ink sm:text-2xl">
                {item.title}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-body">
                {item.summary}
              </p>
              <ul className="mt-6 space-y-2 text-sm leading-relaxed text-body">
                {item.highlights.map((h, j) => (
                  <li key={j} className="flex gap-2">
                    <span aria-hidden="true" className="shrink-0 text-muted">
                      —
                    </span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
