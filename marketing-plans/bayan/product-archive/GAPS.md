# GAPS — what is NOT archived, and why

Every known gap in this teardown, with the cause. Nothing silently dropped.

## Deferred by scope (user decision)

| Gap | Cause |
|---|---|
| **Signup / onboarding flow** | Explicitly deferred by Hiwa. URL: `/login?mode=signup&redirect=%2Fonboarding`. Onboarding uses a diagnostic (STEMI quiz) per Hiwa's notes; not live-captured. |
| **Native mobile apps** (iOS `id6792406710`, Android `com.bayanai.bayan`) | Documented as "parts of the product" but native-only teardown needs an emulator/device. Deferred. The web app is the same Supabase backend. |

## Blocked by the GET-only / no-mutation rule (need explicit confirmation)

| Gap | Why it's a mutation |
|---|---|
| **Answer submission + results screen** (live) | Writes attempt history / XP. Flow documented from Hiwa's notes only. |
| **Student & Resident dashboards** | Account track is nurse. Seeing other role dashboards needs a profile track switch = write. A `Preview As` toggle may be non-mutating but was **not clicked** (unverified). |
| **Confirm Quality / Quarantine** (reviewer) | Writes a review decision. Console + checklist captured read-only; the action buttons were not pressed. |
| **Study-plan generation** | "Generate Study Plan" likely writes a plan to the account. Not triggered. |
| **Flashcard review / drug/course purchase** | State-changing. Not triggered. |

## Not deep-captured (low marketing value / no API)

| Gap | Note |
|---|---|
| **Calculators / Tools hub** | Client-side, no API. Nav confirmed; individual tools not enumerated. |
| **Explore Topics page** | No dedicated API (page props). Not text-captured. |
| **Article catalog (all 472)** | No listing endpoint (`/api/library/list` → 400). Only article #859 captured as the schema exemplar; catalog lives in page props. |
| **OSCE stations (40)** | Counted via `/api/public-stats`; no station-detail endpoint probed. |
| **Full question bank (5,610)** | Only the 200-item undergrad **review queue** is reachable via API from this account. Nursing-scope questions not enumerated. |
| **Subscription plan names / prices** | Fields exist; values are `[TBD — confirm with team]`. |

## Method deviation (documented, not a gap in coverage)

- The vendored `.tools/` (Netscape cookie jar + form login) does **not** fit this
  site's browser-bound rotating Supabase JWT. Real capture = in-page bearer-fetch
  from the logged-in `$B` session. `fetch_all.py` as-shipped will not auth. See
  README.md "`.tools/` deviation note".

## Follow-ups (not requested this session — confirm before starting)

- ~~Move `bayan.edu.om.credentials.json` into Infisical~~ **DONE (2026-09-25)** —
  login now lives in Infisical under prefix `BAYAN_EDU` (project "Personal", `dev`).
  Load it with `source <(python3 ~/.infisical/creds-env.py BAYAN_EDU)` →
  `BAYAN_EDU_URL/_USERNAME/_PASSWORD`. The local plaintext file was deleted;
  Hiwa's separate `-hiwa.json` browsing notes remain local + git-ignored.
- Rephrase leadership/strategist "audit questions" into a `master-prompt.md`.
- Update stale `progress.md` checkboxes.
