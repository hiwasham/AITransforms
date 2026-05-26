import type { SiteContent } from "@/content/site";

type Props = { t: SiteContent["resources"] };

// Honest "coming soon" teaser framed as upcoming material, not as missing
// content. Four category labels (Articles / Frameworks / Roadmaps / Technical
// Notes) with one-line descriptions; no card chrome, no email capture, no
// links. The closing note is set in clay-strong so it reads as a deliberate
// editorial signature rather than a placeholder.
export default function ResourcesTeaser({ t }: Props) {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {t.title}
        </h2>

        <p className="mt-6 max-w-3xl text-lg text-body">{t.intro}</p>

        <div className="mt-16 grid gap-8 sm:mt-20 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4 lg:gap-8">
          {t.items.map((item) => (
            <article key={item.title} className="border-t border-rule pt-6">
              <h3 className="text-base font-semibold text-ink">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-body">
                {item.summary}
              </p>
            </article>
          ))}
        </div>

        {t.note ? (
          <p className="mt-12 text-sm font-medium text-accent-strong">
            {t.note}
          </p>
        ) : null}
      </div>
    </section>
  );
}
