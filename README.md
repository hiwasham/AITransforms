# AITransforms

AI transformation studio website. Turns business knowledge, workflows, and documents into practical AI systems.

Static Next.js site with three locale routes:

- `/` — English (LTR)
- `/fa` — Persian (RTL)
- `/ar` — Arabic (RTL)

## Tech stack

- Next.js 16 (App Router, static export)
- React 19
- Tailwind CSS 4
- TypeScript 5

No CMS, database, authentication, or environment variables required.

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

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Vercel auto-detects Next.js. No environment variables or build overrides needed.
4. Deploy.

All three routes (`/`, `/fa`, `/ar`) are statically generated at build time.
