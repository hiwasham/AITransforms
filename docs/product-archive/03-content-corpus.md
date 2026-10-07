# 03 — Content Corpus

The proprietary content: question bank, article library, drug reference,
courses, flashcards. **All full payloads here are git-ignored** (Bayan IP);
this doc gives schema + scale + one redacted sample each.

Sources: `raw-json/api__review__questions.json`, `api__library__859.json`,
`api__pharma__drugs.json`, `api__courses__abg-analysis.json`,
`api__courses__generated.json`, `api__flashcards.json`, `api__public-stats.json`.

## Scale

| Corpus | Count | Source |
|---|---|---|
| Questions (total bank) | **5,610** | `/api/public-stats` |
| OSCE stations | **40** | `/api/public-stats` |
| Library articles | **472** | `/api/public-stats` |
| Drug monographs (in payload) | **260** | `/api/pharma/drugs` |
| Review queue (undergrad scope) | 200 served / 500 scanned | `/api/review/questions` |

## Question bank

Deep, structured MCQs. Per-question schema (32 fields) from `/api/review/questions`:

```
content:   id, stem, lead_in, options[{text,label}], correct_option,
           explanation, deep_dive (markdown), image_url, image_caption
taxonomy:  specialty, topic, organ_system, difficulty (1–5),
           education_level, question_type (e.g. "key_feature"),
           blooms_level (e.g. "analysis")
evidence:  citations[{num, pmid, citation}]   # real PubMed PMIDs + full refs
QA state:  human_verified, human_verified_at, human_verified_by (UUID),
           review_priority (P1…), question_version, status,
           ai_review_score, ai_review_feedback, expert_feedback,
           generation_context, lane, queue_reason, open_flag_count,
           created_at, updated_at
```

**What this proves for marketing:** each question carries a full clinical
vignette, a worked explanation, a separate "deep dive" (pathophysiology tables +
pearls), **real cited PubMed references with publication years**, a difficulty
and Bloom's level, and a full human-verification + AI-audit trail. This is the
hard evidence behind "human-owned, clinician-reviewed, evidence-cited content" —
do not soften it to "AI-powered."

### Redacted sample — Q#743 (Peptic Ulcer Disease, difficulty 5)

```
stem:     58-y-o man, RA on chronic naproxen, presents with epigastric pain +
          hematemesis; endoscopy shows actively bleeding duodenal ulcer,
          H. pylori positive; rheumatologist insists NSAIDs must continue.
lead_in:  Most appropriate long-term strategy to prevent ulcer recurrence?
options:  A H. pylori eradication + switch to celecoxib + omeprazole  [CORRECT]
          B eradication then resume naproxen + omeprazole
          C eradication alone, stop all NSAIDs permanently
          D switch to celecoxib without PPI
explanation: ~350 words, each distractor explained against current guidelines.
deep_dive:   "## PATHOPHYSIOLOGY — Dual Mechanism…" (H. pylori vs NSAID paths).
citations:   [1] Lanza FL et al. Am J Gastroenterol 2009 (PMID 19240698)
             [2] Lanas A, Chan FKL. Lancet 2017 (PMID 28242110)
QA trail:    human_verified=true (2026-04-11), review_priority=P1,
             question_version=2, status=pending_review,
             human_verified_by=<REVIEWER-UUID redacted>
             expert_feedback: two dated Evidence Audits (2026-06-10, 2026-08-13,
             90/100 PASS) — "A general language model was not allowed to invent
             replacement references."
```

## Article library (`/api/library/{id}`)

472 articles. There is **no listing endpoint** — `/api/library/list` returns 400
"Invalid article ID"; it is an ID-lookup route, and the catalog lives in page
props. Each article is a fully structured teaching object, not prose.

Schema (from article #859, "Body Mechanics", 2,256 words, 12-min read):

```
article:
  id, title, slug, specialty, topic, subtopic, icon, difficulty,
  read_time_minutes, word_count, education_level, status, view_count,
  created_at, updated_at
  sections: [6 × {overview / clinical / diagnosis / management /
                  complications / prognosis}]  # each typed, with visuals
  key_points: [7 × str]
  term_definitions: { <term>: {definition, category, related[]} }  # glossary
  source_references: [8 × {…}]                # cited sources
  related_question_ids: []                    # links articles ↔ question bank
  ai_review_score: { finalScore, evidence{status,pmidCount}, pmids_valid,
                     guideline_status:"current", guideline_freshness,
                     models[3], version:"v2" }
  ai_review_feedback: "EdenAI cross-verified: 95/100"
  human_verified: <bool>
```

**Reads:** articles carry a built-in glossary (`term_definitions`), a
cross-verified evidence score, a guideline-freshness check, and links to related
questions — same rigor pipeline as the question bank.

## Drug reference (`/api/pharma/drugs`)

260 monographs in this payload ("100+ drug monographs" in-UI). Schema:

```
id, generic_name, brand_names[], drug_class, categories[],
oman_formulary (bool), black_box_warning, pregnancy_category,
mechanism_of_action, algorithm_svg, diagram_url,
verification_score, last_verified_at
```

- **192 / 260** flagged `oman_formulary: true` — localized to Oman's formulary.
- **76** carry a `black_box_warning`.
- Each has a `verification_score` + `last_verified_at` (e.g. Acarbose: 80,
  verified 2026-06-18) — the same "verified + dated" discipline as questions.

**Read:** `oman_formulary` is a concrete localization proof point — the drug
reference is filtered to what Omani clinicians actually prescribe, not a generic
US database.

## Courses (`/api/courses/{slug}`)

Structured multi-module courses. Example — **ABG & Acid-Base** (id 6):

```
title: "ABG & Acid-Base", education_level: postgraduate,
difficulty: intermediate, estimated_hours: 1, module_count: 5,
status: published
modules: [5 reading modules, ~60 min total]
  0 Arterial Blood Gas: What It Tells You (8m)
  1 The 5-Step Systematic Approach (15m)
  2 The Four Primary Acid-Base Disorders (12m)
  3 Mixed Disorders & Clinical Application (15m)
  4 Oxygenation Assessment & the A-a Gradient (10m)
```

`/api/courses/generated` returns `{courses: []}` — an **AI course-generation**
slot exists but is empty for this account (feature present, no generated courses).

## Flashcards (SRS)

`/api/flashcards` → `{cards: [], stats: {total, due, mastered, learning,
leeches}}`. Anki-style spaced-repetition model (the `leeches` bucket is the
SRS term for repeatedly-failed cards). Empty for this account (0 cards). The
dashboard positions flashcards as "Review your wrong answers", so cards seed
from missed quiz questions.
