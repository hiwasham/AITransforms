# Contract: Anti-Values Linter

Input/output contract for the automated quality gate that sits between
script generation and the human review queue. Referenced by
`data-model.md`'s `LintReport` entity and the Workflow State Machine's
`quality_checked` → `revision_requested` transition.

## Input

```
{
  outreachScriptId: uuid,
  bodyText: string,               // the Hook→Pain→BFV→Ask draft
  prospectFacts: ExtractedFacts    // from ScrapedSiteSnapshot.extracted_facts,
}                                   // required for the specificity check
```

## Checks (all required to pass; any failure ⇒ overall `fail`)

| Check | Layer | Pass condition |
|---|---|---|
| Reading level | Mechanical | Computed grade score at or below an approximately 3rd-grade threshold |
| Jargon / workslop | Mechanical | Zero matches against a maintained deny-list of corporate-jargon/buzzword terms (e.g. "synergy," "leverage," "circle back," "unlock value," "game-changer") |
| Structure | Mechanical | Body text contains an identifiable Hook, Pain, BFV-link reference, and Ask, in that order |
| Specificity | LLM-judge | The Pain/Hook content demonstrably references a fact present in `prospectFacts` (not generic filler that could apply to any business) — judge must cite which fact it matched or explain why none matched |
| Tone | LLM-judge | Plain, direct, human register consistent with the cadence-script examples in `resources/follow-up-cadence-scripts.md`; not sales-brochure voice |

## Output

```
{
  verdict: "pass" | "fail",
  readingGradeScore: number,
  jargonTermsFound: string[],
  specificityVerdict: "pass" | "fail",
  structureVerdict: "pass" | "fail",
  revisionFeedback: string | null   // REQUIRED (non-empty) when verdict = "fail";
}                                     // must be specific enough to drive a
                                      // targeted regeneration, not just "try again"
```

## Contract guarantees

1. **No silent pass-through**: a script that fails any single check is an
   overall `fail`; there is no partial-credit or override path in the
   linter itself (only a human, later, in the review queue, can accept
   something the linter flagged — and the linter's fail routes the script
   back to `revision_requested`, it does not reach the review queue at
   all). This is the literal "failed messages must return for revision and
   cannot proceed" requirement.
2. **Determinism on mechanical checks**: reading level, jargon, and
   structure checks must return the same verdict for the same input every
   time — these are the checks unit-testable without any LLM call
   (Constitution Principle IX).
3. **Bounded retries, not infinite loop**: the `LintReport` history for a
   given `OutreachScript`'s attempt is what the Workflow State Machine's
   bounded revision-loop counter reads to decide when to stop retrying and
   flag `needs_manual_draft` instead (see `data-model.md`).
