# Bayan Proc 16: Delivery to Success

**Status:** Cores and L2 Blueprints complete. L1 RACI and L3 SOPs documented below (API attachment failed).

## Process Overview

Covers post-purchase customer journey: payment → account provisioning → onboarding → engagement tracking → exam milestone support.

**Cores:**
- 265: Payment & Account Provisioning
- 266: Onboarding Handoff & First-Week Guidance  
- 267: Weekly Progress Tracking & Re-Engagement
- 268: Exam Milestone Support & Success Celebration

---

## Core 265: Payment & Account Provisioning

### L1 RACI Matrix

| Activity | Developer | CEO | Nasim | Stripe |
|----------|-----------|-----|-------|--------|
| Webhook endpoint setup | R/A | C | I | I |
| Signature verification code | R/A | I | I | C |
| Account provisioning logic | R/A | C | I | I |
| Welcome email template | C | R/A | C | I |
| Trial→paid conversion handling | R/A | C | I | C |
| Daily reconciliation script | R/A | C | I | C |
| Monitor provision latency | C | R/A | I | I |
| Handle failed payments | C | A | R | I |

**KPIs:**
- Provision latency: <30 seconds (webhook → access granted)
- Failed provisions: <1%
- Trial→paid conversion: 15-20%

**Integration Points:**
- **Upstream:** Core 256 (Subscription Conversion) - user completes checkout
- **Downstream:** Core 266 (Onboarding) - welcome email triggers onboarding sequence
- **External:** Stripe webhooks, email service (Resend/SendGrid)

### L3 SOP

See `attach_proc16_sops.py` line 11-132 for full step-by-step implementation.

**Summary:**
1. Set up Stripe webhook endpoint at `/webhooks/stripe`
2. Verify signature using `stripe.webhooks.constructEvent()`
3. On `checkout.session.completed`: update user DB, remove limits, send welcome email
4. On `invoice.payment_succeeded` (day 31): convert trial→active
5. Daily reconciliation: sync Stripe subscriptions → local DB
6. Monitor: provision latency dashboard, failed payment alerts

---

## Core 266: Onboarding Handoff & First-Week Guidance

### L1 RACI Matrix

| Activity | CEO | Developer | Nasim | User |
|----------|-----|-----------|-------|------|
| Email template copywriting | R/A | I | C | I |
| Drip campaign setup | C | R/A | I | I |
| Feature usage tracking | I | R/A | I | I |
| Segmentation logic | A | R | C | I |
| Open rate monitoring | R/A | I | C | I |
| Template A/B testing | R/A | C | C | I |
| User replies to check-in | C | I | R | A |

**KPIs:**
- Aha moment rate: % reaching 3 features in 7 days (target: 40%)
- Email open rates: Day 0 (40-60%), Day 3 (20-30%), Day 21 (50-70%)
- Feature discovery conversion: % moving from 1→3 features after Day 3 email

**Integration Points:**
- **Upstream:** Core 265 (Payment) - welcome email marks start of sequence
- **Downstream:** Core 267 (Tracking) - inactive users enter re-engagement flow
- **External:** Email automation platform (Customer.io, Loops), analytics (Mixpanel)

### L3 SOP

See `attach_proc16_sops.py` line 134-247 for full implementation.

**Summary:**
1. CEO writes 4 email templates (Day 0, 3, 7, 21)
2. Set up drip campaign: trigger on trial start, send based on feature usage
3. Track feature usage: log every MCQ/OSCE/article attempt, count unique features
4. Segment copy: personalize based on `features_used` count
5. Monitor open rates weekly, test new subject lines if <20%

---

## Core 267: Weekly Progress Tracking & Re-Engagement

### L1 RACI Matrix

| Activity | Nasim | CEO | Developer | User |
|----------|-------|-----|-----------|------|
| Weekly engagement report | R | A | C | I |
| Engagement tier tagging | C | A | R | I |
| Re-engagement email sequence | C | A | R | I |
| High-touch outreach | R/A | C | I | C |
| Re-activation tracking | I | C | R/A | I |
| Dashboard review | R | A | C | I |
| Email copy testing | C | R/A | I | I |

**Engagement Tiers:**
- **Power:** 5+ days/week (no action)
- **Regular:** 2-4 days/week (maintain)
- **Inactive:** <2 days/week (re-engage)
- **Dormant:** 3+ weeks inactive (stop emailing, but keep subscribed)

**KPIs:**
- Re-activation rate: 25% (inactive → active within 3 weeks)
- Voluntary churn from re-engagement: 10-15% (acceptable)
- Dormant subscriber MRR: track separately (paying but not using)

**Integration Points:**
- **Upstream:** Core 266 (Onboarding) - users who don't activate enter this flow
- **Downstream:** Core 268 (Exam Support) - re-activated users may add exam dates
- **External:** Weekly report to Nasim's email

### L3 SOP

See `attach_proc16_sops.py` line 249-357 for full implementation.

**Summary:**
1. Sunday cron: flag users with `last_login_at > 7 days ago` as inactive
2. Week 1: "We miss you" email
3. Week 2: "Quick question about your subscription" 
4. Week 3: "Should we pause your subscription?"
5. Week 4+: Stop emailing, tag as "dormant"
6. Nasim: manual high-touch outreach for high-value users
7. Track re-activation: when dormant user logs in, clear inactive status

---

## Core 268: Exam Milestone Support & Success Celebration

### L1 RACI Matrix

| Activity | CEO | Nasim | Developer | User |
|----------|-----|-------|-----------|------|
| Exam date schema | C | I | R/A | I |
| Onboarding prompt design | R/A | C | C | I |
| Reminder cron jobs | I | I | R/A | I |
| Email template copy | R/A | C | I | I |
| Post-exam survey | R/A | R | C | A |
| Success story capture | C | R/A | I | A |
| Testimonial request | C | R/A | I | I |
| Retention email ("What's next?") | R/A | C | C | I |
| Monthly adoption review | R/A | R | I | I |

**KPIs:**
- Exam date adoption: 30% of trial users add exam date
- Reminder delivery: 100% (30d, 7d, 1d)
- Post-exam response rate: >15%
- Testimonial capture: 10% of passed users
- Post-exam retention: >60% stay subscribed 30 days after exam

**Integration Points:**
- **Upstream:** Core 266 (Onboarding) - exam date collected during onboarding
- **Downstream:** Core 271 (Testimonial Capture) in Proc 17 - success stories feed referral engine
- **External:** Email reminders, testimonial capture form

### L3 SOP

See `attach_proc16_sops.py` line 359-475 for full implementation.

**Summary:**
1. Add exam date field to user schema: `exam_name`, `exam_date`, `exam_reminder_sent`
2. Daily cron: send reminders at 30d, 7d, 1d before exam
3. Day after exam: send post-exam survey ("How did it go?")
4. On "I passed" reply: send celebration email, request testimonial
5. 7 days after passed exam: retention email ("What's next? Step 3 prep?")
6. Monthly: review exam date adoption rate, test incentives if <20%

---

## API Implementation Notes

**Successful:**
- ✅ All 4 cores created (265-268)
- ✅ All 4 L2 Blueprints attached via category pattern

**Failed (documented above for manual UI attachment):**
- ❌ L1 RACI: `POST /content/raci-template/cores/{id}` returns 404
- ❌ L3 SOPs: `POST /business-processes/16/cores/{id}/sop-template` returns 404

**Next Steps:**
1. Manually attach RACI matrices via Stage 3 HQ UI (copy from above)
2. Manually attach SOPs via UI (copy from Python script)
3. OR: Investigate alternative API endpoints for RACI/SOP content types
4. Proceed to **Proc 22 L1 RACI** (Priority 1 completion)
