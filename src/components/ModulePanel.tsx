"use client";

import { useState } from "react";
import { Icon } from "./icons";
import type { ModulePage } from "@/content/modules";

type Props = { page: ModulePage };

// Interactive tabbed module panel. Mirrors the EMPOWER module-detail pages: a
// header chip, a 4-up tab strip, and a detail panel (metrics, how-it-works,
// impact, example, workflow, optional human-in-the-loop note) with prev/next
// navigation. The page's accent colour is applied via inline style so a single
// component serves all three departments. Directional spacing uses logical
// properties; flow arrows mirror under RTL via rtl:-scale-x-100.
export default function ModulePanel({ page }: Props) {
  const [active, setActive] = useState(0);
  const m = page.modules[active];
  const accent = page.accent;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8 lg:py-16">
      {/* Header */}
      <div className="flex items-center gap-3 rounded-2xl border border-rule bg-surface p-4">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-rule bg-page"
          style={{ color: accent }}
        >
          <Icon name={page.headerIcon} width={20} height={20} />
        </span>
        <div>
          <p className="text-base font-semibold text-ink">{page.title}</p>
          <p
            className="text-[0.7rem] font-semibold uppercase tracking-[0.06em]"
            style={{ color: accent }}
          >
            {page.eyebrow}
          </p>
        </div>
        <span className="ms-auto text-2xl font-semibold text-muted">
          {page.num}
        </span>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-body">{page.intro}</p>

      {/* Tabs */}
      <div className="mt-6 grid grid-cols-4 gap-2">
        {page.modules.map((mod, i) => {
          const isActive = i === active;
          return (
            <button
              key={mod.label}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={isActive}
              className="rounded-xl border bg-surface px-1.5 py-2.5 text-center transition-colors"
              style={{
                borderColor: isActive ? accent : "var(--rule)",
                background: isActive ? `${accent}14` : undefined,
              }}
            >
              <span
                className="mx-auto block w-fit"
                style={{ color: isActive ? accent : "var(--muted)" }}
              >
                <Icon name={mod.icon} width={18} height={18} />
              </span>
              <span
                className="mt-1 block text-[0.6rem] font-semibold uppercase tracking-[0.06em]"
                style={{ color: isActive ? accent : "var(--muted)" }}
              >
                {page.labels.moduleWord} {mod.tag}
              </span>
              <span className="mt-0.5 block text-xs font-medium leading-tight text-ink">
                {mod.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-rule bg-page">
        <div className="border-b border-rule p-5 sm:p-6">
          <p className="flex items-center gap-2 text-[0.95rem] font-semibold text-ink">
            <span style={{ color: accent }}>
              <Icon name={m.icon} width={16} height={16} />
            </span>
            {m.label}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-body">{m.desc}</p>
        </div>

        <div className="flex flex-col gap-4 p-5 sm:p-6">
          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2">
            {m.metrics.map((mt) => (
              <div
                key={mt.label}
                className="rounded-xl bg-surface p-3 text-center"
              >
                <span
                  className="block text-lg font-bold"
                  style={{ color: accent }}
                >
                  {mt.value}
                </span>
                <span className="mt-1 block text-[0.7rem] leading-tight text-body">
                  {mt.label}
                </span>
              </div>
            ))}
          </div>

          <Section label={page.labels.howItWorks} accent={accent} icon="ti-cpu">
            <p className="rounded-xl border border-rule bg-surface px-3 py-2.5 text-[0.8rem] leading-relaxed text-body">
              {m.how}
            </p>
          </Section>

          <Section
            label={page.labels.impact}
            accent={accent}
            icon="ti-trending-up"
          >
            <p className="rounded-xl border border-rule bg-surface px-3 py-2.5 text-[0.8rem] leading-relaxed text-body">
              {m.impact}
            </p>
          </Section>

          {m.example ? (
            <Section
              label={page.labels.example}
              accent={accent}
              icon="ti-bulb"
            >
              <div
                className="flex items-start gap-2 rounded-xl border px-3 py-2.5"
                style={{ borderColor: `${accent}40`, background: `${accent}10` }}
              >
                <span className="mt-0.5 shrink-0" style={{ color: accent }}>
                  <Icon name="ti-building" width={15} height={15} />
                </span>
                <span className="text-[0.78rem] leading-relaxed text-body">
                  {m.example}
                </span>
              </div>
            </Section>
          ) : null}

          <Section
            label={page.labels.workflow}
            accent={accent}
            icon="ti-arrow-right"
          >
            <div className="flex items-center gap-0 overflow-x-auto pb-1">
              {m.flow.map((step, i) => (
                <div key={i} className="flex shrink-0 items-center">
                  <span className="whitespace-nowrap rounded-lg border border-rule bg-surface px-2.5 py-1.5 text-[0.72rem] text-ink">
                    {step}
                  </span>
                  {i < m.flow.length - 1 ? (
                    <span
                      aria-hidden="true"
                      className="px-1.5 text-muted rtl:-scale-x-100"
                    >
                      <Icon name="ti-arrow-right" width={14} height={14} />
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </Section>

          {m.hitl ? (
            <div className="flex items-start gap-2 rounded-xl border border-rule bg-surface px-3 py-2.5">
              <span className="mt-0.5 shrink-0" style={{ color: accent }}>
                <Icon name="ti-user-check" width={15} height={15} />
              </span>
              <span className="text-[0.78rem] leading-relaxed text-body">
                <strong className="font-semibold text-ink">
                  {page.labels.humanInLoop}:
                </strong>{" "}
                {m.hitl}
              </span>
            </div>
          ) : null}
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between border-t border-rule bg-surface px-5 py-3 sm:px-6">
          <span
            className="flex items-center gap-1.5 text-[0.7rem] font-medium"
            style={{ color: accent }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: accent }}
            />
            {page.labels.moduleActive}
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setActive((i) => Math.max(0, i - 1))}
              disabled={active === 0}
              className="inline-flex items-center gap-1 rounded-lg border border-rule bg-page px-3 py-1.5 text-xs text-body transition hover:bg-surface disabled:opacity-35"
            >
              <span className="rtl:-scale-x-100">
                <Icon name="ti-arrow-left" width={13} height={13} />
              </span>
              {page.labels.prev}
            </button>
            <button
              type="button"
              onClick={() =>
                setActive((i) => Math.min(page.modules.length - 1, i + 1))
              }
              disabled={active === page.modules.length - 1}
              className="inline-flex items-center gap-1 rounded-lg border border-rule bg-page px-3 py-1.5 text-xs text-body transition hover:bg-surface disabled:opacity-35"
            >
              {page.labels.next}
              <span className="rtl:-scale-x-100">
                <Icon name="ti-arrow-right" width={13} height={13} />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Labeled section with an accent icon, used for how/impact/example/workflow.
function Section({
  label,
  accent,
  icon,
  children,
}: {
  label: string;
  accent: string;
  icon: Parameters<typeof Icon>[0]["name"];
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.07em] text-muted">
        <span style={{ color: accent }}>
          <Icon name={icon} width={13} height={13} />
        </span>
        {label}
      </span>
      {children}
    </div>
  );
}
