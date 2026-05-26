import type { SiteContent } from "@/content/site";

type Props = { t: SiteContent["problem"] };

// Editorial rows: large clay serif numeral leads each point, hairlines bracket
// the list. Replaces the V1 card grid with a deliberate, magazine-like layout
// that reads top-to-bottom in any locale. Latin numerals (01/02/03) are kept
// across locales as visual markers; the locale-specific Persian/Arabic digits
// are reserved for the Framework section, which receives them from site.ts.
export default function Problem({ t }: Props) {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
        <h2 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
          {t.title}
        </h2>

        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-body">
          {t.body}
        </p>

        <ol className="mt-16 divide-y divide-rule border-y border-rule sm:mt-20">
          {t.points.map((point, i) => (
            <li
              key={i}
              className="grid grid-cols-[auto_1fr] gap-x-6 py-8 sm:gap-x-10 sm:py-10 lg:gap-x-16 lg:py-12"
            >
              <span
                aria-hidden="true"
                className="font-display text-3xl leading-none text-accent sm:text-4xl lg:text-5xl"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-xl font-semibold leading-snug text-ink sm:text-2xl">
                  {point.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-body">
                  {point.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
