import type { SiteContent } from "@/content/site";

type Props = { t: SiteContent["hero"] };

export default function Hero({ t }: Props) {
  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
        {t.eyebrow ? (
          <p className="text-sm font-medium uppercase tracking-wider text-gray-500">
            {t.eyebrow}
          </p>
        ) : null}

        <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          {t.title}
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-gray-500">
          {t.subtitle}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href={t.primaryCta.href}
            className="inline-flex items-center rounded-md bg-slate-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            {t.primaryCta.label}
          </a>

          {t.secondaryCta.label ? (
            <a
              href={t.secondaryCta.href}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-900 hover:text-gray-500"
            >
              <span>{t.secondaryCta.label}</span>
              <span aria-hidden="true" className="inline-block rtl:-scale-x-100">
                →
              </span>
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
