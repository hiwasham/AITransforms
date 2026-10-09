# SOP-266: Onboarding Handoff & First-Week Guidance

**Process:** Proc 16 - Delivery to Success  
**Core:** 266  
**Owner:** Marketer (Nasim)  
**Accountable:** CEO (Dr. Abdullah Al Alawi)  
**Version:** 1.0  
**Last Updated:** 2026-10-08

---

## Purpose

Move a newly-provisioned subscriber from "has access" to "has used three features within 7 days" — the activation threshold that predicts whether they will still be a subscriber in month three.

---

## Scope

**In Scope:**
- First-week email sequence (Day 0 / 3 / 7 / 21)
- First-login routing by specialty and exam track
- Activation tracking (feeds Proc 22 Core 262)
- Stalled-activation intervention
- Onboarding content accuracy QA

**Out of Scope:**
- Payment and provisioning (Core 265)
- Ongoing engagement cadence after week 1 (Core 267)
- Paywall and pricing decisions (Proc 14 Core 259)

---

## Roles & Responsibilities

| Role | Responsibility |
|------|----------------|
| Marketer (Nasim) | Sequence content, routing logic, activation analysis |
| Developer | Automation triggers, event tracking, routing implementation |
| Clinical Reviewer | Accuracy of clinical content surfaced in onboarding |
| Support Lead | Stalled-user outreach, frontline questions |
| CEO | Definition of activation, automation-vs-human-touch policy |

---

## Prerequisites

- [ ] Core 265 provisioning verified working (user can actually log in)
- [ ] User specialty and exam track captured at registration
- [ ] Email automation platform live
- [ ] Feature-usage events instrumented (Proc 22 Core 262)

**Hard dependency:** Do not run this SOP on top of broken provisioning. Sending onboarding emails to users who cannot access the product converts a billing problem into a trust problem.

---

## Procedure

### 1. Define and Confirm the Activation Threshold

**Frequency:** One-time, revisit quarterly  
**Owner:** CEO (decision), Marketer (measurement)

**Steps:**

1.1. **Bayan's activation definition: 3 distinct features used within 7 days of signup.**

Rationale: single-feature use is a trial; three features means the learner has built a habit across content types. This is the leading indicator for M1+ retention.

1.2. Define what counts as a feature:

| Feature | Counts when... |
|---------|----------------|
| MCQ practice | ≥10 questions answered |
| OSCE video | ≥1 video watched >50% |
| Study plan | Plan generated and ≥1 task completed |
| Article/reference | ≥1 read to end |

1.3. Track activation as a boolean per user, stored and timestamped:

```sql
-- Activation flag, recomputed daily
UPDATE users u
SET activated_at = sub.activated_at
FROM (
    SELECT user_id,
           MIN(created_at) AS activated_at
    FROM feature_usage
    WHERE created_at <= users.created_at + INTERVAL '7 days'
    GROUP BY user_id
    HAVING COUNT(DISTINCT feature) >= 3
) sub
WHERE u.id = sub.user_id AND u.activated_at IS NULL;
```

**Output:** Activation definition agreed and unambiguously measurable

---

### 2. Route the First Login

**Frequency:** Automatic on first authenticated session  
**Owner:** Developer (implementation), Marketer (routing rules)

**Steps:**

2.1. On first login, route the user to content matching their stated specialty and exam track. Generic dashboards are the most common activation killer — the user sees breadth, not their problem.

```javascript
const ROUTING = {
  'internal_medicine': { mcq: '/mcq/internal-medicine', video: '/osce/im' },
  'surgery':           { mcq: '/mcq/surgery',           video: '/osce/surgery' },
  'pediatrics':        { mcq: '/mcq/pediatrics',        video: '/osce/peds' },
  'nursing':           { mcq: '/mcq/nursing',           video: '/osce/nursing' },
  'emergency':         { mcq: '/mcq/emergency',         video: '/osce/em' },
};

function firstLoginRedirect(user) {
  const route = ROUTING[user.specialty] ?? ROUTING['internal_medicine'];
  analytics.track('onboarding_routed', {
    user_id: user.id,
    specialty: user.specialty,
    exam_track: user.exam_track,   // OMSB, SCFHS, DHA, Arab Board
    landed_on: route.mcq,
  });
  return route.mcq;
}
```

2.2. If specialty is unknown, default to Internal Medicine (largest cohort) and ask once, inline — do not block progress with a modal.

2.3. Track the routing event so Proc 22 can measure whether routing actually improves activation.

**Output:** Personalized first-login destination, routing event tracked

---

### 3. Run the First-Week Sequence

**Frequency:** Automatic, triggered by provisioning  
**Owner:** Marketer (content), Developer (automation)

**Steps:**

3.1. Deploy the 4-email sequence from **F16-2**:

| Email | Day | Trigger condition | Goal |
|-------|-----|-------------------|------|
| 1 — Welcome | 0 | Provisioning verified | Orient, one clear first action |
| 2 — Feature discovery | 3 | Used <3 features | Surface features they haven't tried |
| 3 — Progress nudge | 7 | Not yet activated | Urgency + social proof |
| 4 — Check-in | 21 | Any state | Habit reinforcement or recovery |

3.2. **Suppress emails on condition, not schedule.** A user who activated on Day 1 must not receive the Day-7 "you haven't started" email. This is the most common automation failure and it damages trust with exactly the users who were succeeding.

```python
def should_send(user, email_num):
    if email_num == 2 and user.feature_count >= 3:
        return False   # Already activated
    if email_num == 3 and user.activated_at:
        return False   # Already activated
    if user.unsubscribed:
        return False
    return True
```

3.3. Personalize by specialty. Link targets must come from the same routing table as step 2.

3.4. Log every send with its suppression decision, so the sequence can be debugged.

**Output:** Sequence live, suppression logic tested

---

### 4. Intervene on Stalled Activation

**Frequency:** Daily check  
**Owner:** Support Lead (outreach), Marketer (analysis)

**Steps:**

4.1. Identify users with zero feature usage 3 days after provisioning:

```sql
SELECT u.id, u.email, u.specialty, u.created_at
FROM users u
LEFT JOIN feature_usage f ON f.user_id = u.id
WHERE u.provisioned_at <= NOW() - INTERVAL '3 days'
  AND u.provisioned_at >= NOW() - INTERVAL '14 days'
  AND f.id IS NULL
GROUP BY u.id, u.email, u.specialty, u.created_at;
```

4.2. Before reaching out, check for the boring causes: did they ever log in? If no login, it is a delivery problem (email in spam, wrong address) not a motivation problem.

4.3. One human touch for stalled users, sent personally rather than templated:

```
Hi [Name],

I noticed you signed up for Bayan but haven't had a chance to start yet.
Most people in [specialty] begin here: [direct link]

If something's not working, reply and I'll sort it out directly.

Nasim
```

4.4. Do not send a second personal touch. If the first goes unanswered, they return to the automated sequence.

**Output:** Stalled users identified, one human touch delivered

---

### 5. QA Onboarding Content

**Frequency:** Monthly and on every content change  
**Owner:** Clinical Reviewer (accuracy), Marketer (assembly)

**Steps:**

5.1. Verify every clinical claim, question, and answer surfaced during onboarding against current guidance.

5.2. Confirm exam-alignment claims match the stated exam track. Do not surface SCFHS-aligned content to an OMSB candidate.

5.3. Confirm brand compliance: dark navy and gold palette, Omani cultural fidelity, English-first (per CEO-set standards).

5.4. Log the review. Content without a reviewer sign-off does not ship.

**Output:** Signed-off onboarding content

---

## Edge Cases

**Case 1: User registers but never logs in**
- **Cause:** Email deliverability, wrong address, or registration without intent
- **Detection:** No authenticated session within 3 days
- **Solution:** Treat as a delivery problem first. Check spam placement and bounce logs before assuming lost interest. Never "fix" this with more emails.

**Case 2: User logs in but uses only one feature for 30 days**
- **Cause:** Found the one thing they needed; may not need three
- **Detection:** Single-feature use, ≥10 sessions
- **Solution:** Do not force multi-feature adoption. Flag for analysis — if this pattern is common, the 3-feature activation definition is wrong and should be revised, not the users.

**Case 3: User activates on Day 1 (bot or power user)**
- **Cause:** Genuine fast learner, or automation
- **Detection:** 3 features within 1 hour of provisioning
- **Solution:** Verify it is a real person (session patterns). If bot traffic is polluting activation metrics, add a filter — do not celebrate inflated numbers.

**Case 4: Institutional pilot users arriving in bulk**
- **Cause:** Motion B onboarding (Proc 15 Core 257)
- **Solution:** These users need cohort onboarding, not the individual drip. Suppress the standard sequence for accounts tagged `institutional_pilot` and use the pilot motion instead.

**Case 5: User replies to an automated email**
- **Cause:** Genuine question
- **Detection:** Reply to a no-reply address
- **Solution:** Every automated address must route replies to a monitored inbox. A learner's question answered by silence is a churn event.

---

## KPIs & Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Day-7 activation rate (3 features) | >40% | - | - |
| Day-0 → Day-1 first login rate | >70% | - | - |
| Sequence email open rate (Email 1) | 40-60% | - | - |
| Suppression failure rate (wrong email sent) | 0% | - | - |
| Stalled-user recovery rate | >15% | - | - |

---

## Appendix A: Activation vs Retention

The 3-features-in-7-days definition exists to predict retention, not to be an end in itself.

| Pattern | Interpretation | Action |
|---------|----------------|--------|
| 3+ features, week 1 | Predicted retained | Standard sequence |
| 1-2 features, week 1 | At risk | Feature-discovery nudge |
| 0 features, week 1 | Unlikely to retain | Human touch, then accept |
| 3+ features, day 1 | Power user | Fast-track to referral ask (Proc 17) |

**Revision trigger:** If the M1 retention of activated users is not meaningfully higher than non-activated users, the activation definition is not predictive and must be replaced.

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-10-08 | Initial SOP | Stage 3 Ops Team |

---

## Approval

**Reviewed By:**
- [ ] CEO (Dr. Abdullah Al Alawi) - Activation definition, automation policy
- [ ] Marketer (Nasim) - Sequence content, routing rules
- [ ] Developer (TBD) - Triggers, suppression logic, tracking
- [ ] Clinical Reviewer (TBD) - Content accuracy
- [ ] Support Lead (TBD) - Intervention capacity

**Approved:** _____________ **Next Review:** Q1 2027