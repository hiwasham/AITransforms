# F16-2: Onboarding Drip Sequence

**Process:** Proc 16 - Delivery to Success  
**Core:** 266 (Onboarding Handoff & First-Week Guidance)  
**Trigger:** Trial start or premium signup  
**Owner:** CEO (templates), Developer (automation)  
**Emails:** 4 (Day 0, 3, 7, 21)

---

## Email 1: Day 0 (Welcome)

**Trigger:** Trial start  
**Open Rate Target:** 40-60%

**Subject:** Your Bayan journey starts now

**Body:**
```
Hi [Name],

Welcome! You now have access to:
- 5,000+ MCQs across all specialties
- 200+ OSCE videos
- Custom study plans

Try this first: [Link to most popular feature for their specialty]

Stuck? Reply with "help" and I'll guide you.

Nasim
```

**Personalization:**
- Link varies by specialty (Internal Medicine → top IM questions)
- If trial: mention "30 days to explore"
- If paid: mention "unlimited access"

---

## Email 2: Day 3 (Feature Discovery)

**Trigger:** 3 days after trial start  
**Condition:** User has used 1-2 features (not 3+)  
**Open Rate Target:** 20-30%

**Subject:** [Name], have you tried [Feature]?

**Body:**
```
Hi [Name],

I noticed you used [Feature 1]. Great start!

Two more features students love:
- [Feature 2]: [1-line benefit]
- [Feature 3]: [1-line benefit]

Pick one to try today: [Link]

Still figuring it out? Book a 10-min call: [Calendly link]

Nasim
```

**Segmentation Logic:**
```python
if user.features_used == 0:
    feature_1 = "nothing yet"
    feature_2 = "MCQ practice"
    feature_3 = "OSCE videos"
elif "mcq" in user.features:
    feature_1 = "MCQ practice"
    feature_2 = "OSCE videos"
    feature_3 = "Study plans"
elif "osce" in user.features:
    feature_1 = "OSCE videos"
    feature_2 = "MCQ practice"
    feature_3 = "Study plans"
```

---

## Email 3: Day 7 (Progress Check)

**Trigger:** 7 days after trial start  
**Open Rate Target:** 20-30%

**Subject:** How's your first week going?

**Body:**
```
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

**Activity-Based Encouragement:**
```python
if questions_completed >= 50:
    encouragement = "Impressive! You're ahead of 80% of new users."
elif questions_completed >= 20:
    encouragement = "Nice progress! Keep the momentum going."
elif questions_completed >= 5:
    encouragement = "Good start! Try to hit 20 questions by end of week."
else:
    encouragement = "No worries if you're still exploring. Here's a 5-question quick start: [link]"
```

---

## Email 4: Day 21 (Exam Prep Reminder)

**Trigger:** 21 days after trial start  
**Condition:** User set an exam date  
**Open Rate Target:** 50-70% (high urgency)

**Subject:** Your exam is [X days] away

**Body:**
```
Hi [Name],

With [X days] until your exam, here's your focus list:
- Weak topics: [Top 3 from analytics]
- Practice exams: [2 recommended mocks]
- Final review: [Checklist]

You've got this. We're here if you need us.

Nasim & the Bayan team
```

**Personalization:**
```python
# Calculate weak topics
weak_topics = db.query("""
    SELECT topic, AVG(correct) as accuracy
    FROM user_answers
    WHERE user_id = %s
    GROUP BY topic
    ORDER BY accuracy ASC
    LIMIT 3
""", [user_id])

# Days until exam
days_left = (user.exam_date - datetime.now()).days

# Adjust messaging
if days_left <= 7:
    subject = "Final week prep: Your exam is [X days] away"
elif days_left <= 30:
    subject = "One month out: Your exam is [X days] away"
else:
    subject = "Your exam is [X days] away"
```

---

## Implementation

**Email Service:** Customer.io or Loops  
**Drip Campaign Setup:**

```python
# Customer.io event-based campaign
customerio.track(user_id, 'trial_started', {
    'specialty': user.specialty,
    'exam_date': user.exam_date,
    'language': user.language
})

# Campaign triggers:
# Day 0: On 'trial_started' event
# Day 3: 3 days after 'trial_started' IF features_used < 3
# Day 7: 7 days after 'trial_started'
# Day 21: 21 days after 'trial_started' IF exam_date IS NOT NULL
```

**Feature Usage Tracking:**
```python
def track_feature_usage(user_id, feature):
    # Log to DB
    db.execute("""
        INSERT INTO feature_usage (user_id, feature, timestamp)
        VALUES (%s, %s, NOW())
    """, [user_id, feature])
    
    # Update user properties in Customer.io
    features = db.query("""
        SELECT DISTINCT feature
        FROM feature_usage
        WHERE user_id = %s
    """, [user_id])
    
    customerio.identify(user_id, {
        'features_used': len(features),
        'unique_features': [f['feature'] for f in features],
        'last_activity': datetime.now()
    })
```

**KPIs:**
- Aha moment rate: % reaching 3 features in 7 days (target: 40%)
- Email sequence completion: % opening all 4 emails (target: 25%)
- Reply rate: % replying to Day 7 poll (target: 10%)

---

## A/B Testing Plan

**Week 1-2:** Baseline (templates above)  
**Week 3-4:** Test new subject lines for Email 2

**Variants:**
- Control: "[Name], have you tried [Feature]?"
- Variant A: "Quick question about your Bayan trial"
- Variant B: "The one feature you haven't tried yet"

**Success Metric:** Open rate improvement >5 percentage points
