import type { SiteContent } from "@/content/site";
import Reveal from "./motion/Reveal";
import { Icon } from "./icons";

type Props = { t: SiteContent["agentSpotlight"] };

// Featured differentiator panel: a near-black rounded card on the light page,
// with a blue radial glow, a blue eyebrow badge, the heading + body, and the
// bullet list rendered with check markers. Mirrors the EMPOWER "flagship card"
// treatment. The glow is positioned (not directional) and all spacing is
// logical, so it mirrors safely under RTL.
export default function AgentSpotlight({ t }: Props) {
  return (
    <section className="bg-page">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-inverse p-10 text-white sm:p-12 lg:p-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 end-[-6rem] h-80 w-80 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(37,99,235,0.25), transparent 70%)",
              }}
            />
            <div className="relative z-10">
              {t.eyebrow ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/15 px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-widest text-blue-400">
                  {t.eyebrow}
                </span>
              ) : null}

              <h2 className="mt-5 max-w-2xl text-3xl font-extrabold leading-tight tracking-[-0.02em] sm:text-4xl">
                {t.title}
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-[1.72] text-zinc-400">
                {t.body}
              </p>

              <ul className="mt-9 grid gap-4 sm:grid-cols-2 sm:gap-x-10">
                {t.bullets.map((b, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm leading-relaxed text-zinc-300"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-green-400">
                      <Icon name="ti-shield-check" width={13} height={13} />
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              {t.note ? (
                <p className="mt-9 max-w-2xl border-t border-white/10 pt-6 text-sm italic text-zinc-500">
                  {t.note}
                </p>
              ) : null}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
