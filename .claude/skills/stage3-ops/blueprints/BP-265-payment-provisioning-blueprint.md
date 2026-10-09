# BP-265: Payment & Account Provisioning Blueprint

**Process:** Proc 16 - Delivery to Success  
**Core:** 265  
**Level:** L2 Blueprint (Functional Breakdown)  
**Owner:** Developer  
**Accountable:** CEO (Dr. Abdullah Al Alawi)  
**Version:** 1.0  
**Last Updated:** 2026-10-08

---

## Purpose

Break Core 265 into its functional sub-processes, define the decision logic that governs entitlements, and specify the quality gates that ensure no paying user is ever left without access.

---

## Audience

Process owner (Developer) and functional leads. This is the coordination document — it sits between the L1 RACI (who is accountable) and the L3 SOP (how to execute).

---

## Sub-Process Breakdown

Core 265 decomposes into five sub-processes:

| # | Sub-process | Owner | Trigger | Output |
|---|-------------|-------|---------|--------|
| 1 | Webhook Receipt & Validation | Developer | Stripe event | Verified, de-duplicated event |
| 2 | Entitlement Resolution | Developer | Validated event | Feature grants for a user |
| 3 | Account Verification | Developer | Grants issued | Confirmed usable account |
| 4 | User Notification | Marketer | Verified account | Confirmation email sent |
| 5 | Reconciliation | Marketer | Weekly schedule | Gap report to CEO |

---

## Sub-Process 1: Webhook Receipt & Validation

**Decision tree:**

```
Incoming POST to /api/webhooks/stripe
│
├─ Signature valid?
│   ├─ No  → return 400, log, alert if repeated
│   └─ Yes → continue
│
├─ Event ID already processed?
│   ├─ Yes → return 200 (idempotent no-op), do NOT reprocess
│   └─ No  → continue
│
├─ Event type in subscribed set?
│   ├─ No  → return 200, ignore (avoid Stripe retry storms)
│   └─ Yes → record event ID, dispatch handler
│
└─ Handler raises?
    ├─ Yes → return 500 (let Stripe retry), alert CRITICAL
    └─ No  → return 200
```

**Quality gate 1:** Every event ID recorded before handling. Processing without recording means a retry will double-provision.

**Failure mode:** Returning 500 on a *handled* event causes Stripe to retry and double-process. Only return non-200 when the handler genuinely failed.

---

## Sub-Process 2: Entitlement Resolution

**Decision tree:**

```
Validated event arrives
│
├─ client_reference_id present?
│   ├─ No  → CANNOT provision. Alert CRITICAL. Do not guess a user.
│   └─ Yes → resolve user
│
├─ Price ID recognized?
│   ├─ No  → Alert CRITICAL (unknown product). Do not grant partial.
│   └─ Yes → continue
│
├─ Grant already applied for this event?
│   ├─ Yes → skip (idempotent)
│   └─ No  → grant entitlements
│
└─ Grant succeeded?
    ├─ No  → alert CRITICAL, retry via Stripe redelivery
    └─ Yes → proceed to verification
```

**Design rule — single entitlement path:** Oman-free accounts and paid accounts both flow through `grant_entitlements()`. There is no separate "free user" code path. Branching on payment status inside the product creates two behaviours to maintain and doubles the surface for entitlement bugs.

**Quality gate 2:** Unknown price IDs never produce a partial grant. Either the user gets the full entitlement set or the event alerts.

---

## Sub-Process 3: Account Verification

**Quality gate 3 (the critical one):** Payment success is **not** access. Verification asserts that the account is actually usable before the user is told it is.

| Assertion | Failure means |
|-----------|---------------|
| Required entitlement present | Grant silently failed |
| Account is loginable | Registration or auth state broken |
| Subscription status correct | Stripe state not persisted |

Failure of any assertion → CRITICAL alert → Developer paged. This is the only assertion set in Core 265 that pages a human, and it should stay that way.

---

## Sub-Process 4: User Notification

**Handoff protocol (Developer → Marketer):**

```
Developer publishes:  provisioning_verified event { user_id, plan, provisioned_at }
Marketer consumes:    sends F16-1 confirmation, logs send against user record
```

**Timing rule:** Notification fires from `provisioning_verified`, **never** from the raw Stripe event. Sending the confirmation on payment-success means users can receive "you're in!" before the entitlement exists.

**Handoff contract:**

| Field | Meaning | Required |
|-------|---------|----------|
| `user_id` | Target account | Yes |
| `plan` | Entitlement set applied | Yes |
| `provisioned_at` | Verification timestamp | Yes |
| `specialty` | For personalization | No (defaults) |

---

## Sub-Process 5: Reconciliation

**Weekly quality gate:** Compare payments collected against entitlements active.

| Gap size | Meaning | Action |
|----------|---------|--------|
| 0 | Healthy | None |
| 1-2 (transient) | Normal webhook lag | Watch next week |
| >2 or persistent | Money collected, service not delivered | Investigate immediately |
| Negative (entitlements > payments) | Over-granting | Investigate — usually a duplicate grant bug |

**Negative gaps matter as much as positive ones.** Over-granting gives away paid access silently and will not show up in revenue reporting until much later.

---

## Exception Handling

| Exception | Detection | Response |
|-----------|-----------|----------|
| Webhook never arrives | Stripe shows success, no local event | Poll Stripe API after 1h, manual grant |
| Unknown price ID | Handler branch | Alert, no grant, fix mapping |
| Missing `client_reference_id` | Handler branch | Alert, no grant, fix checkout flow |
| Duplicate subscription | Two active subs on one customer | Refund duplicate within 24h |
| DB write failure mid-grant | Exception in handler | 500 → Stripe retry → idempotency prevents double |
| Payment fails, then succeeds | Dunning sequence | Never revoke during retry window |

---

## Integration Points

**Upstream — Proc 14 Core 259 (Paywall, Offer & Price Testing):**
- Supplies price IDs. Core 265 consumes them and must not define pricing.
- When Core 259 changes pricing, the `ENTITLEMENTS` map in Core 265 must be updated in the same release.

**Downstream — Core 266 (Onboarding):**
- Core 266 cannot start until `provisioning_verified` fires.
- A broken Core 265 produces onboarding emails pointing at inaccessible content — the most damaging visible failure in the lifecycle.

**Downstream — Proc 22 Core 262 (Instrumentation):**
- Core 265 emits `payment_success`, `subscription_started`, `provisioning_verified`.
- These are the revenue events that feed LTV and payback calculations. Missing revenue events break unit economics entirely.

---

## Quality Gates Summary

| Gate | Location | Blocks what |
|------|----------|-------------|
| 1 | Event recorded before handling | Duplicate provisioning |
| 2 | Full grant or CRITICAL alert | Partial entitlement states |
| 3 | Account verified usable before notifying | Users told they have access they lack |
| 4 | Notify from verified event, not payment | Premature confirmation emails |
| 5 | Weekly reconciliation gap = 0 | Silent revenue/entitlement drift |

---

## Known Constraints

**Pricing is undefined.** Bayan's actual price IDs are not yet set (Proc 14 Core 259 owns this). The entitlement map in this blueprint is structural — the specific prices, tiers, and amounts remain TBD. Do not treat the example price IDs as decided.

**Oman-free policy is CEO-owned.** The mechanism is specified here; the eligibility rules are not. Those require a CEO decision on verification method.

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-10-08 | Initial L2 Blueprint | Stage 3 Ops Team |

---

## Approval

**Blueprint Owner:** Developer (TBD)  
**Reviewed By:**
- [ ] CEO (Dr. Abdullah Al Alawi) - Entitlement rules, Oman-free policy
- [ ] Developer (TBD) - Technical feasibility
- [ ] Marketer (Nasim) - Notification, reconciliation reporting

**Approved:** _____________ **Next Review:** Q1 2027