# 10 — Signup & Onboarding Journey

Source: live, captured 2026-09-26 read-only from the logged-in account.
Entry `/login?mode=signup&redirect=%2Fonboarding` redirects an already-authed
user straight to `/onboarding`, which renders the diagnostic-first flow.
**No mutation:** the diagnostic was viewed and one option selected to advance
the client-side flow; **no new account was created** and the account's
`training_level` was re-verified as **`intern`** immediately after (unchanged).
Profile-setup writes were NOT completed. Closes the GAPS "Signup / onboarding
flow" item.

## Flow shape: diagnostic-first onboarding

The app opens onboarding with a **knowledge diagnostic**, not a form. Screen
heading:

> **Welcome to Bayan** — *"Let's see what you know"*

### The diagnostic question (captured verbatim)

A single clinical MCQ — an **inferior STEMI** vignette:

> A 58-year-old man presents to the emergency department with sudden onset
> crushing chest pain radiating to his left arm for the past 30 minutes. He is
> diaphoretic and anxious. His BP is 150/90 mmHg, HR 100 bpm. ECG shows ST
> elevation in leads II, III, and aVF.
> **Which of the following is the most appropriate initial management?**

| | Option |
|---|---|
| A | Oral metoprolol |
| B | Aspirin 325 mg + activate catheterization lab |
| C | Thrombolytic therapy |
| D | Echocardiography |

Controls: **"Check Answer"** and **"Skip to profile setup"**. (Guideline answer
is **B** — aspirin + primary PCI activation for STEMI. The app grades the
diagnostic to seed the learner's starting level.)

### After the diagnostic

Answering advances the flow; for this existing account it landed on the
**Postgrad Dashboard** ("Internal Medicine Board Prep") with no profile
overwrite — the diagnostic did **not** register as a logged quiz attempt
("0 Questions Today"). For a genuinely new signup the next step is **profile
setup** (training level + exam-target selection = the write that seeds
`training_level` / `exam_targets`); that step is write-gated and was not
completed here.

## Marketing takeaways

1. **Diagnostic-first onboarding is a strong hook** — the app leads with a real
   clinical case, not a signup wall. "Let's see what you know" positions Bayan
   as an assessment engine from second one (EMPOWER "Lead" → "Activate").
2. **The starting level is data-driven** — the diagnostic seeds the learner's
   level, reinforcing the adaptive-engine story (doc 07 / doc 08).
3. **Low-friction entry** — no long form before value; the case + instant
   answer-check is the first dopamine hit. Usable as an onboarding proof point.
4. Onboarding content is clinician-grade (guideline-correct STEMI management),
   consistent with the human-reviewed-content brand rule.
