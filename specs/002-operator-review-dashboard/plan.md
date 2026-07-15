# Implementation Plan: Outreach Operator Review Dashboard

**Branch**: `feature/002-operator-review-dashboard` (spec-kit numbering:
`002-operator-review-dashboard`) | **Date**: 2026-07-15 | **Spec**:
[spec.md](./spec.md)

**Input**: Feature specification from
`specs/002-operator-review-dashboard/spec.md`

**Status**: Design complete; direction approved 2026-07-15 with an
operator-directed MVP scope reduction (spec.md §MVP-0). The design below
describes the full feature; §MVP-0 Build Scope narrows what is built
first. No code has been written.

**Scope note on artifacts**: per the operator's request this feature ships
three documents (`spec.md`, `plan.md`, `tasks.md`). The data model and API
contract that 001 kept in separate files (`data-model.md`, `contracts/`)
are inlined below (§Data Model, §API Contract) — same content discipline,
fewer files, proportionate to a feature this size.

## MVP-0 Build Scope (operator scope reduction, 2026-07-15)

The operator approved the direction but reduced the first build to the
review loop itself (spec.md §MVP-0). What this changes in the design
below — the *design* stays; only the build order narrows:

**Built in MVP-0**:
- `review_packages` table (unchanged from §Data Model, including the
  one-line reserved `source` column) — but **no `review_imports` table**:
  import history is deferred, and the import summary (added / duplicates /
  malformed) is computed and returned in the import response without a
  persistence table behind it. `review_packages.import_id` is replaced by
  a plain `source_name` text column until import history is actually
  needed (cheaper than carrying a dead FK).
- Domain: `review-package.ts` (repository), `importer.ts`,
  `review-order.ts` (pure). `send-ready.ts` is **not built** (copy/export
  deferred).
- API: `POST /review/imports`, `GET /review/packages/next`,
  `GET /review/packages/:id`, `POST /review/packages/:id/decision`
  (approve | reject | skip-as-next). **Not built**: `GET /review/packages`
  (list/filter), `PUT .../video-url`, `GET /review/export`.
- UI: the one-screen review page with `a`/`r`/`n` keys (approve / reject /
  next), auto-advance, do-not-advance-on-error, back-navigation, a
  minimal "N of M reviewed" indicator, empty and complete states.
  **Not built**: list view, video-URL input, copy button, export link,
  send-readiness warnings.
- The CSV-helper extraction (`src/lib/csv.ts`) still happens — the
  importer needs `parseCsvRows` regardless.

**Deferred with the features that need them** (tasks retained in
tasks.md's deferred phases): export + copy + send-ready module, video-URL
field usage (the column may ship in the schema; the endpoint/UI don't),
list/filter view, per-state progress counts, import-history persistence,
skip-tail *ordering guarantees* (MVP-0 commits only to "a passed-over
prospect is never lost and reappears before the queue reports complete"),
and everything in spec.md's deferred list.

**Unchanged by the reduction**: the Two-Queues boundary (nothing touches
001's state machine — that's an isolation rule, not a feature), the
zero-new-dependencies UI decision, decision durability (FR-009), the
textContent-only rendering rule, and the SC-006 before/after verification
gate. The MVP-0 exit gate is spec.md SC-000: import today's real CSV,
review 10 prospects, CSV never opened manually.

## Summary

Add a **review module** to the existing `outreach-engine/` service: an
importer that loads the first-100 CSV output
(`outreach-engine/out/first-100-*.csv`) into two new PGLite tables, a
small set of HTTP endpoints following the engine's existing
factory-route-handler pattern, and a single-page operator UI served by the
same T100 runtime — one prospect package per screen, single-keystroke
approve / reject / skip, durable decisions, resume, progress counts,
one-action copy of the send-ready message, and CSV export of approved
packages. The review module has its own tables and its own decision field;
it never touches 001's `workflow_state` machine, dispatch, webhooks, or
cadence (spec FR-018). The existing AITransforms static site is untouched
(spec FR-019). No new runtime dependencies: PGLite, the hand-rolled
router, and Vitest already in the engine are sufficient; the UI is one
static HTML page with vanilla JS, which is both the smallest thing that
satisfies the spec and the only choice that doesn't trip the
constitution's dependency gate.

## Technical Context

**Language/Version**: TypeScript, Node.js 24 (matches `outreach-engine/`,
run via `--experimental-transform-types` + the existing `loader.mjs`, same
as `npm run start`/`first-100`)

**Primary Dependencies**: none new. Reuses `@electric-sql/pglite` (the
engine's only runtime dependency), the engine's existing `server/app.ts`
flat router + `server/http.ts` node:http bridge (T100), and the exported,
already-unit-tested CSV helpers from the first-100 workflow (`parseCsvRows`,
`csvEscape`, `toCsv`-style serialization — extracted to a shared module,
see §Structure Decision). The UI is dependency-free static HTML/JS served
by the same process.

**Storage**: the engine's existing PGLite database — two new tables
(`review_packages`, `review_imports`), zero changes to any existing table.
Single-process ownership rules from 001 (`plan.md` Process Boundaries)
continue to hold: only the core service touches the DB, and this feature
adds no second process.

**Testing**: Vitest (the engine's existing suite and conventions —
factory handlers invoked directly with a per-test PGLite instance, no
running server needed).

**Target Platform**: the same Linux host / long-lived Node process that
already serves the engine (T100 runtime). Dashboard bound to localhost by
default (spec FR-020).

**Project Type**: extension of the existing isolated backend service —
new module inside `outreach-engine/`, nothing under the site's `src/`.

**Performance Goals**: decision round-trip (POST + next-package fetch)
well under 1 second locally (spec SC-002); import of a 100-row CSV in
seconds. Data scale is trivial (hundreds to low thousands of rows,
spec Assumptions).

**Constraints**: zero modification of the site (FR-019); zero interaction
with 001's workflow state machine / dispatch / webhooks / cadence
(FR-018); decisions must be durable and never silently lost (FR-009/
FR-013); import idempotent (FR-002); no new dependency without a
Principle III/XI justification — target: none at all; UI renders package
text strictly as text (spec Assumptions, Security Considerations below).

**Scale/Scope**: single operator, single machine, ~100 packages per batch,
cumulative low-thousands. No pagination/virtualization engineering.

## Constitution Check

*GATE: evaluated against `.specify/memory/constitution.md` v1.0.0 before
design; re-checked after design (§Post-Design Constitution Re-Check).*

| Principle | Verdict | Basis |
|---|---|---|
| I. Preserve Existing Functionality | **PASS** | Additive module: new tables, new routes appended to the router table, one surgical extraction of already-exported CSV helpers (pinned by the existing `first-100.test.ts` before and after). No existing route, table, or test changes behavior. |
| II. Incremental Change Over Rewrites | **PASS** | Replaces the operator's spreadsheet *workflow*, not any code. The first-100 generator keeps emitting the same CSV; the dashboard consumes it. Nothing is rewritten. |
| III. Avoid Unnecessary Dependencies | **PASS** | Zero new dependencies. The vanilla-HTML UI decision exists specifically to keep it that way (§UI Decision). |
| IV. Modular Architecture | **PASS** | New code lives in `domain/review/` + `api/review/` + `ui/`, following the engine's existing layer rules (ARCHITECTURE.md §7): domain never imports api, handlers stay factories, DB touched only via the core service. |
| V. Protect Credentials and Sensitive Data | **PASS** | No new credentials. Prospect PII stays in the existing DB, access posture unchanged (localhost-default, FR-020); package text never logged verbatim (§Observability). |
| VI. Observability by Default (NON-NEGOTIABLE) | **PASS, see Observability** | Every import (counts + malformed rows), every decision write, and every export is structured-logged via the existing `lib/logger.ts`; decision-persist failures are surfaced to the operator by design (FR-013), never swallowed. |
| VII. Production Reliability Over Quick Hacks | **PASS** | The whole feature is a reliability fix for the review step (durable decisions vs. hand-edited CSV cells). FR-013's do-not-advance-on-failed-write rule is the load-bearing reliability decision. |
| VIII. Document Architectural Decisions | **PASS** | This plan (esp. §UI Decision, §Two-Queues Decision) is that documentation, with rejected alternatives recorded. |
| IX. Test Critical Functionality | **PASS, see Testing Strategy** | Import idempotency, decision persistence/last-write-wins, skip ordering, `{{BFV_LINK}}` substitution, send-readiness warning, and export filtering are the named critical paths, all tested. |
| X. Follow Existing Project Conventions | **PASS** | Same language, test runner, route-factory pattern, error shape (`api/lib/errors.ts`), logger, and DB access rules as the rest of the engine. |
| XI. Justify New Technology Adoption | **PASS** | No new technology. The one place a new tool was tempting (a frontend framework) is explicitly evaluated and rejected in §UI Decision. |

**Additional Constraints check** ("no CMS, database, authentication
system... for functionality a static/simple implementation already
satisfies"): the database already exists (001's justified deviation);
this feature adds two tables to it rather than any new backend component.
The dashboard UI is deliberately the static/simple implementation. No new
auth is built (FR-020 reuses the localhost posture; the engine-wide
credential remains 001's open task T113, which this feature's routes will
sit behind when it lands — noted in §Security Considerations).

**Result**: Gate passes.

## Two-Queues Decision (relationship to 001)

The engine already has a `human_review_queue` workflow state and an
approve endpoint (`POST /prospects/:id/approve`) with a load-bearing
CHK003 contract. It is tempting to make this dashboard a UI over that
queue. The plan deliberately does **not** do that for the MVP, because the
packages the operator must review *today* do not exist in that queue —
they exist in the first-100 CSV (the batch pipeline that populates
`human_review_queue` is not the operator's current path to the first 100
sends, and its real LLM/scrape path is exercised by the first-100 script
instead). Building the dashboard over `OutreachAttempt` would mean first
building a CSV→OutreachAttempt backfill importer that fabricates workflow
states — more machinery, working against 001's state-machine invariants,
to review the same 100 rows.

Instead: **separate `review_packages` table, separate decision field, zero
contact with `workflow_state`** (spec FR-018). The seam for later
convergence is explicit and small: `ReviewPackage.source` is an enum
(`first100_csv` now; `engine_attempt` reserved), and a future importer can
project `human_review_queue` attempts into review packages whose approve
action *then* also calls the existing `/prospects/:id/approve` endpoint —
through its public contract, never around it. Nothing in the MVP schema or
API precludes that; nothing in the MVP implements it.

**Rejected alternative**: extending `outreach_attempts` with review
columns — rejected because it entangles a throwaway-speed MVP with the
engine's most invariant-laden table, violates FR-018's isolation, and
makes SC-006 (existing suite untouched) harder to guarantee.

## UI Decision

**Decision**: one static HTML page (`ui/index.html` + `ui/review.js`,
vanilla DOM + `fetch`, no build step) served by the existing T100 runtime
at `GET /` (localhost). Keyboard handling (`a`/`r`/`s`, arrow-back),
text-only rendering via `textContent`, clipboard via
`navigator.clipboard.writeText` with a select-fallback.

**Rationale**: the UI is one screen with five text areas, three buttons,
a counter, and a list view. A framework (React/Next.js — plan 001 names
Next.js as the eventual host, but it was never installed; the engine is
deliberately framework-free, ARCHITECTURE.md §1) would add the project's
largest dependency for its smallest surface, trip Principles III/XI, and
add a build step to a package that currently has none. Vanilla JS at this
scale is less code than the framework's boilerplate.

**Rejected alternatives**: (a) Next.js/React app — rejected per above;
adopting it belongs to the moment the engine actually installs Next.js
for route serving (001 deferred exactly that), not to this feature.
(b) Terminal UI (CLI review loop) — rejected: message text with wrapping,
links, and progress is materially better in a browser, and copy-to-
clipboard from a TUI over SSH is unreliable. (c) Serving the UI from the
AITransforms site — rejected outright: violates FR-019/001-FR-015
isolation.

## Project Structure

### Documentation (this feature)

```text
specs/002-operator-review-dashboard/
├── spec.md
├── plan.md              # this file (data model + API contract inlined)
└── tasks.md
```

### Source Code (all under `outreach-engine/`, nothing under site `src/`)

```text
outreach-engine/
├── src/
│   ├── lib/
│   │   └── csv.ts                    # EXTRACTED shared CSV helpers (parseCsvRows,
│   │                                 # csvEscape, row serialization) — moved from
│   │                                 # scripts/first-100.ts, which re-imports them;
│   │                                 # pinned by the existing first-100 unit tests
│   ├── domain/
│   │   └── review/
│   │       ├── review-package.ts     # entity + repository (CRUD, decision writes,
│   │       │                         # review-order query, counts)
│   │       ├── review-import.ts      # ImportRecord entity + repository
│   │       ├── importer.ts           # CSV rows -> packages: parse, normalize,
│   │       │                         # dedup (idempotency), carry flags (FR-001–003)
│   │       ├── review-order.ts       # pure: next-package + skip-to-end ordering (FR-006/007)
│   │       └── send-ready.ts         # pure: {{BFV_LINK}} substitution + readiness
│   │                                 # verdict (FR-014/017)
│   ├── api/
│   │   └── review/
│   │       ├── imports/route.ts      # POST /review/imports (CSV body)
│   │       ├── packages/route.ts     # GET /review/packages (list + filter + counts)
│   │       ├── packages/[id]/route.ts            # GET one (incl. substituted message + readiness)
│   │       ├── packages/[id]/decision/route.ts   # POST approve|reject|skip (+ undo via re-decide)
│   │       ├── packages/[id]/video-url/route.ts  # PUT video URL (FR-015)
│   │       └── export/route.ts       # GET /review/export (approved-only CSV, FR-016)
│   ├── ui/
│   │   ├── index.html                # the one-screen review page + list view + empty/done states
│   │   └── review.js                 # keyboard bindings, fetch calls, textContent-only rendering
│   ├── db/schema.ts                  # + review_packages, review_imports (additive)
│   └── server/app.ts                 # + review routes and static ui/ serving (additive rows
│                                     #   in the existing flat route table)
└── tests/
    ├── unit/                         # importer parsing/dedup, review-order, send-ready,
    │                                 # csv extraction pin
    ├── contract/                     # each /review/* endpoint's shape + error codes
    └── integration/                  # the three user-story independent tests (fixture CSV,
                                      # restart-resume, export round-trip)
```

**Structure Decision**: the review module lives inside `outreach-engine/`
rather than as a third top-level project because it shares the engine's
database, runtime process, logger, error shape, and test harness — a
separate project would duplicate all five for no isolation benefit (the
isolation that matters, from the *site*, is already guaranteed by being
under `outreach-engine/`; the isolation from 001's state machine is
guaranteed by §Two-Queues, not by process separation). The one existing
file touched beyond additive edits is `scripts/first-100.ts` (imports of
the extracted CSV helpers) — a pure move, pinned by its existing tests
(Principle I).

## Data Model (inlined — this feature's `data-model.md`)

### review_packages

One row per reviewable prospect package (spec Key Entities: Review
Package).

| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| dedup_key | text, unique, indexed | normalized company + source URL/host when present (lowercased, trimmed; reuses 001's normalization stance) — the FR-002 idempotency key |
| company | text | from CSV `company` |
| contact | text, nullable | from CSV `prospect` |
| research_summary | text | read-only in this feature |
| pain_point | text | the pain hypothesis, read-only |
| message_body | text | with `{{BFV_LINK}}` marker, read-only |
| bfv_link_telegram | text | as imported |
| video_url | text, nullable | the ONE operator-writable content field (FR-015); starts null; the CSV's `<<paste video link…>>` placeholder is treated as null at import |
| generator_flag | text, nullable | carried `approval_status` values that signal generation problems (`needs_research`) — drives FR-003/US1-Scenario-5 flagging |
| decision | enum | `pending` \| `approved` \| `rejected` — skip is NOT a decision (FR-006) |
| decided_at | timestamp, nullable | last decision write (last-write-wins, FR-010) |
| skipped_at | timestamp, nullable | non-null ⇒ in the skip tail; ordering by this value gives "in the order they were skipped" (US2-Scenario-3); cleared when a real decision lands |
| import_id | uuid, FK → review_imports | provenance |
| position | integer | original import order — the primary review order key |
| created_at | timestamp | |

**Review order (pure function over these fields, FR-006/FR-007)**: next
package = first `decision = 'pending' AND skipped_at IS NULL` by
`position`; when none remain, first `decision = 'pending' AND skipped_at
IS NOT NULL` by `skipped_at`. Skip = set `skipped_at = now()`, decision
stays `pending`. Approve/reject = set `decision` + `decided_at`, clear
`skipped_at`.

**Send-readiness (derived, never stored, FR-017)**: substitution of
`{{BFV_LINK}}` with `video_url ?? bfv_link_telegram`; not-ready iff
`message_body` empty, marker absent-but-expected/malformed remnants
(`{{`/`}}` remaining after substitution), or `<<…>>` placeholder text
remaining.

**Already-approved imports (FR-003)**: a source row with
`approval_status = approved` imports as `decision = 'approved'`,
`decided_at = imported-at` — never silently reset to pending.

### review_imports

One row per importer execution (spec Key Entities: Import Record).

| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| source_name | text | file name / label supplied with the upload |
| imported_at | timestamp | |
| rows_read | integer | data rows encountered |
| added | integer | packages created |
| duplicates | integer | rows skipped by dedup_key match (FR-002) |
| malformed | jsonb | array of `{ rowNumber, reason }` (spec Edge Cases) |

No other table is created or altered. `review_packages` has **no** foreign
key to `prospects`/`outreach_attempts` in the MVP (§Two-Queues); the
reserved convergence field is `source` (text, default `'first100_csv'`),
included from day one so the future engine-queue projection is additive.

## API Contract (inlined — this feature's `contracts/review-api.md`)

All endpoints served by the existing T100 runtime/router; same error shape
as the rest of the engine (`{ error: { code, message } }` via
`api/lib/errors.ts`); state-machine-style violations return `409`, bad
input `400`, unknown ids `404` — matching 001's contract discipline.
Localhost-default access per FR-020; these routes go behind the engine's
operator credential when 001's T113 lands (they are "operator endpoints"
in that task's sense).

### `POST /review/imports`
Body: raw CSV text (`text/csv`) plus `?source=<name>` (or a small JSON
envelope `{ sourceName, csv }` — final shape fixed at implementation,
contract-tested either way). Parses with the shared CSV helpers, dedups by
`dedup_key`, carries flags per FR-003, never aborts on a malformed row.
- Response `201`: `{ importId, rowsRead, added, duplicates,
  malformed: [{ rowNumber, reason }] }`
- Idempotency (FR-002/SC-004): same file twice ⇒ second response has
  `added: 0`, `duplicates = rowsRead - malformed.length`, zero state change.

### `GET /review/packages?decision=pending|approved|rejected&skipped=true|false`
List view + progress. Always includes the full counts object so the UI
never computes progress client-side from a filtered page.
- Response: `{ counts: { pending, approved, rejected, skipped, total },
  packages: [ReviewPackageSummary] }` — `skipped` counts `pending AND
  skipped_at IS NOT NULL` (they are also inside `pending`; the UI shows
  "remaining = pending" with skip visibility per spec Edge Cases).

### `GET /review/packages/next`
The review loop's read: the next package in review order (FR-006/007),
full content, plus `sendReady: { ready: boolean, link:
"video"|"telegram", problems: [string] }` and the counts object.
- Response when queue is exhausted: `200` with `{ package: null, counts }`
  (the "review complete" state, US1-Scenario-6) — not a `404`.

### `GET /review/packages/:id`
Same full shape as `/next` for one specific package (back-navigation and
list-view drill-in, FR-010).

### `POST /review/packages/:id/decision`
Body: `{ action: "approve" | "reject" | "skip" }`. Applies the review-order
semantics above; on an already-decided package, approve/reject replaces
(last-write-wins, FR-010). Skip on an already-approved/rejected package is
rejected (`409` — skipping is meaningful only for pending review).
- Response: `{ id, decision, skippedAt, decidedAt, counts,
  next: ReviewPackageFull | null }` — returning `next` inline keeps the
  loop at one round-trip per decision (SC-002).
- FR-013 is a client-side contract too: the UI advances only on a `2xx`
  with this shape; any failure keeps the current package on screen with a
  visible error.

### `PUT /review/packages/:id/video-url`
Body: `{ videoUrl: string | null }` (null clears). Persists (FR-015),
returns the recomputed `sendReady`.
- Response: `{ id, videoUrl, sendReady }`

### `GET /review/export?decision=approved`
Streams CSV in the first-100 column shape (FR-016): approved packages
only, `approval_status` = `approved`, `personalized_message` substituted
per send-ready rules; packages that are not send-ready are still included
but with an additional `send_ready` column set to `false` — visible, never
silent (FR-017). Uses the shared `csvEscape`/serialization helpers so the
output round-trips through the same parser (SC-005 byte-fidelity for the
message field).

### `GET /` and `GET /ui/*`
Static file serving for `ui/index.html` + `ui/review.js` from the same
process (read-only, path-confined to the `ui/` directory — no traversal).

## Testing Strategy

Per Constitution Principle IX — critical paths named and covered:

- **Unit tests** (pure domain, no DB): CSV-helper extraction pin (existing
  `first-100.test.ts` keeps passing against the moved module — the
  Principle I proof); importer row→package mapping incl. placeholder
  video-link → null, `needs_research` carry, `approved` carry, malformed
  row tolerance and reporting; `dedup_key` normalization edge cases
  (case, whitespace, `www.`, trailing slash — mirroring 001's dedup
  tests); review-order function across the full matrix (fresh queue,
  mid-queue, skip tail ordering by `skipped_at`, all-decided, skip-cycle);
  send-ready substitution (video vs telegram fallback, multiple markers,
  malformed remnants, missing body) and its warning verdicts.
- **Contract tests** (factory handlers + per-test PGLite, no server —
  the engine's established pattern): every endpoint above, including the
  `409` on skip-after-decide, `404` on unknown id, the `{ package: null }`
  exhausted shape, counts correctness, and the import-idempotency
  double-run (SC-004).
- **Integration tests**: the three user-story independent tests from
  spec.md — (1) fixture CSV → one-at-a-time loop → decisions recorded and
  queue advances; (2) decide subset → new Db handle on the same datadir
  (simulated restart) → counts/resume/skip-tail intact (SC-003); (3)
  approve + video URL → copy payload and export CSV byte-compare on the
  message field (SC-005), export contains exactly the approved set.
- **Not automated**: real clipboard behavior and visual layout (manual
  check on the operator's machine, listed in tasks as a verification
  step); SC-001's 30-minute throughput target (measured by the operator's
  first real session, not a test).
- **Regression discipline**: unchanged from the project convention — any
  bug in import idempotency, ordering, or substitution gets a named
  regression test before the fix.

**Existing-suite guarantee (SC-006 / FR-019)**: the full existing
`outreach-engine` Vitest suite and the site's
`lint`/`tsc`/`test`/`build` run before and after the feature lands; both
runs must be clean and are explicit tasks, not assumptions.

## Observability

Constitution Principle VI (NON-NEGOTIABLE), via the existing
`lib/logger.ts`:

- **Import**: one structured entry per run — source name, rows read,
  added, duplicates, malformed count with row numbers. A malformed row is
  logged individually (row number + reason), never swallowed.
- **Decisions**: one entry per decision write — package id, action,
  previous → new decision, actor is implicitly the single operator. No
  message/research text in log lines (identifiers only, matching 001's
  no-verbatim-content logging rule).
- **Export**: one entry — count exported, count flagged not-send-ready.
- **Failure visibility**: a failed decision write logs at error level AND
  returns a non-2xx the UI is contractually required to display without
  advancing (FR-013) — the no-silent-failure property is enforced at both
  ends.
- **Static/UI serving**: 404s and traversal-rejected paths logged at warn.

## Security Considerations

- **Rendering untrusted text**: research summaries, pain hypotheses, and
  message bodies derive from scraped third-party sites processed by an
  LLM. The 001 pipeline sanitizes toward the *LLM*; this feature adds a
  *browser* surface, so the UI MUST render all package fields via
  `textContent`/equivalent — never `innerHTML`, no HTML parsing of
  package content anywhere. This is a named test/review point, not a
  convention hope (tasks include a check that no `innerHTML` sink exists
  in `ui/`).
- **Access**: localhost binding by default (FR-020). The review endpoints
  are state-changing (decisions, video URLs) and MUST be registered as
  operator-credential endpoints when 001's T113 auth wiring lands; until
  then they share the exact posture of the engine's existing endpoints on
  the same runtime — no *new* exposure class is introduced. If the
  operator ever port-forwards/exposes the runtime, T113 becomes the
  prerequisite, and this plan records that dependency explicitly.
- **Static file serving**: path-normalized and confined to `ui/`
  (reject `..`, absolute paths, and encoded traversal) — the only new
  filesystem-read surface this feature adds.
- **Clipboard**: copy uses the async clipboard API on the operator's own
  page — no content leaves the machine; export is a local download from a
  localhost service.
- **No new credentials, no new external calls**: the module makes zero
  outbound network requests and needs zero secrets.

## Complexity Tracking

No constitution deviations to record: no new dependency, no new backend
component beyond two tables in the existing justified database, no new
auth system (deliberately — FR-020 + T113 dependency documented above).
The single pre-existing-code modification (CSV-helper extraction from
`scripts/first-100.ts` into `src/lib/csv.ts`) is a behavior-preserving
move pinned by existing tests, recorded here per Principle VIII.

## Post-Design Constitution Re-Check

Re-evaluated after the detailed design above (data model, API contract,
UI decision): no new violations introduced. The two design choices with
principle weight both came out on the strict side — §Two-Queues keeps
001's state machine untouched (Principles I/IV) at the cost of a
documented future convergence step, and §UI Decision keeps the dependency
count at zero (Principles III/XI) at the cost of hand-rolled DOM code
sized to one screen. Gate remains **PASS**.
