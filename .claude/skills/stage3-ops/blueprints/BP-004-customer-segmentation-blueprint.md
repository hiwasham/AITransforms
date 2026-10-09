# BP-004: Customer Segmentation & Persona Development Blueprint

**Process:** Proc 4 - Customer Segmentation & Persona Development (Strategy)
**Cores:** 215 (ICP & Persona), 216 (Segmentation & Targeting)
**Level:** L2 Blueprint (Functional Breakdown)
**Owner:** Marketer (Nasim)
**Accountable:** CEO (Dr. Abdullah Al Alawi)
**Version:** 1.0
**Last Updated:** 2026-10-09

> ⚠️ **Core IDs 215/216 are DRAFT** (from `marketing-plans/bayan/cores-draft.md`),
> **unverified** against live Stage 3 HQ (lapsed 2026-10-09). Reconcile at renewal.

---

## Purpose

Break Proc 4 into its functional sub-processes, define the ICP boundary that gates every
persona, and specify the quality gates that keep segmentation honest and operational rather
than a slide nobody uses.

---

## Sub-Process Breakdown

| # | Sub-process | Owner | Trigger | Output |
|---|-------------|-------|---------|--------|
| 1 | ICP Boundary & Anti-Persona | CEO + Marketer | Process start / annual review | A one-line in/out rule |
| 2 | Persona Definition | Marketer | New evidence / quarterly | Named persona cards (F4-1) |
| 3 | Segmentation Matrix | Marketer | After personas signed | Role × track × tier × motion grid (F4-3) |
| 4 | ICP Fit Scoring | Marketer | Per lead/account | 0-10 fit score, tiered (F4-2) |
| 5 | Segment-to-Motion Mapping | Marketer | After matrix | Each segment → Motion A or B |
| 6 | Segment Instrumentation | Developer | After matrix | Segment flag on user record |

---

## Sub-Process 1: ICP Boundary & Anti-Persona

**The boundary comes before the personas. A persona outside the boundary is not a smaller
opportunity — it is a different company.**

**Decision tree:**

```
Proposed audience
│
├─ Medical professional or student preparing for a licensing/board exam?
│   └─ YES → inside ICP, continue to persona definition
│
└─ General public / consumer health / patient education?
    └─ NO → ANTI-PERSONA. Reject. Do not refine, do not "lite" version it.
```

**Quality gate 1 — the anti-persona is enforced, not aspirational.** Any segment, persona,
campaign, or piece of copy that drifts toward "anyone who wants to learn medicine" is
rejected. This is a CEO-owned red-line. The cost of blurring it is a product that serves
no one sharply.

**Grounding:** `bayan-shared-language.md` names this hard anti-persona explicitly; the
`product-marketing.html` grid lists "general public / non-clinical learners" as the
anti-persona card.

---

## Sub-Process 2: Persona Definition

**A persona is a named person with a job-to-be-done, a trigger, and an objection — in their
own words. Not a demographic bracket.**

| Persona | Motion | Job-to-be-done (VOC) | Trigger | Primary objection |
|---------|--------|----------------------|---------|-------------------|
| **IMG self-funder** | A | "I stopped guessing what to study" | Exam date booked | "Is this aligned to *my* exam?" |
| **Resident / student** | A | "Pass the board without drowning in content" | Rotation + exam collision | "I have no time" |
| **Program director** (B2B champion) | B | "Get my cohort licensed, show the board results" | Cohort intake / accreditation | "Can I see per-seat progress?" |
| **Hospital / university** (financial buyer) | B | "License N staff at a predictable cost" | Budget cycle | "What's the per-seat ROI?" |

**Decision tree:**

```
Writing a persona
│
├─ Does it have a real VOC quote (heard, not invented)?
│   └─ NO → mark as HYPOTHESIS, not canonical. Collect VOC first.
│
├─ Clinical Reviewer confirms exam track + career stage are consistent?
│   └─ NO → fix the clinical realism before publishing
│
└─ CEO signs it off?
    └─ YES → canonical persona card (F4-1), referred to by name team-wide
```

**Quality gate 2 — no canonical persona without real VOC.** An invented quote is worse than
no quote: it fabricates confidence. A persona without evidence stays labelled "hypothesis"
until Support/Sales confirm the language.

---

## Sub-Process 3: Segmentation Matrix

**Four axes, grounded in `cores-draft.md` Core 216 and `research.md`:**

```
Segment = Role × Exam Track × Geography/Tier × Motion
```

| Axis | Values |
|------|--------|
| Role | Doctor · Resident · Medical student · Nurse |
| Exam track | OMSB · DHA · MOH · SCFHS · QCHP · NHRA · Arab Board · MRCP · ABIM · OEN · SNLE · NCLEX-RN · (~23 tracks) |
| Geography / tier | International (paid) · Oman (free via grandfathering/institution) · humanitarian free-country list |
| Motion | A (self-serve B2C) · B (institutional B2B) |

**Quality gate 3 — "paid international" is not one segment.** A doctor sitting OMSB and a
nurse sitting NCLEX-RN have different content, price, and anxiety. Treating international as
a single bucket hides the real segments. (Named as a current gap: see Known Constraints.)

**Oman nuance (do not get this wrong in copy):** Oman access is free via **grandfathering
(pre-2026-05-01 users) or institution deals**, NOT a blanket geography rule — Oman is *not*
in the humanitarian free-country geo set. Copy says **"free for early Oman users /
institutions,"** never "free in Oman."

---

## Sub-Process 4: ICP Fit Scoring

**A 0-10 score so leads and accounts route to the right effort level** (pattern reused from
the Market-to-Lead SOP's ICP score).

```
ICP fit score (0-10)
│
├─ > 7  → High-Priority  → full-touch nurture / sales
├─ 5-7  → Standard       → standard automated lifecycle
└─ < 5  → Nurture        → low-touch; may be anti-persona-adjacent — re-check boundary
```

**Scoring inputs:** role-in-ICP, has a dated exam, exam track Bayan covers well, paid-geo vs
free-geo, (B2B) seat count ≥ 20.

**Quality gate 4 — a low score near the boundary triggers an anti-persona re-check,** not an
automatic nurture drip. If a lead scores low because they are *outside* the ICP, nurturing
them wastes effort on someone Bayan does not serve.

---

## Sub-Process 5: Segment-to-Motion Mapping

```
Segment
│
├─ Individual, self-paying, exam-date-driven → Motion A (self-serve B2C)
│     cores 255/256/258/259/260 lifecycle
│
└─ Buys seats for others, invoice-based, cohort → Motion B (institutional B2B)
      cores 257/261 lifecycle; route via MedResearch Academy
```

**Quality gate 5 — motion is set at segmentation, not guessed later.** The motion decides
which entire lifecycle a user enters. A B2B champion dropped into the B2C self-serve drip
gets the wrong emails; a self-funder routed to invoice-based sales never converts.

---

## Sub-Process 6: Segment Instrumentation

**A segment that is not on the user record is not a segment — it is an opinion.**

The Developer flags each user with: role, exam track, geo/tier, and motion. Proc 22 then cuts
every funnel metric by segment. Without this, segment performance is unmeasurable and
Sub-Process 3's matrix stays theoretical.

**Quality gate 6 — segments must be measurable.** Each defined segment maps to a concrete,
queryable flag on the user record before it is used to make a prioritization decision.

---

## Quality Gates Summary

| Gate | Location | Blocks what |
|------|----------|-------------|
| 1 | Anti-persona enforced | Blurring the ICP into "anyone learning medicine" |
| 2 | No canonical persona without real VOC | Fabricated confidence from invented quotes |
| 3 | International is not one segment | Hidden sub-segments with different needs/price |
| 4 | Low score near boundary → re-check ICP | Nurturing people outside the ICP |
| 5 | Motion set at segmentation | Users entering the wrong lifecycle |
| 6 | Segments must be measurable | Prioritizing on opinion, not data |

---

## Exception Handling

| Exception | Detection | Response |
|-----------|-----------|----------|
| Proposed persona outside ICP | Fails Sub-Process 1 | Reject; log as anti-persona example |
| Persona has no VOC evidence | No real quote | Keep as hypothesis; collect VOC via Support |
| Exam-track inconsistency | Clinical Reviewer flags | Fix before publishing the card |
| Segment can't be measured | No user-record flag | Hold prioritization until Developer instruments it |
| Oman described as "free in Oman" | Copy review | Rewrite to "free for early Oman users / institutions" |

---

## Integration Points

**Downstream — Proc 5 (Value Prop):** consumes each persona's job-to-be-done to write the
message. **Proc 9 (Content Marketing):** consumes the persona as the audience. **Proc 14-17
(Lifecycle):** consumes the motion flag to route the user. **Proc 22 Core 262:** consumes the
segment flag as the dimension on every funnel metric.

**Upstream:** `marketing-plans/bayan/` working drafts (cores-draft.md 215-222, research.md
ICP, bayan-shared-language.md) are the raw material. This process makes them canonical.

---

## Known Constraints

**No funnel data exists.** Segment *sizes* and *conversion rates* are all `[TBD]` until
Proc 22 Core 262 instrumentation is live and the first cohort runs. Segments are defined by
evidence of *who exists*, not yet validated by *how they convert*.

**Personas are firmographically thin.** Current drafts have the job-to-be-done and VOC but
lack detailed demographics, decision triggers, and channel preferences. Flagged for a VOC
round once Support conversations accumulate.

**Specialty coverage is Internal-Medicine-weighted.** The content behind the personas skews
IM; personas for surgical/other specialties are under-grounded.

**"International paid" is treated as one bucket.** A known simplification; sub-segmenting by
exam track is the next refinement.

**Core IDs unverified.** 215/216 are client-draft IDs; live HQ (lapsed) may differ.

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-10-09 | Initial L2 Blueprint (P5, Proc 4) | Stage 3 Ops Team |

---

## Approval

**Blueprint Owner:** Marketer (Nasim)
**Reviewed By:**
- [ ] CEO (Dr. Abdullah Al Alawi) - ICP boundary, beachhead, anti-persona
- [ ] Marketer (Nasim) - Personas, matrix, fit scoring
- [ ] Clinical Reviewer (TBD) - Exam-track realism
- [ ] Developer (TBD) - Segment instrumentation

**Approved:** _____________ **Next Review:** Q1 2027
