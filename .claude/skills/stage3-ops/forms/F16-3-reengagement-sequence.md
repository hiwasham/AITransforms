# F16-3: Re-Engagement Email Sequence

**Process:** Proc 16 - Delivery to Success  
**Core:** 267 (Weekly Progress Tracking & Re-Engagement)  
**Trigger:** No activity for 7+ days  
**Owner:** Nasim (outreach), CEO (template approval)  
**Emails:** 3 (Week 1, 2, 3)

---

## Week 1: Soft Nudge

**Trigger:** 7 days of inactivity  
**Tone:** Friendly check-in  
**Open Rate Target:** 25-35%

**Subject:** Miss you at Bayan

**Body:**
```
Hi [Name],

Haven't seen you in a week. Everything okay?

Sometimes the hardest part is just starting again. Here's a 5-minute challenge:
[Link to 5 quick MCQs in their weakest topic]

No pressure — just checking in.

Nasim
```

**Link Personalization:**
```python
# Get weakest topic from past performance
weak_topic = db.query("""
    SELECT topic
    FROM user_answers
    WHERE user_id = %s
    GROUP BY topic
    ORDER BY AVG(CAST(correct AS INT)) ASC
    LIMIT 1
""", [user_id]).fetchone()

if weak_topic:
    link = f"https://bayan.edu.om/questions?topic={weak_topic}&limit=5"
else:
    # Fallback: most popular questions for their specialty
    link = f"https://bayan.edu.om/questions?specialty={user.specialty}&limit=5&popular=true"
```

---

## Week 2: Value Reminder

**Trigger:** 14 days of inactivity  
**Tone:** Direct but supportive  
**Open Rate Target:** 20-30%

**Subject:** Quick question about your subscription

**Body:**
```
Hi [Name],

You're paying for Bayan but haven't used it in 2 weeks. Want help getting back on track?

Reply with:
- "Help" → I'll send personalized study tips
- "Pause" → We'll pause your subscription  
- "Cancel" → No hard feelings, cancel anytime

What works best for you?

Nasim
```

**Reply Handling:**
```python
# Nasim checks inbox daily, responds within 24h
# Automated categorization:

def categorize_reply(email_body):
    body_lower = email_body.lower()
    
    if 'help' in body_lower or 'tips' in body_lower:
        return 'help_requested'
    elif 'pause' in body_lower:
        return 'pause_requested'
    elif 'cancel' in body_lower or 'refund' in body_lower:
        return 'cancel_requested'
    else:
        return 'manual_review'

# Tag in Intercom/Front for Nasim to action
```

---

## Week 3: Last Call

**Trigger:** 21 days of inactivity + subscription renewal within 7 days  
**Tone:** Final opportunity, no guilt  
**Open Rate Target:** 30-40% (urgency)

**Subject:** Should we pause your subscription?

**Body:**
```
Hi [Name],

Your subscription renews in [X days]. Since you haven't been active, I want to make sure you're getting value.

Options:
1. Pause for 30 days (keeps your progress): [Link]
2. Cancel now (full refund if within 30 days): [Link]
3. Stay active — I'll send a personalized study plan: Reply "study plan"

Your call. No judgment either way.

Nasim
```

**Days Calculation:**
```python
days_until_renewal = (user.subscription_end - datetime.now()).days

# Only send if renewal is imminent
if days_until_renewal <= 7 and user.last_activity < datetime.now() - timedelta(days=21):
    send_week3_email(user)
```

---

## Self-Service Links

**Pause Subscription:**
```
https://bayan.edu.om/account/pause?token=[encrypted_user_token]

# Backend logic:
def pause_subscription(user_id):
    # Stop Stripe billing
    stripe.subscriptions.update(
        user.stripe_subscription_id,
        pause_collection={'behavior': 'void'}  # No charges, no invoices
    )
    
    # Update user record
    db.execute("""
        UPDATE users
        SET subscription_status = 'paused',
            paused_at = NOW(),
            resume_at = NOW() + INTERVAL '30 days'
        WHERE id = %s
    """, [user_id])
    
    # Send confirmation
    send_pause_confirmation(user)
```

**Cancel Subscription:**
```
https://bayan.edu.om/account/cancel?token=[encrypted_user_token]

# Backend logic:
def cancel_subscription(user_id):
    # Cancel Stripe subscription
    stripe.subscriptions.delete(user.stripe_subscription_id)
    
    # Calculate refund (if within 30 days)
    days_since_payment = (datetime.now() - user.last_payment_date).days
    if days_since_payment <= 30:
        refund_amount = user.last_payment_amount
        stripe.refunds.create(payment_intent=user.last_payment_intent, amount=refund_amount)
        refund_issued = True
    else:
        refund_issued = False
    
    # Update user
    db.execute("""
        UPDATE users
        SET subscription_status = 'canceled',
            canceled_at = NOW(),
            subscription_end = GREATEST(subscription_end, NOW())
        WHERE id = %s
    """, [user_id])
    
    # Send confirmation + exit survey
    send_cancel_confirmation(user, refund_issued)
```

---

## Exit Survey (After Cancel)

**Sent immediately after cancellation**  
**Purpose:** Learn why users leave

**Subject:** One last question

**Body:**
```
Hi [Name],

We're sorry to see you go. 

Quick question: What made you cancel?
- Too expensive
- Didn't use it enough
- Found another tool
- Passed my exam (congrats!)
- Other: [open field]

[Link to 1-question survey]

Your feedback helps us improve for future students.

Thanks for being part of Bayan.

Nasim
```

---

## Implementation

**Automation Platform:** Customer.io  
**Campaign Logic:**

```python
# Trigger conditions
customerio.track(user_id, 'became_inactive', {
    'days_inactive': days_since_last_activity,
    'subscription_status': user.subscription_status,
    'days_until_renewal': days_until_renewal
})

# Customer.io segments:
# Week 1: users with days_inactive >= 7 AND < 14
# Week 2: users with days_inactive >= 14 AND < 21
# Week 3: users with days_inactive >= 21 AND days_until_renewal <= 7
```

**KPIs:**
- Re-activation rate: % returning to platform after Week 1 email (target: 15%)
- Reply rate: % replying to Week 2 (target: 10%)
- Churn prevention: % pausing instead of canceling (target: 30%)
- Survey completion: % completing exit survey (target: 20%)

---

## Nasim's Response Templates

**"Help" Reply:**
```
Hi [Name],

Let's get you back on track. Here's a 7-day study plan based on your goal:

Day 1-2: [Weak Topic 1] (20 questions)
Day 3-4: [Weak Topic 2] (20 questions)
Day 5-6: [Weak Topic 3] (20 questions)
Day 7: Mixed review (30 questions)

Start here: [Link to Day 1 questions]

Want to chat live? Book 15 min: [Calendly]

Rooting for you,
Nasim
```

**"Study Plan" Reply:**
```
Hi [Name],

Perfect — here's your personalized plan:

[Auto-generated based on:
- Exam date
- Current progress
- Weak topics
- Time available per day]

I'll check in with you in 3 days to see how it's going.

You've got this,
Nasim
```

---

## Edge Cases

**Already Canceled:**
- Suppress re-engagement emails once `subscription_status = 'canceled'`

**Paused Subscription:**
- Send different sequence: "Ready to resume?" at day 28 of pause

**Multiple Subscriptions (institutional):**
- Only send to primary contact, not all users under institution account
