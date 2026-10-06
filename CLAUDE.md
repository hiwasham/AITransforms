Read CLAUDE.md and the AITransforms V1 Build Packet.

Do not code yet.

Create a practical implementation plan for the AITransforms V1 website.

Required sections:
- Header with language switcher
- Hero
- Problem
- Framework
- Services
- AI CEO Assistant / Local Agent spotlight
- Example Work / Case Studies
- Founder Credibility
- Resources Teaser
- CTA
- Footer

Languages:
- English default /
- Persian /fa with RTL
- Arabic /ar with RTL

Technical constraints:
- Use src/content/site.ts as the static content dictionary
- Prefer simple static routes
- Use Tailwind logical properties for RTL
- No CMS, database, authentication, blog, complex backend, or heavy dependencies

Output:
1. Recommended file/component structure
2. Recommended content structure in src/content/site.ts
3. How you will handle RTL
4. Implementation order
5. Verification commands
6. Risks or assumptions
7. What to cut if time runs short

Keep the plan practical.
Do not overengineer.
Wait for my approval before coding.

## Testing

Run tests with `npm run test` (Vitest, jsdom). Component tests are colocated as
`src/**/*.test.tsx`. See `TESTING.md` for framework setup and conventions.

Full local verification before pushing:

```bash
npm run lint
npx tsc --noEmit
npm run test
npm run build
```

Test expectations:
- 100% coverage is the goal — tests make vibe coding safe.
- New component or helper → write a corresponding test.
- Fixing a bug → write a regression test (e.g. the Header anchor and RTL-arrow
  tests pin ISSUE-001 and the RTL mirroring fix).
- Adding a conditional (if/else, locale branch) → test both paths.
- Never commit code that makes existing tests fail.

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
- Author a backlog-ready spec/issue → invoke /spec
