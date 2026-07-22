# Recovery Plan: First 100 Sends (2026-07-16)

**Status**: Operator-directed recovery plan after the 5/5 rejection of the
first real batch (see spec.md Amendment 1 and
`resources/golden-reject-set-2026-07-16.md`). Planning artifact only — no
implementation is authorized by this document.

**Objective**: Reach the first 100 real outreach sends as fast as
possible. Every item below is triaged on three axes, in priority order:
(1) impact on operator approval rate, (2) engineering effort,
(3) time-to-first-real-send. A gate that is high-impact but slow loses to
a gate that is medium-impact and immediate.

**Governing metric**: SC-008 — ≥60% of packages approved without edits
over a rolling 20-package window. Baseline: 0%.

## Gate evaluation

Each proposed gate, scored against the three priorities and against the
golden reject set (how many of the 5 rejects it would have caught):

| Gate | What it is | Rejects caught | Impact on approval rate | Effort | Verdict |
|------|-----------|:---:|------|------|---------|
| G3 deliverable integrity | Deterministic check: message may not claim assets that don't exist; no unresolved `{{BFV_LINK}}`/placeholder reaches approved | **5/5** (D1) | Highest — a false "I made you a video" is an auto-reject and a trust-killer if ever sent | Trivial: string/regex checks, no LLM | **Must — first 10** |
| G4 self-consistency | One ask per message; kill the blind post-generation CTA append; video reference becomes part of the prompt contract | 3/5 (D3) | High — the double-ask made messages read broken | Trivial: delete/inline `withBfvCta`, adjust one prompt | **Must — first 10** |
| G5 golden examples | Few-shot: Day-1 template + approved examples in the generation prompt; reject set as negative exemplars; fixture tests pin SC-009 | 5/5 indirectly (D7 tone) | Highest single lever on generation quality — the prompt currently has zero exemplars of "good" | Low: prompt text + fixtures, no new architecture | **Must — first 10** |
| G1 viability | Pre-generation classifier: viable / not_viable / needs_human | 1/5 (D4) | Medium at N=5; grows with list size (saves operator time + LLM spend at 100) | Low-medium: one LLM call + verdict handling | **Must — first 10** (cheap manual form), automated form before first 100 |
| G2 evidence grounding | Speculation-marker deny-list (mechanical) + claim-by-claim judge upgrade | 3/5 (D2) | High — "I bet / your team must" was a stated rejection driver | Deny-list: trivial. Judge upgrade: medium (prompt rework + tests) | **Split**: deny-list before first 10; judge upgrade before first 100 |
| G6 single quality path | first-100 path runs mechanical checks + judge + revision loop; needs_research rows get no message body | 5/5 (enforcement of all above) | Structural — without it every other gate is optional | Medium: wire existing `runMechanicalChecks`/`judge`/retry into first-100 flow | **Split**: mechanical checks + needs_research fix before first 10; full judge + revision loop before first 100 |
| G7 rejection reasons | One-keystroke reason tag on dashboard reject (002 FR-021) | n/a (feedback, not filtering) | Compounding — every rejection improves G5's exemplar set; without it, next batch's failures are guesses again | Low: one enum column + one keypress in existing dashboard | **Should — before first 100** (manual notes suffice for first 10) |

## Must do before first 10 sends

Rationale: the first 10 sends are hand-reviewed one-by-one anyway — the
operator IS the judge. The pre-send gates only need to stop the failure
modes the operator already unanimously rejected, at near-zero engineering
cost. Everything here is deterministic or prompt-text-only; no new
architecture, no new tables.

1. **G4 — kill the blind CTA append; one coherent ask** (FR-030).
   Deterministic append of "I made you a short personal video" is the
   single change that poisoned 5/5. The message's link/CTA sentence
   becomes part of the one generation prompt; nothing is appended after
   generation. *This alone converts D1+D3 from "every message" to
   "possible model error caught by G3".*
2. **G3 — deliverable-integrity check** (FR-029, deterministic): fail any
   package whose message references a video while `bfv_link_video` is a
   placeholder; fail any approval whose final text still contains
   `{{BFV_LINK}}` or `<<…>>`. Runs at generation AND at the dashboard
   approve action (belt and suspenders, both trivial).
3. **G5 — exemplars in the prompt + golden-set fixtures** (FR-032,
   SC-009): inject the Day-1 template as the positive standard and 2–3
   golden rejects with reasons as negatives. Add the fixture test: gates
   must fail all 5 golden rejects.
4. **G2-mechanical — speculation deny-list** (FR-031, mechanical half):
   add "I bet", "must spend", "likely", "probably", "I'm sure",
   "I'm guessing" to the existing jargon-style deny-list machinery
   (same code shape, new list).
5. **G6-minimal — first-100 runs the mechanical gates; needs_research
   emits no message** (FR-033, minimal form): the first-100 path calls
   the existing `runMechanicalChecks` plus the new G3/G2-mechanical
   checks; a failing row is emitted as `needs_manual_draft`, never
   send-shaped. `needs_research` rows get a research stub only — no
   generated message body, no video claim.
6. **G1-manual — viability by eyeball** (FR-034, manual form): for the
   first 10, the operator curates the input list (they're reviewing each
   package anyway); the only system change is that a `not_viable` verdict
   recorded at review skips the prospect from any future batch. No
   classifier built yet.

**Exit criterion for this stage**: generate a batch of 10 FRESH prospects
(fresh companies — a same-company regeneration is deduped away by FR-002,
which was the original failure mode; CEO review 2026-07-18 D4) through the
gated path; the import MUST show `added==10`, and the cohort is the rows
under that import's `source_name` (D13). Operator reviews in the dashboard,
tagging each reject with a Q011 reason. Binary threshold (D8): PASS = ≥6/10
approved without edits; FAIL = ≤5/10 → STOP. On FAIL, the captured Q011
rejection reasons drive the re-plan before building anything further; the
next bottleneck is not yet known and must come from real rejection data,
not speculation.

## Should do before first 100

Rationale: at 100-prospect scale the operator can't eyeball-curate the
list or hand-note rejection reasons; the LLM-judge quality layer and the
feedback loop must carry the load.

7. **G2-judge — claim-by-claim evidence grounding** (FR-031, judge half):
   upgrade the LLM judge from "references some fact / plain tone" to
   "enumerate each prospect-referencing claim; mark supported/unsupported
   against the scraped facts; any unsupported = FAIL quoting the claim."
   Feeds the revision loop real feedback instead of a generic sentence.
8. **G6-full — first-100 through the complete pipeline** (FR-033, full
   form): judge + bounded revision loop (the existing
   `runScriptAndLint`-style flow), not just mechanical checks. Exhausted
   revisions surface as `needs_manual_draft` in the review queue.
9. **G1-automated — viability classifier** (FR-034, automated form):
   pre-generation LLM verdict `viable | not_viable(reason) | needs_human`;
   `not_viable` costs no packaging spend and never reaches review.
10. **G7 — rejection-reason capture** (002 FR-021): one optional
    keystroke-tagged reason on reject
    (`g`eneric / `f`alse-claim / `b`ad-fit / `c`reepy / `o`ther). Every
    rejection then compounds into G5's exemplar set and re-ranks these
    gates with data.
11. **Better fact extraction (new, sub-FR-002)**: the Sivers "17 people in
    Jakarta" defect (D5) is an extraction problem — first-5-sentences +
    question-sentences surfaces trivia. Extraction should prefer
    business-relevant facts (offer, customers, support surface). Listed
    here, not in "first 10", because G2's grounding checks make bad facts
    fail safe (unsupported/creepy claims get caught downstream) — this
    item raises the ceiling rather than the floor.

## Later improvements (explicitly NOT now)

- Approval-rate telemetry surface (SC-008 auto-computed on the dashboard;
  a manual count in a rolling window is fine for the first 100).
- Golden-approved few-shot rotation/curation tooling (append to the
  resource file by hand until there are enough approvals to matter).
- Tone/persona calibration beyond the exemplars (D7's "baby-talk" risk is
  mostly addressed by exemplars + evidence grounding; revisit only if
  post-gate rejections still cite tone).
- Any convergence of the first-100 script with the full batch
  orchestrator (two code paths sharing gate modules is acceptable through
  the first 100; unification is refactoring, not recovery).
- Per-prospect research-depth scoring, multi-page scraping, ICP scoring
  models — all upstream-quality ceiling-raisers, none of them blockers
  while G2/G3 make weak inputs fail safe.

## What is deliberately NOT being fixed

- The review dashboard (002 MVP-0): worked as specced; only G7's
  one-column addition touches it before the first 100.
- Dispatch/cadence/webhooks (001 US2/US3): unreached until messages are
  approved; irrelevant to the current bottleneck.
- SC-002 and the completeness pipeline: not broken — it delivered 5/5
  complete packages. Completeness was never the problem; sendability was.

## Sequencing summary

Task-level breakdown lives in `tasks.md` **Phase Q0** (Q001–Q007, must
ship before first outreach) and **Phase Q1** (Q008–Q012, after first
outreach / before first 100), appended 2026-07-16.

```
Stage A / Phase Q0 (before first 10 sends)  — G4, G3, G5, G2-mechanical, G6-minimal, G1-manual
   └─ exit (Q007): fresh-10 batch (added==10) → combined M012+Q007 operator session → PASS ≥6/10 / FAIL ≤5/10 (else stop & re-plan from Q011 reasons)
Stage B / Phase Q1 (before first 100 sends) — G2-judge, G6-full, G1-automated, G7, extraction upgrade
   └─ exit: SC-008 holding ≥60% over rolling 20; SC-009 fixtures green
Later                                       — telemetry, exemplar tooling, path unification, ICP scoring
```
