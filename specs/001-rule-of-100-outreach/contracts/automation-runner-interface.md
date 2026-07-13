# Contract: AutomationRunner Interface

The abstraction that keeps the Core Engine "not tightly coupled to one agent
framework" (explicit planning requirement). Any orchestration
layer — OpenClaw, a plain cron+script runner, a different agent framework —
implements this interface; the Core Engine only ever calls through it, never
against a framework-specific API directly.

This is a capability contract (what must be implementable), not a wire
protocol — the two implementations discussed in `research.md` (OpenClaw
adapter, plain-cron adapter) may satisfy it differently internally.

## Capabilities an `AutomationRunner` implementation must provide

### `scheduleDailyBatch(cronExpression) → void`
Arranges for `POST /batches/generate` to be called once per operating day
with that day's operator-supplied prospect list. The interface does not
care *how* the trigger fires (OpenClaw cron tool, systemd timer, node-cron)
only that it fires reliably and that a missed/failed run is observable
(see `../plan.md` Observability).

### `runPipelineStep(stepName, attemptId) → StepResult`
Executes one named step of the batch pipeline for one `OutreachAttempt`:
`scrape`, `provisionBFV`, `generateScript`, `lint`. Returns success/failure
plus enough detail to write the corresponding entity (e.g. a `scrape`
result populates `ScrapedSiteSnapshot`). Stepped rather than monolithic so
a failure in one step (e.g. `provisionBFV`) doesn't require re-running
already-succeeded steps (e.g. `scrape`) on retry.

### `deliverChannelMessage(channel, target, payload) → DeliveryResult`
Used specifically for the shared Telegram bot's BFV deep-link provisioning
and any operator-facing notifications (e.g. "today's batch is ready," "a
prospect replied late"). `channel` is an identifier (`"telegram"` for V1);
the interface intentionally doesn't assume Telegram is the only channel
ever supported, even though V1 has exactly one implementation of it.

## What is explicitly *not* in this interface

Business logic — dedup, cadence-day math, the workflow state machine, lint
verdict rules, dashboard aggregation — lives entirely in the Core Engine
and is never delegated to an `AutomationRunner` implementation. This is the
line that keeps OpenClaw (or any replacement) a dumb executor of steps the
Core Engine defines, not a place where "Rule of 100" business rules could
silently diverge from the tested, versioned Core Engine code.

## V1 implementation choice

Per `research.md` §5: the **MVP default** `AutomationRunner` implementation
is the `cron-adapter` (a plain systemd timer / node-cron process) —
`scheduleDailyBatch`/`runPipelineStep` calls back into the Core Engine's
HTTP API (`outreach-api.md`, including the internal endpoints added per
`research.md` §11) using a scoped service credential, not the operator's
own session. User Story 1 (the MVP) is fully functional on the
`cron-adapter` alone — it never calls `deliverChannelMessage`, since
Telegram delivery is only needed for the BFV bot channel and operator
notifications, neither of which gates batch generation itself.

The **OpenClaw adapter** is built in a later Operational Integration phase,
after the MVP and all core user stories are validated, specifically to
gain `deliverChannelMessage` (Telegram). It implements the exact same
interface, so enabling it changes zero Core Engine code — which one
implementation drives `scheduleDailyBatch` in production is an operator
configuration choice, not an architectural dependency.
