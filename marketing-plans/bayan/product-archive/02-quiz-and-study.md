# 02 — Quiz & Study

Source: `pages/nursing__dashboard.txt`, `pages/study-plan.txt`,
`screenshots/quiz*.jpg`, `screenshots/study-plan.jpg`. Quiz setup and study-plan
pages have **no dedicated `/api/*`** — config is client-side / in page props.

## Quiz setup

- **Modes:** Adaptive (default), plus a **Mock Exam (100 Qs)** entry.
- **Length:** 5 / 10 / 15 / 20 / 30 / 50 / Custom.
- **Question pool filter:** All · New Only · Previously Wrong · Bookmarked.
- **Specialty focus:** 16 filter chips (specialty-scoped question selection).
- Quick-start chips on the dashboard (5/10/15/20) launch straight into a set.
- No negative marking; format mirrors the real exams (4 options A–D).

## Study-plan builder (`/study-plan`)

"Pick your exam and date, and we build a personalized schedule." Target-exam
dropdown captured live:

```
OMSB Part 1 (IM)     OMSB Part 2 (IM)     OMSB Licensing Exam
Arab Board (IM)      SCFHS (IM)           MRCP(UK) Part 1
ABIM (IM)            OEN (Omani Nursing Exam)   SNLE (Saudi Nursing)
```

So one product spans **postgraduate boards** (OMSB / Arab Board / SCFHS / MRCP /
ABIM) and **nursing licensure** (OEN / SNLE) from the same planner.

## Exams covered (nursing track, from the dashboard)

`OEN (Oman) · SNLE (Saudi) · DHA (Dubai) · HAAD (Abu Dhabi) · QCHP (Qatar) ·
Prometric · NCLEX-RN`

> "All exams share the same 7 clinical domains. Format: 100–150 MCQs · 4 options
> (A–D) · 2–3 hours · No negative marking. **One question pool covers all exams.**"

This "one pool, every Gulf exam" claim is the core product thesis and is stated
verbatim in-product — safe to use in marketing.

## The 7 nursing clinical domains (with exam weightings)

Live from the dashboard's Exam Domain Progress block:

| # | Domain | Weight |
|---|---|---|
| 1 | Adult Health | 30% |
| 2 | Principles of Care | 20% |
| 3 | Community & Gerontology | 15% |
| 4 | Maternal Health | 10% |
| 5 | Child Health | 10% |
| 6 | Mental Health | 10% |
| 7 | EBP & Research | 5% |

The dashboard tracks per-domain accuracy against these weights and nudges the
learner toward uncovered domains ("7 domains not yet covered — start with Adult
Health").

## Answer → results flow (from Hiwa's manual notes; NOT live-captured)

Onboarding uses a diagnostic (e.g. a STEMI quiz). In a quiz: pick an option →
immediate correct/incorrect feedback → an **answer-explanation** panel with tabs
**Explanation / Deep Dive / References**, then a **results screen** at set end.
This matches the reviewer-side rendering in [04](04-review-qa-pipeline.md).

**GAP:** live capture of answer submission + the results screen is a mutation
(writes attempt history) and was not performed. See GAPS.md.
