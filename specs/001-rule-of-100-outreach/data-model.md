# Phase 1 Data Model: Rule of 100 Outreach Engine

Entities below elaborate the spec's Key Entities section into a concrete
relational shape. Two entities — `OutreachAttempt` and `LintReport` — are
not named in `spec.md` and are introduced here as design-level
clarifications, called out explicitly so it's clear they're this plan's
interpretation, not new spec requirements. A third, `WebhookEvent`, mirrors
`spec.md`'s own "Reply Webhook Event" Key Entity (added per the operator's
automated-reply-tracking direction) — it is spec-named, just given a
concrete shape here.

## Why `OutreachAttempt` exists

`spec.md` says the Scraped Site Snapshot, BFV Deliverable, and Outreach
Script are each "related 1:1 to a Prospect **per outreach attempt**," and
that a re-engaged (previously "Unresponsive") prospect gets a fresh
snapshot/BFV/script while its prior history is retained, not discarded. A
plain 1:1-to-Prospect relationship can't represent that — it would either
overwrite history on re-engagement or require every downstream table to
carry its own attempt-numbering logic. `OutreachAttempt` is the join entity
that makes "one Prospect, many attempts over time, each attempt's package
data quarantined together" explicit and queryable.

## Why `LintReport` exists

The Anti-Values Linter (a requirement from the planning prompt, elaborated
in `research.md` §7) needs a durable, inspectable record of *why* a script
passed or failed — both so a failed script's revision loop has concrete
feedback to act on, and so linter behavior itself is testable/auditable
(Constitution Principle IX). `spec.md` doesn't name this entity because the
spec is intentionally implementation-agnostic about how "quality checked"
is achieved.

---

## Entities

### Prospect

One row per distinct targeted business, for the life of the system.

| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| business_name | text | as sourced |
| source_url | text | raw, as ingested |
| normalized_domain | text, unique, indexed | lowercased, `www.`-stripped, trailing-slash-stripped, redirect-resolved at ingestion time — the dedup key (FR-007) |
| first_processed_at | timestamp | date of the *first* `OutreachAttempt` |
| current_outcome_status | enum | `not_yet_sent` \| `sent` \| `replied` \| `call_booked` \| `closed` \| `unresponsive` — mirrors FR-008; always reflects the *latest* attempt's state |
| attempt_count | integer | increments on each new `OutreachAttempt`; starts at 1 |

**Validation rules**: `normalized_domain` uniqueness enforces FR-007's dedup
across all history. `current_outcome_status` transitions are constrained by
the Outcome State Machine below; the system (not the operator) is the only
writer of `unresponsive` (FR-008).

### OutreachAttempt

One row per outreach cycle for a `Prospect` (the first attempt, plus any
later re-engagement attempts per FR-020).

| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| prospect_id | uuid, FK → Prospect | |
| attempt_number | integer | 1, 2, 3... per prospect |
| batch_date | date | which daily batch produced this attempt |
| workflow_state | enum | see Workflow State Machine below |
| provider_thread_id | text, unique, indexed, nullable | set automatically, server-side, the moment a dispatch attempt for this attempt *succeeds* (`dispatching` → `sent`) — never set by `POST /prospects/:id/approve` itself, which only ever gates `human_review_queue` → `approved` (FR-025, `CHK003` correction: approval and dispatch are separate steps); never manually entered; the correlation key inbound reply webhooks match against (FR-021/FR-022) |
| dispatch_attempts | integer | count of automatic dispatch attempts made so far; bounds *automatic* retry only — manual retry via `POST /prospects/:id/retry-dispatch` has no cap (FR-028) |
| last_dispatch_error | text, nullable | the most recent dispatch failure reason, surfaced to the operator so a `dispatch_failed` attempt is never a silent stall (FR-028, `CHK003` correction) |
| created_at | timestamp | |

Exactly one `OutreachAttempt` per `Prospect` may be "active" (workflow_state
not in a terminal failure state) at a time — a prospect can't be mid-attempt
twice concurrently.

### ScrapedSiteSnapshot

1:1 with `OutreachAttempt`.

| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| outreach_attempt_id | uuid, FK, unique | |
| scraped_at | timestamp | |
| status | enum | `complete` \| `insufficient` \| `unreachable` — drives FR-003's incomplete-flagging |
| raw_content_ref | text | pointer to stored scrape output (see Security Considerations — not embedded inline in logs) |
| extracted_facts | jsonb | structured points pulled out for personalization (services offered, FAQ topics, notable copy) — the input to both BFV provisioning and script generation |

**Validation rules**: if `status != complete`, no `BFVDeliverable` or
`OutreachScript` may be created for this attempt (FR-003); the attempt's
`workflow_state` is set to a `needs_attention` terminal state instead of
proceeding.

### BFVDeliverable

1:1 with `OutreachAttempt` (only for attempts whose snapshot is `complete`).

| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| outreach_attempt_id | uuid, FK, unique | |
| telegram_deep_link_token | text, unique, indexed | unguessable (not sequential) — see Security Considerations |
| context_ref | text | pointer to the prospect-scoped context the shared bot uses to answer that token's conversation |
| verification_status | enum | `pending_verification` \| `verified` \| `verification_failed` — replaces a bare nullable timestamp specifically so "not checked yet" and "checked and failed" are distinct, queryable states instead of both being represented as null |
| verified_at | timestamp, nullable | set only when `verification_status` transitions to `verified` — the pre-built-before-send proof, FR-017 |
| verification_attempts | integer | count of readiness checks performed so far; bounds the retry before giving up (mirrors the lint bounded-retry pattern) |

**What "verified" means (`plan-eng-review` correction)**: a server-side
readiness check, not a live Telegram click-through. The Telegram *Bot* API
(the only Telegram dependency in this plan, `research.md` §6) has no way to
simulate a user opening a deep link and clicking `/start` — a bot cannot
initiate a conversation with itself, so end-to-end proof that a human's
tap would work is not achievable with the chosen stack, and this plan does
not add a second Telegram integration (a user/MTProto-style client) to get
it. `verified` therefore means: (a) the bot process is healthy and
reachable, (b) `telegram_deep_link_token` resolves server-side to a loaded
`context_ref`, and (c) a test prompt run against that context returns a
real, non-error response from the LLM. This proves everything under the
system's own control works; it does not prove Telegram's delivery of the
`/start` interaction itself, which is out of this system's control by
construction.

**Validation rules**: `quality_checked` is unreachable while
`verification_status != "verified"` (pre-built-before-send, FR-017). A
failed check increments `verification_attempts` and retries the Telegram
link resolution up to a fixed cap; on exhausting the cap without success,
`verification_status` is set to `verification_failed` and the owning
`OutreachAttempt`'s `workflow_state` is routed to the same terminal
`needs_attention` state used for an incomplete `ScrapedSiteSnapshot` (see
Workflow State Machine below) — a failed BFV link never silently blocks an
attempt forever and never silently proceeds to the review queue either.

### OutreachScript

1:1 with `OutreachAttempt` (only for attempts whose snapshot is `complete`).
A new row is created on every regeneration triggered by a failed
`LintReport` — the table keeps the full revision history, `is_current`
marks the one under active consideration.

| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| outreach_attempt_id | uuid, FK | |
| revision_number | integer | 1, 2, 3... |
| is_current | boolean | exactly one true row per attempt |
| body_text | text | the Hook → Pain → BFV Link → Ask message |
| generated_at | timestamp | |

### LintReport

One row per lint pass over one `OutreachScript` revision.

| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| outreach_script_id | uuid, FK | |
| verdict | enum | `pass` \| `fail` |
| reading_grade_score | numeric | mechanical check result |
| jargon_terms_found | text[] | mechanical check result |
| specificity_verdict | enum | `pass` \| `fail`, LLM-judge layer |
| structure_verdict | enum | `pass` \| `fail` — Hook/Pain/BFV/Ask all present |
| revision_feedback | text, nullable | required when `verdict = fail`; consumed by the next script-generation retry |
| checked_at | timestamp | |

**Validation rules**: `verdict = pass` only if every sub-check passes. A
`fail` verdict MUST carry non-empty `revision_feedback` (the "failed
messages must return for revision" requirement — a fail with no actionable
feedback is treated as a defect in the linter itself, not a valid result).

### WebhookEvent

One row per inbound reply-webhook delivery from a dispatch provider,
retained even when unverifiable or unmatched (auditability, FR-024).

| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| provider | enum | `instantly` \| `unipile` |
| provider_event_id | text, unique per provider, indexed | the provider's own event identifier — the idempotency key for FR-024; a second delivery with the same `(provider, provider_event_id)` is detected and no-op'd here, before any state change is attempted |
| signature_verified | boolean | result of FR-023's check; unverified events are never allowed to cause a state change |
| matched_outreach_attempt_id | uuid, FK, nullable | resolved via `OutreachAttempt.provider_thread_id`; null means unmatched — flagged for operator attention, not silently dropped |
| resulted_in_transition | boolean | `true` only if this event actually changed `Prospect.current_outcome_status`; `false` for a matched-but-superseded event (see Validation rules) — distinguishes "we saw this and it mattered" from "we saw this and correctly did nothing" |
| received_at | timestamp | |
| raw_payload_ref | text | pointer to stored payload (not inlined into logs — see Security Considerations in `plan.md`) |

**Validation rules**: a `WebhookEvent` with `signature_verified = false`
MUST NOT trigger any `Prospect`/`OutreachAttempt` state change — it is
recorded for observability only, with `resulted_in_transition: false`. A
`WebhookEvent` whose `(provider, provider_event_id)` already exists MUST
NOT be reprocessed — this is what makes replied-detection idempotent at
the data layer, not just by convention in application code. A
`WebhookEvent` that matches an `OutreachAttempt` whose `Prospect` is
already at `call_booked` or `closed` MUST be recorded with
`matched_outreach_attempt_id` set and `resulted_in_transition: false` —
**the event is real and retained, but it MUST NOT downgrade the prospect's
outcome status back to `replied`** (the outcome-regression guard; see
Outcome State Machine below and `contracts/dispatch-webhook.md`).

### FollowUpCadenceState

1:1 with `OutreachAttempt`, created automatically the instant a dispatch
attempt succeeds and `workflow_state` reaches `sent` (via either
`POST /internal/dispatch/process` or `POST /prospects/:id/retry-dispatch`
— never via `POST /prospects/:id/approve`, which no longer triggers
dispatch itself, `CHK003` correction) — not via any operator "mark as
sent" action, since "sent" is not a manually recorded outcome. Active only
while `current_outcome_status` is `sent`.

| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| outreach_attempt_id | uuid, FK, unique | |
| send_date | date | |
| exhausted_at | timestamp, nullable | set when day 4 elapses with no reply |
| reengagement_eligible_date | date, nullable | set only when `exhausted_at` is set; 3–6 months out (see Business Rule below) |

`current_due_step` (Initial / Bump / Video Demo / Takeaway / none-due-yet /
exhausted) is **derived, not stored** — computed from
`today - send_date` in full 24-hour periods, per FR-009/FR-010. Storing it
would let it drift out of sync with the clock; deriving it on read makes the
mapping (0→none due, 1→Bump, 2→Video Demo, 3→Takeaway, ≥4→exhausted) a pure
function with no update path to get wrong.

**Business rule — `reengagement_eligible_date` calculation**: set to
`exhausted_at + a duration drawn from [3 months, 6 months]` at exhaustion
time. FR-019 only bounds the window (no sooner than 3mo, no later than
6mo); this plan fixes a concrete deterministic default of **4 months**
(the window's midpoint) unless/until the operator specifies a preference —
recorded here as a NEEDS-CLARIFICATION-avoided default per the constitution's
guidance to state assumptions explicitly rather than block on them.

### ConversionSnapshot (read model, not a stored table)

Computed on demand from `OutreachAttempt.workflow_state` transition
timestamps and `Prospect.current_outcome_status`, grouped by day or date
range: counts of sent / replied / call_booked / closed, plus the static
100-20-4-1 reference ratio for comparison (FR-013/FR-014). Not persisted as
its own table for V1 — at this data volume (~100 rows/day), aggregating on
read is simpler and can't drift out of sync with source data (Principle II:
simplest thing that satisfies the requirement). Revisit as a materialized
rollup only if dashboard query latency becomes a real, measured problem.

---

## State Machines

### Workflow State Machine (`OutreachAttempt.workflow_state`)

This is the Tier 3 staging-queue state machine requested in planning:

```
generated  ◄── the ONLY state a batch-generation retry may ever touch (see
   │            Resume Rule below) — every state after this line is reached
   │            successfully and MUST NOT be silently reprocessed by a retry
   │ (mechanical + LLM-judge checks run)
   ▼
quality_checked ──(any check fails)──► revision_requested
   │ (pass)                                  │
   ▼                                         │ (new OutreachScript
human_review_queue                           │  revision generated,
   │ (operator approves — the Tier-3         │  re-enters quality_checked)
   │  gate; this transition is ALL           ▼
   │  `POST /prospects/:id/approve`   [loops back into quality_checked]
   │  ever does — CHK003 correction:
   │  approval never blocks on or
   │  bundles a delivery outcome)
   ▼
approved ◄────────────────────────────────────────────────┐
   │ (system automatically initiates a dispatch attempt —  │
   │  a SEPARATE step from approval, triggered by           │
   │  POST /internal/dispatch/process or, on demand,        │
   │  POST /prospects/:id/retry-dispatch)                   │
   ▼                                                        │
dispatching                                                 │
   │                              │                         │
   │ (provider confirms          │ (send fails: network     │
   │  send; provider_thread_id   │  error, provider 5xx,    │
   │  captured)                  │  timeout, or ambiguous    │
   ▼                              │  crash mid-call)          │
sent                              ▼                          │
   │ (immediate)            dispatch_failed                  │
   ▼                              │ (automatic bounded retry, │
response_tracking                 │  with backoff, OR an      │
   ── terminal for this           │  operator-triggered       │
      attempt;                    │  retry-dispatch call —    │
      Prospect.current_           │  UNCAPPED; always         │
      outcome_status               │  available) ──────────────┘
      tracks what happens
      next; see Outcome
      State Machine
```

**Terminal states with respect to a `POST /batches/generate` retry**
(never touched by the batch-resume mechanism — `plan-eng-review`
correction): `needs_attention`, `needs_manual_draft`, `human_review_queue`,
`approved`, `dispatching`, `dispatch_failed`, `sent`, `response_tracking`.
Every one of these represents an attempt that successfully finished at
least one full pass through the pipeline (even a "failed" one like
`needs_attention` is a completed, intentional outcome, not a crash
artifact) — none may ever be silently reprocessed by a *batch* retry.
`dispatch_failed` has its own, separate recovery mechanism (below) — it is
"terminal" only in the batch-resume sense, never in the sense of being
stuck.

**Resume Rule (the only case a `POST /batches/generate` retry acts on)**:
an `OutreachAttempt` still sitting at exactly `generated` — meaning the
process died before the pipeline produced a pass/fail verdict for it — is
the sole target of a `POST /batches/generate` retry for that date. The
Batch Orchestrator determines exactly where to resume by checking, in
order, whether `ScrapedSiteSnapshot`, `BFVDeliverable`, and `OutreachScript`
rows already exist for that attempt, and continues from the first missing
one; it never redoes a step whose output already exists. `revision_requested`
is not listed as a resumable or terminal state because it is never
persisted between orchestrator invocations — the bounded revision-retry
loop runs entirely synchronously within a single Batch Orchestrator call,
so an attempt is never left "at rest" in `revision_requested` for a later
retry to find.

**Dispatch Recovery Rule (`CHK003` correction — separate from the Resume
Rule above; this is what actually fixes the CHK003 gap)**: approval
(`human_review_queue` → `approved`) and dispatch (`approved`/
`dispatch_failed` → `dispatching` → `sent`/`dispatch_failed`) are two
independent state transitions, never one bundled action:

- `POST /prospects/:id/approve` performs **only** the first transition. It
  never calls the dispatch client, never sets `provider_thread_id`, and
  its success/failure depends solely on whether the attempt was in
  `human_review_queue` — never on the outcome of a send.
- Dispatch itself is attempted by `POST /internal/dispatch/process`
  (service-credential-only, triggered on a short interval by `jobs/` —
  mirrors `POST /internal/cadence/recompute`'s HTTP-only pattern) for
  every attempt currently at `approved` or `dispatch_failed` with
  `dispatch_attempts` below the automatic-retry cap. Every dispatch call
  passes the `OutreachAttempt.id` as an idempotency key to the provider
  (`contracts/dispatch-client-interface.md`), so a retry following an
  ambiguous failure (timeout, crash mid-call) does not risk a duplicate
  real-world send, to the extent the provider honors idempotency keys —
  an assumption flagged, not yet verified against Instantly/Unipile's
  actual APIs (see `checklists/architecture.md` CHK001).
- On failure, `dispatch_attempts` increments and `last_dispatch_error`
  records why — the attempt is never left silently at `approved` looking
  like nothing happened.
- Once automatic attempts are exhausted, `POST /prospects/:id/retry-dispatch`
  (operator session credential) lets the operator force an immediate retry
  for one specific attempt, **with no cap** — this is what makes FR-028's
  "always recoverable, never a dead end" guarantee concrete: there is
  always an available action that can move a `dispatch_failed` attempt
  back toward `sent`, indefinitely, without ever touching or repeating the
  approval step itself.
- An attempt found stuck at `dispatching` past a reasonable timeout (the
  process died mid-call, outcome ambiguous) is treated identically to
  `dispatch_failed` for retry purposes — the same idempotency-keyed retry
  path applies.

A snapshot with `status != complete` never enters `generated` — it goes
straight to a terminal `needs_attention` state (FR-003) and is excluded
from the review queue. A `BFVDeliverable` that exhausts its verification
retry cap (`verification_status = verification_failed`, see that entity's
Validation rules) routes its attempt to the same terminal `needs_attention`
state, for the same reason: neither an incomplete snapshot nor a broken BFV
link may silently reach the human review queue.

**Bounded revision loop**: `revision_requested` may cycle back to
`quality_checked` a limited number of times (operationally configurable;
this plan does not fix the number, only the requirement that it be bounded)
before the attempt is instead flagged `needs_manual_draft` and surfaced to
the operator outside the normal batch flow — an unbounded loop would let a
single stubborn prospect silently consume generation/lint budget forever,
which conflicts with Principle VII (production reliability).

### Outcome State Machine (`Prospect.current_outcome_status`)

Entered once the owning `OutreachAttempt` reaches `sent`:

```
                    ┌──────────────────────────────────────────┐
                    │   WEBHOOK-DRIVEN "replied" — GUARDED:     │
                    │   only fires from sent or unresponsive.   │
                    │   From call_booked/closed: event is       │
                    │   stored (WebhookEvent), NOT applied.      │
                    └──────────────────────────────────────────┘
sent ──(guarded webhook reply, FR-021/022; OR manual fallback)──►
        replied ──(manual only)──► call_booked ──(manual only)──► closed
 │                                    (manual outcomes may be recorded
 │                                     directly and out of order — FR
 │                                     edge case: "closed" before "sent"
 │                                     is accepted, manual last-write-wins.
 │                                     A *webhook* reply arriving after
 │                                     call_booked/closed is recorded but
 │                                     never regresses the status — see
 │                                     the guard above.)
 │
 └──(4 full days elapse, no reply)──► unresponsive
                                          │ (late reply, guarded webhook OR manual — accepted, per spec.md Edge Cases)
                                          ▼
                                        replied
                                          │
                                          │ (reengagement_eligible_date arrives,
                                          │  selected into a new daily batch)
                                          ▼
                                   NEW OutreachAttempt (attempt_number + 1):
                                   Prospect.current_outcome_status resets to
                                   not_yet_sent; fresh ScrapedSiteSnapshot/
                                   BFV/Script; see Re-engagement Reset Rule
```

The `sent → replied` and `unresponsive → replied` edges each have two
triggers: the primary, automated one (a verified, not-yet-processed
`WebhookEvent` matched to this attempt — FR-021/FR-022, **guarded**: only
applies when current status is `sent` or `unresponsive`) and a manual
operator override reserved for when the webhook integration is delayed or
unavailable (spec.md Edge Cases). **The guard applies only to the
webhook-driven path.** Manual recording via `POST /prospects/:id/outcome`
keeps its existing last-write-wins semantics unconditionally — a human
operator can always correct any state, including regressing one, because
the operator is trusted to know something the system doesn't; an automated
webhook signal is not extended that same trust once a human has already
advanced the funnel past `replied`.

Per the spec's edge cases: a reply recorded after `unresponsive` (late
reply, webhook-detected or manual) or an out-of-order *manual* outcome
(closed recorded before sent) is accepted as the new authoritative state
rather than rejected. A **webhook** reply matched to an attempt already at
`call_booked` or `closed` is the one case that is deliberately *not*
applied — see `WebhookEvent.resulted_in_transition` and
`contracts/dispatch-webhook.md`.

### Batch Candidate Pool (`plan-eng-review` correction — FR-026)

`POST /batches/generate`'s candidate pool for a given day is **not** just
the operator-supplied `prospectList` from the request body. It is that
list (deduped against all history, FR-007) **union** every `Prospect`
whose `current_outcome_status = unresponsive` and whose
`FollowUpCadenceState.reengagement_eligible_date <= today` — computed as a
direct query at batch-generation time, capped at 100 total. There is no
separate earlier "sweep" step that marks eligibility ahead of time: the
prior design's `POST /internal/reengagement/sweep` mutating job created a
race between "marked eligible" and "reset applied" that could silently
strand a re-engagement-eligible prospect forever if a batch ran between
those two steps. Computing eligibility as part of the same
batch-generation call that creates the new `OutreachAttempt` removes that
gap entirely — the endpoint now exists only as a **read-only** count for
observability/dashboard purposes (`contracts/outreach-api.md`), not a
mutating gate.

### Re-engagement Reset Rule

When a `Prospect` is pulled into a new daily batch via the eligibility
clause above (FR-020), the Batch Orchestrator creates a new
`OutreachAttempt` (`attempt_number + 1`, `workflow_state = generated`) and
MUST, at that same moment:

- **Reset** `Prospect.current_outcome_status` to `not_yet_sent` — the new
  attempt starts clean; the prospect is not "still unresponsive" while its
  fresh scrape/BFV/script/lint cycle runs.
- **Not carry forward** any pending follow-up: the prior `OutreachAttempt`'s
  `FollowUpCadenceState` (already inactive since `exhausted_at` is set)
  stays exactly as it was — untouched, retained, queryable against the
  *prior* `attempt_id`. It is never copied, reactivated, or referenced by
  the new attempt.
- **Create nothing cadence-related yet** for the new attempt — a
  `FollowUpCadenceState` row for `attempt_number + 1` is only created if
  and when *that* attempt itself reaches `sent`, exactly like a first-time
  attempt (see `FollowUpCadenceState` above: "created when the attempt's
  `workflow_state` reaches `sent`").
- **Preserve, unmodified, all history** of every prior attempt — snapshot,
  BFV, scripts, lint reports, cadence state, and webhook events for
  `attempt_number` 1..N-1 remain exactly as they were, queryable by
  `attempt_id`. Nothing is deleted or mutated by a re-engagement.

This is what makes `Prospect.current_outcome_status` genuinely mean "the
latest attempt's state" (as stated in the `Prospect` entity above) rather
than a stale label left over from an attempt that's no longer active.

---

## Entity Relationship Summary

```
Prospect 1───N OutreachAttempt 1───1 ScrapedSiteSnapshot
                     │         1───1 BFVDeliverable (if snapshot complete)
                     │         1───N OutreachScript (revision history)
                     │                    1───N LintReport (one per lint pass)
                     │         1───1 FollowUpCadenceState (once sent)
                     │         (provider_thread_id) ◄── matched by ── WebhookEvent
                     │                                    (guarded: applies only
                     │                                     from sent/unresponsive)
                     ▼
              workflow_state (staging queue)

Prospect.current_outcome_status ── mirrors the active OutreachAttempt's
                                    post-send outcome (webhook- or
                                    operator-driven); reset to not_yet_sent
                                    on every re-engagement (see
                                    Re-engagement Reset Rule)
```
