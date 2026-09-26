import type { ApplyContent } from "@/content/apply";

type Props = { t: ApplyContent["reassurance"] };

// Quiet closing trust statement. Sits below the form as a final reassurance
// about how applications are handled. Title demoted to a small editorial
// label (text-lg/xl medium-weight), points laid out in a 2-col grid at sm+
// with clay em-dash markers. Hairline above separates it from the form.
export default function Reassurance({ t }: Props) {
  return (
    <section>
      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <div className="border-t border-rule pt-12 sm:pt-16">
          <h2 className="text-lg font-medium text-ink sm:text-xl">
            {t.title}
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-4">
            {t.points.map((point, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm leading-relaxed text-body"
              >
                <span aria-hidden="true" className="shrink-0 text-accent">
                  —
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
