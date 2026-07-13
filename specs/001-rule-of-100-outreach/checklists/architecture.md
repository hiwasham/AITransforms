# Architecture Readiness Checklist: Rule of 100 Outreach Engine

**Purpose**: Unit tests for the requirements themselves — validating that
spec.md/plan.md/data-model.md/contracts/tasks.md are complete, clear, and
consistent enough that implementation won't hit an ambiguity forcing
architectural rework mid-build. Not a test of code; no code exists yet.

**Created**: 2026-07-12

**Focus** (inferred from context, not asked interactively — see report):
dependency/assumption validation, cross-document consistency, and
recovery-path completeness for the auto-dispatch/re-engagement mechanisms
added during this session's corrections and `/plan-eng-review` pass. Depth:
release-gate rigor, matching the user's explicit "architectural rework"
framing. Audience: author/architect, pre-`/speckit-implement`.

**Scope note**: every item below tests a *written requirement*, not
behavior. Items are traceability-tagged to the section that should (or
currently doesn't) contain the answer.

## Dependencies & Assumptions

- [ ] CHK001 - Is the assumption that Instantly's and Unipile's send APIs both return a thread/message identifier *synchronously, in the send response itself* validated against each provider's actual API contract, or only assumed? [Assumption, research.md §10 — no external API contract was verified this session] The entire auto-dispatch design (`POST /prospects/:id/approve` capturing `provider_thread_id` "from the response") depends on this being true for both providers; if either provider only confirms a thread ID asynchronously via its own later webhook, the synchronous single-call design in contracts/outreach-api.md would need architectural rework to a two-phase flow.

## Requirement Completeness

- [x] CHK002 - Is there a dedicated contract file for the `DispatchClient` interface — mirroring the treatment given to `AutomationRunner` (`contracts/automation-runner-interface.md`), the Anti-Values Linter (`contracts/anti-values-linter.md`), and the reply webhook (`contracts/dispatch-webhook.md`) — specifying its error/timeout/retry semantics? [Gap, contracts/] **Resolved 2026-07-12**: `contracts/dispatch-client-interface.md` added, specifying `send()`'s return shape, the idempotency-key requirement, and exactly which two endpoints (`POST /internal/dispatch/process`, `POST /prospects/:id/retry-dispatch`) are allowed to call it.

## Scenario Coverage / Recovery Paths

- [x] CHK003 - Is a recovery path specified for an attempt whose `POST /prospects/:id/approve` call succeeded (transitioned `human_review_queue` → `approved`) but whose immediately-following dispatch call failed? [Gap, contracts/outreach-api.md `POST /prospects/:id/approve`] **Resolved 2026-07-12**: approval and dispatch are now two independent state transitions. `POST /prospects/:id/approve` only ever performs `human_review_queue`→`approved` and never calls `DispatchClient`. A failed dispatch lands at the new, explicit `dispatch_failed` state (with `dispatch_attempts`/`last_dispatch_error` recorded) and is recoverable via automatic bounded retry (`POST /internal/dispatch/process`) or an uncapped operator-triggered `POST /prospects/:id/retry-dispatch` — see `data-model.md`'s Dispatch Recovery Rule, spec.md FR-027/FR-028/SC-007, and `tasks.md` corrections #15–#17.
- [ ] CHK004 - Does `data-model.md`'s Batch Candidate Pool specify the resolution when a prospect appears in *both* the operator-supplied list and the re-engagement-eligible set within the same `POST /batches/generate` call (e.g. the operator's fresh list coincidentally includes a business that is also currently re-engagement-eligible)? [Coverage, Gap, data-model.md Batch Candidate Pool] `OutreachAttempt`'s own invariant ("exactly one `OutreachAttempt` per `Prospect` may be active at a time") implies this must be deduplicated across both sources before attempt creation, but the union formula as written doesn't state that explicitly.

## Requirement Consistency

- [ ] CHK005 - Does `tasks.md` give a concrete, buildable interface contract for what User Story 3's `T069` (Re-engagement Reset Rule) should look like as a stub during early User Story 1 work — the two stories have a genuine forward code reference (`T040` depends on `T069`) — or is this left as informal prose two different implementers could satisfy incompatibly? [Ambiguity, tasks.md Dependencies & Execution Order]

## Acceptance Criteria Quality / Measurability

- [ ] CHK006 - Is SC-002's "at least 95% of prospects in a daily batch arrive with both a working BFV demo link and a complete outreach script" scoped to a single calendar day only, a rolling window, or cumulative — and does any endpoint in `contracts/outreach-api.md` actually expose this computed percentage, or only the raw counts (`deliveredCount`/`targetCount`) an implementer would need to derive it themselves? [Measurability, spec.md SC-002] This gap was noted in an earlier review pass this session and was never closed.
