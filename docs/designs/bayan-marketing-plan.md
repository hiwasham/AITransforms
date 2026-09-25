# Design Doc: Bayan Marketing Plan (Nasim's pitch deliverable)

Status: in-review (plan-ceo-review, 2026-09-20)
Branch: feature/bayan-marketing-plan
Owner: Nasim (marketing candidate) via Hiwa

## Problem Statement

Nasim just landed a role at **Bayan** (Oman ed-tech/AI company, bayanai.tech /
bayan.edu.om). Month-1 work: heavy graphics + prep for the **Oman Health
Exhibition 2026**. She now wants to pitch a **marketing + branding plan** that
impresses the company — especially CEO **Dr. Abdullah Al-Alawi** — and wins her a
dedicated marketing/branding role at **2x income: 1000 Omani Rials/month** (up
from ~300M Iran Toman/month). Bayan has no marketing hire yet and is developing
heavily, so the seat is open. **Deadline: 3 days** to a pitch that hooks the CEO.

## Goal (what this design doc covers)

**Generate the marketing plan deliverable** — a proposal document good enough to
win the contract, built on the EMPOWER framework, formatted to Corey Haines'
13-section template, at the quality bar of `example-quietude.md`.

## The Deliverable — locked decisions

- **Format:** Corey Haines **13-section marketing-plan template**
  (`agent/skills/marketing-plan/references/plan-template.md`). Quality bar =
  `example-quietude.md`. **Full 13 sections** (user chose this over a trimmed
  version). Exec summary is **Section 1 of the plan** (written last, ordered
  first) — not a separate artifact.
- **Framework backbone:** **EMPOWER (Hayden) "Market to Lead"** stage. Source of
  truth = the `empower-m2l` repo (4-level M2L framework, business briefing, SOP)
  + `empower-curriculum/01-cohort-4-curriculum/06-live-session-5-marketing-and-brand-equity`.
  Archives (`marketingclub-archive/`, `corey-archive/`) are **supplements only**.
- **Two prerequisites before section drafting:**
  1. **Master prompt** (curriculum session-1 exercise 1-1) + session-2 "invisible
     structure of business" — implemented via crewai in `./masterpromptv1` and
     `./sharedlangcrew`.
  2. **Bayan company profile** — gbrain "Compiled Truth + Timeline" pattern
     (`templates/company-template-gbrain.md`) or `company-template-empower.md`.
- **Research reuse:** `~/projects/outreachcrew_emailAndrew` and `outreach-engine`
  do prospect research; adapt them for Bayan intake to feed `research.md`.
- **Process:** Corey 3-phase methodology (INIT → REVIEW → FINALIZE) +
  **spec-kit** (`.specify/`) for spec-driven productivity.

## The 13 Sections (Corey template)

1. Executive summary (written last, ordered first)
2. Strategic frame · 3. Current state · 4. Acquisition · 5. Activation ·
6. Retention · 7. Referral · 8. Revenue · 9. 90-day roadmap ·
10. 12-month outlook · 11. Marketing operations stack · 12. Tactical idea bank ·
13. Measurement, RACI, open decisions, appendix

## Constraints (hard)

1. **REJECT the migration offer.** Nasim stays in Iran; pursue ONLY the
   marketing+branding contract. Do not build anything assuming relocation.
2. **Don't overcomplicate.** 3 days, one goal: impress Bayan with a 3-month +
   12-month plan that maximizes income. Simple beats clever.
3. **EMPOWER Hayden M2L is the backbone.** Archives supplement, never replace.
4. **No guessing data.** Any unknown metric → `[TBD — confirm with team]` in
   Section 13 open decisions (methodology failure-mode rule).

## Bayan facts (feed the company profile)

- CEO: Dr. Abdullah Al-Alawi (researchgate.net/profile/Abdullah-Al-Alawi-4),
  impressed by Nasim's outcome, wants to work together more.
- Products: **Bayan Learning** (bayan.edu.om), **PreOp** (bayan.edu.om/preop),
  **JournalReady** (journalready.ai), **Medad** (medad.om), **SmartRota**
  (bayanai.tech). **OHealth** — being REMOVED from exhibition materials.
- NotebookLM notebook: 6132e206-a623-4abd-af14-db1d789bd31a
- Drive: drive.google.com/drive/u/0/folders/1LwSE-IqNKiuipRi5XLllxjq16cp_avnZ

## Folder Layout (Corey methodology, adapted)

```
marketing-plans/bayan/
  materials/          # CEO notes, product pages, exhibition brief, NotebookLM export
  research.md         # Phase 1 output — 10-topic intake + Bayan compiled truth
  progress.md         # state machine (phase / current_section)
  company-profile.md  # gbrain Compiled Truth + Timeline
  master-prompt.md    # session-1 exercise output
  sections/01-13.md   # the 13 sections (drafted 2→13, then 1)
  final_plan.md       # Phase 3 compiled deliverable → push to Drive
```

## Open Questions (resolve with Nasim before/at each phase)

1. **Wedge / strategic focus.** Plan across all 5 products, or lead with one?
   Bayan Learning is the default assumption. CEO's stated top priority for the
   quarter would settle this (methodology Intake 10).
2. **Funnel + revenue data.** We have zero real numbers yet (MRR, installs,
   activation). Without them, Sections 4-8 and 10 are directional. What can Nasim
   pull from the CEO / app stores / analytics?
3. **Language of the deliverable.** English assumed; confirm CEO preference
   (English / Arabic).
4. **empower-m2l relocation.** The M2L backbone clone lives in volatile `/tmp`.
   Move to `/root/projects/empower-m2l` before relying on it? (safe on GitHub now)

## Success Criteria

- CEO reads Section 1 in ~3 min and understands the offer + the income ask.
- Plan names concrete 3-month (Section 9) and 12-month (Section 10) motions.
- Every recommendation ties to something Nasim can personally execute
  (differentiation — "a plan only Nasim can deliver").
- Reads like an owner's plan, not a candidate's application. Quality ≈
  `example-quietude.md`.

## Implementation Order (verifiable steps)

1. Relocate empower-m2l out of /tmp → verify: `git -C /root/projects/empower-m2l status`
2. Build master prompt (crewai) → verify: master-prompt.md exists, runs
3. Build Bayan company profile → verify: company-profile.md, Compiled Truth + Timeline
4. Phase 1 INIT: research.md via 10-topic intake + outreach-crew research
5. Phase 2 REVIEW: draft sections 2→13, then 1, each user-approved
6. Phase 3 FINALIZE: compile final_plan.md, verification pass, push to Drive

## Risks / Assumptions

- **Data-thin plan.** No real funnel numbers yet → Sections 4-8 risk being
  generic. Mitigation: mark TBDs honestly, lead with strategy + execution proof.
- **Skim-death.** 13 sections for a busy founder. Mitigation: exec summary is
  Section 1, built to win in 3 min; depth backs it, doesn't gate it.
- **3-day scope.** Full 13 sections + profile + master prompt at quietude quality
  in 3 days is aggressive. Mitigation: master prompt + crewai + spec-kit for
  speed; reuse archives; TBD anything unconfirmable.
- **Future reuse deferred.** System should generalize to other companies later,
  but Bayan is the only priority now. No generalization work in this build.

## Dependencies (all verified on disk)

- empower-m2l: GitHub hiwasham/empower-m2l (clone /tmp/opencode/empower-m2l) —
  SOPs/4_LEVEL_FRAMEWORK_M2L.md, BUSINESS_BRIEFING, DESIGN_DOC-approach_B
- Curriculum M2L: empower-curriculum/01-cohort-4-curriculum/06-live-session-5-*
- Master-prompt exercise: .../02-live-session-1-*/03-exercise-1-1-*
- crewai: ./masterpromptv1, ./sharedlangcrew
- Corey template + methodology + customer-research: agent/skills/marketing-plan/,
  agent/skills/customer-research/
- Company templates: templates/company-template-{gbrain,empower}.md
- Outreach reuse: ~/projects/outreachcrew_emailAndrew, outreach-engine
- spec-kit: .specify/
