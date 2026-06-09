import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/motion/Reveal";
import HeroGlow from "@/components/motion/HeroGlow";
import { Icon } from "@/components/icons";
import { siteContent, type Locale } from "@/content/site";
import {
  getWorkProject,
  getWorkLabels,
  workLinks,
  type WorkSlug,
} from "@/content/work";

type Props = { locale: Locale; slug: WorkSlug };

export function buildWorkProjectMetadata(
  locale: Locale,
  slug: WorkSlug,
): Metadata {
  const t = siteContent[locale];
  const p = getWorkProject(locale, slug);
  return {
    title: `${p.title} — ${t.footer.brand}`,
    description: p.problem,
  };
}

// One labeled block (heading + body). Logical spacing only, RTL-safe.
function Block({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-rule pt-6">
      <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-body">
        {label}
      </h2>
      <div className="mt-3 text-base leading-[1.75] text-ink">{children}</div>
    </div>
  );
}

// Shared shell for the work case pages (one per slug per locale). Mirrors
// ModulePageShell: localized Header, dark hero band, long-form case body,
// Footer. The "system shape" diagram is a generic inputs → processing →
// outputs flow (no client identifiers). It uses logical properties and an
// rtl:rotate-180 on the connector so horizontal flow mirrors under RTL.
export default function WorkProjectShell({ locale, slug }: Props) {
  const t = siteContent[locale];
  const labels = getWorkLabels(locale);
  const p = getWorkProject(locale, slug);
  const basePath = locale === "en" ? "" : locale === "fa" ? "/fa" : "/ar";

  return (
    <>
      <Header
        nav={t.nav}
        currentLocale={locale}
        cta={{ label: t.hero.primaryCta.label, href: t.hero.primaryCta.href }}
      />
      <main className="flex-1 bg-page">
        {/* Hero band */}
        <section className="relative overflow-hidden bg-inverse text-white">
          <HeroGlow />
          <div className="relative z-10 mx-auto max-w-3xl px-6 py-16 text-center sm:px-8 sm:py-20">
            <Reveal>
              <div className="flex items-center justify-center gap-3">
                <span
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${p.accent}26`, color: p.accent }}
                >
                  <Icon name={p.headerIcon} width={18} height={18} />
                </span>
                <p
                  className="text-xs font-bold uppercase tracking-[0.14em]"
                  style={{ color: p.accent }}
                >
                  {labels.categoryLabels[p.category]} · {p.sector}
                </p>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="mt-4 text-3xl font-black tracking-[-0.03em] sm:text-4xl">
                {p.title}
              </h1>
            </Reveal>
          </div>
        </section>

        <article className="mx-auto max-w-3xl px-6 py-16 sm:px-8 sm:py-20 lg:px-12">
          {/* Metric callout */}
          <Reveal>
            <div className="rounded-2xl border border-rule bg-surface p-7 text-center">
              <p
                className="text-4xl font-black tracking-[-0.03em] sm:text-5xl"
                style={{ color: p.accent }}
              >
                {p.metric.value}
              </p>
              <p className="mx-auto mt-2 max-w-md text-base leading-snug text-body">
                {p.metric.label}
              </p>
              <p className="mx-auto mt-4 max-w-md text-xs leading-relaxed text-body/80">
                {p.metricNote}
              </p>
            </div>
          </Reveal>

          <div className="mt-12 space-y-8">
            <Block label={labels.problemLabel}>{p.problem}</Block>
            <Block label={labels.beforeLabel}>{p.workflowBefore}</Block>
            <Block label={labels.systemLabel}>{p.systemDelivered}</Block>
            <Block label={labels.changedLabel}>{p.whatChanged}</Block>

            {/* System shape — generic, no client identifiers */}
            <Block label={labels.diagramLabel}>
              <div className="grid items-stretch gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
                <DiagramCell title={labels.diagramInputs} body={p.diagram.inputs} accent={p.accent} />
                <Connector />
                <DiagramCell title={labels.diagramProcessing} body={p.diagram.processing} accent={p.accent} />
                <Connector />
                <DiagramCell title={labels.diagramOutputs} body={p.diagram.outputs} accent={p.accent} />
              </div>
            </Block>

            <Block label={labels.methodLabel}>
              <ol className="space-y-3">
                {p.method.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span
                      className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                      style={{ backgroundColor: `${p.accent}1a`, color: p.accent }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-ink">{step}</span>
                  </li>
                ))}
              </ol>
            </Block>

            {p.constraints.length > 0 ? (
              <Block label={labels.constraintsLabel}>
                <ul className="space-y-2">
                  {p.constraints.map((c, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-relaxed text-body">
                      <span aria-hidden="true" className="shrink-0 text-accent">
                        —
                      </span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </Block>
            ) : null}

            <Block label={labels.roleLabel}>{p.founderRole}</Block>

            <Block label={labels.whyAnonymizedLabel}>
              <p className="text-sm leading-relaxed text-body">{p.whyAnonymized}</p>
            </Block>
          </div>

          {/* CTA + back link */}
          <Reveal>
            <div className="mt-14 rounded-2xl bg-inverse p-8 text-center text-white">
              <h2 className="text-xl font-extrabold tracking-[-0.02em] sm:text-2xl">
                {labels.ctaTitle}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-400">
                {labels.ctaBody}
              </p>
              <a
                href={t.hero.primaryCta.href}
                className="mt-6 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-bold text-ink transition hover:opacity-90"
              >
                {labels.ctaLabel}
              </a>
            </div>
          </Reveal>
          <div className="mt-8 text-center">
            <a
              href={`${basePath}/work`}
              className="text-sm font-bold text-accent hover:underline"
            >
              ← {labels.backToWork}
            </a>
          </div>
        </article>
      </main>
      <Footer
        t={t.footer}
        columns={[
          {
            heading: labels.eyebrow,
            links: workLinks(locale, basePath),
          },
          {
            heading: t.nav.contact,
            links: [
              { label: t.footer.contactLabel, href: t.footer.contactHref },
            ],
          },
        ]}
      />
    </>
  );
}

function DiagramCell({
  title,
  body,
  accent,
}: {
  title: string;
  body: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-rule bg-surface p-4 text-center">
      <p
        className="text-[0.65rem] font-bold uppercase tracking-[0.1em]"
        style={{ color: accent }}
      >
        {title}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-body">{body}</p>
    </div>
  );
}

// Arrow connector. rtl:rotate-180 flips the horizontal direction under RTL;
// the vertical (mobile, stacked) arrow is unaffected.
function Connector() {
  return (
    <div className="flex items-center justify-center text-body/50">
      <span className="hidden sm:inline rtl:rotate-180" aria-hidden="true">
        →
      </span>
      <span className="sm:hidden" aria-hidden="true">
        ↓
      </span>
    </div>
  );
}
