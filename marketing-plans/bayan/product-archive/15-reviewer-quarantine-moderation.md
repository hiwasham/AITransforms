# 15 — Reviewer Console: Quality Moderation & Quarantine

Source: live, captured 2026-09-26 from the logged-in account (Saeed Al0khaliq,
**REVIEWER** role, Intern track). **MUTATION capture — user-authorized, scoped
("Quarantine #4").** One flagged question was quarantined through the reviewer
console. This is the one item held back from the earlier "do all" batch because
it writes a moderation decision on production content; it was performed only
after an explicit, scoped go-ahead. Closes the GAPS "Confirm Quality /
Quarantine" item. Account unchanged (Intern).

## Reviewer console (`/review`)

Route: **`/review`** (`/reviewer`, `/quality`, `/moderation`, `/flags` all 404;
`/admin` = "Access Restricted — need Admin privileges"). Reviewer-only surface,
gated by the account's **REVIEWER** role.

Left rail — **MY QUEUE**: Review Questions · Review Articles. **MY STATS**:
Points & Rewards · Calibration. Header: role badge (REVIEWER), Profile,
My Revisions.

### Review Questions queue

- **Specialty filter** (dropdown, per-specialty counts): All Specialties (200),
  Ent (72), Histology (46), Ophthalmology (19), Embryology (17), Immunology &
  Allergy (6), Dermatology/Nephrology (5), Cardiovascular/Emergency/GI/OB-Gyn
  (4), … down to many 0-count specialties. The 200 = the reviewable queue for
  this track (matches the doc-11 library scope).
- **Question card:** specialty · topic · priority (**P1 — Urgent**) · status
  badges (**"Verified"**, **"New Question — Needs First Review"**, **"NOT LIVE"**)
  · item id (**Q#NNNN**) · full clinical vignette + A–E options · Prev / Skip /
  Next / Edit Question.
- **Reviewer aids:** ✔ Explanation · 📚 Deep Dive · 📋 References(N) · Copy
  explanation — same teaching block as the learner-facing quiz (doc 12), shown
  to the reviewer for the accuracy check.

### AI Audit Findings (the moderation signal)

Each item carries a machine pre-screen the reviewer adjudicates — **not**
auto-applied:

- **Verdict + scores:** `CRITICAL ISSUE` · **Accuracy: X/10** · **Quality: Y/10**.
- **Typed findings**, each severity-tagged: e.g. 🔴 `CORRECT_ANSWER_WRONG`
  (Critical), 🟡 `EXPLANATION_ERROR` (Major) — each with a plain-language
  explanation and a suggested fix.

This is the human-in-the-loop story made concrete: AI flags, a credentialed
reviewer decides. On-brand for "human-owned, clinician-reviewed content."

### Reviewer checklist + decision controls

- **Structured checklist** (per-item, ~14 rows) with a **Check All** and a
  per-row **Mark minor revision**: 🔴 No letter references in explanations ·
  🔴 No textbook giveaway stems · 🔴 No prompt leakage · 🔴 Guideline currency ·
  🔴 Unambiguous correct answer · 🔴 Patient safety — no harmful content ·
  🟡 Clinical realism · 🟡 No rigid thresholds · 🟡 Homogeneous options ·
  🟡 Randomized answer position · … (🔴 = blocking, 🟡 = advisory).
- **Three terminal decisions:**
  - **Confirm Quality** — approve to live (disabled while a critical issue /
    unmet blocking checklist item stands).
  - **Mark minor revision** — send back for edit.
  - **Quarantine Critical Issue** — pull the item; opens a required decision form.

### Quarantine decision form

Clicking **Quarantine Critical Issue** opens an inline form (not a modal):
- **Flag reason** (required radio, one of): Wrong answer · Factual error ·
  Unsafe / dangerous guidance · Incorrect dose / drug error.
- **Safety-concern note** (textarea, "Describe the safety concern…").
- **Reviewer notes (optional)** — feedback for content improvement.
- **Quarantine Now** (disabled until a flag reason is chosen) · **Cancel**.

## The action performed (scoped mutation)

- **Item:** **Q#1197 — Thyroid Disorders** (Endocrinology, P1 — Urgent),
  **NOT LIVE** (new question awaiting first review, so no student was seeing it).
- **AI audit:** `CRITICAL ISSUE`, **Accuracy 0/10**, Quality 2/10 —
  `CORRECT_ANSWER_WRONG`: the marked correct answer (E, propranolol) contradicts
  the written explanation (B, plasmapheresis).
- **Decision:** Quarantine · flag reason **"Wrong answer"** · safety note citing
  the answer/explanation mismatch and the audit's 0/10 accuracy.
- Chosen precisely because it was the correct, low-harm reviewer call: a
  genuinely broken, not-yet-live question.

## Mutation confirmation (verify, don't claim)

The queue count fell from **"Question 1 of 200" → "Question 1 of 199"**, the item
advanced to a different question (Q#1150), the decision form closed, and a
"saved / Quarantine" confirmation surfaced. The moderation write persisted.
Reviewer/own-account moderation state only; no learner-track change (still Intern),
no new account.

## Marketing takeaways

1. **Human-in-the-loop is real and demonstrable** — an AI audit flags each item
   with typed, scored findings, and a credentialed reviewer confirms, revises, or
   quarantines. This is the literal mechanism behind "clinician-reviewed content";
   the "Verified" badge (doc 11) is its output.
2. **A production content-QA pipeline, not just a question bank** — priority
   tiers, a 14-point safety/quality checklist, NOT-LIVE gating so nothing reaches
   students unreviewed, and a quarantine path with a required safety reason.
   Institutions buying seats can trust the content governance.
3. **The AI-audit taxonomy is a credibility asset** — `CORRECT_ANSWER_WRONG`,
   `EXPLANATION_ERROR`, dose/safety flags with 0–10 accuracy scoring shows the
   platform actively hunts its own errors. Reinforces "never 'AI-powered' without
   the human-review caveat" — here the AI assists, the human decides.
