# Quickstart: Validating the Rule of 100 Outreach Engine Design

This is a validation guide for the design in `plan.md`/`data-model.md`/
`contracts/`, not an implementation guide — no code is included. Once
`/speckit-tasks` and implementation produce a working `outreach-engine/`
service, these are the scenarios that prove the design holds end-to-end,
traced back to the spec's own Independent Test criteria (User Stories 1–4).

## Prerequisites

- `outreach-engine/` service running locally against a local PGLite data
  file, with the `AutomationRunner` set to its plain-cron/manual-trigger
  implementation (not OpenClaw) for local validation — isolates the Core
  Engine's own correctness from the OpenClaw gateway's operational state.
- `DispatchClient` set to its mock implementation (not real Instantly/Unipile
  credentials) — Scenarios 1–7, 9 need no live provider account; only the
  Operational Integration end-to-end validation procedure (`tasks.md` T086)
  uses real providers.
- A small fixture set of 3–5 test "prospects" (business name + a URL that
  resolves to a real or locally-served fixture page), including at least
  one URL that deliberately 404s or has no FAQ-like content (to exercise
  FR-003's incomplete-flagging).
- Operator credential provisioned for dashboard/API access (§8 of
  `research.md`).

## Scenario 1 — Daily batch generation produces complete packages (User Story 1)

1. Call `POST /batches/generate` with the fixture prospect list.
2. Call `GET /batches/:date` for today.
3. **Expect**: `deliveredCount` matches the number of fixture prospects whose
   URL was scrapable; the one deliberately-broken URL's attempt is in a
   `needs_attention`/incomplete state, not silently missing or holding a
   blank BFV link/script; `shortfallReported: true` since the fixture set is
   well under 100.
4. Call `GET /prospects/:id` for one successfully-processed prospect.
   **Expect**: non-null `bfv.telegramDeepLinkToken`, `bfv.verificationStatus
   === "verified"` (a server-side readiness check — bot healthy, token
   resolves, test LLM prompt succeeds; not a live Telegram click-through,
   per `data-model.md`'s BFVDeliverable), and a `script.bodyText` with a
   `pass`-verdict `LintReport`.

## Scenario 2 — Duplicate exclusion (User Story 1, Scenario 2; FR-007)

1. Re-submit the same fixture prospect list to `POST /batches/generate` a
   second day.
2. **Expect**: `deduped` count in the response matches the prior day's
   already-processed prospects; `GET /prospects` shows no second
   `OutreachAttempt` created for any of them.
3. Repeat with a trivially-varied URL for one already-processed prospect
   (e.g. add `www.` or a trailing slash). **Expect**: still deduped, not
   treated as new.

## Scenario 3 — Anti-Values Linter blocks and routes for revision (contract: `anti-values-linter.md`)

1. Manually construct (via a test-only seed, not the normal pipeline) an
   `OutreachScript` revision containing jargon (e.g. "let's leverage
   synergy") and confirm the linter's `verdict` is `fail`, with non-empty
   `revisionFeedback` naming the jargon terms.
2. **Expect**: the owning `OutreachAttempt`'s `workflow_state` is
   `revision_requested`, and it does **not** appear in
   `GET /prospects?workflowState=human_review_queue` — proving a failed
   script structurally cannot reach the human queue.

## Scenario 4 — Approval is a pure gate, dispatch is separate (Tier 3 staging queue; correction #16, `CHK003` fix)

1. Take an attempt in `human_review_queue`. Confirm `"sent"` is not even a
   valid request value for `POST /prospects/:id/outcome` (`400`/validation
   error) — proving sending cannot bypass approval structurally, not just
   by convention.
2. Call `POST /prospects/:id/approve`. **Expect**: `200` with **exactly**
   `{ workflowState: "approved", approvedAt }` — no `providerThreadId`, no
   `dispatchedAt`, no dispatch of any kind has happened yet. This is the
   entire Tier-3 gate; it never touches `DispatchClient`.
3. With the `DispatchClient` set to its mock implementation (no live
   provider credentials needed for this scenario, correction #14), call
   `POST /internal/dispatch/process`. **Expect**: `200` with
   `sent: 1` (or more, if other approved attempts exist); `GET
   /prospects/:id` now shows `workflowState: "sent"`, a non-null
   `providerThreadId`, and a `FollowUpCadenceState` row with `send_date` =
   today — the approval from step 2 is untouched (`approvedAt` unchanged).

## Scenario 4a — Dispatch failure is always visible and always recoverable (`CHK003` fix — spec.md SC-007)

1. Approve a second attempt (step 2 above). Configure the mock
   `DispatchClient` to return `{ status: "failed", reason: "simulated
   provider outage" }` for this attempt, then call
   `POST /internal/dispatch/process`. **Expect**: `200` with `failed: 1`;
   `GET /prospects/:id` shows `workflowState: "dispatch_failed"`,
   `dispatchAttempts: 1`, and `lastDispatchError: "simulated provider
   outage"` — visible, not a silent stall.
2. Call `POST /prospects/:id/approve` again on this same attempt.
   **Expect**: `409 Conflict` — proving there is no path back through
   approval to "fix" a stuck dispatch (the exact bug `CHK003` caught: the
   old design's only way to retry was through an endpoint that now
   structurally cannot help).
3. Call `POST /prospects/:id/retry-dispatch`, still with the mock
   configured to fail. Repeat past whatever the automatic-retry cap is.
   **Expect**: still `200`/available every time — no cap on manual
   retries.
4. Reconfigure the mock to succeed, then call
   `POST /prospects/:id/retry-dispatch` once more. **Expect**: `200` with
   `workflowState: "sent"`, `providerThreadId` set, `FollowUpCadenceState`
   created — the attempt reaches `sent` with the original approval from
   step 1 never having been redone.

## Scenario 5 — 4-day cadence surfaces the correct due step (User Story 3)

Using the attempt from Scenario 4, with its `send_date` adjustable in the
test environment (simulated clock, not real waiting):

1. `send_date = today`: `GET /prospects?dueToday=true` **excludes** this
   prospect (Day 1 is the initial send itself, no separate action due).
2. `send_date = 1 day ago`: due step is `Bump` (Day 2).
3. `send_date = 2 days ago`: due step is `Video Demo` (Day 3).
4. `send_date = 3 days ago`: due step is `Takeaway` (Day 4).
5. `send_date = 4+ days ago`: due step is `exhausted`; `Prospect.
   current_outcome_status` auto-transitions to `unresponsive`;
   `reengagement_eligible_date` is set (~4 months out per `data-model.md`'s
   default).
6. Record a reply (via `POST /prospects/:id/outcome` manual fallback, or
   via Scenario 8's simulated webhook) at any point in steps 2–5. **Expect**:
   the prospect no longer appears in `GET /prospects?dueToday=true`
   afterward, regardless of which day the reply landed on or which path
   recorded it.

## Scenario 6 — Re-engagement after Unresponsive, wired automatically (FR-019/FR-020/FR-026)

1. Using the `unresponsive` prospect from Scenario 5 step 5, set its
   `reengagement_eligible_date` to a past date (simulated clock).
2. Call `POST /batches/generate` with a fresh `prospectList` that does
   **NOT** contain this prospect's URL at all. **Expect**: the response's
   `reengaged` count is ≥1, and `GET /prospects/:id` for this prospect
   shows a new `OutreachAttempt` (`attempt_number` incremented,
   `workflow_state: "generated"`) with a freshly-generated
   `ScrapedSiteSnapshot`/`BFVDeliverable`/`OutreachScript` — proving the
   Batch Candidate Pool query pulls eligible prospects in on its own,
   without the operator resupplying the URL (correction #13; this is the
   fix for a real gap where the prior "sweep" design had no path connecting
   eligibility to actual batch inclusion).
3. Confirm the reset rule: `Prospect.current_outcome_status` is
   `not_yet_sent` for this prospect (not still `unresponsive`), while the
   *prior* attempt's `FollowUpCadenceState` and history remain fully
   intact and queryable by its own `attempt_id`.
4. Repeat with `reengagement_eligible_date` still in the future. **Expect**:
   excluded, same as any other already-processed prospect (FR-020).

## Scenario 7 — Dashboard math (User Story 4)

1. Record a known set of outcomes across several fixture prospects (e.g. 5
   sent, 2 replied, 1 call_booked) on a known date.
2. `GET /dashboard?range=<that date>`. **Expect**: `sent: 5, replied: 2,
   callBooked: 1, closed: 0`, alongside the static `referenceRatio:
   {sent:100, replied:20, calls:4, closed:1}` for visual comparison.
3. Repeat outcomes across two dates and request a cumulative range.
   **Expect**: `byDay` breaks out each date and the top-level counts sum
   across both.

## Scenario 8 — Automated reply detection via dispatch webhook (User Story 2; FR-021–FR-024, SC-006)

Using an attempt in `sent`/`response_tracking` (from Scenario 4), with a
`provider_thread_id` recorded at send time:

1. Deliver a simulated valid, correctly-signed `POST /webhooks/instantly`
   reply event referencing that `provider_thread_id`. **Expect**: `200 OK`;
   the prospect's status autonomously updates to `replied` with no call to
   `POST /prospects/:id/outcome`; the response's recorded transition shows
   a non-operator source (webhook-driven), distinct from the manual path
   exercised in Scenario 4/6.
2. Re-deliver the **identical** event (same `providerEventId`). **Expect**:
   `200 OK`, `deduplicated: true`, and no second state change — the
   prospect's `replied` timestamp/state is unaffected by the repeat.
3. Deliver a webhook with a missing/invalid signature. **Expect**: `401`,
   no state change, no `WebhookEvent` row with `matched_outreach_attempt_id`
   set — verification failure is fail-closed.
4. Deliver a validly-signed webhook whose `threadId` matches no known
   `OutreachAttempt`. **Expect**: `200 OK`, `matched: false`, a
   `WebhookEvent` row recorded with `matched_outreach_attempt_id: null` for
   later operator review — not silently dropped, not an error response to
   the provider.
5. Deliver a valid reply webhook for a prospect already `unresponsive`
   (past its 4-day cadence). **Expect**: accepted, status updates to
   `replied` — a late webhook-detected reply is treated the same as a late
   manual one (Scenario 5 step 5 / spec.md Edge Cases).
6. Manually record `{ outcome: "call_booked" }` for the replied prospect
   (via `POST /prospects/:id/outcome`), then deliver a **second**, genuinely
   distinct valid reply webhook (a different `providerEventId`) for the same
   thread. **Expect**: `200 OK`, `applied: false`; the `WebhookEvent` is
   recorded with `resulted_in_transition: false`; `current_outcome_status`
   remains `call_booked` — the webhook never regresses a prospect that has
   already advanced past `replied` (correction #3, the outcome-regression
   guard).

## Scenario 9 — Batch resume after a mid-run partial failure (correction #10)

1. Trigger `POST /batches/generate` with a fixture list of 5+ prospects,
   simulating an LLM/scraper failure partway through (e.g. the 3rd
   prospect's script-generation call throws).
2. **Expect**: prospects 1–2 (or however many completed before the failure)
   reach `human_review_queue` or later normally; the failed prospect's
   `OutreachAttempt` is left at `generated`; remaining unprocessed
   prospects are also at `generated` or not yet created, depending on
   ingestion order.
3. Re-call `POST /batches/generate` for the **same date** with the same
   list. **Expect**: prospects already at `human_review_queue`+ (or any
   other terminal state) are untouched — re-running does not re-scrape,
   re-generate a BFV link, or regenerate a script for them. Only the
   attempt(s) still at `generated` are resumed, picking up from whichever
   of `ScrapedSiteSnapshot`/`BFVDeliverable`/`OutreachScript` already
   exists for that attempt, and the batch completes.
4. Confirm no attempt is ever silently duplicated (no two `OutreachAttempt`
   rows for the same `Prospect` in this batch) and nothing already in
   `human_review_queue` is reset to `generated`.

## Out of scope for this quickstart

Actual message sending, real Telegram delivery, and real website scraping
against live third-party sites are exercised against fixtures/mocks here —
end-to-end validation against real prospects is a manual operator
responsibility once the system is live, by design (the human-in-the-loop
gate this whole feature exists to enforce).
