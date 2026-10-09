![[deepseek_html_20261003_e1b604.html]]
# 07 — Training Levels, Settings & Personalization

Source: live learner-app UI (nurse test account), captured 2026-09-26 from
in-app **Settings**, **Overview**, **History**, and **Achievements** screens.
Closes part of the GAPS "tracks / settings not enumerated" item. Personal
performance figures below are trivial test-account noise (3 questions), kept
only to document the data model — not real user data.

## Training Level (profile switcher — one field, drives the whole experience)

The account's `Training Level` is a single `<select>` field (Settings → Edit
Profile) with **12 options**. It drives the whole experience — exam scope,
question pool, and which dashboard route the app lands on.

**All 12 live-confirmed 2026-09-26** by switching the field on the real
account and reading the persisted value back after reload (route captured from
the resulting dashboard). Account restored to its original **Intern** track
afterward. `value` = the option value stored on `learner_profiles.training_level`:

| # | Label | `value` | Dashboard route |
|---|---|---|---|
| 1 | Medical Student | `medical_student` | `/student/dashboard` |
| 2 | Intern | `intern` | `/postgrad/dashboard` |
| 3 | R1 Resident | `r1` | `/postgrad/dashboard` |
| 4 | R2 Resident | `r2` | `/postgrad/dashboard` |
| 5 | R3 Resident | `r3` | `/postgrad/dashboard` |
| 6 | R4 Resident | `r4` | `/postgrad/dashboard` |
| 7 | R5 Resident | `r5` | `/postgrad/dashboard` |
| 8 | Fellow | `fellow` | `/postgrad/dashboard` |
| 9 | Attending/Consultant | `attending` | `/postgrad/dashboard` |
| 10 | Nurse | `nurse` | `/nursing/dashboard` |
| 11 | Pharmacist | `pharmacist` | `/postgrad/dashboard` |
| 12 | Family Medicine Resident | `resident` | `/postgrad/dashboard` |

**Route mapping (live-confirmed):** only **3 distinct dashboards** back the 12
tracks — `/student/dashboard` (medical_student), `/nursing/dashboard` (nurse),
and `/postgrad/dashboard` (the other 10, including pharmacist and the family-
medicine `resident` value). This matches doc 08's normalizer and extends it:
**pharmacist and family-medicine both resolve to the postgrad dashboard live**,
not a dedicated pharmacy/family screen. `/postgrad/dashboard` renders an
identical "Postgrad Dashboard" heading for all 10 — the route/heading does NOT
differentiate r1…r5 / fellow / attending / intern / pharmacist / resident.

> ⚠️ **Per-track Target-Exam SETS remain onboarding/write-gated.** Switching
> `training_level` does NOT auto-populate a default `exam_targets`; that value
> is set per-user during onboarding and is not surfaced by a track switch (no
> `__NEXT_DATA__`, `/exam-prep` 404, no profile "Target Exams" panel for the
> non-nurse tracks). So the exam-scope PER track is derivable from doc 08's
> catalog by `profession`/`educationLevel`, but the exact default selection is
> still `[TBD — confirm with team]`. The nurse-track Target Exams below are the
> one set captured directly from the UI.

## Target Exams (nurse track)

Multi-country Gulf nursing licensure — strong proof for the approved
"Gulf Licensing Exam Preparation" positioning (not "Prometric"):

- **OEN** — Omani Examination for Nurses
- **SNLE** — Saudi Nursing Licensing Exam
- **DHA Nursing** — Dubai Health Authority
- **QCHP Nursing** — Qatar
- **NHRA Nursing** — Bahrain

## Settings — personalization controls

- **Lab Unit Preference:** SI Units / US-Conventional / Both.
- **Review Preferences:** 16 selectable subspecialties filter the screening
  queue (unchecked = see everything). Cardiovascular, Pulmonary,
  Gastroenterology, Nephrology, Endocrinology, Hematology, Infectious Disease,
  Rheumatology, Neurology, Oncology, Critical Care/ICU, Perioperative Medicine,
  Geriatric Medicine, Research & Statistics, General Medicine,
  Ethics & Professionalism.

## Overview screen

- **Performance by Specialty:** per-specialty accuracy bars (test account:
  adult health / mental health / principles of care).
- **Weak Areas detector:** auto-surfaces low-accuracy topics ("No weak areas
  identified yet. Keep practicing!" until enough data).

## Quiz History (data model)

Table columns: `Date | Exam | Questions | Score | Type`. Type includes
**adaptive**. Example row: `25/09/2026 | arab board | 3/3 | 100% | adaptive`.

## Achievements / Certificates

- **Milestone Path:** 100 → 250 → 500 → 1,000 → 2,500 → 5,000 questions.
- Certificates also for specialty mastery + consistent activity.
- Stats triplet: Questions / Correct / Accuracy.
- Managed at `/certificates`.

## Marketing takeaways

1. **Multi-exam Gulf coverage** is a concrete differentiator and matches the
   approved positioning — usable as a proof point.
2. **Adaptive engine + subspecialty filtering** = personalization story.
3. **Milestone/certificate ladder** = gamified retention mechanic for the
   EMPOWER "Retention" stage.
4. Physician-track exam sets are still a gap — flag `[TBD — confirm per track]`.
