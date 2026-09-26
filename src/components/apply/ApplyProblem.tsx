import type { ApplyContent } from "@/content/apply";

type Props = { t: ApplyContent["problem"] };

// Hairlined editorial rows. Each point is led by a short clay vertical accent
// bar that distinguishes this section from the home Problem's large clay
// serif numerals, while keeping the brand palette consistent. Title typography
// is editorial (text-xl sm:text-2xl semibold); body is comfortable reading
// width via max-w-3xl.
export default function ApplyProblem({ t }: Props) {
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
            <li key={i} className="py-8 sm:py-10 lg:py-12">
              <div className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="mt-1 h-6 w-0.5 shrink-0 bg-accent sm:mt-2 sm:h-7"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold leading-snug text-ink sm:text-2xl">
                    {point.title}
                  </h3>
                  <p className="mt-3 max-w-3xl text-base leading-relaxed text-body">
                    {point.body}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
