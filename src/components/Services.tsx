import type { SiteContent } from "@/content/site";
import Arrow from "./Arrow";

type Props = { t: SiteContent["services"] };

// Four services as stacked editorial rows: title in a 1/3 column, body and
// bullets in a 2/3 column at lg; stacks to a single column on mobile/sm.
// Hairlines bracket the list and divide each row — no card chrome. Bullets
// use a small clay arrow glyph that echoes the brand mark.
export default function Services({ t }: Props) {
  return (
    <section id="services">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
        <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {t.title}
        </h2>

        <p className="mt-6 max-w-3xl text-lg text-body">{t.intro}</p>

        <ul className="mt-16 divide-y divide-rule border-y border-rule sm:mt-20">
          {t.items.map((item, i) => (
            <li
              key={i}
              className="grid gap-6 py-10 sm:py-12 lg:grid-cols-3 lg:gap-12 lg:py-14"
            >
              <div className="lg:col-span-1">
                <h3 className="text-xl font-semibold leading-snug text-ink sm:text-2xl">
                  {item.title}
                </h3>
              </div>
              <div className="lg:col-span-2">
                <p className="text-base leading-relaxed text-body">{item.body}</p>
                <ul className="mt-6 space-y-3">
                  {item.bullets.map((b, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-3 text-sm leading-relaxed text-body"
                    >
                      <span className="shrink-0 pt-1.5 text-accent">
                        <Arrow size="sm" />
                      </span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
