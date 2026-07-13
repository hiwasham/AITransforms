# Contract: Dispatch Provider Reply Webhook

Inbound contract for automated reply detection (spec.md FR-021–FR-024,
SC-006). This is the third API boundary named in `plan.md` — authenticated
by provider signature, not the operator session credential or the
`AutomationRunner` service credential, since the provider holds neither.

## Endpoint

`POST /webhooks/:provider` where `:provider` is `instantly` or `unipile`.
Each provider's payload shape differs at the wire level (out of this
plan's control — it's the provider's API); this contract specifies what the
Core Engine extracts and guarantees internally, not the provider's own
schema.

## Required signature verification (FR-023)

Every request MUST carry the provider's signing header (e.g. an HMAC over
the raw body using a shared webhook secret — exact header name/algorithm is
provider-specific and resolved at implementation time). The handler:

1. Computes the expected signature from the raw request body + the
   configured per-provider secret.
2. Rejects (fail-closed — `401`, no processing, no state change) if the
   signature is missing, malformed, or does not match.
3. Only on a verified match does it proceed to extraction and matching.

A rejected request is still logged (`WebhookEvent` with
`signature_verified: false` is **not** created for garbage that fails to
parse at all, but a structured log entry records the rejection for
observability — see `plan.md` Observability).

## Extraction (provider-specific payload → this normalized shape)

```
{
  providerEventId: string,     // provider's own event/message identifier
  threadId: string,            // correlates to OutreachAttempt.provider_thread_id
  occurredAt: timestamp,
  eventType: "reply"           // V1 only handles reply events; other event
}                                // types the provider may send are accepted
                                 // (200 OK) but ignored/logged, not treated
                                 // as errors
```

## Processing contract

1. **Idempotency check first**: look up `(provider, providerEventId)`
   against existing `WebhookEvent` rows. If found, return `200 OK`
   immediately — no second `Prospect`/`OutreachAttempt` state change
   (FR-024). This check happens before any business-logic side effect.
2. **Matching**: resolve `threadId` → `OutreachAttempt.provider_thread_id`.
   - No match: record the `WebhookEvent` with
     `matched_outreach_attempt_id: null`, log for operator attention,
     return `200 OK` (the provider should not retry a request the Core
     Engine successfully received but couldn't map — an unmatched thread is
     this system's problem to investigate, not the provider's to retry).
   - Match found: proceed to step 3.
3. **Outcome-regression guard, then state transition**: apply the
   transition **only if** the matched `Prospect.current_outcome_status` is
   currently `sent` or `unresponsive` (already `replied` is a harmless
   no-op). When applicable: transition `current_outcome_status` to
   `replied` and mark the corresponding `FollowUpCadenceState` inactive
   (halts further cadence surfacing per FR-022). Record the `WebhookEvent`
   with `matched_outreach_attempt_id` set, `signature_verified: true`, and
   `resulted_in_transition: true`.
   - **If the prospect has already advanced to `call_booked` or
     `closed`**: the reply is real and MUST be retained, but MUST NOT move
     the prospect backward in the funnel. Record the `WebhookEvent`
     identically except `resulted_in_transition: false`, log it as
     superseded (see `plan.md` Observability), and do not touch
     `current_outcome_status`. This is not an error — respond `200 OK` the
     same as the applied case.
4. **Response**: `200 OK` with `{ processed: boolean, deduplicated:
   boolean, matched: boolean, applied: boolean }` — `applied` mirrors
   `WebhookEvent.resulted_in_transition` (`false` for the superseded case
   above); deliberately low-detail otherwise (no prospect PII) since the
   provider is the caller, not the operator.

## Timing guarantee (SC-006)

Steps 1–3 run synchronously within the webhook request/response cycle (see
`plan.md` Background Jobs — this is explicitly *not* queued behind the
daily batch/cadence cron jobs), so the 5-minute detection-and-halt bound is
a function of provider webhook delivery latency alone, not this system's
processing time.

## What this contract explicitly does not cover

Provider-side webhook registration/setup (API calls to Instantly/Unipile to
*create* the webhook subscription) is an implementation/task-planning
concern, not a design-level contract — it's a one-time setup step, not a
runtime interface this system exposes.
