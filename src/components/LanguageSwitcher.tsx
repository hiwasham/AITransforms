"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { locales, siteContent, type Locale } from "@/content/site";

type Props = { currentLocale: Locale };

// Three locales as native labels separated by thin vertical hairlines.
// Active locale: text-ink + clay underline. Inactive: text-muted, hover to ink.
// hrefLang + lang attributes give screen readers and search engines the
// correct destination language for each link.
//
// Locale-aware routing: switching language preserves the current sub-path, so
// a visitor on /fa/apply who taps "العربية" lands on /ar/apply, not /ar. This
// needs the live pathname, hence the "use client" + usePathname().
export default function LanguageSwitcher({ currentLocale }: Props) {
  const pathname = usePathname() || "/";

  // Strip the current locale prefix to get the shared sub-path ("" or
  // "/apply"). English has no prefix; fa/ar are mounted under /fa and /ar.
  const prefix = currentLocale === "en" ? "" : `/${currentLocale}`;
  let rest = pathname.slice(prefix.length);
  if (rest === "/") rest = "";

  // Rebuild the same sub-path under a target locale. English drops the prefix.
  const hrefFor = (loc: Locale) => {
    const base = loc === "en" ? "" : `/${loc}`;
    return `${base}${rest}` || "/";
  };

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
              href={hrefFor(loc)}
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
