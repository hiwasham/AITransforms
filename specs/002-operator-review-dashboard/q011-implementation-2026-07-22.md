# Q011 rejection-reason capture — implementation note (2026-07-22)

Built unattended per the CEO plan review `specs/001-rule-of-100-outreach/review-2026-07-18-ceo-plan-review.md` (decisions D1–D13). Branch `feature/002-rejection-reason` off `feature/002-operator-review-dashboard`. All work verified with the engine's vitest suite (`--pool=forks`; the default threads pool hangs on PGLite in this environment). **Nothing pushed.**

## What shipped (T-001 … T-008)

| Task | File(s) | What |
|---|---|---|
| T-004 schema (D5) | `src/db/schema.ts` | `rejection_reason TEXT CHECK(...)` in CREATE + idempotent `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`; NULL passes CHECK. Test: `tests/unit/review-schema.test.ts` (reopen-durability + CHECK rejects out-of-enum). |
| T-005 repo (D11/D12) | `src/domain/review/review-package.ts` | `setRejectionReason` = atomic `UPDATE ... WHERE id=$1 AND decision='rejected'` (no read-then-write race, Codex #1); `recordDecision` now clears `rejection_reason` on every decision write (D11). `RejectionReason` type + `REJECTION_REASONS`. |
| T-006 route (D3) | `src/api/review/packages/[id]/rejection-reason/route.ts`, wired in `src/server/app.ts` | `POST .../rejection-reason {reason}`; 200/400/404/409; existence-probe disambiguates 404 vs 409; logs `{id, reason}` only. 7 new contract cases in `tests/contract/review-api.test.ts` incl. clear-on-redecide (D11) and last-write-wins re-tag (Codex #4). |
| T-007 UI (D6/D9) | `src/ui/review.js`, `src/ui/index.html` | Reason window: opens on successful reject, closed by ANY subsequent A/R/N/ArrowLeft (D6); G/F/B/C/O keys (lowercase-only, modifier-excluded, busy-guarded) map to full words; failed POST keeps the window open (D9); textContent only. |
| T-008 import (D10) | `src/domain/review/importer.ts` | Warn line when `rowsRead>0 && added==0 && duplicates>0` (the D4 all-duplicates collision signature). Test in `tests/unit/review-importer.test.ts`. |
| T-002 M010 | `tests/integration/review-loop.test.ts` | Full operator loop over persistent PGLite + restart-durability leg (FR-009). |
| T-003 M011 | `tests/unit/review-isolation.test.ts` | Mechanical guards: no innerHTML-family WRITE sinks under `src/ui/`; review domain/API never import the workflow/prospect layer (FR-018). |
| T-001 docs (D4/D7/D8/D13) | `specs/001-rule-of-100-outreach/tasks.md`, `recovery-plan-first-100.md` | Q007 text corrected: fresh-10 convention, `added==10` proof, source_name cohort, **binary threshold PASS ≥6/10 / FAIL ≤5/10** (was undefined at exactly 5/10). |

## What is deliberately NOT done

- **T-009 (the combined M012 + Q007 operator session)** — this is a *human* gate: a real operator reviews 10 fresh prospects by keyboard and, on PASS, sends the first 10 by hand. It cannot be run unattended and it sends real outreach. It is the natural stopping point; everything it depends on is now built and green.
- The UI keydown logic (T-007) has no unit test — `review.js` is a browser IIFE with no existing jsdom harness in this repo, matching how the pre-existing A/R/N/ArrowLeft logic is also only statically guarded (M011) + manually verified. The reason-window behaviour should be eyeballed during the T-009 session.
- Nothing pushed; `main` untouched; this is a child branch for easy review or discard.

## Verify it yourself

```bash
cd outreach-engine   # from a checkout of feature/002-rejection-reason
CI=true npx vitest run --pool=forks   # full suite (threads pool hangs on PGLite here)
npm run typecheck                      # tsc --noEmit, clean
```
