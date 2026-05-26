import type { SiteContent } from "@/content/site";
import Arrow from "./Arrow";

type Props = { t: SiteContent["agentSpotlight"] };

// Contained dark "agent panel": rounded-2xl bg-inverse card floating on the
// off-white page bg, with a thin top chrome strip (clay vertical accent +
// eyebrow) for a command-panel feel — no skeuomorphic terminal dots, no
// scanlines, no live-status indicators. Same content as V1, just no longer a
// jarring full-width slab.
//
// On-dark text uses alpha-white so it blends with the warm near-black bg
// rather than the cool gray-300/400 of stock Tailwind grays.
export default function AgentSpotlight({ t }: Props) {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-32">
        <div className="overflow-hidden rounded-2xl bg-inverse text-white">
          <header className="flex items-center gap-3 border-b border-white/10 px-8 py-5 sm:px-10 lg:px-12">
            <span aria-hidden="true" className="h-3 w-px bg-accent" />
            {t.eyebrow ? (
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">
                {t.eyebrow}
              </p>
            ) : null}
          </header>

          <div className="px-8 py-12 sm:px-10 sm:py-16 lg:px-12 lg:py-20">
            <h2 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              {t.title}
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">
              {t.body}
            </p>

            <ul className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-4">
              {t.bullets.map((b, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm leading-relaxed text-white/85"
                >
                  <span className="shrink-0 pt-1.5 text-accent">
                    <Arrow size="sm" />
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            {t.note ? (
              <p className="mt-10 max-w-2xl border-t border-white/10 pt-6 text-sm italic text-white/55">
                {t.note}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
