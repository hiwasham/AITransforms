# Bayan Sale to Delivery Process Documentation

**EMPOWER Layer:** 2 (Customer Lifecycle)  
**Purpose:** Bridge the gap between payment and product usage — ensure smooth handoff from sales to product  
**Owner:** CEO (handoff protocol) + Tech Lead (technical implementation)  
**Status:** Planned (not yet built in Stage 3)

---

## Why This Matters

**Current gap:** User pays → ??? → user is somehow in the product. The handoff is invisible and unmanaged.

**Risks of the gap:**
- Payment succeeds but account isn't provisioned → user can't log in
- User provisions account but doesn't know what to do next → churns before aha moment
- No handoff tracking → can't measure time-to-value or onboarding completion
- Support doesn't know who just paid → can't proactively help stuck users

**Once built:** Seamless handoff, proactive support, measurement of time-to-first-value.

---

## Scope: 2 Cores

### Core 262: Payment & Account Provisioning
**Purpose:** Instant account activation after successful payment

**Key Activities:**
1. Payment confirmation (Stripe webhook)
2. Account upgrade (free → paid tier)
3. Feature unlock (all exams, premium content)
4. Welcome email triggered
5. First login tracked

**Journey stage:** Sale → Delivery  
**Key metric:** Payment → first login time (target: <5 minutes)

---

### Core 263: Onboarding Handoff
**Purpose:** Guide new paid users to aha moment

**Key Activities:**
1. Welcome email with next steps
2. Onboarding checklist displayed in app
3. Feature tour triggered (first login)
4. Progress tracked (checklist completion)
5. Support team notified of high-value users (institutional)

**Journey stage:** Delivery (early activation)  
**Key metric:** First login → aha moment time (target: <7 days)

---

## L1: Core Process (RACI)

### Core 262: Payment & Account Provisioning

**Activities & RACI:**

| Activity | Responsible | Accountable | Consulted | Informed |
|----------|-------------|-------------|-----------|----------|
| Receive Stripe webhook | Platform | Tech Lead | — | CEO |
| Validate payment | Platform | Tech Lead | — | CEO |
| Upgrade account tier | Platform | Tech Lead | — | Nasim |
| Unlock premium features | Platform | Tech Lead | — | Nasim |
| Send welcome email | Platform | Tech Lead | Nasim (copy) | CEO |
| Log provisioning event | Platform | Tech Lead | — | Nasim |
| Handle provisioning failure | Tech Lead | CEO | Platform support | Nasim |

**KPIs:**
- Provisioning success rate: >99%
- Payment → first login time: <5 minutes (median)
- Provisioning failure rate: <1%

**Integration Points:**
- **From Core 256/261** (Subscription Conversion / Institutional Sales): Payment initiated
- **To Core 263** (Onboarding Handoff): Account provisioned, trigger welcome flow
- **To Proc 22** (Analytics): Log conversion event, track time-to-first-login

---

### Core 263: Onboarding Handoff

**Activities & RACI:**

| Activity | Responsible | Accountable | Consulted | Informed |
|----------|-------------|-------------|-----------|----------|
| Send welcome email | Platform | Tech Lead | Nasim (copy) | CEO |
| Display onboarding checklist | Platform | Tech Lead | Nasim (design) | CEO |
| Trigger feature tour | Platform | Tech Lead | Nasim (copy) | CEO |
| Track checklist progress | Platform | Tech Lead | — | Nasim |
| Flag stuck users | Platform | Tech Lead | — | Nasim, Support |
| Notify support (institutional) | Platform | Tech Lead | — | Support, CEO |

**KPIs:**
- Onboarding email open rate: >60%
- Checklist completion rate: >70% (within 7 days)
- Time to aha moment: <7 days (median)
- Institutional handoff response time: <24 hours

**Integration Points:**
- **From Core 262** (Payment & Provisioning): Account ready, trigger onboarding
- **To Core 260** (Lifecycle & Retention): Track engagement, flag dormant users
- **To Core 264** (Weekly Progress Tracking): Transition from onboarding to ongoing usage
- **To Proc 22** (Analytics): Log onboarding events, measure time-to-aha-moment

---

## L2: Blueprints (Functional Breakdown)

### Core 262: Payment & Account Provisioning Blueprint

**Sub-processes:**

**1. Webhook Reception & Validation** (Automated, <1 second)
- Receive Stripe webhook: `checkout.session.completed`
- Validate webhook signature (prevent fraud)
- Extract: customer ID, payment amount, plan tier
- Quality gate: Signature valid

**2. Account Upgrade** (Automated, <2 seconds)
- Look up user by Stripe customer ID
- Update user record: `tier: paid`, `subscription_start: now()`, `subscription_end: +30 days`
- Unlock feature flags: `all_exams: true`, `premium_content: true`, `export_notes: true`
- Quality gate: Database write successful

**3. Welcome Email Trigger** (Automated, <1 minute)
- Queue email job: "Welcome to Bayan Premium"
- Include: Login link, next steps, support contact
- Track: Email sent event
- Quality gate: Email queued successfully

**4. First Login Tracking** (Automated, real-time)
- User logs in → check if first paid login
- If yes, log event: `first_paid_login` with timestamp
- Calculate: Payment → first login time
- Quality gate: Event logged in analytics

**5. Failure Handling** (Manual, <2 hours)
- If webhook fails → alert Tech Lead via Slack
- If upgrade fails → roll back, retry, or manual intervention
- If email fails → retry queue, escalate after 3 attempts
- Quality gate: All failures resolved within 2 hours

**Decision Trees:**
- Payment amount mismatch (webhook vs expected) → flag for manual review
- User already has paid account → extend subscription_end by +30 days
- First payment from institutional domain → notify Support team

**Handoff Protocol:**
- **From Sales** (Core 256/261): Stripe checkout URL sent → user completes payment
- **To Onboarding** (Core 263): Account provisioned → trigger welcome email + checklist

---

### Core 263: Onboarding Handoff Blueprint

**Sub-processes:**

**1. Welcome Email** (Automated, <1 minute after provisioning)
- Subject: "Welcome to Bayan Premium — Let's Get You Started"
- Body:
  - Thank you for joining
  - Your account is ready
  - 3 quick next steps (see checklist)
  - Support contact info
- CTA: "Log In & Start Studying"
- Quality gate: Email delivered

**2. Onboarding Checklist Display** (Automated, on first login)
- Show modal or banner: "Complete your setup (3 steps)"
- Checklist items:
  1. Set your exam goal (SMLE, DHA, OMSB, etc.)
  2. Try 10 practice questions
  3. Watch your first OSCE video
- Track: Checklist completion per item
- Quality gate: Checklist visible on first paid login

**3. Feature Tour** (Automated, optional skip)
- Highlight key features: MCQ bank, OSCE library, Articles, Progress dashboard
- Use tool like Intro.js or custom tooltips
- Allow skip or "Show me later"
- Quality gate: Tour offered on first login

**4. Progress Tracking** (Automated, real-time)
- Monitor checklist completion
- Log event per completed item
- If all 3 items done within 7 days → mark "aha moment achieved"
- Quality gate: Events logged in analytics

**5. Stuck User Detection** (Automated, daily check)
- Daily job: Find users where:
  - Paid >3 days ago
  - First login = 0 OR checklist completion = 0%
- Flag as "stuck"
- Send follow-up email: "Need help getting started?"
- Quality gate: Follow-up sent within 24 hours of detection

**6. Institutional Handoff** (Automated + Manual)
- If email domain matches institutional list (e.g., @squh.om, @omsb.om)
- Trigger: High-value user notification to Support team
- Support reaches out within 24 hours: personal onboarding offer
- Quality gate: Support contact made within 24 hours

**Decision Trees:**
- User skips tour → track skip event, offer tour again in settings
- User completes 1/3 checklist items → send encouragement email Day 5
- User completes 3/3 checklist items → celebrate with "You're all set!" message + badge

**Handoff Protocol:**
- **From Provisioning** (Core 262): Account ready → trigger welcome email
- **To Lifecycle** (Core 260): Onboarding complete → transition to retention flows
- **To Progress Tracking** (Core 264): Daily usage begins → track weekly activity

---

## L3: SOPs (Step-by-Step Guides)

### Core 262: Payment & Account Provisioning SOP

**Step 1: Configure Stripe Webhook**
1. Log in to Stripe dashboard
2. Go to Developers → Webhooks
3. Add endpoint: `https://api.bayan.edu.om/webhooks/stripe`
4. Select events: `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`
5. Copy webhook signing secret
6. Add to environment variables: `STRIPE_WEBHOOK_SECRET=whsec_xxx`
7. Test: Trigger test webhook, verify receipt
8. Mark: **CHECKPOINT →** Webhook receiving events

**Step 2: Implement Webhook Handler**
1. Create endpoint: `POST /webhooks/stripe`
2. Validate signature:
   ```python
   signature = request.headers['Stripe-Signature']
   event = stripe.Webhook.construct_event(payload, signature, STRIPE_WEBHOOK_SECRET)
   ```
3. Extract event type: `event['type']`
4. If `checkout.session.completed`:
   - Extract: `customer_id`, `subscription_id`, `amount_paid`
   - Look up user: `user = User.get_by_stripe_customer_id(customer_id)`
   - If not found → log error, alert Tech Lead
5. Mark: **CHECKPOINT →** Webhook validated and parsed

**Step 3: Upgrade Account**
1. Update user record:
   ```python
   user.tier = 'paid'
   user.subscription_id = subscription_id
   user.subscription_start = now()
   user.subscription_end = now() + timedelta(days=30)
   user.save()
   ```
2. Unlock feature flags:
   ```python
   user.features.all_exams = True
   user.features.premium_content = True
   user.features.export_notes = True
   user.save()
   ```
3. Log event: `mixpanel.track(user.id, 'subscription_started', {plan: 'premium', amount: amount_paid})`
4. Mark: **CHECKPOINT →** Account upgraded

**Step 4: Send Welcome Email**
1. Queue email job:
   ```python
   send_email(
     to=user.email,
     template='welcome_premium',
     data={
       'name': user.name,
       'login_url': 'https://bayan.edu.om/login',
       'checklist': ['Set exam goal', 'Try 10 questions', 'Watch OSCE video']
     }
   )
   ```
2. Log event: `mixpanel.track(user.id, 'email_welcome_sent')`
3. Mark: **CHECKPOINT →** Email queued

**Step 5: Track First Login**
1. On user login, check: `if user.tier == 'paid' and user.first_paid_login_at is None:`
2. If true:
   - Set: `user.first_paid_login_at = now()`
   - Calculate: `time_to_first_login = now() - user.subscription_start`
   - Log event: `mixpanel.track(user.id, 'first_paid_login', {time_to_login_seconds: time_to_first_login})`
3. Mark: **COMPLETE →** First login tracked

**Troubleshooting:**
- Webhook signature invalid → check `STRIPE_WEBHOOK_SECRET` is correct
- User not found by customer_id → check Stripe metadata includes user_id during checkout
- Email not sent → check email queue, verify SMTP credentials
- Feature flags not unlocking → check database migration applied

---

### Core 263: Onboarding Handoff SOP

**Step 1: Design Welcome Email**
1. Open email template editor
2. Create template: `welcome_premium`
3. Subject: "Welcome to Bayan Premium — Let's Get You Started"
4. Body:
   ```
   Hi {{name}},

   Welcome to Bayan Premium! Your account is ready.

   Here are 3 quick steps to get the most out of your subscription:
   1. Set your exam goal (SMLE, DHA, OMSB, etc.)
   2. Try 10 practice questions
   3. Watch your first OSCE video

   [Log In & Start Studying Button]

   Need help? Reply to this email or contact support@bayan.edu.om

   Best,
   The Bayan Team
   ```
5. Save template
6. Mark: **CHECKPOINT →** Email template ready

**Step 2: Build Onboarding Checklist**
1. Create checklist component in app
2. Show modal on first paid login:
   - Title: "Complete Your Setup"
   - Progress bar: 0/3 items
   - Item 1: "Set your exam goal" → link to settings
   - Item 2: "Try 10 practice questions" → link to MCQ bank
   - Item 3: "Watch your first OSCE video" → link to OSCE library
3. Allow dismiss: "I'll do this later"
4. Store: `user.onboarding_checklist = {exam_goal: false, mcq_10: false, osce_video: false}`
5. Mark: **CHECKPOINT →** Checklist UI built

**Step 3: Track Checklist Progress**
1. When user sets exam goal:
   - Update: `user.onboarding_checklist.exam_goal = true`
   - Log event: `mixpanel.track(user.id, 'onboarding_exam_goal_set')`
2. When user completes 10th MCQ:
   - Update: `user.onboarding_checklist.mcq_10 = true`
   - Log event: `mixpanel.track(user.id, 'onboarding_mcq_10_complete')`
3. When user watches first OSCE video:
   - Update: `user.onboarding_checklist.osce_video = true`
   - Log event: `mixpanel.track(user.id, 'onboarding_osce_video_watched')`
4. When all 3 items true:
   - Set: `user.aha_moment_achieved_at = now()`
   - Calculate: `time_to_aha = now() - user.subscription_start`
   - Log event: `mixpanel.track(user.id, 'aha_moment_achieved', {days_to_aha: time_to_aha.days})`
5. Mark: **CHECKPOINT →** Progress tracked

**Step 4: Detect Stuck Users**
1. Create daily cron job: `check_stuck_users.py`
2. Query:
   ```sql
   SELECT * FROM users
   WHERE tier = 'paid'
   AND subscription_start < NOW() - INTERVAL '3 days'
   AND (first_paid_login_at IS NULL OR onboarding_checklist_completion = 0)
   ```
3. For each stuck user:
   - Send email: "Need help getting started?"
   - Log event: `mixpanel.track(user.id, 'email_stuck_user_sent')`
4. Run job daily at 10 AM
5. Mark: **CHECKPOINT →** Stuck user detection live

**Step 5: Institutional User Handoff**
1. On account provisioning, check email domain:
   ```python
   institutional_domains = ['squh.om', 'omsb.om', 'dha.gov.ae', 'moh.gov.sa']
   if any(domain in user.email for domain in institutional_domains):
     notify_support_team(user)
   ```
2. Notification to Support Slack channel:
   ```
   New high-value user: {{name}} ({{email}})
   Subscription: Premium
   Institution: {{domain}}
   Action: Reach out within 24 hours for personal onboarding
   ```
3. Support reaches out via email: personal intro, offer 1:1 onboarding call
4. Log event: `mixpanel.track(user.id, 'institutional_handoff_triggered')`
5. Mark: **COMPLETE →** Institutional handoff configured

**Troubleshooting:**
- Checklist not showing → check first_paid_login_at timestamp, verify modal trigger
- Progress not tracking → check event logging, verify Mixpanel integration
- Stuck user email not sending → check cron job logs, verify email queue
- Support notification not firing → check institutional_domains list, verify Slack webhook

---

## L4: Forms (Templates & Tools)

### Core 262: Payment & Account Provisioning Forms

**Webhook Configuration Checklist**
- [ ] Stripe webhook endpoint added
- [ ] Signing secret stored in env variables
- [ ] Event types selected: `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`
- [ ] Test webhook triggered and received
- [ ] Signature validation working

**Provisioning Failure Alert Template** (Slack)
```
⚠️ Provisioning Failure
User: {{email}}
Error: {{error_message}}
Timestamp: {{timestamp}}
Action: Tech Lead investigate within 2 hours
```

---

### Core 263: Onboarding Handoff Forms

**Welcome Email Template** (see Step 1 in SOP)

**Onboarding Checklist Copy**
```
Complete Your Setup (3 steps):
☐ Set your exam goal (SMLE, DHA, OMSB, etc.)
☐ Try 10 practice questions
☐ Watch your first OSCE video
```

**Stuck User Follow-Up Email Template**
```
Subject: Need help getting started with Bayan?

Hi {{name}},

I noticed you subscribed to Bayan Premium a few days ago, but haven't logged in yet. If you're having trouble getting started, I'm here to help!

Here's what I recommend:
1. Log in: https://bayan.edu.om/login
2. Set your exam goal (takes 30 seconds)
3. Try 10 practice questions to see our adaptive engine in action

Need a hand? Reply to this email or book a quick call: [Calendly link]

Best,
[Support Team Name]
```

**Institutional Onboarding Email Template** (from Support)
```
Subject: Welcome to Bayan — Let's set you up for success

Hi {{name}},

Welcome to Bayan! I'm {{support_name}} from the Bayan team.

I noticed you joined from {{institution}}. We work with many medical professionals in your institution, and I'd love to give you a personal tour of how to get the most out of your subscription.

Would you be available for a quick 15-minute call this week? I'll show you:
- How to navigate the MCQ bank for your exam
- Best practices for OSCE video review
- Tips for tracking your progress

Book a time here: [Calendly link]

Or feel free to reply with your availability.

Looking forward to helping you succeed!

Best,
{{support_name}}
Bayan Support Team
```

---

## Integration with Other Processes

**Upstream (Feeding into Sale → Delivery):**
- **Core 256** (Subscription Conversion): User completes checkout → triggers Core 262
- **Core 261** (Institutional Sales): Institutional user pays → triggers Core 262 + Core 263 institutional handoff

**Downstream (Fed by Sale → Delivery):**
- **Core 260** (Lifecycle & Retention): Onboarding complete → monitor ongoing engagement
- **Core 264** (Weekly Progress Tracking): Daily usage begins → track study habits
- **Proc 22** (Analytics): All events logged → measure time-to-value, onboarding completion rate

**Cross-functional:**
- **Support Team**: Institutional handoff notifications, stuck user escalations
- **Product Team**: Feature unlock logic, onboarding checklist design
- **Tech Team**: Webhook handling, email automation, event tracking

---

## Success Criteria

**Core 262:**
- ✅ Provisioning success rate >99%
- ✅ Payment → first login time <5 minutes (median)
- ✅ Zero provisioning failures unresolved >2 hours

**Core 263:**
- ✅ Welcome email open rate >60%
- ✅ Onboarding checklist completion >70% (within 7 days)
- ✅ Time to aha moment <7 days (median)
- ✅ Institutional handoff response time <24 hours

**Overall Impact:**
- Users know exactly what to do after paying
- Support can proactively help stuck users
- High-value institutional users get white-glove treatment
- Time-to-value is measured and optimized
- Churn from "I paid but don't know what to do" drops to near-zero
