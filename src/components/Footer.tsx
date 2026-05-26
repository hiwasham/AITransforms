import Wordmark from "./Wordmark";
import type { SiteContent } from "@/content/site";

type Props = { t: SiteContent["footer"] };

export default function Footer({ t }: Props) {
  return (
    <footer className="border-t border-rule">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-12 lg:px-12 lg:py-14">
        <div>
          <Wordmark size="sm" />
          {t.tagline ? (
            <p className="mt-1 text-sm text-muted">{t.tagline}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 text-sm text-muted sm:items-end">
          <a
            href={t.contactHref}
            className="text-ink transition-colors hover:text-muted"
          >
            {t.contactLabel}
          </a>
          <span>{t.copyright}</span>
        </div>
      </div>
    </footer>
  );
}
