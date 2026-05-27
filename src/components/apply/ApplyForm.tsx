"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import type { ApplyContent } from "@/content/apply";

type Props = { t: ApplyContent["form"] };

type FormState = {
  name: string;
  email: string;
  company: string;
  website: string;
  helpWith: string;
  existing: string;
  bottleneck: string;
  interests: string[];
  language: string;
  consent: boolean;
};

const BASE_INITIAL_STATE: Omit<FormState, "language"> = {
  name: "",
  email: "",
  company: "",
  website: "",
  helpWith: "",
  existing: "",
  bottleneck: "",
  interests: [],
  consent: false,
};

const TO_EMAIL = "iranfluent.com@gmail.com";
const SUBJECT = "AI Transformation Review Application";
const TEXTAREA_MAX = 1000;

// ApplyForm. Client component — the only interactive component in Phase 3.
// No backend, no API route, no server action. Submit builds a structured
// mailto body and hands off to the user's mail client. The visible fallback
// line below the submit button gives users without a configured mail handler
// a clear path to email manually.
export default function ApplyForm({ t }: Props) {
  const f = t.fields;
  // Default language radio = the page's own language (first option per locale).
  const [form, setForm] = useState<FormState>(() => ({
    ...BASE_INITIAL_STATE,
    language: f.language.options[0],
  }));

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleInterest(option: string) {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(option)
        ? prev.interests.filter((i) => i !== option)
        : [...prev.interests, option],
    }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.consent) return;

    // Body labels mirror the visible form labels so the submitter sees their
    // compose window in the same language as the page they applied from.
    const lines = [
      `${f.name.label}: ${form.name}`,
      `${f.email.label}: ${form.email}`,
      `${f.company.label}: ${form.company}`,
      `${f.website.label}: ${form.website || "—"}`,
      "",
      `${f.helpWith.label}`,
      form.helpWith || "—",
      "",
      `${f.existing.label}`,
      form.existing || "—",
      "",
      `${f.bottleneck.label}`,
      form.bottleneck || "—",
      "",
      `${f.interests.label}: ${
        form.interests.length ? form.interests.join(", ") : "—"
      }`,
      `${f.language.label}: ${form.language}`,
      "",
      `${f.consent.label.replace(/[.]\s*$/, "")}: yes`,
    ];

    const subject = encodeURIComponent(SUBJECT);
    const body = encodeURIComponent(lines.join("\n"));
    window.location.href = `mailto:${TO_EMAIL}?subject=${subject}&body=${body}`;
  }

  return (
    <section id="form">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
        {t.eyebrow ? (
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            {t.eyebrow}
          </p>
        ) : null}
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {t.title}
        </h2>
        <p className="mt-6 text-base leading-relaxed text-body">{t.intro}</p>

        <form onSubmit={handleSubmit} className="mt-12 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label={f.name.label} required>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label={f.email.label} required>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label={f.company.label} required>
              <input
                type="text"
                required
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label={f.website.label} help={f.website.help}>
              <input
                type="url"
                value={form.website}
                onChange={(e) => update("website", e.target.value)}
                placeholder="https://"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label={f.helpWith.label} required>
            <textarea
              required
              maxLength={TEXTAREA_MAX}
              placeholder={f.helpWith.placeholder}
              value={form.helpWith}
              onChange={(e) => update("helpWith", e.target.value)}
              className={`${inputClass} min-h-32 resize-y`}
            />
          </Field>

          <Field label={f.existing.label}>
            <textarea
              maxLength={TEXTAREA_MAX}
              placeholder={f.existing.placeholder}
              value={form.existing}
              onChange={(e) => update("existing", e.target.value)}
              className={`${inputClass} min-h-32 resize-y`}
            />
          </Field>

          <Field label={f.bottleneck.label}>
            <textarea
              maxLength={TEXTAREA_MAX}
              placeholder={f.bottleneck.placeholder}
              value={form.bottleneck}
              onChange={(e) => update("bottleneck", e.target.value)}
              className={`${inputClass} min-h-32 resize-y`}
            />
          </Field>

          <fieldset>
            <legend className="text-sm font-medium text-ink">
              {f.interests.label}
            </legend>
            {f.interests.help ? (
              <p className="mt-1 text-xs text-muted">{f.interests.help}</p>
            ) : null}
            <div className="mt-3 space-y-2">
              {f.interests.options.map((opt) => (
                <label
                  key={opt}
                  className="flex cursor-pointer items-center gap-3 text-sm text-body"
                >
                  <input
                    type="checkbox"
                    checked={form.interests.includes(opt)}
                    onChange={() => toggleInterest(opt)}
                    className="accent-[color:var(--color-accent)]"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-ink">
              {f.language.label}
            </legend>
            <div className="mt-3 space-y-2">
              {f.language.options.map((opt) => (
                <label
                  key={opt}
                  className="flex cursor-pointer items-center gap-3 text-sm text-body"
                >
                  <input
                    type="radio"
                    name="language"
                    value={opt}
                    checked={form.language === opt}
                    onChange={(e) => update("language", e.target.value)}
                    className="accent-[color:var(--color-accent)]"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="flex cursor-pointer items-start gap-3 text-sm text-body">
            <input
              type="checkbox"
              required
              checked={form.consent}
              onChange={(e) => update("consent", e.target.checked)}
              className="mt-1 accent-[color:var(--color-accent)]"
            />
            <span>
              {f.consent.label}
              <span aria-hidden="true" className="ms-1 text-accent-strong">
                *
              </span>
            </span>
          </label>

          <div>
            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-ink px-8 py-4 text-base font-medium text-white transition-colors hover:bg-accent-strong"
            >
              {t.submitLabel}
            </button>
            <p className="mt-4 text-sm text-muted">
              Or email us directly at{" "}
              <a
                href={`mailto:${TO_EMAIL}`}
                className="text-ink underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:decoration-accent-strong"
              >
                {TO_EMAIL}
              </a>
              .
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}

const inputClass =
  "w-full rounded-md border border-rule bg-surface px-4 py-3 text-base text-ink placeholder:text-muted";

function Field({
  label,
  help,
  required,
  children,
}: {
  label: string;
  help?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">
        {label}
        {required ? (
          <span aria-hidden="true" className="ms-1 text-accent-strong">
            *
          </span>
        ) : null}
        {help ? (
          <span className="ms-2 text-xs font-normal text-muted">{help}</span>
        ) : null}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
