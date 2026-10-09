# BP-268: Exam Milestone Support & Success Celebration Blueprint

**Process:** Proc 16 - Delivery to Success  
**Core:** 268  
**Level:** L2 Blueprint (Functional Breakdown)  
**Owner:** Marketer (Nasim)  
**Accountable:** CEO (Dr. Abdullah Al Alawi)  
**Version:** 1.0  
**Last Updated:** 2026-10-08

---

## Purpose

Break Core 268 into its functional sub-processes, define the outcome state machine that governs every downstream decision, and specify the quality gates that keep outcome claims defensible.

---

## Sub-Process Breakdown

| # | Sub-process | Owner | Trigger | Output |
|---|-------------|-------|---------|--------|
| 1 | Exam Date Tracking | Marketer | Registration / activation | Date with provenance |
| 2 | Exam-Week Support | Marketer | T-7 to T+0 | 4-email support sequence |
| 3 | Outcome Capture | Marketer | T+48h | Recorded outcome + event |
| 4 | Pass Celebration & Handoff | Marketer | Outcome = passed | Testimonial/referral queue |
| 5 | Failure Handling | Support Lead | Outcome = failed | Support + retake path |
| 6 | Outcome Reporting | Marketer | Monthly | Pass rate with denominators |

---

## Sub-Process 1: Exam Date Tracking

**Dates carry provenance, and provenance determines usage.**

| Source | Confidence | Permitted use |
|--------|------------|---------------|
| User-entered | High | Full sequence, date-specific copy |
| Self-reported in reply | High | Full sequence |
| Inferred from study pattern | Low | Internal cadence only, date-agnostic copy |

**Decision tree:**

```
User record
│
├─ User-entered date?      → date-specific sequence
├─ Self-reported in reply? → date-specific sequence
├─ Inferred from pattern?  → internal cadence; date-agnostic copy ONLY
└─ Nothing?                → no exam sequence; continue Core 267 cadence
```

**Inference method:** study volume at 2.5× baseline over 14 days is the classic cram signature.

**Quality gate 1 — inference is never stated to the user.** Telling someone "your exam is in 2 weeks, good luck" when their exam is in six months is a credibility loss that costs more than the sequence gains. Inferred dates trigger internal preparation; the user only sees a send if a real date exists or the copy is date-agnostic.

---

## Sub-Process 2: Exam-Week Support

| When | Content | Goal |
|------|---------|------|
| T-7 | Final review plan by exam track | Structure the last week |
| T-3 | High-yield topics, common pitfalls | Reduce uncertainty |
| T-1 | Logistics checklist, rest guidance | Lower anxiety |
| T+0 morning | Short encouragement | Calm presence |

**Decision tree:**

```
Choosing content for T-N
│
├─ T-7 or T-3?
│   └─ Clinical content → REQUIRES Clinical Reviewer sign-off
│                           Must match the user's exam track
│
└─ T-1 or T+0?
    └─ NO new clinical content. Logistics and rest only.
        Marketer sign-off sufficient.
```

**Why no new content at T-1:** cramming our material the night before increases anxiety and can undermine confidence in content already learned. The last two emails are about arriving calm, not about learning anything new.

**Quality gate 2:** Clinical content in the exam week is track-specific and reviewer-signed. OMSB and SCFHS differ materially in format.

---

## Sub-Process 3: Outcome Capture

**Two questions, sent within 48 hours of the exam window closing.**

```
1. Did you sit your exam?   [Yes / Not yet / Rescheduled]
2. How did it go?           [Passed / Didn't pass / Results pending]
```

**Decision tree:**

```
T+48h, outcome survey
│
├─ No response → one follow-up at T+2 weeks, then STOP
│                 (never chase; never impute)
│
├─ Not yet / Rescheduled → return to Core 267 cadence
│
├─ Results pending → holding state
│                     (excluded from numerator AND denominator)
│
└─ Passed / Didn't pass → record with cohort context, emit event
```

**Quality gate 3 — non-response is recorded as `no_response`, never as a pass or a fail.** Silence is the most common outcome and the easiest to mishandle. Imputing it inflates the pass rate with users whose outcome is simply unknown.

**Free-text on failure is optional** — framed as "anything you'd like to share." Never required. Requiring an explanation from someone who just failed is a data-collection practice that costs goodwill.

---

## Sub-Process 4: Pass Celebration & Handoff to Proc 17

**Decision tree:**

```
Outcome = passed
│
├─ Day 0: Congratulate. Short, genuine. Nothing else attached.
│
├─ Day 3+: Testimonial ask (separate email, references F17-2)
│
└─ After testimonial ask: referral path (Proc 17 Core 273)
    (NOT simultaneous with the testimonial ask)
```

**Why the asks are separated:** bundling "congratulations, and please review us" converts a genuine moment into a transaction. One ask per email, and the congratulation carries no ask at all.

**Handoff contract to Proc 17:**

| Field | Meaning |
|-------|---------|
| `user_id` | Passed user |
| `exam_track` | For testimonial relevance |
| `engagement_tier` | Identifies most credible advocates |
| `willing_to_appear` | If survey indicated video willingness |

**Quality gate 4:** No ask in the congratulation email.

---

## Sub-Process 5: Failure Handling

**This is the highest-sensitivity sub-process in Proc 16.**

**Decision tree:**

```
Outcome = failed
│
├─ Immediately: acknowledge + offer support. NO upsell. NO false cheer.
│
├─ Days 1-7: SILENCE on retake. If the user replies, Support Lead responds.
│
├─ Day 7+: retake path per CEO policy
│           (discount, extended access, or nothing — CEO decides)
│
└─ Any point: NEVER promise or imply a guaranteed pass
```

**Quality gate 5 — no outcome guarantee, ever.** No retake offer, discount, or message is framed as guaranteeing a pass. Any outcome-related claim must be defensible in writing, and this is a CEO-owned constraint.

**Why the 7-day silence:** an immediate retake offer reads as opportunistic — the company monetising the user's worst day. The gap is not a delay in service; it is the service.

**Escalation:** refund requests after failure go to CEO per Core 265 policy. Support Lead acknowledges without promising and escalates immediately — a frontline hard "no" delivered in an emotional moment creates a public complaint that costs far more than the refund.

---

## Sub-Process 6: Outcome Reporting

**Pass rate is always reported with its denominator and response rate.**

**Decision tree:**

```
Building outcome report
│
├─ Response rate <40%?
│   └─ Report pass rate WITH an explicit unreliability caveat.
│       Failures are less likely to respond → rate is biased high.
│
├─ Exam actually taken ≠ exam studied for?
│   └─ Record against the exam taken. Crediting the studied track
│       inflates it with outcomes the content did not produce.
│
└─ Publishing externally?
    └─ Requires: stated sample + response rate + CEO sign-off
```

**Quality gate 6 — external claims require sample, response rate, and CEO sign-off.** Marketing claims about exam outcomes carry regulatory and reputational risk in medical education. A pass rate without its response rate is not a claim, it is a selection.

---

## Exception Handling

| Exception | Detection | Response |
|-----------|-----------|----------|
| No outcome ever reported | Exam window passed, no response | One follow-up at 2 weeks, then stop. Unknown, never imputed |
| Results pending for weeks | Normal for some boards | Holding state; excluded from both numerator and denominator |
| Passed a different exam | Track mismatch | Record against the exam taken |
| Fails and requests refund | Refund request post-failure | Escalate to CEO; do not decline at frontline |
| Institutional cohort sits shared exam | Multiple users, same date, same institution | Report to institution per contract; no individual data without consent |

---

## Integration Points

**Upstream — Core 267:** engagement tier at exam time is the key correlating variable. If pass rate and engagement are uncorrelated, the product is not affecting outcomes — a strategic finding for the CEO.

**Downstream — Proc 17 Core 273 (Peer Invite Mechanics):** passed users are the referral pool.

**Downstream — Proc 17 Core 274 (Testimonial & Case Study Capture):** consumes the pass list. Testimonials sourced without honest outcome capture are selection bias dressed as evidence — worse than no testimonials, because they look like proof.

**Proc 22 Core 264:** `exam_outcome_recorded` events feed outcome-correlated cohort analysis.

---

## Quality Gates Summary

| Gate | Location | Blocks what |
|------|----------|-------------|
| 1 | Inference never stated to user | Credibility loss from wrong exam dates |
| 2 | Exam-week clinical content reviewed + track-specific | Inaccurate or misaligned content at peak stakes |
| 3 | Non-response recorded as unknown | Imputed outcomes inflating pass rate |
| 4 | No ask in the congratulation email | Converting a genuine moment into a transaction |
| 5 | No outcome guarantee | Undefensible claims with regulatory risk |
| 6 | External claims need sample + response rate + CEO sign-off | Public claims that cannot survive scrutiny |

---

## Known Constraints

**No pass-rate baseline exists.** Bayan has no measured historical pass rate. Every outcome target is `[TBD — funnel data]` until Proc 22 Core 262 is live and the first exam cycle completes. Treat all pass-rate figures in the existing Bayan marketing material as unverified until captured through this process.

**Retake policy is undecided (CEO-owned).** The mechanism is specified; the policy is not. Until decided, the Day-7 retake communication cannot ship.

**Exam-date capture is not yet a field.** If the product does not currently collect exam dates, sub-process 1 degrades to inference-only, which permits date-agnostic copy only.

**Institutional data-sharing terms are undefined.** What outcome data can be shared with an institutional client is a contract term, not a process decision.

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-10-08 | Initial L2 Blueprint | Stage 3 Ops Team |

---

## Approval

**Blueprint Owner:** Marketer (Nasim)  
**Reviewed By:**
- [ ] CEO (Dr. Abdullah Al Alawi) - Public claims, retake policy, failure tone
- [ ] Marketer (Nasim) - Tracking, surveys, reporting
- [ ] Developer (TBD) - Inference, survey, events
- [ ] Clinical Reviewer (TBD) - Exam-week content
- [ ] Support Lead (TBD) - Failure conversations

**Approved:** _____________ **Next Review:** Q1 2027