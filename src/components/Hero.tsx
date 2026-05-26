import type { SiteContent } from "@/content/site";

type Props = { t: SiteContent["hero"] };

// Hero is the only place the editorial serif (Instrument Serif) appears on the
// site. font-display sets the family on the H1; Persian and Arabic override
// it back to Noto Sans Arabic via the :lang() rule in globals.css.
//
// Structure: eyebrow → H1 → subtitle → CTAs → hairline + metaphor flourish.
// The bottom flourish echoes the "Business Brain → AI Systems" line that the
// Framework section embodies later — repetition reinforces the metaphor.
export default function Hero({ t }: Props) {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-40">
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

        {t.metaphor ? (
          <div className="mt-16 max-w-2xl border-t border-rule pt-6 sm:mt-24 sm:pt-8">
            <p className="text-lg font-medium text-ink">{t.metaphor}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
