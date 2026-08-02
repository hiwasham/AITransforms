---

description: "Task list for feature implementation"
---

# Tasks: Outreach Operator Review Dashboard

**Input**: Design documents from `specs/002-operator-review-dashboard/`
(`spec.md` incl. §MVP-0 Scope Reduction, `plan.md` incl. §MVP-0 Build
Scope — data model and API contract are inlined in `plan.md`)

**Tests**: Included. MVP-0's critical paths (Constitution Principle IX):
import idempotency, decision persistence/last-write-wins, review-order
next/advance/never-lost, the CSV-helper extraction pin, and the
no-`innerHTML` rendering rule.

**Organization**: Restructured 2026-07-15 per the operator's scope
reduction: **Phase M (MVP-0)** is the build target — the review loop only
(import, single-prospect review, approve/reject/next, keyboard shortcuts).
The previously drafted full task set (R001–R038) is superseded; its
still-relevant deferred work is retained, renumbered, under **Phase D
(Deferred)** so nothing spec'd is lost. Task IDs: `M###` for MVP-0,
`D###` for deferred.

**MVP-0 exit gate (spec SC-000)**: the operator can import today's real
first-100 CSV and review 10 prospects without opening the CSV manually.

**Status**: Phase M implemented through M011. Phase P (login-protected
public dashboard) approved 2026-07-27 and active. Phase D remains a
parking lot and is not part of the public-deployment release.

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependency on an
  incomplete task)
- All paths are under `outreach-engine/` (plan.md Structure Decision) —
  nothing under `src/` of the AITransforms site is touched by any task
  (spec FR-019).

## Path Conventions

Per `plan.md`: `outreach-engine/src/{lib,domain/review,api/review,ui}/`,
`outreach-engine/tests/{unit,contract,integration}/`. Engine layer rules
apply unchanged (ARCHITECTURE.md §7): `domain/` never imports `api/`,
route handlers stay `createXHandler(deps)` factories, DB access only from
the core service, package text never rendered as HTML. Nothing under
`domain/review/` or `api/review/` may import the workflow state machine,
dispatch, webhook, or cadence modules (spec FR-018 — the Two-Queues
isolation rule survives the scope cut).

---

## Phase M: MVP-0 — the review loop (build now)

**Goal**: Replace the CSV for the *deciding* step. Import the first-100
CSV; show one prospect at a time (company, contact, research summary,
pain hypothesis, full message, BFV links, `needs_research` flag); single
keystrokes for approve (`a`), reject (`r`), next (`n` — advance without
deciding, never losing the prospect); auto-advance; durable decisions;
step-back for mis-keys; minimal "N of M reviewed" indicator; empty and
complete states.

**Independent Test**: SC-000 verbatim — import the real
`out/first-100-*.csv`, review 10 prospects end to end, CSV never opened.

- [X] M001 Create branch `feature/002-operator-review-dashboard`; run the
      full existing verification (engine `npm run test` + `npm run
      typecheck`; site `npm run lint`, `npx tsc --noEmit`, `npm run
      test`, `npm run build`) and save the output as the SC-006 baseline

- [X] M002 Add the isolated row-aware CSV parser (`parseCsvRecords`) in
      `outreach-engine/src/lib/csv.ts`, including malformed-quote recovery
      with physical row numbers; pin it through importer unit tests. CSV
      serialization remains deferred with export.

- [X] M003 Add the `review_packages` table to
      `outreach-engine/src/db/schema.ts` per plan.md §Data Model as
      amended by §MVP-0 Build Scope: no `review_imports` table;
      `source_name` text column instead of `import_id`; reserved
      `source` column (default `'first100_csv'`); `dedup_key` unique
      index; CHECK constraint on `decision`. Additive only (depends on
      M001)

- [X] M004 [P] Implement the `ReviewPackage` repository — create,
      getById, count-reviewed/total, decision write (last-write-wins,
      FR-010) and passed-over marking — in
      `outreach-engine/src/domain/review/review-package.ts`, and the pure
      review-order module — next = first pending never-passed-over by
      `position`, then passed-over ones; a passed-over prospect is never
      lost and reappears before the queue reports complete (spec §MVP-0
      skip semantics) — in
      `outreach-engine/src/domain/review/review-order.ts` (depends on
      M003)

- [X] M005 [P] Implement the importer — CSV text via `src/lib/csv.ts` →
      normalized packages; `dedup_key` idempotency (FR-002: re-import
      adds nothing, resets nothing); `<<paste video link…>>` → null;
      `needs_research` carried to `generator_flag`; source `approved`
      carried to `decision='approved'` (FR-003); malformed rows skipped
      and reported by row number in the returned summary (no persistence
      of the summary — import history is deferred) — in
      `outreach-engine/src/domain/review/importer.ts` (depends on M002,
      M003)

- [X] M006 [P] Unit tests for M004/M005: importer mapping + flag carry +
      malformed tolerance + same-file dedup; `dedup_key` normalization
      edges (case, whitespace, `www.`, trailing slash, no-URL fallback);
      review-order matrix (fresh queue, advance, passed-over return,
      never-lost, all-decided ⇒ null, re-decide) — in
      `outreach-engine/tests/unit/review-importer.test.ts` and
      `outreach-engine/tests/unit/review-order.test.ts` (write first,
      expect fail until M004/M005 land)

- [X] M007 [P] Contract tests for the four MVP-0 endpoints: `POST
      /review/imports` (201 summary shape incl. duplicates + malformed;
      double-import ⇒ `added: 0`, zero state change — SC-004's assertion
      lives here now); `GET /review/packages/next` (full package +
      `reviewed`/`total` counts; exhausted ⇒ `200 { package: null }`);
      `GET /review/packages/:id` (404 unknown); `POST
      /review/packages/:id/decision` (`approve|reject|next` effects,
      inline `next` in the response, last-write-wins re-decide, invalid
      action ⇒ 400) — in
      `outreach-engine/tests/contract/review-api.test.ts`

- [X] M008 Implement the four route factories —
      `outreach-engine/src/api/review/imports/route.ts`,
      `.../packages/next/route.ts`, `.../packages/[id]/route.ts`,
      `.../packages/[id]/decision/route.ts` — and register them plus
      path-confined static serving of `ui/` (`GET /`, `GET /ui/*`,
      traversal rejected) as additive rows in
      `outreach-engine/src/server/app.ts`; structured logging per
      plan.md Observability (import summary, per-decision entries —
      identifiers only, never package text) (depends on M004, M005)

- [X] M009 Build the review UI — one screen per prospect with all
      package fields and the `needs_research` flag; keys `a`/`r`/`n` (+
      buttons, bindings visible on-screen, FR-008); auto-advance from the
      decision response's inline `next`; do-NOT-advance on a failed write
      with a visible error (FR-013); step-back to the previous prospect
      for re-decide (FR-010); "N of M reviewed" indicator; empty-state
      (no import yet, naming the first-100 output location) and
      review-complete state; ALL text rendered via `textContent`, zero
      `innerHTML` — in `outreach-engine/src/ui/index.html` and
      `outreach-engine/src/ui/review.js` (depends on M008)

- [x] M010 Integration test — the SC-000 loop against a fixture CSV in
      the real first-100 column shape: import → walk the queue deciding
      and passing-over via the endpoints → verify every decision
      recorded, passed-over prospects return, complete state reached;
      plus a restart-durability leg (reopen the Db on the same datadir,
      decisions intact, FR-009) — in
      `outreach-engine/tests/integration/review-loop.test.ts`
      (done 2026-07-22, night shift: import→reject+Q011 tag→approve→next
      loop + restart-durability leg, both green)

- [x] M011 Add a mechanical guard test: no
      `innerHTML`/`insertAdjacentHTML`/`document.write` under
      `outreach-engine/src/ui/`, and no import of the workflow
      state machine / dispatch / webhook / cadence modules under
      `src/{domain,api}/review/` (FR-018) — in
      `outreach-engine/tests/unit/review-isolation.test.ts`
      (done 2026-07-22: sink-write regex + import-specifier guard, green)

- [ ] M012 Verify and close MVP-0: rerun the full verification suite and
      diff against M001's baseline (identical-or-green, SC-006/FR-019);
      then the manual SC-000 gate on the operator's machine — import the
      real `out/first-100-2026-07-14.csv` (or today's), review 10 real
      prospects end to end by keyboard, confirm the CSV was never opened;
      record the result in the PR/commit message (Verify, Don't Claim)

**Checkpoint / STOP**: MVP-0 done. The operator reviews real prospects
without the CSV. Nothing below starts without a new operator decision.

---

## Phase P: Login-protected public deployment (active)

**Goal**: Run the real persistent review dashboard on the Finland VPS and
open it from a public browser through a dedicated Tailscale Funnel URL,
while login-protecting every operator route and keeping sending and every
unrelated engine surface mechanically unavailable.

**Source of truth**:
`public-deployment-design-2026-07-27.md`, spec FR-023–FR-032, and plan.md
§Phase P. HOLD SCOPE: do not pull any Phase D item into this release.

- [x] P001 Approve the office-hours design through three adversarial
      reviews, explicitly select Funnel + application login and HOLD scope,
      synchronize `spec.md`, `plan.md`, and `tasks.md`, then pass
      `/plan-eng-review` and `/cso` before implementation (complete; the
      2026-08-01 diff security review had zero reportable findings)

- [x] P002 Write failing unit tests first for dashboard config modes,
      password/signing-secret strength validation, candidate digest
      comparison, raw secret removal from `process.env`, signed-session
      format/version/nonce/issue/verify/tamper/expiry/future-time behavior,
      absolute-not-sliding expiry, missing/duplicate/malformed cookies,
      fixed-window limiter boundaries (49/50/51 and reset), exact/missing/
      mismatched Origin, content types with/without charset, security headers,
      literal/dynamic/method/malformed-percent route matching, and exhaustive
      policy-table classification; use an injected clock/random source only
      where needed for deterministic tests

- [x] P003 Write failing contract tests first for `GET/POST /login`,
      `POST /logout`, `GET /healthz`, UI navigation redirect, direct protected
      asset/API `401`, cookie attributes, no-store/CSP/framing headers, fixed
      `400/401/403/413/415/429` responses, missing/empty/duplicate/unknown login
      fields, the exact 4 KiB boundary, security headers on success/redirect/
      every error, every selected review route, and generic non-disclosing
      `404` for every forbidden method/path under batch/prospect/internal/
      webhook plus other unclassified paths

- [x] P004 Write failing HTTP/integration tests first for the 1 MiB bridge
      limit (and 4 KiB login limit), raw `Content-Length` rejection, chunked
      input crossing the limit, the exact accepted boundary, safe connection
      close/drain behavior, malformed URL handling, isolated router/bridge
      regression behavior, dashboard-only dependency imports/construction,
      non-dashboard or non-mock startup refusal, loopback binding intent,
      graceful shutdown, restart persistence, and a review decision with zero
      external network transport

- [x] P005 Implement the minimum auth/security modules using Node built-ins
      only: validated config, SHA-256 candidate digest comparison,
      HMAC-SHA-256 stateless 12-hour session, `__Host-outreach_session`
      cookie, global limiter, exact origin/content-type enforcement, fixed
      failures, security/no-store headers, and safe audit metadata. Use a
      dashboard-only config loader; after deriving the password digest and
      binary signing key, delete the raw env entries and retain no raw secret
      string references

- [x] P006 Implement a dedicated dashboard composition root and production
      entry point. Keep the generic matcher/dispatcher inside the isolated
      dashboard release; do not import or pin the excluded full app. Define one
      dashboard policy table containing method, pattern, handler, access class,
      mutation/origin rule, and accepted content type; construct only
      DB/auth/static UI/health plus the five selected review handlers. Do not
      import or construct LLM, Telegram, scraper, batch, prospect, webhook,
      internal-dispatch, or dispatch-client modules; make all unclassified
      routes fail closed with the generic 404

- [x] P007 Bound the node:http bridge before buffering, preserve fixed safe
      500 behavior, and make the 1 MiB dashboard limit an explicit bridge
      option. Bind the dashboard runtime to `127.0.0.1`, retain
      graceful HTTP/PGlite shutdown, and add a request correlation ID without
      logging cookie, credential, session, or prospect content

- [x] P008 Add the persistent visible
      `SIMULATION MODE — nothing will be sent` banner and authenticated
      logout control to the existing UI without changing the review workflow;
      keep dynamic content text-only and keyboard behavior unchanged. Add
      static/mechanical tests for the banner, logout, no unsafe HTML sinks,
      unchanged keys, failed-mutation stay-put behavior, and clear recovery
      when the session expires mid-use

- [x] P009 Run the new unit/contract/integration tests, then the complete
      existing `outreach-engine` test suite and typecheck. Run the root site
      lint, typecheck, tests, and production build to prove the independent
      Vercel website remains green

- [x] P010 Add reviewed deployment artifacts under `outreach-engine/ops/`:
      hardened systemd unit, root-owned no-trace Infisical wrapper template,
      private-first deploy procedure, offline backup/retention and separate-
      directory restore procedure, rollback procedure, and smoke checks.
      Validate committed artifacts with `systemd-analyze verify`, shell
      syntax/no-trace checks, and secret-pattern scans. Never place a real
      credential, token, public secret, or host-derived encrypted credential
      blob in Git

- [ ] P011 On the Finland host, take timestamped backups before every config
      write and run the fail-closed preflight: systemd/systemd-creds support,
      host-bound encrypt/decrypt, installed Infisical Universal Auth flow and
      redaction, dedicated user/directories/permissions, active listeners,
      loopback port 3110 and Funnel port 10000 availability and policy,
      canonical DNS name, existing
      Serve/Funnel JSON, and normalized configuration baseline (including the
      existing public :443 -> 127.0.0.1:20128 mapping); confirm xray still owns
      8443 and do not modify either existing listener

- [ ] P012 Deploy the merged Git SHA privately into a root-owned immutable
      release, install production dependencies, create/verify the encrypted
      bootstrap credentials without revealing them, start the loopback-only
      service, then verify health, login, origin rejection, forbidden routes,
      real queue access, mock-only behavior, restart persistence, single-writer
      refusal, offline backup, and restore into a separate PGlite directory

- [ ] P013 Enable only the new Funnel listener after private verification;
      prove every normalized pre-existing Serve entry is unchanged, exercise
      remove/re-add rollback, and run gstack `/browse` QA from a fresh public
      browser: blocked unauthenticated UI/asset/API, login, real queue,
      uniquely named `CANARY-<UTC>` rejection with `other`, zero console
      errors, logout, restart, blocked access again, and retained canary record

- [ ] P014 Run `/review`, `/ship`, `/land-and-deploy`, and `/canary`; merge by
      PR only after required checks pass. Publish the stable Vercel marketing
      URL and the verified Funnel dashboard URL plus a deploy report containing
      release SHA, backup identifier, rollback evidence, and any conditional
      host facts that could not be observed

**Phase P exit gate**: SC-008–SC-013 all have observed evidence. The
dashboard URL opens publicly, requires the operator password, renders the
real persisted queue, cannot expose or construct sending/integration paths,
survives restart, has a tested backup/rollback, and passes live browser QA.

---

## Phase D: Deferred (parking lot — not scheduled)

Retained from the superseded full task set so the spec'd scope isn't
lost. Each maps to spec.md requirements that remain valid for the full
feature. Do not start any of these during MVP-0.

- [ ] D001 Send-ready module (`{{BFV_LINK}}` substitution + readiness
      verdicts, FR-014/FR-017) + unit tests (was R007/R027)
- [ ] D002 Copy send-ready message action in the UI (FR-014) (was
      part of R033)
- [ ] D003 Video-URL endpoint + UI field (FR-015) + contract test (was
      R028/R031, part of R033)
- [ ] D004 Approved-only CSV export in the first-100 column shape
      (FR-016/FR-017) + contract/integration tests (was R029/R030/R032)
- [ ] D005 List/filter view + `GET /review/packages` (FR-012) + contract
      test (was R022/R025/R026)
- [ ] D006 Full per-state progress counts (approved/rejected/skipped/
      remaining always visible, FR-011) replacing the minimal N-of-M
      indicator (was part of R026)
- [ ] D007 Skip-tail ordering guarantees (resurface in skip order,
      FR-006 full semantics) + dedicated restart-resume integration test
      (was part of R010, R023)
- [ ] D008 Import-history persistence (`review_imports` table, Import
      Record entity) + re-import reporting surface (was R005, part of
      R024)
- [ ] D009 Engine-queue convergence: project 001's `human_review_queue`
      attempts in as a second package source (`source='engine_attempt'`),
      approve driving `POST /prospects/:id/approve` through its public
      contract (plan.md §Two-Queues seam) — needs its own mini-spec
      before build
- [ ] D010 Review workflow documentation in `outreach-engine/` docs
      (import, keys, resume, FR-020 localhost posture + T113 note) (was
      R038) — pull forward into MVP-0 only if the operator asks

---

## Dependencies & Execution Order

### Phase M

- M001 → everything; M002 → M005; M003 → M004/M005.
- M004, M005 in parallel after M003; M006, M007 (tests) written first,
  in parallel, expected to fail until M004/M005/M008 land.
- M008 after M004+M005; M009 after M008; M010/M011 any time after their
  targets exist; M012 last.
- Suggested order for a solo run: M001 → M002 → M003 → M006+M007 (write
  failing) → M004+M005 → M008 → M009 → M010+M011 → M012.

### Phase D

- Unscheduled. D001 blocks D002/D004; D005 blocks D006; D008 and D009
  are independent; D009 requires its own spec round first.

---

## Notes

- The only pre-existing engine file modified in MVP-0 is
  `scripts/first-100.ts` (M002, import-path change pinned by existing
  tests) plus additive router rows in `server/app.ts` (M008).
- "next" (`n`) advances without recording a decision; the prospect is
  never lost and returns before the queue reports complete — MVP-0
  commits to that guarantee only, not to full skip-tail ordering (D007).
- Decision writes are last-write-wins (FR-010); the UI never advances on
  a failed write (FR-013) — treat any advance-on-error as a defect.
- Commit after each task or logical group; never push to main without
  approval (project Development Workflow).
