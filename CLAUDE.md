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

## GBrain Search Guidance (configured by /sync-gbrain)
<!-- gstack-gbrain-search-guidance:start -->

GBrain is set up and synced on this machine. The agent should prefer gbrain
over Grep when the question is semantic or when you don't know the exact
identifier yet.

**This worktree is pinned to a worktree-scoped code source** via the
`.gbrain-source` file in the repo root (kubectl-style context).
`gbrain code-def`, `code-refs`, `code-callers`, `code-callees`, `search`, and
`query` from anywhere under this worktree route to that source by default —
no `--source` flag needed (gbrain >= 0.41.38.0; on older gbrain the call-graph
commands need `--source "$(cat .gbrain-source)"`). Conductor sibling worktrees
of the same repo each have their own pin and their own indexed pages, so
semantic results match the code on disk here.

Call-graph queries (`code-callers`/`code-callees`) also need the graph to be
built first — run `/sync-gbrain --dream` (or `--full`) if they return
`count: 0`. This only works if this source's gbrain schema pack extracts code
symbols; on a non-code-aware pack `--dream` completes but the graph stays empty
and reports a WARN. `code-def`/`code-refs` need the same extraction.

Two indexed corpora available via the `gbrain` CLI:
- This worktree's code (auto-pinned via `.gbrain-source`).
- `~/.gstack/` curated memory (registered as `gstack-brain-<user>` source via
  the existing federation pipeline).

Prefer gbrain when:
- "Where is X handled?" / semantic intent, no exact string yet:
    `gbrain search "<terms>"` or `gbrain query "<question>"`
- "Where is symbol Y defined?" / symbol-based code questions:
    `gbrain code-def <symbol>` or `gbrain code-refs <symbol>`
- "What calls Y?" / "What does Y depend on?":
    `gbrain code-callers <symbol>` / `gbrain code-callees <symbol>`
- "What did we decide last time?" / past plans, retros, learnings:
    `gbrain search "<terms>" --source gstack-brain-<user>`

Grep is still right for known exact strings, regex, multiline patterns, and
file globs. Run `/sync-gbrain` after meaningful code changes; for ongoing
auto-sync across all worktrees, run `gbrain autopilot --install` once per
machine — gbrain's daemon handles incremental refresh on a schedule.

Safety: don't run `/sync-gbrain` while `gbrain autopilot` is active — the
orchestrator refuses destructive source ops when it detects a running autopilot
to avoid racing it (#1734). Prefer registering user repos with `gbrain sources
add --path <dir>` (no `--url`): URL-managed sources can auto-reclone, and the
sync code walk for them requires an explicit `--allow-reclone` opt-in.

<!-- gstack-gbrain-search-guidance:end -->
