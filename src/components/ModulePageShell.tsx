import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ModulePanel from "@/components/ModulePanel";
import Reveal from "@/components/motion/Reveal";
import HeroGlow from "@/components/motion/HeroGlow";
import { siteContent, type Locale } from "@/content/site";
import {
  getModulePage,
  moduleLinks,
  type ModuleSlug,
} from "@/content/modules";

type Props = { locale: Locale; slug: ModuleSlug };

// Shared shell for the nine module routes (3 departments × 3 locales). A route
// file just calls this with its locale + slug. Renders the localized Header
// (with apply CTA + module links), a compact dark hero band, the interactive
// ModulePanel, and the Footer with module + contact columns. Keeps each route
// file a one-liner and the markup single-sourced.
export function buildModuleMetadata(locale: Locale, slug: ModuleSlug): Metadata {
  const page = getModulePage(locale, slug);
  const t = siteContent[locale];
  return {
    title: `${page.title} — ${t.footer.brand}`,
    description: page.intro,
  };
}

export default function ModulePageShell({ locale, slug }: Props) {
  const t = siteContent[locale];
  const page = getModulePage(locale, slug);
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
              <p
                className="text-xs font-bold uppercase tracking-[0.14em]"
                style={{ color: page.accent }}
              >
                {page.eyebrow}
              </p>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="mt-3 text-3xl font-black tracking-[-0.03em] sm:text-4xl">
                {page.title}
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="mx-auto mt-4 max-w-xl text-base leading-[1.7] text-zinc-400">
                {page.intro}
              </p>
            </Reveal>
          </div>
        </section>

        <ModulePanel page={page} />
      </main>
      <Footer
        t={t.footer}
        columns={[
          {
            heading: t.nav.process,
            links: moduleLinks(locale, basePath),
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
