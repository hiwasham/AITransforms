# Bayan Proc 17: Success to Referral

**Status:** Cores created. L2 Blueprints written (pending manual attachment). L1 RACI and L3 SOPs documented below.

## Process Overview

Covers post-success customer journey: converting successful users into advocates through peer referrals and testimonial capture.

**Cores:**
- Peer Invite Mechanics
- Testimonial & Case Study Capture

---

## Core: Peer Invite Mechanics

### L1 RACI Matrix

| Activity | Developer | CEO | Nasim | User |
|----------|-----------|-----|-------|------|
| Referral code generation logic | R/A | C | I | I |
| Landing page design | C | R/A | C | I |
| Cookie attribution system | R/A | I | I | I |
| Reward tier structure | C | R/A | I | I |
| Stripe coupon API integration | R/A | C | I | I |
| Fraud detection rules | R/A | C | I | I |
| Referral dashboard UI | R/A | C | C | I |
| Incentive testing | C | R/A | R | I |
| Monthly fraud review | C | R/A | R | I |

**KPIs:**
- Referral code generation success: >99.9%
- Attribution accuracy: >95% (invitee linked to correct inviter)
- Reward delivery latency: <24 hours after conversion
- Fraud rate: <2% of total referrals
- Viral coefficient: Target 0.3-0.5 (each user brings 0.3-0.5 new users)

**Integration Points:**
- **Upstream:** Core 268 (Exam Success) - successful users enter referral flow
- **Downstream:** Core 266 (Onboarding) - invitees start onboarding with attribution
- **External:** Stripe for coupon codes, email service for notifications

### L3 SOP

**Step 1: Generate Referral Code**

When user clicks "Invite Friends":
```python
import random
import string

def generate_referral_code(user_id):
    random_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    code = f"BAYAN-{user_id}-{random_suffix}"
    
    # Store in DB
    db.execute("""
        INSERT INTO referrals (code, user_id, created_at, uses, conversions)
        VALUES (%s, %s, NOW(), 0, 0)
    """, [code, user_id])
    
    return code

# Generate link
referral_link = f"https://bayan.edu.om/join/{code}"
```

**Step 2: Landing Page Attribution**

When invitee clicks referral link:
```python
from flask import request, make_response

@app.route('/join/<code>')
def referral_landing(code):
    # Verify code exists
    referral = db.query("SELECT * FROM referrals WHERE code = %s", [code]).fetchone()
    
    if not referral:
        return redirect('/signup')  # Invalid code → normal signup
    
    # Set 7-day attribution cookie
    response = make_response(render_template('signup.html', inviter_name=referral['inviter_name']))
    response.set_cookie('ref_code', code, max_age=7*24*60*60)  # 7 days
    
    # Track click
    db.execute("UPDATE referrals SET uses = uses + 1 WHERE code = %s", [code])
    mixpanel.track('referral_click', {'code': code, 'inviter_id': referral['user_id']})
    
    return response
```

**Step 3: Signup Attribution**

When invitee completes signup:
```python
@app.route('/api/signup', methods=['POST'])
def signup():
    email = request.json['email']
    ref_code = request.cookies.get('ref_code')
    
    # Create user
    user_id = create_user(email, ...)
    
    # Link to inviter
    if ref_code:
        referral = db.query("SELECT user_id FROM referrals WHERE code = %s", [ref_code]).fetchone()
        if referral:
            db.execute("""
                UPDATE users 
                SET referred_by_user_id = %s, referred_by_code = %s 
                WHERE id = %s
            """, [referral['user_id'], ref_code, user_id])
            
            # Notify inviter
            send_email(referral['user_id'], 'friend_signed_up.html', {'friend_name': email})
    
    return {'user_id': user_id}
```

**Step 4: Conversion Tracking & Rewards**

When invitee subscribes (trial→paid):
```python
@app.route('/webhooks/stripe', methods=['POST'])
def stripe_webhook():
    event = stripe.webhooks.constructEvent(request.data, request.headers['Stripe-Signature'], WEBHOOK_SECRET)
    
    if event['type'] == 'invoice.payment_succeeded':
        customer_id = event['data']['object']['customer']
        user = db.query("SELECT * FROM users WHERE stripe_customer_id = %s", [customer_id]).fetchone()
        
        if user['referred_by_user_id']:
            # Increment conversion count
            db.execute("UPDATE referrals SET conversions = conversions + 1 WHERE user_id = %s", [user['referred_by_user_id']])
            
            # Apply rewards
            apply_inviter_reward(user['referred_by_user_id'])
            apply_invitee_reward(user['id'])
            
            # Track
            mixpanel.track('referral_conversion', {
                'inviter_id': user['referred_by_user_id'],
                'invitee_id': user['id']
            })
    
    return {'status': 'ok'}

def apply_inviter_reward(inviter_id):
    # Add 1 month to subscription_end_date
    db.execute("""
        UPDATE users 
        SET subscription_end_date = subscription_end_date + INTERVAL '1 month'
        WHERE id = %s
    """, [inviter_id])
    
    send_email(inviter_id, 'referral_reward.html', {'months_earned': 1})

def apply_invitee_reward(invitee_id):
    user = db.query("SELECT stripe_customer_id FROM users WHERE id = %s", [invitee_id]).fetchone()
    
    # Create 1-month coupon
    coupon = stripe.Coupon.create(
        percent_off=100,
        duration='repeating',
        duration_in_months=1,
        name=f'Referral reward for user {invitee_id}'
    )
    
    # Apply to customer
    stripe.Customer.modify(user['stripe_customer_id'], coupon=coupon.id)
```

**Step 5: Fraud Detection**

Daily cron job:
```python
def detect_fraud():
    # Rule 1: Same IP within 5 minutes
    suspicious = db.query("""
        SELECT r.code, COUNT(*) as count
        FROM referrals r
        JOIN referral_clicks rc ON r.code = rc.code
        WHERE rc.ip_address IN (
            SELECT ip_address FROM referral_clicks
            GROUP BY ip_address, DATE_TRUNC('hour', created_at)
            HAVING COUNT(*) > 5
        )
        GROUP BY r.code
    """).fetchall()
    
    for row in suspicious:
        flag_for_review(row['code'], 'same_ip_burst')
    
    # Rule 2: 10+ signups in 24 hours
    high_volume = db.query("""
        SELECT code, COUNT(*) as signups
        FROM users
        WHERE referred_by_code IS NOT NULL
        AND created_at > NOW() - INTERVAL '24 hours'
        GROUP BY referred_by_code
        HAVING COUNT(*) >= 10
    """).fetchall()
    
    for row in high_volume:
        flag_for_review(row['code'], 'high_volume')
    
    # Rule 3: Invitee churns within 48 hours
    quick_churns = db.query("""
        SELECT u.id, u.referred_by_user_id
        FROM users u
        WHERE u.subscription_status = 'canceled'
        AND u.subscription_end_date - u.subscription_start_date < INTERVAL '48 hours'
        AND u.referred_by_user_id IS NOT NULL
    """).fetchall()
    
    for row in quick_churns:
        reverse_credit(row['referred_by_user_id'])
        flag_for_review(row['id'], 'quick_churn')
```

**Troubleshooting:**
- **Cookie not persisting:** Check browser privacy settings, test in incognito
- **Stripe coupon fails:** Retry 3 times with exponential backoff, then manual credit via support
- **False fraud flags:** Whitelist IP ranges for known institutions (hospitals, universities)

---

## Core: Testimonial & Case Study Capture

### L1 RACI Matrix

| Activity | CEO | Nasim | Developer | User |
|----------|-----|-------|-----------|------|
| Success signal detection | C | I | R/A | I |
| Email template copywriting | R/A | C | I | I |
| Testimonial form design | C | I | R/A | I |
| Video request follow-up | C | R/A | I | C |
| Testimonial approval | R/A | C | I | I |
| Website publishing | C | R | R/A | I |
| Social media posting | C | R/A | I | I |
| Case study writing | R/A | R | I | C |
| B2B case study approval | R/A | I | I | C |
| Monthly testimonial review | R/A | R | I | I |

**KPIs:**
- Testimonial request delivery: 100% within 3 days of success signal
- Response rate: >15% of requests
- Video testimonial rate: >10% of written testimonials
- Case study conversion: 1 case study per 10 testimonials
- Published testimonial count: >20 by end of Q1 2026

**Integration Points:**
- **Upstream:** Core 268 (Exam Success) - success signals trigger requests
- **Downstream:** Proc 17 (Referral) - testimonials feed social proof for referral landing pages
- **External:** Testimonial form (Typeform/Google Forms), video hosting (Vimeo/YouTube)

### L3 SOP

**Step 1: Detect Success Signals**

Daily cron job:
```python
def detect_success_signals():
    # Trigger 1: Exam marked as passed
    exam_passes = db.query("""
        SELECT user_id, exam_name FROM user_exams
        WHERE status = 'passed' AND testimonial_requested = FALSE
    """).fetchall()
    
    for row in exam_passes:
        schedule_testimonial_request(row['user_id'], 'exam_passed', row['exam_name'])
        db.execute("UPDATE user_exams SET testimonial_requested = TRUE WHERE user_id = %s", [row['user_id']])
    
    # Trigger 2: 60+ days active, 20+ sessions
    power_users = db.query("""
        SELECT user_id FROM (
            SELECT user_id, COUNT(*) as sessions, MAX(created_at) - MIN(created_at) as tenure
            FROM user_sessions
            GROUP BY user_id
        ) WHERE sessions >= 20 AND tenure >= INTERVAL '60 days'
        AND user_id NOT IN (SELECT user_id FROM testimonial_requests)
    """).fetchall()
    
    for row in power_users:
        schedule_testimonial_request(row['user_id'], 'power_user', None)
    
    # Trigger 3: CEO manual flag
    manual_flags = db.query("""
        SELECT user_id FROM users WHERE testimonial_flag = TRUE AND user_id NOT IN (SELECT user_id FROM testimonial_requests)
    """).fetchall()
    
    for row in manual_flags:
        schedule_testimonial_request(row['user_id'], 'manual', None)

def schedule_testimonial_request(user_id, trigger_type, context):
    send_at = datetime.now() + timedelta(days=3)
    db.execute("""
        INSERT INTO testimonial_requests (user_id, trigger_type, context, scheduled_at, sent_at)
        VALUES (%s, %s, %s, %s, NULL)
    """, [user_id, trigger_type, context, send_at])
```

**Step 2: Send Testimonial Request Email**

Email template (CEO writes, developer sends):
```html
Subject: Congrats on passing {{exam_name}}! Share your story?

Hi {{first_name}},

We're so proud you passed! Your success is what keeps us going.

Would you mind sharing a quick testimonial? It helps other physicians discover Bayan.

[Share Your Story] (button → form)

Takes 2 minutes. As thanks, we'll extend your subscription by 1 month free.

Best,
[CEO Name]
Bayan Team
```

Automation:
```python
def send_testimonial_requests():
    pending = db.query("""
        SELECT * FROM testimonial_requests
        WHERE scheduled_at <= NOW() AND sent_at IS NULL
    """).fetchall()
    
    for req in pending:
        user = db.query("SELECT email, first_name, exam_name FROM users WHERE id = %s", [req['user_id']]).fetchone()
        
        send_email(
            to=user['email'],
            subject=f"Congrats on passing {req['context'] or 'your exam'}! Share your story?",
            template='testimonial_request.html',
            data={'first_name': user['first_name'], 'exam_name': req['context']}
        )
        
        db.execute("UPDATE testimonial_requests SET sent_at = NOW() WHERE id = %s", [req['id']])
```

**Step 3: Testimonial Form**

Fields (Typeform or custom):
```
1. Your name (public): [text]
2. Role: [dropdown: Physician / Nurse / Student]
3. Exam passed: [text, e.g. "OMFS Board Exam 2026"]
4. Your score (optional): [number]
5. How Bayan helped (150-300 words): [textarea]
6. Permission to publish? [radio: Yes / Anonymous / No]
7. Would you record a 30-second video? [radio: Yes / No]
```

Webhook to store submissions:
```python
@app.route('/webhooks/typeform', methods=['POST'])
def typeform_webhook():
    data = request.json
    
    db.execute("""
        INSERT INTO testimonials (
            user_id, name, role, exam_name, score, content,
            publish_permission, video_interest, status, submitted_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'pending_review', NOW())
    """, [
        data['hidden']['user_id'],
        data['answers']['name'],
        data['answers']['role'],
        data['answers']['exam'],
        data['answers']['score'],
        data['answers']['content'],
        data['answers']['permission'],
        data['answers']['video']
    ])
    
    # Notify CEO for review
    send_email('ceo@bayan.edu.om', 'new_testimonial_submitted.html', {'name': data['answers']['name']})
    
    return {'status': 'ok'}
```

**Step 4: Video Follow-Up (Manual)**

If user selected "Yes" for video:
1. Nasim sends personal email with Loom/Calendly link
2. Schedule 15-min Zoom call
3. CEO records call, asks:
   - "What was your biggest challenge preparing for {{exam}}?"
   - "How did Bayan help you overcome it?"
   - "What would you tell someone considering Bayan?"
4. CEO edits video (30-60s clip):
   - Add captions via Rev or Descript
   - Add Bayan logo watermark
   - Export 1080p MP4
5. Upload to Vimeo/YouTube, embed on website

**Step 5: Approval Workflow**

CEO reviews every submission:
```python
# Admin dashboard shows pending testimonials
@app.route('/admin/testimonials')
def admin_testimonials():
    pending = db.query("SELECT * FROM testimonials WHERE status = 'pending_review' ORDER BY submitted_at DESC").fetchall()
    return render_template('admin_testimonials.html', testimonials=pending)

@app.route('/admin/testimonials/<id>/approve', methods=['POST'])
def approve_testimonial(id):
    db.execute("UPDATE testimonials SET status = 'approved', approved_at = NOW() WHERE id = %s", [id])
    
    # Apply 1-month reward
    testimonial = db.query("SELECT user_id FROM testimonials WHERE id = %s", [id]).fetchone()
    db.execute("""
        UPDATE users 
        SET subscription_end_date = subscription_end_date + INTERVAL '1 month'
        WHERE id = %s
    """, [testimonial['user_id']])
    
    # Publish to website
    publish_testimonial(id)
    
    return redirect('/admin/testimonials')
```

**Step 6: Case Study Development**

For testimonials with strong metrics:
```python
def identify_case_study_candidates():
    candidates = db.query("""
        SELECT * FROM testimonials
        WHERE status = 'approved'
        AND score IS NOT NULL
        AND score >= 85
        AND LENGTH(content) >= 200
        AND case_study_created = FALSE
    """).fetchall()
    
    for testimonial in candidates:
        notify_ceo_case_study_opportunity(testimonial)
```

CEO writes 1-page case study:
- **Challenge:** "Dr. [Name] had 60 days to prepare for OMFS boards while working full-time..."
- **Solution:** "Used Bayan's MCQ bank + spaced repetition..."
- **Results:** "Passed on first attempt with 89% score"

Get user permission for B2B use via email, then:
```python
@app.route('/admin/testimonials/<id>/create_case_study', methods=['POST'])
def create_case_study(id):
    testimonial = db.query("SELECT * FROM testimonials WHERE id = %s", [id]).fetchone()
    
    # Generate slug
    slug = slugify(f"{testimonial['name']}-{testimonial['exam_name']}")
    
    # Create case study page
    db.execute("""
        INSERT INTO case_studies (testimonial_id, slug, title, challenge, solution, results, published_at)
        VALUES (%s, %s, %s, %s, %s, %s, NOW())
    """, [
        id,
        slug,
        f"How Dr. {testimonial['name']} Passed {testimonial['exam_name']}",
        request.form['challenge'],
        request.form['solution'],
        request.form['results']
    ])
    
    db.execute("UPDATE testimonials SET case_study_created = TRUE WHERE id = %s", [id])
    
    return redirect(f'/case-studies/{slug}')
```

**Publishing Channels:**
- Website: `/testimonials` page (rotating carousel)
- Social: LinkedIn, Twitter, Instagram (with user tag if permitted)
- Email: Weekly newsletter "Success Story" section
- B2B: Case study PDFs for hospital pitches

**Troubleshooting:**
- **Low response rate (<10%):** Test new subject lines, increase reward to 2 months
- **User changes mind:** Remove published content within 48h, no penalty
- **Negative testimonial:** Don't publish, CEO follows up to resolve issue

---

## API Implementation Notes

**Successful:**
- ✅ 2 cores created (Peer Invite Mechanics, Testimonial Capture)
- ✅ L2 Blueprints written (in build_bayan_proc17.py)

**Pending Manual UI Attachment:**
- ⚠️ L2 Blueprints: Cannot fetch core IDs via API to attach programmatically
- ⚠️ L1 RACI: Documented above, needs manual attachment via Stage 3 HQ UI
- ⚠️ L3 SOPs: Documented above, needs manual attachment via Stage 3 HQ UI

**Next Steps:**
1. Manually attach L2 Blueprints via Stage 3 HQ UI (copy from build_bayan_proc17.py)
2. Manually attach L1 RACI matrices (copy from above)
3. Manually attach L3 SOPs (copy from above)
4. OR: Investigate API session/curriculum issues to restore automated attachment
5. Proceed to Priority 3 (L4 Forms Centralization)
