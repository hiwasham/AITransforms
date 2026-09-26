# 07 — Training Levels, Settings & Personalization

Source: live learner-app UI (nurse test account), captured 2026-09-26 from
in-app **Settings**, **Overview**, **History**, and **Achievements** screens.
Closes part of the GAPS "tracks / settings not enumerated" item. Personal
performance figures below are trivial test-account noise (3 questions), kept
only to document the data model — not real user data.

## Training Level (profile switcher — one field, drives the whole experience)

The account's `Training Level` is switchable across 11 tracks. Each track
reshapes exams, question scope, and dashboard:

Medical Student · Intern · R1 Resident · R2 Resident · R3 Resident ·
R4 Resident · R5 Resident · Fellow · Attending/Consultant · Nurse ·
Pharmacist · Family Medicine Resident

> ⚠️ Only the **Nurse** track is live-captured (this account). The other 10
> tracks need a profile-track switch = an account write; NOT captured. Each
> likely exposes a different Target-Exam set (e.g. Arab Board / OMSB / Saudi
> residency for the physician tracks) — confirm per track before claiming.

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
