# SOP-265: Payment & Account Provisioning

**Process:** Proc 16 - Delivery to Success  
**Core:** 265  
**Owner:** Developer  
**Accountable:** CEO (Dr. Abdullah Al Alawi)  
**Version:** 1.0  
**Last Updated:** 2026-10-08

---

## Purpose

Convert a successful payment into a fully usable, correctly-entitled Bayan account within 5 minutes, with zero manual intervention and zero user-visible waiting.

---

## Scope

**In Scope:**
- Stripe webhook handling (checkout completion, subscription lifecycle)
- Account creation and entitlement assignment
- Oman-free override (zero-price accounts)
- Payment confirmation email (F16-1)
- Provisioning failure detection and recovery
- Weekly payment-vs-entitlement reconciliation

**Out of Scope:**
- Pricing strategy and tier design (Proc 14 Core 259)
- Subscription cancellation and refunds policy (Proc 14 Core 260)
- First-week onboarding guidance (Core 266)

---

## Roles & Responsibilities

| Role | Responsibility |
|------|----------------|
| Developer | Webhook implementation, entitlement logic, failure recovery |
| Marketer (Nasim) | Confirmation email content, reconciliation reporting |
| Support Lead | User-reported access failures, frontline triage |
| CEO | Entitlement rules, Oman-free policy, refund decisions |

---

## Prerequisites

- [ ] Stripe account live with webhook endpoint configured
- [ ] User database schema supports entitlement fields
- [ ] Email sending service operational
- [ ] `client_reference_id` passed on every Stripe Checkout session (see `SOP-262-attribution-tracking.md`)
- [ ] Slack (or email) channel for provisioning failure alerts

---

## Procedure

### 1. Configure the Stripe Webhook Endpoint

**Frequency:** One-time setup  
**Owner:** Developer

**Steps:**

1.1. Register the endpoint in Stripe Dashboard → Developers → Webhooks:

```
https://bayan.edu.om/api/webhooks/stripe
```

1.2. Subscribe to these events only (unneeded events waste processing and invite bugs):

| Event | Purpose |
|-------|---------|
| `checkout.session.completed` | One-time purchase succeeded |
| `customer.subscription.created` | New recurring subscription |
| `customer.subscription.updated` | Plan change, renewal |
| `customer.subscription.deleted` | Cancellation |
| `invoice.payment_failed` | Dunning — do not revoke immediately |

1.3. Store the signing secret in the secrets vault. Never in code or env files committed to git.

1.4. **Verify signature on every request.** Reject unsigned or mis-signed payloads with 400.

```python
@app.route('/api/webhooks/stripe', methods=['POST'])
def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except (ValueError, stripe.error.SignatureVerificationError):
        return '', 400

    # Idempotency: Stripe retries. Same event_id must never provision twice.
    if EventLog.exists(event['id']):
        return '', 200
    EventLog.record(event['id'])

    handle_event(event)
    return '', 200
```

**Output:** Verified webhook endpoint receiving Stripe events

---

### 2. Provision the Account

**Frequency:** Automatic on every successful payment  
**Owner:** Developer

**Steps:**

2.1. Resolve the user from the Stripe session:

```python
def handle_checkout_completed(session):
    user_id = session.get('client_reference_id')
    if not user_id:
        # Anonymous purchase — cannot provision. Alert, do not guess.
        alert('CRITICAL', f'No client_reference_id on session {session["id"]}')
        return

    user = User.get(user_id)
    user.stripe_customer_id = session['customer']
    user.save()
```

2.2. Assign entitlements from the purchased price:

```python
ENTITLEMENTS = {
    'price_monthly':    ['mcq_all', 'osce_video', 'study_plan'],
    'price_annual':     ['mcq_all', 'osce_video', 'study_plan'],
    'price_onetime':    ['mcq_all'],
}

def grant_entitlements(user, price_id, expires_at=None):
    features = ENTITLEMENTS.get(price_id)
    if not features:
        alert('CRITICAL', f'Unknown price_id {price_id} for user {user.id}')
        return

    for f in features:
        user.grant(f, expires_at=expires_at)
    user.save()
```

2.3. **Idempotency check before granting.** Re-delivery of the same event must not double-grant or extend entitlement. Entitlement grants are additive in the database but must be keyed by the originating event.

2.4. Confirm the account is usable — not just marked paid:

```python
def verify_provisioning(user):
    assert user.has_entitlement('mcq_all'), 'MCQ entitlement missing'
    assert user.can_login(), 'Account not loginable'
```

If any assertion fails, alert CRITICAL and page the Developer.

**Output:** User account with correct entitlements, verified usable

---

### 3. Handle Oman-Free Override

**Frequency:** On qualifying registration  
**Owner:** Developer (implementation), CEO (policy)

**Steps:**

3.1. Oman-based users register at zero price with **identical entitlements** to paid international users. This is a strategic decision owned by the CEO — it is not a downgraded tier.

3.2. Determine eligibility at registration (verified Oman phone or institutional email domain per CEO policy).

3.3. Route through the same entitlement function so downstream code never needs to branch on "free vs paid":

```python
def provision_oman_free(user):
    grant_entitlements(user, price_id='price_oman_free')
    user.plan = 'oman_free'
    user.save()
```

3.4. **Do not** send Oman-free users through Stripe. No zero-amount checkout sessions — they create reconciliation noise.

3.5. Tag the account so proc 22 analysis can separate Oman-free from paid cohorts. Zero-price cohorts will distort ARPU if not segmented.

**Output:** Oman-free account with full entitlements, correctly tagged

---

### 4. Send the Confirmation Email

**Frequency:** Within 5 minutes of provisioning  
**Owner:** Marketer (content), Developer (trigger)

**Steps:**

4.1. Trigger from the provisioning success event, **not** from the Stripe webhook directly — send only after entitlements are verified, so the email never promises access that isn't there.

4.2. Use template **F16-1 (Welcome Email)**.

4.3. Personalize by specialty where known (see F16-2 for the routing table).

4.4. Log the send against the user record for deliverability debugging.

**Output:** Confirmation email delivered, send logged

---

### 5. Detect and Recover Provisioning Failures

**Frequency:** Continuous (automated), reviewed daily  
**Owner:** Developer

**Steps:**

5.1. Detect the failure class that matters: **payment succeeded, account not usable.** This is the worst case — the user paid and cannot access.

```sql
-- Payments in the last 24h with no matching active entitlement
SELECT p.stripe_session_id, p.amount, p.created_at, p.user_id
FROM payments p
LEFT JOIN entitlements e ON e.user_id = p.user_id AND e.active = true
WHERE p.status = 'succeeded'
  AND p.created_at >= NOW() - INTERVAL '24 hours'
  AND e.id IS NULL;
```

5.2. Any row returned is a **CRITICAL** alert. Page the Developer immediately — do not batch this into a daily report.

5.3. Recovery procedure:
   1. Identify root cause (missing `client_reference_id`, unknown `price_id`, DB write failure, webhook not received)
   2. Manually grant entitlements for the affected user
   3. Email the user an apology + confirmation (Support Lead)
   4. Write a regression test reproducing the failure if it was a code bug

5.4. Track failure rate. Target: **<1% of successful payments.** Above 2% is a stop-the-line problem.

**Output:** Failures detected, users recovered, root cause fixed

---

### 6. Weekly Reconciliation

**Frequency:** Weekly  
**Owner:** Marketer (reporting), Developer (queries)

**Steps:**

6.1. Compare Stripe revenue against provisioned entitlements:

```sql
SELECT
    DATE_TRUNC('week', p.created_at) AS week,
    COUNT(*) FILTER (WHERE p.status = 'succeeded')              AS payments_succeeded,
    COUNT(DISTINCT e.user_id)                                    AS entitled_users,
    COUNT(*) FILTER (WHERE p.status = 'succeeded')
      - COUNT(DISTINCT e.user_id)                                AS gap
FROM payments p
LEFT JOIN entitlements e ON e.user_id = p.user_id AND e.active = true
GROUP BY week
ORDER BY week DESC;
```

6.2. Investigate any non-zero gap. A persistent gap means money collected without service delivered.

6.3. Report to CEO: payment success rate, provisioning latency, reconciliation gap, notable failures.

**Output:** Weekly reconciliation report to CEO

---

## Edge Cases

**Case 1: Payment succeeds but webhook never arrives**
- **Cause:** Network failure, endpoint down, signature mismatch
- **Detection:** Stripe-side success with no matching event in `EventLog`
- **Solution:** Stripe retries for 3 days. If still missing, manual grant + root-cause fix. Add a Stripe API poll fallback for events older than 1 hour.

**Case 2: Same user pays twice (duplicate subscription)**
- **Cause:** User clicks checkout twice, or abandons and retries
- **Detection:** Two active subscriptions on one `stripe_customer_id`
- **Solution:** Auto-detect and refund the duplicate within 24h. Email the user. Root-cause the checkout flow if recurring.

**Case 3: Payment fails but user expects access (dunning)**
- **Cause:** Card declined on renewal
- **Solution:** **Do not revoke immediately.** Stripe smart retries run for ~2 weeks. Send dunning email (Marketer owns copy), revoke only after retries exhausted. Revoking a paying-but-temporarily-declined user is the most expensive mistake in this SOP.

**Case 4: User upgrades or downgrades mid-cycle**
- **Cause:** Plan change
- **Detection:** `customer.subscription.updated`
- **Solution:** Grant new entitlements immediately on upgrade (never make a paying user wait). On downgrade, preserve access until the paid period ends — do not revoke mid-cycle.

**Case 5: Oman-free user requests paid features**
- **Cause:** Confusion about tiers, or genuinely needs institutional content
- **Solution:** Oman-free already has full entitlements. If the request is for something outside the standard set, escalate to CEO — do not improvise a new tier in code.

---

## KPIs & Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Provisioning latency (payment → usable) | <5 min | - | - |
| Provisioning failure rate | <1% | - | - |
| Payment success rate | >70% | - | - |
| Reconciliation gap | 0 | - | - |
| Duplicate-charge rate | <0.5% | - | - |

---

## Appendix A: Entitlement Reference

| Plan | Entitlements | Price |
|------|--------------|-------|
| `oman_free` | mcq_all, osce_video, study_plan | $0 (Oman verified) |
| `price_monthly` | mcq_all, osce_video, study_plan | TBD (Proc 14 Core 259) |
| `price_annual` | mcq_all, oscE_video, study_plan | TBD |
| `price_onetime` | mcq_all | TBD |

**Note:** Pricing is owned by Proc 14 Core 259 (Paywall, Offer & Price Testing). This SOP consumes the price IDs; it does not define them.

---

## Appendix B: Webhook Event Handling Matrix

| Event | Grant | Revoke | Notify | Notes |
|-------|-------|--------|--------|-------|
| `checkout.session.completed` | ✅ | - | ✅ | One-time purchase |
| `customer.subscription.created` | ✅ | - | ✅ | Recurring start |
| `customer.subscription.updated` | ✅ (upgrade) | ⏸️ (defer to period end) | ✅ | Never mid-cycle revoke |
| `customer.subscription.deleted` | - | ✅ | ✅ | After period ends |
| `invoice.payment_failed` | - | ❌ | ✅ (dunning) | Retries handle it |

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-10-08 | Initial SOP | Stage 3 Ops Team |

---

## Approval

**Reviewed By:**
- [ ] CEO (Dr. Abdullah Al Alawi) - Entitlement rules, Oman-free policy, refunds
- [ ] Developer (TBD) - Webhook implementation, failure recovery
- [ ] Marketer (Nasim) - Confirmation email, reconciliation reporting
- [ ] Support Lead (TBD) - Triage paths

**Approved:** _____________ **Next Review:** Q1 2027