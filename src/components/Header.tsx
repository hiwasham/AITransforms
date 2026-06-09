import LanguageSwitcher from "./LanguageSwitcher";
import Wordmark from "./Wordmark";
import { localePath, type Locale, type SiteContent } from "@/content/site";

type Props = {
  nav: SiteContent["nav"];
  currentLocale: Locale;
  /** Optional header CTA (label + href) — usually the apply/contact path. */
  cta?: { label: string; href: string };
};

// Sticky, blurred top bar in the EMPOWER style. Wordmark on the start side;
// nav links + language switcher + a dark pill CTA on the end side. Nav links
// stay hidden below sm (the page is anchor-light on mobile, matching the prior
// behaviour). The CTA href comes from the content dictionary so it keeps the
// locale-correct apply/mailto path (PR #2 preserved).
export default function Header({ nav, currentLocale, cta }: Props) {
  // Locale-aware base path for routes (not anchors). localePath("en") is "/",
  // so strip the trailing slash to avoid "//work".
  const basePath = currentLocale === "en" ? "" : localePath(currentLocale);
  // Section anchors live on the locale homepage. Anchor them absolutely so they
  // still reach the homepage sections when the header renders on a /work page
  // (a bare "#services" would resolve to "/work#services", a dead link).
  const homeHref = basePath || "/";
  const navItems = [
    { label: nav.services, href: `${homeHref}#services` },
    { label: nav.work, href: `${basePath}/work` },
    { label: nav.process, href: `${homeHref}#process` },
    { label: nav.contact, href: `${homeHref}#contact` },
  ].filter((item) => item.label);

  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-page/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4 sm:px-8 lg:px-12">
        <Wordmark href={localePath(currentLocale)} size="lg" />

        <div className="flex items-center gap-4 sm:gap-5">
          {navItems.length > 0 ? (
            <nav
              aria-label="Primary"
              className="hidden gap-1 text-sm sm:flex"
            >
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 font-medium text-body transition-colors hover:bg-surface hover:text-ink"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          ) : null}

          <span
            aria-hidden="true"
            className="hidden h-4 w-px bg-rule sm:block"
          />

          <LanguageSwitcher currentLocale={currentLocale} />

          {cta ? (
            <a
              href={cta.href}
              className="hidden rounded-[10px] bg-ink px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-px hover:opacity-85 sm:inline-flex"
            >
              {cta.label}
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}
