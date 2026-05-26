import type { SiteContent } from "@/content/site";

type Props = { t: SiteContent["framework"] };

export default function Framework({ t }: Props) {
  return (
    <section id="process" className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          {t.title}
        </h2>

        <p className="mt-6 max-w-3xl text-lg text-gray-500">{t.intro}</p>

        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {t.steps.map((step) => (
            <li key={step.number} className="border-t border-gray-200 pt-6">
              <div className="text-sm font-medium text-gray-500">{step.number}</div>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
