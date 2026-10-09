# BP-274: Testimonial & Case Study Capture Blueprint

**Process:** Proc 17 - Success to Lead
**Core:** 274
**Level:** L2 Blueprint (Functional Breakdown)
**Owner:** Marketer (Nasim)
**Accountable:** CEO (Dr. Abdullah Al Alawi)
**Version:** 1.0
**Last Updated:** 2026-10-09

---

## Purpose

Break Core 274 into its functional sub-processes, define what may be published and on whose authority, and specify the quality gates that keep the testimonial library defensible rather than merely persuasive.

---

## Sub-Process Breakdown

| # | Sub-process | Owner | Trigger | Output |
|---|-------------|-------|---------|--------|
| 1 | Candidate Selection | Marketer | Verified outcome (Core 268) | Ask list |
| 2 | Written Collection | Marketer | T+3 after congratulation | Quote with provenance |
| 3 | Video Production | Marketer | Qualified candidate | Recorded footage |
| 4 | Claim Verification | Clinical Reviewer / CEO | Before publication | Verified asset |
| 5 | Consent Management | Developer / Marketer | At collection | Consent record |
| 6 | Publication & Library | Marketer | On approval | Live asset |
| 7 | Performance Measurement | Marketer | Monthly | Asset-level conversion |

---

## Sub-Process 1: Candidate Selection

| Source state | Asked for | Why |
|--------------|-----------|-----|
| Exam passed | Written, maybe video | Strongest, most specific proof |
| 30+ days active, no exam | Written only | Real story, no outcome claim |
| Institutional pilot complete | Case study via Proc 15 | Different motion, different consent |
| Exam failed | **Never** | No acceptable version of this |
| Pending results | **Never** | No outcome to speak to yet |

**Decision tree:**

```
Outcome recorded
│
├─ failed?         → NEVER. Route to Core 268 support path
├─ pending?        → WAIT for results
├─ passed?         → ASK at T+3 (not at T+0)
├─ 30d active?     → ASK (written only)
└─ institutional?  → ROUTE to Proc 15 Core 257
```

**Quality gate 1:** The ask is separated from the congratulation by ≥3 days. A bundled "congratulations, please review us" converts a genuine moment into a transaction and yields a thinner quote.

---

## Sub-Process 2: Written Collection

**Prompts are the product.** Generic prompts ("how was your experience?") produce quotes indistinguishable from any competitor's.

| Prompt | What it extracts |
|--------|------------------|
| What did you use most? | Concrete feature |
| What was hardest before Bayan? | The problem solved |
| What changed in your routine? | Verifiable behaviour change |
| Who would you recommend it to? | Segmentation signal |

**UX rule:** prefill via tokenized link (F17-2), every question optional except name and consent. A forced 9-question form produces completion rates that make the whole pipeline look broken.

**Editing rule:** trimming for length is permitted; sharpening meaning is fabrication. A quote that needs help is the wrong quote.

**Decision tree:**

```
Response received
│
├─ Name + consent absent?      → INCOMPLETE, one follow-up only
├─ Quote is generic/vague?     → DO NOT PUBLISH. Collect another
├─ Quote is specific + honest? → PROVENANCE RECORD → verify
└─ Edited for length?          → OK, meaning unchanged
```

**Quality gate 2:** Every quote carries provenance — outcome source, date, form version. A library without it becomes unusable the moment someone asks whether the sample is representative.

---

## Sub-Process 3: Video Production

**Higher bar than written:** strong existing quote, genuine willingness, ideally a real outcome.

| Do | Don't |
|----|-------|
| Ask for the story | Read a script |
| Prompt for specifics | Prompt for superlatives |
| Shoot where they study | Stage it |
| Let them name what was hard | Cut all difficulty |

**Decision tree:**

```
Video candidate?
│
├─ No written quote yet?       → COLLECT WRITTEN FIRST
├─ Not willing to be identified? → WRITTEN ONLY (anonymized)
├─ Contains clinical content?  → Clinical Reviewer BEFORE publication
└─ else                       → PRODUCE
```

**Quality gate 3:** Video consent is recorded, explicit, and broader than written consent — it covers image, voice, channels, duration, territories, and withdrawal. A face cannot be quietly unpublished the way a quote can.

---

## Sub-Process 4: Claim Verification

**Verification is the difference between social proof and a liability.**

| Claim | Verifier | Rule |
|-------|----------|------|
| Clinical accuracy | Clinical Reviewer | Must match current guidance |
| Exam format | Clinical Reviewer | Must match the stated board |
| Outcome (score, pass) | Marketer + record | Must match stored outcome exactly |
| Provider comparison | CEO | Generally cut |
| Title / employer | Marketer | Only what was stated, never inferred |

**Decision tree:**

```
Asset submitted
│
├─ Outcome claim contradicts record?
│   ├─ yes → CORRECT the quote or DO NOT PUBLISH
│   └─ no  ↓
├─ Clinical claim present?  → Clinical Reviewer sign-off
├─ Provider comparison?     → CEO decision (default: cut)
└─ clean                   → APPROVED
```

**Quality gate 4:** No outcome claim publishes without a matching record. "Passed first attempt" when the record shows a prior attempt is a false claim — not a rounding error.

---

## Sub-Process 5: Consent Management

**Scoped grants, not a single checkbox:**

| Grant | Default | Note |
|-------|---------|------|
| Publication channels | Explicit list | Website / email / social are separate |
| Name attribution | Full name or anonymous role | Never pressured |
| Image use | Separate from text | Video only |
| Employer / institution name | **Separate, often declined** | Carries its own approval path |

**Withdrawal:** immediate, unqualified, within 24 hours, every channel, no negotiation.

**Decision tree:**

```
Takedown request
│
├─ Record withdrawal → unpublish ALL channels within 24h
├─ Verify schedulers and email templates are clear
├─ If prominent placement → notify CEO, schedule replacement
└─ Never: ask why, negotiate, offer anonymization uninvited
```

**Quality gate 5:** 100% of published assets have a queryable consent record. Consent living in an email thread is consent that cannot be produced on demand.

---

## Sub-Process 6: Publication & Library

**Placement matters more than volume.** Testimonials belong where the decision happens — pricing page, exam-track landing pages, post-signup confirmation.

| Tag | Use |
|-----|-----|
| Exam track | Match to landing page (OMSB quote ≠ SCFHS page) |
| Specialty | Match to specialty content |
| Objection addressed | Map to the skeptical moment |
| Format | Video / quote / case study |

**Rotation:** an asset on the homepage for two years reads as decoration. Freshness is part of credibility.

**Quality gate 6:** Quarterly review confirms consent still valid, outcome claims still accurate, and withdrawn assets genuinely gone — including from email templates and social schedulers, where published assets survive revocation.

---

## Sub-Process 7: Performance Measurement

| Metric | Definition | Caution |
|--------|------------|---------|
| Asset impressions | Views of the asset | Placement-dependent |
| Asset conversion | Signups attributed | Compare within placement |
| Collection funnel | passes → asked → responses → published | The binding constraint |
| Track coverage | Composition vs candidate population | A skewed library cannot speak to under-served tracks |

**Decision tree:**

```
Monthly review
│
├─ Asset converting well?        → KEEP, consider more placements
├─ Asset declining?              → STALE, refresh or retire
├─ Library skewed to one track?  → SOLICIT under-represented tracks
└─ Collection funnel blocked at responses?
                                 → FIX THE ASK, not the volume
```

**Quality gate 7:** Conversion is measured per asset and per placement, never in aggregate. "Testimonials work" is not a finding that supports a decision.

---

## Integration Points

**Upstream — Proc 16 Core 268:** Verified outcomes. Without honest capture, this core produces testimonials of unknown representativeness.

**Parallel — Core 269:** Sequencing partner. Testimonial ask precedes the invite ask, never bundled.

**Downstream — Proc 22 Core 262:** Impressions and asset-attributed signups are instrumented events.

**Downstream — Proc 22 Core 264:** Cohort analysis by acquisition source; referred and testimonial-driven cohorts compared against paid.

**Adjacent — Proc 15 Core 257:** Institutional case studies consume this core's output under a separate consent and approval path.

**Adjacent — Proc 16 Core 268:** Public pass-rate claims remain CEO-owned and require response-rate context, not a testimonial wall.

---

## Known Constraints

**The collection funnel is untested.** 15% testimonial conversion is a benchmark, not a Bayan finding. First cycle establishes the baseline.

**Consent schema does not exist yet.** Every gate in this blueprint assumes a queryable consent record. Until it is built, publication depends on manual record-keeping, which does not scale and will not survive an audit.

**Clinical review capacity is a real constraint.** 15+ reviewers exist, but testimonial review competes with content review. If it becomes a bottleneck, the library stalls — plan review slots rather than assuming availability.

**Outcome verification depends on Proc 16 Core 268 being live.** The strongest testimonials are outcome-based, and they cannot be verified until outcome capture is honest.

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-10-09 | Initial L2 Blueprint (Core 274) | Stage 3 Ops Team |

---

## Approval

**Blueprint Owner:** Marketer (Nasim)
**Reviewed By:**
- [ ] CEO (Dr. Abdullah Al Alawi) - Publication approval, claim policy, institutional names
- [ ] Marketer (Nasim) - Collection, production, library
- [ ] Developer (TBD) - Consent storage, takedown plumbing
- [ ] Clinical Reviewer (TBD) - Claim verification capacity

**Approved:** _____________ **Next Review:** Q1 2027
