# F17-1: Referral Invite Email Template

**Process:** Proc 17 - Success to Referral  
**Core:** Peer Invite Mechanics  
**Trigger:** User generates referral code  
**Owner:** Developer (automation)  
**Languages:** English, Arabic (RTL), Persian (RTL)

---

## Trigger Logic

**When Generated:**
```python
@app.route('/api/referral/generate', methods=['POST'])
def generate_referral():
    user_id = request.json['user_id']
    
    # Generate code
    code = generate_referral_code(user_id)
    
    # Track event
    mixpanel.track(user_id, 'referral_code_generated')
    
    # Return share options
    return {
        'code': code,
        'link': f"https://bayan.edu.om/join/{code}",
        'email_template': get_referral_email_template(user_id, code),
        'sms_template': get_referral_sms_template(user_id, code),
        'whatsapp_message': get_referral_whatsapp_template(user_id, code)
    }
```

---

## Email Version (Sent via Bayan)

**When User Clicks "Email Friend":**

**English:**

**Subject:** [Name] invited you to Bayan (+ 1 month free)

**Body:**
```
Hi,

[Name] thinks Bayan would help you ace your medical exams. They're right.

What's Bayan?
- 5,000+ MCQs across all specialties
- 200+ OSCE videos with expert commentary
- AI-powered study plans tailored to your exam

**Special offer:** Sign up with [Name]'s link and get 1 month free.

(They get 1 month free too when you subscribe.)

Start now: [Referral link with attribution cookie]

Questions? Reply to this email.

The Bayan Team

---
Why this email? [Name] sent you an invitation through Bayan's referral program.
[Unsubscribe from referral emails]
```

**Arabic:**

**Subject:** [Name] دعاك إلى باين (+ شهر مجاني)

**Body:**
```
مرحباً,

[Name] يعتقد أن باين سيساعدك في اجتياز امتحاناتك الطبية. هم على حق.

ما هو باين؟
- أكثر من 5000 سؤال MCQ في جميع التخصصات
- أكثر من 200 فيديو OSCE مع تعليقات الخبراء
- خطط دراسية مدعومة بالذكاء الاصطناعي مصممة لامتحانك

**عرض خاص:** سجل باستخدام رابط [Name] واحصل على شهر مجاني.

(سيحصلون أيضاً على شهر مجاني عندما تشترك.)

ابدأ الآن: [رابط الإحالة]

أسئلة؟ رد على هذا البريد.

فريق باين

---
لماذا هذا البريد؟ [Name] أرسل لك دعوة عبر برنامج إحالة باين.
[إلغاء الاشتراك من رسائل الإحالة]
```

**Persian:**

**Subject:** [Name] شما را به بیان دعوت کرد (+ ۱ ماه رایگان)

**Body:**
```
سلام,

[Name] فکر می‌کند بیان به شما در قبولی در آزمون‌های پزشکی کمک می‌کند. درست می‌گوید.

بیان چیست؟
- بیش از ۵۰۰۰ سوال MCQ در همه تخصص‌ها
- بیش از ۲۰۰ ویدیو OSCE با توضیحات متخصص
- برنامه‌های مطالعاتی هوشمند متناسب با آزمون شما

**پیشنهاد ویژه:** با لینک [Name] ثبت‌نام کنید و ۱ ماه رایگان دریافت کنید.

(آن‌ها هم وقتی شما اشتراک بگیرید ۱ ماه رایگان می‌گیرند.)

همین الان شروع کنید: [لینک معرفی]

سوال دارید؟ به این ایمیل پاسخ دهید.

تیم بیان

---
چرا این ایمیل؟ [Name] از طریق برنامه معرفی بیان برای شما دعوت‌نامه فرستاد.
[لغو اشتراک از ایمیل‌های معرفی]
```

---

## Copy-Paste Templates (User Shares Directly)

**Email Template (User Copies):**
```
Subject: Check out Bayan — get 1 month free

Hi,

I've been using Bayan to prep for my [exam name] and it's been really helpful.

They have 5,000+ MCQ questions and 200+ OSCE videos. The AI study plans are great too.

Use my link and you'll get 1 month free: [referral link]

Let me know if you have questions!

[Name]
```

**WhatsApp Message:**
```
Hey! I've been using Bayan to study for [exam]. Super helpful — 5K+ questions, OSCE videos, AI study plans.

Use my link for 1 month free: [referral link]

Worth checking out if you're prepping too 👍
```

**SMS Template:**
```
Hey, [Name] here. Bayan helped me prep for my medical exam. Get 1 month free with my link: [short link]
```

---

## Landing Page (/join/<code>)

**When Invitee Clicks Referral Link:**

**Header:**
```
[Inviter Name] invited you to Bayan
Get 1 month free
```

**Body:**
```
Join [Inviter Name] and 10,000+ medical students using Bayan to ace their exams.

What you get:
✓ 5,000+ MCQ questions (all specialties)
✓ 200+ OSCE videos with expert commentary
✓ AI-powered study plans
✓ Mobile app (iOS + Android)

Special offer: 1 month free (no credit card needed)

[Start Free Trial Button]

After your trial, just $29/month. Cancel anytime.
```

**Social Proof:**
- Inviter's photo (if public profile)
- "Used by students at [Top 3 Universities]"
- Average rating: 4.8/5 from 500+ reviews

---

## Attribution Cookie

**Set on Landing Page Load:**
```python
from flask import request, make_response

@app.route('/join/<code>')
def referral_landing(code):
    # Verify code exists
    referral = db.query("""
        SELECT r.*, u.first_name, u.profile_photo_url
        FROM referrals r
        JOIN users u ON r.user_id = u.id
        WHERE r.code = %s AND r.expires_at > NOW()
    """, [code]).fetchone()
    
    if not referral:
        return redirect('/signup')  # Invalid/expired code → normal signup
    
    # Track click
    db.execute("UPDATE referrals SET uses = uses + 1 WHERE code = %s", [code])
    mixpanel.track('referral_click', {
        'code': code,
        'inviter_id': referral['user_id'],
        'referrer': request.referrer
    })
    
    # Set 7-day attribution cookie
    response = make_response(render_template('referral_landing.html',
        inviter_name=referral['first_name'],
        inviter_photo=referral['profile_photo_url'],
        code=code
    ))
    response.set_cookie('ref_code', code, max_age=7*24*60*60, secure=True, httponly=True)
    
    return response
```

---

## Signup Attribution

**When Invitee Completes Signup:**
```python
@app.route('/api/signup', methods=['POST'])
def signup():
    email = request.json['email']
    ref_code = request.cookies.get('ref_code')
    
    # Create user
    user = create_user(email, ...)
    
    # Attribute referral
    if ref_code:
        referral = db.query("SELECT * FROM referrals WHERE code = %s", [ref_code]).fetchone()
        
        if referral:
            # Link invitee to inviter
            db.execute("""
                UPDATE users
                SET referred_by = %s,
                    referral_code_used = %s
                WHERE id = %s
            """, [referral['user_id'], ref_code, user.id])
            
            # Track conversion
            db.execute("UPDATE referrals SET conversions = conversions + 1 WHERE code = %s", [ref_code])
            
            mixpanel.track(user.id, 'referral_signup', {
                'inviter_id': referral['user_id'],
                'code': ref_code
            })
            
            # Notify inviter
            send_referral_signup_notification(referral['user_id'], user.email)
    
    return {'user_id': user.id}
```

---

## KPIs

**Tracking:**
- Code generation rate: % of active users generating codes (target: 20%)
- Click-through rate: clicks per code (target: 3-5)
- Conversion rate: signups per click (target: 15-25%)
- Viral coefficient: conversions per inviter (target: 0.3-0.5)

**Monitoring Dashboard:**
```sql
-- Daily referral funnel
SELECT 
    DATE(created_at) as day,
    COUNT(DISTINCT user_id) as codes_generated,
    SUM(uses) as total_clicks,
    SUM(conversions) as total_signups,
    ROUND(AVG(uses), 2) as avg_clicks_per_code,
    ROUND(100.0 * SUM(conversions) / NULLIF(SUM(uses), 0), 2) as conversion_rate
FROM referrals
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY day DESC;
```

---

## Edge Cases

**Expired Codes:**
- Default: codes expire after 365 days
- Inviter can regenerate new code
- Old code links redirect to normal signup (no attribution)

**Self-Referral:**
- Block: same IP + email domain match
- Block: inviter email === invitee email

**Multiple Codes:**
- Last-touch attribution wins
- Cookie overwrites previous ref_code

**Fraud Detection:**
- Flag: 10+ signups from same IP within 24h
- Flag: Invitee churns within 48h of signup
- Manual review by CEO before applying inviter reward
