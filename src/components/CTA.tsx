import type { SiteContent } from "@/content/site";

type Props = { t: SiteContent["cta"] };

// Closing moment: hairlines top/bottom frame the section, H2 bumps to
// lg:text-5xl (largest non-hero heading on the page), subtitle slightly larger
// at sm+, and the primary CTA matches Hero's pill shape with the same clay
// hover treatment. Honest mailto-based contact; no booking, no form.
export default function CTA({ t }: Props) {
  return (
    <section id="contact" className="border-y border-rule">
      <div className="mx-auto max-w-3xl px-6 py-20 text-center sm:px-8 sm:py-28 lg:px-12 lg:py-36">
        <h2 className="text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
          {t.title}
        </h2>

        <p className="mt-6 text-lg leading-relaxed text-body sm:text-xl">
          {t.body}
        </p>

        <a
          href={t.primaryCta.href}
          className="mt-12 inline-flex items-center rounded-full bg-ink px-8 py-4 text-base font-medium text-white transition-colors hover:bg-accent-strong"
        >
          {t.primaryCta.label}
        </a>
      </div>
    </section>
  );
}
