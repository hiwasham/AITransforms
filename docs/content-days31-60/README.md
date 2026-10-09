# Days 31–60 content — Bayan (plan items 4, 5, 6)

Draft content for the Days 31–60 block of the v2 CEO plan. Every page attacks a
**weak AI-visibility prompt** or a **comparison-intent** query — the two places
answer engines currently miss Bayan. All drafts, nothing published (~0 credits).

## The pages

| File | Target | Why this one | Plan item |
|---|---|---|---|
| `01-mrcp-part-1-sample-questions.md` | mrcp 1 sample questions (vol 140, diff 0) | **Near-win: already ranks #28** — strengthen + link → page 1 | 5 |
| `02-abg-acid-base-interpretation.md` | ABG interpretation | Weak prompt (ABG 5.2) + ties to existing ABG course | 4 |
| `03-smle-vs-omsb.md` | smle vs omsb | Weak prompt (5.0); comparison intent | 4 |
| `04-omsb-exam-preparation.md` | omsb exam preparation | Weak prompt (5.6) but Bayan's **home market** | 4 |
| `05-why-bayan-gulf-licensing.md` | bayan vs uworld / best qbank | Comparison intent; competitor benchmark | 4 |
| `06-social-cadence-starter.md` | X + Telegram cadence | Repeatable weekday posts + 10 seed posts | 6 |

## Why 5 pages, not 10

Item 4 says "10 more pages." These 5 are the **highest-leverage** ones — each
maps to a specific low-scoring prompt or comparison query. The remaining ~5 are
**template variants** of the existing Prometric cluster, spun from
`content-prometric/` with the authority swapped:

- Oman MOH Prometric · Bahrain NHRA Prometric · pharmacist Prometric ·
  physiotherapist Prometric · lab-tech Prometric.

Draft those from the Prometric template only if the first 5 show ranking movement
— quality over 10 thin pages.

## Internal linking (this is how they rank)

- Comparison pages (`03`, `05`) link to the relevant **pathway** and the **Prometric hub**.
- `01` MRCP links from the postgraduate/board track **and** the hub (this is the near-win lever).
- `02` ABG links from clinical-tools and the ABG course.
- `04` OMSB links from the Oman/Gulf licensing track and the hub.

## Brand-voice guardrails (enforced in every draft)

- **No pass guarantees. No empty superlatives.** Evidence-led, name the exam.
- Comparison pages are **factual differentiation, not disparagement** — no
  "better than UWorld," only "here is how Bayan differs."
- Every unverifiable scope claim carries a "confirm before publishing" note.

## Confirm before publishing (I could not verify these)

1. MRCP Part 1 coverage depth (`01`) and that the ABG course is live (`02`).
2. URL paths match live routes (adjust `/…` links).
3. Social handles @Medresearch_om / BayanMedEd are current and owned.

## Verify after publishing

```
for p in mrcp-part-1-sample-questions abg-acid-base-interpretation \
  smle-vs-omsb omsb-exam-preparation why-bayan-gulf-licensing; do
  curl -sSI "https://www.bayan.edu.om/$p" | head -1
done
```

Then re-run keyword_research in ~4–6 weeks to confirm the #28 MRCP term moves.
