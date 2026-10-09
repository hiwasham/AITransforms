# RACI-017: Success to Lead

**Process:** Proc 17 - Success to Lead
**Cores:** 269 (Peer Invite Mechanics), 274 (Testimonial & Case Study Capture)
**Owner:** CEO (Dr. Abdullah Al Alawi)
**Last Updated:** 2026-10-09

---

## RACI Legend

- **R (Responsible)**: Does the work
- **A (Accountable)**: Final decision authority, single point of accountability
- **C (Consulted)**: Provides input before decisions/actions
- **I (Informed)**: Kept updated on progress/decisions

---

## Stakeholder Roster

| Role | Name | Responsibilities |
|------|------|------------------|
| CEO / Founder | Dr. Abdullah Al Alawi | Referral reward policy, claims approval, incentive economics |
| Marketer | Nasim | Invite mechanics, testimonial pipeline, campaign execution |
| Developer | TBD | Referral infrastructure, attribution, form implementation |
| Clinical Reviewer | Network (15+) | Accuracy of any clinical claim in published testimonials |
| Support Lead | TBD | Referral dispute resolution, testimonial consent questions |

**Scope note:** Proc 17 is the **advocacy** half of the customer lifecycle. It begins at a real outcome (exam pass or sustained product use) and ends at an attributed new lead. It is not a growth-hack layer bolted onto acquisition — every mechanic here runs on evidence produced by Proc 16 Core 268.

**Hard precondition:** Proc 17 cannot produce trustworthy output without honest outcome capture. A testimonial sourced from an unverified or self-selected pass is selection bias wearing the costume of evidence.

---

## Core 269: Peer Invite Mechanics

**Purpose:** Convert a satisfied learner's social capital into attributed new signups, without turning the relationship transactional or the reward program into a fraud surface.

### Activities & RACI

| Activity | CEO | Marketer | Developer | Clinical Reviewer | Support Lead |
|----------|-----|----------|-----------|-------------------|--------------|
| **Define reward structure** (what referrer and referee each get) | **A** | **R** | C | I | I |
| **Set eligibility gate** (when an invite may be offered) | **A** | **R** | C | I | I |
| **Build referral code generation + attribution** | I | C | **R/A** | I | I |
| **Write invite templates (multi-language, RTL)** | I | **R** | C | I | I |
| **Enforce invite frequency cap** (anti-spam) | I | C | **R/A** | I | I |
| **Detect and block referral fraud** (self-referral, disposable domains) | **A** | C | **R** | I | C |
| **Honor rewards on qualified conversion** | **A** | C | **R** | I | **R** |
| **Resolve referral disputes** (reward not credited, disputed attribution) | I | C | C | I | **R/A** |
| **Report referral CAC and conversion by channel** | I | **A** | **R** | I | I |

### Decision Rights

**Strategic (CEO):**
- Reward value and form (free month, credit, cash, feature unlock)
- Whether rewards are two-sided and how the two sides balance
- Eligibility gate: what constitutes a genuine success worth inviting from
- Fraud policy: what happens to an account caught self-referring
- Any publicly stated referral claim

**Technical (Developer):**
- Code generation scheme and collision resistance
- Attribution window and cookie/parameter persistence
- Fraud-signal implementation and threshold tuning
- Where referral state lives relative to the billing system

**Operational (Marketer / Support):**
- Which lifecycle moment triggers the invite ask
- Template copy, tone, and language variants
- Suppression rules (who must never receive an invite ask)
- How disputes are triaged and what evidence resolves them

### Communication Flows

**On each invite sent:** Developer → Marketer: send + suppression log
**Weekly:** Marketer → CEO: invites sent, redemption rate, flagged fraud attempts
**Monthly:** Marketer → CEO: referral CAC vs paid CAC, by channel (email / WhatsApp / SMS / link)
**On fraud detection:** Developer → CEO: incident summary, accounts affected, recommended action
**On dispute:** Support Lead → CEO: only when the dispute exceeds the Support Lead's authority (typically anything involving a refund or account action)

---

## Core 274: Testimonial & Case Study Capture

**Purpose:** Turn verified exam passes and sustained product use into honest, consented social proof — the kind that survives a skeptical prospective customer reading it.

### Activities & RACI

| Activity | CEO | Marketer | Developer | Clinical Reviewer | Support Lead |
|----------|-----|----------|-----------|-------------------|--------------|
| **Define testimonial request policy** (who, when, how often) | **A** | **R** | I | I | C |
| **Trigger request from verified outcome** (Core 268) | I | **R** | **R/A** | I | I |
| **Collect written testimonials** (F17-2) | I | **R** | C | I | I |
| **Collect video testimonials** (F17-3) | **A** | **R** | C | I | I |
| **Verify claims in a testimonial** (clinical accuracy, outcome claims) | **A** | C | I | **R** | I |
| **Obtain and record consent** (publication, name, image, employer) | **A** | **R** | **R** | I | C |
| **Publish approved testimonials** | **A** | **R** | C | C | I |
| **Maintain case study library** (with provenance) | I | **R/A** | C | I | I |
| **Honor takedown requests** | **A** | **R** | **R** | I | **R** |
| **Report social-proof performance** (conversion lift per asset) | I | **A** | **R** | I | I |

### Decision Rights

**Strategic (CEO):**
- What may be claimed publicly and in what wording
- Whether institutional names may be used (employer, hospital, university)
- Whether to publish a video testimonial (a person's face is a different commitment than a quote)
- Response to a retraction or negative follow-up from a former testimonial subject

**Technical (Developer):**
- Token generation and expiry for personalized testimonial links
- Consent record storage and retention period
- Media hosting and access control

**Operational (Marketer / Support):**
- Which passes are asked for a testimonial and in what order
- Interview scheduling and question sequencing
- Takedown request handling

### Communication Flows

**On each pass flagged:** Proc 16 Core 268 → Marketer: candidate list
**Weekly:** Marketer → CEO: testimonials collected, published, pending consent
**On clinical claim:** Clinical Reviewer → CEO: verdict on accuracy before publication
**On takedown:** Support Lead → CEO + Marketer: request, asset location, action taken
**Monthly:** Marketer → CEO: conversion performance by testimonial asset

---

## Cross-Core Dependencies

**Core 268 (Proc 16) → Core 269:** Exam passes are the eligibility input. No outcome data means invites fire on the wrong population — active users who may fail, or dormant users who never engaged.

**Core 268 → Core 274:** Same input. A pass with a strong quote is the raw material for the case study pipeline.

**Core 269 ↔ Core 274:** Deliberate sequence, not parallel. The testimonial ask precedes the referral ask, and the two never share an email (SOP-268 §4.4). Bundling them converts a genuine moment into an upsell.

**Core 269 → Proc 22 Core 262:** Every invite sent, opened, clicked, and redeemed is an instrumented event. Referral CAC is uncomputable without it.

**Core 274 → Proc 22 Core 264:** Testimonial-attributed signups feed cohort analysis. If referred cohorts retain differently from paid cohorts, that is a finding the CEO needs.

**Proc 17 → Proc 15 (Motion B, Core 257):** Institutional referrals follow the B2B motion, not this consumer referral path. Route them separately.

---

## Notes

**Team structure assumption:** Marketer (Nasim) currently owns both invite mechanics and the testimonial pipeline. These are different skills — growth mechanics vs. content production — and should split when headcount allows.

**Named individuals:** Only the CEO (Dr. Abdullah Al Alawi) and Marketer (Nasim) are named. All other roles are TBD pending hires — do not treat TBD roles as assigned.

**⚠️ Duplicate-core warning (Proc 17 specific):** Proc 17 currently contains **five** cores named "Peer Invite Mechanics" — IDs **269, 270, 271, 272, 273** — all created 2026-10-06 between 20:21 and 20:28, all empty. This looks like a creation retry loop. The decision on record (2026-10-09) is: **keep 269** (earliest, matches the ascending-ID convention used elsewhere) and delete 270-273 newest-first. **All Proc 17 documentation references core 269.** Deletion is pending — Stage 3 HQ access lapsed 2026-10-09 (trial ended), so the cleanup has not been executed. Do not attach these docs to cores 270-273.

**Reward economics caution:** A referral reward that exceeds a month of gross margin teaches users to refer for the reward rather than because the product worked. Both the invite volume and the redemption quality must be watched together.

---

## Approval & Sign-Off

**RACI Reviewers:**
- [ ] CEO (Dr. Abdullah Al Alawi) - Reward policy, claims approval, fraud actions
- [ ] Marketer (Nasim) - Invite mechanics, testimonial pipeline
- [ ] Developer (TBD) - Referral infrastructure, attribution, consent storage
- [ ] Clinical Reviewer (TBD) - Clinical claim verification
- [ ] Support Lead (TBD) - Dispute handling, takedown requests

**Approval Date:** _____________
**Next Review:** Q1 2027 (or when the Proc 17 duplicate cores are resolved)
