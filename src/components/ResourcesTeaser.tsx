import type { SiteContent } from "@/content/site";
import Reveal from "./motion/Reveal";

type Props = { t: SiteContent["resources"] };

// Resources teaser as a four-up card grid. Honest "coming soon" framing — four
// category labels with one-line descriptions, no email capture, no fake links.
// The closing note is set in the accent colour as a deliberate signature.
export default function ResourcesTeaser({ t }: Props) {
  return (
    <section className="bg-page">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
            Resources
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

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.items.map((item, i) => (
            <Reveal key={item.title} delay={(i % 4) * 100} className="h-full">
              <article className="h-full rounded-2xl border border-rule bg-surface p-6 transition hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(0,0,0,0.07)]">
                <h3 className="text-base font-bold text-ink">{item.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-body">
                  {item.summary}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        {t.note ? (
          <p className="mt-10 text-sm font-semibold text-accent">{t.note}</p>
        ) : null}
      </div>
    </section>
  );
}
