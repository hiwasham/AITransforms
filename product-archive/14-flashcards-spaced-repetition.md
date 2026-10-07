# 14 — Flashcards & Spaced-Repetition Review

Source: live, captured 2026-09-26 from the logged-in account (Intern track).
**MUTATION capture — user-authorized ("do all").** A flashcard review session
was entered and one card graded ("Good"), advancing its spaced-repetition
state. Own-account SRS data only; account unchanged (Intern). Closes the GAPS
"Flashcard review" item (drug/course **purchase** is held separately — see
GAPS, real money).

## Flashcards dashboard (`/flashcards`)

Heading: *"Flashcards — Spaced repetition for long-term retention."*

- **Due Today** counter (6) + pipeline stats: **TOTAL · DUE · LEARNING ·
  MASTERED · LEECHES** (Anki-style leech tracking for chronically-failed cards).
- **Review Now** (enters the session).
- **Decks** by specialty, each with card count, due count, and **Mastery %**
  (Nephrology, Internal Medicine, Endocrinology, Rheumatology, Critical Care/ICU,
  Neurology — all 1 card / 1 due / 0% at capture).
- **+ New card** (manual authoring) · **Browse all** · **Auto-generate from
  mistakes**.
- **Preview As** toggle (role preview; not exercised).

### Content loop confirmation

The 6 due cards were **auto-created from the wrong answers** of the quiz in
doc 12 (same specialties: Nephrology, IM, Endocrine, Rheum, Critical Care,
Neurology). "Auto-generate from mistakes" is live, not a label — the quiz →
flashcard → spaced-review loop is wired end to end.

## Review session (data model)

"Review Session · N of 6" with **Exit session**. Each card:

- **Front:** a clinical vignette + question (same board-style stem as the quiz),
  tagged by specialty, ending "Tap to reveal answer" (also keyboard-flippable).
- **Reveal** → the answer/rationale, then a **four-grade SRS scheduler** with
  interval previews:

  | Grade | Next interval |
  |---|---|
  | **Again** | < 1 min |
  | **Hard** | ~1 day |
  | **Good** | ~3 days |
  | **Easy** | ~1 week |

  ("Rate this card"). This is a classic SM-2 / Anki-style algorithm — grading
  "Good" advanced the card and moved the session to 2/6 (state persisted).

## Mutation confirmation

Grading wrote SRS state to the account (session progressed 1/6 → 2/6; the card's
next-review interval updated). Own-account learner data; no purchase, no content
change; track still Intern.

## Marketing takeaways

1. **Real spaced repetition, not flashcards-in-name** — SM-2-style scheduler
   with Again/Hard/Good/Easy intervals, leech tracking, and per-deck mastery.
   Credible to any learner who knows Anki, and a retention engine for EMPOWER.
2. **The closed content loop is the story** — wrong quiz answers auto-become
   flashcards and get scheduled for spaced review (doc 12 → doc 14). "Miss it
   once, the app makes sure you see it again until you own it."
3. **Multiple card sources** — auto-from-mistakes + manual authoring + specialty
   decks = the deck grows with the learner, a reason to return daily.
4. **Retention metrics are visible** — Due/Learning/Mastered/Leeches + mastery %
   give the learner (and, for institutions, the admin) a progress signal.
