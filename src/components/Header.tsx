import LanguageSwitcher from "./LanguageSwitcher";
import Wordmark from "./Wordmark";
import { localePath, type Locale, type SiteContent } from "@/content/site";

type Props = {
  nav: SiteContent["nav"];
  currentLocale: Locale;
};

export default function Header({ nav, currentLocale }: Props) {
  const navItems = [
    { label: nav.services, href: "#services" },
    { label: nav.work, href: "#work" },
    { label: nav.process, href: "#process" },
    { label: nav.contact, href: "#contact" },
  ].filter((item) => item.label);

  return (
    <header className="sticky top-0 z-10 border-b border-rule bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5 sm:px-8 sm:py-6 lg:px-12">
        <Wordmark href={localePath(currentLocale)} size="lg" />

        <div className="flex items-center gap-6">
          {navItems.length > 0 ? (
            <nav
              aria-label="Primary"
              className="hidden gap-6 text-sm text-muted sm:flex"
            >
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="transition-colors hover:text-ink"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          ) : null}

          {navItems.length > 0 ? (
            <span
              aria-hidden="true"
              className="hidden h-4 w-px bg-rule sm:block"
            />
          ) : null}

          <LanguageSwitcher currentLocale={currentLocale} />
        </div>
      </div>
    </header>
  );
}
