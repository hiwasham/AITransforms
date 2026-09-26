import type { ApplyContent } from "@/content/apply";

type Props = { t: ApplyContent["diagnostic"] };

// Business Brain Readiness Check. Each diagnostic is rendered as a hairlined
// editorial row in a 3-col grid at lg: clay-strong "Diagnostic NN" label +
// title in col 1, body in col-span-2. Stacks to a single column on mobile/sm.
// The "Diagnostic NN" label is generated from the index — translation later
// would lift the prefix into apply.ts.
export default function Diagnostic({ t }: Props) {
  return (
    <section id="diagnostic">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-24 lg:px-12 lg:py-32">
        {t.eyebrow ? (
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            {t.eyebrow}
          </p>
        ) : null}

        <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {t.title}
        </h2>

        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-body">
          {t.intro}
        </p>

        <ol className="mt-12 divide-y divide-rule border-y border-rule sm:mt-16 lg:mt-20">
          {t.items.map((item, i) => (
            <li
              key={i}
              className="grid gap-4 py-8 sm:py-10 lg:grid-cols-3 lg:gap-12 lg:py-12"
            >
              <div className="lg:col-span-1">
                <p className="text-xs uppercase tracking-[0.18em] text-accent-strong">
                  {t.itemLabel} {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-xl font-semibold leading-snug text-ink sm:text-2xl">
                  {item.title}
                </h3>
              </div>
              <p className="text-base leading-relaxed text-body lg:col-span-2">
                {item.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
