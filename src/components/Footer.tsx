import type { SiteContent } from "@/content/site";

type Props = { t: SiteContent["footer"] };

export default function Footer({ t }: Props) {
  return (
    <footer className="bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-base font-semibold tracking-tight text-slate-900">
            {t.brand}
          </div>
          {t.tagline ? (
            <p className="mt-1 text-sm text-gray-500">{t.tagline}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 text-sm text-gray-500 sm:items-end">
          <a
            href={t.contactHref}
            className="text-slate-900 hover:text-gray-500"
          >
            {t.contactLabel}
          </a>
          <span>{t.copyright}</span>
        </div>
      </div>
    </footer>
  );
}
