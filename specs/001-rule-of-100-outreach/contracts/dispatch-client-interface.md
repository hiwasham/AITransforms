# Contract: DispatchClient Interface

The pluggable-adapter contract for actually sending an approved package
through an outreach platform (Instantly or Unipile). Mirrors
`automation-runner-interface.md`'s pattern: the Core Engine only ever calls
through this interface, never against a provider-specific API directly,
and a mock/test-double implementation lets User Story 1 be built and
tested without live provider credentials.

This file did not exist when `DispatchClient` was first introduced
(`plan-eng-review` correction #14) — added now per `checklists/architecture.md`
CHK002, alongside the `CHK003` fix that made the interface's
failure/retry semantics load-bearing enough to need writing down
precisely.

## Capability

### `send(package, idempotencyKey) → DispatchResult`

- `package`: the approved `OutreachAttempt`'s dispatch payload — recipient
  contact info, the `OutreachScript.body_text`, and whatever provider-specific
  metadata is needed to actually deliver it.
- `idempotencyKey`: **always** the `OutreachAttempt.id`. Passed through to
  the underlying provider's send API so that a retry following an
  ambiguous failure (timeout, process crash mid-call) does not risk a
  duplicate real-world send to the prospect, *to the extent the provider
  honors idempotency keys on its send endpoint*. This is a stated
  assumption, not a verified guarantee — see Open Assumption below.
- Returns one of:
  - `{ status: "sent", providerThreadId: string }` — the provider
    confirmed delivery and returned a thread/message identifier.
  - `{ status: "failed", reason: string }` — the provider rejected the
    request or the call errored; `reason` becomes
    `OutreachAttempt.last_dispatch_error`.
  - Throws only for conditions the caller cannot meaningfully classify
    (e.g. a client-side bug) — implementations MUST NOT throw for ordinary
    provider-side failures (rate limits, invalid recipient, temporary
    outage); those are `{ status: "failed", reason }`, not exceptions, so
    the Core Engine's retry logic has one consistent failure shape to
    handle rather than a mix of return values and exceptions.

## What calls this interface

Per the Dispatch Recovery Rule (`data-model.md`), exactly two call sites,
both inside the core service, never the operator's session directly:

1. `POST /internal/dispatch/process` — the automatic, service-credential
   sweep that attempts every `approved`/`dispatch_failed` attempt below
   the automatic-retry cap.
2. `POST /prospects/:id/retry-dispatch` — the operator-triggered manual
   retry, uncapped.

`POST /prospects/:id/approve` **never** calls this interface — that is the
entire point of the `CHK003` fix: approval and dispatch are structurally
incapable of being coupled, because only these two endpoints hold a
reference to `DispatchClient` at all.

## Implementations

- **Mock/test-double** (Foundational, used by User Story 1's own tests):
  configurable to return `sent`, `failed`, or throw, so US1 can exercise
  the full `approved → dispatching → sent` and `approved → dispatching →
  dispatch_failed → retry → sent` paths without any live credentials.
- **Instantly client** (User Story 2): real send-through against the
  Instantly API.
- **Unipile client** (User Story 2): real send-through against the Unipile
  API.

## Open Assumption (flagged, not resolved here)

Whether Instantly's and Unipile's send APIs (a) return a thread/message
identifier synchronously in the send response, and (b) honor a
client-supplied idempotency key safely — is **assumed**, not verified
against either provider's actual documentation this session
(`checklists/architecture.md` CHK001). If either assumption is false for a
given provider, that provider's `DispatchClient` implementation needs its
own accommodation (e.g. a polling step if thread IDs arrive asynchronously)
— but critically, because `send()` is the only integration point, that
accommodation stays inside the provider-specific implementation and never
requires reopening the approval/dispatch state-machine split this contract
defines.
