# F16-1: Welcome Email Template

**Process:** Proc 16 - Delivery to Success  
**Core:** 265 (Payment & Account Provisioning)  
**Trigger:** Payment successful webhook  
**Owner:** CEO (copywriting), Developer (implementation)  
**Languages:** English, Arabic (RTL), Persian (RTL)

---

## English Version

**Subject:** Welcome to Bayan Premium! 🎉

**Body:**
```
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

## Arabic Version (RTL)

**Subject:** مرحباً بك في باين بريميوم! 🎉

**Body:**
```
مرحباً [Name],

تم تأكيد دفعتك. حسابك نشط الآن.

الخطوات الثلاث التالية:
1. حدد هدف امتحانك: [رابط]
2. جرب 10 أسئلة MCQ: [رابط]
3. شاهد أول فيديو OSCE: [رابط]

تحتاج مساعدة؟ رد على هذا البريد — نسيم تقرأ كل رسالة.

مع التحية,
فريق باين

[إلغاء الاشتراك] [تحديث التفضيلات]
```

---

## Persian Version (RTL)

**Subject:** به بیان پریمیوم خوش آمدید! 🎉

**Body:**
```
سلام [Name],

پرداخت شما تایید شد. حساب شما اکنون فعال است.

سه قدم بعدی:
1. هدف امتحان خود را تعیین کنید: [لینک]
2. 10 سوال MCQ را امتحان کنید: [لینک]
3. اولین ویدیو OSCE را تماشا کنید: [لینک]

به کمک نیاز دارید؟ به این ایمیل پاسخ دهید — نسیم همه پیام‌ها را می‌خواند.

با احترام,
تیم بیان

[لغو اشتراک] [به‌روزرسانی تنظیمات]
```

---

## Implementation Notes

**Email Service:** Resend or SendGrid  
**Variables:**
- `[Name]` → user.first_name or user.email
- Links → dynamic based on user.specialty

**Tracking:**
```python
mixpanel.track(user_id, 'welcome_email_sent', {
    'language': user.preferred_language,
    'timestamp': datetime.now(),
    'email_provider': 'resend'
})
```

**Send Logic:**
```python
def send_welcome_email(user_id, payment_id):
    user = db.get_user(user_id)
    
    # Select template by language
    if user.language == 'ar':
        template = 'welcome-ar'
    elif user.language == 'fa':
        template = 'welcome-fa'
    else:
        template = 'welcome-en'
    
    # Personalize links
    goal_link = f"https://bayan.edu.om/goals?specialty={user.specialty}"
    mcq_link = f"https://bayan.edu.om/questions?specialty={user.specialty}"
    osce_link = f"https://bayan.edu.om/osce?specialty={user.specialty}"
    
    # Send
    resend.send({
        'to': user.email,
        'template': template,
        'variables': {
            'name': user.first_name,
            'goal_link': goal_link,
            'mcq_link': mcq_link,
            'osce_link': osce_link
        }
    })
    
    # Log
    mixpanel.track(user_id, 'welcome_email_sent')
```

**KPI:** 40-60% open rate within 24 hours
