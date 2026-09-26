import type { SiteContent } from "@/content/site";
import HeroGlow from "./motion/HeroGlow";
import Particles from "./motion/Particles";
import Reveal from "./motion/Reveal";
import CountUp from "./motion/CountUp";

type Props = { t: SiteContent["hero"] };

// EMPOWER-style hero: near-black section, radial glow + floating particles,
// a pill badge with a pulsing dot, a large heading whose closing line is set
// in the blue→violet→pink gradient, two CTA buttons, and a count-up stat bar
// framed by hairlines. All directional spacing uses logical properties so the
// layout mirrors on fa/ar. The primary CTA keeps its mailto/apply href from
// the content dictionary (PR #2 contact path preserved).
export default function Hero({ t }: Props) {
  return (
    <section className="relative overflow-hidden bg-inverse text-white">
      <HeroGlow />
      <Particles />

      <div className="relative z-10 mx-auto max-w-5xl px-6 pt-24 pb-16 text-center sm:px-8 sm:pt-28 lg:px-12 lg:pt-32">
        {t.eyebrow ? (
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-zinc-400 backdrop-blur-sm">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-400 shadow-[0_0_8px_#22c55e] motion-safe:animate-pulse"
              />
              {t.eyebrow}
            </span>
          </Reveal>
        ) : null}

        <Reveal delay={100}>
          <h1 className="mx-auto mt-7 max-w-3xl text-4xl font-black leading-[1.07] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
            {t.title}
          </h1>
        </Reveal>

        <Reveal delay={200}>
          <p className="mx-auto mt-6 max-w-xl text-base leading-[1.75] text-zinc-400">
            {t.subtitle}
          </p>
        </Reveal>

        <Reveal delay={300}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={t.primaryCta.href}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-[0.95rem] font-bold text-zinc-950 transition hover:-translate-y-0.5 hover:opacity-90"
            >
              {t.primaryCta.label}
            </a>
            {t.secondaryCta.label ? (
              <a
                href={t.secondaryCta.href}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-7 py-3.5 text-[0.95rem] font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/45 hover:bg-white/5"
              >
                {t.secondaryCta.label}
              </a>
            ) : null}
          </div>
        </Reveal>

        {t.metaphor ? (
          <Reveal delay={400}>
            <p className="mt-10 text-sm font-semibold tracking-wide text-gradient">
              {t.metaphor}
            </p>
          </Reveal>
        ) : null}
      </div>

      {/* Stat bar — true studio facts, animated count-up. */}
      {t.stats?.length ? (
        <div className="relative z-10 mt-12 flex flex-wrap justify-center border-y border-zinc-800">
          {t.stats.map((s, i) => (
            <div
              key={i}
              className="border-e border-zinc-800 px-8 py-6 text-center last:border-e-0 sm:px-10"
            >
              <div className="text-[2rem] font-black leading-none tracking-[-0.04em] text-white">
                <CountUp value={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-1.5 text-xs font-medium text-zinc-500">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
