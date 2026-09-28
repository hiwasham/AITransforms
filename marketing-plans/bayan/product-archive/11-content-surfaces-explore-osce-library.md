# 11 — Content Surfaces: Explore, OSCE & Knowledge Library

Source: live, captured 2026-09-26 read-only (`/explore`, `/explore/cardiovascular`,
`/osce`, `/library`) from the logged-in postgrad (Intern) account. **GET-only** —
page navigation + DOM text, no mutation. Closes the GAPS "Explore Topics page",
"OSCE stations", and "Article catalog" items (structure + scale + samples;
full corpora stay local per the archive's fair-use rule).

## Explore Topics (`/explore`) — the content graph

Heading: *"Pick a topic to see all related content — questions, articles,
drugs, and calculators."* **12 specialty hubs**, each at `/explore/<slug>`:

Cardiovascular · Respiratory · Renal & Urinary · Gastrointestinal · Endocrine ·
Neurology · Hematology & Oncology · Musculoskeletal · Infectious Disease ·
Critical Care · General Medicine · Immunology & Allergy

### Per-hub aggregation (schema, from `/explore/cardiovascular`)

Each hub cross-links every content type for that specialty. Cardiovascular:
- **38 drugs**, **4 calculators**, **10 adaptive practice questions**
- Review Flashcards (spaced repetition), Virtual Patient (clinical simulation)
- **Articles** list, **Drug Monographs** list (Amiodarone, Amlodipine, Apixaban,
  Aspirin, Atenolol, Atorvastatin, Bisoprolol, Carvedilol, Clopidogrel,
  Dabigatran… +28 more), **Clinical Calculators** (HEART, CHA₂DS₂-VASc,
  HAS-BLED, RCRI)

This is the integrated-content story: questions + articles + drugs + calculators
+ virtual patients unified per specialty, not siloed.

## OSCE Practice (`/osce`)

Heading: *"Practice clinical skills with structured OSCE stations. Self-assess
using standardized marking checklists."* **"Aligned with OMSB Licensing /
USMLE CS."** Mock circuit at `/osce/circuit` ("Start Mock OSCE Circuit").

Station taxonomy (filters):
- **Types (4):** History Taking · Physical Examination · Communication &
  Counseling · Procedural Skills
- **Specialties (7):** Internal Medicine · Surgery · Pediatrics · OB/GYN ·
  Psychiatry · Emergency Medicine · Family Medicine
- **Difficulty (3):** Basic · Intermediate · Advanced

(Station list rendered 0 for this track at capture — the total **40** is the
`/api/public-stats` figure already in the archive. Individual station detail
not probed: starting a station may write attempt state = mutation-gated.)

## Knowledge Library (`/library`)

Heading: *"Evidence-based clinical articles for board exam preparation."*
**"All Articles (200)"** visible for the postgrad track (the 472 total spans all
tracks/scopes — `/api/public-stats`). Articles listed in the DOM as
`/library/<id>` (e.g. `/library/951`, `/library/1191`).

Per-article card metadata:
- Category (16 subspecialties, same taxonomy as Review Preferences)
- Read time (e.g. 3–11 min), difficulty (Intermediate), section count
- **"Verified" badge** — human clinical-review signal (on-brand for the
  human-reviewed-content rule; not every article carries it)

Title sample (postgrad IM scope): Systematic Review Methodology · Delirium ·
Raynaud Phenomenon · Thyroid Nodules & Cancer · STIs · Behçet's Disease ·
Sepsis & Septic Shock · Hospital-Acquired Pneumonia · Elder Abuse & Capacity ·
End-of-Life Care · Cold Agglutinin Disease · Primary Brain Tumors · Osteoporosis
(DEXA/FRAX) · Peripheral Arterial Disease · Geriatric Syndromes.

## Marketing takeaways

1. **Integrated content graph is a real differentiator** — Explore hubs unify
   questions, articles, drugs, calculators, flashcards, and virtual patients per
   specialty. "One place for everything on this topic" is a demo-able story.
2. **"Verified" article badges** = human clinical review, exactly the proof the
   brand rule wants (never "AI-powered" without the human-review caveat).
3. **OSCE aligned to OMSB Licensing / USMLE CS** with standardized checklists =
   a concrete skills-assessment surface beyond MCQs.
4. **Quotable scale with the app's own numbers** — 200 articles (postgrad), 12
   specialty hubs, 40 OSCE stations across 4 types / 7 specialties.
