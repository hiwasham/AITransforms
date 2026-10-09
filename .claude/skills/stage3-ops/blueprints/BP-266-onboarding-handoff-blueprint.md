# BP-266: Onboarding Handoff & First-Week Guidance Blueprint

**Process:** Proc 16 - Delivery to Success  
**Core:** 266  
**Level:** L2 Blueprint (Functional Breakdown)  
**Owner:** Marketer (Nasim)  
**Accountable:** CEO (Dr. Abdullah Al Alawi)  
**Version:** 1.0  
**Last Updated:** 2026-10-08

---

## Purpose

Break Core 266 into its functional sub-processes, define the routing and suppression logic that governs the first week, and specify the quality gate that determines whether a new subscriber activates.

---

## Sub-Process Breakdown

| # | Sub-process | Owner | Trigger | Output |
|---|-------------|-------|---------|--------|
| 1 | Activation Definition | CEO | One-time, quarterly review | A measurable activation threshold |
| 2 | First-Login Routing | Developer | First authenticated session | Personalized destination |
| 3 | First-Week Sequence | Marketer | `provisioning_verified` | 4 conditional emails |
| 4 | Stalled-Activation Intervention | Support Lead | No usage by Day 3 | One human touch |
| 5 | Onboarding Content QA | Clinical Reviewer | Content change | Signed-off content |

---

## Sub-Process 1: Activation Definition

**The threshold: 3 distinct features used within 7 days of signup.**

**Why three features and not one:** a single-feature user has sampled the product. A three-feature user has built a cross-content habit — the pattern that predicts renewal. This is the leading indicator the whole retention motion rests on.

**What counts as a feature:**

| Feature | Threshold to count |
|---------|--------------------|
| MCQ practice | ≥10 questions answered |
| OSCE video | ≥1 video watched past 50% |
| Study plan | Plan generated + ≥1 task completed |
| Article/reference | ≥1 read to end |

**Decision tree:**

```
User's first 7 days
│
├─ 3+ features?          → ACTIVATED
├─ 1-2 features?         → Feature-discovery nudge (Email 2)
├─ 0 features, logged in?→ Human touch (sub-process 4)
└─ 0 features, no login? → Delivery problem, not motivation
```

**Quality gate 1 — the definition must be predictive.** If activated users do not retain meaningfully better than non-activated users, the definition is wrong and gets replaced. Recheck at 90 days of data.

---

## Sub-Process 2: First-Login Routing

**Purpose:** Land the user on their own problem, not a generic dashboard. Generic entry is the most common activation killer.

**Routing matrix:**

| Specialty | MCQ destination | Video destination |
|-----------|-----------------|-------------------|
| Internal Medicine | /mcq/internal-medicine | /osce/im |
| Surgery | /mcq/surgery | /osce/surgery |
| Pediatrics | /mcq/pediatrics | /osce/peds |
| Nursing | /mcq/nursing | /osce/nursing |
| Emergency | /mcq/emergency | /osce/em |
| Unknown | Internal Medicine (largest cohort) | /osce/im |

**Failure behaviour:** unknown specialty defaults to Internal Medicine and asks inline once. It never blocks progress with a modal — a registration question standing between the user and their first question is a conversion tax.

**Emitted event:** `onboarding_routed { specialty, exam_track, landed_on }` — this is how Proc 22 measures whether routing actually lifts activation.

---

## Sub-Process 3: First-Week Sequence

**The sequence:**

| Email | Day | Fires when | Goal |
|-------|-----|------------|------|
| 1 — Welcome | 0 | Always (post-verification) | Orient + one clear first action |
| 2 — Feature discovery | 3 | Used <3 features | Surface untried features |
| 3 — Progress nudge | 7 | Not activated | Urgency + social proof |
| 4 — Check-in | 21 | Any state | Reinforcement or recovery |

**Suppression logic — the critical decision:**

```
Before sending Email N:
│
├─ User unsubscribed?              → SUPPRESS
├─ Already activated (3 features)? → SUPPRESS emails 2 and 3
├─ Institutional pilot account?    → SUPPRESS entire sequence
└─ Otherwise                       → SEND
```

**Why suppression matters more than copy:** sending "you haven't started yet" to a user who activated on Day 1 damages trust precisely with the users who were succeeding. This is the single highest-impact bug class in the sequence.

**Quality gate 2:** Every condition tested against a seeded scenario set before deploy. Minimum cases: activated Day 1, never logged in, unsubscribed, institutional pilot.

---

## Sub-Process 4: Stalled-Activation Intervention

**Decision tree:**

```
Day 3, zero feature usage
│
├─ Ever logged in?
│   ├─ No  → DELIVERY problem
│   │         Check: spam placement, bounce, wrong address
│   │         Do NOT send more email
│   └─ Yes → MOTIVATION problem
│             One human touch, personally written
│
└─ No reply to human touch?
    → Return to automated sequence. Do not send a second personal email.
```

**The distinction is the whole sub-process.** More emails do not fix a deliverability problem — they worsen it. Before assuming a user lost interest, confirm the email reached them at all.

**One touch, not a campaign.** A second personal email from the same person reads as pressure.

---

## Sub-Process 5: Onboarding Content QA

**Handoff protocol (Marketer → Clinical Reviewer):**

```
Marketer assembles  → Clinical Reviewer verifies → Marketer deploys
                      (clinical claims, exam alignment)
```

**What the reviewer checks:**

| Check | Failure means |
|-------|---------------|
| Clinical accuracy | Wrong content in the first week — worst possible time |
| Exam-track alignment | SCFHS content shown to an OMSB candidate |
| Brand compliance | Navy + gold, Omani cultural fidelity, English-first |

**Quality gate 3:** No onboarding content ships without a logged reviewer sign-off.

---

## Exception Handling

| Exception | Detection | Response |
|-----------|-----------|----------|
| User activated Day 1 | feature_usage ≥3 within 24h | Verify real person; if bot, filter — never celebrate inflated numbers |
| Single feature, 30 days | 1 feature, ≥10 sessions | Do not force multi-feature. Flag: if common, the definition is wrong, not the user |
| Institutional cohort arrives | Account tagged `institutional_pilot` | Cohort onboarding (Proc 15 Core 257), suppress individual drip |
| User replies to automated email | Reply to no-reply | Must route to a monitored inbox — silence to a learner is a churn event |
| Email bounces | Bounce webhook | Remove from sequence, flag for support follow-up |

---

## Integration Points

**Upstream — Core 265:** `provisioning_verified` is the trigger. This core never fires on payment success alone.

**Downstream — Core 267:** Activation is the precondition for cadence tracking. Users who never activate churn in M0 regardless of re-engagement effort.

**Proc 22 Core 262:** Consumes `onboarding_routed`, `feature_used`, `activation_achieved`. Without these events, activation rate is unmeasurable.

**Proc 15 Core 255:** Shares the first-value concept but different ownership. Core 255 covers pre-payment first value; Core 266 covers post-payment first week. Institutional accounts route to Core 257 instead.

---

## Quality Gates Summary

| Gate | Location | Blocks what |
|------|----------|-------------|
| 1 | Activation definition is predictive | An unmeasurable retention signal |
| 2 | Suppression logic verified on seeded cases | Wrong emails to succeeding users |
| 3 | Reviewer sign-off on onboarding content | Inaccurate clinical content in week one |

---

## Known Constraints

**Activation definition is an assumption until tested.** 3-features-in-7-days is an industry-reasonable starting point, not a validated Bayan finding. It requires 90 days of data before it can be trusted, and it must be revised if it fails to separate retained from churned users.

**Specialty and exam-track data is assumed capturable.** If registration does not currently collect these, routing degrades to the default and personalization is unavailable. Capturing them is a prerequisite, not an enhancement.

**Feature taxonomy may not match the product.** The four features listed are the assumed major content types. Verify against the actual product surface before implementing thresholds.

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-10-08 | Initial L2 Blueprint | Stage 3 Ops Team |

---

## Approval

**Blueprint Owner:** Marketer (Nasim)  
**Reviewed By:**
- [ ] CEO (Dr. Abdullah Al Alawi) - Activation definition, automation policy
- [ ] Marketer (Nasim) - Sequence, routing, suppression
- [ ] Developer (TBD) - Triggers, routing implementation
- [ ] Clinical Reviewer (TBD) - Content accuracy

**Approved:** _____________ **Next Review:** Q1 2027