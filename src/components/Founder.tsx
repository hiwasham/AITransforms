import type { SiteContent } from "@/content/site";
import Reveal from "./motion/Reveal";

type Props = { t: SiteContent["founder"] };

// Founder section, EMPOWER "built by an operator" framing: blue eyebrow,
// heading, body on the start side; a credentials card on the end side with
// hairline-separated rows. No photo, no socials, no invented numbers. The
// lg:border-s + lg:ps-* uses logical properties so the divider sits on the
// correct side in RTL.
export default function Founder({ t }: Props) {
  return (
    <section className="bg-page">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
              {t.title}
            </p>

            {t.name ? (
              <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.03em] text-ink sm:text-5xl">
                {t.name}
              </h2>
            ) : null}

            {t.role ? (
              <p className="mt-5 max-w-md text-base font-medium text-accent sm:text-lg">
                {t.role}
              </p>
            ) : null}

            <p className="mt-5 max-w-md text-base leading-[1.75] text-body">
              {t.body}
            </p>
          </Reveal>

          <Reveal delay={150}>
            <div className="mt-12 rounded-2xl border border-rule bg-surface p-8 lg:mt-0">
              {t.credentialsLabel ? (
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
                  {t.credentialsLabel}
                </p>
              ) : null}
              <ul className="mt-5 divide-y divide-rule">
                {t.credentials.map((c, i) => (
                  <li
                    key={i}
                    className="py-4 text-sm leading-relaxed text-body first:pt-0 last:pb-0"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
