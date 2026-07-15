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

**Status**: NOT STARTED. Phase M begins on operator approval of this
file; Phase D begins only on a separate, later operator decision — its
tasks are a parking lot, not a queue.

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

- [ ] M001 Create branch `feature/002-operator-review-dashboard`; run the
      full existing verification (engine `npm run test` + `npm run
      typecheck`; site `npm run lint`, `npx tsc --noEmit`, `npm run
      test`, `npm run build`) and save the output as the SC-006 baseline

- [ ] M002 Extract the shared CSV helpers (`parseCsvRows`, `csvEscape`)
      from `outreach-engine/scripts/first-100.ts` into
      `outreach-engine/src/lib/csv.ts` and re-import them in
      `first-100.ts`; the existing `tests/unit/first-100.test.ts` must
      pass **unchanged** — the Principle I pin for the only pre-existing
      file this feature touches

- [ ] M003 Add the `review_packages` table to
      `outreach-engine/src/db/schema.ts` per plan.md §Data Model as
      amended by §MVP-0 Build Scope: no `review_imports` table;
      `source_name` text column instead of `import_id`; reserved
      `source` column (default `'first100_csv'`); `dedup_key` unique
      index; CHECK constraint on `decision`. Additive only (depends on
      M001)

- [ ] M004 [P] Implement the `ReviewPackage` repository — create,
      getById, count-reviewed/total, decision write (last-write-wins,
      FR-010) and passed-over marking — in
      `outreach-engine/src/domain/review/review-package.ts`, and the pure
      review-order module — next = first pending never-passed-over by
      `position`, then passed-over ones; a passed-over prospect is never
      lost and reappears before the queue reports complete (spec §MVP-0
      skip semantics) — in
      `outreach-engine/src/domain/review/review-order.ts` (depends on
      M003)

- [ ] M005 [P] Implement the importer — CSV text via `src/lib/csv.ts` →
      normalized packages; `dedup_key` idempotency (FR-002: re-import
      adds nothing, resets nothing); `<<paste video link…>>` → null;
      `needs_research` carried to `generator_flag`; source `approved`
      carried to `decision='approved'` (FR-003); malformed rows skipped
      and reported by row number in the returned summary (no persistence
      of the summary — import history is deferred) — in
      `outreach-engine/src/domain/review/importer.ts` (depends on M002,
      M003)

- [ ] M006 [P] Unit tests for M004/M005: importer mapping + flag carry +
      malformed tolerance + same-file dedup; `dedup_key` normalization
      edges (case, whitespace, `www.`, trailing slash, no-URL fallback);
      review-order matrix (fresh queue, advance, passed-over return,
      never-lost, all-decided ⇒ null, re-decide) — in
      `outreach-engine/tests/unit/review-importer.test.ts` and
      `outreach-engine/tests/unit/review-order.test.ts` (write first,
      expect fail until M004/M005 land)

- [ ] M007 [P] Contract tests for the four MVP-0 endpoints: `POST
      /review/imports` (201 summary shape incl. duplicates + malformed;
      double-import ⇒ `added: 0`, zero state change — SC-004's assertion
      lives here now); `GET /review/packages/next` (full package +
      `reviewed`/`total` counts; exhausted ⇒ `200 { package: null }`);
      `GET /review/packages/:id` (404 unknown); `POST
      /review/packages/:id/decision` (`approve|reject|next` effects,
      inline `next` in the response, last-write-wins re-decide, invalid
      action ⇒ 400) — in
      `outreach-engine/tests/contract/review-api.test.ts`

- [ ] M008 Implement the four route factories —
      `outreach-engine/src/api/review/imports/route.ts`,
      `.../packages/next/route.ts`, `.../packages/[id]/route.ts`,
      `.../packages/[id]/decision/route.ts` — and register them plus
      path-confined static serving of `ui/` (`GET /`, `GET /ui/*`,
      traversal rejected) as additive rows in
      `outreach-engine/src/server/app.ts`; structured logging per
      plan.md Observability (import summary, per-decision entries —
      identifiers only, never package text) (depends on M004, M005)

- [ ] M009 Build the review UI — one screen per prospect with all
      package fields and the `needs_research` flag; keys `a`/`r`/`n` (+
      buttons, bindings visible on-screen, FR-008); auto-advance from the
      decision response's inline `next`; do-NOT-advance on a failed write
      with a visible error (FR-013); step-back to the previous prospect
      for re-decide (FR-010); "N of M reviewed" indicator; empty-state
      (no import yet, naming the first-100 output location) and
      review-complete state; ALL text rendered via `textContent`, zero
      `innerHTML` — in `outreach-engine/src/ui/index.html` and
      `outreach-engine/src/ui/review.js` (depends on M008)

- [ ] M010 Integration test — the SC-000 loop against a fixture CSV in
      the real first-100 column shape: import → walk the queue deciding
      and passing-over via the endpoints → verify every decision
      recorded, passed-over prospects return, complete state reached;
      plus a restart-durability leg (reopen the Db on the same datadir,
      decisions intact, FR-009) — in
      `outreach-engine/tests/integration/review-loop.test.ts`

- [ ] M011 Add a mechanical guard test: no
      `innerHTML`/`insertAdjacentHTML`/`document.write` under
      `outreach-engine/src/ui/`, and no import of the workflow
      state machine / dispatch / webhook / cadence modules under
      `src/{domain,api}/review/` (FR-018) — in
      `outreach-engine/tests/unit/review-isolation.test.ts`

- [ ] M012 Verify and close MVP-0: rerun the full verification suite and
      diff against M001's baseline (identical-or-green, SC-006/FR-019);
      then the manual SC-000 gate on the operator's machine — import the
      real `out/first-100-2026-07-14.csv` (or today's), review 10 real
      prospects end to end by keyboard, confirm the CSV was never opened;
      record the result in the PR/commit message (Verify, Don't Claim)

**Checkpoint / STOP**: MVP-0 done. The operator reviews real prospects
without the CSV. Nothing below starts without a new operator decision.

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
