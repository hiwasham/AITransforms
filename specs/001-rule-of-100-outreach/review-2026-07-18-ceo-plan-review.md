# CEO Plan Review — Next Phase (Q007 + Q011-forward + MVP-0 close-out)

Date: 2026-07-18 · Branch: `feature/002-operator-review-dashboard` · Mode: HOLD SCOPE · Review-only (no code changed)

## Decisions (D1–D13)

| # | Decision |
|---|----------|
| D1 | Q011 (rejection-reason capture, G7/FR-021) pulled forward before the Q007 exit-gate session — both PASS and FAIL outcomes produce structured calibration data. Supersedes the 2026-07-16 recovery-plan sequencing. |
| D2 | Review mode HOLD SCOPE. Locked scope = Q007 + Q011-forward + MVP-0 close-out (M010–M012). |
| D3 | Reason write via dedicated `POST /review/packages/:id/rejection-reason` `{reason}`; 400 bad enum, 404 unknown, 409 not-currently-rejected; decision route HTTP contract untouched. Non-blocking error banner. Log `{id, reason}` only. |
| D4 | Q007 pinned to the fresh-10 path (doc-only). Same-company regeneration is deduped away by FR-002 — reviewing an empty queue was the failure mode. |
| D5 | Schema evolution: idempotent `ALTER TABLE review_packages ADD COLUMN IF NOT EXISTS rejection_reason TEXT CHECK (rejection_reason IN ('generic','false_claim','bad_fit','creepy','other'))` in `ensureSchema` + same column in CREATE for fresh DBs. Full-word values; UI maps g/f/b/c/o. Preserves first-batch decision history. |
| D6 | Reason window: `lastRejectedId` set on successful reject; cleared by ANY subsequent attempted action (a/r/n/ArrowLeft, success or failure); reason keys no-op when null. |
| D7 | Sequencing: M010+M011 → Q011 → ONE combined operator session = M012 manual SC-000 gate AND Q007 exit review, on the fresh-10 batch. Two results recorded separately in commit/PR. |
| D8 | Exit gate made binary: PASS = ≥6/10 approved without edits, FAIL = ≤5/10 (was undefined at exactly 5/10 in tasks.md and recovery plan). |
| D9 | Failed reason POST keeps the window open (banner + manual re-press); D6 clear-on-action otherwise unchanged. |
| D10 | Import prints a warn line when `rowsRead>0 && added==0 && duplicates>0` (the D4 collision signature; harmless for legitimate re-imports). |
| D11 | Decision UPDATE clears `rejection_reason` on every decision write (sharpened by Codex #3: re-reject also wipes the prior tag). HTTP contract unchanged; new contract-test case pins it. |
| D12 | "Reason ⟹ rejected" enforced at repo layer only (atomic conditional UPDATE + clear-on-decide). DB CHECK rejected — `ADD CONSTRAINT` has no idempotent form; single-writer localhost. Accepted risk. |
| D13 | Q007 cohort procedure: cohort = rows under the Q007 batch `source_name`; import MUST show `added==10` (mechanical freshness proof); gate result = decision counts over that source_name at session end, recorded verbatim in commit/PR (frozen evidence). In-session FR-010 revisions count. |

## Outside Voice (Codex 0.144.5) — 16 findings triaged

Folded in: #1 atomic conditional reason UPDATE; #3 clear-on-every-decision; #5/#6 precise window-clearing semantics; #7/#8 modifier/uppercase key handling (ignored, tested); #15 separate M012/Q007 result recording. Confirmations: #12 (ALTER+CHECK works in PGLite; NULL passes CHECK), #14 (single-process boot serializes ensureSchema). Accepted risk: #13 (IF NOT EXISTS won't repair a wrong-typed pre-existing column). Escalated → D12 (#2), D13 (#9/#10/#16/#11). Rejected: #4 (clearing window after successful tag would block typo correction; last-write-wins within the window is deliberate).

## Implementation Tasks (post-approval)

- T-001 (docs) Fix Q007 text in `specs/001-rule-of-100-outreach/tasks.md` + `recovery-plan-first-100.md`: fresh-10 convention (D4), binary threshold (D8), cohort procedure (D13), combined-session + separate results (D7).
- T-002 (M010) Integration test `tests/integration/review-loop.test.ts` as specced (incl. restart-durability leg, FR-009).
- T-003 (M011) Mechanical guard test `tests/unit/review-isolation.test.ts` (no innerHTML under `src/ui/`; review-module isolation FR-018).
- T-004 (schema) `rejection_reason` column per D5 + schema test: boot on existing datadir gains the column, data intact.
- T-005 (repo) `setRejectionReason` = atomic `UPDATE … WHERE id=$1 AND decision='rejected'` (rowcount 0 → 409 signal); decision write clears reason on every decision (D11).
- T-006 (api) Reason route, factory pattern mirroring `decision/route.ts`; 200/400/404/409; log `{id, reason}` only; contract tests incl. clear-on-redecide.
- T-007 (ui) `review.js`: reason window per D6/D9; lowercase-only, modifier-excluded, busy-guarded keys; transient hint + "tagged: X" confirmation from client-side map; textContent only; tests for both branches of every new conditional.
- T-008 (import) D10 warn line + test.
- T-009 (session) Combined M012+Q007: verification suite diff vs M001 baseline; import fresh-10 (`added==10` required); keyboard review; record MVP-0 close-out AND Q007 verdict separately. PASS ≥6/10 → append approved to golden set, send first 10 by hand. FAIL → STOP, re-plan from reason data.

Order: T-001 → T-002+T-003 → T-004 → T-005 → T-006 → T-007 → T-008 → T-009.

## Error/Rescue Registry

| Failure | Rescue |
|---|---|
| Reason POST network failure | Banner; window stays open; manual re-press (D9) |
| Reason POST 409 (state moved) | Banner; no retry — state is authoritative |
| Reason POST 400 (bad enum) | Impossible from UI map → banner + bug signal |
| Decision POST failure | FR-013: never advance (existing) |
| All-duplicates import | D10 warn line; regenerate with fresh prospects |
| Exactly 5/10 outcome | FAIL per D8; STOP |
| ALTER fails at boot | Loud crash; fix schema, reboot (no partial state) |
| Q007 FAIL | STOP; Q011 reason data drives re-plan (recovery plan Stage A) |

## Failure Modes / Accepted Risks

1. Direct DB write could violate reason⟹rejected (D12; single-writer localhost).
2. `IF NOT EXISTS` won't repair a malformed pre-existing column (Codex #13; hand-mutated dev DBs only).
3. A reason tag is lost if the operator acts before re-pressing after a failed POST (optional data; acceptable).
4. In-window tag overwrite is allowed by design (rejected Codex #4 — enables typo correction).

## NOT in scope (HOLD SCOPE)

Free-text note on `other` · import supersede mode · migration framework · DB CHECK constraint · stats command/endpoint · Q008/Q009/Q010/Q012 · dashboard auth · telemetry.

## Already exists (verified on disk)

MVP-0 M001–M009: review queue + keyboard loop + FR-013 stay-on-failure + Q006 approve backstop (409 not_send_ready) + idempotent CSV importer + textContent-only rendering + localhost path-confined server. First-100 gated generator (Q001–Q005). Golden reject set 2026-07-16.

## Dream-state delta (Stage B+, not now)

Rolling-20 SC-008 analytics over rejection reasons · optional note on `other` · exemplar mining from golden-approved (Q008) · stats surface.

## Flow (reject → tag)

```
r keypress ──▶ POST decision reject ──ok──▶ advance; lastRejectedId=id; show hint
                                   └─fail─▶ stay (FR-013)
g/f/b/c/o ──▶ window null? no-op
          └─▶ POST rejection-reason ──ok──▶ "tagged: X"; window stays (overwrite allowed)
                                    └─fail─▶ banner; window stays open (D9)
any a/r/n/◀ attempt ──▶ window cleared (D6, Codex #5/#6)
decision write (any) ──▶ SQL clears rejection_reason (D11)
```

Stale diagram audit: no pre-existing diagrams in repo → N/A. TODOS.md: does not exist → no updates.
