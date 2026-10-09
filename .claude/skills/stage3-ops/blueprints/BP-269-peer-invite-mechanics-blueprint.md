# BP-269: Peer Invite Mechanics Blueprint

**Process:** Proc 17 - Success to Lead
**Core:** 269
**Level:** L2 Blueprint (Functional Breakdown)
**Owner:** Marketer (Nasim)
**Accountable:** CEO (Dr. Abdullah Al Alawi)
**Version:** 1.0
**Last Updated:** 2026-10-09

---

## Purpose

Break Core 269 into its functional sub-processes, define the eligibility gate that decides who may be asked, and specify the quality gates that keep referral economics honest.

---

## Sub-Process Breakdown

| # | Sub-process | Owner | Trigger | Output |
|---|-------------|-------|---------|--------|
| 1 | Eligibility Gate Evaluation | Developer | Daily recompute | Eligible-user set |
| 2 | Invite Delivery | Marketer | Eligibility transition | Sent invite (F17-1) |
| 3 | Code Generation & Attribution | Developer | On demand / on signup | Attributed referral |
| 4 | Reward Issuance | Developer | Settled referee payment | Credit applied |
| 5 | Fraud Detection & Enforcement | Developer / CEO | Continuous | Flagged, actioned |
| 6 | Referral Performance Reporting | Marketer | Monthly | Channel-level CAC |

---

## Sub-Process 1: Eligibility Gate Evaluation

**The gate is a policy, not a judgment call at send time.** Ambiguity here produces invites to failed users, which is the single worst message this process can send.

| State | Eligible? | Why |
|-------|-----------|-----|
| Exam passed | ✅ | Peak satisfaction, verified |
| Active 30+ days meaningful use | ✅ | Real engagement, no exam needed |
| Study-plan milestone completed | ✅ | Demonstrated progress |
| Exam failed or pending | ❌ | Wrong moment entirely |
| `at_risk` / `dormant` / `never_activated` | ❌ | Disengaged users are not advocates |
| In dunning window | ❌ | An unresolved billing problem |
| Email unsubscribed | ❌ | Consent boundary |
| <14 days since signup | ❌ | No experience to refer from |

**Decision tree:**

```
Daily per user
│
├─ Unsubscribed or dunning?      → SUPPRESS (never invited)
├─ Exam failed or pending?       → SUPPRESS (route to Core 268 support path)
├─ <14 days since signup?        → WAIT
├─ Tier in (at_risk,dormant,never_activated)?
│                                → SUPPRESS (route to Proc 16 Core 267)
├─ Exam passed?                  → ELIGIBLE
├─ Active + 30d meaningful?      → ELIGIBLE
└─ otherwise                     → NOT YET
```

**Quality gate 1:** Every suppression decision is logged with its reason. Referral programs fail silently when someone is invited who should not have been, and the log is what makes that debuggable.

---

## Sub-Process 2: Invite Delivery

**Timing within the lifecycle is the whole game.** The invite is the *fourth* touch, not the first.

```
Exam passed (Core 268)
  ├─ T+0   Congratulation                    ← genuine, no ask
  ├─ T+3   Testimonial request (Core 274)    ← one ask
  ├─ T+10  Peer invite (this core)           ← different ask
  └─ T+?   Referee subscribes → reward
```

**Frequency cap:** one invite per 90 days, two lifetime. A program that nags trades a durable advocate for a short-term conversion and an unsubscribe.

**Channel priority:** the learner's own channel beats ours. In Gulf-region cohorts WhatsApp/Telegram forwarding outperforms email forwards. F17-1 ships share text for each.

**Decision tree:**

```
Invite queued
│
├─ Negative state change since queueing?  → SUPPRESS, do not send
├─ Sent an invite in last 90 days?        → DEFER
├─ Lifetime invites ≥2?                   → SUPPRESS
└─ else                                  → SEND
```

**Quality gate 2:** Suppression is evaluated at send time, not queue time. A user who failed their exam between queueing and sending must not receive the invite.

---

## Sub-Process 3: Code Generation & Attribution

**Two capture mechanisms, because either alone loses referrals:**

| Mechanism | Survives | Weakness |
|-----------|----------|----------|
| URL param `?ref=CODE` | Cross-device from a link | Lost on manual entry, ad blockers |
| Code claimed at signup | Permanently | Requires typing the code |

A referral that arrived by word of mouth with no link must still be creditable — otherwise the program systematically undercounts its strongest channel.

**Attribution rules:**

| Rule | Value | Rationale |
|------|-------|-----------|
| Window | 60 days | Long enough for a considered exam-prep decision |
| Tie-break | First touch wins | Deterministic; avoids retroactive disputes |
| Referrers per signup | Exactly 1 | Multi-credit creates liability that cannot be modelled |
| Generations credited | Direct only | Multi-level compounds and invites abuse |

**Quality gate 3:** A signup resolves to exactly one referrer or to none. No partial or shared attribution states may exist in the database — an ambiguous attribution record becomes a dispute.

---

## Sub-Process 4: Reward Issuance

**Qualification event = settled payment.** Not signup, not trial start, not click.

| Event | Reward? |
|-------|---------|
| Link clicked | ❌ |
| Signup completed | ❌ |
| Trial started | ❌ |
| First payment settled | ✅ |
| Refunded within 30 days | ❌ (claw back) |

**Form:** credit, not cash. Cash payouts add tax and payment-rail complexity and attract fraud for a program Bayan is still proving.

**Caps:** type and value are CEO-owned (`REFERRER_REWARD_DAYS`, `REFEREE_REWARD_DAYS`, `MAX_LIFETIME_REWARDS`). An uncapped program concentrates into a few high-volume distributors, and CAC stops meaning anything.

**Decision tree:**

```
Payment settled
│
├─ Attribution exists?
│   ├─ no  → nothing to do
│   └─ yes ↓
├─ Referral flagged for review?  → HOLD (do not auto-issue)
├─ Referrer at lifetime cap?     → SKIP
└─ else                         → ISSUE credit to both sides
```

**Quality gate 4:** Reward issuance is idempotent, keyed on the payment event ID. A replayed webhook must not double-credit — this is the same failure class as double-provisioning in SOP-265.

---

## Sub-Process 5: Fraud Detection & Enforcement

**Signals, in rough order of precision:**

| Signal | Precision | False-positive source |
|--------|-----------|----------------------|
| Shared payment instrument | High | Family cards |
| >5 referrals / 24h | Medium | Genuine enthusiast |
| Disposable email domain | Medium | Privacy-conscious users |
| Shared device fingerprint | Low | Shared household tablet |
| Referee never onboards | Medium | Ordinary non-activation |

**Enforcement ladder** (applied in order, CEO-owned):

```
Flag
 └→ Hold reward (do not auto-issue)
     └→ Request evidence (neutral tone; most flags are false positives)
         └→ Void the referral, not the account
             └→ Suspend referral privileges (repeated clear abuse only)
```

**Quality gate 5:** No silent confiscation. A wrongly voided reward from a genuine advocate is a public complaint from the segment Bayan most needs — worse than the fraud it prevented if applied without review.

---

## Sub-Process 6: Referral Performance Reporting

**Metrics that survive scrutiny:**

| Metric | Definition | Caution |
|--------|------------|---------|
| Invites sent | Eligible users invited | Volume alone is not success |
| Qualification rate | Qualified ÷ referrals | The real quality signal |
| Referral CAC | Total reward + program cost ÷ qualified | Must include program cost |
| Referred-cohort retention | M1/M3 of referred vs paid | Report separately |

**Quality gate 6:** Referral CAC is compared to paid CAC **with matched cost bases**. Referral CAC typically excludes staff time; paid CAC typically includes agency or platform overhead. An apples-to-oranges comparison produces a decision to cut paid channels that were working.

---

## Integration Points

**Upstream — Proc 16 Core 268:** Provides the verified-outcome input. Without it, eligibility fires on the wrong population.

**Upstream — Proc 16 Core 267:** Provides engagement tier, used in the gate.

**Parallel — Core 274:** Sequencing partner, not a dependency. Testimonial ask precedes the invite; the two never share an email.

**Downstream — Proc 22 Core 262:** Invite/click/redeem events; referral CAC is uncomputable without instrumentation.

**Downstream — Proc 22 Core 264:** Referred cohorts feed cohort analysis. Divergent retention by acquisition source is a strategic finding.

**Adjacent — Proc 15 Core 257 (Motion B):** Institutional referrals route to the B2B motion, not here.

---

## Known Constraints

**Reward value is not yet set.** All targets and the CAC model assume a CEO-decided reward. Until then, referral CAC cannot be computed.

**Fraud signals are heuristics.** Device and payment fingerprinting will produce false positives in shared-household segments common in the target market. The enforcement ladder exists because the signals alone are not trustworthy enough for automatic action.

**Bayan has no referral baseline.** The KPI targets are SaaS benchmarks, not Bayan findings. First 90 days establish the baseline; treat targets as provisional until then.

**WhatsApp share links have limited attribution.** WhatsApp strips referrer data in some clients. Server-side code claim is the fallback, which makes the signup form's optional code field load-bearing, not decorative.

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-10-09 | Initial L2 Blueprint (Core 269) | Stage 3 Ops Team |

---

## Approval

**Blueprint Owner:** Marketer (Nasim)
**Reviewed By:**
- [ ] CEO (Dr. Abdullah Al Alawi) - Reward policy, fraud enforcement
- [ ] Marketer (Nasim) - Eligibility, templates, reporting
- [ ] Developer (TBD) - Codes, attribution, fraud signals
- [ ] Support Lead (TBD) - Dispute capacity

**Approved:** _____________ **Next Review:** Q1 2027
