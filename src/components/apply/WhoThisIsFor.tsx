import type { ApplyContent } from "@/content/apply";

type Props = { t: ApplyContent["whoThisIsFor"] };

// Editorial dictionary-entry layout — no hairlines, generous vertical
// spacing, title-left + body-right at lg. The lack of dividers (vs. the
// hairlined sections above) is the visual break: whitespace separates the
// personas instead of rules.
export default function WhoThisIsFor({ t }: Props) {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
        <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {t.title}
        </h2>

        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-body">
          {t.intro}
        </p>

        <dl className="mt-12 space-y-10 sm:mt-16 sm:space-y-12">
          {t.items.map((item, i) => (
            <div
              key={i}
              className="grid gap-3 lg:grid-cols-[1fr_2fr] lg:gap-16"
            >
              <dt className="text-xl font-semibold leading-snug text-ink sm:text-2xl">
                {item.title}
              </dt>
              <dd className="max-w-2xl text-base leading-relaxed text-body">
                {item.body}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
