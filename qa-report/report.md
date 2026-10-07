![[deepseek_html_20261003_f32e4e.html]]
# Bayan Learning — Product QA & Improvement Report

**For:** BayanLearning CEO / Product Manager
**Prepared by:** External review (Hiwa / AITransforms)
**Target:** https://www.bayan.edu.om (authenticated web app)
**Date:** 2026-09-28
**Method:** Live headless-browser walkthrough of the logged-in product (Postgrad/Internal-Medicine account, reviewer role). Read-only. No data was submitted, deleted, purchased, or changed.

---

## Executive summary (read this if nothing else)

The product is genuinely good where it counts — the clinical calculators compute correctly against 2024 guidelines, content is human-reviewed, and onboarding leads with a real case instead of a signup wall. But two silent, high-impact defects are costing you money and trust **right now**:

1. **You are flying blind on marketing data.** Your own Content Security Policy blocks every Google Analytics 4 and Google Ads conversion event before it leaves the browser. Ad spend is being optimized against zero conversion signal.
2. **Core screens show wrong data.** Two authenticated database queries return HTTP 400, so the dashboard reports "no sessions / 0 questions today" to a user who has answered questions, and the OSCE page can't load its real station list.

Neither is visible as a crash, so they can persist for months. Both are fixable in hours, not weeks.

**Overall product health: 72 / 100** — solid core, dragged down by broken telemetry and schema-drift 400s on primary screens.

---

## Status table

| #   | Finding                                                                       | Severity   | Type                    | Status              |
| --- | ----------------------------------------------------------------------------- | ---------- | ----------------------- | ------------------- |
| 1   | CSP blocks all GA4 + Google Ads conversion tracking                           | 🔴 HIGH    | Bug — revenue/marketing | ⚠️ needs a decision |
| 2   | Two authenticated queries return HTTP 400 (quiz history + OSCE stations)      | 🔴 HIGH    | Bug — data integrity    | ⚠️ needs a decision |
| 3   | Cross-track data bleed: nursing stats inside an IM board-prep profile         | 🟠 MEDIUM  | Bug — data model        | 💬 evidence below   |
| 4   | "Exam readiness" number disagrees between Dashboard (39%) and Analytics (32%) | 🟠 MEDIUM  | Bug — consistency       | 💬 evidence below   |
| 5   | Drug-monograph count differs across 3 pages (190+ / 100+ / 260)               | 🟡 LOW     | Content/consistency     | 💬 evidence below   |
| 6   | Library cards show "0 sections"; inconsistent difficulty casing               | 🟡 LOW     | Polish                  | 💬 evidence below   |
| —   | Clinical calculators are accurate and well-built                              | ✅ strength | —                       | verified            |

**Riskiest item:** #1. Every day it runs, Google Ads is bidding with no conversion feedback and your GA4 funnel is empty — you cannot tell which channel produces paying subscribers. This is the one to fix first.

---

## 🔴 Finding 1 — Your CSP silently blocks GA4 and Google Ads conversion tracking

**What happens:** The site sends analytics/conversion beacons to Google's real endpoints, but the `connect-src` Content Security Policy directive doesn't allow them, so the browser refuses every request. Confirmed on both the public landing page and inside the authenticated app.

**The CSP as shipped:**
```
connect-src 'self' https://*.supabase.co https://api.openai.com
  https://www.google-analytics.com https://pubmed.ncbi.nlm.nih.gov
  https://www.google.com https://googleads.g.doubleclick.net
  https://static.cloudflareinsights.com
```

**Endpoints being blocked (observed in console):**
| Blocked endpoint | What it carries |
|---|---|
| `region1.analytics.google.com/g/collect` | GA4 `page_view`, `scroll`, `form_start` events (regional EU collect) |
| `region1.analytics.google.com/measurement/conversion` | Google Ads conversion (`ads_conversion_PAGE_VIEW_1`) |
| `stats.g.doubleclick.net/g/collect` | GA4 signals / remarketing |
| `ad.doubleclick.net/ccm/s/collect` | Google Ads conversion linker (`AW-529849606`) |

The CSP allows `www.google-analytics.com`, but GA4 does **not** send there — it sends to the regional `region1.analytics.google.com` subdomain, which is not whitelisted. GA property `G-YNPH01TKYD`, Ads account `AW-529849606`.

**Business impact:** GA4 reports and Google Ads conversion optimization receive **nothing** from the web app. You're paying for clicks and optimizing bids against empty conversion data.

**Fix (one line):** add the Google analytics/ads wildcards to `connect-src`:
```
https://*.analytics.google.com https://*.google-analytics.com
https://*.g.doubleclick.net https://*.doubleclick.net
```
Then verify in GA4 Realtime that `page_view` and conversion events arrive. Est. **~30 min** including deploy + verify.

---

## 🔴 Finding 2 — Two authenticated database queries return HTTP 400

Both are Supabase/PostgREST `select=` queries that fail with 400 on primary screens. They fail silently (no crash), so the UI just shows empty/placeholder state.

**2a — Dashboard quiz history (`quiz_sessions`)**
```
GET /rest/v1/quiz_sessions?select=id,started_at,completed_at,total_questions,
    correct_count,session_type,exam_mode,specialty&user_id=eq.<uid>
    &order=started_at.desc&limit=10   →  400
```
**User-visible contradiction:** the dashboard shows *"Recent Sessions — No sessions yet"* and *"0 Questions Today"*, while the same dashboard's aggregate panel shows *"10 Total Questions, 40% Accuracy."* The learner's own history is invisible because this query dies.

**2b — OSCE stations (`osce_stations`)**
```
GET /rest/v1/osce_stations?select=id,title,station_type,specialty,difficulty,
    duration_minutes,status,created_at,education_level,scenario_preview,
    marking_criteria_count&status=eq.published
    &education_level=eq.undergraduate&order=created_at.desc   →  400
```
Two problems here: the query **400s**, and it filters `education_level=eq.undergraduate` for a **postgraduate** account (wrong scope). The page falls back to partial content instead of the real station list.

**Likely root cause (hypothesis — not confirmed):** both are PostgREST 400s on explicit column lists, which usually means the client is selecting columns the current schema no longer has (schema drift) — candidates: `session_type` / `exam_mode` on `quiz_sessions`, `marking_criteria_count` / `scenario_preview` on `osce_stations`. I did not read the exact PostgREST error body (that needs the anon API key, which I did not extract). Your team can confirm instantly from the Supabase logs or by running the select in the SQL editor.

**Business impact:** learners see a dashboard that says they've done nothing → demotivating, looks broken, undercuts the retention/streak mechanic that drives your subscription renewals.

**Fix:** align the client `select` lists with the live schema (or add the missing columns), and pass the correct `education_level` for the user's track. Est. **1–3 hours** depending on cause.

---

## 🟠 Finding 3 — Nursing data bleeds into an Internal-Medicine board-prep profile

On a Postgrad / "Internal Medicine Board Prep" account (training level `intern`), the **By Specialty** breakdown mixes nursing categories into a physician track:

> Critical Care 50% · Neurology 0% · Nephrology 0% · **Adult Health 100%** · **Mental Health 100%** · **Principles of Care 100%** · Internal Medicine 0%

"Adult Health," "Mental Health," and "Principles of Care" are NCLEX/nursing categories — they shouldn't appear inside an IM board-prep dashboard at all. Historical answers from one track are being counted under another track's taxonomy.

Also, those `100%` figures come from a single question each (tiny sample) and are shown with no sample-size context, so the learner sees "100%" next to "40% overall" with no way to reconcile them.

**Impact:** erodes trust in the analytics and confuses the blueprint-coverage story you're selling. **Fix:** scope specialty stats to the active program's taxonomy, and suppress/annotate percentages below a minimum n (e.g. "1/1").

---

## 🟠 Finding 4 — "Exam readiness" number contradicts itself between pages

Same account, same session:
- **Dashboard:** "Blueprint Coverage — **39% Ready**"
- **Analytics:** "**32%** exam-ready" and "Exam Readiness **32%**"

Two different readiness numbers on two screens is a credibility problem for a metric you position as the core value ("are you ready for the exam?"). **Fix:** compute it once, server-side, and read it everywhere.

---

## 🟡 Finding 5 — Drug-monograph count differs on three surfaces

| Surface | Claims |
|---|---|
| Landing page | "190+ Drug Monographs" |
| Dashboard "Discover" card | "100+ drug monographs" |
| Actual `/pharma` page | "**260** drug [monographs]" |

You have 260 but advertise 100+ and 190+ elsewhere — under-selling your own corpus and looking inconsistent. **Fix:** single source of truth, show the real number (260). ~15 min.

---

## 🟡 Finding 6 — Library card polish

On `/library`, every article card reads **"0 sections"** (e.g. "3 min · 0 sections · intermediate · Verified") — the section count is either broken or shouldn't be shown. Difficulty casing is also inconsistent ("intermediate" vs "Intermediate") across cards. Cosmetic, but it's the first screen a paying learner browses.

---

## ✅ What's genuinely strong (keep/showcase)

- **Clinical calculators are accurate.** Tested CHA₂DS₂-VASc at maximum inputs → correctly returned **9/9**, "8 excluding sex," **17.4% annual stroke risk**, high-risk pathway, DOAC recommendation, and a **2024 ESC AF guideline** citation. This is real clinical-grade work and a differentiator worth marketing harder (22 calculators, 8 categories).
- **Content carries a human "Verified" badge** — reinforce this; it's a trust moat vs. generic AI qbanks.
- **Diagnostic-first onboarding** ("Let's see what you know" → inferior-STEMI case) is a strong, low-friction hook.
- **No hard crashes.** All primary routes return 200; the app is stable under automation.
- **Performance is acceptable** (~3.0s full load, ~2.0s to interactive) with room to trim.

---

## Recommended priority order

1. **Fix the CSP (Finding 1)** — ~30 min, immediately restores marketing/ads visibility. Do this today.
2. **Fix the two 400 queries (Finding 2)** — 1–3 hrs, restores correct history + OSCE data on core screens.
3. **Scope specialty stats to the active track + hide tiny-n percentages (Finding 3).**
4. **Single-source the readiness % and drug count (Findings 4, 5).**
5. **Library polish (Finding 6)** — batch with the next UI pass.

## Scope & method notes

- Review was **read-only**: no quiz was submitted, no study plan generated, no reviewer decision made, no purchase attempted. (Prior authorized sessions in `product-archive/` already documented those flows working.)
- Findings 1, 2, 5, 6 are directly observed. Finding 2's root-cause is a labelled **hypothesis** pending a look at the Supabase error body / logs.
- Evidence screenshots: `qa-report/screenshots/` (01-landing, 02-dashboard, 03-analytics, 04-osce).
