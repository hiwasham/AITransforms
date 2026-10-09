# SOP-269: Peer Invite Mechanics

**Process:** Proc 17 - Success to Lead
**Core:** 269 - Peer Invite Mechanics
**Owner:** Marketer (Nasim)
**Accountable:** CEO (Dr. Abdullah Al Alawi)
**Version:** 1.0
**Last Updated:** 2026-10-09

---

## Purpose

Turn a learner who has verified success into an attributed source of new signups — through a referral mechanic that stays honest, stays capped, and does not turn a genuine recommendation into a bounty hunt.

---

## Scope

**In Scope:**
- Invite eligibility gate (who may be asked)
- Referral code generation and attribution
- Invite templates and multi-language delivery (F17-1)
- Reward issuance on qualified conversion
- Fraud detection and enforcement
- Referral CAC reporting (feeds Proc 22 Core 262/264)

**Out of Scope:**
- Testimonial and case study capture (Core 274)
- Institutional/B2B referral (Proc 15 Core 257)
- Influencer and affiliate programs (paid acquisition, not advocacy)
- Public claims about referral outcomes (CEO-owned)

---

## Roles & Responsibilities

| Role | Responsibility |
|------|----------------|
| Marketer (Nasim) | Eligibility rules, templates, conversion analysis |
| Developer | Code generation, attribution, fraud signals, reward plumbing |
| CEO (Dr. Abdullah Al Alawi) | Reward policy, fraud enforcement, public claims |
| Support Lead | Dispute resolution, reward-not-credited triage |

---

## Prerequisites

- [ ] Verified outcome data flowing from Proc 16 Core 268
- [ ] Referral attribution instrumented (Proc 22 Core 262)
- [ ] Billing system accepts reward credit application (Proc 14 Core 259)
- [ ] Fraud-signal data available (shared device, payment instrument, email domain)
- [ ] Reward policy signed off by CEO

**Hard precondition:** Do not launch invites before outcome verification works. Inviting everyone active means inviting users who may fail their exam in three weeks — an invitation sent by someone who then fails reflects badly on both parties.

---

## Procedure

### 1. Define the Invite Eligibility Gate

**Frequency:** One-time, revisit quarterly
**Owner:** CEO (policy), Marketer (definition)

**Steps:**

1.1. An invite may be offered only on a **verified positive state**:

| Eligible state | Source | Rationale |
|----------------|--------|-----------|
| Exam passed | Core 268 `passed` | Peak satisfaction, defensible |
| 30+ days sustained meaningful use | Core 267 `active` tier | Real engagement, no exam needed |
| Completed a study-plan milestone | Core 266/267 | Demonstrated progress |

1.2. **Never send an invite ask to these states:**

| Suppressed state | Why |
|------------------|-----|
| Exam failed or pending | Tone-deaf; the person has not had the outcome yet |
| `dormant` / `at_risk` | Disengaged users referring is not a signal of value |
| Dunning window (failed invoice) | Billing problem in progress |
| Unsubscribed from marketing | Consent boundary, not a preference to negotiate |
| Under 14 days since signup | No product experience to refer from |

1.3. Encode the gate so it is not a judgment call at send time:

```python
def invite_eligible(user):
    if user.email_unsubscribed:
        return False
    if user.in_dunning_window:
        return False
    if user.days_since_signup < 14:
        return False
    if user.exam_result in ('failed', 'pending'):
        return False
    if user.engagement_tier in ('at_risk', 'dormant', 'never_activated'):
        return False
    return (
        user.exam_result == 'passed'
        or (user.engagement_tier == 'active' and user.meaningful_days >= 30)
    )
```

**Output:** Eligibility gate implemented and testable

---

### 2. Generate Codes and Attribute Referrals

**Frequency:** On demand, per user
**Owner:** Developer

**Steps:**

2.1. Code generation must be collision-resistant and not guessable from a user ID:

```python
import secrets, string

ALPHABET = string.ascii_uppercase + string.digits

def generate_referral_code(user_id):
    while True:
        code = ''.join(secrets.choice(ALPHABET) for _ in range(8))
        if not ReferralCode.exists(code=code):
            ReferralCode.create(code=code, owner_user_id=user_id, created_at=now())
            return code
```

2.2. Attribution uses **two mechanisms**, because either alone loses referrals:

| Mechanism | Persists | Strength | Weakness |
|-----------|----------|----------|----------|
| URL parameter `?ref=CODE` | Until navigation away | Works cross-device from a link | Lost on manual entry, ad blockers |
| Server-side code claim at signup | Permanently | Survives link stripping | Requires the user to type the code |

Ask for the code on the signup form as an optional field. A referral that arrived by word of mouth with no link still gets credited.

2.3. Attribution window — **60 days, first-touch wins** on the referral code:

```sql
-- Attribution: earliest referral touch wins; 60-day window
SELECT DISTINCT ON (s.user_id)
    s.user_id,
    rc.owner_user_id AS referrer_id,
    t.touched_at
FROM signups s
JOIN referral_touches t ON t.visitor_id = s.visitor_id
JOIN referral_codes rc ON rc.code = t.code
WHERE t.touched_at >= s.created_at - INTERVAL '60 days'
ORDER BY s.user_id, t.touched_at ASC;
```

2.4. **One referrer per signup.** A new user touched by three different referral links credits one referrer. Multi-credit is the fastest route to a reward-liability mess and to referrers gaming links into each other's audiences.

**Output:** Codes generated, attribution resolves to exactly one referrer per signup

---

### 3. Send the Invite Ask

**Frequency:** On eligibility transition, once
**Owner:** Marketer (content), Developer (automation)

**Steps:**

3.1. Use template **F17-1**. Multi-language (English / Arabic RTL / Persian RTL) with correct RTL rendering — an RTL email that renders left-aligned reads as machine-translated and kills the ask.

3.2. **Separate the testimonial ask from the referral ask.** Per SOP-268 §4.4, one ask per email. The sequence is: congratulations → (≥3 days) → testimonial ask → (≥7 days) → invite ask.

3.3. Delivery channel priority: the learner's own channel beats ours. Many Gulf-region learners share by WhatsApp, not email. WhatsApp/Telegram share links outperform email forwards, and F17-1 already provides the share text.

3.4. **Frequency cap:** at most one invite ask per user per 90 days, and never more than two lifetime. A referral program that nags produces unsubscribes that cost more than the referrals earn.

3.5. Suppress immediately on any negative state change (failure recorded, cancellation, unsubscribe). An invite arriving the day after a failed exam is the worst-timed message this system can send.

**Output:** Invite delivered, suppression honored

---

### 4. Issue Rewards on Qualified Conversion

**Frequency:** On conversion event
**Owner:** Developer (plumbing), Support Lead (disputes), CEO (policy)

**Steps:**

4.1. A referral is **qualified** only when the referee's payment actually settles — not on signup, not on trial start.

4.2. Apply the two-sided reward per CEO policy:

```python
def on_referee_payment_settled(payment):
    attribution = resolve_referral(payment.user_id)
    if not attribution:
        return

    referrer = User.get(attribution.referrer_id)
    if referrer.reward_count >= MAX_LIFETIME_REWARDS:
        return

    # Both sides get the reward — CEO-set value
    apply_credit(referrer, REFERRER_REWARD_DAYS)
    apply_credit(payment.user_id, REFEREE_REWARD_DAYS)

    analytics.track('referral_reward_issued', {
        'referrer_id': referrer.id,
        'referee_id': payment.user_id,
        'days': REFERRER_REWARD_DAYS,
        'channel': attribution.channel,
    })
```

4.3. **Cap lifetime rewards per referrer** (CEO-set). An uncapped program concentrates into a handful of high-volume referrers who are usually not customers so much as distributors — and the CAC math stops meaning anything.

4.4. Credit, don't cash. Cash payouts invite fraud and add tax and payment-rail complexity for a program Bayan is still proving.

**Output:** Rewards issued on settled payments, capped, tracked

---

### 5. Detect and Handle Fraud

**Frequency:** Continuous, reviewed weekly
**Owner:** Developer (detection), CEO (enforcement)

**Steps:**

5.1. Flag these signals:

| Signal | Why it matters |
|--------|----------------|
| Referrer and referee share a device fingerprint | Self-referral |
| Shared payment instrument | Card-cycling for credits |
| Referee email on a disposable domain | Anonymous farming |
| >5 referrals in 24 hours from one account | Bulk abuse |
| Referee never completes onboarding | Manufactured accounts |
| Referrer's own rewards exceed their paid spend | Program is paying out more than it earns |

5.2. Detection query for the most common case — self-referral:

```sql
SELECT r.referrer_id, r.referee_id, u1.device_fingerprint AS fp1, u2.device_fingerprint AS fp2
FROM referrals r
JOIN users u1 ON u1.id = r.referrer_id
JOIN users u2 ON u2.id = r.referee_id
WHERE u1.device_fingerprint = u2.device_fingerprint
   OR u1.payment_fingerprint = u2.payment_fingerprint;
```

5.3. **Enforcement ladder** (CEO-owned, applied in order):
   1. Hold the reward pending review — do not auto-issue on a flagged referral
   2. Request evidence from the referrer (no interrogation tone; most flags are false positives from shared family devices)
   3. Void the specific referral, not the account
   4. Only for repeated, clear abuse: suspend referral privileges

5.4. **Shared-device flags are frequently false positives.** In households where a family shares a tablet, a legitimate referral trips the device check. Never void silently — a wrongly confiscated reward is a public complaint from the most engaged user segment.

5.5. Compute the fraud-neutral metric: **net referral CAC = reward cost + program cost, over qualified conversions only** (flagged conversions excluded).

**Output:** Fraud flagged, enforcement applied proportionally, net CAC tracked

---

### 6. Report Referral Performance

**Frequency:** Monthly
**Owner:** Marketer (analysis), CEO (interpretation)

**Steps:**

6.1. Report by channel and compare against paid acquisition:

```sql
SELECT
    r.channel,
    COUNT(DISTINCT r.referee_id)                                        AS referrals,
    COUNT(DISTINCT r.referee_id) FILTER (WHERE c.qualified)             AS qualified,
    ROUND(100.0 * COUNT(DISTINCT r.referee_id) FILTER (WHERE c.qualified)
          / NULLIF(COUNT(DISTINCT r.referee_id), 0), 1)                 AS qualification_rate_pct,
    ROUND(SUM(c.reward_cost) / NULLIF(COUNT(DISTINCT r.referee_id)
          FILTER (WHERE c.qualified), 0), 2)                            AS referral_cac
FROM referrals r
JOIN referral_conversions c ON c.referee_id = r.referee_id
WHERE r.created_at >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month'
  AND r.created_at <  DATE_TRUNC('month', NOW())
GROUP BY r.channel
ORDER BY qualified DESC;
```

6.2. **Compare referral CAC to paid CAC honestly.** Referral CAC excludes the salary and tooling cost of running the program; paid CAC usually includes agency or ad-platform overhead. Correct for that before declaring referral "cheaper" — a program that looks free usually isn't.

6.3. Track quality, not just volume. A referred cohort that churns at M1 in 20% of cases is not the same asset as a paid cohort retaining at 60%.

6.4. Report invites sent, invites redeemed, qualification rate, net CAC, and the current top-of-program risk (fraud rate or suppression volume).

**Output:** Monthly referral report with honest denominators

---

## Edge Cases

**Case 1: Referee signs up but never subscribes**
- **Cause:** Curiosity, price hesitation, or a failing trial
- **Detection:** Referral recorded, no settled payment
- **Solution:** No reward. Referral stays unattributed-to-reward. Do not reward trial starts — it makes the program a free-sample distribution channel.

**Case 2: Referrer is a high school or university student distributing links widely**
- **Cause:** Genuine enthusiasm or a distribution play
- **Detection:** High invite volume, low individual conversion
- **Solution:** Judge on qualified conversion, not invites. If conversions are real and the referee surveys show quality, this is a legitimate channel. If conversion is near zero, it's noise — cap it.

**Case 3: Institutional contact wants to refer their whole cohort**
- **Cause:** A hospital or university relationship
- **Detection:** Bulk interest, one contact, many seats
- **Solution:** Route to **Proc 15 Core 257 (Motion B)**. An institutional deal should be handled as a deal, not as 200 consumer referrals — the reward structure, pricing, and contract are all different.

**Case 4: Referrer's own subscription lapses, then a referred friend subscribes**
- **Cause:** Timing — they referred while subscribed, then churned
- **Detection:** Referrer cancelled before referee's first payment
- **Solution:** Per CEO policy. Default: honor the reward as credit if they return, since the referral happened while they were a genuine customer. Do not revoke retroactively out of a technicality — that reads as punitive.

**Case 5: An organization employee asks to be paid for referrals (affiliate, not advocacy)**
- **Cause:** Professional distribution interest
- **Detection:** Request for cash compensation, ongoing volume
- **Solution:** Not this SOP. That is an affiliate/influencer relationship with its own contracts, disclosure requirements, and tracking. Refer to the paid-acquisition program; do not repurpose the advocacy mechanic.

**Case 6: Referred user passes and refers someone else**
- **Cause:** The loop working as designed
- **Detection:** Multi-generation referral chain
- **Solution:** Attribute only the direct referrer. Multi-generation credit creates compounding liability that is hard to model and easy to abuse.

---

## KPIs & Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Invite → signup conversion | >10% | - | - |
| Signup → qualified (paid) conversion | >25% | - | - |
| Referral CAC | <$30 | - | - |
| Referral share of total new signups | >15% | - | - |
| Fraud rate (of flagged referrals) | <2% | - | - |
| Reward clawback disputes | <5 per quarter | - | - |
| Program cost as % of referral revenue | <20% | - | - |

---

## Appendix A: Lifecycle Position of the Invite Ask

```
Exam passed (Core 268)
    ↓ T+0        Congratulation (Core 268 §4.1)
    ↓ T+3        Testimonial ask (Core 274 / F17-2)
    ↓ T+10       Invite ask (this SOP / F17-1)
    ↓ T+?        Referee subscribes → reward issued
```

Each step is a separate email. Compressing them into one message converts a genuine relationship moment into a transaction — and the referral that results is worth less because it was asked for at the wrong time.

---

## Appendix B: Why Advocacy Is Not a Growth Hack

Referral is the cheapest acquisition channel and the easiest to corrupt. The failure mode is well documented: uncapped rewards, weak eligibility, and reward-on-signup together produce an apparent CAC of near zero and a cohort of users who never intended to pay.

Bayan's design choices all push the other way — reward on settled payment, eligibility gated on verified success, lifetime caps, credit rather than cash, one referrer per signup. Each reduces headline referral volume. Collectively they make the referral CAC a number the CEO can actually use.

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-10-09 | Initial SOP (Core 269) | Stage 3 Ops Team |

---

## Approval

**Reviewed By:**
- [ ] CEO (Dr. Abdullah Al Alawi) - Reward policy, fraud enforcement, public claims
- [ ] Marketer (Nasim) - Eligibility, templates, reporting
- [ ] Developer (TBD) - Codes, attribution, fraud signals, reward plumbing
- [ ] Support Lead (TBD) - Dispute triage, reward crediting

**Approved:** _____________ **Next Review:** Q1 2027
