import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/motion/Reveal";
import HeroGlow from "@/components/motion/HeroGlow";
import { Icon } from "@/components/icons";
import { siteContent, type Locale } from "@/content/site";
import {
  getWorkLabels,
  listWorkProjects,
  workLinks,
} from "@/content/work";

type Props = { locale: Locale };

// Shared shell for the /work index (one per locale). Renders the localized
// Header, a compact dark hero band, a static grid of project cards (each links
// to its deep case page), and the Footer. Mirrors ModulePageShell. No filter UI
// at launch (one project per category — nothing to filter); the `category`
// field exists for when there are 5+ projects. RTL-safe: logical spacing, no
// physical left/right, grid mirrors under dir="rtl".
export function buildWorkMetadata(locale: Locale): Metadata {
  const t = siteContent[locale];
  const labels = getWorkLabels(locale);
  return {
    title: `${labels.eyebrow} — ${t.footer.brand}`,
    description: labels.intro,
  };
}

export default function WorkIndexShell({ locale }: Props) {
  const t = siteContent[locale];
  const labels = getWorkLabels(locale);
  const projects = listWorkProjects(locale);
  const basePath = locale === "en" ? "" : locale === "fa" ? "/fa" : "/ar";

  return (
    <>
      <Header
        nav={t.nav}
        currentLocale={locale}
        cta={{ label: t.hero.primaryCta.label, href: t.hero.primaryCta.href }}
      />
      <main className="flex-1 bg-page">
        {/* Compact dark hero band */}
        <section className="relative overflow-hidden bg-inverse text-white">
          <HeroGlow />
          <div className="relative z-10 mx-auto max-w-3xl px-6 py-16 text-center sm:px-8 sm:py-20">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
                {labels.eyebrow}
              </p>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="mt-3 text-3xl font-black tracking-[-0.03em] sm:text-4xl">
                {t.nav.work}
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="mx-auto mt-4 max-w-xl text-base leading-[1.7] text-zinc-400">
                {labels.intro}
              </p>
            </Reveal>
          </div>
        </section>

        {/* Project card grid */}
        <section className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-20 lg:px-12">
          <div className="grid gap-5 lg:grid-cols-3">
            {projects.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 100} className="h-full">
                <a
                  href={`${basePath}/work/${p.slug}`}
                  className="flex h-full flex-col rounded-2xl border border-rule bg-surface p-7 transition hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.09)]"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${p.accent}1a`, color: p.accent }}
                    >
                      <Icon name={p.headerIcon} width={18} height={18} />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-body">
                      {labels.categoryLabels[p.category]}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold leading-snug text-ink">
                    {p.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-body">
                    {p.problem}
                  </p>
                  <div className="mt-6 border-t border-rule pt-5">
                    <p
                      className="text-2xl font-black tracking-[-0.02em]"
                      style={{ color: p.accent }}
                    >
                      {p.metric.value}
                    </p>
                    <p className="mt-1 text-sm leading-snug text-body">
                      {p.metric.label}
                    </p>
                  </div>
                  <span className="mt-5 text-sm font-bold text-accent">
                    {labels.viewCase} →
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-page">
          <div className="mx-auto max-w-3xl px-6 pb-20 text-center sm:px-8 sm:pb-24 lg:px-12">
            <Reveal>
              <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-ink sm:text-3xl">
                {labels.ctaTitle}
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="mx-auto mt-4 max-w-xl text-base leading-[1.75] text-body">
                {labels.ctaBody}
              </p>
            </Reveal>
            <Reveal delay={200}>
              <a
                href={t.hero.primaryCta.href}
                className="mt-7 inline-flex rounded-xl bg-inverse px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
              >
                {labels.ctaLabel}
              </a>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer
        t={t.footer}
        columns={[
          {
            heading: labels.eyebrow,
            links: workLinks(locale, basePath),
          },
          {
            heading: t.nav.contact,
            links: [
              { label: t.footer.contactLabel, href: t.footer.contactHref },
            ],
          },
        ]}
      />
    </>
  );
}
