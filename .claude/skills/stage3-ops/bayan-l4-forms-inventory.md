# Bayan L4 Forms Inventory

**Purpose:** Centralized repository of email templates, scripts, checklists, and forms for all documented processes (Proc 16, 17, 22).

**Storage:** All forms below stored as markdown files in `.claude/skills/stage3-ops/forms/`. Reference from Stage 3 HQ core attachments.

---

## Proc 16: Delivery to Success (4 Forms)

### F16-1: Welcome Email Template (Core 265)

**Trigger:** Payment successful webhook  
**Owner:** CEO (copywriting), Developer (implementation)  
**Language:** English, Arabic, Persian

```markdown
Subject: Welcome to Bayan Premium! 🎉

Hi [Name],

Your payment is confirmed. Your account is now active.

Next 3 steps:
1. Set your exam goal: [Link to goal selector]
2. Try 10 MCQs: [Link to question bank]
3. Watch your first OSCE: [Link to OSCE library]

Need help? Reply to this email — Nasim reads every message.

Best,
The Bayan Team

[Unsubscribe] [Update preferences]
```

---

### F16-2: Onboarding Drip Sequence (Core 266)

**Trigger:** Trial start or premium signup  
**Owner:** CEO (templates), Developer (automation)  
**Emails:** 4 (Day 0, 3, 7, 21)

#### Email 1: Day 0 (Welcome)
```markdown
Subject: Your Bayan journey starts now

Hi [Name],

Welcome! You now have access to:
- 5,000+ MCQs across all specialties
- 200+ OSCE videos
- Custom study plans

Try this first: [Link to most popular feature for their specialty]

Stuck? Reply with "help" and I'll guide you.

Nasim
```

#### Email 2: Day 3 (Feature Discovery)
```markdown
Subject: [Name], have you tried [Feature]?

Hi [Name],

I noticed you used [Feature 1]. Great start!

Two more features students love:
- [Feature 2]: [1-line benefit]
- [Feature 3]: [1-line benefit]

Pick one to try today: [Link]

Still figuring it out? Book a 10-min call: [Calendly link]

Nasim
```

#### Email 3: Day 7 (Progress Check)
```markdown
Subject: How's your first week going?

Hi [Name],

You've completed [X questions / Y videos] this week. [Encouragement based on activity level]

Quick poll: What's most helpful so far?
- MCQ practice
- OSCE videos  
- Study plans
- Articles

Reply with your answer — takes 5 seconds.

Nasim
```

#### Email 4: Day 21 (Exam Prep Reminder)
```markdown
Subject: Your exam is [X days] away

Hi [Name],

With [X days] until your exam, here's your focus list:
- Weak topics: [Top 3 from analytics]
- Practice exams: [2 recommended mocks]
- Final review: [Checklist]

You've got this. We're here if you need us.

Nasim & the Bayan team
```

---

### F16-3: Re-Engagement Email Sequence (Core 267)

**Trigger:** No activity for 7+ days  
**Owner:** Nasim (outreach), CEO (template approval)  
**Emails:** 3 (Week 1, 2, 3)

#### Week 1: Soft Nudge
```markdown
Subject: Miss you at Bayan

Hi [Name],

Haven't seen you in a week. Everything okay?

Sometimes the hardest part is just starting again. Here's a 5-minute challenge:
[Link to 5 quick MCQs in their weakest topic]

No pressure — just checking in.

Nasim
```

#### Week 2: Value Reminder
```markdown
Subject: Quick question about your subscription

Hi [Name],

You're paying for Bayan but haven't used it in 2 weeks. Want help getting back on track?

Reply with:
- "Help" → I'll send personalized study tips
- "Pause" → We'll pause your subscription  
- "Cancel" → No hard feelings, cancel anytime

What works best for you?

Nasim
```

#### Week 3: Last Call
```markdown
Subject: Should we pause your subscription?

Hi [Name],

Your subscription renews in [X days]. Since you haven't been active, I want to make sure you're getting value.

Options:
1. Pause for 30 days (keeps your progress): [Link]
2. Cancel now (full refund if within 30 days): [Link]
3. Stay active — I'll send a personalized study plan: Reply "study plan"

Your call. No judgment either way.

Nasim
```

---

### F16-4: Exam Success Email (Core 268)

**Trigger:** User marks exam as completed  
**Owner:** CEO (template), Nasim (personal follow-up)

```markdown
Subject: How did it go? 🎓

Hi [Name],

Congratulations on finishing your [Exam Name]!

Quick favor: Share your experience?
[Link to 2-minute testimonial form]

As thanks, we'll extend your subscription by 1 month free.

And if you're willing to record a quick video testimonial, I'd love to feature your story: [Calendly link with Nasim]

Proud of you,
Nasim & the Bayan team
```

---

## Proc 17: Success to Referral (3 Forms)

### F17-1: Referral Invite Email Template (Core: Peer Invite Mechanics)

**Trigger:** User generates referral code  
**Owner:** Developer (automation)  
**Language:** User's preferred language

```markdown
Subject: [Name] invited you to Bayan (+ 1 month free)

Hi,

[Name] thinks Bayan would help you ace your medical exams. They're right.

What's Bayan?
- 5,000+ MCQs
- 200+ OSCE videos
- AI-powered study plans

**Special offer:** Sign up with [Name]'s link and get 1 month free (they get 1 month too).

Start now: [Referral link with attribution cookie]

Questions? Reply to this email.

The Bayan Team

---
Why this email? [Name] sent you an invitation through Bayan's referral program.
[Unsubscribe from referral emails]
```

---

### F17-2: Testimonial Request Form (Core: Testimonial Capture)

**Trigger:** Email link click from F16-4  
**Owner:** CEO (questions), Developer (form implementation)  
**Platform:** Typeform or Tally

**Form Fields:**
1. Your name: [Text]
2. Your specialty: [Dropdown: Internal Medicine, Surgery, Pediatrics, etc.]
3. Your exam: [Text: USMLE Step 1, PLAB, etc.]
4. Exam result: [Radio: Passed / Waiting for results]
5. How did Bayan help? [Textarea, 500 char max]
6. Favorite feature: [Dropdown: MCQs, OSCEs, Study Plans, Articles]
7. Would you recommend Bayan? [Scale 1-10]
8. Can we use your feedback publicly? [Checkbox: Yes, with my name / Yes, anonymously / No]
9. Email (for your 1-month free extension): [Email, prefilled from link]

**Thank You Page:**
```markdown
Thank you, [Name]!

Your subscription has been extended by 1 month (updated in your account now).

Want to share your story on video? Nasim would love to hear from you: [Calendly link]

Your feedback helps future doctors. Thank you for being part of Bayan. 🙏
```

---

### F17-3: Video Testimonial Script (Core: Testimonial Capture)

**Owner:** Nasim (interviewer)  
**Duration:** 2-3 minutes  
**Platform:** Zoom (record to cloud)

**Interview Guide:**
1. Intro: "Hi [Name], thanks for joining. Tell me about your exam journey."
2. Problem: "What was hardest about preparing?"
3. Solution: "How did Bayan help?"
4. Result: "How did your exam go?"
5. Recommendation: "Would you recommend Bayan? Why?"
6. Closing: "Anything else you'd like to add?"

**Post-Interview:**
- Send recording link for approval
- Edit: trim to 60-90 seconds, add captions
- Publish: YouTube unlisted + testimonials page
- Thank you gift: Additional 1 month free (total 2 months from form + video)

---

## Proc 22: Funnel Instrumentation (2 Forms)

### F22-1: Event Tracking QA Checklist (Core 268)

**Owner:** Developer (implementation), CEO (validation)  
**Format:** Google Sheet or Notion database

**Checklist Columns:**
- Event Name
- Trigger Condition
- Properties Tracked
- Tested? (Yes/No)
- Test Date
- Notes

**50 Events to Track:**

**Acquisition:**
- `page_view` (all pages)
- `qr_scan` (offline materials)
- `utm_click` (ad attribution)

**Activation:**
- `signup_start`
- `signup_complete`
- `trial_start`
- `first_login`
- `aha_moment` (3 features in 7 days)

**Retention:**
- `session_start`
- `feature_used` (MCQ, OSCE, Article, Study Plan)
- `daily_active`
- `weekly_active`

**Revenue:**
- `checkout_start`
- `payment_success`
- `payment_failed`
- `subscription_renewed`
- `subscription_canceled`

**Referral:**
- `referral_code_generated`
- `referral_click`
- `referral_signup`
- `referral_conversion`

(Full 50-event list in separate technical spec)

---

### F22-2: KPI Dashboard Alert Thresholds (Core 269)

**Owner:** CEO (thresholds), Developer (alerts)  
**Platform:** Mixpanel/Amplitude alerts or custom script

**Alert Rules:**

| Metric | Threshold | Action | Recipient |
|--------|-----------|--------|-----------|
| Trial → Paid conversion | <10% (7-day avg) | Urgent review | CEO |
| Daily signups | <5 (2 days) | Check traffic sources | CEO |
| Payment failures | >5% | Check Stripe logs | Developer |
| Churn rate | >10% (monthly) | Re-engagement campaign | Nasim |
| Referral fraud | >2% | Manual review | CEO |
| Email open rate | <15% | Test new subject lines | CEO |
| Site downtime | >1 min | Immediate fix | Developer |
| Provision latency | >60 sec | Check webhook queue | Developer |

**Delivery:** Slack #bayan-alerts + CEO/Developer email

---

## Implementation Checklist

**Storage Options:**
1. ✅ **Markdown in repo** (this file + individual files in `forms/`)
2. **Stage 3 HQ attachments** (copy-paste into core attachments)
3. **Google Drive** (share with team, link from Stage 3)
4. **Email service** (import into Customer.io/Loops)

**Next Steps:**
1. Create `forms/` subdirectory
2. Split this file into 10 individual form files (F16-1.md through F22-2.md)
3. Add forms to Stage 3 HQ cores as PDF/HTML attachments
4. Import email templates into automation platform
5. Share checklist with developer for event tracking implementation

**Time Estimate:** 90-120 minutes to split + upload + configure
