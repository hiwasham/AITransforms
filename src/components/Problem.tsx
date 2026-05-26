import type { SiteContent } from "@/content/site";

type Props = { t: SiteContent["problem"] };

export default function Problem({ t }: Props) {
  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">
          {t.title}
        </h2>

        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-gray-500">
          {t.body}
        </p>

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {t.points.map((point, i) => (
            <li
              key={i}
              className="rounded-lg border border-gray-200 p-6"
            >
              <h3 className="text-base font-semibold text-slate-900">
                {point.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                {point.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
