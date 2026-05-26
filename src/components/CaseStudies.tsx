import type { SiteContent } from "@/content/site";

type Props = { t: SiteContent["caseStudies"] };

export default function CaseStudies({ t }: Props) {
  return (
    <section id="work" className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          {t.title}
        </h2>

        <p className="mt-6 max-w-3xl text-lg text-gray-500">{t.intro}</p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {t.items.map((item) => (
            <article
              key={item.title}
              className="rounded-lg border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold leading-snug text-slate-900">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                {item.summary}
              </p>
              <ul className="mt-4 space-y-2">
                {item.highlights.map((h, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-500">
                    <span aria-hidden="true" className="text-slate-900">
                      ·
                    </span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
