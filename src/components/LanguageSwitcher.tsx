import Link from "next/link";
import { Fragment } from "react";
import { locales, localePath, siteContent, type Locale } from "@/content/site";

type Props = { currentLocale: Locale };

// Three locales as native labels separated by thin vertical hairlines.
// Active locale: text-ink + clay underline. Inactive: text-muted, hover to ink.
// hrefLang + lang attributes give screen readers and search engines the
// correct destination language for each link.
export default function LanguageSwitcher({ currentLocale }: Props) {
  return (
    <nav aria-label="Language" className="flex items-center gap-3 text-sm">
      {locales.map((loc, i) => {
        const isActive = loc === currentLocale;
        return (
          <Fragment key={loc}>
            {i > 0 ? (
              <span aria-hidden="true" className="h-3 w-px bg-rule" />
            ) : null}
            <Link
              href={localePath(loc)}
              hrefLang={loc}
              lang={loc}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "font-medium text-ink underline decoration-accent decoration-2 underline-offset-4"
                  : "text-muted transition-colors hover:text-ink"
              }
            >
              {siteContent[loc].languageLabel}
            </Link>
          </Fragment>
        );
      })}
    </nav>
  );
}
