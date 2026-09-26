import type { ApplyContent } from "@/content/apply";

type Props = { t: ApplyContent["hero"] };

// /apply hero. Matches the home Hero pattern: eyebrow + Instrument Serif H1 +
// subtitle + pill primary + underlined secondary, with a hairline + tagline
// flourish at the bottom that mirrors the home Hero's metaphor line. Tagline
// communicates the "manually reviewed by Hiwa" credibility instead of the
// brand metaphor.
export default function ApplyHero({ t }: Props) {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-36">
        {t.eyebrow ? (
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            {t.eyebrow}
          </p>
        ) : null}

        <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[1.05] text-ink sm:text-6xl lg:text-7xl">
          {t.title}
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-body">
          {t.subtitle}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <a
            href={t.primaryCta.href}
            className="inline-flex items-center rounded-full bg-ink px-8 py-4 text-base font-medium text-white transition-colors hover:bg-accent-strong"
          >
            {t.primaryCta.label}
          </a>

          {t.secondaryCta.label ? (
            <a
              href={t.secondaryCta.href}
              className="text-sm font-medium text-ink underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:decoration-accent-strong"
            >
              {t.secondaryCta.label}
            </a>
          ) : null}
        </div>

        {t.note ? (
          <div className="mt-16 max-w-2xl border-t border-rule pt-6 sm:mt-20 sm:pt-8">
            <p className="text-lg font-medium text-ink">{t.note}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
