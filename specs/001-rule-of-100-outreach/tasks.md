---

description: "Task list for feature implementation"
---

# Tasks: Rule of 100 Outreach Engine

**Input**: Design documents from `specs/001-rule-of-100-outreach/`
(`plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`,
`quickstart.md`)

**Tests**: Included. `plan.md`'s Testing Strategy explicitly names dedup,
cadence math, linter checks, the workflow/outcome state machines, webhook
signature/idempotency/regression-guard, prompt-injection defense, BFV
context isolation, batch-resume-after-partial-failure, and
dispatch-failure-is-always-recoverable as required critical-path tests
(Constitution Principle IX, NON-NEGOTIABLE observability/testing).

**Organization**: Tasks are grouped by user story (spec.md priorities:
US1=P1, US2=P2, US3=P2, US4=P3), followed by an **Operational Integration**
phase and a **Polish** phase. US2 is sequenced before US3 because US3's "a
reply stops the cadence" behavior depends on US2's outcome recording
existing first (per spec.md's own stated story dependency).

**Note on one cross-story code dependency**: User Story 1's Batch
Orchestrator (`T043`) has a genuine code dependency on User Story 3's
Re-engagement Reset Rule (`T075`) for the re-engagement half of its Batch
Candidate Pool query — the query that used to be a separate US3-owned
"sweep" is inline inside US1's own batch-generation flow (FR-026). This
does **not** break US1's independent testability: none of US1's own
acceptance scenarios (spec.md Scenarios 1–4) exercise re-engagement, so
US1 ships and is fully verifiable via its own test suite whether or not
US3 exists yet. The dependency only matters once a real re-engaged
prospect needs to flow through the system — which cannot happen for 3+
months after first launch regardless (FR-019's own floor).

## Corrections Applied

**2026-07-11, engineering readiness review** (task-sequencing, state-machine,
and documentation fixes — architecture-preserving):

1. **MVP/OpenClaw decoupling** — `daily-batch-generation` depends only on
   the `cron-adapter`; the OpenClaw adapter moved to Operational
   Integration.
2. **PGLite process-boundary fix** — `jobs/` never imports `db/`/`domain/`;
   internal endpoints let the scheduler trigger work over HTTP only.
3. **Webhook outcome-regression guard** — a webhook reply can only move a
   prospect `sent`/`unresponsive` → `replied`, never regress
   `call_booked`/`closed`.
4. **Re-engagement reset rule** — a re-engaged attempt starts clean
   (outcome status resets, no carried-over cadence).
5. **BFV verification tri-state** — `pending_verification`/`verified`/
   `verification_failed` plus a bounded retry, instead of an ambiguous
   nullable timestamp.
6. **Prompt-injection defense** — scraped content is sanitized before any
   LLM call.
7. **BFV isolation test moved earlier** — into User Story 1, not Polish.
8. **Webhook registration tasks added** — in Operational Integration.
9. **Dashboard task split** — four view tasks plus a shell task.

**2026-07-11, `/plan-eng-review`** (five further gaps found by an
independent outside-voice pass, one self-inflicted by correction #1's own
resume-semantics addition — all resolved as design corrections):

10. **Resume scope narrowed** — a `POST /batches/generate` retry resumes
    only an `OutreachAttempt` still at exactly `generated`; every other
    named `workflow_state` is explicitly terminal-to-batch-resume.
11. **Auto-dispatch on approve** *(superseded by correction #15 below —
    kept here for history; see the `/speckit-checklist` correction)*.
12. **BFV "verified" redefined** — a server-side readiness check (bot
    healthy, token resolves, LLM responds), not a live Telegram
    click-through.
13. **Re-engagement wiring fixed** — `POST /batches/generate` queries
    re-engagement-eligible prospects directly as part of its own
    candidate pool; no separate mutating sweep.
14. **`DispatchClient` interface** (Foundational) — mirrors
    `AutomationRunner`'s pluggable-adapter pattern; a mock/test-double
    lets User Story 1 test dispatch without live provider credentials.

**2026-07-12, `/speckit-checklist` (CHK003 fix — supersedes correction
#11 above)**: correction #11 bundled dispatch into `POST /prospects/:id/approve`,
which created a new bug — a failed dispatch left the attempt permanently
stuck at `approved` with no endpoint able to retry it (`/approve`'s own
precondition only accepts `human_review_queue`). Fixed by making approval
and dispatch two structurally separate, independently-tracked steps:

15. **Approval decoupled from dispatch** — `POST /prospects/:id/approve`
    now performs only `human_review_queue`→`approved`; it never calls
    `DispatchClient` and never touches `provider_thread_id`.
16. **Dispatch as its own explicit, retriable state machine** — new
    `dispatching`/`dispatch_failed` workflow states, `OutreachAttempt.
    dispatch_attempts`/`last_dispatch_error` fields, new
    `POST /internal/dispatch/process` (automatic, bounded, `jobs/`-triggered)
    and `POST /prospects/:id/retry-dispatch` (operator-triggered, uncapped)
    endpoints — a dispatch failure is always visible and always
    recoverable, never a dead end (FR-027/FR-028, spec.md SC-007).
17. **`DispatchClient` gets a dedicated contract** —
    `contracts/dispatch-client-interface.md` (closes a second, lower-severity
    checklist gap, CHK002, found in the same pass) — specifies the
    idempotency-key requirement (`OutreachAttempt.id`) that makes retries
    safe against duplicate real-world sends.

## MVP Execution Plan (2026-07-12)

Categorization overlay only — **no task below is removed or renumbered**;
this section maps every existing `T###` to an execution phase for the
minimum working vertical slice: **Prospect → Research (scrape) → BFV →
Script generation → Quality validation (linter) → Human approval →
Dispatch → Tracking (reply webhook)**. Each task's own checklist entry
later in this file remains the authoritative description of its full
scope; where **MVP Phase 1** implements only part of a task's full scope
(e.g. `T043`'s Batch Orchestrator without the candidate-pool-union/resume
portions), that's called out explicitly in the implementation report, not
silently.

### MVP Phase 1 — the vertical slice itself

**Setup/Foundational**: T001, T002, T005, T006, T007, T012, T013, T016,
T017, T018
**US1 tests**: T020, T021, T022, T023, T025, T026, T029, T031, T032
**US1 impl**: T034, T035, T036, T037, T038, T039, T040, T041, T043
(scrape→BFV→script→lint coordination only — no candidate-pool
union/resume), T044 (simplified — no re-engagement union), T045, T046,
T047
**US2 tests**: T053, T057, T058
**US2 impl**: T061, T062, T063, T066
**Polish**: T093 (revision-retry — the actual remediation path for
Quality validation's fail case; without it "Quality validation" is a dead
end, not a stage), T096 (run quickstart validation — this phase's own
verification step)

### Phase 2 — completeness/resilience for the same stories

T003, T004, T008 (dedup), T009, T010, T011, T014, T015, T019, T024, T027,
T028, T030, T033, T042 (BFV bounded-retry + `needs_attention` routing),
T048 (retry-dispatch), T049, T050, T051, T052, T054, T055, T056, T064,
T065, T067, T094, T095, T097, T098

### Future — out of the named 8-stage slice entirely

**US3 (cadence/re-engagement, not named in the slice)**: T068–T079
**US4 (dashboard, not named in the slice)**: T080–T088
**Operational Integration (already deferred by design)**: T089–T092
**Real provider clients (need live credentials)**: T059, T060

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an
  incomplete task)
- **[Story]**: Maps task to spec.md user story (US1–US4)
- All paths are under `outreach-engine/`, the new top-level directory
  decided in `plan.md`'s Structure Decision — nothing under `src/` (the
  existing static site) is touched by any task below (FR-015).

## Path Conventions

Per `plan.md` Project Structure:
`outreach-engine/src/{api,dashboard,domain,services,automation-runner,db,jobs}/`,
`outreach-engine/tests/{unit,contract,integration}/`. `db/` is imported
only by `api/`+`domain/` (the core service); `jobs/` imports neither (see
`plan.md` Process Boundaries & Data Flow).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Stand up the new, isolated `outreach-engine/` project.

- [X] T001 Create `outreach-engine/` directory structure per `plan.md` Project Structure (`src/api/internal`, `src/api/webhooks`, `src/dashboard`, `src/domain/{prospects,pipeline,linter,cadence,replies,dashboard}`, `src/services/{scraper,telegram,llm,dispatch}`, `src/automation-runner/{openclaw-adapter,cron-adapter}`, `src/db`, `src/jobs/lib`, `tests/{unit,contract,integration}`)
- [X] T002 Initialize `outreach-engine/package.json` (Next.js, TypeScript, `@electric-sql/pglite`, Vitest) as its own project — no shared `package.json`/build with the existing site, per `research.md` §1
- [ ] T003 [P] Configure ESLint + `outreach-engine/tsconfig.json` for the new project
- [ ] T004 [P] Add a CI workflow for `outreach-engine/` in `.github/workflows/outreach-engine-test.yml` (lint/typecheck/test), kept separate from the existing `.github/workflows/test.yml` so the two projects' pipelines never gate on each other

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure every user story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 Define PGLite schema for `Prospect` and `OutreachAttempt` (including `provider_thread_id`, `dispatch_attempts`, `last_dispatch_error`, and the `dispatching`/`dispatch_failed` `workflow_state` values, correction #16) in `outreach-engine/src/db/schema.ts` per `data-model.md` — this module is owned exclusively by `api/`+`domain/`; `jobs/` MUST NEVER import it (`research.md` §11)
- [X] T006 [P] Implement `Prospect` repository (CRUD + `normalized_domain` unique lookup) in `outreach-engine/src/domain/prospects/prospect.ts`
- [X] T007 [P] Implement `OutreachAttempt` repository in `outreach-engine/src/domain/prospects/outreach-attempt.ts`
- [ ] T008 Implement URL-normalization/dedup logic (www/trailing-slash/redirect resilience, FR-007) in `outreach-engine/src/domain/prospects/dedup.ts` (depends on T006)
- [ ] T009 [P] Define the `AutomationRunner` interface (`contracts/automation-runner-interface.md`) in `outreach-engine/src/automation-runner/interface.ts`
- [ ] T010 [P] Implement the `cron-adapter` `AutomationRunner` — the MVP's default scheduling implementation, calling the Core Engine's HTTP API only, no `domain/`/`db/` import — in `outreach-engine/src/automation-runner/cron-adapter/index.ts` (depends on T009)
- [ ] T011 [P] Implement single-operator session auth middleware in `outreach-engine/src/api/auth/session.ts`
- [X] T012 [P] Implement structured logging utility in `outreach-engine/src/lib/logger.ts`
- [X] T013 [P] Implement environment/secrets config loader (Telegram token, LLM key, Instantly/Unipile keys+webhook secrets, DB path) in `outreach-engine/src/lib/config.ts`
- [ ] T014 Implement the standard API error-response shape (`contracts/outreach-api.md` Errors section) in `outreach-engine/src/api/lib/errors.ts`
- [ ] T015 [P] Implement the core-service HTTP client used exclusively by `jobs/` (`outreach-engine/src/jobs/lib/core-api-client.ts`) — the only mechanism by which the scheduler process talks to the database-owning core service (`research.md` §11, correction #2)
- [X] T016 [P] Implement the scraped-content sanitization/untrusted-data-boundary utility in `outreach-engine/src/services/llm/untrusted-content.ts` — delimits and neutralizes prompt-injection attempts in scraped text before any LLM prompt assembly (`plan.md` Security Considerations, correction #6)
- [X] T017 [P] Define the `DispatchClient` interface (`contracts/dispatch-client-interface.md`, correction #17) — `send(package, idempotencyKey) → { status: "sent", providerThreadId } | { status: "failed", reason }`, where `idempotencyKey` is always `OutreachAttempt.id` — in `outreach-engine/src/services/dispatch/interface.ts`. This interface is called **only** by `POST /internal/dispatch/process` and `POST /prospects/:id/retry-dispatch` (correction #15) — never by the approve handler.
- [X] T018 [P] Implement a `DispatchClient` mock/test-double in `outreach-engine/src/services/dispatch/mock-client.ts` — configurable to return `sent`, `failed`, or throw a client-side error, so US1's tests can exercise the full `approved → dispatching → sent` and `approved → dispatching → dispatch_failed → retry → sent` paths without live credentials; the real Instantly/Unipile implementations (US2, T059/T060) satisfy the same interface for production (depends on T017)

**Checkpoint**: Foundation ready — user story phases can now begin.

---

## Phase 3: User Story 1 - Generate a Daily Batch of Ready-to-Send Prospect Packages (Priority: P1) 🎯 MVP

**Goal**: Each day, produce up to 100 deduplicated prospects (operator-supplied
list ∪ re-engagement-eligible prospects, FR-026), each with a scraped
snapshot, a working BFV link, and a lint-passed script — staged in a human
review queue. Approval (the Tier-3 gate) is a pure, standalone transition
(FR-025); a separate, automatic dispatch mechanism then delivers the
package and records "sent" (FR-027), and a dispatch failure is always
visible and always retryable, never a dead end (FR-028, correction #16 —
this is the `CHK003` fix). **Requires no OpenClaw dependency** (correction
#1) and no live provider credentials (correction #14, via the
`DispatchClient` mock) — the `cron-adapter` and mock dispatch client from
Foundational are sufficient.

**Independent Test**: Trigger batch generation; verify count/dedup/flagging
per spec.md Acceptance Scenarios 1–4; confirm approval alone never
dispatches anything (a pure state transition); confirm the separate
dispatch mechanism completes the send against the mock and records
`provider_thread_id`; confirm a simulated dispatch failure leaves the
attempt at a visible `dispatch_failed` state that both automatic retry and
`POST /prospects/:id/retry-dispatch` can recover from, with the original
approval never re-required; confirm a mid-run batch-generation crash is
safely resumable (only `generated`-state attempts reprocessed); confirm
the whole story runs using only the `cron-adapter` + mock dispatch client,
with zero OpenClaw or live-provider involvement.

### Tests for User Story 1

- [ ] T019 [P] [US1] Unit test dedup/URL-normalization edge cases in `outreach-engine/tests/unit/dedup.test.ts`
- [X] T020 [P] [US1] Unit test Anti-Values Linter mechanical checks (reading level, jargon deny-list, structure) against a fixed pass/fail corpus in `outreach-engine/tests/unit/linter-mechanical.test.ts`
- [X] T021 [P] [US1] Unit test Workflow State Machine transition legality — including the explicit terminal-to-batch-resume state set (`needs_attention`, `needs_manual_draft`, `human_review_queue`, `approved`, `dispatching`, `dispatch_failed`, `sent`, `response_tracking`) and that `sent` is unreachable except via a successful dispatch, never via `/approve` directly — in `outreach-engine/tests/unit/workflow-state-machine.test.ts` (corrections #10, #16)
- [X] T022 [P] [US1] Unit test BFV cross-prospect context isolation — Prospect A's scraped context/facts must never leak into Prospect B's BFV bot session or generated script — in `outreach-engine/tests/unit/bfv-context-isolation.test.ts` (moved from Polish, correction #7)
- [X] T023 [P] [US1] Unit test scraped-content prompt-injection defense — malicious scraped text (e.g. "ignore previous instructions...") must be neutralized before reaching any LLM call, for both script generation and the linter judge — in `outreach-engine/tests/unit/prompt-injection-resilience.test.ts` (correction #6)
- [ ] T024 [P] [US1] Contract test for `POST /batches/generate` + `GET /batches/:date`, including the Batch Candidate Pool union with re-engagement-eligible prospects, in `outreach-engine/tests/contract/batches-api.test.ts` (correction #13)
- [X] T025 [P] [US1] Contract test for `POST /prospects/:id/approve` — the `409` illegal-transition case, AND that a successful approve returns **only** `{ workflowState: "approved", approvedAt }`, never `provider_thread_id` or a `sent`/`dispatch_failed` status — proving structurally that this endpoint cannot dispatch — in `outreach-engine/tests/contract/approve-api.test.ts` (correction #15)
- [X] T026 [P] [US1] Contract test for `POST /internal/dispatch/process` — against the mock `DispatchClient`, confirm an `approved` attempt transitions to `sent` with `provider_thread_id` set on success, and to `dispatch_failed` with `last_dispatch_error` set on failure — in `outreach-engine/tests/contract/dispatch-process-api.test.ts` (correction #16)
- [ ] T027 [P] [US1] Contract test for `POST /prospects/:id/retry-dispatch` — confirm it is available for an attempt at `dispatch_failed` with **no cap** (repeat past the automatic-retry cap and confirm it still works), and that it is rejected (`409`) for an attempt not at `dispatch_failed`/stuck-`dispatching` — in `outreach-engine/tests/contract/retry-dispatch-api.test.ts` (correction #16)
- [X] T028 [P] [US1] Unit/integration test proving the `CHK003` fix directly: an attempt whose dispatch fails is NEVER left with zero path to `sent` — walk `approved` → (dispatch fails, exhaust the automatic-retry cap) → `dispatch_failed` → `POST /prospects/:id/retry-dispatch` → `sent`, confirming the original `approvedAt` timestamp is untouched throughout (approval is never redone) — in `outreach-engine/tests/integration/dispatch-failure-always-recoverable.test.ts` (spec.md SC-007, correction #16)
- [X] T029 [P] [US1] Integration test: `quickstart.md` Scenario 1 (complete batch generation) in `outreach-engine/tests/integration/scenario-1-batch-generation.test.ts`
- [ ] T030 [P] [US1] Integration test: `quickstart.md` Scenario 2 (duplicate exclusion, incl. trivial URL variants) in `outreach-engine/tests/integration/scenario-2-dedup.test.ts`
- [X] T031 [P] [US1] Integration test: `quickstart.md` Scenario 3 (failed lint routes to revision, never reaches review queue) in `outreach-engine/tests/integration/scenario-3-linter-gate.test.ts`
- [X] T032 [P] [US1] Integration test: `quickstart.md` Scenario 4 (approve is a pure gate; a separate dispatch step completes the send) in `outreach-engine/tests/integration/scenario-4-approval-gate.test.ts`
- [ ] T033 [P] [US1] Integration test: simulate a mid-run batch-generation crash (e.g. LLM call fails at prospect 40/100), re-invoke `POST /batches/generate` for the same date, and confirm the retry resumes only the `OutreachAttempt`s still at `generated` — never touching anything already in `human_review_queue`/`approved`/`dispatching`/`dispatch_failed`/etc. — in `outreach-engine/tests/integration/batch-resume-after-partial-failure.test.ts` (correction #10)

### Implementation for User Story 1

- [X] T034 [P] [US1] Implement `ScrapedSiteSnapshot` entity + scraper service (fetch, classify complete/insufficient/unreachable, respect `robots.txt`) in `outreach-engine/src/services/scraper/scraper-client.ts` and `outreach-engine/src/domain/pipeline/scraped-site-snapshot.ts`
- [X] T035 [P] [US1] Implement `BFVDeliverable` entity (`verification_status` tri-state) + shared Telegram bot client (per-attempt deep-link token) in `outreach-engine/src/services/telegram/bfv-bot-client.ts` and `outreach-engine/src/domain/pipeline/bfv-deliverable.ts` — `verified` means a server-side readiness check (bot healthy, token resolves to a loaded context, a test prompt gets a real LLM response), NOT a live Telegram click-through, which the Bot API cannot perform (correction #12)
- [X] T036 [P] [US1] Implement the LLM client wrapper (reuses this host's existing Claude access path per `research.md` §9); every call site that includes scraped text MUST route it through the untrusted-content sanitizer (T016) first — in `outreach-engine/src/services/llm/llm-client.ts` (depends on T016)
- [X] T037 [US1] Implement `OutreachScript` generation (Hook→Pain→BFV→Ask, ~3rd-grade level) in `outreach-engine/src/domain/pipeline/outreach-script.ts` (depends on T034, T036)
- [X] T038 [US1] Implement linter mechanical checks (reading level, jargon deny-list, structure) in `outreach-engine/src/domain/linter/mechanical-checks.ts` (depends on T020)
- [X] T039 [US1] Implement linter LLM-judge checks (specificity vs. prospect facts, tone) — scraped `prospectFacts` MUST go through the sanitizer (T016) before entering the judge prompt — in `outreach-engine/src/domain/linter/llm-judge.ts` (depends on T036)
- [X] T040 [US1] Implement `LintReport` entity + combined pass/fail contract (`contracts/anti-values-linter.md`) in `outreach-engine/src/domain/linter/linter.ts` (depends on T038, T039)
- [X] T041 [US1] Implement the Workflow State Machine — `generated`→`quality_checked`→`human_review_queue`→`approved`→`dispatching`→`sent`→`response_tracking`, with `approved`/`dispatch_failed`→`dispatching`→`sent`|`dispatch_failed` as the separate, retriable dispatch sub-machine (correction #16); bounded `revision_requested` retry loop → `needs_manual_draft`; `needs_attention` reachable from incomplete snapshot OR BFV verification failure; and the explicit terminal-to-batch-resume state set — in `outreach-engine/src/domain/pipeline/workflow-state-machine.ts` (depends on T021)
- [ ] T042 [US1] Implement BFV verification's bounded retry + failure routing (on exhausting `verification_attempts`, set `verification_failed` and route the attempt to `needs_attention`) in `outreach-engine/src/domain/pipeline/bfv-deliverable.ts` (depends on T035, T041)
- [X] T043 [US1] Implement the Batch Orchestrator: (a) assembles the Batch Candidate Pool — operator-supplied list (deduped) **union** re-engagement-eligible `unresponsive` prospects, capped at 100 (FR-026, correction #13; calls US3's Re-engagement Reset Rule, T075, per-prospect for the re-engagement half — see the cross-story dependency note at the top of this file); (b) coordinates scrape→BFV→script→lint per attempt; (c) on retry for an already-started date, resumes **only** attempts still at exactly `generated` — every other `workflow_state`, including `dispatching`/`dispatch_failed`, is terminal-to-batch-resume and untouched (correction #10) — in `outreach-engine/src/domain/pipeline/batch-orchestrator.ts` (depends on T034, T035, T037, T040, T041, T042, T075)
- [X] T044 [US1] Implement `POST /batches/generate` and `GET /batches/:date` route handlers in `outreach-engine/src/api/batches/generate/route.ts` and `outreach-engine/src/api/batches/[date]/route.ts` (depends on T043)
- [X] T045 [US1] Implement `GET /prospects` and `GET /prospects/:id` route handlers in `outreach-engine/src/api/prospects/route.ts` and `outreach-engine/src/api/prospects/[id]/route.ts`
- [X] T046 [US1] Implement `POST /prospects/:id/approve` route handler — **only** `human_review_queue`→`approved`; `409` otherwise; never calls `DispatchClient`, never touches `provider_thread_id` (correction #15, the `CHK003` fix) — in `outreach-engine/src/api/prospects/[id]/approve/route.ts` (depends on T041)
- [X] T047 [US1] Implement `POST /internal/dispatch/process` route handler (service-credential-only): for every attempt at `approved`/`dispatch_failed` with `dispatch_attempts` below the automatic-retry cap, calls the configured `DispatchClient` (the mock, T018, in tests/dev — real clients, T059/T060, in production) with `idempotencyKey = OutreachAttempt.id`; on success sets `provider_thread_id`, transitions `dispatching`→`sent`, creates `FollowUpCadenceState`; on failure increments `dispatch_attempts` and records `last_dispatch_error` — in `outreach-engine/src/api/internal/dispatch/process/route.ts` (depends on T017, T018, T041)
- [ ] T048 [US1] Implement `POST /prospects/:id/retry-dispatch` route handler (operator session credential): forces one immediate dispatch attempt for an attempt at `dispatch_failed` (or stuck `dispatching`), with **no cap** on manual retries — same dispatch logic as T047, scoped to one attempt — in `outreach-engine/src/api/prospects/[id]/retry-dispatch/route.ts` (depends on T047)
- [ ] T049 [US1] Implement the `dispatch-process` scheduler entry — `jobs/` calls `POST /internal/dispatch/process` via the core-api-client on a short interval (tighter than the daily batch/cadence jobs) — in `outreach-engine/src/jobs/dispatch-process.ts` (depends on T010, T015, T047)
- [ ] T050 [US1] Implement the `daily-batch-generation` scheduler entry — `jobs/` calls `POST /batches/generate` via the core-api-client — in `outreach-engine/src/jobs/daily-batch-generation.ts` (depends on **T010, T015** only — explicitly NOT on any OpenClaw task; correction #1 proves the MVP is OpenClaw-independent)
- [ ] T051 [US1] Add structured logging + explicit shortfall reporting (fewer than 100 available, FR-001 Scenario 4) to `outreach-engine/src/domain/pipeline/batch-orchestrator.ts` (depends on T043, T012)

**Checkpoint**: User Story 1 fully functional and independently testable using only the `cron-adapter` and the mock `DispatchClient` — a batch can be generated, reviewed, approved (a pure, never-fails-on-delivery gate), and delivered via a separate, always-recoverable dispatch mechanism, with zero OpenClaw involvement and zero live provider credentials. Real Instantly/Unipile dispatch is a drop-in swap (US2), not a rebuild.

---

## Phase 4: User Story 2 - Automatically Track Prospect Replies via Webhook, and Record Manual Outcomes (Priority: P2)

**Goal**: Real Instantly/Unipile `DispatchClient` implementations replace
the mock for production; the system listens for prospect replies via
provider webhook (halting cadence) — **but only when the prospect hasn't
already advanced past `replied`** (correction #3) — while call-booked/closed
and a manual "replied" fallback remain operator-recorded. "Sent" is never
operator-recorded (that's US1's dispatch mechanism, correction #16) — this
story only extends what happens *after* a package is successfully
delivered.

**Independent Test**: Swap the mock `DispatchClient` for the real Instantly
client against a sandbox/test account; approve a package, let
`dispatch-process` (or a manual retry-dispatch call) send it, and confirm a
real `provider_thread_id` comes back; deliver a simulated signed webhook
reply for that thread; confirm autonomous `replied` + cadence halt with
zero operator action (FR-021/FR-022, SC-006); confirm a second, later
webhook reply for a prospect already at `call_booked`/`closed` is recorded
but does NOT regress the status; confirm manual outcomes (call_booked,
closed, replied-fallback) also work.

### Tests for User Story 2

- [ ] T052 [P] [US2] Unit test Outcome State Machine last-write-wins + out-of-order acceptance for **manual** outcomes (replied-fallback, call_booked, closed — e.g. "closed" before a successful dispatch's "sent") in `outreach-engine/tests/unit/outcome-state-machine.test.ts`
- [X] T053 [P] [US2] Unit test webhook signature verification (valid/invalid/missing, fail-closed) in `outreach-engine/tests/unit/webhook-signature.test.ts`
- [ ] T054 [P] [US2] Unit test webhook duplicate-event idempotency (same `provider_event_id` twice ⇒ one state change) in `outreach-engine/tests/unit/webhook-idempotency.test.ts`
- [ ] T055 [P] [US2] Unit test the webhook outcome-regression guard — a verified, matched reply event for a prospect already at `call_booked` or `closed` MUST NOT change `current_outcome_status`, and MUST be recorded with `resulted_in_transition: false` — in `outreach-engine/tests/unit/webhook-outcome-guard.test.ts` (correction #3)
- [ ] T056 [P] [US2] Contract test for `POST /prospects/:id/outcome` — including that `"sent"` is now a **rejected** (4xx) request value, never accepted here (correction #16) — in `outreach-engine/tests/contract/outcome-api.test.ts`
- [X] T057 [P] [US2] Contract test for `POST /webhooks/:provider` (`contracts/dispatch-webhook.md`), including the `applied: false` superseded-event response shape, in `outreach-engine/tests/contract/dispatch-webhook.test.ts`
- [X] T058 [P] [US2] Integration test: `quickstart.md` Scenario 8 (webhook happy path, dedup, bad signature, unmatched thread, late reply, AND the outcome-regression guard case) in `outreach-engine/tests/integration/scenario-8-webhook-reply.test.ts`

### Implementation for User Story 2

- [ ] T059 [P] [US2] Implement the Instantly `DispatchClient` — satisfies the interface from T017 (send-through, returning the real `providerThreadId`, honoring the `idempotencyKey` per `contracts/dispatch-client-interface.md`) plus webhook signature verification — in `outreach-engine/src/services/dispatch/instantly-client.ts`
- [ ] T060 [P] [US2] Implement the Unipile `DispatchClient` — same as T059 — in `outreach-engine/src/services/dispatch/unipile-client.ts`
- [X] T061 [P] [US2] Implement the shared webhook signature-verification utility in `outreach-engine/src/services/dispatch/webhook-signature.ts`
- [X] T062 [US2] Implement the `WebhookEvent` entity (including `resulted_in_transition`, correction #3) + `(provider, provider_event_id)` idempotency check in `outreach-engine/src/domain/replies/webhook-event.ts` (depends on T005)
- [X] T063 [US2] Implement Reply Ingestion (verify → dedup → match `provider_thread_id` → **guard**: apply the `replied` transition only if current status is `sent` or `unresponsive`, else record as superseded → halt cadence only when applied) in `outreach-engine/src/domain/replies/reply-ingestion.ts` (depends on T061, T062)
- [ ] T064 [US2] Implement the Outcome State Machine for manual outcomes only — `replied` (fallback), `call_booked`, `closed`; last-write-wins; `"sent"` is not a valid input here (correction #16) — in `outreach-engine/src/domain/prospects/outcome-state-machine.ts` (depends on T052)
- [ ] T065 [US2] Implement `POST /prospects/:id/outcome` route handler — rejects `"sent"` (4xx); accepts `replied`/`call_booked`/`closed` only — in `outreach-engine/src/api/prospects/[id]/outcome/route.ts` (depends on T064)
- [X] T066 [US2] Implement `POST /webhooks/:provider` route handler — fail-closed signature check, synchronous inline processing to meet the SC-006 5-minute bound, response includes `applied` per the regression guard — in `outreach-engine/src/api/webhooks/[provider]/route.ts` (depends on T063)
- [ ] T067 [US2] Add structured logging for every reply-webhook event, including superseded/non-applied outcomes, in `outreach-engine/src/domain/replies/reply-ingestion.ts` (depends on T063, T012)

**Checkpoint**: User Stories 1 AND 2 both work independently — real dispatch replaces the mock, replies are tracked automatically, and the funnel can never regress from an automated signal.

---

## Phase 5: User Story 3 - Track the 4-Day Follow-Up Cadence (Priority: P2)

**Goal**: Surface the correct due follow-up step for every sent,
not-yet-replied prospect; auto-retire to Unresponsive at day 4; make
Unresponsive prospects re-engagement-eligible 3–6 months later with a
clean reset — feeding directly into US1's own Batch Candidate Pool query
(T043), not a separate sweep (correction #13).

**Independent Test**: Advance a sent prospect through simulated days 1–4
with no reply; confirm the derived due step at each boundary, the
auto-transition to Unresponsive + eligibility-date scheduling, and — once
`POST /batches/generate` selects that prospect for a new batch — that
outcome status resets to `not_yet_sent` with no carried-over pending
follow-ups, per spec.md Acceptance Scenarios 1–8.

### Tests for User Story 3

- [ ] T068 [P] [US3] Unit test cadence-day boundary math for all 5 derived states (none-due-yet/Bump/Video Demo/Takeaway/exhausted) at exact day boundaries in `outreach-engine/tests/unit/cadence-math.test.ts`
- [ ] T069 [P] [US3] Contract test for `GET /prospects?dueToday=true` in `outreach-engine/tests/contract/due-followups-api.test.ts`
- [ ] T070 [P] [US3] Integration test: `quickstart.md` Scenario 5 (4-day cadence due-step progression + reply-stops-cadence) in `outreach-engine/tests/integration/scenario-5-cadence.test.ts`
- [ ] T071 [P] [US3] Integration test: `quickstart.md` Scenario 6 (re-engagement eligibility AND the reset rule, exercised via `POST /batches/generate`'s own candidate-pool query — outcome status resets to `not_yet_sent`, no pending follow-ups carry over, prior attempt history untouched) in `outreach-engine/tests/integration/scenario-6-reengagement.test.ts` (corrections #4, #13)

### Implementation for User Story 3

- [ ] T072 [US3] Implement derived due-step computation as a pure function (not stored, per `data-model.md`) in `outreach-engine/src/domain/cadence/cadence-engine.ts` (depends on T068)
- [ ] T073 [US3] Implement auto-transition to "Unresponsive" at day-4 exhaustion (FR-018) in `outreach-engine/src/domain/cadence/cadence-engine.ts` (depends on T072)
- [ ] T074 [US3] Implement `reengagement_eligible_date` scheduling (4-month default within FR-019's 3–6 month bound) in `outreach-engine/src/domain/cadence/reengagement.ts` (depends on T073)
- [ ] T075 [US3] Implement the Re-engagement Reset Rule (`data-model.md`): given a `Prospect` selected for re-engagement, create a new `OutreachAttempt` (`attempt_number + 1`, `workflow_state = generated`), reset `Prospect.current_outcome_status` to `not_yet_sent`, and leave the prior `FollowUpCadenceState` untouched as retained history — exported for US1's Batch Orchestrator (T043) to call per selected prospect — in `outreach-engine/src/domain/cadence/reengagement.ts` (depends on T074, T007)
- [ ] T076 [US3] Extend `GET /prospects` with the `dueToday` filter in `outreach-engine/src/api/prospects/route.ts` (depends on T072, T045)
- [ ] T077 [US3] Implement `POST /internal/cadence/recompute` route handler (service-credential-only; recomputes due-today status and applies day-4 exhaustion) in `outreach-engine/src/api/internal/cadence/recompute/route.ts` (depends on T072, T073)
- [ ] T078 [US3] Implement `GET /internal/reengagement/eligible-count` route handler — **read-only** (correction #13; no longer a mutating sweep — eligibility is computed live by T043) — in `outreach-engine/src/api/internal/reengagement/eligible-count/route.ts` (depends on T074)
- [ ] T079 [US3] Implement the `cadence-recompute` scheduler entry — `jobs/` calls T077 via the core-api-client, no direct `domain/`/`db/` import — in `outreach-engine/src/jobs/cadence-recompute.ts` (depends on T077, T015)

**Checkpoint**: User Stories 1, 2, AND 3 all independently functional.

---

## Phase 6: User Story 4 - View the 100-20-4-1 Conversion Dashboard (Priority: P3)

**Goal**: Show sent/replied/call-booked/closed counts for a selected period
against the 100-20-4-1 reference ratio, single-day and cumulative.

**Independent Test**: Record known outcomes across fixture prospects;
confirm dashboard counts/ratio match exactly, single-day and range.

### Tests for User Story 4

- [ ] T080 [P] [US4] Contract test for `GET /dashboard` in `outreach-engine/tests/contract/dashboard-api.test.ts`
- [ ] T081 [P] [US4] Integration test: `quickstart.md` Scenario 7 (dashboard math, single-day + cumulative) in `outreach-engine/tests/integration/scenario-7-dashboard.test.ts`

### Implementation for User Story 4

- [ ] T082 [US4] Implement `ConversionSnapshot` on-demand aggregation (read model, not a stored table, per `data-model.md`) in `outreach-engine/src/domain/dashboard/conversion-snapshot.ts`
- [ ] T083 [US4] Implement `GET /dashboard` route handler (single-day + range, 100-20-4-1 reference ratio) in `outreach-engine/src/api/dashboard/route.ts` (depends on T082)
- [ ] T084 [P] [US4] Implement the batch/review-queue dashboard view — including a visible indicator for attempts at `dispatch_failed` (correction #16, so the operator sees a delivery problem, not silence) — in `outreach-engine/src/dashboard/views/BatchReviewQueue.tsx` (depends on T044, T045) (split from the former single dashboard task, correction #9)
- [ ] T085 [P] [US4] Implement the prospect-detail dashboard view — including a manual "Retry dispatch" action wired to `POST /prospects/:id/retry-dispatch` when `workflow_state = dispatch_failed` — in `outreach-engine/src/dashboard/views/ProspectDetail.tsx` (depends on T045, T048) (correction #9/#16)
- [ ] T086 [P] [US4] Implement the due-today cadence dashboard view in `outreach-engine/src/dashboard/views/DueToday.tsx` (depends on T076) (correction #9)
- [ ] T087 [P] [US4] Implement the conversion/funnel dashboard view in `outreach-engine/src/dashboard/views/ConversionDashboard.tsx` (depends on T083) (correction #9)
- [ ] T088 [US4] Implement the dashboard shell/navigation composing the four views in `outreach-engine/src/dashboard/page.tsx` (depends on T084, T085, T086, T087)

**Checkpoint**: All four user stories independently functional — full V1 scope complete, with zero OpenClaw dependency anywhere in the path so far.

---

## Phase 7: Operational Integration (OpenClaw + Live Provider Webhooks)

**Purpose**: The two "go-live" steps that let the system reach real
prospects — deliberately built last, after every user story is validated
against fixtures/mocks, per the Build Strategy recommendation from the
readiness review. Correction #1 (OpenClaw) and correction #8 (webhook
registration) both land here.

- [ ] T089 Implement the OpenClaw `AutomationRunner` adapter — dedicated OpenClaw workspace/agent identity (NOT the unrelated existing `workspace-hamkelasi-omid-ceo-transformation` workspace, per `research.md` §5), Telegram channel delivery for `deliverChannelMessage`, and cron trigger wiring for `scheduleDailyBatch`/`dispatch-process`/`cadence-recompute` as an operator-configurable alternative to the `cron-adapter` — in `outreach-engine/src/automation-runner/openclaw-adapter/index.ts` (depends on T009, T044, T047, T077) — explicitly **not** a dependency of any user story; the `cron-adapter` remains fully sufficient without it (correction #1)
- [ ] T090 Register the production webhook subscription with Instantly (endpoint URL configuration, signing secret setup) pointing at `POST /webhooks/instantly`, documented step-by-step in `outreach-engine/docs/webhook-setup.md` (depends on T066) (correction #8)
- [ ] T091 Register the production webhook subscription with Unipile (same procedure as T090, `POST /webhooks/unipile`) in `outreach-engine/docs/webhook-setup.md` (depends on T066) (correction #8)
- [ ] T092 Run the end-to-end webhook validation procedure against both live providers' test-event features — confirm signature verification, thread matching, idempotency, and the outcome-regression guard all behave exactly as in `quickstart.md` Scenario 8, against real (not simulated) provider traffic — documented in `outreach-engine/docs/webhook-setup.md` (depends on T090, T091)
- [ ] T100 Deployment readiness: expose the Core Engine's `src/api/**/route.ts` handlers (currently factory functions — `createXHandler(...)` — invoked directly by the test suite, with no served process behind them) as a real, running production runtime, so that (a) the BFV Telegram deep links and (b) `POST /webhooks/:provider` are reachable at real, externally-addressable URLs — the deployment-readiness prerequisite T089 (OpenClaw adapter's HTTP calls into the Core Engine) and T090/T091 (registering live provider webhook subscriptions, which need a real endpoint URL to point Instantly/Unipile at) both assume already exists. Per plan.md Primary Dependencies (Next.js Route Handlers) / Target Platform ("systemd-managed long-lived Node process(es)"). Relocated from MVP convergence work (originally filed as F2/T100 against Phase 9): not required for MVP-1 acceptance, which is proven directly against the route handlers in the test suite (55/55 passing, zero running server) — required only for go-live, alongside this phase's other production-exposure steps (depends on T044, T045, T046, T047, T066)

---

## Phase 8: Polish & Cross-Cutting Concerns

- [X] T093 [P] Implement the `revision-retry` bounded lint-fail retry (in-process, invoked synchronously by the Batch Orchestrator on `LintReport.verdict = fail` — not a scheduled job or separate process) in `outreach-engine/src/domain/pipeline/revision-retry.ts`
- [ ] T094 [P] Add a heartbeat/dead-man's-switch check for the `jobs/` scheduler process itself (now a lightweight, DB-free process — the heartbeat only needs to confirm the scheduler is alive and its HTTP calls to the core service are succeeding) in `outreach-engine/src/jobs/scheduler.ts`
- [ ] T095 [P] Add a scheduled PGLite backup script in `outreach-engine/scripts/backup-db.sh`
- [X] T096 Run the full `quickstart.md` validation suite end-to-end against fixtures
- [ ] T097 [P] Security hardening pass: rate-limit the operator login endpoint; confirm webhook signature verification is fail-closed under error conditions; confirm scraper `robots.txt`/backoff compliance; confirm the untrusted-content sanitizer (T016) is applied at every scraped-content-to-LLM call site (script generation T037, linter judge T039) with no bypass path; confirm every `outreach-engine` DB transaction is kept short and never held across an external I/O call (scrape/LLM/Telegram/dispatch), so the long-running batch job and the SC-006-bound inline webhook handler never contend for the single PGLite connection; confirm `dispatch_attempts`' automatic-retry cap has a sane bound and cannot itself become a source of duplicate sends absent provider idempotency support (`checklists/architecture.md` CHK001)
- [ ] T098 Write the `outreach-engine/` operational runbook — deploy, backup/restore, credential rotation for Telegram/LLM/Instantly/Unipile, the OpenClaw-adapter enable/disable switch, and the Instantly/Unipile webhook registration + signing-secret rotation procedures (cross-references T090–T092) — in `outreach-engine/README.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories.
- **US1 (Phase 3)**: Depends on Foundational only for its own acceptance scenarios. No dependency on OpenClaw/Phase 7, no dependency on live provider credentials (uses the `DispatchClient` mock, T018). Has one internal code dependency on US3's T075 (Re-engagement Reset Rule) for the re-engagement half of its Batch Candidate Pool query — see the note at the top of this file; this does not block US1's own testability.
- **US2 (Phase 4)**: Depends on Foundational; also depends on US1's `OutreachAttempt`/`Prospect`/`workflow_state` and the `DispatchClient` interface (T017) existing — cannot start meaningfully before Phase 3's Checkpoint.
- **US3 (Phase 5)**: Depends on Foundational; depends on US2's Outcome State Machine existing for its own cadence-halt-on-reply logic — matches spec.md's own stated story dependency. (US1's T043 depends on US3's T075, a genuine forward reference in build order — see the top-of-file note; sequence US3 before completing US1's T043 in practice, or stub T075 during early US1 work and wire it in once US3 lands.)
- **US4 (Phase 6)**: Depends on Foundational; reads outcome data US2/US3 produce, but its aggregation logic (T082) and the four split view tasks (T084–T087) can be built in parallel once their individual upstream endpoints exist — only the *end-to-end* independent test needs US2/US3 data to exist.
- **Operational Integration (Phase 7)**: Depends on US1/US3's endpoints existing but is deliberately sequenced after all four user stories.
- **Polish (Phase 8)**: Depends on all four user stories being complete; independent of Phase 7.

### Within Each User Story

- Tests written and expected to fail before their corresponding implementation task.
- Entities/services before domain logic; domain logic before route handlers; route handlers before job/adapter wiring.

### Parallel Opportunities

- All `[P]` Setup tasks (T003–T004) in parallel.
- All `[P]` Foundational tasks (T006–T007, T009–T013, T015–T018) in parallel.
- Within US1: T019–T033 (all tests) in parallel; T034–T036 (independent service/entity scaffolds) in parallel.
- Within US2: T052–T058 (all tests) in parallel; T059–T061 (independent client scaffolds) in parallel.
- Within US3: T068–T071 (all tests) in parallel.
- Within US4: T080–T081 (both tests) in parallel; T084–T087 (the four split dashboard views) in parallel once their individual dependencies are met.
- Across stories: once Foundational is done, US1 can proceed while US3/US4's test-writing (not their implementation, which has real data dependencies) is drafted in parallel by a second contributor.

---

## Parallel Example: User Story 1

```bash
# Tests, launched together:
Task: "Unit test dedup/URL-normalization edge cases in outreach-engine/tests/unit/dedup.test.ts"
Task: "Unit test Anti-Values Linter mechanical checks in outreach-engine/tests/unit/linter-mechanical.test.ts"
Task: "Unit test Workflow State Machine transition legality in outreach-engine/tests/unit/workflow-state-machine.test.ts"
Task: "Unit test BFV cross-prospect context isolation in outreach-engine/tests/unit/bfv-context-isolation.test.ts"
Task: "Unit test scraped-content prompt-injection defense in outreach-engine/tests/unit/prompt-injection-resilience.test.ts"

# Independent service/entity scaffolds, launched together:
Task: "Implement ScrapedSiteSnapshot entity + scraper service"
Task: "Implement BFVDeliverable entity + Telegram bot client"
Task: "Implement the LLM client wrapper"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only, Zero OpenClaw, Zero Live Credentials)

1. Phase 1: Setup
2. Phase 2: Foundational (blocks everything) — includes the `DispatchClient` interface + mock
3. Phase 3: User Story 1 — built and validated entirely on the
   `cron-adapter` + mock `DispatchClient`; note T043's forward reference to
   T075 (see Dependencies above) — either build US3's cadence module early
   in stub form, or accept US1 isn't 100% code-complete until US3 lands,
   while still being fully testable against its own acceptance scenarios
4. **STOP and VALIDATE**: `quickstart.md` Scenarios 1–4 pass independently,
   AND T028 (dispatch-failure-always-recoverable) passes — this is the
   `CHK003` regression test and should be treated as an MVP-blocking check,
   not an optional nice-to-have
5. This is a genuine MVP checkpoint — a working batch-generation +
   human-review-queue + separately-retriable-dispatch system, before
   OpenClaw or any live provider credential is touched at all.

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. US1 → validate → this is the MVP (batch generation + Tier-3 review queue + always-recoverable dispatch), OpenClaw-free and mock-dispatch-only
3. US2 → validate → mock swapped for real Instantly/Unipile clients, replies auto-tracked with the outcome-regression guard proven
4. US3 → validate → cadence + re-engagement fully automated, reset rule proven, and US1's T043 dependency on T075 is now fully wired
5. US4 → validate → funnel visibility on top of everything above
6. Operational Integration → wire the real OpenClaw adapter and register real provider webhooks — the last, most-external, hardest-to-reverse steps, exactly matching the Tier-3 philosophy of going slow on anything that reaches real prospects
7. Polish

### Notes

- `[P]` tasks touch different files with no dependency on an incomplete task.
- Verify each test fails before implementing the task it covers.
- Commit after each task or logical group.
- The re-engagement pipeline (T074/T075/T077–T079) has zero possible
  real-world trigger for ~3–4 months after first launch (FR-019's own
  floor) — safe to sequence US3 after US1/US2 without blocking anything,
  as long as T075 is stubbed or built early enough for T043 to compile.
- `jobs/` (T010, T015, T049, T050, T079, T094) must never import
  `outreach-engine/src/db` or `outreach-engine/src/domain` — every task
  touching that directory is an HTTP-only scheduler entry. A code review
  finding an import violating this should be treated as a defect, not a
  style nit (`plan.md` Process Boundaries & Data Flow).
- `POST /prospects/:id/approve` never calls `DispatchClient` and never sets
  `provider_thread_id` or `sent` — if a task or test is written assuming
  it does either, that's a regression to the pre-`CHK003` design that
  produced the stuck-`approved` bug in the first place.
- `POST /prospects/:id/outcome` never accepts `"sent"` — "sent" is
  exclusively set by a successful dispatch (T047/T048), never by approve
  and never by this endpoint.

## Phase 9: Convergence

- [X] T099 Exclude `outreach-engine/` from root `tsconfig.json`'s type-check scope (add to `exclude`, alongside `node_modules`/`public`) and from root `eslint.config.ts`'s `globalIgnores`, so root `npx tsc --noEmit`/`next build`/`npm run lint` never sweep in the isolated project's own `@/*`-aliased, Node-only (`node:crypto`) source and test files, per SC-005 and plan.md's Structure Decision ("provably unaffected") (missing)
- [X] T101 Run and confirm the pre-existing AITransforms site's `npm run lint`, `npx tsc --noEmit`, `npm run test`, and `npm run build` all still pass unchanged after `outreach-engine/` was added (depends on T099 to be a meaningful check), per SC-005 (missing)
- [X] T102 Add the `workflowState` query-param filter to `GET /prospects` in `outreach-engine/src/api/prospects/route.ts`, alongside the existing `status` filter, per `contracts/outreach-api.md` (missing)

## Phase 10: Convergence

Appended by `/speckit-converge` 2026-07-13. Scope note: every finding below is
work whose only prior tracker is a task already marked `[X]` under the MVP
Execution Plan's documented partial-scope trims (T043/T044/T028/T035/T036),
or a robustness gap in checked code — work still tracked by an existing
unchecked task (T003–T098 open items) is deliberately NOT duplicated here.

- [ ] T103 Implement the Batch Candidate Pool union and 100-cap in the Batch Orchestrator and `POST /batches/generate` — assemble the pool as the operator-supplied list (deduped) union re-engagement-eligible `unresponsive` prospects (calling T075's Re-engagement Reset Rule per selected prospect), cap the pool at 100 total, and replace the hardcoded `reengaged: 0` in `outreach-engine/src/api/batches/generate/route.ts` with the real count — the deferred half of T043(a)/T044's authoritative scope; unblocks T024/T071 — per FR-026 (partial)
- [ ] T104 Implement the batch Resume Rule in `outreach-engine/src/domain/pipeline/batch-orchestrator.ts`: a `POST /batches/generate` re-invocation for an already-started date resumes only `OutreachAttempt`s still at exactly `generated`, continuing from the first missing of snapshot/BFV/script — today a mid-run crash strands the attempt at `generated` forever, since re-supplying the same prospect merely dedups and skips it — the deferred half of T043(c); unblocks T033 — per plan: data-model.md Resume Rule / contracts/outreach-api.md resume semantics (missing)
- [X] T105 Harden `processDispatchable` in `outreach-engine/src/api/internal/dispatch/process/route.ts`: catch per-attempt `DispatchClient.send()` exceptions and record them via `recordDispatchFailure` (a thrown send currently strands the attempt at `dispatching` — invisible to `findDispatchable` — and aborts the rest of the pass), and include attempts stuck at `dispatching` past a reasonable timeout in the automatic retry pass, per FR-028 / plan: data-model.md Dispatch Recovery Rule (partial)
- [ ] T106 Implement the production Telegram Bot API `BFVBotClient` — deep-link `/start` token resolution to the prospect-scoped context, real bot-health and context-readiness checks, LLM-backed interactive session serving — behind the existing interface in `outreach-engine/src/services/telegram/bfv-bot-client.ts`; only `MockBFVBotClient` exists and no remaining task tracks the real client — per FR-004 (partial)
- [X] T107 Implement the production `LLMClient` reusing this host's existing Claude access path (`research.md` §9; key via `loadConfig().llmApiKey`) behind the existing interface in `outreach-engine/src/services/llm/llm-client.ts`; only `MockLLMClient` exists and no remaining task tracks the real client used by script generation (T037), the linter LLM-judge (T039), and BFV readiness checks (T035) — per FR-005 / plan: Primary Dependencies (partial)
- [ ] T108 Extend `outreach-engine/tests/integration/dispatch-failure-recoverable.test.ts` with T028's trimmed leg once T048 lands: walk `approved` → exhaust the automatic-retry cap → `dispatch_failed` → `POST /prospects/:id/retry-dispatch` → `sent`, confirming approval is never redone, per SC-007 (partial)
- [ ] T109 Populate `WebhookEvent.raw_payload_ref` when recording inbound events in `outreach-engine/src/domain/replies/webhook-event.ts` and `reply-ingestion.ts`, so unmatched and superseded events stay auditable per plan: data-model.md WebhookEvent / spec.md Key Entities (partial)
