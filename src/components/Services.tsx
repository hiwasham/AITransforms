import type { SiteContent } from "@/content/site";
import Reveal from "./motion/Reveal";
import { Icon, type IconName } from "./icons";

type Props = { t: SiteContent["services"] };

// Four service lines as a 2-col card grid (EMPOWER ecosystem style). Each card:
// an icon chip, title, body, and a bulleted feature list with em-dash markers.
// Icons map by position to the four service lines; if the content grows the
// list cycles. Hover lift + hairline border. Logical-property spacing for RTL.
const SERVICE_ICONS: IconName[] = [
  "ti-brain",
  "ti-database",
  "ti-rocket",
  "ti-cpu",
];

export default function Services({ t }: Props) {
  return (
    <section id="services" className="bg-page">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
            Services
          </p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] text-ink sm:text-4xl">
            {t.title}
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p className="mt-5 max-w-2xl text-base leading-[1.75] text-body">
            {t.intro}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          {t.items.map((item, i) => (
            <Reveal key={i} delay={(i % 2) * 100} className="h-full">
              <div className="flex h-full flex-col rounded-2xl border border-rule bg-surface p-8 transition hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.09)]">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-white">
                  <Icon
                    name={SERVICE_ICONS[i % SERVICE_ICONS.length]}
                    width={20}
                    height={20}
                  />
                </span>
                <h3 className="mt-5 text-xl font-bold leading-snug text-ink">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-body">
                  {item.body}
                </p>
                <ul className="mt-5 space-y-2.5">
                  {item.bullets.map((b, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-body"
                    >
                      <span
                        aria-hidden="true"
                        className="shrink-0 font-bold text-accent"
                      >
                        —
                      </span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
