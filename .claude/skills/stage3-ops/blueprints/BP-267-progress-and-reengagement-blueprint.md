# BP-267: Weekly Progress Tracking & Re-Engagement Blueprint

**Process:** Proc 16 - Delivery to Success  
**Core:** 267  
**Level:** L2 Blueprint (Functional Breakdown)  
**Owner:** Marketer (Nasim)  
**Accountable:** CEO (Dr. Abdullah Al Alawi)  
**Version:** 1.0  
**Last Updated:** 2026-10-08

---

## Purpose

Break Core 267 into its functional sub-processes, define the tier logic that governs who gets contacted and when, and specify the quality gates that keep retention analysis honest.

---

## Sub-Process Breakdown

| # | Sub-process | Owner | Trigger | Output |
|---|-------------|-------|---------|--------|
| 1 | Engagement Tier Computation | Developer | Daily | Tier per user + transition log |
| 2 | Weekly Progress Digest | Marketer | Weekly schedule | Digest to active users |
| 3 | Re-Engagement Triggers | Marketer | Tier transition | Conditional sequences |
| 4 | Cohort Retention Analysis | Marketer | Monthly | Retention curves |
| 5 | Churn Reason Analysis | Marketer | Monthly | Root causes with owners |
| 6 | High-Value Escalation | Support Lead | Weekly | Human outreach |

---

## Sub-Process 1: Engagement Tier Computation

**Tiers are recency of *meaningful activity*, not login.**

| Tier | Definition |
|------|------------|
| `active` | Meaningful activity within 7 days |
| `slipping` | 8-14 days inactive |
| `at_risk` | 15-29 days inactive |
| `dormant` | 30+ days inactive |
| `never_activated` | No meaningful activity ever |

**Meaningful activity** = content interaction. MCQ practice, OSCE video, study plan task, article read. A login with no interaction is not engagement — tracking logins as activity produces a tier system that reports health while users churn.

**Decision tree:**

```
Daily computation per user
│
├─ Has never interacted with content?
│   └─ never_activated → Core 266 path (activation problem, not retention)
│
├─ Last meaningful activity ≤7d?   → active
├─ ≤14d?                           → slipping
├─ ≤30d?                           → at_risk
└─ >30d?                           → dormant
```

**Quality gate 1:** Tier *transitions* are recorded, not just current state. A user who is `slipping` today and was `active` all along is a different case from one who has been drifting for months — and only the transition log distinguishes them.

---

## Sub-Process 2: Weekly Progress Digest

**Digest contents:**

| Element | Source | Purpose |
|---------|--------|---------|
| Questions answered this week | feature_usage | Concrete progress |
| Weak areas identified | quiz results | Shows the product is paying attention |
| Streak / consistency | session history | Reinforces the behaviour that predicts retention |
| One suggested next action | weakest area | Removes "what now" friction |

**Decision tree:**

```
Building digest for user
│
├─ Questions answered this week = 0?
│   └─ DO NOT SEND. Route to re-engagement path instead.
│
├─ Tier = active?
│   └─ Standard digest
│
└─ Tier = slipping?
    └─ Acknowledge the gap warmly; offer ONE easy re-entry point.
        Not a summary of what they missed.
```

**Why an empty digest is worse than no digest:** a progress email showing zero progress reads as an accusation. The user already knows they did nothing; the email confirms someone is watching.

**Quality gate 2:** No digest sends with zero activity.

---

## Sub-Process 3: Re-Engagement Triggers

**Triggers fire on transition, not on a scheduled scan.**

| Transition | Sequence | Tone |
|------------|----------|------|
| active → slipping | 1 light nudge | No guilt |
| slipping → at_risk | 2 emails | Value reminder |
| at_risk → dormant | 2 emails | Last call, honest |

**Why transition-triggered beats batch:** a scheduled scan contacts users on whatever day the job runs, which may be days after they went quiet. Transition triggers contact them at the right moment, which is the entire point of the tier system.

**Decision tree — suppression:**

```
About to send re-engagement email
│
├─ User has had meaningful activity since transition? → SUPPRESS
├─ Any lifecycle email sent in last 72h?              → SUPPRESS (frequency cap)
├─ Exam already passed (Core 268)?                    → SUPPRESS, route to Proc 17
├─ Unsubscribed?                                      → SUPPRESS
└─ Otherwise                                          → SEND
```

**Quality gate 3 — frequency cap:** no user receives more than one lifecycle email per 72 hours, regardless of how many sequences trigger. Overlapping automations are the fastest route to the spam folder, and a spam-folder user is invisible to every other retention mechanism.

**Quality gate 4 — success suppression:** a user who passed their exam is suppressed from all re-engagement. "We miss you" sent to someone who passed and moved on is the worst-tone email in the system.

---

## Sub-Process 4: Cohort Retention Analysis

**Monthly. Grouped by signup month.**

**Critical segmentation rule:** Oman-free and paid cohorts are analysed **separately**. Mixing them makes both curves meaningless — different incentives, different intent, different retention. A blended curve describes neither population.

**Decision tree:**

```
Building retention curve
│
├─ Segment: oman_free is separate from paid?
│   └─ If not, STOP. The curve is meaningless.
│
├─ Cohort size ≥10?
│   └─ No → report as "insufficient sample (n=X)", exclude from trends
│
└─ Compare against prior cohorts
    ├─ Newer cohort worse → something regressed, find it
    └─ Newer cohort better → identify what changed, replicate
```

**Quality gate 5:** Cohorts under 10 users are flagged, never trended.

---

## Sub-Process 5: Churn Reason Analysis

**Voluntary and involuntary churn are reported separately.**

| Type | Cause | Owner |
|------|-------|-------|
| Voluntary | User decided to leave | This core |
| Involuntary | Card declined, dunning | Core 265 |

**Decision tree:**

```
Churn recorded
│
├─ Payment failure involved?
│   ├─ Yes → INVOLUNTARY. Route to Core 265 dunning. Exclude from product churn rate.
│   └─ No  → VOLUNTARY. Continue.
│
├─ Engagement tier at cancellation:
│   ├─ dormant/at_risk → retention failure happened weeks earlier (this core)
│   ├─ active           → genuine product gap or life event (route by reason)
│   └─ never_activated  → onboarding failure (Core 266)
│
└─ Specialty-patterned?
    └─ Yes → clinical content gap (Clinical Reviewer)
```

**Why separating them matters:** conflating involuntary churn with voluntary churn makes the churn rate look like a product problem when it is a billing problem — and sends the wrong team to fix it. Involuntary churn is fixed by dunning; voluntary by product and cadence.

**Quality gate 6:** Churn rate reported in two numbers, never one blended figure.

---

## Sub-Process 6: High-Value Escalation

**Definition of high-value (CEO-owned):** annual subscribers, institutional seats, named institutional relationships.

**Decision tree:**

```
High-value account reaches at_risk
│
└─ Human touch — a real conversation about what stopped working.
    NOT a discount offer.
```

**Why not a discount:** discounting a disengaged annual subscriber teaches them that disengaging produces discounts. It converts a retention problem into a permanent pricing problem.

---

## Exception Handling

| Exception | Detection | Response |
|-----------|-----------|----------|
| Burst learner | Repeated 2-3 week gaps + high activity spikes | Segment out of re-engagement; identify by activity variance |
| Exam passed | Core 268 outcome = passed | Suppress all re-engagement; route to Proc 17 |
| Dunning in progress | Failed invoice, entitlements active | Exclude from tiers — inactivity may be unrelated |
| Cohort-wide dormancy | Correlated across an institution | Calendar signal (term break), not individual churn. Notify institutional contact |
| Email unsubscribe, product active | Unsubscribe event + sessions continue | Respect absolutely; track email and product engagement separately |

---

## Integration Points

**Upstream — Core 266:** activation is the precondition. Non-activated users belong in the activation path, not the retention path.

**Downstream — Core 268:** retention data determines who genuinely has an upcoming exam. Users dormant 30+ days rarely sit on schedule.

**Proc 22 Core 264 (Unit Economics):** consumes retention curves for LTV and payback. Without this core's segmentation discipline, LTV is computed on a blended population and is wrong.

**Proc 22 Core 262:** consumes `session_start`, `feature_used`, `subscription_canceled`.

---

## Quality Gates Summary

| Gate | Location | Blocks what |
|------|----------|-------------|
| 1 | Transition log recorded | Inability to distinguish drifting from long-term disengaged |
| 2 | No zero-activity digest | Accusatory emails to inactive users |
| 3 | 72-hour frequency cap | Spam classification, which hides the user from all retention |
| 4 | Success suppression | "We miss you" to passed users |
| 5 | Small cohorts flagged | Trend lines built on noise |
| 6 | Voluntary/involuntary split | Misdiagnosis of a billing problem as a product problem |

---

## Known Constraints

**Tier thresholds are assumptions.** 7/14/30 days are industry-reasonable, not validated for Bayan's exam-prep cadence. A learner preparing for an exam eight months out may legitimately study in bursts. Thresholds require revision once real cadence data exists.

**Retention targets are benchmarks, not Bayan findings.** The M1 >60%, M3 >50%, M6 >40% targets are conservative SaaS figures. Bayan has no baseline — every target in this blueprint is un-instrumented until Proc 22 Core 262 is live.

**Exit survey does not exist yet.** Churn reason analysis depends on it. Without it, churn is measurable but not diagnosable.

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-10-08 | Initial L2 Blueprint | Stage 3 Ops Team |

---

## Approval

**Blueprint Owner:** Marketer (Nasim)  
**Reviewed By:**
- [ ] CEO (Dr. Abdullah Al Alawi) - Churn targets, high-value definition
- [ ] Marketer (Nasim) - Tier rules, sequences, analysis
- [ ] Developer (TBD) - Tier computation, triggers, frequency cap
- [ ] Support Lead (TBD) - Escalation capacity

**Approved:** _____________ **Next Review:** Q1 2027