![[deepseek_html_20261003_6ccf12.html]]
# 09 — Clinical Tools, Calculators & Drug Reference

Source: live learner-app UI (`/tools`, `/tools/calculator`), captured
2026-09-26 read-only from the logged-in account. **GET-only** — page navigation
and text capture, no mutation. Closes the GAPS "Calculators / Tools hub" item
(previously "client-side, no API; nav confirmed, tools not enumerated").

## Clinical Tools hub (`/tools`)

Heading: **"Clinical Tools — Point-of-care reference tools for clinical
practice."** Three groups:

### 1. Assessment & Calculators
- **Medical Calculators** — **"22 tools"** (Wells, CHA₂DS₂-VASc, MELD, CKD-EPI,
  qSOFA, CURB-65, and more) → `/tools/calculator`
- **Perioperative Risk Assessment** — RCRI, Caprini VTE, functional capacity
  evaluation

### 2. Drug Reference
- **Drug Monographs** — **"150+ drugs"** (dosing, interactions, monitoring,
  clinical pearls)
- **Drug Interaction Checker** — multi-drug interactions
- **Renal Dosing** — GFR-based dose adjustments
- **IV Compatibility** — IV drug compatibility matrix
- **Emergency Drug Cards** — **"20 critical drugs"**, rapid reference

### 3. Clinical Practice
- **Virtual Patients** — **voice-enabled** clinical simulations
- **OSCE Stations** — structured clinical examination practice
- **Death Certification** — practice completing death certificates →
  `/tools/death-certification`

## Medical Calculators (`/tools/calculator`)

Headline **"22 tools"**, organized into **8 clinical categories**:
Cardiology · Pulmonology · Hepatology/GI · Neurology · Hematology/VTE ·
Critical Care · Renal · Perioperative. Each calculator is evidence-based
scoring for risk stratification / decision support, with a star (☆) to
favorite. Cardiology set captured as the exemplar:

| Calculator | Use |
|---|---|
| CHA₂DS₂-VASc | Stroke risk in AF — guides anticoagulation |
| HAS-BLED | Bleeding risk in AF — anticoagulation safety |
| HEART | Chest-pain / ACS risk — discharge safety |
| RCRI (Lee Index) | Cardiac complications after non-cardiac surgery |

(Full 22-item list is category-gated in the UI; structure + headline count +
one category sample captured — enumerating all 22 needs per-category
click-through, low marginal value for the teardown.)

## Related nav routes (confirmed from dashboard)

`/review · /tools · /tools/calculator · /tools/death-certification · /pharma ·
/quiz · /flashcards · /study-plan · /library · /courses · /osce ·
/virtual-patient · /analytics · /leaderboard · /certificates · /challenge ·
/explore · /inbox`. Public community: **Telegram `t.me/BayanMedEd`**.

## Marketing takeaways

1. **Point-of-care tooling is a real product surface, not a marketing claim** —
   22 evidence-based calculators across 8 specialties, 150+ drug monographs, an
   interaction checker, renal dosing, IV compatibility, and 20 emergency drug
   cards. Concrete "clinical companion" proof for the physician tier.
2. **Voice-enabled Virtual Patients** is a differentiated, demo-able feature
   (already listed in the physician tier's config) — usable as a hero feature.
3. **These are utility/retention features**, not exam prep — they give a reason
   to open the app between study sessions (EMPOWER "Retention" stage).
4. Bank scale is quotable with the app's own numbers ("22", "150+", "20"),
   not round marketing figures.
