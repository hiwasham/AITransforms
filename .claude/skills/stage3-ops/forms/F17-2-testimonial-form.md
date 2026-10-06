# F17-2: Testimonial Request Form

**Process:** Proc 17 - Success to Referral  
**Core:** Testimonial & Case Study Capture  
**Trigger:** Email link click from F16-4 (Exam Success Email)  
**Owner:** CEO (questions), Developer (form implementation)  
**Platform:** Typeform or Tally

---

## Form URL Structure

**Pattern:** `https://forms.bayan.edu.om/testimonial?t=[encrypted_token]`

**Token Contents:**
- user_id (encrypted)
- email (encrypted)
- exam_name (encrypted)
- expiry (30 days)

**Prefill Logic:**
```python
def generate_testimonial_link(user_id):
    user = db.get_user(user_id)
    
    # Encrypt user data
    payload = {
        'user_id': user_id,
        'email': user.email,
        'exam_name': user.exam_name,
        'exp': int((datetime.now() + timedelta(days=30)).timestamp())
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    
    return f"https://forms.bayan.edu.om/testimonial?t={token}"
```

---

## Form Fields

### Question 1: Your Name
**Type:** Text (short answer)  
**Required:** Yes  
**Prefilled:** Yes (from token)

```
What's your name?

This helps us personalize our thank you. If you prefer to share anonymously, we'll respect that in Q8.
```

---

### Question 2: Your Specialty
**Type:** Dropdown  
**Required:** Yes

```
What's your specialty?

Options:
- Internal Medicine
- Surgery
- Pediatrics
- Obstetrics & Gynecology
- Psychiatry
- Emergency Medicine
- Family Medicine
- Radiology
- Anesthesiology
- Pathology
- Other (specify)
```

---

### Question 3: Your Exam
**Type:** Text (short answer)  
**Required:** Yes  
**Prefilled:** Yes (from token if available)

```
Which exam did you take?

Examples: USMLE Step 1, PLAB Part 1, MRCPCH, etc.
```

---

### Question 4: Exam Result
**Type:** Radio buttons  
**Required:** Yes

```
How did it go?

○ Passed
○ Waiting for results
○ Didn't pass this time (we'd still love to hear your feedback)
```

---

### Question 5: How Bayan Helped
**Type:** Textarea  
**Required:** Yes  
**Character limit:** 500

```
How did Bayan help you prepare?

Be specific — what features did you use? What made the difference?

This helps future students know what to expect.
```

**Placeholder:**
```
Example: "The OSCE videos were a game-changer. I watched every cardiology case twice and felt so much more confident during my exam. The MCQ bank helped me identify my weak spots early."
```

---

### Question 6: Favorite Feature
**Type:** Dropdown  
**Required:** Yes

```
What was your favorite feature?

Options:
- MCQ Question Bank
- OSCE Videos
- AI Study Plans
- Progress Tracking
- Mobile App
- Articles & Guides
- Spaced Repetition
- Mock Exams
```

---

### Question 7: Recommendation Score
**Type:** Scale (1-10)  
**Required:** Yes

```
How likely are you to recommend Bayan to a fellow medical student?

Not at all likely  1  2  3  4  5  6  7  8  9  10  Extremely likely
```

**Logic:**
- Score 9-10: NPS Promoter
- Score 7-8: NPS Passive
- Score 0-6: NPS Detractor

---

### Question 8: Permission to Publish
**Type:** Multiple choice  
**Required:** Yes

```
Can we share your feedback publicly?

○ Yes, with my name and specialty
○ Yes, but keep me anonymous (first name + specialty only)
○ No, this is private feedback only

Your choice won't affect your 1-month reward — that's guaranteed.
```

---

### Question 9: Email (Hidden Field)
**Type:** Email  
**Required:** Yes  
**Prefilled:** Yes (from token)  
**Hidden:** Yes (user doesn't see this field)

```
[Prefilled from encrypted token — used to apply reward]
```

---

## Thank You Page

**Immediately After Submission:**

**Headline:** Thank you, [Name]! 🎉

**Body:**
```
Your subscription has been extended by 1 month.

New end date: [Date calculated from current subscription_end + 30 days]

---

Want to share your story on video?

Video testimonials help us show future students what's possible. As thanks, we'll add another month free (total 2 months).

It's a casual 5-10 minute chat with Nasim — no script, no pressure.

[Book a Video Call with Nasim]

---

Your feedback helps future doctors. Thank you for being part of Bayan. 🙏

Questions? Reply to your confirmation email or contact nasim@bayan.edu.om
```

---

## Backend Processing

**Form Webhook Handler:**
```python
@app.route('/webhooks/testimonial-form', methods=['POST'])
def process_testimonial():
    data = request.json
    
    # Decrypt token
    try:
        token = data['token']
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
    except:
        return {'error': 'Invalid token'}, 400
    
    # Check for duplicate submission
    existing = db.query("""
        SELECT id FROM testimonials
        WHERE user_id = %s
    """, [user_id]).fetchone()
    
    if existing:
        return {'error': 'Already submitted'}, 400
    
    # Store testimonial
    testimonial_id = db.execute("""
        INSERT INTO testimonials (
            user_id, name, specialty, exam_name, exam_result,
            testimonial_text, favorite_feature, nps_score,
            can_publish, publish_name, created_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        RETURNING id
    """, [
        user_id,
        data['name'],
        data['specialty'],
        data['exam_name'],
        data['exam_result'],
        data['testimonial_text'],
        data['favorite_feature'],
        data['nps_score'],
        data['can_publish'] in ['yes_with_name', 'yes_anonymous'],
        data['name'] if data['can_publish'] == 'yes_with_name' else data['name'].split()[0]  # First name only for anonymous
    ]).fetchone()['id']
    
    # Apply 1-month reward
    apply_testimonial_reward(user_id, reward_type='form_submission')
    
    # Track event
    mixpanel.track(user_id, 'testimonial_submitted', {
        'nps_score': data['nps_score'],
        'exam_result': data['exam_result'],
        'can_publish': data['can_publish']
    })
    
    # Send confirmation email
    send_testimonial_confirmation(user_id, testimonial_id)
    
    # If NPS 9-10, auto-invite to video testimonial
    if data['nps_score'] >= 9:
        send_video_invite(user_id)
    
    return {'success': True, 'testimonial_id': testimonial_id}
```

---

## Confirmation Email

**Subject:** Thank you + 1 month added to your account

**Body:**
```
Hi [Name],

Thank you for sharing your experience!

Your subscription has been extended by 1 month:
- Previous end date: [Old date]
- New end date: [New date]

Your feedback:
"[First 100 chars of testimonial]..."

[Full testimonial preview]

---

Want to share your story on video?

I'd love to feature your success story. It's a casual 5-10 minute chat — no script, no pressure.

As thanks, we'll add another month free (total 2 months).

Book a time: [Calendly link]

---

Thanks for being part of Bayan.

Nasim
```

---

## Video Invite Email (Auto-sent to NPS 9-10)

**Sent 1 hour after form submission if NPS ≥ 9**

**Subject:** One more thing, [Name]

**Body:**
```
Hi [Name],

I just read your testimonial — thank you for the kind words!

Quick question: Would you be open to sharing your story on video?

What it is:
- Casual 5-10 minute chat with me (Nasim)
- We'll talk about your exam journey and how Bayan helped
- No script, no pressure — just your honest experience

Why it matters:
- Video testimonials are 10x more powerful than text
- They help future students see what's possible
- Your story could inspire someone who's struggling

As thanks:
- We'll add another month free to your subscription (total 2 months)
- You'll get the final video to share on your LinkedIn/social media

Interested? Pick a time: [Calendly link]

No worries if not — your text testimonial is already incredibly helpful.

Thanks again,
Nasim
```

---

## Analytics Dashboard

**Testimonial Funnel:**
```sql
SELECT 
    COUNT(*) as exams_completed,
    COUNT(DISTINCT t.user_id) as forms_submitted,
    ROUND(100.0 * COUNT(DISTINCT t.user_id) / COUNT(*), 2) as submission_rate,
    ROUND(AVG(t.nps_score), 2) as avg_nps,
    SUM(CASE WHEN t.can_publish THEN 1 ELSE 0 END) as publishable,
    SUM(CASE WHEN t.nps_score >= 9 THEN 1 ELSE 0 END) as promoters
FROM (
    SELECT DISTINCT user_id
    FROM user_events
    WHERE event_name = 'exam_completed'
    AND timestamp >= NOW() - INTERVAL '90 days'
) e
LEFT JOIN testimonials t ON e.user_id = t.user_id
```

**Target KPIs:**
- Form submission rate: >15% of exam completions
- Average NPS: >8.0
- Publishable testimonials: >80%
- Promoters (9-10): >70%

---

## Edge Cases

**Token Expired:**
- Show: "This link has expired. Contact us at support@bayan.edu.om for a new link."
- Backend: Generate new token on request

**Already Submitted:**
- Show: "Thanks for your feedback! You've already submitted a testimonial."
- Offer: "Want to update it? Reply to your confirmation email."

**User Canceled Subscription:**
- Still allow submission
- Still apply 1-month reward (stored as credit for reactivation)

**Failed Exam:**
- Adjust thank-you page: "Thank you for your honest feedback. We're here to support you on your next attempt."
- Don't auto-invite to video (only if they explicitly mention wanting to share their learning journey)
