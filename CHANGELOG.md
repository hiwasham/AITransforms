# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Selected work portfolio (`/work`) with three anonymized case studies
  (support transformation, competitive intelligence, proposal turnaround),
  each with an index card and a deep case page. Fully localized in Persian
  (`/fa/work`) and Arabic (`/ar/work`) with RTL layout and locale-native
  numerals. Metrics support before/after deltas (e.g. 18% to 31% close rate).
- Homepage and footer now link to the full `/work` portfolio in all three
  locales; primary nav "Work" repointed to the portfolio index.
- EMPOWER visual system ported to the homepages and module pages: motion
  components (reveal, count-up, hero glow, particles, terminal), expanded icon
  set, and the `modules` content layer driving the three module deep pages
  (`operations-core`, `growth-engine`, `people-os`) across EN/FA/AR.

### Changed

- De-symmetrized the Framework section and switched numerals to solid blue
  (design review FINDING-001).

## [0.1.4.1] - 2026-08-11

### Added

- Warm-outreach v2 dashboard (`warm-outreach/lead-dashboard-v2.html`):
  single-file HTML/CSS/JS with a sequential funnel (built → written → sent
  → replied → booked), filterable lead table, slide-out detail panel with
  stage advance/regress and notes, localStorage-backed persistence
  (`warm-outreach-v2`), JSON export, and a seed of the five active leads
  that loads only when no saved state exists. Mirror of the dashboard's
  full build specification lives at
  `warm-outreach/prompts/v2-dashboard-build.md` for future iteration.

### Changed

- Visual polish on the warm-outreach v2 dashboard: visible keyboard focus,
  44px touch targets, safe-area padding for notch devices, balanced headline
  text, and active/pressed states on the primary buttons
  (design findings 001, 005, 007, 008).

### Fixed

- Pre-landing review fixes for the warm-outreach v2 dashboard: keyboard
  focus now visible on search, status filter, stage picker, notes, delete,
  and close buttons; icon-only buttons carry `aria-label`s; the brand
  subtitle and progress bar read from the real lead count (no more
  contradiction after delete, no NaN% on empty state); `sentDate` is
  cleared when a lead regresses off the `sent` stage; lead ids in row
  metadata are numeric-coerced and outbound links pass a scheme allowlist
  before escaping.

## [0.1.4] - 2026-08-02

### Added

- Login-protected outreach review dashboard with persistent CSV imports,
  keyboard-first approve/reject/next actions, rejection-reason tags, and a
  visible simulation-only boundary that cannot construct sending integrations.
- Hardened systemd, Infisical, backup, restore, rollback, and smoke-test
  artifacts for a private-first Finland deployment behind Tailscale Funnel.
- Unit, contract, integration, browser-client, and restart-durability coverage
  for authentication, HTTP limits, audit events, review state, and failure paths.

### Fixed

- Malformed CSV quoting now preserves later rows; missing-company prospects stay
  visible with stable deduplication; invalid JSON mutation bodies return fixed
  400 responses instead of server errors.
- Failed dashboard actions stay on the current prospect, expired sessions return
  to login, and imported non-HTTPS links remain inert in the browser.
- Safe audit events now cover login and mutation failures without retaining raw
  credentials, cookies, bootstrap tokens, or prospect content.

## [0.1.3] - 2026-07-31

### Changed

- Updated Next.js and its ESLint integration to 16.2.12, with locked PostCSS
  and Sharp versions for the production website dependency update.

## [0.1.2] - 2026-07-26

### Fixed

- Restored production builds by removing committed Git conflict markers from
  the shared Next.js font loader.

## [0.1.1] - 2026-06-24

### Fixed

- Header section-navigation anchors (Services, Process, Contact) now resolve to
  the locale homepage instead of dead-linking on `/work` pages, where a bare
  `#services` had been resolving to `/work#services` (ISSUE-001).
- Directional arrows (`→` / `←`) now mirror correctly under RTL on the homepage
  and `/work` pages, and are marked `aria-hidden` so screen readers no longer
  announce them.

### Added

- Test suite: Vitest + React Testing Library, with component tests pinning the
  header-anchor and RTL-arrow fixes, a GitHub Actions test workflow, and
  `TESTING.md`.

## [0.1.0] - 2026-06-08

### Added

- Baseline version tracking (`VERSION`) and this changelog.
- AITransforms V1 marketing site: localized homepages (`/`, `/fa`, `/ar`) and
  AI Transformation Review apply flow (`/apply`, `/fa/apply`, `/ar/apply`).

This `0.1.0` entry establishes the starting point for version tracking. It does
not reconstruct the full pre-0.1.0 history; earlier work lives in the git log and
`docs/PROJECT-HANDOFF.md`.
