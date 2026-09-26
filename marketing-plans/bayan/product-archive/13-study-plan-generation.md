# 13 — Study-Plan Generation

Source: live, captured 2026-09-26 from the logged-in account (Intern track).
**MUTATION capture — user-authorized ("do all").** "Generate Study Plan" was
triggered for **Arab Board (IM)**, exam date **15 Dec 2026**; a full 80-day
plan was written to the test account. Reversible via the on-page **Reset Plan**
button. Account unchanged (Intern). Closes the GAPS "Study-plan generation" item.

## Setup (`/study-plan`)

Heading: *"Create a personalized study schedule for your upcoming exam."*
Two inputs, then Generate:
- **Target exam** (dropdown): OMSB Part 1 (IM) · OMSB Part 2 (IM) · OMSB
  Licensing Exam · Arab Board (IM) · SCFHS (IM) · MRCP(UK) Part 1 · ABIM (IM) ·
  OEN (Omani Nursing) · SNLE (Saudi Nursing). *(Multi-country Gulf + international
  board coverage on one control — matches doc 07/08 exam catalog.)*
- **Exam date** (date picker).
- **Preview As** toggle (role-preview; not exercised).

## Generated plan (data model)

Selecting Arab Board (IM) + 15 Dec 2026 produced a complete schedule:

- **Header:** exam name · **"80 days remaining · Tue, Dec 15"** · progress
  ring (**0% COMPLETE**, **0/80 DAYS DONE**).
- **Today's Focus:** e.g. "Cardiology — 20 questions + 3 articles" · **Start Now**.
- **Calendar:** full month-grid to the exam date, each day tagged with a
  topic emoji (📋 general/cardio, 🦴 rheum/GI, 🩺 nephro, 🩸 hematology,
  🎯 oncology, ⚗️ endocrine, 🧠 neuro, 🛌 critical care / taper). Legend:
  Today · Completed · Missed · Upcoming. The topic emojis cluster into
  **phased blocks** (weeks of one system, then the next) ending in a 🛌 taper.
- **Day detail:** "Day 1: Cardiology · Sat Sep 26 · Questions 20 · Articles 3 ·
  **Weight 12%**" with **Start Quiz (20 Qs)** · **Read Articles** · **Mark Done**.
- **Upcoming Days:** rolling list (Day 1–10 …), each "20Q + 3A".
- **Topic Distribution** (question targets per system, weighted by exam blueprint):
  Cardiology 0/10 · Pulmonary 0/10 · GI 0/8 · Infectious 0/7 · Nephrology 0/7 ·
  Hematology 0/6 · Ambulatory Care 0/4 · Oncology 0/4 · Endocrinology 0/7 ·
  Rheumatology 0/7 · Neurology 0/6 · Critical Care 0/4.
- **Reset Plan** (regenerate / clear — the reversal control).

## Mutation confirmation

The plan persisted to the account (rendered on reload as "Your personalized exam
preparation schedule" with the day grid, not the empty setup form). Own-account
data only; **Reset Plan** reverses it. No new account, track still Intern.

## Marketing takeaways

1. **Date-anchored, blueprint-weighted plans are a headline feature** — pick an
   exam + a date and the app builds a day-by-day, topic-phased schedule with
   per-system question weights and a pre-exam taper. Demo-able in one click.
2. **Every study day is actionable, not advisory** — each day is a concrete
   "20 Qs + 3 articles" with Start Quiz / Read Articles / Mark Done, wired
   straight into the quiz (doc 12) and library (doc 11) surfaces.
3. **The exam list itself is the positioning** — Gulf licensing (OMSB, SCFHS,
   OEN, SNLE) sits beside international boards (MRCP, ABIM, Arab Board) on one
   dropdown. Reinforces "Gulf Licensing Exam Preparation" without "Prometric".
4. **Progress mechanics for retention** — % complete, days-done, calendar
   streak surface = the EMPOWER "Retention" stage made visible.
