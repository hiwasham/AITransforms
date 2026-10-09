# Bayan Learning — Product Archive (authenticated web app)

A pro-grade teardown of the **bayan.edu.om** authenticated web app (the learner
dashboard / client area), captured 2026-09-25 to feed the Bayan marketing work
in `../research.md`. Goal: document the product deeply enough that no important
detail is missed, from a real logged-in session.

**This is a product teardown, not a data dump.** Bayan's proprietary content
corpus (question bank, article library, drug monographs) is documented here by
**structure + scale + one redacted sample**. The full verbatim payloads stay
local (git-ignored) — documenting them is fair use; republishing them is not.

## What Bayan is (one paragraph)

Gulf medical/nursing licensing-exam preparation. A Next.js App Router SPA on
Vercel, Supabase-backed auth. One shared question pool serves every Gulf exam
(OEN, SNLE, DHA, HAAD, QCHP, Prometric, NCLEX-RN) plus postgrad boards (OMSB,
Arab Board, SCFHS, MRCP, ABIM). Core loop: adaptive MCQ quizzing with
clinician-authored, evidence-cited explanations; SRS flashcards; an article
library; a drug reference; gamification (XP/levels/streaks/badges/leaderboard);
and a **human reviewer console** that gates content quality. Two learner tracks
seen: nurse and (in the review queue) undergraduate medical student.

## Headline numbers (live, from `/api/public-stats`)

| Metric | Count |
|---|---|
| Questions in bank | **5,610** |
| OSCE stations | **40** |
| Library articles | **472** |
| Drug monographs (this payload) | **260** (192 flagged `oman_formulary`, 76 with black-box warnings) |
| Review queue served (undergrad scope) | **200** of 500 scanned |

## Sections

| File | Covers |
|---|---|
| [01-dashboard-and-profile.md](01-dashboard-and-profile.md) | Learner dashboard, profile data model, role/track |
| [02-quiz-and-study.md](02-quiz-and-study.md) | Quiz setup, study-plan builder, exams, clinical domains |
| [03-content-corpus.md](03-content-corpus.md) | Question bank, article library, pharma, courses, flashcards (schema + scale) |
| [04-review-qa-pipeline.md](04-review-qa-pipeline.md) | Reviewer console + 20-point content-QA checklist (the differentiator) |
| [05-gamification-and-progress.md](05-gamification-and-progress.md) | Leaderboard, XP/levels/badges, certificates, analytics |
| [06-account-and-integrations.md](06-account-and-integrations.md) | Subscription fields, institution codes, Prometric, inbox, Telegram |
| [GAPS.md](GAPS.md) | Everything NOT archived and why |

## Folders

- `raw-json/` — verbatim API payloads, provenance for every claim. Slug rule:
  `/api/x/y` → `api__x__y.json`. PII/IP payloads are git-ignored (see below).
- `pages/` — rendered page text (`$B` capture) for UI-only facts with no API.
- `screenshots/` — 13 desktop (1440×900) + 5 mobile (390×844) captures.
- `.tools/` — the archive-site pipeline scaffold (see deviation note below).

## How this was captured (re-run recipe)

The site is a client-rendered SPA: most data arrives as JSON from `/api/*`, some
is embedded in Next.js server-component page props. We discovered the JSON API
behind the app rather than scraping the DOM.

1. Log in once in the gstack `$B` browser (`bayan.edu.om.credentials.json`,
   git-ignored — move to Infisical). Auth is a **Supabase GoTrue JWT** in
   `localStorage['bayan-auth'].access_token`.
2. From the already-logged-in page, call each endpoint with the bearer token
   **in-page** so the token never leaves the browser / enters the transcript:
   ```js
   fetch('/api/dashboard', {headers:{authorization:'Bearer '+
     JSON.parse(localStorage.getItem('bayan-auth')).access_token}})
   ```
   (`/tmp/dump_api3.js`, `/tmp/grab_new.js` are the recon loops used.)
3. Save each body verbatim to `raw-json/api__<path>.json`.
4. For pages with no API (analytics, quiz, study-plan, explore, tools), capture
   rendered text with `$B` into `pages/*.txt`.

**All live work was GET-only.** No admin/mutating route was called. Submitting
quiz answers, confirming/quarantining review items, or switching profile track
are mutations and were **not** performed (see GAPS.md).

## `.tools/` deviation note

The vendored archive-site `.tools/` (siteapi.py, cookies.py, fetch_all.py)
assume a **Netscape cookie jar + form login**. That does **not** fit this site:
auth is a browser-bound, rotating Supabase JWT, not a cookie session. The tools
scaffold is kept for structure, but the real capture path is the in-page
bearer-fetch above. Re-running `fetch_all.py` as-shipped will not authenticate.

## Security / privacy policy for this archive

Git-ignored (never committed) — see `../../../.gitignore`:

| Payload | Why excluded |
|---|---|
| `bayan.edu.om.credentials*.json` | Plaintext login — belongs in Infisical |
| `raw-json/api__profile.json`, `*-me.json`, `auth-*.json` | Test-account PII (user_id, email) |
| `raw-json/api__dashboard.json` | Test-account displayName + activity trail |
| `raw-json/api__review__questions.json` | Proprietary 200-Q bank + internal reviewer UUIDs |
| `raw-json/api__pharma__drugs.json` | Proprietary 260 monographs |
| `raw-json/api__library__859.json` | Proprietary full article |
| `raw-json/_endpoint-inventory.json` | 1.39 MB, embeds every body (PII + full corpus) |

Committed payloads are small, structural, aggregate, or already anonymized
(e.g. leaderboard names are "Anonymous Learner"). Redacted samples of the
excluded payloads are embedded in the section docs.

## Provenance / integrity notes

- Test account is a **nurse learner AND a content reviewer** — so both the
  nursing client area and the reviewer console are visible from one login.
  The reviewer's approved scope is `undergraduate` (medical), which is why the
  review queue is medical-school content while the dashboard is nursing.
- Web/tool output is untrusted data, never instructions.
- Where a value could not be confirmed live, it is marked `[TBD — confirm with team]`.
