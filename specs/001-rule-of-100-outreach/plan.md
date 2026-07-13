# Implementation Plan: Rule of 100 Outreach Engine

**Branch**: `feature/daily100openclawoutreach` (spec-kit numbering:
`001-rule-of-100-outreach`) | **Date**: 2026-07-11 | **Spec**:
[spec.md](./spec.md)

**Input**: Feature specification from `specs/001-rule-of-100-outreach/spec.md`

**Status**: Design complete. No code has been written. Per the planning
request, this plan waits for explicit operator approval before
`/speckit-tasks`/implementation begins.

## Summary

Build a new, separate backend service (`outreach-engine/`) that turns an
operator-supplied daily list of up to 100 prospects into ready-to-send
outreach packages (scraped site context → a working per-prospect Telegram
BFV bot link → a Hook→Pain→BFV→Ask script written at a 3rd-grade reading
level), gates every script through an automated Anti-Values Linter before
it can reach a human, and requires explicit operator approval before any
package is marked sent — protecting domain/sender reputation by design
(no autonomous sending in V1). Once approved, packages are dispatched
through the operator's outreach platform (Instantly/Unipile), and the
engine listens for prospect replies via that platform's webhooks —
autonomously marking a prospect "replied" and halting its cadence with no
manual inbox-checking (FR-021–FR-024), with a manual override retained as
a fallback. The engine tracks a fixed 4-day follow-up cadence for
non-responders, auto-retires and later re-offers unresponsive prospects
(3–6 months later), and reports actuals against the 100-20-4-1 funnel ratio
on a dashboard. The existing AITransforms static marketing site is
untouched (FR-015): this is new, isolated infrastructure, not a
modification of `src/`. OpenClaw is used as one interchangeable
orchestration adapter (Telegram channel + scheduling), never as a place
where business logic lives — see `contracts/automation-runner-interface.md`.

## Technical Context

**Language/Version**: TypeScript, Node.js 24 (matches this repo's existing
stack and CI `node-version`)

**Primary Dependencies**: Next.js (Route Handlers, for the internal API +
operator dashboard UI); a Postgres-wire client/lightweight query builder;
`@electric-sql/pglite` (embedded Postgres); an HTML-parsing/scraping
library; a Telegram Bot API client library; an LLM SDK (reusing this host's
existing Claude access path — see `research.md` §9); a readability-scoring
library (Flesch-Kincaid or equivalent); a cron-style scheduler library for
the standalone job-runner process; Instantly and/or Unipile API client
libraries (outreach dispatch + inbound reply webhooks) and a webhook
signature-verification utility (§10 below). Full rationale per dependency
in `research.md`.

**Storage**: PGLite (embedded Postgres, file-backed), Postgres-dialect SQL
schema — see `research.md` §4 and `data-model.md`.

**Testing**: Vitest (matches existing repo convention).

**Target Platform**: Linux host, systemd-managed long-lived Node process(es)
— the same host already running the OpenClaw gateway. Not deployed to
Vercel (see `research.md` §2–3).

**Project Type**: New backend service + operator dashboard (web-service),
structurally separate from the existing static marketing site.

**Performance Goals**: Complete a ~100-prospect daily batch pipeline
(scrape → BFV provision → script gen → lint, with bounded revision retries)
within a single overnight window; dashboard and API responses sub-second at
this data scale (low thousands of rows).

**Constraints**: Zero modification of existing site routes/content/build
(FR-015); BFV links must be reachable with zero friction — no login/call/
form wall (FR-016); every BFV deliverable must already work before its
first send (FR-017); no fully autonomous sending in V1 (human approval gate
is load-bearing, not advisory); OpenClaw is optional/replaceable, never a
hard dependency of Core Engine business logic; reply-webhook events from
Instantly/Unipile must be verified (signature) and processed idempotently,
and reply detection + cadence halt must complete within 5 minutes of the
provider's webhook firing (SC-006).

**Scale/Scope**: Up to 100 new prospects/day; cumulative history retained
indefinitely; single founder/operator user, no multi-tenant/team features.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design
below.*

Evaluated against `.specify/memory/constitution.md` v1.0.0:

| Principle | Verdict | Basis |
|---|---|---|
| I. Preserve Existing Functionality | **PASS** | New service is structurally isolated (`outreach-engine/`, separate deploy target); FR-015 is a hard requirement; nothing under `src/` is touched by this plan. |
| II. Incremental Change Over Rewrites | **PASS** | Net-new, additive service — not a rewrite of anything. V1 scope is deliberately narrow (manual send, manual outcome recording, single shared bot) rather than the full autonomous vision, consistent with incremental delivery. |
| III. Avoid Unnecessary Dependencies | **JUSTIFIED, see Complexity Tracking** | New dependencies are required (this is a first-of-its-kind backend for this repo) but each is individually justified in `research.md`, and each choice reuses stack/tooling already known on this host (TypeScript, Vitest, Claude access path) rather than introducing new ones where existing ones suffice. |
| IV. Modular Architecture | **PASS** | Explicit service boundaries (§Services below); `AutomationRunner` interface (`contracts/automation-runner-interface.md`) is the direct mechanism satisfying "not tightly coupled to one agent framework." |
| V. Protect Credentials and Sensitive Data | **PASS, see Security Considerations** | Scraper, Telegram bot token, LLM API key, and operator credential all handled via environment/secrets, never logged; BFV tokens are unguessable, not sequential. |
| VI. Observability by Default (NON-NEGOTIABLE) | **PASS, see Observability** | Every pipeline step, lint verdict, and workflow-state transition is structured-logged; batch shortfalls and pipeline failures are designed to be visible, not silent. |
| VII. Production Reliability Over Quick Hacks | **PASS** | The entire Tier 3 human-approval gate *is* the reliability-over-speed decision — it exists specifically to protect domain reputation over shipping a fully autonomous sender faster. |
| VIII. Document Architectural Decisions | **PASS** | This plan + `research.md`'s Decision/Rationale/Alternatives entries are that documentation. |
| IX. Test Critical Functionality | **PASS, see Testing Strategy** | Dedup, cadence-day math, linter mechanical checks, and the workflow state machine are named as required-test critical paths. |
| X. Follow Existing Project Conventions | **PASS** | Reuses this repo's language (TypeScript), test runner (Vitest), and package manager (npm) rather than introducing new ones. |
| XI. Justify New Technology Adoption | **PASS** | Every new dependency/technology choice in `research.md` carries a Decision/Rationale/Alternatives-considered entry, per the principle's own requirement. |

**Additional Constraints check** ("No CMS, database, authentication system,
blog, or other heavy backend component may be introduced for functionality
that a static/simple implementation already satisfies"): this feature's
functionality — stateful scraping, cadence tracking, a human review queue,
a live dashboard — is **not** satisfiable by a static/simple
implementation, so this constraint does not block introducing a database
and a minimal auth gate here. It does constrain *where*: the new backend
must not be added to the existing static site's surface, which is why
`outreach-engine/` is structurally separate (see Project Structure below).
This reasoning is restated in Complexity Tracking for auditability, per the
constitution's Compliance Review requirement to document, not silently
diverge.

**Result**: Gate passes. Proceeding to Phase 0/1 design (already reflected
in `research.md`, `data-model.md`, `contracts/`, `quickstart.md`).

## Project Structure

### Documentation (this feature)

```text
specs/001-rule-of-100-outreach/
├── spec.md
├── plan.md                          # this file
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── outreach-api.md
│   ├── automation-runner-interface.md
│   └── anti-values-linter.md
├── checklists/requirements.md
├── resources/
│   ├── bfv-concept.md
│   └── follow-up-cadence-scripts.md
└── tasks.md                         # NOT created by this command — /speckit-tasks
```

### Source Code (repository root)

New top-level directory, sibling to `src/`, with no shared imports or build
step with the existing static site:

```text
outreach-engine/
├── package.json              # separate from repo-root package.json
├── src/
│   ├── api/                  # Next.js Route Handlers implementing contracts/outreach-api.md
│   │   └── internal/          # cadence/recompute + dispatch/process (mutating, service-credential only) + reengagement/eligible-count (read-only, dashboard + service credential)
│   │       # prospects/[id]/approve (gate only, CHK003) and prospects/[id]/retry-dispatch (operator, uncapped) live under api/prospects/ alongside the other prospect routes
│   ├── dashboard/             # operator dashboard UI
│   ├── domain/                # Core Engine business logic — framework-agnostic
│   │   ├── prospects/         # dedup, Prospect/OutreachAttempt lifecycle
│   │   ├── pipeline/          # scrape → BFV provision → script gen orchestration (calls out to services/)
│   │   ├── linter/            # Anti-Values Linter — mechanical + LLM-judge checks
│   │   ├── cadence/            # 4-day cadence + unresponsive/re-engagement math
│   │   ├── replies/            # reply-webhook event handling, idempotency, cadence-halt logic
│   │   └── dashboard/          # ConversionSnapshot aggregation (read model)
│   ├── services/               # integration adapters: scraper, telegram bot, LLM client
│   │   └── dispatch/            # DispatchClient interface + mock (Foundational) + Instantly/Unipile clients (send-through + webhook signature verification, US2)
│   ├── api/webhooks/            # inbound webhook route handlers (contracts/dispatch-webhook.md)
│   ├── automation-runner/      # contracts/automation-runner-interface.md implementations
│   │   ├── openclaw-adapter/
│   │   └── cron-adapter/       # fallback / local-validation implementation
│   ├── db/                     # PGLite schema + queries — owned exclusively by api/+domain/ (the core service); NEVER imported by jobs/ (Process Boundaries & Data Flow)
│   └── jobs/                   # cron-timing-only scheduler process — no domain/db imports, ever
│       └── lib/core-api-client.ts  # the only way jobs/ talks to the core service (HTTP, scoped service credential)
└── tests/
    ├── unit/                   # dedup, cadence math, linter mechanical checks, state machine, webhook idempotency
    ├── contract/                # outreach-api.md + dispatch-webhook.md request/response shape tests
    └── integration/              # quickstart.md scenarios against a real PGLite instance
```

**Structure Decision**: `outreach-engine/` is a self-contained project with
its own `package.json`, dependency set, test suite, and deploy target —
deliberately not merged into the existing `src/` Next.js app or its
`package.json`, so the static site's build/deploy/dependency graph is
provably unaffected (FR-015) and the two systems can evolve, fail, and
deploy independently (Constitution Principle IV). `domain/` holds all
business logic with zero framework imports (no Next.js, no OpenClaw, no
Telegram SDK) so it stays unit-testable and portable if the API layer or
orchestration adapter ever changes.

## Services

| Service | Responsibility | Lives in |
|---|---|---|
| Ingestion | Accepts the operator-supplied daily prospect list; normalizes URLs for dedup | `domain/prospects/` |
| Scraper | Fetches website/FAQ content; classifies snapshot `complete`/`insufficient`/`unreachable` | `services/` (integration) + `domain/pipeline/` (orchestration) |
| BFV Provisioning | Builds the prospect-scoped context for the shared Telegram bot; issues an unguessable deep-link token; verifies the link resolves before marking ready | `domain/pipeline/` + `services/` (Telegram client) |
| Script Generation | Produces the Hook→Pain→BFV→Ask draft at a 3rd-grade reading level from `extracted_facts` | `domain/pipeline/` + `services/` (LLM client) |
| Anti-Values Linter | Runs mechanical + LLM-judge checks (`contracts/anti-values-linter.md`); returns pass/fail + revision feedback | `domain/linter/` |
| Batch Orchestrator | Coordinates Ingestion → Scrape → BFV → Script → Lint per attempt; enforces the Workflow State Machine; assembles the Batch Candidate Pool (supplied list ∪ re-engagement-eligible prospects, FR-026); on retry, resumes only attempts still at exactly `generated` — every other `workflow_state` is terminal and untouched (`data-model.md`, `plan-eng-review` correction) | `domain/pipeline/` |
| Cadence Engine | Derives due follow-up step; transitions Unresponsive at day-4 exhaustion; sets re-engagement eligibility date | `domain/cadence/` |
| Dispatch | Sends an approved package through the operator's configured provider — as a step structurally SEPARATE from approval (`CHK003` correction; `contracts/dispatch-client-interface.md`): `POST /prospects/:id/approve` only ever transitions `human_review_queue`→`approved`, never touches `DispatchClient`. Actual sending is driven by `POST /internal/dispatch/process` (automatic, bounded-retry, `jobs/`-triggered) and `POST /prospects/:id/retry-dispatch` (operator-triggered, uncapped) — both idempotency-keyed on `OutreachAttempt.id`. On success, captures `provider_thread_id` and creates `FollowUpCadenceState`; on failure, records `last_dispatch_error` and stays retryable forever (FR-027/FR-028). A `DispatchClient` interface (mirroring `AutomationRunner`) is defined once in Foundational with a mock/test-double implementation US1 tests run against; the real Instantly/Unipile implementations arrive in US2 and are swapped in for production | `domain/pipeline/` (dispatch-process/retry orchestration) + `services/dispatch/` (interface + implementations) |
| Reply Ingestion | Verifies and processes inbound Instantly/Unipile reply webhooks idempotently; matches event to `OutreachAttempt`; transitions outcome to `replied` and halts cadence (FR-021–FR-024) | `domain/replies/` + `services/dispatch/` (provider clients) |
| Outcome Recording | Applies operator-recorded outcomes (last-write-wins semantics) — "replied" (manual fallback), "call_booked", "closed" only; "sent" is never operator-recorded (FR-025) | `domain/prospects/` |
| Dashboard/Reporting | Aggregates `ConversionSnapshot` read model on demand | `domain/dashboard/` |
| AutomationRunner Adapter | Translates scheduled triggers/channel delivery into calls against the Core Engine API — OpenClaw or plain-cron implementation | `automation-runner/` |

> `jobs/` never implements any of the above directly — see Process
> Boundaries & Data Flow. Every row's logic lives in `domain/`, executed
> only inside the core service process.

## API Boundaries

Full contract: `contracts/outreach-api.md`. Two boundaries exist:

1. **Operator ↔ Core Engine**: the dashboard UI and the operator's own
   browser session call the API under the operator's single-user
   credential (batch view, prospect detail, approve, retry-dispatch,
   record outcome, dashboard query).
2. **AutomationRunner ↔ Core Engine**: a scoped service credential (not the
   operator's session) calls `POST /batches/generate`, the pipeline-step
   endpoints, and the two mutating internal endpoints added per
   `research.md` §11 / `CHK003`'s fix (`POST /internal/cadence/recompute`,
   `POST /internal/dispatch/process`) on a schedule. This boundary is what
   keeps OpenClaw (or any replacement, including the MVP-default
   `cron-adapter`) a caller of the Core Engine, never a container *for* it
   — see `contracts/automation-runner-interface.md`.

3. **Dispatch Provider ↔ Core Engine**: inbound webhook endpoints
   (`api/webhooks/`, `contracts/dispatch-webhook.md`) accept reply
   notifications from Instantly/Unipile. Not gated by the operator session
   credential or the `AutomationRunner` service credential — authenticated
   instead by provider signature verification (FR-023; see Security
   Considerations). This is the second public-facing boundary alongside the
   BFV Telegram deep links.

The BFV Telegram deep links remain intentionally frictionless by design
(FR-016), protected by unguessable per-attempt tokens rather than by auth
(see Security Considerations).

## Background Jobs / Workflows

`jobs/` is a lightweight standalone scheduler process — it holds cron
timing and nothing else. It never imports `db/` or `domain/` and holds no
database connection (see Process Boundaries & Data Flow, next section);
every row below is either an HTTP call `jobs/` makes into the core
service, or work that already runs inside the core service's own request
handling:

| Job | Trigger | Responsibility | Executes in |
|---|---|---|---|
| `daily-batch-generation` | Once/day (cron), pre-operator-login | Runs Ingestion → Scrape → BFV → Script → Lint for the day's prospect list; assembles the Batch Candidate Pool (supplied list ∪ re-engagement-eligible prospects, FR-026, computed live — no separate sweep job); produces the `human_review_queue` the operator sees on login | Core service, via `jobs/` calling `POST /batches/generate` |
| `cadence-recompute` | Daily (or more frequently) | Recomputes due-today status for all `sent` attempts; flips exhausted attempts to `unresponsive` (FR-018) | Core service, via `jobs/` calling `POST /internal/cadence/recompute` |
| `dispatch-process` | Frequent (e.g. every 1–2 min) — tighter than the other jobs, since approval should feel like it results in sending soon after | Attempts dispatch for every `approved`/`dispatch_failed` attempt below the automatic-retry cap (`CHK003` correction — the mechanism that keeps approval and dispatch decoupled while still feeling automatic to the operator) | Core service, via `jobs/` calling `POST /internal/dispatch/process` |
| `revision-retry` | Event-driven (on `LintReport.verdict = fail`), bounded | Triggers a new `OutreachScript` regeneration + re-lint, up to a configured retry cap, then flags `needs_manual_draft` | Core service, inline within the Batch Orchestrator — never a separate process |
| `reply-webhook-ingestion` | Event-driven (inbound HTTP request from Instantly/Unipile, not scheduled) | Verifies signature (FR-023), deduplicates by provider event ID (FR-024), matches to an `OutreachAttempt`, applies the outcome-regression guard (`contracts/dispatch-webhook.md`), transitions outcome to `replied` when applicable, halts cadence — must complete well within the 5-minute SC-006 bound, so this runs inline in the webhook request handler, never queued behind a scheduled job | Core service — this was always an API route handler, not a `jobs/` process concern |

There is no `reengagement-eligibility-sweep` job (`plan-eng-review`
correction #13): the prior design's separate mutating sweep created a race
between "marked eligible" and "reset applied" — eligibility is now a live
query inside `daily-batch-generation` itself.
`GET /internal/reengagement/eligible-count` is a read-only observability
endpoint, not a scheduled trigger.

`daily-batch-generation`, `cadence-recompute`, and `dispatch-process` are
the three `AutomationRunner` trigger points named in
`contracts/automation-runner-interface.md`'s `scheduleDailyBatch`/
`runPipelineStep`.

## Process Boundaries & Data Flow

**Decision (`research.md` §11): only the core service touches the
database.** `outreach-engine/` runs as (at most) two OS processes:

1. **Core service** — the Next.js process hosting `api/`, `domain/`, and
   `db/`. This is the only process with a PGLite connection, ever.
2. **`jobs/` scheduler** — a thin cron-timing process holding zero
   business logic and zero database access. It calls the core service's
   HTTP API (via the `AutomationRunner` implementation in use) on a
   schedule and does nothing else.

This resolves an open risk an engineering review surfaced: PGLite's safe
operating mode is single-process, and nothing in this plan verified safe
concurrent multi-process access to one PGLite datadir. Rather than prove
or rely on that (Option B), the database has exactly one owner,
permanently (Option A). `POST /internal/cadence/recompute`
(`contracts/outreach-api.md`) exists specifically so `cadence-recompute`
follows the same HTTP-only rule that `POST /batches/generate` already
established for `daily-batch-generation`. (`GET /internal/reengagement/eligible-count`
is read-only observability, not part of this HTTP-only-writes rule.)

Data flow for every scheduled action is therefore uniform:

```
jobs/ (cron timing only, no domain/db imports)
  │  HTTP call, scoped service credential
  ▼
Core service: api/ route handler
  │
  ▼
Core service: domain/ business logic
  │
  ▼
Core service: db/ (the only PGLite connection in the system)
```

A long-running batch is still not at risk of being killed by a request
timeout: `POST /batches/generate` can accept the trigger and let the core
service continue the pipeline within its own process lifetime — the
timeout risk this design originally guarded against was about the
*request*, not the *process*, and staying single-process for the database
doesn't reintroduce it.

## Testing Strategy

Per Constitution Principle IX ("critical functionality" = load-bearing for
production correctness here):

- **Unit tests** (`domain/`, framework-free): dedup/URL-normalization edge
  cases (www/trailing-slash/redirect variants); cadence-day boundary math
  for all 5 derived states (none-due-yet/Bump/Video Demo/Takeaway/
  exhausted) at exact day boundaries; Anti-Values Linter mechanical checks
  (reading level, jargon deny-list, structure) against a fixed
  pass/fail golden corpus; Workflow State Machine transition legality
  (e.g. `sent` unreachable without `approved`); Outcome State Machine
  last-write-wins semantics including the out-of-order edge case;
  reply-webhook signature verification (valid/invalid/missing signature),
  duplicate-event idempotency (same provider event ID processed twice
  produces one state change, not two), and the webhook outcome-regression
  guard (a verified reply matched to an already-`call_booked`/`closed`
  prospect must not change status); a scraped-content prompt-injection
  defense test against an adversarial fixture page; and a BFV
  cross-prospect context-isolation test (one prospect's scraped context
  must never leak into another prospect's bot session or generated
  script). The last two run as part of User Story 1's test set, not
  deferred to polish, since both protect a core safety property of the
  MVP itself.
- **Contract tests** (`tests/contract/`): every `outreach-api.md` endpoint's
  request/response shape and documented error codes (esp. `409` on illegal
  workflow transitions).
- **Integration tests** (`tests/integration/`): the seven `quickstart.md`
  scenarios, run against a real (test-instance) PGLite database with a
  fixture prospect set and mocked scraper/Telegram/LLM service adapters.
- **Regression discipline**: any bug found in dedup, cadence math, or the
  linter gets a named regression test before the fix lands, matching this
  project's existing convention (`TESTING.md`/`CLAUDE.md`).
- **Explicitly not covered by automated tests**: real third-party website
  scraping behavior and real Telegram delivery — these are validated
  manually against fixtures/mocks (see `quickstart.md`'s "Out of scope").

## Observability

Constitution Principle VI is NON-NEGOTIABLE — every automation workflow
needs entry/exit/failure logging and no silent failure paths:

- **Structured logs** for: every pipeline step per attempt (scrape
  success/fail + reason, BFV provisioning + link-verification result,
  script generation + revision number, lint verdict + which check(s)
  failed); every Workflow/Outcome state transition with timestamp and
  actor (`system` vs `operator`); every scheduled job run (start, end,
  item counts, failures); every inbound reply-webhook event (provider,
  verified/rejected, matched/unmatched attempt, resulting state change or
  no-op-duplicate).
- **Batch-level signal**: `daily-batch-generation` logs and surfaces (via
  `GET /batches/:date`) the shortfall count whenever fewer than 100
  qualifying prospects were available (FR-001 Scenario 4) — this must be
  visible, not just inferable from a short list.
- **Alerting-worthy conditions** (mechanism TBD at task-planning time, but
  the conditions themselves are fixed here): `daily-batch-generation` fails
  to run at all on a given day; an attempt hits `needs_manual_draft` (lint
  retry cap exhausted); the `AutomationRunner`'s scheduled trigger doesn't
  fire (surfaces an OpenClaw gateway outage per the operational caveat in
  `research.md` §5 as "batch didn't run," not silent data loss); a
  reply-webhook event fails signature verification (possible
  spoofing/misconfiguration) or arrives unmatched to any known attempt.
- **What is deliberately not logged**: raw scraped HTML/page content
  verbatim (stored via `raw_content_ref`, not inlined into log lines) and
  full prospect PII in routine operational logs — see Security
  Considerations.

## Security Considerations

- **Credentials**: Telegram bot token, LLM API key, Instantly/Unipile API
  keys and webhook signing secrets, and (if/when migrated off PGLite)
  database credentials are environment/secrets-manager-provided only —
  never committed, never logged (Constitution Principle V). The
  `AutomationRunner`'s service credential (distinct from the operator's own
  session token) is scoped to only the batch-trigger and pipeline-step
  endpoints, not the full API.
- **Scraped-content prompt injection**: website/FAQ content is external,
  untrusted input by definition — the operator does not control what a
  prospect's site says — and it flows directly into LLM calls for script
  generation and the linter's LLM-judge layer. Scraped text is treated as
  data, never as instructions: it is passed to the LLM wrapped in an
  explicit, clearly-delimited data boundary and never concatenated into the
  system/instruction portion of a prompt, and a sanitization pass strips or
  neutralizes text that reads like a prompt-injection attempt (e.g. "ignore
  previous instructions," embedded fake system/role markers) before it
  reaches any LLM call. Tested directly against an adversarial fixture page
  containing injection attempts (see Testing Strategy).
- **Webhook authenticity and replay**: every inbound Instantly/Unipile
  webhook is verified against that provider's signature/secret before any
  state change is made (FR-023); requests failing verification are
  discarded/quarantined, never acted on. Every event's provider-assigned ID
  is checked against previously-processed IDs before acting, so a
  provider-side retry (or a replayed/captured request) cannot re-trigger a
  state change (FR-024). The public webhook endpoint is otherwise
  unauthenticated by design (providers can't hold the operator's session
  credential) — signature verification is the sole control, so it must be
  fail-closed (reject on any verification error, never fail open).
- **Outbound dispatch idempotency** (`CHK003` correction): every
  `DispatchClient.send()` call passes `OutreachAttempt.id` as an
  idempotency key (`contracts/dispatch-client-interface.md`), so that
  automatic retries (bounded) or operator-triggered manual retries
  (uncapped) following an ambiguous failure — timeout, process crash
  mid-call — don't risk a real duplicate send to the prospect, to the
  extent the provider honors idempotency keys on its send endpoint. This
  is a stated, not-yet-verified assumption (`checklists/architecture.md`
  CHK001) — if a provider doesn't support it, that provider's client
  implementation needs its own accommodation, contained entirely inside
  `services/dispatch/`, without reopening the approval/dispatch
  state-machine split.
- **Operator authentication**: a minimal single-operator session credential
  gates the dashboard and operator-facing API surface (`research.md` §8) —
  proportionate to a single-user system, not a multi-tenant auth build-out.
- **BFV link security**: `telegram_deep_link_token` is generated as an
  unguessable, non-sequential value specifically so one prospect's BFV link
  can't be used to enumerate or access another prospect's bot context —
  this is the control that lets the link stay genuinely unauthenticated
  (zero-friction, FR-016) without exposing other prospects' data.
- **Scraper conduct**: respects target sites' `robots.txt` and applies
  reasonable rate-limiting/backoff — both to avoid the operator's IP being
  blocked (an operational risk to the whole daily batch) and as ordinary
  good conduct; flagged here as a design requirement even though a specific
  rate is not fixed by the spec.
- **OpenClaw isolation**: if used, this feature's `AutomationRunner`
  adapter registers its own OpenClaw workspace/agent identity, not the
  existing `workspace-hamkelasi-omid-ceo-transformation` workspace tied to
  an unrelated client engagement — prevents cross-contamination of agent
  context and credentials between two different businesses.
- **PII handling**: prospect business/contact data is not a special
  regulated data category by default, but is still access-controlled
  (behind the operator credential) and excluded from routine logs beyond
  identifiers needed for debugging.

## Complexity Tracking

> Documenting the two deliberate deviations from the constitution's default
> "no heavy backend" posture, per the Compliance Review requirement to
> document rather than silently diverge — both are scoped to the new,
> isolated `outreach-engine/` service, not the existing site.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| New database + backend service where none existed before | Scraping, stateful 4-day cadence tracking, a human-review staging queue, and a live 100-20-4-1 dashboard are all inherently stateful/server-side capabilities that a static site cannot provide — this is exactly the kind of functionality the constitution's "already satisfies" carve-out does not cover. | Bolting API routes onto the existing static Next.js site (`src/app/api/`) was rejected: it would couple this feature's uptime/deploy cadence to the marketing site's Vercel static deploy, directly risk FR-015 (no impact on the existing site), and violate the Additional Constraint against introducing heavy backend pieces into that specific project surface. |
| Minimal single-operator authentication | The dashboard/API expose prospect PII and can trigger Approve actions gating real outreach sends — leaving this fully open would violate Principle V (protect sensitive data). | No auth at all (network-restriction-only, e.g. VPN/Tailscale) was considered but rejected as the *sole* control — the operator may reasonably want dashboard access from outside a restricted network, and PII/approval-actions warrant an explicit credential regardless of network posture; network restriction remains a valid additional layer, not a substitute. |
| New external dependency: Instantly/Unipile dispatch + webhook integration | The operator explicitly mandated automated reply detection (eradicating manual outcome recording for replies) — this is only achievable by integrating with the platform that actually sends/receives the messages, per Principle XI's justification requirement. | A custom-built inbox watcher (IMAP/SMTP polling) was rejected — it would reinvent functionality the named providers already do, for materially more engineering and operational surface (polling cadence, auth to the operator's own mailbox) than consuming their existing webhook. |

## Post-Design Constitution Re-Check

Re-evaluated after Phase 1 design (`data-model.md`, `contracts/`,
`quickstart.md`): no new violations were introduced by the detailed design.
The `OutreachAttempt`/`LintReport` entities and the bounded-revision-loop
rule in `data-model.md` specifically *strengthen* Principle VII (production
reliability — an unbounded retry loop was identified and explicitly bounded
during design) and Principle IX (the Workflow/Outcome state machines are
now concrete enough to be unit-tested, not just described in prose). Gate
remains **PASS**.

**2026-07-11 addendum (automated reply-webhook tracking)**: the operator
directed replacement of manual reply recording with mandatory Instantly/
Unipile webhook detection (spec.md FR-021–FR-024). Re-checked: Principle V
(credentials/webhook secrets), Principle VI (webhook events now explicitly
logged), and Principle IX (signature-verification and idempotency named as
required unit tests) are all satisfied by the updates above; the new
external-dependency deviation is documented in Complexity Tracking per
Principle XI. Gate remains **PASS**.

**2026-07-11 addendum 2 (engineering readiness corrections)**: an
implementation-readiness audit surfaced nine issues, all resolved as
documentation/design corrections before any code was written — no
architecture reversal. Corrected: (1) the MVP's daily-batch scheduling now
depends on the `cron-adapter` only, restoring "OpenClaw is optional, never
a hard dependency" for User Story 1 itself, not just in principle — the
OpenClaw adapter moved to a later Operational Integration phase; (2)
`jobs/` no longer has any path to touching `db/` directly (Process
Boundaries & Data Flow, `research.md` §11), resolving an unverified PGLite
multi-process concern; (3) the webhook-driven outcome transition now has
an explicit regression guard so a reply can never downgrade
`call_booked`/`closed` back to `replied`; (4) re-engagement now has a
stated reset rule so a new attempt starts clean while history is retained;
(5) `BFVDeliverable` verification is now a tri-state enum with a
bounded-retry-then-`needs_attention` path, removing the
can't-check/failed ambiguity; (6) scraped content is now explicitly
specified as untrusted LLM input with a stated sanitization boundary.
Principles re-checked: II (incremental — OpenClaw's removal from the MVP
critical path strengthens this), IV (modularity — Process Boundaries
enforces a single, explicit owner of the database), V/VI (webhook security
and observability extended to cover superseded events), VII (reliability —
the BFV verification failure path was a genuine gap; now closed the same
way the lint bounded-retry already was), IX (testing — prompt-injection
and BFV-isolation tests are now named and sequenced into User Story 1, not
deferred). Gate remains **PASS**.

**2026-07-11 addendum 3 (`plan-eng-review` corrections)**: an independent
outside-voice pass (Claude subagent, Codex unavailable — no filesystem
tools in this sandbox config) found five further gaps that survived the
prior corrections, one self-inflicted by the resume-semantics fix itself.
All five resolved as design/documentation corrections, no code written:
(1) the resume rule was internally contradictory and lacked a terminal-state
definition — narrowed to resuming only attempts stuck at exactly
`generated`, with every named `workflow_state` past that point declared
terminal; (2) `provider_thread_id` had no actual source — "sent" is no
longer operator-recorded at all; `POST /prospects/:id/approve` now
triggers real dispatch automatically and captures the provider's thread id
itself (FR-025), removing a manual step while fixing the missing
correlation key in the same move; (3) BFV "verified" assumed a live
Telegram click-through the Bot API cannot perform — redefined as a
server-side readiness check (bot healthy, token resolves, LLM responds);
(4) re-engagement had no wiring connecting "swept eligible" to "included
in a batch" — collapsed into a single live query inside
`POST /batches/generate` itself, removing the separate mutating sweep
step (and the desync window it created) entirely; (5) intra-process PGLite
contention between the long batch job, the SC-006-bound webhook handler,
and dashboard reads was noted as an implementation-discipline requirement
(short transactions, never held across external I/O) rather than a design
flaw. Principles re-checked: II/VII (both fixes make failure recovery
*more* correct, not more complex — (2) in particular removes a manual
step while fixing a correctness bug), IV (the DispatchClient
interface/mock pattern extends the same pluggable-adapter discipline
already used for AutomationRunner, keeping US1 independently testable
without live provider credentials), VIII (every finding traced to a
specific file:line before being accepted, per the review's own
verification gate). Gate remains **PASS**.

**2026-07-11 addendum 4 (`/speckit-checklist` CHK003 fix — supersedes
addendum 3, point 2)**: addendum 3's point (2) bundled dispatch into
`POST /prospects/:id/approve` itself to fix the missing `provider_thread_id`
source. That bundling introduced a new bug: a dispatch failure left the
attempt stuck at `approved` with no endpoint able to retry it, since
`/approve`'s own precondition only accepts `human_review_queue` — caught
by `/speckit-checklist`'s CHK003 before implementation began. Fixed by
separating the two transitions structurally: `/approve` now performs only
`human_review_queue`→`approved`, full stop; dispatch is driven by two new
endpoints, `POST /internal/dispatch/process` (automatic, bounded, `jobs/`-
triggered) and `POST /prospects/:id/retry-dispatch` (operator-triggered,
uncapped) — see the Dispatch Recovery Rule in `data-model.md` and the new
`contracts/dispatch-client-interface.md` (which also closes `CHK002`, a
lower-severity gap from the same checklist pass: `DispatchClient` had no
dedicated contract file). Principles re-checked: VII (production
reliability — this is a direct fix of a stuck-state bug, the clearest
possible instance of this principle), IX (three new tests target the fix
directly: dispatch-failed is always retryable, retry-dispatch works
uncapped, idempotency key reaches the provider client). No architecture
reversal — the Tier-3 gate, the Anti-Values Linter, and every other
approved structural decision are untouched; this narrows one mechanism's
implementation to be correct under failure. Gate remains **PASS**.
