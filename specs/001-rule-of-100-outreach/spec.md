# Feature Specification: Rule of 100 Outreach Engine

**Feature Branch**: `feature/daily100openclawoutreach`

**Created**: 2026-07-11

**Status**: Draft

**Input**: User description: "Build an automated 'Rule of 100' outreach engine using OpenClaw that executes a high-converting cold outreach playbook. The goal is to process 100 highly targeted prospects daily, automatically generate a 'Big Fast Value' (BFV) deliverable for each, and drive a relentless follow-up cadence. Identify & Scrape 100 targeted prospects daily and scrape their website/FAQ data. Weaponize BFV: generate a unique, interactive custom Telegram Bot link per prospect. Generate Hormozi-style, Hook->Pain->BFV Link->Ask outreach copy at a 3rd-grade reading level. Enforce a 4-day follow-up cadence for non-responders (Day 1 Initial, Day 2 Bump, Day 3 Video Demo, Day 4 Takeaway). Track the 100-20-4-1 math (Sent->Replies->Calls->Close) on a dashboard. Primary user: the founder/operator running the Rule of 100 to secure high-ticket AI deployments."

## References

Operator-supplied business-logic material, kept in full under `resources/`
and folded into the requirements below (not implementation detail — this is
the exact messaging/cadence/BFV standard the feature must satisfy):

- [`resources/follow-up-cadence-scripts.md`](resources/follow-up-cadence-scripts.md)
  — exact 4-day cadence triggers, script templates, and the post-sequence
  3–6 month re-engagement rule (drives FR-009/FR-010/FR-018–FR-020).
- [`resources/bfv-concept.md`](resources/bfv-concept.md) — the BFV standard
  (zero-friction access, pre-built-before-send, functionally real vs. a
  generic lead magnet) (drives FR-004/FR-016/FR-017).
- [`resources/golden-reject-set-2026-07-16.md`](resources/golden-reject-set-2026-07-16.md)
  — the 5 operator-rejected messages from the first real batch, verbatim,
  with defect classes D1–D7. Ground-truth regression fixtures for the
  Amendment 1 quality gates (drives FR-029–FR-034, SC-008–SC-010).
- [`recovery-plan-first-100.md`](recovery-plan-first-100.md) — the minimal
  recovery plan sequencing the Amendment 1 gates into "before first 10
  sends" / "before first 100" / "later" (operator direction, 2026-07-16).

## Amendment 1 — Send-Readiness Quality Gates (2026-07-16)

**Trigger**: The first real generated batch (5 packages,
`out/first-100-2026-07-14.csv`) was reviewed by the operator in the 002
review dashboard. **All 5 were rejected.** The review workflow itself
worked (speed good); the generated content was unsendable. The rejected
messages and their defect classes (D1–D7) are preserved verbatim in
[`resources/golden-reject-set-2026-07-16.md`](resources/golden-reject-set-2026-07-16.md).

**Root causes** (spec-level, from the post-mortem analysis):

1. The operator's actual generation path (`scripts/first-100.ts`) bypassed
   the Anti-Values Linter, LLM judge, and revision loop entirely — the
   quality pipeline existed but nothing routed the real workflow through
   it.
2. Even routed, the existing gates check **form** (reading grade, jargon
   deny-list, sentence-count structure, "references some fact") — not
   **sendability** (claims are true, pain is evidenced, deliverables
   exist, message is self-consistent, prospect is a plausible buyer).
   Every rejected message passes the pre-amendment gates.
3. A deterministic post-generation CTA append ("I made you a short
   personal video…") inserted a false claim into 5/5 messages.

**Scope of this amendment**: FR-029 through FR-034 (quality gates
G1–G6), SC-008 through SC-010, the withdrawal of the "input list is
inherently viable" assumption, and the golden reject set as a permanent
regression fixture. Sequencing and effort triage live in
[`recovery-plan-first-100.md`](recovery-plan-first-100.md) — gates are
staged as *before first 10 sends* / *before first 100* / *later*; this
spec defines the full standard, the recovery plan defines the order.

Feature 002's FR-021 (rejection reasons, gate G7) is amended in that
feature's own spec — it belongs to the review surface, not the engine.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate a Daily Batch of Ready-to-Send Prospect Packages (Priority: P1)

Each day, the operator opens the system and finds a batch of up to 100 targeted
prospects, each already paired with a scraped snapshot of that prospect's
website/FAQ content, a working BFV (Big Fast Value) demo link built from that
content, and a personalized outreach script (Hook → Pain → BFV Link → Ask,
written at a 3rd-grade reading level). None of these 100 prospects have been
contacted by the operator before.

**Why this priority**: This is the core engine. Without a daily batch of
deduplicated, BFV-equipped, script-ready prospects, there is no "Rule of 100"
outreach to run — every other capability (cadence tracking, funnel dashboard)
exists only to manage what this story produces.

**Independent Test**: Can be fully tested by triggering (or waiting for) one
day's batch generation and verifying: exactly the expected count of new
prospects appears (up to 100), none match a prospect processed on a prior day,
and each one has a non-empty BFV link and a complete outreach script.

**Acceptance Scenarios**:

1. **Given** a fresh day with no prior batch generated, **When** the batch
   runs, **Then** up to 100 new prospects are produced, each with scraped
   site/FAQ content, a BFV demo link, and a Hook→Pain→BFV Link→Ask script.
2. **Given** a prospect that was already processed on a previous day, **When**
   that same prospect would otherwise be selected again, **Then** the system
   excludes it from the new batch.
3. **Given** a prospect whose website cannot be scraped (unreachable, empty,
   no FAQ-like content), **When** the batch runs, **Then** that prospect is
   flagged as incomplete/needs-attention rather than silently producing a
   broken or blank BFV link and script.
4. **Given** fewer than 100 qualifying, never-before-contacted prospects are
   available on a given day, **When** the batch runs, **Then** the system
   delivers as many complete packages as are available and clearly reports
   the shortfall instead of padding with duplicates or incomplete entries.

---

### User Story 2 - Automatically Track Prospect Replies via Webhook, and Record Manual Outcomes (Priority: P2)

As the system automatically dispatches approved packages through the
operator's outreach platform, it listens for prospect replies via
asynchronous webhooks from the dispatch provider(s) (Instantly and/or
Unipile) and automatically marks a prospect "replied" — and halts its
follow-up cadence — the moment a reply arrives, with no operator
inbox-checking or manual data entry for either dispatch or reply
detection. "Call booked" and "closed" happen outside the dispatch provider
(a phone call, a signed deal) and remain a quick manual action per
prospect; a manual "replied" override also remains available as a fallback
if the webhook integration is ever delayed or unavailable.

**Why this priority**: Every downstream capability (cadence tracking, the
100-20-4-1 dashboard) depends on knowing, per prospect, what has actually
happened. Manual-only reply recording is both a missed-detection risk (the
operator forgets to check/log a reply) and a cadence-timing risk (a Bump or
Takeaway message can fire after a reply already arrived but wasn't yet
logged) — automated webhook detection removes both risks at the source and
is the minimum viable, trustworthy feedback loop this system needs.

**Independent Test**: Can be fully tested by (a) marking a prospect "sent,"
(b) delivering a simulated dispatch-provider webhook reply event for that
prospect's tracked thread, and confirming the prospect's status
autonomously updates to "replied" and its cadence halts with zero operator
action; then separately recording "call booked" and "closed" as manual
actions and confirming both are reflected and retained.

**Acceptance Scenarios**:

1. **Given** the operator approves a package (the Tier-3 gate), **When**
   the system subsequently, automatically dispatches it through the
   configured outreach provider — as its own distinct, independently
   tracked step, never bundled into the approval itself (FR-025) —
   **Then** the prospect's status reflects "sent" with the date and the
   provider's returned thread identifier recorded, and the system begins
   listening for a reply webhook tied to that thread — with no separate
   "mark as sent" action from the operator.
2. **Given** an approved package whose dispatch attempt fails, **When**
   the operator or the system's own automatic retry looks at it again,
   **Then** the attempt shows a distinct, visible "dispatch failed" state
   — not "approved" (implying nothing happened yet) and not "sent"
   (implying delivery already succeeded) — and remains retryable, with the
   approval itself untouched and never needing to be redone (FR-027/FR-028).
3. **Given** a prospect marked "sent," **When** the dispatch provider's
   webhook reports a reply on that prospect's thread, **Then** the system
   autonomously updates the prospect's status to "replied" and immediately
   halts further follow-up cadence for that prospect — with no operator
   data entry required.
4. **Given** a prospect who has replied, **When** the operator records a call
   booked or a close, **Then** the prospect's status reflects that outcome and
   it is counted accordingly in reporting.
5. **Given** a webhook reply event arrives for a prospect whose cadence has
   already been exhausted (marked "Unresponsive"), **When** the system
   processes it, **Then** the reply is still accepted and the prospect's
   status updates to "replied" — a late reply, webhook-detected or manual,
   is never rejected.
6. **Given** the dispatch provider delivers the same reply webhook event more
   than once (a provider-side retry), **When** the system processes the
   duplicate, **Then** the prospect's recorded status is unaffected by the
   repeat — the second delivery is a no-op, not a duplicate state change or
   an error surfaced to the operator.
7. **Given** the dispatch provider's webhook is delayed, fails to fire, or
   the integration is temporarily unavailable, **When** the operator knows
   independently that a prospect replied, **Then** the operator can still
   manually record "replied" as a fallback, without needing to diagnose or
   wait out the provider issue.

---

### User Story 3 - Track the 4-Day Follow-Up Cadence (Priority: P2)

For every prospect who has been sent a package but has not yet replied, the
operator can see exactly which follow-up action is due "today" — Day 1
Initial, Day 2 Bump, Day 3 Video Demo, or Day 4 Takeaway — without having to
manually recalculate days elapsed since the first send.

**Why this priority**: The relentless, exact cadence is the mechanism that
turns a one-shot message into the "Rule of 100" system described in the
playbook. It depends on Story 2's outcome recording (a reply stops the
cadence) but delivers distinct, independently verifiable value: knowing who
to follow up with today, and how.

**Independent Test**: Can be fully tested by advancing a "sent" prospect
through simulated days 1–4 without recording a reply, and confirming the
system surfaces the correct cadence step (Initial → Bump → Video Demo →
Takeaway) on each corresponding day, and stops surfacing further steps once
Day 4 has passed or a reply is recorded.

**Acceptance Scenarios**:

1. **Given** a prospect marked "sent" today, **When** the operator views due
   follow-ups, **Then** that prospect does not yet require a follow-up action
   (Day 1 was the initial send itself).
2. **Given** a prospect sent 1 full day ago with no reply, **When** the
   operator views due follow-ups, **Then** the prospect appears with "Day 2:
   Bump" as the due action.
3. **Given** a prospect sent 2 full days ago with no reply, **When** the
   operator views due follow-ups, **Then** the prospect appears with "Day 3:
   Video Demo" as the due action.
4. **Given** a prospect sent 3 full days ago with no reply, **When** the
   operator views due follow-ups, **Then** the prospect appears with "Day 4:
   Takeaway" as the due action.
5. **Given** a prospect sent more than 3 full days ago with no reply, **When**
   the operator views due follow-ups, **Then** the prospect is marked
   "Unresponsive," no further follow-up action is suggested, and the
   prospect record (scraped content, BFV link, script, cadence history) is
   retained rather than discarded.
6. **Given** a prospect replies at any point in the cadence, **When** the
   operator views due follow-ups, **Then** that prospect no longer appears in
   the follow-up list.
7. **Given** a prospect marked "Unresponsive" 3 to 6 months ago, **When** a
   new daily batch is generated, **Then** that prospect becomes eligible for
   inclusion again as a fresh outreach attempt (new BFV deliverable and
   script), distinct from the never-contacted prospects also in that batch.
8. **Given** a prospect marked "Unresponsive" less than 3 months ago, **When**
   a new daily batch is generated, **Then** that prospect is excluded, the
   same as any other previously-contacted prospect.

---

### User Story 4 - View the 100-20-4-1 Conversion Dashboard (Priority: P3)

The operator opens a dashboard and sees, for any selected time period, how
many prospects were sent packages, how many replied, how many turned into
calls, and how many closed — mapped against the 100-20-4-1 target ratio, so
they can immediately see where the pipeline is over- or under-performing.

**Why this priority**: This is the measurement layer on top of Stories 1–3.
It provides real business value (visibility into whether the playbook is
converting as designed) but is not required for the operator to actually run
outreach and cadence day-to-day — hence P3.

**Independent Test**: Can be fully tested by recording a known set of sent /
replied / call / close outcomes (via Story 2) and confirming the dashboard's
counts and ratios match those recorded outcomes exactly for the selected
period.

**Acceptance Scenarios**:

1. **Given** a day where 100 prospects were sent packages, 20 replied, 4 had
   calls booked, and 1 closed, **When** the operator views that day on the
   dashboard, **Then** all four numbers are displayed alongside the
   100-20-4-1 reference ratio for comparison.
2. **Given** actual results differ from the 100-20-4-1 ratio (e.g., only 8
   replies instead of 20), **When** the operator views the dashboard,
   **Then** the shortfall relative to the reference ratio is visibly evident.
3. **Given** multiple days of activity, **When** the operator selects a
   cumulative view, **Then** totals across the selected period are shown in
   addition to any single-day view.

---

### Edge Cases

- What happens when a prospect's website returns no usable FAQ/site content
  to scrape? (See User Story 1, Scenario 3 — flagged incomplete, not silently
  faked.)
- What happens when the same business is sourced twice under a slightly
  different name or URL (e.g., `www.` vs bare domain, a redirect)? The
  duplicate check must be resilient to trivial URL variations, not just exact
  string matches.
- What happens when a prospect replies after their cadence has already been
  marked exhausted (Day 4 passed)? The system should still accept and record
  the late reply rather than reject it.
- What happens when the operator has not recorded any outcome for a prospect
  for several days (neither sent, replied, nor any other status)? The
  follow-up view should distinguish "not yet sent" from "sent, awaiting
  cadence" so stale, un-actioned prospects are visible rather than silently
  dropped.
- What happens when fewer than 100 qualifying new prospects exist on a given
  day across all available sourcing? (See User Story 1, Scenario 4 —
  deliver what's available, report the shortfall.)
- What happens if the operator records an outcome out of logical order (e.g.,
  "closed" before "sent")? The system should accept the latest recorded
  outcome as authoritative rather than blocking the operator.
- What happens when a prospect completes the 4-day cadence with no reply?
  It is marked "Unresponsive" and retained (not deleted), and automatically
  becomes eligible for a fresh outreach attempt 3–6 months later (see User
  Story 3, Scenarios 5, 7, 8).
- What happens if an "Unresponsive" prospect replies on their own (unprompted)
  before their 3–6 month re-engagement window arrives? The system should
  accept the reply and treat it like any other reply — it must not require
  the re-engagement window to elapse first.
- What happens if the operator or an automated flow tries to access a BFV
  deliverable through anything other than the direct link (e.g., requires a
  call booking or form first)? That would violate the zero-friction delivery
  standard — the BFV must be reachable by the link alone.
- What happens if a reply webhook cannot be verified as genuinely from the
  dispatch provider (bad/missing signature)? It must be discarded/quarantined,
  not trusted and acted on (see FR-023).
- What happens if a reply webhook arrives for a thread the system cannot
  match to any known prospect/attempt? It must be logged and flagged for
  operator attention, not silently dropped and not causing an error that
  blocks processing of other webhook events.
- What happens if the dispatch provider delivers the same reply event twice
  (its own retry behavior)? The second delivery must be a no-op — see
  Acceptance Scenario 5 under User Story 2.
- What happens if an approved package's dispatch attempt fails (provider
  outage, network error, timeout)? The approval itself is unaffected and
  is never undone or repeated — only the delivery step is marked failed,
  visibly, and retried (automatically with backoff, and by the operator at
  any time, without limit) until it succeeds (FR-027/FR-028, `CHK003`
  correction).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST produce a daily batch of up to 100 targeted
  prospects, each representing a distinct business that has not been included
  in any previous day's batch.
- **FR-002**: System MUST capture, for each prospect in a batch, a scraped
  snapshot of that prospect's public website/FAQ content sufficient to
  personalize a BFV deliverable and an outreach script.
- **FR-003**: System MUST flag any prospect whose site/FAQ content could not
  be successfully retrieved or was insufficient, rather than generating a
  BFV link or script from incomplete data.
- **FR-004**: System MUST generate one unique, working interactive BFV
  (Big Fast Value) demo link per successfully-scraped prospect, built from
  that prospect's own scraped content, so the receiving prospect can
  experience a relevant AI interaction tied to their own business.
- **FR-005**: System MUST generate one personalized outreach script per
  successfully-scraped prospect, following the Hook → Pain → BFV Link → Ask
  structure, written at approximately a 3rd-grade reading level.
- **FR-006**: System MUST present each day's complete prospect packages
  (scraped summary + BFV link + script) to the operator as ready-to-send,
  without requiring the operator to assemble any piece manually.
- **FR-007**: System MUST prevent the same prospect (business/website) from
  being included in more than one active daily batch, including when the
  prospect is re-sourced under a trivially different URL or name variant —
  **except** a prospect marked "Unresponsive" that has reached its scheduled
  re-engagement date (FR-019), which becomes eligible again per FR-020.
- **FR-008**: System MUST allow the operator to manually record, per
  prospect, one of the following outcome states: call booked, closed, and a
  manual "replied" override (used only as a fallback per FR-022). System
  MUST itself automatically assign: "sent" upon successful dispatch
  (FR-025), "replied" via verified reply-webhook detection (FR-021/FR-022),
  and "Unresponsive" per FR-018 — in normal operation, none of "sent",
  "replied", or "Unresponsive" requires operator data entry; the operator's
  only manual action in the outcome lifecycle is approval (the Tier-3 gate)
  plus, optionally, "call booked"/"closed" once a reply has happened.
- **FR-009**: System MUST track, for every prospect marked "sent" and not yet
  "replied," the number of full 24-hour periods elapsed since the send date,
  consistent with the 24-hour-per-step cadence trigger.
- **FR-010**: System MUST surface, for every prospect awaiting follow-up, the
  correct next cadence action per this fixed schedule: Day 1 = Initial (the
  original send, no further action due), Day 2 = Bump, Day 3 = Video Demo,
  Day 4 = Takeaway.
- **FR-011**: System MUST stop surfacing further follow-up actions for a
  prospect once that prospect is marked "replied," regardless of which
  cadence day the reply occurs on.
- **FR-012**: System MUST mark a prospect's cadence as complete/exhausted once
  4 full days have elapsed since the send date with no recorded reply, and
  MUST still accept a reply recorded after that point.
- **FR-013**: System MUST provide a dashboard showing, for a selected time
  period, the count of prospects sent, replied, calls booked, and closed, and
  MUST display the 100-20-4-1 reference ratio alongside the actual counts for
  comparison.
- **FR-014**: System MUST support viewing dashboard totals both for a single
  day and cumulatively across a selected range of days.
- **FR-015**: System MUST NOT alter, remove, or degrade any existing
  AITransforms website page, route, or content as a result of adding this
  feature.
- **FR-016**: System MUST make each BFV deliverable accessible via the
  generated link alone — no call booking, meeting scheduling, or form
  submission may be required for the prospect to experience it
  ("zero-friction delivery").
- **FR-017**: System MUST ensure each BFV deliverable is a functioning
  interactive experience built from that specific prospect's own scraped
  content, not a static file, generic template, or promotional teaser —
  it must meet a "give away something they'd normally pay for" standard,
  not a lead-magnet standard.
- **FR-018**: System MUST transition a prospect to an "Unresponsive" outcome
  state automatically when its cadence reaches exhausted (FR-012) with no
  recorded reply — the prospect record MUST be retained, not deleted.
- **FR-019**: System MUST schedule every prospect marked "Unresponsive" for
  re-engagement eligibility no sooner than 3 months and no later than 6
  months after the "Unresponsive" transition date.
- **FR-020**: System MUST exclude "Unresponsive" prospects from new daily
  batches (FR-001/FR-007) until their scheduled re-engagement date arrives,
  at which point they become eligible for inclusion as a fresh outreach
  attempt with a newly generated BFV deliverable and script.
- **FR-021**: System MUST integrate with the operator's outreach dispatch
  provider(s) (Instantly and/or Unipile) via asynchronous inbound webhooks
  to detect prospect replies, without requiring the operator to manually
  check an inbox or record the reply.
- **FR-022**: System MUST, upon receiving a verified reply-webhook event tied
  to a prospect's dispatch thread, autonomously transition that prospect's
  outcome status to "replied" and immediately halt any further follow-up
  cadence action for that prospect, with no operator confirmation step
  required for this transition. System MUST also allow the operator to
  manually record "replied" as a fallback when the webhook integration is
  delayed or unavailable (see Edge Cases).
- **FR-023**: System MUST verify the authenticity of inbound reply-webhook
  events (e.g., provider signature/secret validation) before acting on them,
  and MUST discard or quarantine unverifiable events rather than trusting
  them by default.
- **FR-024**: System MUST process a duplicate delivery of the same
  reply-webhook event idempotently — reprocessing MUST NOT change state or
  produce a second recorded reply.
- **FR-025**: System MUST treat operator approval (the Tier-3 gate) and
  message delivery as two separate, independently-tracked steps — approval
  MUST NOT be conditioned on, blocked by, or bundled with the outcome of a
  delivery attempt. Approving a package MUST always succeed or fail purely
  on the Tier-3 precondition (was it in the review queue), never on
  whether a subsequent send happens to work (`plan-eng-review`/`CHK003`
  correction — see spec.md history: an earlier revision incorrectly
  bundled these into one action).
- **FR-026**: System MUST include every re-engagement-eligible
  "Unresponsive" prospect (FR-019/FR-020) in daily batch generation
  automatically, in addition to the operator-supplied prospect list —
  re-engagement MUST NOT depend on the operator manually resupplying a
  previously-contacted prospect's URL (`plan-eng-review` correction).
- **FR-027**: System MUST, once a package is approved, automatically and
  repeatedly attempt to dispatch it through the configured outreach
  provider — with no manual operator "send" action required or accepted —
  until dispatch succeeds or the operator explicitly intervenes; a
  successful dispatch captures the provider's returned thread/message
  identifier and transitions the attempt to "sent" (`CHK003` correction).
- **FR-028**: System MUST NEVER leave an approved package in a state with
  no path forward after a failed dispatch attempt. A failed dispatch MUST:
  (a) be recorded as an explicit, visible "dispatch failed" state, distinct
  from both "approved" (not yet attempted) and "sent" (delivered); (b) be
  retried automatically, with backoff, up to a bounded number of automatic
  attempts; and (c) remain retryable by an explicit operator action at any
  time thereafter, with no cap on manual retries — a dispatch failure is
  always recoverable, never a dead end (`CHK003` correction).

The following requirements were added by **Amendment 1 — Send-Readiness
Quality Gates (2026-07-16)**, after the operator rejected 5/5 packages in
the first real generated batch (see the Amendment 1 section below and
`resources/golden-reject-set-2026-07-16.md`):

- **FR-029 (deliverable integrity — gate G3)**: A generated message MUST
  NOT assert the existence of any asset (video, bot, demo, document) that
  does not exist and work at the time the package is created. A
  substitutable marker (`{{BFV_LINK}}`) is permitted in stored message
  text, but a message whose text claims "I made you a video" (or
  equivalent) while the package's video field is a placeholder is a
  quality-gate FAIL, deterministically detectable with no LLM call. No
  message MAY reach "sent" with an unresolved substitution marker or an
  unverified BFV link.
- **FR-030 (self-consistency — gate G4)**: A generated message MUST
  contain exactly one ask and MUST NOT contradict itself (e.g. asking
  permission to show something and simultaneously asserting it has already
  been made). Any fixed call-to-action text MUST be part of the single
  generation contract for the message — a CTA MUST NOT be appended to the
  model's output after generation without a consistency check, since blind
  appending is what produced defect D3 in all three affected rejects.
- **FR-031 (evidence grounding — gate G2)**: Every prospect-specific
  factual claim in a generated message MUST be traceable to the prospect's
  scraped evidence. Speculative framing about the prospect ("I bet…",
  "your team must spend…", "likely", "probably", "I'm sure") is a
  quality-gate FAIL: the mechanical layer MUST deny-list speculation
  markers, and the LLM-judge layer MUST verify claim-by-claim support
  (each prospect-referencing claim marked supported/unsupported against
  the scraped facts; any unsupported claim fails with that claim quoted in
  the revision feedback).
- **FR-032 (golden-example calibration — gate G5)**: The generation prompt
  MUST include positive exemplars of the required standard (at minimum the
  Day 1 template from `resources/follow-up-cadence-scripts.md`, plus
  operator-approved messages as they accumulate) and negative exemplars
  drawn from the golden reject set with their rejection reasons. The
  combined quality gates MUST fail every message in
  `resources/golden-reject-set-2026-07-16.md` — that set is the permanent
  regression floor for gate strictness.
- **FR-033 (single quality path — gate G6)**: Every message on ANY path to
  the operator — the batch orchestrator AND the first-100 operator
  workflow (`scripts/first-100.ts`) or any successor — MUST pass the full
  quality-gate stack (mechanical checks + LLM judge + bounded revision
  loop) before it is presented as reviewable. A message that exhausts
  revisions MUST surface as `needs_manual_draft` — never as a send-shaped
  message. A prospect flagged for missing/insufficient data
  (`needs_research`, FR-003) MUST NOT receive a generated message body at
  all: it surfaces as a research stub only (strengthens FR-003, which
  flagged but did not stop generation — defect D6).
- **FR-034 (prospect viability — gate G1)**: Before any message
  generation, each prospect MUST pass a viability check: is this a real
  business that could plausibly buy the offered service? Verdicts:
  `viable`, `not_viable` (with reason, no generation occurs, no LLM spend
  on packaging), or `needs_human`. Sourcing remains out of scope;
  filtering the supplied list is not (the prior Assumption that the input
  list is inherently viable is withdrawn — defect D4, example.com was
  confidently packaged).

### Key Entities

- **Prospect**: A distinct targeted business/lead considered for outreach.
  Key attributes: identifying business info, source website URL, date first
  processed, current outcome status (not-yet-sent / sent / replied / call
  booked / closed / unresponsive), send date (once sent), attempt number
  (increments if the prospect re-enters after an Unresponsive re-engagement
  window — see Follow-Up Cadence State).
- **Scraped Site Snapshot**: The captured website/FAQ content for a single
  prospect at the time of processing, used as the input for generating that
  prospect's BFV deliverable and outreach script. Related 1:1 to a Prospect
  per outreach attempt (a re-engaged prospect gets a fresh snapshot).
- **BFV Deliverable**: The unique, interactive demo experience (delivered as
  a link) generated for one specific prospect from their Scraped Site
  Snapshot. Related 1:1 to a Prospect per outreach attempt.
- **Outreach Script**: The personalized Hook → Pain → BFV Link → Ask message
  text generated for one specific prospect. Related 1:1 to a Prospect per
  outreach attempt.
- **Follow-Up Cadence State**: The tracked progress of a Prospect through the
  4-day follow-up sequence (send date, 24-hour periods elapsed, current due
  step, exhausted flag). Related 1:1 to a Prospect, active only between
  "sent" and either "replied" or "unresponsive." Upon reaching
  "unresponsive," carries the scheduled re-engagement date (3–6 months out)
  that governs FR-020.
- **Conversion Snapshot**: An aggregated count, for a given day or range of
  days, of prospects at each outcome stage (sent / replied / call booked /
  closed), used to populate the 100-20-4-1 dashboard.
- **Reply Webhook Event**: A single inbound notification received from a
  dispatch provider (Instantly/Unipile), carrying the provider's own event
  identifier (for duplicate-delivery detection per FR-024) and enough
  information to correlate it to one Prospect's dispatch thread. Retained
  even when it cannot be matched to a known prospect, so an unmatched event
  is auditable rather than silently lost.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On any given operating day, the operator receives a batch
  containing zero prospects that duplicate any prospect from a previous
  day's batch — except prospects legitimately re-entering under the
  Unresponsive 3–6 month re-engagement rule (FR-019/FR-020).
- **SC-002**: At least 95% of prospects in a daily batch arrive with both a
  working BFV demo link and a complete outreach script ready to send, with
  no manual assembly required by the operator (the remaining share accounted
  for by prospects correctly flagged as incomplete due to unscrapable sites).
- **SC-003**: For any prospect that has been sent and has not replied, the
  operator can correctly identify the due follow-up action (Bump / Video
  Demo / Takeaway / none-due-yet / exhausted) with 100% accuracy against the
  4-day cadence rule, on every day of the cadence.
- **SC-004**: The 100-20-4-1 dashboard reflects a newly recorded outcome
  (sent/replied/call/close) in the operator's view within the same operating
  session — no separate manual recalculation or export step is needed.
- **SC-005**: All pre-existing AITransforms site routes and functionality
  continue to pass the project's existing verification checks
  (lint/typecheck/tests/build) unchanged after this feature is added.
- **SC-006**: A prospect's status transitions to "replied" and its
  follow-up cadence halts within 5 minutes of the dispatch provider
  delivering the corresponding reply-webhook event, with zero manual
  operator action.
- **SC-007**: Given a dispatch failure after approval, the operator can
  always (a) see that it failed — never a silent stall indistinguishable
  from "still processing" — and (b) successfully retry it, whether via the
  system's own automatic bounded retry or an explicit manual retry action,
  with the attempt reaching "sent" once the underlying issue clears. In
  100% of cases, no approved package is ever left with zero path to
  "sent" — approval is never revoked or repeated to recover from a
  delivery failure (`CHK003` correction).

Added by Amendment 1 (2026-07-16):

- **SC-008 (approval rate — the north-star quality metric)**: Over a
  rolling window of 20 operator-reviewed packages, **at least 60% are
  approved without edits**. Baseline measured 2026-07-15: **0%** (5/5
  rejected). SC-002's completeness measure is explicitly NOT a quality
  measure — all 5 rejected packages counted as SC-002 successes; SC-008
  is the criterion that would have caught this failure.
- **SC-009 (golden-set regression floor)**: The combined quality gates
  fail **all 5** messages in `resources/golden-reject-set-2026-07-16.md`,
  verified by fixture tests. Any gate change that lets one pass is a
  regression, regardless of other improvements.
- **SC-010 (no false deliverable claims reach review)**: Zero packages
  presented for operator review contain a claim about a nonexistent asset
  (FR-029) or an unresolved substitution marker presented as final text —
  measured as: the deterministic deliverable-integrity check runs on 100%
  of packages entering the review queue, with no bypass path.

## Assumptions

- **Prospect sourcing**: The system consumes a daily list of targeted
  prospects (business name + website URL) from an existing or
  operator-supplied source; discovering/enrolling entirely new lead sources
  or lead-generation logic beyond ingesting a daily list is out of scope for
  this feature. *(Amended 2026-07-16: the implicit corollary that the
  supplied list is inherently viable is withdrawn — the first real batch
  contained a non-business (example.com) that was confidently packaged.
  Sourcing stays out of scope; viability filtering of the supplied list is
  in scope per FR-034.)*
- **Sending is automatic and system-triggered, but architecturally
  separate from approval**: The system prepares ready-to-send packages
  (script + BFV link); once the operator approves a package (the Tier-3
  human-approval gate, FR-025), the system automatically dispatches it
  through the operator's configured provider (Instantly and/or Unipile,
  FR-027) — as its own tracked step, not a side effect of the approve
  action — and the provider's returned thread identifier is what makes
  automated reply-webhook correlation (FR-021/FR-022) possible. The system
  does not decide *whether* to send and never dispatches without prior
  approval; the human approval gate remains the only trigger for *whether*
  a send is allowed to happen at all, but *whether it succeeded* is a
  separate, retryable question that never reopens or repeats the approval
  itself (FR-028, `CHK003` correction).
- **Reply detection is automated via provider webhook; call/close outcomes
  remain manual**: The system autonomously detects and records a "replied"
  outcome the moment the dispatch provider's webhook reports one — no
  operator inbox-checking or data entry required in normal operation.
  "Call booked" and "closed" outcomes happen outside the dispatch provider
  entirely (a phone call, a signed deal) and remain operator-recorded, as
  does a manual "replied" override available specifically as a fallback if
  the webhook integration is delayed or unavailable.
- **Webhook latency target**: SC-006's 5-minute bound is this spec's
  concrete default for "immediately halt," since no exact figure was
  specified — revisit if the chosen provider's webhook delivery SLA differs
  materially.
- **BFV deliverable mechanism**: "A unique, interactive custom Telegram Bot
  link for each prospect" is delivered as a distinct, prospect-specific
  interactive link/session (not a separately hosted bot per prospect); each
  link presents an interactive demo personalized from that prospect's
  scraped content.
- **Duplicate window**: Deduplication applies against the full history of
  every prospect ever processed by the system and is permanent, with exactly
  one defined exception: a prospect marked "Unresponsive" becomes eligible
  again once its scheduled 3–6 month re-engagement date arrives (FR-019/
  FR-020). There is no other rolling window or manual override.
- **Scale**: Up to 100 new prospects per operating day is the target volume;
  the system is not required to support materially higher daily volume.
- **Single operator**: This feature serves one founder/operator user; multi-
  user roles, permissions, or team collaboration are out of scope.
- **Script templates are illustrative, not literal**: The wording in
  `resources/follow-up-cadence-scripts.md` demonstrates the required
  Hook → Pain → BFV Link → Ask structure, 3rd-grade reading level, and tone
  per cadence step — generated scripts must match that standard but are not
  required to reuse the exact template sentences verbatim for every prospect.
- **24-hour cadence assumes on-schedule execution**: FR-009/FR-010 assume
  each cadence step is actually triggered at its intended time; behavior
  when a step itself fails to fire (distinct from the prospect not replying)
  is not specified here and would need its own handling if it becomes a
  real occurrence.
