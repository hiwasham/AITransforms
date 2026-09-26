# Implementation Plan: Outreach Operator Review Dashboard

**Branch**: `feature/002-operator-review-dashboard` (spec-kit numbering:
`002-operator-review-dashboard`) | **Date**: 2026-07-15 | **Spec**:
[spec.md](./spec.md)

**Input**: Feature specification from
`specs/002-operator-review-dashboard/spec.md`

**Status**: MVP-0 implemented through M011. Public deployment design
approved 2026-07-27. Phase P below is the active implementation plan;
older localhost-only statements are historical and are superseded for the
public dashboard runtime.

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
- The isolated CSV parser (`src/lib/csv.ts`) still ships — the importer
  needs row-aware parsing and malformed-quote recovery regardless.

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

## Phase P: Login-Protected Public Dashboard (active)

Source of truth:
[`public-deployment-design-2026-07-27.md`](./public-deployment-design-2026-07-27.md).
The operator selected Tailscale Funnel plus application login and HOLD
SCOPE: ship the approved dashboard-only design with no product additions.

### What already exists

- The clean release is an intentional extraction containing only the review
  dashboard. It does not include or compose the full engine runtime.
- The five selected review handlers, static UI, review repository, PGlite
  schema, structured logger, graceful HTTP shutdown, and restart tests exist.
- `MockDispatchClient` exists, but dashboard mode does not construct even
  that client; `OUTREACH_DISPATCH_MODE=mock` remains a fail-closed config
  assertion and audit label.
- The Finland host, Tailscale 1.98.9, systemd, and existing private Serve
  endpoints exist. Their exact capabilities remain preflight facts, not
  design assumptions.

### NOT in scope

- Google/OAuth login, multiple users, roles, password reset, or a session
  revocation service.
- Real sending, generation, Telegram, provider webhooks, prospect/batch APIs,
  internal dispatch, or any new review feature.
- Moving the long-running PGlite service into Vercel or coupling it to the
  marketing site.
- Waiting for or changing `aitransforms.ir` DNS. The website remains on its
  stable Vercel URL; the dashboard uses the Funnel URL.

### Architecture and dependency boundary

```text
Public browser
    |
    | HTTPS :3111 (selected; preflight must re-verify)
    v
Tailscale Funnel -------------- existing Serve entries (must not change)
    |
    | loopback HTTP only
    v
dashboard main -> bounded HTTP bridge -> security/auth boundary
                                         |       |       |
                                         |       |       +-> GET /healthz
                                         |       +----------> login/logout
                                         +------------------> protected allowlist
                                                                    |
                                   +--------------------------------+
                                   |                                |
                           static UI files                 selected review handlers
                                                                    |
                                                                    v
                                                    single-writer persistent PGlite

Not imported or constructed: LLM | Telegram | scraper | webhook |
prospect/batch routes | internal dispatch | dispatch client
```

The isolated dashboard composition depends on selected review handler
factories only. Its small generic path matcher/dispatcher lives in
`server/router.ts`; it is not extracted from, shared with, or regression-tested
against the excluded full-engine `server/app.ts`. Dashboard registration uses
one declarative policy table containing method, path, handler, access class,
mutation/origin rule, and accepted content type, so routing and security
classification cannot drift. Outreach domain code never depends on
authentication, systemd, Infisical, or Tailscale. Unclassified routes fail
closed before handler lookup.

### Request and session flows, including shadow paths

```text
REQUEST -> configurable bounded shared bridge -> security headers -> route classification
  dashboard limit = 1 MiB; the excluded full-engine bridge is outside this release
  missing body  -> route-specific 400/401/404, fixed body, no-store
  empty body    -> route-specific 400, no-store
  invalid body  -> 400/413/415 before handler, no-store
  bridge error  -> structured safe log + fixed 500, no-store

LOGIN -> exact Origin -> 4 KiB form -> SHA-256 candidate digest
  -> timingSafeEqual -> signed 12-hour cookie -> 303 /
  mismatch -> limiter failure count -> fixed 401 or fixed 429

PROTECTED REQUEST -> parse cookie -> verify format/version/HMAC/expiry
  valid UI navigation -> allow
  valid API request   -> allow (+ exact Origin/content-type for mutations)
  missing/invalid UI -> 303 /login
  missing/invalid API/asset -> fixed 401

REVIEW MUTATION -> auth/origin/type checks -> existing handler -> PGlite
  success -> audit IDs only -> JSON -> UI advances
  handler/DB error -> fixed safe error -> UI stays on current prospect
```

The dashboard has its own config loader and does not read engine integration
variables. At startup it validates the exact merged release SHA, decodes and
validates the operator password and signing key, derives the fixed password
digest and binary HMAC key, then deletes
the raw secret strings from `process.env` and drops all raw string references.
Only the digest and required binary key material remain in the auth dependency.

Session state machine:

```text
       valid password
LOGGED_OUT -----------> AUTHENTICATED (absolute expiry fixed at issue)
    ^                         |
    | POST /logout            | expiry / malformed / tampered token
    +-------------------------+

Restart keeps a valid signed token. Logout clears the browser cookie but
does not revoke a copied token before expiry; this accepted limitation is
displayed in the design and covered in the threat model.
```

### Error and rescue registry

| Codepath | Named failure | Rescue/action | Operator sees |
|---|---|---|---|
| HTTP body reader | `RequestBodyTooLargeError` | stop buffering, close/read-drain safely, fixed 413 | fixed 413 |
| URL/router | `MalformedPathError` | generic fail-closed response | fixed 404 |
| login parser | `InvalidFormError` / `UnsupportedMediaTypeError` | fixed response, no submitted value logged | 400 / 415 |
| login limiter | `LoginRateLimitedError` | reject until fixed window ends; log state only | fixed 429 |
| secret validation | `InvalidAuthSecretError` | fail startup before listen | service unavailable |
| session verification | `InvalidSessionError` / `ExpiredSessionError` | clear/ignore token; redirect UI or reject API | 303 / 401 |
| origin check | `OriginMismatchError` | reject before mutation | fixed 403 |
| review handler | existing validation/not-found/conflict errors | preserve existing safe contract | 400 / 404 / 409 |
| PGlite open/write | `DatabaseOpenError` / `DatabaseWriteError` | fail startup or return safe 500; never advance UI | login unavailable / visible error |
| static asset read | `UiAssetReadError` | structured path-free log, fixed 500 | fixed error |
| Infisical wrapper | credential decrypt/auth/fetch failure | exit before Node; no fallback secret path | service unavailable |
| single-writer lock | `LockUnavailableError` | exit before PGlite open | service unavailable |
| Funnel preflight | port/policy/config mismatch | do not enable or modify ingress | no public URL yet |

No catch-and-continue path may swallow these errors. Unexpected handler
exceptions retain a fixed response, a request correlation ID, and a safe
structured journal entry without secret or prospect content.

### Failure modes registry

| Codepath | Failure mode | Rescued? | Test? | User sees? | Logged? |
|---|---|---:|---:|---|---:|
| Login | wrong/malformed/oversized input | yes | yes | fixed 4xx | safe metadata |
| Session | forged/expired/tampered cookie | yes | yes | redirect/401 | safe event |
| Protected asset/API | direct unauthenticated request | yes | yes | fixed 401 | optional aggregate |
| Route allowlist | batch/prospect/webhook/internal path | yes | yes | generic 404 | safe route class |
| Review decision | DB write fails | yes | yes | visible error; no advance | yes, IDs only |
| Dashboard startup | non-dashboard/non-mock mode | yes | yes | no listener | yes |
| External integration | accidental construction/network call | yes | yes | no change | startup/test evidence |
| PGlite | second writer or restart | yes | yes | startup blocked / records retained | yes |
| Secret bootstrap | decrypt/vault failure | yes | preflight | no listener | redacted failure |
| Deployment | bad release or health check | yes | rehearsal | private rollback; no public exposure | deploy report |
| Funnel | port collision/policy/config drift | yes | preflight | public enablement blocked | preflight report |
| Backup | inconsistent archive/failed restore | yes | restore rehearsal | rollout blocked | backup identifier |

There are no rows with `Rescued=no`, `Test=no`, and a silent user outcome.

### Interaction and performance review

| Interaction | Edge handling |
|---|---|
| Double login/decision click | global UI `busy` guard plus server idempotent/last-write-wins contract |
| Slow or failed mutation | current prospect remains visible with an explicit error |
| Back/reload/restart | DB decisions persist; stateless session survives restart until absolute expiry |
| Empty queue | existing empty state; authenticated only |
| Completed queue | existing completion state; authenticated only |
| Stale/two-tab decision | existing last-write-wins response becomes the displayed source of truth |
| Expiry during use | next protected request redirects/rejects; no sliding extension |

At the expected low-thousands-row scale, password hashing, HMAC, and route
classification are constant-time relative to data size. The slow paths are
PGlite open at startup, review queries/writes, and Infisical startup fetch.
No new per-request network call is introduced.

### Test diagram

```text
UNIT
  config modes/secrets/raw-env erasure | HMAC format/version/nonce/tamper/expiry/future-time
  cookie parser: missing/duplicate/malformed | limiter 49/50/51/reset window
  Origin: exact/missing/mismatch | content types incl. charset | route policy completeness
  router matcher: literal/dynamic/method/malformed-percent path | no integration imports

CONTRACT
  login form: missing/empty/duplicate/unknown fields | exact 4 KiB boundary
  login/logout/cookie attributes/no-store | UI redirect vs API/asset 401
  headers on success/redirect/every 4xx/404/500 | all five review routes
  every forbidden method/path | fixed bodies that do not disclose resource existence

INTEGRATION
  dashboard composition + PGlite | isolated router/bridge regression
  raw Content-Length over limit + chunked crossing limit + exact 1 MiB boundary
  connection close/drain behavior | graceful shutdown | restart persistence
  no external module construction/transport | single-writer lock

UI / STATIC
  simulation banner + logout control | zero unsafe HTML sinks | existing keys unchanged
  401/expired-session recovery | failed mutation stays on current prospect

HOST PREFLIGHT
  systemd-analyze verify | wrapper syntax/no-trace checks | systemd-creds
  Infisical Universal Auth/redaction | port/policy | normalized Serve before/after
  backup permissions/retention + separate-directory restore

LIVE BROWSER
  fresh login -> real queue -> CANARY rejection -> logout -> blocked again
  restart -> login -> record still present | zero console errors
```

Coverage target is every new branch and failure response, with unit tests for
pure auth/policy code, contract tests for route behavior, integration tests for
the real Node bridge/PGlite boundary, and browser E2E for the operator journey.
No LLM eval is required because dashboard mode neither imports nor calls an LLM.

### Engineering implementation decisions

1. **Isolated router core**: keep generic matching/dispatch inside the clean
   dashboard extraction; do not import or regression-test the excluded full app.
2. **Single dashboard policy declaration**: route existence and auth/origin/type
   requirements are one source of truth; an unclassified route is impossible to
   dispatch.
3. **Explicit dashboard HTTP bound**: the isolated dashboard passes 1 MiB; no
   full-runtime bridge is present or changed by this release.
4. **Derive then erase secrets**: dashboard-only config, no integration-secret
   reads, immediate raw env deletion after digest/key derivation.
5. **Sequential implementation**: no worktree parallelization. Router, auth,
   HTTP behavior, tests, and ops artifacts share one security contract; merging
   independent partial implementations would add more review risk than speed.

### Implementation tasks from engineering review

- **E1 (P1)** Implement and regression-test the isolated generic router before
  adding the dashboard policy table.
- **E2 (P1)** Implement dashboard config/auth primitives from the failing unit
  matrix, including raw environment erasure.
- **E3 (P1)** Implement dashboard policy composition and all contract cases from
  the route matrix.
- **E4 (P1)** Add the configurable bounded HTTP reader and real isolated bridge
  boundary tests.
- **E5 (P1)** Validate the systemd/wrapper/backup artifacts mechanically, then
  verify their host-dependent behavior in private preflight.
- **E6 (P1)** Run the fresh-browser login/review/logout/restart canary before
  declaring the public URL ready.

### Observability and security

- Startup logs runtime/dispatch mode, release SHA, listener address, and
  `dispatch_mode=mock`; it never logs secrets, paths containing credentials,
  cookies, session tokens, prospect text, or messages.
- Login events log outcome category and limiter state only. Review mutations
  log package ID, action, optional reason enum, per-session audit ID, and mock
  mode.
- systemd restart count, failed starts, health, backup identifier, release
  SHA, Funnel listener, and normalized pre-existing Serve definitions are
  captured in the deploy report.
- Security is re-reviewed by `/cso` after this plan update. Public ingress is
  the final step and remains disabled until every security/preflight gate is
  observed.

### Deployment and rollback sequence

```text
merge SHA -> root-owned release -> install production deps -> private config
  -> encrypted-credential/Infisical preflight -> start loopback service
  -> login/API/restart checks -> offline backup + restore rehearsal
  -> backup Serve JSON -> prove :3111 + Funnel policy -> add one Funnel entry
  -> normalized config comparison -> public browser QA -> canary report
```

```text
PUBLIC FAILURE?
  yes -> remove only new Funnel entry -> verify old Serve entries unchanged
      -> stop unit -> point current to previous compatible SHA -> start
      -> private health/login/data check -> restore Funnel -> public canary
  data corruption proven?
      no  -> never restore data
      yes -> stop, preserve failed data, restore named verified backup
```

### Dream-state delta and reversibility

```text
localhost-only review tool
    -> this phase: public, protected, persistent, mock-only operator service
    -> 12-month ideal: identity-managed operator platform with deliberate
       provider integrations and audited send controls (separate projects)
```

This release moves toward reliable operations without coupling the dashboard
to a future identity/provider architecture. Reversibility is **4/5**: Funnel,
unit, release symlink, and code are reversible; PGlite records are durable and
restored only through the explicit data-recovery path.

### Stale diagram audit

The existing `outreach-engine/docs/ARCHITECTURE.md` diagrams remain correct
for the full engine runtime. They do not describe the new dashboard-only
composition; the architecture diagram above is authoritative for Phase P.
No existing state-machine diagram changes because review decisions remain
separate from the outreach dispatch state machine.

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
engine's only runtime dependency), the isolated dashboard router +
`server/http.ts` node:http bridge, selected review handlers, and the
`parseCsvRecords` parser in `src/lib/csv.ts`. CSV serialization remains
deferred with export; the UI is dependency-free static HTML/JS served by
the same process.

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
│   │   └── csv.ts                    # Isolated row-aware CSV parser with malformed
│   │                                 # quote recovery; pinned by importer unit tests
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
silent (FR-017). This deferred phase will add CSV serialization beside the
parser so the output round-trips through the same module (SC-005
byte-fidelity for the message field).

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

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 1 | CLEAR | HOLD_SCOPE, 0 critical gaps; governing docs synchronized to the approved design |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | TIMEOUT | Non-blocking outside voice exceeded its time budget; prior design had 3 adversarial rounds and 37/37 issues fixed |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR | 5 issues folded, 0 critical gaps: isolated router, one policy table, bounded bridge, erased raw secrets, full dashboard test matrix |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | UI delta is limited; live post-implementation design/browser audit remains required |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | Not required for this operator-only deployment |

**VERDICT:** CEO + ENG CLEAR; the 2026-08-01 diff security review also passed with zero reportable findings.

NO UNRESOLVED DECISIONS
