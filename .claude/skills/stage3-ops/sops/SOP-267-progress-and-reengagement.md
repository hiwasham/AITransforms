# SOP-267: Weekly Progress Tracking & Re-Engagement

**Process:** Proc 16 - Delivery to Success  
**Core:** 267  
**Owner:** Marketer (Nasim)  
**Accountable:** CEO (Dr. Abdullah Al Alawi)  
**Version:** 1.0  
**Last Updated:** 2026-10-08

---

## Purpose

Keep subscribed learners studying on a weekly cadence, detect disengagement before it becomes cancellation, and recover users who have gone quiet.

---

## Scope

**In Scope:**
- Engagement tier definition and daily recomputation
- Weekly progress digest
- Re-engagement trigger sequences (7 / 14 / 30 days inactive)
- Cohort retention analysis (feeds Proc 22 Core 264)
- Churn reason analysis
- Escalation of at-risk high-value accounts

**Out of Scope:**
- First-week onboarding (Core 266)
- Exam-week support and outcome capture (Core 268)
- Referral and testimonial (Proc 17)

---

## Roles & Responsibilities

| Role | Responsibility |
|------|----------------|
| Marketer (Nasim) | Tier rules, digest content, re-engagement sequences, churn analysis |
| Developer | Tier computation, digest generation, trigger automation |
| Support Lead | High-value account outreach, exit-survey follow-up |
| CEO | Churn targets, winback-vs-accept decisions, high-value definition |

---

## Prerequisites

- [ ] Activation tracking live (Core 266)
- [ ] Session/activity events instrumented (Proc 22 Core 262)
- [ ] Email automation platform supports conditional triggers
- [ ] Exit survey on cancellation flow

---

## Procedure

### 1. Define and Compute Engagement Tiers

**Frequency:** Daily recomputation  
**Owner:** Marketer (rules), Developer (implementation)

**Steps:**

1.1. Define four tiers by recency of meaningful activity. **Meaningful** means content interaction — not login. A user who logs in and leaves has not engaged.

| Tier | Definition | Intent |
|------|------------|--------|
| `active` | Meaningful activity within 7 days | Leave alone, serve well |
| `slipping` | 8-14 days inactive | Gentle nudge |
| `at_risk` | 15-29 days inactive | Re-engagement sequence |
| `dormant` | 30+ days inactive | Winback or accept churn |

1.2. Compute daily:

```sql
WITH last_activity AS (
    SELECT user_id, MAX(created_at) AS last_meaningful_at
    FROM feature_usage
    WHERE feature IN ('mcq_practice', 'osce_video', 'study_plan', 'article_read')
    GROUP BY user_id
)
UPDATE users u
SET engagement_tier = CASE
    WHEN la.last_meaningful_at IS NULL                        THEN 'never_activated'
    WHEN la.last_meaningful_at > NOW() - INTERVAL '7 days'    THEN 'active'
    WHEN la.last_meaningful_at > NOW() - INTERVAL '14 days'   THEN 'slipping'
    WHEN la.last_meaningful_at > NOW() - INTERVAL '30 days'   THEN 'at_risk'
    ELSE 'dormant'
END
FROM last_activity la
WHERE u.id = la.user_id;
```

1.3. **Tier transitions must be tracked, not just current state.** A user moving active → slipping is the early warning; a user who is merely `slipping` today may have been active all along.

```sql
INSERT INTO engagement_transitions (user_id, from_tier, to_tier, changed_at)
SELECT id, previous_tier, engagement_tier, NOW()
FROM users
WHERE previous_tier IS DISTINCT FROM engagement_tier;
```

**Output:** Daily tier assignment with transition history

---

### 2. Send the Weekly Progress Digest

**Frequency:** Weekly (fixed day and time)  
**Owner:** Marketer (content), Developer (generation)

**Steps:**

2.1. Digest contents — progress, not promotion:

| Element | Source | Why |
|---------|--------|-----|
| Questions answered this week | feature_usage | Concrete progress |
| Weak areas identified | quiz results | Shows the product is paying attention |
| Streak / consistency | session history | Habit reinforcement |
| One suggested next action | weakest area | Removes the "what now" friction |

2.2. **Never send an empty digest.** If there is no activity this week, the user is in a re-engagement path (step 3), not a progress path. An empty progress email reads as an accusation.

```python
def build_digest(user):
    stats = weekly_stats(user.id)
    if stats.questions_answered == 0:
        return None   # Route to re-engagement instead
    return render_digest(user, stats)
```

2.3. Digest for `slipping` users should acknowledge the gap warmly and offer a single easy re-entry point — not a summary of what they missed.

**Output:** Weekly digest delivered to active users only

---

### 3. Run Re-Engagement Triggers

**Frequency:** Automatic on tier transition  
**Owner:** Marketer (content), Developer (automation)

**Steps:**

3.1. Trigger sequences on **transition**, not on a scheduled scan. A user should receive a re-engagement email days after they went quiet, not on whatever day the batch job happens to run.

| Transition | Day | Sequence | Tone |
|------------|-----|----------|------|
| active → slipping | 8 | Single nudge | Light, no guilt |
| slipping → at_risk | 15 | 2-email sequence | Value reminder |
| at_risk → dormant | 30 | 2-email winback | Last call, honest |

3.2. Use template **F16-3 (Re-engagement Sequence)**.

3.3. Suppress immediately on any meaningful activity. A user who returns on their own must not receive a "we miss you" email.

3.4. **Respect a frequency cap.** No user receives more than one lifecycle email per 72 hours, regardless of which sequence triggers. Overlapping automations are the fastest way to get marked as spam.

**Output:** Re-engagement sequences firing on transition, suppression verified

---

### 4. Analyze Retention by Cohort

**Frequency:** Monthly  
**Owner:** Marketer (analysis), CEO (targets)

**Steps:**

4.1. Build retention curves by signup month:

```sql
WITH cohort AS (
    SELECT id AS user_id,
           DATE_TRUNC('month', created_at) AS cohort_month
    FROM users
    WHERE created_at >= '2026-01-01'
),
activity AS (
    SELECT DISTINCT f.user_id,
           DATE_TRUNC('month', f.created_at) AS activity_month
    FROM feature_usage f
)
SELECT
    c.cohort_month,
    EXTRACT(MONTH FROM AGE(a.activity_month, c.cohort_month)) AS months_since_signup,
    COUNT(DISTINCT a.user_id)         AS active_users,
    COUNT(DISTINCT c.user_id)         AS cohort_size,
    ROUND(100.0 * COUNT(DISTINCT a.user_id)
          / COUNT(DISTINCT c.user_id), 1) AS retention_pct
FROM cohort c
JOIN activity a ON a.user_id = c.user_id
GROUP BY c.cohort_month, months_since_signup
ORDER BY c.cohort_month, months_since_signup;
```

4.2. Compare cohorts. A newer cohort retaining worse than an older one means something regressed — find it.

4.3. **Segment Oman-free from paid.** Mixing them makes both curves meaningless: different incentives, different intent, different retention.

4.4. Report to CEO monthly with the curve and the single biggest drop-off point.

**Output:** Monthly cohort retention report

---

### 5. Analyze Churn Reasons

**Frequency:** Monthly  
**Owner:** Marketer (analysis), Support Lead (data collection)

**Steps:**

5.1. Capture a reason at cancellation. Minimum viable: one question, 4-5 options, optional free text.

5.2. Aggregate:

```sql
SELECT
    churn_reason,
    COUNT(*) AS count,
    ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct
FROM cancellations
WHERE canceled_at >= DATE_TRUNC('month', NOW())
GROUP BY churn_reason
ORDER BY count DESC;
```

5.3. **Distinguish voluntary from involuntary churn.** A failed card is not a decision. Involuntary churn belongs to Core 265's dunning path and must be reported separately — conflating them makes the churn rate look like a product problem when it is a billing problem.

5.4. Correlate churn with engagement tier at cancellation. If most churn comes from `dormant`, the retention problem happened weeks earlier, not at cancellation.

5.5. Route findings to owners:
   - High M0 churn → Core 266 (onboarding)
   - High M1-M3 churn → this core (cadence, content fit)
   - Specialty-specific churn → content gap (Clinical Reviewer)
   - Involuntary → Core 265 (dunning)

**Output:** Monthly churn report with root causes and owners

---

### 6. Escalate High-Value Accounts

**Frequency:** Weekly  
**Owner:** Marketer (identification), Support Lead (outreach)

**Steps:**

6.1. Define "high-value" (CEO-owned): annual subscribers, institutional seats, and any account with a named institutional relationship.

6.2. Any high-value account reaching `at_risk` gets a human touch, not an automated email:

```sql
SELECT u.id, u.email, u.plan, u.engagement_tier, u.last_meaningful_at
FROM users u
WHERE u.engagement_tier = 'at_risk'
  AND u.plan IN ('price_annual', 'institutional')
ORDER BY u.last_meaningful_at ASC;
```

6.3. Outreach is a real conversation about what stopped working — not a discount offer. Discounting a disengaged annual subscriber teaches them to disengage for discounts.

**Output:** High-value at-risk accounts contacted

---

## Edge Cases

**Case 1: User studies in bursts (exam-driven)**
- **Cause:** Real study pattern — intense for weeks, then quiet
- **Detection:** Repeated 2-3 week gaps followed by high activity
- **Solution:** Do not treat burst learners as churning. Segment them out of re-engagement or the sequence becomes noise. Identify by variance in their activity, not recency alone.

**Case 2: Exam is over — user has passed**
- **Cause:** Success
- **Detection:** Passed exam survey (Core 268)
- **Solution:** Do not send re-engagement email. Route to Proc 17 (referral and testimonial). Sending "we miss you" to someone who passed and moved on is the worst-tone email in the system.

**Case 3: Payment failed, service continues (dunning window)**
- **Cause:** Involuntary churn in progress
- **Detection:** Active entitlements with failed invoices
- **Solution:** Exclude from engagement tiers during dunning. Their inactivity may be unrelated to their subscription state, and a re-engagement email during a billing dispute is confusing.

**Case 4: Institutional pilot cohort goes quiet together**
- **Cause:** Academic calendar, term break
- **Detection:** Correlated dormancy across a cohort
- **Solution:** Cohort-wide dormancy is a calendar signal, not individual disengagement. Notify the institutional contact; do not fire individual re-engagement at 200 people.

**Case 5: User unsubscribes from emails but stays subscribed to the product**
- **Cause:** Email preference, not product intent
- **Detection:** Unsubscribe event with continued session activity
- **Solution:** Respect it absolutely. Track product engagement separately from email engagement — email exhaustion is not product churn.

---

## KPIs & Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| M1 retention | >60% | - | - |
| M3 retention | >50% | - | - |
| M6 retention | >40% | - | - |
| Monthly churn (paid) | <5% | - | - |
| Involuntary churn share | <25% of total | - | - |
| Re-engagement recovery rate | >15% | - | - |
| At-risk high-value contacted | 100% | - | - |

---

## Appendix A: Tier Response Matrix

| Tier | Email cadence | Human touch | Product action |
|------|---------------|-------------|----------------|
| `active` | Weekly digest | No | None — serve well |
| `slipping` | 1 nudge | No | Surface easiest re-entry point |
| `at_risk` | 2-email sequence | If high-value | Weak-area recommendation |
| `dormant` | 2-email winback | If high-value | None (accept or decisive winback) |
| `never_activated` | Core 266 path | Yes, once | Fix the activation gap |

---

## Appendix B: Why Cadence Beats Intensity

Retention in exam prep correlates with **consistency**, not volume. A learner answering 10 questions daily retains better than one answering 100 questions twice a month — the second pattern produces both worse recall and an unpredictable subscription.

This is why the weekly digest emphasizes streaks and consistency over totals: it rewards the behavior that actually predicts retention.

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-10-08 | Initial SOP | Stage 3 Ops Team |

---

## Approval

**Reviewed By:**
- [ ] CEO (Dr. Abdullah Al Alawi) - Churn targets, high-value definition, winback policy
- [ ] Marketer (Nasim) - Tier rules, sequences, analysis
- [ ] Developer (TBD) - Tier computation, triggers, frequency cap
- [ ] Support Lead (TBD) - Outreach capacity, exit survey

**Approved:** _____________ **Next Review:** Q1 2027