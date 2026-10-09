# RACI-016: Delivery to Success

**Process:** Proc 16 - Delivery to Success  
**Cores:** 265 (Payment & Account Provisioning), 266 (Onboarding Handoff & First-Week Guidance), 267 (Weekly Progress Tracking & Re-Engagement), 268 (Exam Milestone Support & Success Celebration)  
**Owner:** CEO (Dr. Abdullah Al Alawi)  
**Last Updated:** 2026-10-08

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
| CEO / Founder | Dr. Abdullah Al Alawi | Strategy, clinical direction, revenue performance |
| Marketer | Nasim | Campaign execution, lifecycle messaging, reporting to CEO |
| Developer | TBD | Implementation, integration, automation |
| Clinical Reviewer | Network (15+) | Content accuracy, exam-alignment verification |
| Support Lead | TBD | User issue resolution, escalation triage |

**Scope note:** Proc 16 owns the period **after payment succeeds** through **exam outcome**. It is the retention half of the customer lifecycle. Proc 15 ends at first value; Proc 17 begins at success.

---

## Core 265: Payment & Account Provisioning

**Purpose:** Convert a successful payment into a usable, correctly-entitled account within minutes — no manual steps, no user waiting.

### Activities & RACI

| Activity | CEO | Marketer | Developer | Clinical Reviewer | Support Lead |
|----------|-----|----------|-----------|-------------------|--------------|
| **Define entitlement rules** (what each plan unlocks) | **A** | C | **R** | I | I |
| **Configure Stripe → account webhook** (KYC: no manual provisioning) | I | I | **R/A** | I | I |
| **Handle Oman-free override logic** (zero-price accounts, same entitlements) | **A** | C | **R** | I | I |
| **Send welcome/confirmation email** (see F16-1) | I | **R** | C | I | I |
| **Resolve provisioning failures** (payment succeeded, account missing) | I | I | **R/A** | I | C |
| **Reconcile payments vs entitlements** (weekly audit) | I | **A** | **R** | I | C |

### Decision Rights

**Strategic (CEO):**
- What each pricing tier entitles the user to
- Whether Oman-free accounts receive identical entitlements to paid international
- Refund policy and circumstances

**Technical (Developer):**
- Webhook retry and idempotency strategy
- Where entitlement state lives (Stripe metadata vs app database)
- Failure alerting thresholds

**Operational (Marketer / Support):**
- Tone and content of the payment confirmation email
- Escalation path when a user reports "I paid but can't access"

### Communication Flows

**Daily:** Developer → Support Lead: any provisioning failures from overnight  
**Weekly:** Marketer → CEO: payment success rate, provisioning latency  
**Monthly:** Developer → CEO: reconciliation report (payments vs active entitlements)

---

## Core 266: Onboarding Handoff & First-Week Guidance

**Purpose:** Move a new subscriber from "has access" to "has used three features" inside 7 days — the activation threshold that predicts retention.

### Activities & RACI

| Activity | CEO | Marketer | Developer | Clinical Reviewer | Support Lead |
|----------|-----|----------|-----------|-------------------|--------------|
| **Define the aha moment** (3 features in 7 days) | **A** | C | C | C | I |
| **Build onboarding drip sequence** (Day 0/3/7/21, see F16-2) | I | **R** | **R** | I | C |
| **Personalize by specialty** (route to relevant content on first login) | C | **R** | **R** | C | I |
| **Track first-week feature usage** (feeds Proc 22 Core 262) | I | C | **R/A** | I | I |
| **Intervene on stalled activation** (no feature use by Day 3) | I | **R** | C | I | **R** |
| **QA onboarding content accuracy** | I | C | I | **R/A** | I |

### Decision Rights

**Strategic (CEO):**
- Definition of activation (what counts as "aha")
- How much onboarding is automated vs human-touch for high-value segments

**Content (Clinical Reviewer):**
- Accuracy of any clinical content surfaced during onboarding
- Whether specialty routing is clinically appropriate

**Technical (Developer):**
- Email automation platform and trigger logic
- Session/feature-usage event implementation

### Communication Flows

**Weekly:** Marketer → CEO: Day-7 activation rate, drop-off point in drip  
**Monthly:** Marketer → CEO + Clinical Reviewer: onboarding content performance

---

## Core 267: Weekly Progress Tracking & Re-Engagement

**Purpose:** Keep subscribed learners studying on a cadence, detect disengagement early, and win back users before they churn.

### Activities & RACI

| Activity | CEO | Marketer | Developer | Clinical Reviewer | Support Lead |
|----------|-----|----------|-----------|-------------------|--------------|
| **Define engagement tiers** (active / at-risk / dormant) | **A** | **R** | C | I | C |
| **Build weekly progress digest** (questions answered, weak areas) | C | **R** | **R** | C | I |
| **Implement re-engagement triggers** (7/14/30 days inactive, see F16-3) | I | **R** | **R** | I | C |
| **Monitor cohort retention curves** (M1/M3/M6, feeds Proc 22 Core 264) | **A** | C | C | I | I |
| **Analyze churn reasons** (exit survey + behavioral signals) | **A** | **R** | C | I | **R** |
| **Escalate at-risk high-value accounts** (annual plans, institutional seats) | **A** | **R** | I | I | **R** |

### Decision Rights

**Strategic (CEO):**
- Churn rate targets by cohort month
- When to spend effort on winback vs let churn happen
- Which accounts are "high-value" enough for human outreach

**Analytical (Marketer):**
- Tier thresholds (what activity level = at-risk)
- Which behavioral signals predict churn
- Digest content and cadence

### Communication Flows

**Weekly:** Marketer → CEO: retention snapshot, at-risk account count  
**Monthly:** Marketer → CEO: full churn report with root causes and interventions  
**Quarterly:** CEO → leadership: retention targets vs actuals, strategic adjustments

---

## Core 268: Exam Milestone Support & Success Celebration

**Purpose:** Support the learner through their actual exam, capture the outcome, and convert a pass into social proof and referral fuel.

### Activities & RACI

| Activity | CEO | Marketer | Developer | Clinical Reviewer | Support Lead |
|----------|-----|----------|-----------|-------------------|--------------|
| **Track exam dates** (self-reported + inferred from study pattern) | C | **R** | **R** | I | C |
| **Deliver exam-week support** (final review plan, calm-down messaging) | I | **R** | C | **C** | I |
| **Capture exam outcome** (pass/fail survey, see F16-4) | **A** | **R** | **R** | I | C |
| **Celebrate passes** (congratulation + testimonial ask) | I | **R** | C | I | I |
| **Handle failures with care** (no false cheer; offer retake path) | **A** | **R** | C | **C** | **R** |
| **Hand off passes to Proc 17** (referral + testimonial capture) | I | **R** | C | I | I |
| **Report outcome rates** (pass rate by cohort, exam type) | **A** | **R** | C | C | I |

### Decision Rights

**Strategic (CEO):**
- How Bayan talks about pass rates publicly (claims must be defensible)
- Whether to offer retake discounts or guarantees
- Sensitivities around failure messaging — clinical, non-patronizing

**Content (Clinical Reviewer):**
- Accuracy of exam-week clinical guidance
- Appropriateness of any claims about exam alignment

### Communication Flows

**Per exam cycle:** Marketer → CEO: outcome rate, notable testimonials  
**Monthly:** Marketer → CEO: aggregate pass rate by exam type and cohort  
**Quarterly:** Marketer → Proc 17 owner: qualified referral and testimonial pipeline

---

## Cross-Core Dependencies

**Core 265 → Core 266:** Provisioning must complete before onboarding can begin. If entitlements are wrong, onboarding emails point at inaccessible content.

**Core 266 → Core 267:** No activation means no cadence to track. Users who never hit the aha moment will churn in M0 regardless of re-engagement effort.

**Core 267 → Core 268:** Retention data reveals who is genuinely on track to sit their exam. Users disengaged for 30+ days rarely have a real exam date.

**Core 268 → Proc 17:** Exam passes are the input for referral and testimonial capture. No outcome data = no social proof engine.

**Proc 16 → Proc 22 (all cores):** Every activity here produces events that Proc 22 instruments. Activation, engagement tiers, churn, and exam outcomes are all unmeasurable without Proc 22 Core 262 (event instrumentation) live.

---

## Notes

**Team structure assumption:** This RACI assumes a lean team. Marketer (Nasim) carries both lifecycle messaging and analysis today. If a dedicated Data Analyst or Lifecycle Manager is hired, split the Marketer's analytical responsibilities to them and keep campaign execution with Marketing.

**Outsourced work:** If email automation is outsourced, the Developer role maps to "External Developer" with the CEO as internal accountable for vendor management.

**Named individuals:** Only the CEO (Dr. Abdullah Al Alawi) and Marketer (Nasim) are named. All other roles are TBD pending hires — do not treat TBD roles as assigned.

**Duplicate-core warning (Proc 17 only, not Proc 16):** Proc 17 currently contains 5 duplicate "Peer Invite Mechanics" cores (IDs 269-273). Proc 16 cores (265-268) are unique and correctly named. Cleanup of Proc 17 is pending a decision on which core to keep.

---

## Approval & Sign-Off

**RACI Reviewers:**
- [ ] CEO (Dr. Abdullah Al Alawi) - Strategy, decision rights, outcome claims
- [ ] Marketer (Nasim) - Lifecycle execution, reporting cadence
- [ ] Developer (TBD) - Implementation feasibility, automation
- [ ] Clinical Reviewer (TBD) - Clinical content accuracy
- [ ] Support Lead (TBD) - Escalation paths, workload

**Approval Date:** _____________  
**Next Review:** Q1 2027 (or when team structure changes)