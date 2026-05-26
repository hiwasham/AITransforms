import type { SiteContent } from "@/content/site";

type Props = { t: SiteContent["founder"] };

// Personal, credible, founder-led. The display name is the H2 with a clay
// underline; role sits beneath in body color; credentials become an editorial
// CV-style list with hairlines between items, no bullet glyphs. No photo, no
// socials, no fake credentials added.
export default function Founder({ t }: Props) {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              {t.title}
            </p>

            {t.name ? (
              <h2 className="mt-6 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                <span className="underline decoration-accent decoration-2 underline-offset-[12px]">
                  {t.name}
                </span>
              </h2>
            ) : null}

            {t.role ? (
              <p className="mt-8 max-w-md text-base text-body sm:text-lg">
                {t.role}
              </p>
            ) : null}

            <p className="mt-6 max-w-md text-lg leading-relaxed text-body">
              {t.body}
            </p>
          </div>

          <div className="mt-12 lg:mt-0 lg:border-s lg:ps-16">
            {t.credentialsLabel ? (
              <p className="text-xs uppercase tracking-[0.18em] text-muted">
                {t.credentialsLabel}
              </p>
            ) : null}
            <ul className="mt-6 divide-y divide-rule border-y border-rule">
              {t.credentials.map((c, i) => (
                <li
                  key={i}
                  className="py-4 text-sm leading-relaxed text-body sm:py-5"
                >
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
