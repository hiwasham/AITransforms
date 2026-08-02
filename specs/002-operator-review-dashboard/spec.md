# Feature Specification: Outreach Operator Review Dashboard

**Feature Branch**: `feature/002-operator-review-dashboard`

**Created**: 2026-07-15

**Status**: MVP-0 implemented through M011. Public deployment amendment
approved 2026-07-27; implementation and deployment are governed by
[`public-deployment-design-2026-07-27.md`](./public-deployment-design-2026-07-27.md)
and Phase P in `tasks.md`.

**Input**: User description: "Build an internal founder/operator dashboard
to replace CSV review. Business objective: get the first 100 prospects
contacted as quickly as possible. Problem: the current CSV output is
difficult to review and destroys focus. The dashboard should allow
reviewing prospects one by one, seeing research summary, pain hypothesis,
personalized message, BFV links, approving, rejecting, skipping. MVP only:
no CRM, no analytics, no campaigns, no team features. Optimize for: 'Can I
review 100 prospects quickly?'"

## Context & Relationship to Feature 001

Feature `001-rule-of-100-outreach` built the outreach engine
(`outreach-engine/`). Its **First-100 operator workflow**
(`outreach-engine/scripts/first-100.ts`, the market-validation tool) is
what the operator actually runs today: it produces a CSV
(`outreach-engine/out/first-100-<date>.csv`) with one row per prospect —
`prospect, company, research_summary, pain_point, bfv_link_telegram,
bfv_link_video, personalized_message, approval_status` — which the
operator then reviews by hand in a spreadsheet, editing `approval_status`
cell by cell.

That CSV is the problem this feature replaces. Multi-sentence research
summaries and full message bodies are unreadable inside spreadsheet cells;
tracking decisions means hand-editing a text column; there is no notion of
progress, resume, or focus. The review step — not generation — is now the
bottleneck between the operator and the first 100 sends.

This feature adds a **review dashboard** in front of those packages. It
does not change how packages are generated (001's pipeline and the
first-100 script are untouched), and it does not send anything (sending
remains the operator's manual action in the current workflow, and 001's
dispatch machinery for the automated path is untouched).

001's own deferred dashboard tasks (T084–T088) cover a *conversion/funnel*
dashboard (US4 of 001) plus engine-queue views. This feature is narrower
and different: a single-purpose, one-prospect-at-a-time **review** surface
optimized for decision throughput. Where the two eventually meet (the
engine's `human_review_queue` as a second package source) is documented as
future work, not built here — see Assumptions.

## MVP-0 Scope Reduction (operator direction, 2026-07-15)

After approving the specification direction, the operator reduced the
implementation MVP: the business goal is the **first 100 outreach
contacts**, not a dashboard product. The build target is therefore the
smallest tool that removes the CSV from the review step.

**MVP-0 (build now)** — the review loop only:

- CSV import (first-100 output shape, idempotent re-import)
- Single-prospect review screen (all package fields visible at once)
- Approve, reject — and skip-as-"next" (see note below)
- Auto-advance to the next prospect after every action
- Keyboard shortcuts
- Durable decisions (they survive restart — this is retained in MVP-0
  because losing decisions mid-batch would force re-review, directly
  against the business goal; it costs nothing extra since decisions are
  DB rows either way)

**Deferred (spec'd here, not built in MVP-0)**:

- Export (FR-016) and the copy-send-ready-message action (FR-014) — the
  operator can keep sending from the source CSV/spreadsheet for the first
  sends; the dashboard's job in MVP-0 is deciding, not dispatch prep
- Video-URL editing (FR-015) and send-readiness warnings (FR-017) —
  meaningful only for the deferred copy/export step
- Multiple queues / convergence architecture (the engine-queue seam in
  the Assumptions and plan.md §Two-Queues) — the `source` column remains
  in the schema (one line, prevents a migration later) but no second
  source is designed further or built
- Advanced filtering / list view (FR-012) — MVP-0 navigation is the loop
  plus step-back
- Progress analytics — the full counts surface (FR-011) reduces in MVP-0
  to a minimal "N of M reviewed" indicator; per-state breakdowns are
  deferred
- Import history (the Import Record entity as an operator-facing,
  auditable surface) — MVP-0 still *reports* the import summary in the
  import response (idempotency requires computing it anyway) but does not
  persist a dedicated import-history table or expose any import-history
  view
- Review sessions (any notion of named/bounded sessions) — never designed
  as a first-class concept; explicitly out now

**Skip in MVP-0**: the operator's keep-list names "next" rather than
skip-to-tail. MVP-0 therefore implements **next = skip without decision**:
it advances past the current prospect without recording approve/reject;
the passed-over prospect simply comes back after the remaining pending
ones (natural consequence of "next undecided by position, then
passed-over ones"). The full skip-tail ordering semantics (FR-006's
skip-order resurfacing guarantees) are kept in the requirements for the
full feature but MVP-0 only commits to: a passed-over prospect is never
lost and reappears before the queue reports complete.

**MVP-0 success criterion (SC-000, first gate)**: *the operator can import
today's real first-100 CSV and review 10 prospects without opening the CSV
manually.* Everything below in this spec remains the definition of the
full feature; requirement/criterion IDs are unchanged, and each carries an
MVP-0 marker in plan.md/tasks.md where scope differs.

## Public Deployment Amendment (approved 2026-07-27)

The next release makes the real, persistent MVP-0 dashboard reachable from
a public browser. It does not expand the review feature itself. The public
runtime is a dedicated dashboard-only composition of selected existing
review handlers, protected by one password-only operator session and served
from the Finland VPS through Tailscale Funnel on the selected public HTTPS
listener `:10000`. The pre-existing public `:443 -> 127.0.0.1:20128` Funnel
mapping and the xray listener on `:8443` are out of scope and must remain
unchanged. The dashboard runtime cannot construct or expose generation,
prospect, Telegram, webhook, internal-dispatch, or real dispatch capabilities.

The complete security, persistence, secret-delivery, backup, rollback, and
Funnel contracts live in
[`public-deployment-design-2026-07-27.md`](./public-deployment-design-2026-07-27.md).
If an older requirement below assumes localhost-only access or the full
engine composition, this amendment supersedes that assumption for the
public dashboard runtime only.

The dashboard process binds to `127.0.0.1:3110`; Tailscale Funnel exposes the
public HTTPS listener on `:10000`.


## User Scenarios & Testing *(mandatory)*

### User Story 1 - Review Prospect Packages One at a Time (Priority: P1)

The operator opens the dashboard and sees one prospect package at a time —
company and contact, the research summary, the pain hypothesis, the full
personalized message, and the BFV links — laid out readably on a single
screen with no scrolling between fields and no other prospects competing
for attention. With a single input (keyboard key or one click) the
operator approves, rejects, or skips the package, and the next
not-yet-decided package appears immediately.

**Why this priority**: This is the entire point of the feature. Every
other capability (resume, progress, export) exists to support this loop.
If one-at-a-time review with single-input decisions works, the CSV is
already replaced.

**Independent Test**: Import a fixture batch of packages, open the
dashboard, and verify: exactly one package is displayed at a time with all
five content areas visible (identity, research summary, pain hypothesis,
message, BFV links); each of approve/reject/skip advances to the next
pending package; every decision is recorded.

**Acceptance Scenarios**:

1. **Given** an imported batch with at least one not-yet-decided package,
   **When** the operator opens the dashboard, **Then** the first pending
   package is displayed showing company, contact (when present), research
   summary, pain hypothesis, personalized message, and BFV links — all
   simultaneously visible without horizontal scrolling.
2. **Given** a package is displayed, **When** the operator approves it
   (one key or one click), **Then** the decision is recorded as approved
   and the next pending package is displayed with no further input.
3. **Given** a package is displayed, **When** the operator rejects it,
   **Then** the decision is recorded as rejected and the next pending
   package is displayed.
4. **Given** a package is displayed, **When** the operator skips it,
   **Then** no approve/reject decision is recorded, the package is moved
   to the end of the review order (it will resurface after all currently
   pending packages), and the next pending package is displayed.
5. **Given** a package that was imported with a generation problem (the
   first-100 script's `needs_research` flag — scrape failed or the LLM
   package was incomplete), **When** it is displayed, **Then** the problem
   is visibly flagged on the package so the operator doesn't approve a
   generic fallback message believing it is personalized.
6. **Given** all packages have been decided (none pending, none skipped),
   **When** the operator views the dashboard, **Then** a clear "review
   complete" state is shown with the final counts — not an empty or broken
   screen.
7. **Given** the operator makes a wrong keystroke (e.g. rejects a package
   they meant to approve), **When** they navigate back to that package and
   issue a different decision, **Then** the new decision replaces the old
   one (last-write-wins) — a mis-key during rapid review is recoverable,
   never permanent.

---

### User Story 2 - Resume Mid-Batch with Visible Progress (Priority: P2)

Reviewing 100 prospects may span multiple sittings. The operator can close
the dashboard (or the machine can restart) at any point and later resume
exactly where they left off: every decision already made is retained, the
progress counts (approved / rejected / skipped / remaining) are visible at
all times, and skipped packages come back at the end of the queue rather
than disappearing.

**Why this priority**: Without durable decisions and visible progress, a
100-prospect review session that gets interrupted restarts from zero or
forces re-checking — exactly the focus-destroying property of the CSV this
feature exists to eliminate. It depends on Story 1's decision recording
but delivers distinct value: trust that no decision is ever lost.

**Independent Test**: Import a fixture batch, decide a known subset
(approve some, reject some, skip some), stop and restart the dashboard
process, reopen the dashboard, and verify the counts match exactly, the
next displayed package is the first undecided one, and skipped packages
resurface only after all never-skipped pending packages are exhausted.

**Acceptance Scenarios**:

1. **Given** the operator has decided some packages, **When** the
   dashboard or its backing process is closed and reopened, **Then** all
   previously recorded decisions are intact and review resumes at the
   first not-yet-decided package.
2. **Given** any package is displayed, **When** the operator looks at the
   progress area, **Then** current counts for approved, rejected, skipped,
   and remaining are visible without navigating away.
3. **Given** the operator skipped three packages earlier in the session,
   **When** the last never-skipped pending package is decided, **Then**
   the three skipped packages are presented next, in the order they were
   skipped.
4. **Given** the same source CSV is imported a second time (e.g. the
   operator re-runs the import by accident), **When** the import
   completes, **Then** no duplicate packages are created and no existing
   decision is overwritten or reset — the re-import is a no-op for
   already-known packages and reports how many were skipped as duplicates.
5. **Given** a new day's CSV containing some new prospects and some
   already-imported ones, **When** it is imported, **Then** only the new
   prospects are added as pending packages, and the import summary states
   how many were added vs. already known.

---

### User Story 3 - Act on Approved Packages (Priority: P2)

Approval only matters if it leads to a send. For any approved package, the
operator can copy the ready-to-send message — with the `{{BFV_LINK}}`
placeholder already substituted with the package's real link — in a single
action, and can export all approved packages as a CSV (same column shape
as the first-100 output) for batch handling. Because the first-100
message's video link is a per-prospect placeholder the operator fills in
manually, the dashboard lets the operator paste a video URL onto a package
so the copied/exported message is actually complete.

**Why this priority**: The business objective is "first 100 prospects
*contacted*," not "first 100 packages reviewed." The current manual step
after CSV review — find the row, fix the placeholder, copy the message —
is part of the same focus-destroying workflow. It depends on Story 1's
approvals existing, but is independently testable and delivers the final
step of value.

**Independent Test**: Approve a fixture package, paste a video URL onto
it, use the copy action, and verify the clipboard content is the exact
message body with `{{BFV_LINK}}` replaced by the chosen link and no
placeholder text remaining; export approved packages and verify the CSV
contains exactly the approved set with decisions and substituted messages.

**Acceptance Scenarios**:

1. **Given** an approved package with a video URL supplied, **When** the
   operator uses the copy action choosing the video link, **Then** the
   copied text is the package's message with every `{{BFV_LINK}}`
   occurrence replaced by that video URL and nothing else altered.
2. **Given** an approved package with no video URL supplied, **When** the
   operator uses the copy action, **Then** the Telegram BFV deep link is
   substituted instead, and the operator can see which link was used.
3. **Given** a package whose message would still contain an unresolved
   placeholder after substitution (e.g. the import carried a malformed
   marker), **When** the operator copies or exports it, **Then** the
   dashboard visibly warns that the message is not send-ready rather than
   silently producing a broken message.
4. **Given** a mix of approved, rejected, skipped, and pending packages,
   **When** the operator exports approved packages, **Then** the export
   contains exactly the approved ones, with `approval_status` set to
   `approved` and messages substituted per scenarios 1–2.
5. **Given** the operator pastes a video URL onto a package, **When** the
   package is later redisplayed or exported, **Then** the URL is retained
   (it survives restart like any decision).

---

### Edge Cases

- What happens when the dashboard is opened before any import has run?
  A clear empty state instructing the operator how to import (naming the
  first-100 output location), not an error.
- What happens when the source CSV has malformed rows (wrong column count,
  unparseable quoting)? The importer skips the bad row, reports it by row
  number in the import summary, and imports the rest — one bad row never
  aborts a 100-row import.
- What happens when a CSV row is missing the message or company entirely?
  The row is imported but flagged not-send-ready (same visible flagging as
  `needs_research`), so the count of "what came in" always matches the
  source and problems are visible instead of silently dropped.
- What happens when two rows in one CSV refer to the same prospect
  (same company + URL)? The first is imported; the duplicate is reported,
  not double-created — mirroring 001's dedup stance (FR-007 there).
- What happens when the operator issues a decision for a package that
  another window already decided (double-submit, two tabs)? Last write
  wins, consistent with 001's outcome-recording semantics; the response
  reflects the current state so the stale tab corrects itself.
- What happens when a decision request fails (backing process briefly
  down)? The dashboard shows the failure and does not advance — the
  operator never advances past a package believing a decision was recorded
  when it wasn't.
- What happens when every remaining package is skipped and the operator
  keeps skipping? Skipped packages cycle at the end of the queue; the
  progress area always distinguishes "remaining" (pending + skipped) so
  an infinite skip loop is visible, not confusing.
- What happens to approved packages afterwards? Nothing automatic. This
  dashboard records decisions and helps the operator copy/export; it never
  dispatches, and it never touches 001's approval→dispatch state machine
  (see Assumptions). "Contacted" remains a manual act by the operator in
  the current workflow.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST import prospect packages from the first-100
  workflow's CSV output (`outreach-engine/out/first-100-*.csv` column
  shape: `prospect, company, research_summary, pain_point,
  bfv_link_telegram, bfv_link_video, personalized_message,
  approval_status`), creating one reviewable package per row.
- **FR-002**: Import MUST be idempotent per prospect: re-importing the
  same file, or a later file containing already-imported prospects
  (matched on normalized company + source identity), MUST NOT create
  duplicates and MUST NOT alter any existing decision or operator-supplied
  data; the import summary MUST report added vs. already-known vs.
  malformed-row counts.
- **FR-003**: Import MUST carry through the source `approval_status` flag:
  rows the generator marked `needs_research` (scrape/LLM fallback) MUST
  arrive visibly flagged; rows already marked `approved` in the source
  MUST arrive as already-approved decisions rather than silently reset to
  pending.
- **FR-004**: System MUST present exactly one package at a time, showing —
  simultaneously, on one screen, without horizontal scrolling — the
  prospect identity (company, contact when present), research summary,
  pain hypothesis, personalized message (full text), and both BFV links
  (Telegram deep link, video link or its placeholder state).
- **FR-005**: System MUST let the operator record one of three review
  actions on the displayed package: **approve**, **reject**, or **skip**.
- **FR-006**: Approve and reject MUST each be persisted immediately as the
  package's decision; skip MUST NOT record an approve/reject decision but
  MUST move the package to the end of the review order, where it
  resurfaces after all never-skipped pending packages (in skip order).
- **FR-007**: After any of the three actions, the system MUST
  automatically display the next package in review order with no
  additional operator input.
- **FR-008**: Each of the three actions MUST be executable with a single
  keyboard key (and also with a single click); the key bindings MUST be
  discoverable from the dashboard itself.
- **FR-009**: Decisions MUST be durable: they survive dashboard reload and
  backing-process restart, and review resumes at the first undecided
  package (FR-006's ordering) with all prior decisions intact.
- **FR-010**: A decision MUST be revisable: issuing a new decision on an
  already-decided package replaces the previous decision
  (last-write-wins), and the operator MUST be able to navigate to
  previously decided packages to do so (at minimum: step back to the
  previous package, and reach any package from a list/filter view).
- **FR-011**: System MUST display, at all times during review, the
  current counts of approved, rejected, skipped, and remaining packages
  for the loaded set.
- **FR-012**: System MUST provide a list view filterable by decision state
  (pending / approved / rejected / skipped) as the navigation complement
  to one-at-a-time review — this is a review aid, not a CRM (no editing,
  no notes, no contact management).
- **FR-013**: If a decision fails to persist (backing process unreachable,
  write error), the dashboard MUST surface the failure and MUST NOT
  advance to the next package — silent decision loss is never possible.
- **FR-014**: System MUST provide a one-action copy of a package's
  send-ready message: the stored message body with every `{{BFV_LINK}}`
  marker substituted by the package's video URL when one has been
  supplied, else its Telegram BFV deep link, with the chosen link
  indicated to the operator.
- **FR-015**: System MUST let the operator attach a video URL to a
  package (replacing the generator's `<<paste video link…>>` placeholder);
  the URL persists with the package (FR-009) and is used by FR-014/FR-016
  substitution. This is the only operator-editable package field — message
  text, research summary, and pain hypothesis are read-only in this
  feature.
- **FR-016**: System MUST export approved packages as a CSV in the same
  column shape as the first-100 output, with `approval_status` reflecting
  the decision and `personalized_message` substituted per FR-014, so the
  operator's existing send-by-hand workflow continues unchanged downstream.
- **FR-017**: System MUST visibly warn — on display, on copy, and in the
  export — when a package's message is not send-ready (unresolved
  placeholder after substitution, missing message body, or an
  unsubstituted video placeholder when no video URL was supplied and the
  operator chose the video link), rather than silently producing a broken
  message.
- **FR-018**: The dashboard MUST NOT dispatch, send, or schedule anything,
  and MUST NOT invoke or alter feature 001's approval→dispatch workflow
  state machine, dispatch endpoints, webhook handling, or cadence logic.
  A review-dashboard "approve" is a review decision on a package, not a
  001 `human_review_queue → approved` workflow transition (the two queues
  hold different objects in the MVP — see Assumptions).
- **FR-019**: System MUST NOT alter, remove, or degrade any existing
  AITransforms website page, route, or content, and MUST NOT break any
  existing `outreach-engine` test, endpoint contract, or invariant
  (001's FR-015 discipline, extended to the engine itself).
- **FR-020**: The dashboard and its API MUST be reachable only by the
  operator. The Node process binds to loopback; public ingress is only a
  dedicated Tailscale Funnel HTTPS listener; every operator UI, asset, and
  review API route is protected by the password-only signed-session
  contract in the public deployment design. No public operator route may
  depend on the still-deferred engine-wide T113 authentication task.
- **FR-021** *(Amendment 1, 2026-07-16 — gate G7, feedback loop)*: When
  the operator rejects a package, the system MUST allow (never require) a
  single-keystroke rejection-reason tag from a small fixed set —
  `generic`, `false_claim`, `bad_fit`, `creepy`, `other` — persisted with
  the decision. Tagging MUST NOT add a mandatory step to the reject flow
  (one key rejects exactly as today; the reason is an optional second
  key). Purpose: after the 5/5 rejection of the first real batch
  (001 spec.md Amendment 1), every rejection becomes calibration data for
  the generation exemplars (001 FR-032) instead of a lost bit. Scheduled
  *before first 100 sends*, not before first 10 — see
  `specs/001-rule-of-100-outreach/recovery-plan-first-100.md`.
- **FR-022** *(Amendment 1, 2026-07-16 — gate G3 enforcement at decision
  time)*: The approve action MUST refuse (with a visible reason, FR-013
  style) to record approval on a package that fails the deterministic
  deliverable-integrity check defined by 001 FR-029 — a message claiming
  an asset that does not exist, or final text still carrying an unresolved
  `{{BFV_LINK}}`/`<<…>>` placeholder where a real link is claimed. The
  generation pipeline is the primary gate; this decision-time check is the
  backstop guaranteeing 001 SC-010's "no bypass path" from the review
  surface. Scheduled *before first 10 sends*.
- **FR-023** *(Public deployment)*: Startup MUST require
  `OUTREACH_RUNTIME_MODE=dashboard` and `OUTREACH_DISPATCH_MODE=mock`.
  Missing or different values fail before listening, and dashboard mode
  MUST NOT construct LLM, Telegram, webhook, prospect, batch, or dispatch
  clients.
- **FR-024** *(Public deployment)*: The public route matrix MUST be an
  allowlist containing only login, logout, minimal health, dashboard UI and
  asset, and the five existing review routes named in the deployment
  design. Every unclassified method/path pair, including `/batches/**`,
  `/prospects/**`, `/internal/**`, and `/webhooks/**`, returns the same
  generic `404`.
- **FR-025** *(Public deployment)*: Authentication MUST implement the exact
  password-only, 12-hour absolute signed-session contract in the deployment
  design, including strong startup-validated secrets, a secure `__Host-`
  cookie, fixed failure responses, a global login limiter, and no credential
  or session-token logging.
- **FR-026** *(Public deployment)*: All state-changing requests MUST match
  the configured canonical HTTPS origin; JSON review APIs MUST require
  `application/json`; login MUST require bounded form encoding; the HTTP
  bridge MUST reject request bodies larger than its configured limit before
  unbounded buffering.
- **FR-027** *(Public deployment)*: Login, logout, protected responses and
  errors, redirects, assets, and review APIs MUST send `Cache-Control:
  no-store` plus the approved CSP, framing, MIME-sniffing, and referrer
  protections. No permissive CORS policy is allowed.
- **FR-028** *(Public deployment)*: PGlite data MUST live outside release
  directories under `/var/lib/aitransforms-outreach/pglite`, be owned by a
  dedicated non-login service account, and have exactly one writer enforced
  by systemd plus a process-lifetime lock. Stop/start MUST preserve records.
- **FR-029** *(Public deployment)*: Runtime secrets MUST be fetched from
  Infisical on every service start through systemd encrypted credentials.
  Secrets are forbidden in Git, unit text, release files, persistent env
  files, command-line arguments, and logs; any credential or vault failure
  blocks startup.
- **FR-030** *(Public deployment)*: Releases MUST be immutable, root-owned
  Git-SHA directories selected by an atomic `current` symlink. Deployment
  MUST include a verified private-first rollout, code rollback, offline
  backup, and restore rehearsal before public ingress.
- **FR-031** *(Public deployment)*: Funnel enablement MUST fail closed unless
  host preflight proves encrypted-credential support, Infisical Universal
  Auth, a free policy-allowed Funnel port, and preservation of every existing
  Serve definition by normalized before/after comparison.
- **FR-032** *(Public deployment)*: The dashboard MUST visibly state
  `SIMULATION MODE — nothing will be sent`; an end-to-end review decision
  MUST persist locally while a test proves no external transport is
  constructed or called.

### Key Entities

- **Review Package**: One reviewable prospect package — the unit the
  operator sees and decides on. Key attributes: prospect identity
  (company, contact person, source identity used for dedup), package
  content (research summary, pain hypothesis, personalized message body
  with `{{BFV_LINK}}` marker, Telegram BFV deep link, video URL —
  operator-suppliable), source metadata (which import/file it came from,
  imported-at, generator flag such as `needs_research`), review state
  (decision: pending / approved / rejected; skip ordering marker;
  decided-at), and send-readiness (derived, not stored: whether
  substitution yields a complete message per FR-017).
- **Import Record**: One execution of the importer against one source
  file. Key attributes: source file identity, imported-at, counts (rows
  read, packages added, duplicates skipped, malformed rows with row
  numbers). Exists so FR-002's idempotency and error reporting are
  auditable, mirroring 001's visible-shortfall discipline.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-000 (MVP-0 gate)**: The operator can import today's real first-100
  CSV (`outreach-engine/out/first-100-*.csv`) and review 10 prospects —
  each shown one at a time with all package fields, decided or advanced
  past with a single keystroke — **without opening the CSV manually**.
  This is the first criterion to satisfy and the go/no-go check for
  everything beyond MVP-0.
- **SC-001**: The operator can complete a review pass over 100 packages in
  a single session in **30 minutes or less** of active review time — the
  direct measure of "can I review 100 prospects quickly?" (baseline: the
  CSV workflow, where 100 rows was not completed in a sitting).
- **SC-002**: Recording a decision requires exactly **one input** (one
  keypress or one click), and the next package is fully displayed in
  **under 1 second** on the operator's machine — the review loop never
  waits on the tool.
- **SC-003**: **Zero decisions lost**: across any dashboard reload or
  backing-process restart mid-session, every previously recorded decision
  (including skips and video URLs) is present on resume, verified by the
  Story 2 independent test.
- **SC-004**: Re-importing an already-imported source file changes
  **nothing**: package count identical, every decision identical, and the
  import summary explicitly reports the duplicates (FR-002) — verified by
  running the importer twice over the same fixture.
- **SC-005**: The copied/exported message for an approved package is
  **byte-identical** to the stored message with only the `{{BFV_LINK}}`
  substitution applied — no truncation, no re-wrapping, no encoding damage
  — and contains no unresolved placeholder unless visibly warned
  (FR-017).
- **SC-006**: All pre-existing verification passes unchanged after this
  feature lands: the AITransforms site's `npm run lint`, `npx tsc
  --noEmit`, `npm run test`, `npm run build`, and the full existing
  `outreach-engine` test suite (FR-019).
- **SC-007**: Every package that entered via import is accounted for at
  all times: pending + approved + rejected + skipped counts always sum to
  the imported total, and the list view (FR-012) can surface any package
  regardless of state — nothing is ever unreachable or silently dropped.
- **SC-008 (public access)**: A fresh unauthenticated browser can reach only
  the login page and fixed health response; direct dashboard HTML, protected
  JavaScript, prospect data, review APIs, and unregistered engine routes are
  blocked according to the exhaustive route matrix.
- **SC-009 (session boundary)**: Valid login, invalid login, limiter block,
  logout, expiry, malformed token, tampered token, same-origin enforcement,
  content-type rejection, and request-size rejection all pass automated
  contract tests with the exact cookie and response policy.
- **SC-010 (dashboard-only runtime)**: Production-mode startup refuses any
  non-dashboard/non-mock configuration, constructs no external integration
  client, shows the simulation banner, and persists a review decision without
  network transport.
- **SC-011 (durability)**: The systemd service binds only to loopback,
  survives stop/start with real records intact, and a named backup restores
  successfully into a separate PGlite directory.
- **SC-012 (safe ingress)**: Adding and removing only the new `:10000` Funnel
  listener leaves every normalized pre-existing Serve definition unchanged,
  including the public `:443 -> 127.0.0.1:20128` mapping, and the rollback
  drill restores the verified state.
- **SC-013 (live browser)**: The final public URL loads in a fresh browser,
  requires login, renders the real queue after login with zero console errors,
  performs one uniquely named canary decision, logs out, and blocks the data
  again after a service restart.

## Assumptions

- **Package source is the first-100 CSV, not the engine's DB queue (MVP)**:
  Today's real packages are produced by `scripts/first-100.ts` as CSV; the
  engine's own `human_review_queue` (001) is populated only when the full
  batch pipeline runs, which is not the operator's current path to the
  first 100 sends. The MVP therefore imports the CSV. Wiring the engine's
  `OutreachAttempt` queue in as a second package source — at which point a
  dashboard approve could also drive the 001 `human_review_queue →
  approved` transition — is explicitly future work, and the design must
  not preclude it (plan.md documents the seam).
- **Sending remains unavailable in this release**: The public dashboard
  records review decisions only. Dashboard mode does not register or
  construct dispatch, provider, generation, webhook, cadence, or Telegram
  components; `OUTREACH_DISPATCH_MODE=mock` is a startup invariant.
- **Single operator, remote browser**: One founder/operator may use any
  public browser that can reach the Funnel URL, after application login.
  No team features, identities, roles, or concurrent editing model are
  introduced.
- **Volume**: Batches of ~100 packages, cumulative history in the low
  thousands of rows. No pagination/virtualization engineering beyond what
  that scale needs.
- **Review decisions do not feed back into generation**: rejected
  packages are recorded but nothing regenerates them; a "regenerate
  rejected" loop is out of scope.
- **Message content is trusted display data with one caveat**: package
  text originates from the first-100 pipeline, which already sanitizes
  scraped content before the LLM (001 T016). The dashboard still MUST
  render message/research text as text, never as executable HTML — the
  content derives from scraped third-party sites and an LLM, and the
  dashboard is a browser surface (see plan.md Security Considerations).
- **The 30-minute SC-001 target** assumes packages average one screen of
  content and the operator reads the research summary and message once —
  it is a tool-overhead target (the tool adds effectively zero time per
  decision), not a reading-speed mandate.

## Out of Scope (MVP boundary, per the operator's instruction)

- CRM of any kind: contact management, notes, tags, timelines, reminders.
- Analytics: conversion funnels, reply rates, charts (001 US4 owns the
  100-20-4-1 dashboard).
- Campaigns: sequencing, scheduling, follow-up management (001 US3 owns
  cadence).
- Team features: multi-user, roles, assignment, comments.
- Editing generated content (message text, research summary, pain
  hypothesis) — the only writable field is the video URL (FR-015).
- Automated sending of any kind (FR-018).
- Automated feedback-to-generator or regeneration loops; the already-built
  optional rejection-reason tag remains calibration data only.
- Google/OAuth login, multiple accounts, roles, password reset, session
  revocation service, or team access.
- Real sending, provider credentials, Telegram polling, generation, webhook
  ingestion, and internal dispatch on the public dashboard listener.
- Custom-domain ingress while `aitransforms.ir` DNS remains outside this
  release; the stable marketing-site Vercel URL remains independent.
