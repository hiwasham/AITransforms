# Contract: Core Engine HTTP API

Internal API, consumed by (a) the operator dashboard UI and (b) the
`AutomationRunner` adapter (see `automation-runner-interface.md`). Not
public-internet-facing beyond the operator's own access (see
`../plan.md` Security Considerations). Schema-level contract — request/response
*shapes*, not implementation code.

All endpoints require the single-operator session credential (§8 of
`research.md`) except where noted.

## Batches

### `POST /batches/generate`
Triggers the daily batch pipeline (ingestion → scrape → BFV provision →
script generation → lint) for prospects not yet processed. Candidate pool
= the request's `prospectList`, deduped against all history (FR-007),
**union** every re-engagement-eligible `unresponsive` prospect (FR-020,
FR-026) — see `data-model.md`'s Batch Candidate Pool — capped at 100 total.

**Resume semantics (narrow — `plan-eng-review` correction)**: calling this
twice on the same day never double-produces a batch, and never touches any
`OutreachAttempt` that has reached ANY of the terminal-to-batch-resume
`workflow_state` values (`needs_attention`, `needs_manual_draft`,
`human_review_queue`, `approved`, `dispatching`, `dispatch_failed`, `sent`,
`response_tracking` — see `data-model.md`'s Workflow State Machine; a
stuck `dispatch_failed` attempt has its own separate recovery path via
`POST /internal/dispatch/process`/`POST /prospects/:id/retry-dispatch`,
never this endpoint). The **only** thing a retry acts on is an attempt still
sitting at exactly `generated` (the process died before that attempt's
pipeline produced any pass/fail verdict) — that attempt is resumed from
whichever of scrape/BFV/script/lint it had already completed. This makes
the endpoint safe to re-call after a partial failure (e.g. an LLM outage
mid-run) without ever risking a silent re-run of work already sitting in
the human review queue or beyond (Constitution Principle VII).

- Request: `{ prospectList: [{ businessName: string, sourceUrl: string }] }`
  (the day's operator/source-supplied candidate list — see spec Assumptions:
  sourcing itself is out of scope, this endpoint *ingests* a list)
- Response: `{ batchDate: date, accepted: number, deduped: number,
  reengaged: number, processing: number }`
- Auth: also callable by the `AutomationRunner` adapter via a scoped
  service credential (not the operator's own session).

### `GET /batches/:date`
- Response: `{ batchDate: date, targetCount: 100, deliveredCount: number,
  shortfallReported: boolean, attempts: [OutreachAttemptSummary] }`
  — surfaces FR-001 Scenario 4's shortfall-reporting requirement explicitly
  rather than letting the operator infer it from a short list.

## Prospects / Attempts

### `GET /prospects`
Query params: `status` (outcome status filter), `dueToday` (boolean —
filters to attempts whose derived cadence step is due today per FR-010),
`workflowState`.
- Response: `{ prospects: [ProspectSummary] }`

### `GET /prospects/:id`
Full package for one prospect's current attempt.
- Response: `{ prospect: Prospect, currentAttempt: OutreachAttempt,
  snapshot: ScrapedSiteSnapshot, bfv: BFVDeliverable,
  script: OutreachScript, lintReports: [LintReport],
  cadence: FollowUpCadenceState | null }`

### `POST /prospects/:id/approve`
This is the Tier 3 human-in-the-loop gate — the operator's one required
action before anything reaches a real prospect. Transitions
`workflow_state` from `human_review_queue` to `approved`. **That is all
this endpoint does** (`CHK003` correction — an earlier revision bundled
dispatch into this call; that was the bug that produced an unrecoverable
stuck state on a dispatch failure, since a retry of `/approve` itself
would then be rejected by this same precondition). It never calls
`DispatchClient`, never touches `provider_thread_id`, and its
success/failure depends solely on whether the attempt was in
`human_review_queue` — never on whether a subsequent send happens to
work. Rejected (`409`) if the attempt is not currently in
`human_review_queue`.
- Response: `{ workflowState: "approved", approvedAt: timestamp }`

Dispatch happens next, as a fully separate step — see
`POST /internal/dispatch/process` (Internal section, below) and
`POST /prospects/:id/retry-dispatch` (next), and the Dispatch Recovery
Rule in `data-model.md`.

### `POST /prospects/:id/retry-dispatch`
Operator session credential. Forces an immediate dispatch attempt for one
specific `OutreachAttempt` currently at `dispatch_failed` (or a
`dispatching` attempt stuck past a reasonable timeout — treated the same
way). **Uncapped** — this is what makes FR-028's "always recoverable, never
a dead end" guarantee concrete regardless of how many automatic attempts
already failed. Rejected (`409`) if the attempt is not at
`dispatch_failed`/stuck-`dispatching` — approval is never re-required and
never re-checked here, only the dispatch step is retried.
- Response: `{ workflowState: "sent" | "dispatch_failed",
  providerThreadId: string | null, lastDispatchError: string | null }`

### `POST /prospects/:id/outcome`
Records an operator-observed outcome. Body: `{ outcome: "replied" |
"call_booked" | "closed" }`. `"sent"` and `"unresponsive"` are intentionally
not valid request values here — the system alone sets both (FR-008/FR-018/
FR-027; "sent" is set automatically by a successful dispatch via
`POST /internal/dispatch/process` or `POST /prospects/:id/retry-dispatch`,
never by `POST /prospects/:id/approve` and never by this endpoint).
- `outcome: "replied"` submitted here is always the **manual fallback**
  path (FR-022) — the primary path is the dispatch provider's webhook,
  handled entirely by `POST /webhooks/:provider` (see
  `dispatch-webhook.md`), which never goes through this endpoint or the
  operator's session credential.
- Any outcome on an attempt already in `response_tracking`: updates
  `Prospect.current_outcome_status` (last-write-wins, per the Outcome State
  Machine in `data-model.md`), regardless of whether the *previous* value
  was set manually or by a webhook.
- Response: `{ prospectId, currentOutcomeStatus, recordedAt: timestamp,
  source: "operator" }` — `source` is always `"operator"` on this endpoint,
  distinguishing it from webhook-sourced or approve-triggered transitions
  in the same `current_outcome_status` field/audit trail.

## Dashboard

### `GET /dashboard?range=YYYY-MM-DD..YYYY-MM-DD`
- Response: `{ range, sent: number, replied: number, callBooked: number,
  closed: number, referenceRatio: {sent:100, replied:20, calls:4, closed:1},
  byDay: [{ date, sent, replied, callBooked, closed }] }`
  — supports both single-day (`range` = one date) and cumulative views
  (FR-014).

## Internal (Scheduler-Triggered)

The mutating endpoints below are called only by an `AutomationRunner`
implementation (`cron-adapter` or, later, the OpenClaw adapter) via the
same scoped service credential as `POST /batches/generate` — never by the
operator's own session, and never by `jobs/` importing `domain/`/`db/`
directly (`research.md` §11, `plan.md` Process Boundaries & Data Flow).
This is what lets the `jobs/` scheduler process trigger writes without
ever holding its own database connection. `GET /internal/reengagement/eligible-count`
is read-only and additionally exposed to the operator session for
dashboard use.

### `POST /internal/cadence/recompute`
Recomputes due-today status for all `sent` attempts and flips any attempt
whose cadence has reached day-4 exhaustion to `unresponsive` (FR-018).
Idempotent — safe to call more often than strictly necessary.
- Response: `{ recomputedCount: number, newlyUnresponsiveCount: number }`

### `POST /internal/dispatch/process`
Attempts dispatch, via the configured `DispatchClient`
(`contracts/dispatch-client-interface.md`), for every `OutreachAttempt`
currently at `approved` or `dispatch_failed` with `dispatch_attempts`
below the automatic-retry cap. Triggered by `jobs/` on a short interval —
tighter than the daily batch/cadence jobs, since dispatch should feel
near-instant to the operator once approved (`CHK003` correction: this is
the mechanism that replaces the old approve-triggers-dispatch bundling).
For each attempt processed:
- On success: sets `provider_thread_id`, transitions `dispatching` → `sent`,
  creates the `FollowUpCadenceState` row with `send_date = today`.
- On failure: increments `dispatch_attempts`, records `last_dispatch_error`,
  transitions to (or remains at) `dispatch_failed` — visible, never silent.
- Response: `{ processed: number, sent: number, failed: number }`

### `GET /internal/reengagement/eligible-count`
**Read-only** (`plan-eng-review` correction — this was previously a
mutating "sweep" that marked eligibility ahead of time; that created a
race between "marked eligible" and "reset applied" that could silently
strand a prospect if a batch ran between the two steps). Eligibility
itself is now computed directly, live, by `POST /batches/generate` as part
of its Batch Candidate Pool query (`data-model.md`) — this endpoint exists
purely for dashboard/observability visibility into how many prospects are
currently eligible, with zero side effects.
- Response: `{ eligibleCount: number }`

## Errors

Standard shape for all endpoints: `{ error: { code: string, message:
string } }`. Workflow-state-machine violations (e.g. approving an attempt
not in `human_review_queue`) return `409 Conflict` with a code identifying
the illegal transition, not a generic `400` — this makes the state machine
enforceable and testable at the contract boundary (Constitution Principle
IX).
