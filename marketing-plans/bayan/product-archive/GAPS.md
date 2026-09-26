# GAPS — what is NOT archived, and why

Every known gap in this teardown, with the cause. Nothing silently dropped.

## Deferred by scope (user decision)

| Gap | Cause |
|---|---|
| ~~**Signup / onboarding flow**~~ **CLOSED (doc 10)** | Captured read-only 2026-09-26 (Hiwa-authorized). `/login?mode=signup&redirect=%2Fonboarding` → for an authed user redirects to `/onboarding`: a diagnostic-first flow ("Welcome to Bayan — Let's see what you know") leading with an inferior-STEMI MCQ, then a write-gated profile-setup step. No account created; `training_level` re-verified `intern` (unchanged). |
| **Native mobile apps** (iOS `id6792406710`, Android `com.bayanai.bayan`) | Documented as "parts of the product" but native-only teardown needs an emulator/device. Deferred. The web app is the same Supabase backend. |

## Blocked by the GET-only / no-mutation rule (need explicit confirmation)

| Gap | Why it's a mutation |
|---|---|
| ~~**Answer submission + results screen**~~ **CLOSED (doc 12)** | Live-captured 2026-09-26 (user-authorized "do all", MUTATION). A real 5-Q `arab_board` quiz was answered + submitted; per-question feedback (CORRECT/INCORRECT + Explanation/Deep Dive/References/👍👎/Discussion/Flag/difficulty-feedback) and the full **results summary** (score, time analysis, adaptive Level X/5, spaced-review scheduling, by-specialty breakdown, recommended articles/Explore links, WhatsApp/X share, Telegram CTA) + Review Answers mode all captured. Attempt/XP/SRS written to the test account (daily counter → 7/10, streak → 2d); track unchanged (Intern). |
| **Student & Resident dashboards** | Account track is nurse. Seeing other role dashboards needs a profile track switch = write. A `Preview As` toggle may be non-mutating but was **not clicked** (unverified). **Partial-close (doc 07):** all 11 track NAMES + the nurse-track exams/settings/history/achievements are now enumerated; the other 10 dashboards' exam sets stay `[TBD — confirm per track]`, write-gated. **Further (doc 08):** the dashboard ROUTES are now confirmed from the client config — `/student/dashboard`, `/nursing/dashboard`, `/postgrad/dashboard` (all physician/resident tracks), `/admin`; and each track's exam SCOPE is derivable from the catalog's profession/educationLevel. **CLOSED — live-confirmed (doc 07, 2026-09-26):** all 12 tracks were switched on the real account (authorized) and read back from the persisted `<select>` value; the route mapping is now empirical, not inferred — only `medical_student`→`/student/dashboard` and `nurse`→`/nursing/dashboard` are distinct, the other 10 (incl. pharmacist and family-medicine `resident`) all render an identical "Postgrad Dashboard" at `/postgrad/dashboard`. Account restored to its original **Intern** track. Only the exact per-track default `exam_targets` selection remains write-gated. |
| **Confirm Quality / Quarantine** (reviewer) | Writes a review decision. Console + checklist captured read-only; the action buttons were not pressed. |
| **Study-plan generation** | "Generate Study Plan" likely writes a plan to the account. Not triggered. |
| **Flashcard review / drug/course purchase** | State-changing. Not triggered. |

## Not deep-captured (low marketing value / no API)

| Gap | Note |
|---|---|
| ~~**Calculators / Tools hub**~~ **CLOSED (doc 09)** | Client-side, no API — enumerated read-only from `/tools` + `/tools/calculator`: 22 medical calculators (8 categories), Perioperative Risk, 150+ drug monographs, interaction checker, renal dosing, IV compatibility, 20 emergency drug cards, voice-enabled Virtual Patients, OSCE, Death Certification. |
| ~~**Explore Topics page**~~ **CLOSED (doc 11)** | Text-captured read-only: 12 specialty hubs at `/explore/<slug>`, each cross-linking questions + articles + drugs + calculators + flashcards + virtual patients (e.g. Cardiovascular = 38 drugs, 4 calculators, 10 adaptive Qs). |
| ~~**Article catalog (all 472)**~~ **CLOSED (doc 11)** | `/library` DOM lists articles as `/library/<id>` — 200 visible for the postgrad track (472 total across tracks per public-stats). Per-article metadata (category, read-time, difficulty, "Verified" human-review badge) + title sample captured; full corpus stays local (fair use). |
| ~~**OSCE stations (40)**~~ **CLOSED (doc 11)** | `/osce` taxonomy captured: 4 station types × 7 specialties × 3 difficulties, mock circuit at `/osce/circuit`, "aligned with OMSB Licensing / USMLE CS", standardized marking checklists. Station-detail not opened (starting a station may write = mutation-gated). |
| **Full question bank (5,610)** | Only the 200-item undergrad **review queue** is reachable via API from this account. Nursing-scope questions not enumerated. **Partial-close (doc 08):** per-exam question counts for all 28 catalog exams now known from the client config (e.g. USMLE Step 2 CK 316, SMLE 200, OEN 100). |
| ~~**Subscription plan names / prices**~~ **CLOSED (doc 08)** | Extracted read-only from the client JS config: 3 consumer tiers (Student $9.99/$69, Nurse $19/$129, Physician $29/$199; 30-day trial, ~43% annual save), per-seat institutional pricing (min 20 seats, 1-yr trial, via MedResearch Academy), free-tier limits (5 Q/day), and the humanitarian free-country access list. Prices are USD. |

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
- ~~Rephrase leadership/strategist "audit questions" into a `master-prompt.md`~~
  **DONE** — `marketing-plans/bayan/master-prompt.md` now holds the shared-language
  operating system (interaction style, strategic approach, resources, framework).
- Update stale `progress.md` checkboxes.
