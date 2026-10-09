# SOP-268: Exam Milestone Support & Success Celebration

**Process:** Proc 16 - Delivery to Success  
**Core:** 268  
**Owner:** Marketer (Nasim)  
**Accountable:** CEO (Dr. Abdullah Al Alawi)  
**Version:** 1.0  
**Last Updated:** 2026-10-08

---

## Purpose

Support the learner through their actual exam, capture the outcome honestly, and convert a pass into verified social proof and referral fuel for Proc 17.

---

## Scope

**In Scope:**
- Exam date tracking (self-reported and inferred)
- Exam-week support content
- Outcome capture (pass/fail survey)
- Pass celebration and testimonial handoff
- Failure handling and retake path
- Outcome rate reporting

**Out of Scope:**
- Referral mechanics and invite generation (Proc 17 Core 273)
- Testimonial production (Proc 17 Core 274 — consumes this core's output)
- Clinical content accuracy (Clinical Reviewer)

---

## Roles & Responsibilities

| Role | Responsibility |
|------|----------------|
| Marketer (Nasim) | Exam-date tracking, support content, outcome capture, reporting |
| Developer | Survey implementation, date inference, event tracking |
| Clinical Reviewer | Exam-week clinical guidance accuracy |
| Support Lead | Failure support conversations, retake logistics |
| CEO | Public claims policy, retake offer decisions, failure messaging tone |

---

## Prerequisites

- [ ] Exam track captured per user (OMSB, SCFHS, DHA, Arab Board, other)
- [ ] Email automation supports date-triggered sends
- [ ] Outcome survey live (F16-4)
- [ ] Retake policy decided (CEO)

**Sensitivity warning:** This core touches the highest-stakes moment in the customer relationship. A learner who fails has lost time, money, and confidence, and Bayan may have been part of that outcome. Every procedure below is written with that in mind.

---

## Procedure

### 1. Track Exam Dates

**Frequency:** Continuous  
**Owner:** Marketer (collection), Developer (inference)

**Steps:**

1.1. Ask at registration and again at activation. Many learners do not have a date when they sign up — do not make it a required field.

1.2. Where no date is given, infer a window from the study pattern:

```python
def infer_exam_window(user):
    """Infer an exam window from study intensity. Returns (start, end) or None."""
    recent = quiz_volume(user.id, days=14)
    baseline = quiz_volume(user.id, days=60) / 60 * 14

    if baseline == 0:
        return None
    if recent > baseline * 2.5:
        # Doubling-plus of normal volume is the classic cram signature
        return (date.today() + timedelta(days=3),
                date.today() + timedelta(days=21))
    return None
```

1.3. **Never state an inferred date back to the user as fact.** Inferences are for internal cadence only. Saying "your exam is in 2 weeks, good luck!" to someone whose exam is in six months is a credibility loss. Inferred windows trigger internal preparation; the user only sees a send if a real date exists or if the message is date-agnostic.

1.4. Store dates with their provenance:

| Source | Confidence | Use |
|--------|------------|-----|
| User-entered | High | Full sequence, date-specific messaging |
| Self-reported in email reply | High | Full sequence |
| Inferred from study pattern | Low | Internal cadence only, date-agnostic copy |

**Output:** Exam dates tracked with provenance

---

### 2. Deliver Exam-Week Support

**Frequency:** Per exam cycle  
**Owner:** Marketer (content), Clinical Reviewer (accuracy)

**Steps:**

2.1. Send a short support sequence in the final week:

| When | Content | Goal |
|------|---------|------|
| T-7 days | Final review plan by exam track | Structure the last week |
| T-3 days | Highest-yield topics, common pitfalls | Reduce uncertainty |
| T-1 day | Logistics checklist, rest guidance | Lower anxiety, no new content |
| T+0 (morning) | Short encouragement | Calm, confident presence |

2.2. **Send no new clinical content on T-1 or T+0.** Cramming our content the night before increases anxiety and can undermine confidence in material already learned. The T-1 email is logistics and rest guidance only.

2.3. Exam-week content is per exam track. OMSB candidates and SCFHS candidates face materially different formats.

2.4. Clinical Reviewer verifies the T-7 and T-3 content. The T-1 and T+0 emails contain no clinical claims and need only Marketer sign-off.

**Output:** Exam-week sequence delivered per cycle

---

### 3. Capture the Outcome

**Frequency:** Within 48 hours of expected exam completion  
**Owner:** Marketer (survey), Developer (implementation)

**Steps:**

3.1. Send the outcome survey from **F16-4** within 48 hours of the exam window closing.

3.2. Keep it to two questions:

```
1. Did you sit your exam?   [Yes / Not yet / Rescheduled]
2. How did it go?           [Passed / Didn't pass / Results pending]
```

3.3. **Never require a reason on failure.** The free-text field is optional and framed as "anything you'd like to share."

3.4. Add the outcome to the user record and emit an event for Proc 22:

```python
def record_outcome(user_id, sat_exam, result):
    user = User.get(user_id)
    user.exam_sat_at = datetime.now() if sat_exam else None
    user.exam_result = result
    user.save()

    analytics.track('exam_outcome_recorded', {
        'user_id': user_id,
        'exam_track': user.exam_track,
        'cohort_month': user.created_at.strftime('%Y-%m'),
        'result': result,
    })
```

3.5. **Track the response rate explicitly.** A low response rate means the pass rate is unrepresentative — people who fail are less likely to answer. Report the response rate alongside any outcome rate, always.

**Output:** Outcome recorded with response-rate context

---

### 4. Celebrate Passes and Hand Off to Proc 17

**Frequency:** On pass recorded  
**Owner:** Marketer

**Steps:**

4.1. Send a genuine, short congratulation. This is the emotional peak of the customer relationship — treat it as significant, not as a marketing opportunity.

4.2. **Ask for the testimonial in a separate email, at least 3 days later.** Bundling "congratulations, and please review us" into one message converts a real moment into a transaction.

4.3. Testimonial ask references **Proc 17 Core 274** (Testimonial & Case Study Capture) and its template **F17-2**.

4.4. Offer the referral path after the testimonial ask, not simultaneously. One ask per email.

4.5. Flag high-quality passes (strong quotes, willingness to appear on video) for the case study pipeline.

**Output:** Pass celebrated, testimonial and referral handoff queued

---

### 5. Handle Failures With Care

**Frequency:** On failure recorded  
**Owner:** Marketer (message), Support Lead (conversation), CEO (policy)

**Steps:**

5.1. **No false cheer. No immediate upsell.** The first message after a failure acknowledges the outcome and offers support. Nothing else.

```
Hi [Name],

I saw your result. I'm sorry — I know how much went into preparing for it.

Plenty of strong candidates don't pass on the first attempt. When you're ready,
I'd like to hear what felt hardest, because it tells us what to fix.

No rush on replying.

Nasim
```

5.2. Wait at least 7 days before any retake communication. Immediate retake offers read as opportunistic.

5.3. After 7 days, offer the retake path per CEO policy (discount, extended access, or nothing — this is a CEO decision, not a Marketer improvisation).

5.4. Support Lead owns the conversation if the user replies. Questions about their performance are answered honestly and without defensiveness.

5.5. **Never promise an outcome.** No retake offer is framed as a guarantee of passing. Any outcome-related claim must be defensible in writing — this is a CEO-owned constraint.

5.6. Log the failure's contributing signals (engagement tier at exam time, content gaps flagged) for analysis. Not to assign blame to the user — to find what Bayan could have done better.

**Output:** Failure acknowledged, retake path offered after a suitable interval

---

### 6. Report Outcome Rates

**Frequency:** Monthly  
**Owner:** Marketer (reporting), CEO (interpretation)

**Steps:**

6.1. Compute pass rate per exam track and cohort:

```sql
SELECT
    exam_track,
    DATE_TRUNC('month', exam_sat_at) AS exam_month,
    COUNT(*)                                              AS sat_exam,
    COUNT(*) FILTER (WHERE exam_result = 'passed')        AS passed,
    COUNT(*) FILTER (WHERE exam_result = 'failed')        AS failed,
    ROUND(100.0 * COUNT(*) FILTER (WHERE exam_result = 'passed')
          / NULLIF(COUNT(*) FILTER (WHERE exam_result IN ('passed','failed')), 0), 1)
                                                          AS pass_rate_pct,
    ROUND(100.0 * COUNT(*) FILTER (WHERE exam_result IS NOT NULL)
          / NULLIF(COUNT(*) FILTER (WHERE exam_sat_at IS NOT NULL), 0), 1)
                                                          AS response_rate_pct
FROM users
WHERE exam_sat_at IS NOT NULL
GROUP BY exam_track, exam_month
ORDER BY exam_track, exam_month DESC;
```

6.2. **Report response rate next to every pass rate.** A 90% pass rate from 10 responses out of 200 exams is not a 90% pass rate.

6.3. Correlate outcome with engagement. If pass rate and engagement are uncorrelated, Bayan's product is not affecting outcomes — a strategic finding the CEO needs.

6.4. **Public claims:** any externally published pass rate must (a) be based on a stated sample, (b) state the response rate, and (c) have CEO sign-off. Marketing claims about exam outcomes carry regulatory and reputational risk in medical education.

**Output:** Monthly outcome report with honest denominators

---

## Edge Cases

**Case 1: User never reports an outcome**
- **Cause:** Most common state — silence
- **Detection:** Exam window passed with no survey response
- **Solution:** One follow-up after 2 weeks, then stop. Do not chase. Treat non-response as unknown, never as a pass. Never impute outcomes into a pass rate.

**Case 2: Results pending for weeks**
- **Cause:** Normal for some exam boards
- **Solution:** Do not treat pending as failed. Keep the user in a holding state and send one "let us know when results arrive" message. Pending users must be excluded from both numerator and denominator.

**Case 3: User passes a different exam than they studied for**
- **Cause:** Changed plans, sat a different board
- **Detection:** Mismatch between stated track and reported exam
- **Solution:** Record the outcome against the exam actually taken. Crediting the studied track inflates that track's pass rate with an outcome the content did not produce.

**Case 4: User fails and requests a refund**
- **Cause:** Outcome-based dissatisfaction
- **Detection:** Refund request after failure
- **Solution:** Refund policy is CEO-owned (Core 265). Support Lead acknowledges without promising, and escalates. Do not decline on the user's behalf in the moment — a hard "no" delivered by frontline support in an emotional moment creates a public complaint.

**Case 5: Institutional pilot cohort sits a shared exam**
- **Cause:** Motion B cohort
- **Detection:** Multiple users, same exam date, same institution
- **Solution:** Report outcomes to the institutional contact per contract terms. Individual outcome data is not shared with employers without explicit user consent — this is a privacy boundary, not a reporting preference.

---

## KPIs & Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Outcome survey response rate | >40% | - | - |
| Outcome captured within 14 days | >60% of sat exams | - | - |
| Testimonial conversion (passes) | >15% | - | - |
| Failed-user retake conversion | >20% | - | - |
| Pass rate (per track, reported with n and response rate) | TBD — needs data | - | - |

---

## Appendix A: Outcome State Machine

```
scheduled  →  sat  →  {passed | failed | pending}
                ↓
            no_response  (unknown — never imputed)
```

| State | Next action | Excluded from pass rate? |
|-------|-------------|--------------------------|
| `scheduled` | Exam-week sequence | Yes |
| `sat` / `pending` | Wait for results | Yes |
| `passed` | Celebrate → Proc 17 | No |
| `failed` | Support → retake path | No |
| `no_response` | One follow-up, then stop | Yes |

---

## Appendix B: This Core Feeds Proc 17

Everything Proc 17 needs comes from here:

| Proc 17 need | Source in this core |
|---|---|
| Testimonial candidates | `passed` state |
| Referral candidates | `passed` state, high engagement |
| Case study subjects | `passed` + willing to appear on video |
| Outcome claims | Pass rate with response-rate context |

Without honest outcome capture here, Proc 17 produces testimonials of unknown representativeness — which is worse than no testimonials, because they look like evidence while being selection bias.

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-10-08 | Initial SOP | Stage 3 Ops Team |

---

## Approval

**Reviewed By:**
- [ ] CEO (Dr. Abdullah Al Alawi) - Outcome claims policy, retake offers, failure tone
- [ ] Marketer (Nasim) - Tracking, surveys, reporting
- [ ] Developer (TBD) - Date inference, survey, event tracking
- [ ] Clinical Reviewer (TBD) - Exam-week clinical content
- [ ] Support Lead (TBD) - Failure conversations, refund escalation

**Approved:** _____________ **Next Review:** Q1 2027