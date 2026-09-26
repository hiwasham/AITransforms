# AITransforms

AI transformation studio website. Turns business knowledge, workflows, and documents into practical AI systems.

Static Next.js site with three locale routes:

- `/` — English (LTR)
- `/fa` — Persian (RTL)
- `/ar` — Arabic (RTL)

The repository also contains an isolated, login-protected outreach review
dashboard in `outreach-engine/`. It imports first-100 CSVs and records mock-only
review decisions; it cannot send outreach.

## Tech stack

- Next.js 16 (App Router, static export)
- React 19
- Tailwind CSS 4
- TypeScript 5

The website requires no CMS, database, authentication, or environment
variables. The separate outreach dashboard uses PGlite and runtime credentials.

## Local development

```bash
npm install
npm run dev
```

Opens at http://localhost:3000.

## Build and verify

```bash
npm run build
npm run lint
npx tsc --noEmit
```

The outreach dashboard has its own dependency lockfile and verification gate:

```bash
cd outreach-engine
npm ci
npm run typecheck
npm test
```

## Deploy the website to Vercel

1. Push this repo to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Vercel auto-detects Next.js. No environment variables or build overrides needed.
4. Deploy.

All three routes (`/`, `/fa`, `/ar`) are statically generated at build time.
The outreach dashboard is a long-running VPS service and must not be deployed to
Vercel. Follow its [private-first deployment guide](outreach-engine/ops/README.md).

## Documentation

- [Testing](TESTING.md)
- [Release workflow](docs/RELEASE-WORKFLOW.md)
- [Website project handoff](docs/PROJECT-HANDOFF.md)
- [Website V1 build packet](docs/AITransforms-V1-Build-Packet.md)
- [Outreach dashboard specification](specs/002-operator-review-dashboard/spec.md)
