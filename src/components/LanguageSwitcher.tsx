import Link from "next/link";
import { Fragment } from "react";
import { locales, localePath, siteContent, type Locale } from "@/content/site";

type Props = { currentLocale: Locale };

export default function LanguageSwitcher({ currentLocale }: Props) {
  return (
    <nav aria-label="Language" className="flex items-center gap-3 text-sm">
      {locales.map((loc, i) => {
        const isActive = loc === currentLocale;
        return (
          <Fragment key={loc}>
            {i > 0 ? (
              <span aria-hidden="true" className="text-gray-300">
                ·
              </span>
            ) : null}
            <Link
              href={localePath(loc)}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "font-medium text-slate-900"
                  : "text-gray-500 hover:text-slate-900"
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
