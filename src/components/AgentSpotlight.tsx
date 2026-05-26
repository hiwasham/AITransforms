import type { SiteContent } from "@/content/site";

type Props = { t: SiteContent["agentSpotlight"] };

// Inverted dark treatment so the differentiator visually breaks from the
// surrounding light sections. Not a dark-mode toggle — just an accent section.
export default function AgentSpotlight({ t }: Props) {
  return (
    <section className="border-y border-slate-900 bg-slate-900 text-white">
      <div className="mx-auto max-w-6xl px-6 py-24 lg:py-28">
        {t.eyebrow ? (
          <p className="text-sm font-medium uppercase tracking-wider text-gray-400">
            {t.eyebrow}
          </p>
        ) : null}

        <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {t.title}
        </h2>

        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-gray-300">
          {t.body}
        </p>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {t.bullets.map((b, i) => (
            <li key={i} className="flex gap-3 text-sm text-gray-300">
              <span aria-hidden="true" className="text-white">
                ·
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {t.note ? (
          <p className="mt-10 max-w-3xl text-sm italic text-gray-400">{t.note}</p>
        ) : null}
      </div>
    </section>
  );
}
