# SOP-274: Testimonial & Case Study Capture

**Process:** Proc 17 - Success to Lead
**Core:** 274 - Testimonial & Case Study Capture
**Owner:** Marketer (Nasim)
**Accountable:** CEO (Dr. Abdullah Al Alawi)
**Version:** 1.0
**Last Updated:** 2026-10-09

---

## Purpose

Build a library of social proof that is honest, consented, and traceable to a verified outcome — the kind that holds up when a skeptical prospective candidate reads it, and that Bayan can defend if challenged.

---

## Scope

**In Scope:**
- Testimonial request policy and timing
- Written testimonial collection (F17-2)
- Video testimonial production (F17-3)
- Claim verification (clinical accuracy, outcome accuracy)
- Consent capture, storage, and revocation
- Publication and library maintenance
- Takedown handling

**Out of Scope:**
- Referral invite mechanics (Core 269)
- Paid influencer content (paid acquisition)
- Institutional case studies sold as B2B collateral (Proc 15 Core 257, with this core supplying raw material)
- Public pass-rate claims (Proc 16 Core 268 + CEO sign-off)

---

## Roles & Responsibilities

| Role | Responsibility |
|------|----------------|
| Marketer (Nasim) | Requests, interviews, production, library, performance tracking |
| Developer | Tokenized links, consent storage, media hosting, takedown plumbing |
| CEO (Dr. Abdullah Al Alawi) | Publication approval, claim wording, institutional-name decisions |
| Clinical Reviewer | Verification of any clinical or outcome claim in a testimonial |
| Support Lead | Consent questions, takedown requests, former-subject escalations |

---

## Prerequisites

- [ ] Verified outcome data from Proc 16 Core 268 (or verified 30-day engagement)
- [ ] F17-2 form live with tokenized prefilled links
- [ ] Consent record schema exists and is queryable
- [ ] Media hosting with access control for unpublished footage
- [ ] CEO-approved claim policy in writing

**Hard precondition:** Do not solicit testimonials without a way to record consent. A quote published without documented consent is a legal and reputational problem, and it is much harder to fix after publication than before.

---

## Procedure

### 1. Define Who Gets Asked

**Frequency:** One-time policy, applied continuously
**Owner:** CEO (policy), Marketer (execution)

**Steps:**

1.1. Ask only on a **verified positive outcome**:

| Source state | Asked for | Rationale |
|--------------|-----------|-----------|
| Exam passed | Written + possibly video | The strongest, most specific proof |
| 30+ days active, no exam yet | Written only | Real engagement story, no outcome claim |
| Institutional pilot completed | Case study (via Proc 15) | Different motion, different consent |

1.2. **Never ask immediately.** Wait ≥3 days after the congratulation email (SOP-268 §4.2). The ask lands better once the emotion has settled into a considered opinion, and the resulting quote is more specific.

1.3. **Never ask someone who failed.** There is no version of this that is acceptable. Failed users receive support and a retake path (SOP-268 §5), never a content request.

1.4. Cap requests: one testimonial request per user per outcome. A second follow-up after 10 days is acceptable; a third is harassment.

1.5. **Do not offer payment for a testimonial.** Discounts as thanks are a CEO decision; cash for a review compromises the credibility of the quote and, in medical education, edges toward an endorsement arrangement.

**Output:** Target list of verified outcomes, ask cadence defined

---

### 2. Collect Written Testimonials

**Frequency:** Continuous
**Owner:** Marketer

**Steps:**

2.1. Send the tokenized link from **F17-2**. The token carries user, email, and exam name (encrypted, 30-day expiry) so the form arrives prefilled — prefill is the single biggest driver of completion.

2.2. Ask specific questions, not "how was it?" Generic prompts produce generic quotes that read identically to every competitor's. Bayan's prompts should extract:

| Prompt | What it yields |
|--------|----------------|
| What did you use most? | Concrete feature, not vague praise |
| What was hardest before Bayan? | The problem the product solves |
| What changed in your study routine? | Behavior change, verifiable |
| Would you recommend it — to whom specifically? | Segmentation signal |

2.3. **Make every question optional except name and consent.** A forced 9-question form has a low completion rate and produces grudging answers.

2.4. Never edit a quote's meaning. Trimming for length is fine; sharpening a lukewarm sentence into an endorsement is fabrication. If the quote needs help to be persuasive, it is not the testimonial to publish — collect another.

2.5. Record the provenance with every collected quote: which outcome, which date, which form version. A library without provenance becomes unusable the moment anyone asks whether a claim is representative.

**Output:** Written testimonials collected with provenance

---

### 3. Produce Video Testimonials

**Frequency:** Per qualified candidate, capped
**Owner:** Marketer (production), CEO (approval)

**Steps:**

3.1. Reserve video for candidates who meet a higher bar — strong written quote already on file, genuine willingness, and ideally a real exam outcome.

3.2. Use **F17-3** for the interview guide. Key principles:

| Do | Don't |
|----|-------|
| Ask for the story, then let them talk | Read them a script |
| Prompt for specifics (dates, scores, specialties) | Prompt for superlatives |
| Shoot where they actually study | Studio setting that feels staged |
| Let them name what was hard | Cut anything negative-sounding |

3.3. **A video testimonial is a higher-commitment consent.** A person's face and voice may be used for years and can't be quietly unpublished. Capture explicit, recorded consent covering: publication channels, duration, territories, and the right to withdraw.

3.4. **Never use a video testimonial to imply an outcome guarantee.** If a subject says "I passed because of Bayan," the published version must not harden that into a claim Bayan makes about results.

3.5. Clinical Reviewer reviews any video containing clinical content (study approach, exam technique) before publication.

**Output:** Produced video testimonials with recorded consent

---

### 4. Verify Claims Before Publication

**Frequency:** Before every publication
**Owner:** Clinical Reviewer (accuracy), CEO (approval)

**Steps:**

4.1. Check every factual claim in the testimonial:

| Claim type | Verifier | Rule |
|------------|----------|------|
| Clinical content accuracy | Clinical Reviewer | Must match current guidance |
| Exam format or content claims | Clinical Reviewer | Must match the stated board (OMSB / SCFHS / DHA / Arab Board) |
| Outcome claim (score, pass) | Marketer + record | Must match the stored outcome |
| Comparison to other providers | CEO | Generally cut — comparative claims invite disputes |
| Employment or title | Marketer | Must match what the person stated, nothing inferred |

4.2. **Verify the outcome against the record.** If a testimonial says "passed on my first attempt" and the record shows a prior attempt, the claim is false — either correct the quote or do not publish.

4.3. Anonymize when asked. "Internal medicine resident, OMSB candidate" is a valid attribution when the subject does not want their name used. Do not pressure for a name.

4.4. Log the review. A testimonial published without a recorded verification is a liability the next audit will find.

**Output:** Verified, approved testimonial

---

### 5. Capture and Manage Consent

**Frequency:** At collection and continuously after
**Owner:** Developer (storage), Marketer (records), CEO (policy)

**Steps:**

5.1. Consent record contents:

```python
consent = {
    'user_id': user.id,
    'asset_id': asset.id,
    'scope': ['website', 'email', 'social'],       # explicit channels
    'attribution': 'full_name',                     # or 'anonymous_role_only'
    'may_use_image': True,
    'may_use_employer': False,                      # separate grant, often declined
    'granted_at': now(),
    'expires_at': None,                             # or a date, per policy
    'withdrawn_at': None,
}
```

5.2. **Employer and institution names require a separate, explicit grant.** A learner's hospital is not theirs alone to authorize — institutional names carry their own approval path, and using one without it can damage a relationship Bayan needs.

5.3. Store consent durably and queryably. Consent that lives in an email thread is consent that cannot be produced when needed.

5.4. **Withdrawal is immediate and unqualified.** On a takedown request: unpublish within 24 hours, across every channel, and record the withdrawal. Do not negotiate, do not ask why, do not offer to anonymize instead unless the subject asks.

**Output:** Consent recorded per asset, withdrawal path proven

---

### 6. Publish and Maintain the Library

**Frequency:** Continuous
**Owner:** Marketer

**Steps:**

6.1. Publish only assets with: verified claims, recorded consent, and CEO approval for anything making an outcome claim.

6.2. Place testimonials where the decision happens — the pricing page, the exam-track landing page, the post-signup confirmation. A testimonial library nobody visits produces nothing.

6.3. Tag each asset for placement and audience:

| Tag | Use |
|-----|-----|
| Exam track | Match to the landing page (an OMSB quote on an SCFHS page is noise) |
| Specialty | Match to specialty content |
| Objection addressed | Map to the pricing page or the skeptical moment |
| Format | Video / quote / case study |

6.4. **Rotate.** A testimonial that has been on the homepage for two years reads as decoration. Freshness is part of credibility.

6.5. Quarterly review: check consent still valid, outcome claims still accurate, and whether withdrawn assets are actually gone. Published assets have a way of surviving in email templates and social schedulers long after revocation.

**Output:** Live library with valid consent and placement

---

### 7. Measure Social-Proof Performance

**Frequency:** Monthly
**Owner:** Marketer (analysis), CEO (interpretation)

**Steps:**

7.1. Measure per asset, not in aggregate. Aggregate "testimonials work" tells you nothing about which to keep.

```sql
SELECT
    t.asset_id,
    t.placement,
    COUNT(*) FILTER (WHERE e.event = 'asset_impression') AS impressions,
    COUNT(*) FILTER (WHERE e.event = 'signup_complete')  AS signups,
    ROUND(100.0 * COUNT(*) FILTER (WHERE e.event = 'signup_complete')
          / NULLIF(COUNT(*) FILTER (WHERE e.event = 'asset_impression'), 0), 2)
                                                          AS conversion_pct
FROM testimonial_assets t
JOIN asset_events e ON e.asset_id = t.asset_id
WHERE e.occurred_at >= NOW() - INTERVAL '30 days'
GROUP BY t.asset_id, t.placement
ORDER BY conversion_pct DESC;
```

7.2. Compare placements. If video outperforms written on the pricing page but not on landing pages, that is a placement finding, not a format finding.

7.3. **Report the collection funnel too**, since that is what bounds everything else: passes recorded → candidates asked → responses → verified → published. A 15% testimonial conversion rate from 12 passes is 2 testimonials, and the funnel makes that visible.

7.4. Flag assets with declining performance. A testimonial that used to convert and no longer does is usually stale or now misaligned with the audience seeing it.

**Output:** Monthly social-proof performance report

---

## Edge Cases

**Case 1: Subject asks to withdraw a testimonial**
- **Cause:** Job change, privacy concern, employer objection, changed mind
- **Detection:** Takedown request via any channel
- **Solution:** Unpublish within 24 hours everywhere. Record the withdrawal. No questions, no negotiation. Report to CEO if the asset is used in a prominent placement so replacement content can be scheduled.

**Case 2: Testimonial contains a clinical claim that is now outdated**
- **Cause:** Guidance changed after publication
- **Detection:** Clinical Reviewer quarterly review
- **Solution:** Update or unpublish. An outdated clinical claim carries more risk than a missing testimonial — it undermines the product's core credibility in medical education.

**Case 3: Subject's exam pass is later invalidated (appeal, annulment)**
- **Cause:** Board-level process, outside Bayan's control
- **Detection:** Subject reports, or the outcome record is corrected
- **Solution:** Unpublish any outcome-specific claim immediately. The person may still be a satisfied user; the pass claim may not stand. Convert to an experience testimonial only with fresh consent.

**Case 4: Institutional employer objects to an employee's testimonial**
- **Cause:** Employment agreement, employer communications policy
- **Detection:** Employer contact or legal notice
- **Solution:** Unpublish, and anonymize if the subject wishes to continue. Never litigate a testimonial — no quote is worth the relationship with a hospital that sends cohorts.

**Case 5: A high-profile testimonial would require an incentive to secure**
- **Cause:** A well-known clinician or influencer
- **Detection:** Request for compensation or reciprocal promotion
- **Solution:** Not this SOP. That is a paid partnership, with disclosure obligations. Refer to the paid-acquisition program; keep the advocacy library unpaid and disclosed as such.

**Case 6: Testimonial collection skews heavily toward one exam track**
- **Cause:** That track converts better and gets asked more
- **Detection:** Library composition vs. candidate population
- **Solution:** Deliberately solicit the under-represented tracks. A library that is 80% OMSB cannot credibly speak to SCFHS candidates, and the gap is a conversion problem on the SCFHS landing page.

---

## KPIs & Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Testimonial conversion (passes → written) | >15% | - | - |
| Video testimonial conversion (qualified) | >3% | - | - |
| Verification pass rate | >90% | - | - |
| Consent coverage (published assets with record) | 100% | - | - |
| Takedown requests honored within 24h | 100% | - | - |
| Track coverage (no track >60% of library) | Balanced | - | - |
| Social-proof conversion lift (vs. page without) | >10% | - | - |

---

## Appendix A: Collection Funnel

```
Verified passes (Core 268)
    ↓ 100%
Candidates asked (T+3)
    ↓ ~60% respond
Responses received
    ↓ ~25% of responses
Verifiable, publishable
    ↓ ~90%
Published assets
```

The binding constraint is **responses**, not passes. Bayan does not need more customers to have more testimonials — it needs a better ask, at a better moment, with prefilled specifics.

---

## Appendix B: Why Selection Bias Is the Real Risk

A testimonial library assembled from self-selected responders looks like evidence and behaves like marketing. The specific failure mode in exam prep: Bayan publishes a wall of passes, a prospective candidate reads it as representative, enrolls, and fails — and the library turns out to have been built from the 15% who chose to respond.

Three guards in this SOP address it:

1. **Provenance on every quote** (step 2.5) — the response rate behind any claim is recoverable.
2. **No imputed outcomes** (inherited from SOP-268) — nobody is counted as a pass because they went quiet.
3. **Outcome claims require the record, not the quote** (step 4.2) — verification precedes publication.

Without these, Proc 17 produces social proof of unknown representativeness. That is worse than no testimonials, because it looks like evidence.

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-10-09 | Initial SOP (Core 274) | Stage 3 Ops Team |

---

## Approval

**Reviewed By:**
- [ ] CEO (Dr. Abdullah Al Alawi) - Publication approval, claim wording, institutional names
- [ ] Marketer (Nasim) - Collection, production, library, reporting
- [ ] Developer (TBD) - Tokenized links, consent storage, takedown plumbing
- [ ] Clinical Reviewer (TBD) - Claim verification
- [ ] Support Lead (TBD) - Consent questions, takedown handling

**Approved:** _____________ **Next Review:** Q1 2027
