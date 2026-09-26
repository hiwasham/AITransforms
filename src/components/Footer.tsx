import Wordmark from "./Wordmark";
import type { SiteContent } from "@/content/site";

type Props = {
  t: SiteContent["footer"];
  /** Optional link columns (label + items) shown on the end side. */
  columns?: { heading: string; links: { label: string; href: string }[] }[];
};

// Dark footer in the EMPOWER style: brand + tagline on the start side, optional
// link columns, then a bottom row with copyright and the contact link. The
// contact href comes from the content dictionary and stays a mailto (PR #2
// preserved). Grid + logical spacing mirror correctly under RTL.
export default function Footer({ t, columns }: Props) {
  return (
    <footer className="bg-inverse text-white">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-10 sm:px-8 lg:px-12">
        <div className="grid gap-10 border-b border-white/10 pb-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Wordmark size="lg" tone="inverse" />
            {t.tagline ? (
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-500">
                {t.tagline}
              </p>
            ) : null}
          </div>

          {columns?.map((col) => (
            <div key={col.heading}>
              <h5 className="text-xs font-bold uppercase tracking-[0.1em] text-zinc-500">
                {col.heading}
              </h5>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-zinc-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-600">{t.copyright}</p>
          <a
            href={t.contactHref}
            className="text-sm font-medium text-zinc-300 transition-colors hover:text-white"
          >
            {t.contactLabel}
          </a>
        </div>
      </div>
    </footer>
  );
}
