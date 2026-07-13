# Phase 0 Research: Rule of 100 Outreach Engine

Each decision below resolves a Technical Context unknown or a user-specified
architectural requirement. Format: Decision / Rationale / Alternatives
considered. Constitution references are to `.specify/memory/constitution.md`
v1.0.0.

## 1. Where does this system live relative to the existing AITransforms site?

**Decision**: A new, independently deployable service at a new top-level
directory `outreach-engine/` in the *same* git repository, sharing no code,
build step, or deploy pipeline with `src/` (the static marketing site).

**Rationale**: FR-015 requires zero impact on the existing site. The
constitution's Additional Constraints bar a "heavy backend component" for
functionality a static implementation "already satisfies" — but scraping,
stateful cadence tracking, a human-review queue, and a live dashboard are
not satisfiable by a static site, so that constraint doesn't block a new
backend; it does mean the new backend must not become a dependency of the
existing site. Same-repo (not a second repo) keeps operational overhead low
for a single founder/operator (Constitution Principle III), while a fully
separate top-level directory with its own `package.json`/deploy target keeps
the two systems genuinely decoupled (Principle IV) and satisfies FR-015
structurally, not just by convention.

**Alternatives considered**:
- *Add API routes under `src/app/api/`*: rejected — couples backend
  changes/outages to the static site's build and Vercel deploy, and directly
  contradicts the Additional Constraint against introducing heavy backend
  pieces into that project surface.
- *Separate git repository*: rejected — no code is shared either way, so a
  second repo buys isolation the same-repo/separate-directory approach
  already provides, at the cost of a second CI pipeline, a second place to
  check out, and a second permission surface for a single operator to manage.

## 2. Runtime stack for the new service

**Decision**: TypeScript on Node.js (same language as the existing repo),
using Next.js App Router (Route Handlers) for the operator dashboard UI +
internal HTTP API, a separate long-running Node process for the job
scheduler (cron-style background jobs), Vitest for tests.

**Rationale**: Constitution Principle X (follow existing conventions) and
Principle III (avoid unnecessary dependencies) both favor reusing the
language, framework, and test runner the repo and its CI already know,
rather than introducing a second language/framework for a two-person
(founder + agent) operation. Next.js Route Handlers give the dashboard UI
and API in one codebase without a separate frontend framework. The
scheduler needs a process that outlives a single HTTP request (daily batch
generation, cadence sweeps), which serverless/Vercel-style hosting does not
support well — so this service is *not* deployed to Vercel; it runs as its
own long-lived process (see §3).

**Alternatives considered**:
- *Python/FastAPI*: rejected — no existing Python code or convention in this
  repo; would be a second language for a solo operator to maintain
  (Principle III/X).
- *Vercel serverless functions + Vercel Cron*: rejected for the scheduler —
  works for simple triggers but the batch pipeline (scrape → BFV provision →
  script gen → lint retries) can run long and needs to hold state across
  steps; a plain Node process avoids serverless timeout/cold-start design
  contortions for what is, at 100 items/day, a small job.

## 3. Deployment target

**Decision**: Deploy the new service as its own process on the same host
already running the OpenClaw gateway (systemd-managed), not on Vercel.

**Rationale**: The host already runs long-lived systemd services (including
`openclaw-gateway.service`); adding one more systemd-managed Node service is
a known operational pattern on this box, versus introducing a second hosting
provider/paradigm for a single new service.

**Alternatives considered**: A managed platform (Vercel, Fly.io, Render) —
rejected for V1 as unnecessary new infrastructure surface (Principle
III/XI) when a working systemd pattern already exists; revisit only if the
operator later wants managed uptime/scaling guarantees this host can't give.

## 4. Storage

**Decision**: Embedded Postgres (PGLite) as a local file-backed database for
V1, with the schema written in standard SQL/Postgres dialect so a later
migration to a managed Postgres server is a data-copy, not a rewrite.

**Rationale**: Scale/Scope is ~100 new prospects/day, single operator, no
concurrent multi-tenant writers — this is a small dataset (low thousands of
rows/month) with light read/write concurrency. PGLite gives Postgres-grade
SQL (window functions for cadence-day math, proper timestamps) with zero
network hop and zero separate database server to operate — consistent with
Principle III. The operator's own tooling already uses PGLite/pgvector
elsewhere (referenced directly in this site's own `/work` case-study copy),
so this is a stack the operator is already familiar with operationally.

**Alternatives considered**:
- *Managed Postgres (Supabase/RDS)*: rejected for V1 — real operational
  value (backups, remote access) but unjustified ops overhead for a
  single-operator, low-volume system; the SQL-compatible schema keeps this
  door open (Principle XI: justified, not foreclosed).
- *SQLite*: rejected — weaker native date/window-function support for the
  cadence-day and dashboard-aggregation queries, and PGLite gives the same
  "just a file" operational simplicity with full Postgres SQL.
- *Flat files/JSON*: rejected — the workflow-state machine, dedup lookups,
  and dashboard aggregation all need relational queries and constraints
  (e.g., one active `OutreachAttempt` per `Prospect`).

## 5. OpenClaw as the automation/orchestration layer

**Decision**: Use OpenClaw for exactly two things — (a) hosting the shared
Telegram channel the BFV bot deep-links resolve into, and (b) as one
possible implementation of an abstract `AutomationRunner` interface that
triggers the Core Engine's batch pipeline (scrape → BFV provision → script
generation → lint) on a schedule. The Core Engine itself (data model, dedup,
cadence math, linter rules, workflow state machine, dashboard) does not run
inside OpenClaw and has no OpenClaw-specific code — it is called *through*
the `AutomationRunner` contract (see `contracts/automation-runner-interface.md`).

**Rationale**: OpenClaw is already deployed and operational on this host as
a personal-assistant gateway with native Telegram channel support, a cron
tool, and agent tool-calling — reusing it for the BFV bot channel avoids
standing up a second Telegram integration from scratch. But the user
explicitly required the system not be tightly coupled to one agent
framework; putting business logic inside OpenClaw's workspace/skill config
would violate that and Principle IV (modularity). Defining a narrow
interface (schedule a batch run, run one pipeline step, deliver a message
on a channel) keeps OpenClaw swappable for a cron job + script, a different
agent framework, or a workflow tool later, without touching the Core
Engine.

**Operational caveat surfaced by this host's own runbooks**: this host's
OpenClaw gateway has documented quirks (dual systemd units competing for
one port, orphaned detached processes surviving `openclaw gateway stop`,
a watchdog/healthcheck timer that can mask config changes) — see
`/tmp/cockpit-backup/memory/openclaw-gateway-systemd-quirks.md`. Because the
Core Engine treats OpenClaw as a replaceable adapter rather than a load-bearing
internal dependency, a gateway outage degrades to "batch pipeline didn't run
today" (visible, alertable, retriable) rather than corrupting Core Engine
state.

**Also decided**: if OpenClaw is used, this feature registers its own
dedicated OpenClaw workspace/agent identity, not the existing
`workspace-hamkelasi-omid-ceo-transformation` workspace, which belongs to an
unrelated client engagement — reusing it would cross-contaminate agent
context and credentials between two different businesses (Constitution
Principle V).

**Alternatives considered**:
- *Plain cron + custom scripts calling the Core Engine API directly, no
  OpenClaw*: viable and remains the fallback `AutomationRunner`
  implementation; not chosen as the default for V1 only because it would
  require standing up a second, separate Telegram bot integration that
  OpenClaw's channel support already provides.
- *n8n or a dedicated workflow engine (Temporal, Airflow)*: rejected as
  unjustified operational overhead for a ~100-item/day, single-operator
  pipeline (Principle III).

## 6. BFV delivery mechanism (Telegram bot)

**Decision**: One shared Telegram bot (not one bot per prospect), with a
unique per-attempt deep-link token (`t.me/<bot>?start=<token>`). The token
resolves server-side to that specific `OutreachAttempt`'s scraped-content
context, which scopes the bot's replies to that prospect only for that
conversation.

**Rationale**: Matches the spec's own Assumption ("delivered as a distinct,
prospect-specific interactive link/session... not a separately hosted bot
per prospect"). Provisioning ~100 new Telegram bot accounts/day is not
something the Telegram Bot API is designed for and would be an operational
and abuse-detection liability; a single bot with per-token scoped context
delivers the same zero-friction, pre-built-before-send experience (FR-016,
FR-017) without that liability.

**Alternatives considered**: Per-prospect bot provisioning — rejected per
above. A web-based chat widget instead of Telegram — rejected: contradicts
the operator's explicit "Telegram bot" directive in `resources/bfv-concept.md`
and loses the "already in an app they use" zero-friction property.

## 7. Anti-Values Linter implementation approach

**Decision**: A two-layer check — (a) deterministic/mechanical checks
(readability grade score via a standard formula, e.g. Flesch-Kincaid; a
maintained deny-list of corporate-jargon/"workslop" terms; length and
structure checks for Hook→Pain→BFV→Ask presence) run first and are cheap,
fast, and fully deterministic; (b) an LLM-judge pass for what mechanical
checks can't catch (genuine specificity vs. generic filler, tone, whether
the "Pain" is concretely tied to that prospect's scraped content rather than
boilerplate). Both layers must pass for a script to reach
`quality_checked`; either layer failing routes the package to
`revision_requested` with structured, rule-level feedback.

**Rationale**: A pure LLM-judge is non-deterministic and expensive to run
100x/day with retries; pure mechanical rules can't catch "sounds like a
generic template" or verify the pain point is actually tied to the
prospect's real content. Combining both gives fast, cheap, reproducible
rejection of the easy failures (jargon words, reading level) and reserves
the more expensive judgment call for genuine ambiguity.

**Alternatives considered**: LLM-only judging — rejected as non-deterministic
and harder to unit test (Principle IX needs a stable pass/fail contract for
critical-path tests). Mechanical-only — rejected as unable to enforce
"specific and concrete," which is inherently a content-understanding check.

## 8. Access control for the operator dashboard/API

**Decision**: A minimal single-operator credential gate (one operator
account, session-based) protecting the dashboard and Core Engine API. Not a
multi-user auth system.

**Rationale**: The dashboard and API expose prospect PII and can trigger
Approve/Send-adjacent actions; leaving them open to anyone who finds the URL
would violate Constitution Principle V (protect sensitive data). A full
multi-tenant auth system would be disproportionate for one operator
(Principle III) and is explicitly out of the constitution's "no heavy
backend for functionality already satisfied" prohibition only in the sense
that *some* gate is required — a single-credential gate is the minimum that
satisfies Principle V without over-building.

**Alternatives considered**: No auth (network-level restriction only, e.g.
Tailscale/VPN-only access) — viable as a *defense-in-depth addition*, not a
replacement, since the operator may want to check the dashboard from a
phone off the home network; documented as a security consideration rather
than the sole control.

## 9. Script generation + LLM provider

**Decision**: Use the same LLM provider/access path already configured on
this host (Claude via the existing `claude-cli` provider pattern documented
in this host's OpenClaw runbooks) for script generation and the linter's
judge layer, accessed directly by the Core Engine (not proxied through
OpenClaw) via a small internal `ScriptGenerator`/`LintJudge` interface —
kept swappable for the same reason as §5.

**Rationale**: Reuses an already-working, already-paid-for model access path
on this host instead of provisioning a second one. Keeping the call direct
from the Core Engine (rather than round-tripping through the OpenClaw
gateway) avoids making script generation depend on OpenClaw's availability,
consistent with keeping OpenClaw an optional orchestration adapter, not a
load-bearing dependency for content generation.

**Alternatives considered**: Routing generation calls through OpenClaw's
agent — rejected, ties a Core Engine capability to OpenClaw's uptime for no
benefit, weakening the "not tightly coupled to one agent framework"
requirement.

## 10. Automated reply detection: Instantly/Unipile webhooks

**Decision**: Replies are detected via inbound, signature-verified webhooks
from the operator's outreach dispatch provider(s) (Instantly and/or
Unipile), not manual operator recording. On receipt of a verified,
not-yet-processed event, the Core Engine autonomously transitions the
matching `OutreachAttempt`'s prospect to "replied" and halts its cadence.
A manual "replied" override remains available as a fallback for when the
integration is delayed or unavailable — see `data-model.md`'s Outcome State
Machine.

**Rationale**: The operator explicitly directed that manual reply recording
be eradicated as the primary mechanism — a human-checked-inbox model is
both a missed-detection risk and a cadence-timing risk (a Bump/Takeaway
message can fire after a reply already landed but wasn't yet logged).
Instantly and Unipile are the operator's actual dispatch platforms, so they
are also the natural source of truth for delivery/reply events on the
threads they sent — no separate reply-detection mechanism needs to be
built. This decision also changes where "sending" happens (see the revised
Assumption in spec.md): packages are dispatched through the provider after
operator approval, rather than an ad hoc handoff, which is what makes
webhook correlation to a specific `OutreachAttempt` possible at all.

**Alternatives considered**:
- *Manual-only recording (the original design)*: rejected per explicit
  operator direction — see above.
- *Polling the provider's API for new replies on a schedule*: rejected —
  higher latency than a push webhook (works against SC-006's 5-minute
  bound) and adds unnecessary polling-schedule complexity for no benefit
  over a webhook the provider already offers.
- *A custom IMAP/SMTP inbox watcher*: rejected — reinvents functionality
  the named providers already provide, and would additionally require
  handling the operator's own mailbox credentials directly (a larger
  credential-security surface than a scoped webhook signing secret).

**Security note**: the inbound webhook endpoint is a new public-facing
boundary (see `plan.md` API Boundaries and Security Considerations) —
authenticated only by provider signature verification, not the operator's
session credential, since the provider can't hold that. Verification must
be fail-closed.

## 11. Process boundary for background jobs: HTTP-only access to Core Engine data (Option A)

**Decision**: The `jobs/` scheduler process never imports `db/` or
`domain/` directly and holds no database connection of its own. Every
scheduled action (daily batch trigger, cadence recompute) is a plain HTTP
call from `jobs/` into the core service's own API (the same Next.js
process that owns `api/`, `domain/`, and `db/`), using the same scoped
service credential the `AutomationRunner` boundary already defined for
`POST /batches/generate`. One new internal endpoint —
`POST /internal/cadence/recompute` (`contracts/outreach-api.md`) — covers
the one scheduled job that wasn't already API-shaped. (Re-engagement
eligibility is not a separate scheduled job at all as of the
`plan-eng-review` correction — it's a live query inside
`POST /batches/generate` itself; see `data-model.md`'s Batch Candidate
Pool.)

**Rationale**: PGLite's safe operating mode is single-process, and nothing
in this plan verified safe concurrent multi-process access to one PGLite
datadir — an engineering review flagged this as an open risk (an API
process and a separate `jobs/` process both touching the same on-disk
store). Rather than spend implementation time proving or disproving
multi-process PGLite safety (Option B), giving the core service sole
ownership of the database removes the question entirely: there is exactly
one process, ever, with a connection open. This is a smaller change than
it looks — `POST /batches/generate` already worked this way (§5 above:
`AutomationRunner` implementations call back into the Core Engine's HTTP
API rather than touching data directly); this decision closes the same gap
for the other two scheduled jobs so the rule is now `jobs/` triggers,
`api/`+`domain/`+`db/` executes, with no exception.

**Alternatives considered**:
- *Option B — prove/document safe multi-process PGLite access*: rejected
  for V1 — even if achievable, it would need its own verification work
  (load-testing concurrent writers, documenting the exact safe access
  pattern) for a benefit (avoiding two small new internal endpoints) that
  doesn't justify the risk of getting it wrong in production. Revisit only
  if `jobs/` as a separate OS process turns out to need direct data access
  the HTTP-only model can't provide.
- *Merge `jobs/` into the same OS process as `api/`*: considered but not
  needed — the HTTP boundary already gives full isolation of the *data
  layer* (the actual multi-process risk), so there's no remaining reason to
  also collapse the process boundary itself; keeping `jobs/` separate still
  protects the API's own request/response latency from a stuck cron tick.

## Summary of resolved unknowns (Technical Context)

| Field | Resolution |
|---|---|
| Language/Version | TypeScript, Node.js 24 (matches existing repo/CI) |
| Primary Dependencies | Next.js (Route Handlers), a Postgres-wire driver + lightweight query builder/ORM, PGLite, a scraping/HTML-parsing library, a Telegram bot library, an LLM SDK, a readability-scoring library, a cron-style scheduler library, Instantly/Unipile API clients + webhook signature verification |
| Storage | PGLite (embedded Postgres), Postgres-dialect schema |
| Testing | Vitest (matches existing repo) |
| Target Platform | Linux host, systemd-managed long-lived Node process (same host as OpenClaw gateway) |
| Project Type | New backend service + operator dashboard (web-service), separate from the existing static site |
| Performance Goals | Complete a ~100-prospect daily batch within an overnight window; dashboard/API responses sub-second at this data scale |
| Constraints | Zero impact on existing site (FR-015); BFV links zero-friction (no auth wall); OpenClaw treated as replaceable, not load-bearing; reply webhooks verified + idempotent, detection within 5 minutes (SC-006) |
| Scale/Scope | ~100 new prospects/day; cumulative retained history; single operator |
