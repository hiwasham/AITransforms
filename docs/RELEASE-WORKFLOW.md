# Release Workflow

This document defines how releases and deployments happen for AITransforms.

## Core rule

**All releases and production deployments must go through the gstack `/ship` workflow.**

Do not push directly to `main` to deploy, and do not deploy from local builds.
`main` is the production branch — Vercel auto-deploys it to `v1.aitransforms.ir`.
Every change reaches `main` through `/ship`, which runs the verify gate, updates
version and changelog, and opens the PR.

## What `/ship` does

`/ship` is the single entry point for shipping. In order, it:

1. Runs the verify gate (build, lint, typecheck) and refuses to proceed if any fail.
2. Bumps `VERSION` per semantic versioning.
3. Moves the `[Unreleased]` notes in `CHANGELOG.md` into a new dated version entry.
4. Squashes work-in-progress commits into clean, reviewable commits.
5. Opens a pull request against `main`.

Merging the PR to `main` triggers the Vercel production deploy. Other branches get
automatic Vercel preview URLs (also surfaced in the PR checks).

## Verify gate

These must all pass before anything ships. `/ship` runs them; you can run them
locally first:

```bash
npm run build        # Next.js static build (Turbopack)
npm run lint         # ESLint
npx tsc --noEmit     # TypeScript typecheck
```

## Versioning

- Source of truth is the `VERSION` file at the repo root.
- Follow [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`.
  - PATCH — fixes and copy/content tweaks with no structural change.
  - MINOR — new sections, routes, or features that are backward compatible.
  - MAJOR — breaking restructures (reserved; the `v1.` domain prefix leaves room
    for a future `v2`).
- Record every shipped change under the matching version heading in `CHANGELOG.md`.

## Changelog discipline

- Add notes under `## [Unreleased]` as you work.
- `/ship` promotes `[Unreleased]` to a dated, versioned section at release time.
- Keep entries grouped by `Added` / `Changed` / `Fixed` / `Removed`.

## Out of scope for `/ship`

No environment variables or Vercel build overrides are required. The site is fully
static with no backend, so there are no migrations, secrets, or post-deploy steps
to coordinate.
