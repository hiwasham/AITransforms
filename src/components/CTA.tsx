import type { SiteContent } from "@/content/site";
import Reveal from "./motion/Reveal";

type Props = { t: SiteContent["cta"] };

// Closing CTA, EMPOWER style: full near-black band, centered heading + body,
// and a white pill primary button. Honest mailto/apply-based contact from the
// content dictionary (PR #2 path preserved) — no booking widget, no form.
export default function CTA({ t }: Props) {
  return (
    <section id="contact" className="bg-inverse text-white">
      <div className="mx-auto max-w-3xl px-6 py-24 text-center sm:px-8 sm:py-28 lg:px-12 lg:py-32">
        <Reveal>
          <h2 className="text-3xl font-extrabold leading-tight tracking-[-0.03em] sm:text-4xl lg:text-5xl">
            {t.title}
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p className="mx-auto mt-5 max-w-xl text-base leading-[1.7] text-zinc-400 sm:text-lg">
            {t.body}
          </p>
        </Reveal>
        <Reveal delay={200}>
          <a
            href={t.primaryCta.href}
            className="mt-10 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-[0.95rem] font-bold text-zinc-950 transition hover:-translate-y-0.5 hover:opacity-90"
          >
            {t.primaryCta.label}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
