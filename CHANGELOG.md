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
