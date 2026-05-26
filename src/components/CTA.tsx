import type { SiteContent } from "@/content/site";

type Props = { t: SiteContent["cta"] };

export default function CTA({ t }: Props) {
  return (
    <section id="contact" className="border-b border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h2 className="text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">
          {t.title}
        </h2>

        <p className="mt-6 text-lg leading-relaxed text-gray-500">{t.body}</p>

        <a
          href={t.primaryCta.href}
          className="mt-10 inline-flex items-center rounded-md bg-slate-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          {t.primaryCta.label}
        </a>
      </div>
    </section>
  );
}
