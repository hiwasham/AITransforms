# 04 — Review / Content-QA Pipeline (the differentiator)

Source: `pages/review.txt`, `raw-json/api__review__questions.json` (git-ignored),
`api__review__stats.json`, `api__reviewer-preferences.json`,
`screenshots/review.jpg`. This is the strongest marketing asset in the whole
product: **verifiable proof that a human clinician gates every question.**

## The reviewer console (`/review`)

A separate console the account sees because it holds the `reviewer` role. Nav:
My Queue, **Review Questions**, Review Articles, My Stats, Points & Rewards,
Calibration. The queue can be filtered by content type (Questions / Articles /
Drug Monographs) and by specialty, with live per-specialty counts.

Queue metadata (`/api/review/questions`):

```
total_available: 200      already_reviewed: 0     candidates_scanned: 500
queue_exhausted: false    approved_scopes: ["undergraduate"]
effective_scopes: ["undergraduate"]   approved_specialties: []
```

Specialty distribution in the served queue (medical, not nursing — reviewer
scope is undergraduate): ENT 72 · Histology 46 · Embryology 30 · Ophthalmology
19 · Dermatology 6 · Immunology 6 · Emergency Med 4 · Obs-Gyn 4 · others 1–2.

## What the reviewer sees per question

The full learner-facing rendering **plus** the QA layer:
- The clinical stem, options, correct answer marked, and the tabbed
  **Explanation / Deep Dive / References** panel (identical to the learner view).
- An **AI Verification** block: revision count + machine audit flags
  (e.g. `QUALITY_AUDIT: OPTION_LABELS: Explanation still references 4 option
  letters`).
- **System Notes** — a dated evidence-audit history, e.g.:
  - `[HUMAN CITATION REVIEW REQUIRED] [AUTO-REVISED] …`
  - `[Evidence Audit 2026-06-10] Score: 90/100 — PASS`
  - `[Evidence Audit 2026-08-13] Score: 90/100 — PASS. …`
  - **"A general language model was not allowed to invent replacement references."**
- Status badges: `P1 — Urgent`, `Verified`, `New Question — Needs First Review`,
  `NOT LIVE` (unreviewed content is not served to learners).

## The 20-point Quality Checklist (verbatim, live-captured)

The reviewer must clear this checklist before a question goes live. Each item
has a "Mark minor revision" control; the header shows progress ("0/20").

**Writing quality**
1. No letter references in explanations
2. No textbook giveaway stems
3. No prompt leakage
4. Guideline currency
5. Unambiguous correct answer
6. Patient safety — no harmful content
7. Clinical realism
8. No rigid thresholds
9. Homogeneous options
10. Randomized answer position

**Structure**
11. 4 options (A–D)
12. SI / International Units
13. Explanation 300–500 words
14. Deep dive covers different content
15. Wrong options explained (30–50 words each)
16. Key concept: exactly 1 sentence

**Evidence**
17. Evidence hierarchy respected
18. All citations include publication year
19. No old sole evidence
20. Citations actually support the claims

Decision controls: **Confirm Quality** or **Quarantine Critical Issue**.

## Reviewer stats & prefs

- `/api/review/stats` — a full reviewer scorecard: `lifetimeCount`, `monthCount`,
  `avgPerDay`, per-specialty counts, `decisions{confirm, flag}`, `avgRating`,
  `ratingCount`, `avgTimeSeconds`, `todayConfirmed`, `todayFlagged`. (All zero
  for this account — reviewer onboarded, no reviews logged yet.)
- `/api/reviewer-preferences` — `{reviewer_specialty, reviewer_scope}`. There is
  a **Points & Rewards** + **Calibration** system for reviewers (gamified/QA'd
  reviewer workforce), not just learners.

## Why this matters for the Bayan marketing

This pipeline is the honest, defensible version of the AI story: AI drafts and
pre-audits; a **credentialed human confirms or quarantines** against a published
20-point rubric; every claim is tied to a **dated, real PMID**; and the system
explicitly **forbids the model from inventing references**. That is the line
between "AI-powered quiz app" (commodity, distrusted by clinicians) and
"clinician-reviewed, evidence-cited exam prep" (Bayan's actual, provable
position). Use the rubric and the audit trail as proof, never a bare
"AI-powered" claim.
