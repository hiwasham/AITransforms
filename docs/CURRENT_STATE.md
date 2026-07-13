# AITransforms — Current State

Analysis of the repository as of commit `95632d1` (branch
`feature/daily100openclawoutreach`, based on `main`). Read-only analysis — no
source was modified to produce this document. Where this contradicts
`docs/PROJECT-HANDOFF.md`, the source code was treated as ground truth (the
handoff doc is stale in places; see **Technical Debt**).

## 1. Project Purpose

AITransforms is a marketing/lead-generation website for a founder-led "AI
transformation studio." The business pitch (from `src/content/site.ts`): turn
a business's undocumented knowledge, workflows, and documents into practical
AI systems — assistants, RAG pipelines, adaptive coaching tools, and private
"AI CEO Assistant" agents. The site itself does not run any of these systems;
it is the sales surface for a services engagement, ending in an application
form (`/apply`) that hands off to email.

## 2. User-Facing Functionality

- **Homepage** (`/`, `/fa`, `/ar`) — Header, Hero, Problem, Framework (4-step
  process), Services (4 service lines), AI CEO Assistant spotlight, Case
  Studies teaser, Founder credibility, Resources teaser, CTA, Footer.
- **Module deep pages** (`/modules/growth-engine`, `/modules/operations-core`,
  `/modules/people-os`, each localized) — tabbed panels describing AI modules
  per business department.
- **Work portfolio** (`/work` index + 3 case-study pages: support
  transformation, competitive intelligence, proposal turnaround), each
  localized, with before→after metrics.
- **Apply flow** (`/apply`, `/fa/apply`, `/ar/apply`) — a client-side form
  (name, email, company, website, 3 free-text questions, service-interest
  checkboxes, language preference, consent) that on submit opens the user's
  mail client via a `mailto:` link with a prefilled, localized body. A visible
  fallback email link is shown as Plan B.
- **Language switcher** — EN / FA (RTL) / AR (RTL), preserves the current
  sub-path when switching (e.g. `/fa/apply` → `/ar/apply`).
- **SEO plumbing** — `sitemap.ts`, `robots.ts`, Open Graph/Twitter metadata,
  per-locale `<html lang dir>`.
- No login, no dashboard, no user accounts, no data persistence for visitors.

## 3. Architecture

Pure static Next.js App Router site. No backend of any kind:

- **No API routes** — no `route.ts`/`route.tsx` anywhere under `src/app`.
- **No server actions** — no `"use server"` directive anywhere.
- **No database, no CMS, no auth.**
- **No outbound network calls** — no `fetch(`/`axios` usage in `src/`.
- **No environment variables** — no `process.env` reference in `src/`; README
  and handoff doc both confirm "no environment variables required."
- Only one component is interactive/stateful client-side beyond motion
  effects: `ApplyForm.tsx` (`"use client"`, local `useState`, `mailto:` submit).
  Seven other files are `"use client"` for browser-only concerns
  (`usePathname`, IntersectionObserver-driven reveal/count-up/particle motion).
- Content is fully separated from markup: three locale-keyed dictionaries —
  `src/content/site.ts` (homepage/footer/nav), `src/content/apply.ts` (apply
  flow), `src/content/modules.ts` and `src/content/work.ts` (module/portfolio
  pages) — each `as const` so the `Locale` union and field shapes are
  compiler-checked across `en`/`fa`/`ar`.
- Rendering is 100% static generation at build time (confirmed by README/
  handoff; no `dynamic`, `revalidate`, or data-fetching hooks found).

## 4. Next.js Structure

- Next.js 16.2.6, App Router, React 19.2.4, TypeScript 5, Tailwind CSS 4.
- Locale isolation via **route groups with independent root layouts**
  (the Phase 5 fix for handoff-doc limitation #1 — this has already shipped,
  contradicting the "known limitation" write-up):
  - `src/app/(en)/layout.tsx` → `<html lang="en" dir="ltr">`
  - `src/app/(fa)/layout.tsx` → `<html lang="fa" dir="rtl">`
  - `src/app/(ar)/layout.tsx` → `<html lang="ar" dir="rtl">`
  Each route group owns its own `<html>`/`<body>`, so the correct `lang`/`dir`
  is set at the document root per locale (not just a nested `<div>` as the
  handoff doc describes).
- Route layout:
  - `(en)` group → `/`, `/apply`, `/modules/*`, `/work`, `/work/*`
  - `(fa)` group → `/fa`, `/fa/apply` (route-grouped)
  - `fa/modules/*`, `fa/work/*` are plain nested routes (not inside the `(fa)`
    group) — same for `ar/modules/*`, `ar/work/*`. This is an inconsistency:
    fa/ar module and work pages sit outside the route-group layout that sets
    `dir="rtl"` at the `<html>` level, while the fa/ar homepage and apply pages
    are inside it. Worth confirming these still render dir="rtl" correctly
    (likely via a `dir` attribute set at a lower element) rather than
    inheriting it from the root layout.
- `src/app/fonts.ts` centralizes font loading (`next/font/google` for
  Geist/Instrument Serif/IBM Plex Sans Arabic/Noto Sans Arabic; local
  `@font-face` for IRANSans).
- `sitemap.ts`/`robots.ts` live at `src/app/` (not per-locale).

## 5. Frontend/Backend Separation

There is no backend to separate from — this is a frontend-only static site.
"Backend" logic is limited to build-time static generation. The one
data-submission path (`ApplyForm`) intentionally has no server component: it
constructs a `mailto:` URL client-side and hands off to the OS mail client.
This is a deliberate, documented design choice (see `PROJECT-HANDOFF.md` §7),
not an oversight — but it does mean AITransforms (the business) has **no
visibility into form submissions** unless the visitor's mail client succeeds
and they actually hit send.

## 6. API Routes or Server Actions

None exist. Confirmed by:
- `find src/app -iname "route.ts*"` → no results.
- `grep -rl "use server"` → no results.
- `grep -rn "process.env"` → no results.

## 7. OpenClaw Integration

**None found.** `grep -ril "openclaw"` across `*.ts`, `*.tsx`, `*.md`, `*.json`
returns zero matches anywhere in the repository (including `src/`, `docs/`,
`public/`, `.specify/`). There is no OpenClaw client, webhook, API key
reference, or integration code of any kind in this codebase.

## 8. `daily100openclawoutreach` Feature

**Not implemented.** This is the name of the current git branch
(`feature/daily100openclawoutreach`), but a diff against `main`
(`git diff main..feature/daily100openclawoutreach --stat`) shows the branch
only adds spec-kit tooling scaffolding:
- `.claude/skills/speckit-*/SKILL.md` (10 skill files)
- `.specify/` directory (scripts, templates, workflows, constitution,
  integration manifests)

No application code, content, route, or component related to "daily100" or
"outreach" exists — `grep -ril "outreach"` also returns zero matches. There is
also no `specs/` directory yet, meaning no `/speckit-specify` has been run for
this feature. **The branch name describes intent; the feature itself has not
been started.**

## 9. Dependencies

**Runtime** (`package.json` `dependencies`):
| Package | Version |
|---|---|
| next | 16.2.6 |
| react | 19.2.4 |
| react-dom | 19.2.4 |

Only three runtime dependencies — deliberately minimal, consistent with the
project's "no heavy dependencies" constraint.

**Dev dependencies**: Tailwind CSS 4 (+ `@tailwindcss/postcss`), TypeScript 5,
ESLint 9 (+ `eslint-config-next`), Vitest 4 (+ `@vitejs/plugin-react`, jsdom),
React Testing Library 16 (+ `jest-dom`), `@types/*` for node/react/react-dom.

No state management library, no data-fetching library, no UI component
library, no animation library beyond hand-rolled motion components using
native `IntersectionObserver`/CSS.

## 10. Environment Variables

**None.** No `.env*` files exist in the repo (only `.gitignore` rules for
them), no `process.env` reads in source, and README/handoff docs both state
explicitly that no environment variables are required for local dev, build,
or Vercel deploy.

## 11. Data Flow

```
Locale dictionaries (site.ts / apply.ts / modules.ts / work.ts)
        │  (build time, static import)
        ▼
Page components (src/app/**/page.tsx)
        │  (props)
        ▼
Section components (Hero, Problem, ApplyForm, ...)
        │
        ▼
Static HTML/CSS at build time  ──▶  Vercel CDN  ──▶  Browser
                                                        │
                                          ApplyForm collects input
                                          (client-side React state)
                                                        │
                                          window.location.href = "mailto:..."
                                                        │
                                          User's own mail client
                                                        │
                                          Manual "Send" by the user
                                                        │
                                    iranfluent.com@gmail.com (inbox)
```

There is no data flow back into the application — no analytics, no database
write, no API call. The only "submission" leaves the browser via the
operating system's registered mail handler, entirely outside the app's
control or observability.

## 12. Technical Debt

1. **`docs/PROJECT-HANDOFF.md` is stale** — it documents `<html lang>` always
   being `"en"` with RTL via nested `<div>` as a *current* limitation (§8.1)
   and lists per-locale root layouts, sitemap/robots, and OG/Twitter meta as
   Phase 5 *backlog* items, but all of these have already shipped in source.
   The handoff doc should be refreshed or clearly marked historical.
2. **Test coverage is far below the stated 100% goal** — `CLAUDE.md` states
   "100% coverage is the goal" and requires a test for every new component,
   but only 4 test files exist (`Header.test.tsx`, `CaseStudies.test.tsx`,
   `WorkIndexShell.test.tsx`, `WorkProjectShell.test.tsx`) against 33
   non-test components. `ApplyForm` (the only stateful, business-critical
   component — the sole path a lead can convert through) has no test at all.
3. **CI does not run `npm run build`** — `.github/workflows/test.yml` runs
   lint, typecheck, and `vitest run` but never `next build`. A build-breaking
   change (e.g. bad metadata export, invalid route conflict) could pass CI
   and still fail on Vercel.
4. **`sitemap.ts` is missing routes** — it lists only the 6 original homepage/
   apply routes; the `/work` index, 3 work case pages, and 3 module pages
   (×3 locales = 21 more URLs) added later are absent from the sitemap.
5. **Inconsistent route grouping for fa/ar** — `(fa)`/`(ar)` route groups
   (with locale root layouts) hold only the homepage and apply page; the
   module and work pages for fa/ar live in plain `src/app/fa/...` and
   `src/app/ar/...` folders outside those groups. Worth confirming RTL/lang
   still renders correctly there and consolidating for consistency.
6. **fa/ar copy is V1 machine translation**, not reviewed by a native speaker
   — flagged consistently in-repo (`work.ts`, `modules.ts` comments,
   `CHANGELOG.md`) but still outstanding.
7. **`public/` carries substantial dead weight**: unused IRANSans font weight
   directories (Light/UltraLight/Black, the `(FaNum)` tree), a `.zip` archive
   of the original font pack, a preview PNG, and several standalone reference
   HTML mockups and zip bundles (`empowerlabs-nextjs.zip`, `portfolio.html`,
   `10_empowerlabs_exact_clone*.html`, `files.zip`, `portfolio_all_files.zip`,
   several numbered `_(1)`/`_(2)` duplicate HTML files) — none referenced by
   the app, all publicly served at their `/*.html`/`/*.zip` URLs. ~4.2 MB in
   `public/fonts/` alone, plus the loose HTML/zip files.
8. **No submission tracking** — by design (no backend), the business cannot
   tell whether a visitor who opened the mail composer actually sent the
   email. There is no analytics of any kind.
9. **`feature/daily100openclawoutreach` branch is empty of feature work** —
   only spec-kit tooling has been added; the constitution was just ratified
   (v1.0.0) but no spec/plan/tasks exist yet for the named feature.
10. **`mailto:` URL length risk** — documented in the handoff doc (§8 item 6)
    and still true: three 1000-char textareas plus Persian/Arabic text can
    produce URLs in the tens of KB, which some legacy mail clients truncate.

## 13. Risks

- **Single point of failure for lead capture**: the entire business funnel
  depends on the visitor's device having a configured mail client and the
  visitor completing the send step manually. Any failure here (no mail
  client configured, popup blocked, `mailto:` URL truncated) is invisible to
  AITransforms — no error, no partial capture, no retry.
- **No secrets to leak, but also no secrets management to build on**: if an
  "OpenClaw" or "outreach automation" feature is added later (per the branch
  name), it will very likely require a backend, API keys, and env vars for
  the first time in this project's life — none of the current tooling
  (no env handling, no API routes, no server actions) is in place for that,
  so it will be new architectural surface area, not an extension of existing
  patterns.
- **Public exposure of internal/reference files** in `public/` (mockup HTML,
  zip bundles) could leak earlier design iterations or unused code to anyone
  who finds the URL; low severity (no secrets found in a spot check) but
  should be reviewed before treating it as fully safe.
- **Translation quality risk**: fa/ar content shipped to real prospects is
  V1 machine translation on a page (`/apply`) meant to build trust with the
  reader before they hand over contact info.
- **Sitemap under-reporting** risks weaker SEO discovery for `/work` and
  `/modules/*` pages, which are among the more credibility-building content
  on the site.

## 14. Recommended Next Steps

1. Refresh `docs/PROJECT-HANDOFF.md` (or replace it with this document as the
   canonical state doc) so it reflects the shipped per-locale root layouts,
   sitemap/robots, and OG metadata — stop it from describing shipped work as
   backlog.
2. Add `npm run build` to `.github/workflows/test.yml` so CI actually
   verifies the production build, matching the project's own documented
   local verification gate (lint + tsc + test + build).
3. Write a test for `ApplyForm.tsx` first — it is the single highest-value
   untested path (the actual lead-conversion mechanism), and CLAUDE.md
   already calls out "critical functionality" as the testing bar.
4. Update `sitemap.ts` to include the `/work` index, 3 work case pages, and
   3 module pages across all three locales.
5. Decide deliberately on the `(fa)`/`(ar)` route-group inconsistency —
   either move `modules/`/`work/` pages under the locale route groups for
   consistency, or document why they're intentionally separate.
6. Clean up `public/` — remove the unused IRANSans weight directories, the
   original zip, the preview PNG, and the standalone mockup HTML/zip files
   that predate the Next.js implementation, per Principle III (surgical
   changes) this should be a dedicated, reviewed cleanup task, not folded
   into unrelated work.
7. Before starting `daily100openclawoutreach` for real, run `/speckit-specify`
   to produce an actual spec — clarify what "OpenClaw integration" and
   "daily 100 outreach" mean concretely (what triggers it, what data it
   touches, whether it needs a backend/API routes/env vars for the first
   time in this project), since today there is zero code or documentation
   defining this feature's scope.
8. Schedule the native-speaker fa/ar translation review that has been
   flagged since Phase 4/CHANGELOG but not yet completed.
