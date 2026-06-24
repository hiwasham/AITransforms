# Testing

100% test coverage is the key to great vibe coding. Tests let you move fast,
trust your instincts, and ship with confidence — without them, vibe coding is
just yolo coding. With tests, it's a superpower.

## Framework

- **Vitest 4** as the runner (`vitest.config.ts`), jsdom environment.
- **@testing-library/react** for rendering and querying components.
- **@testing-library/jest-dom** for DOM matchers (`toHaveAttribute`, `toHaveClass`, …).

Shared setup lives in `test/setup.ts`: it loads the jest-dom matchers, mocks
`next/link` to a plain anchor (so components render without the App Router
runtime), and stubs `IntersectionObserver` (jsdom has none; the `Reveal` motion
island observes one).

## Running tests

```bash
npm run test        # one-shot run (CI mode)
npm run test:watch  # watch mode during development
```

Full local verification before pushing (matches CI in `.github/workflows/test.yml`):

```bash
npm run lint
npx tsc --noEmit
npm run test
npm run build
```

## Test layers

- **Unit / component tests** — colocated next to the component as
  `*.test.tsx` (e.g. `src/components/Header.test.tsx`). Render the component
  with `@testing-library/react`, then assert on roles, text, and attributes.
  This is where the bulk of coverage lives for a static site like this.
- **Integration** — render a component together with its real children
  (the Header tests render the real `LanguageSwitcher` / `Wordmark`).
- **E2E** — not set up yet. If user-flow coverage is needed later, Playwright
  is the natural fit and can drive `npm run dev`.

## Conventions

- File naming: `<Component>.test.tsx` colocated with the component.
- Assert real behavior, not existence. Prefer `getByRole` / `getByText` and
  concrete attribute assertions over `toBeDefined()`.
- One `describe` per component; one `it` per behavior.
- Never import secrets, API keys, or credentials into a test.
