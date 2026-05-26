import type { SiteContent } from "@/content/site";

type Props = { t: SiteContent["founder"] };

export default function Founder({ t }: Props) {
  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {t.title}
          </h2>
          {t.name ? (
            <p className="mt-2 text-base font-medium text-slate-900">{t.name}</p>
          ) : null}
          <p className="mt-6 text-lg leading-relaxed text-gray-500">{t.body}</p>
        </div>

        <div className="border-t border-gray-200 pt-8 lg:border-s lg:border-t-0 lg:ps-12 lg:pt-0">
          <ul className="space-y-3">
            {t.credentials.map((c, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-500">
                <span aria-hidden="true" className="text-slate-900">
                  ·
                </span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
