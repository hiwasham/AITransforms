import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
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
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href={localePath(currentLocale)}
          className="text-lg font-semibold tracking-tight text-slate-900"
        >
          AITransforms
        </Link>

        <div className="flex items-center gap-6">
          {navItems.length > 0 ? (
            <nav
              aria-label="Primary"
              className="hidden gap-5 text-sm text-gray-500 sm:flex"
            >
              {navItems.map((item) => (
                <a key={item.href} href={item.href} className="hover:text-slate-900">
                  {item.label}
                </a>
              ))}
            </nav>
          ) : null}

          <LanguageSwitcher currentLocale={currentLocale} />
        </div>
      </div>
    </header>
  );
}
