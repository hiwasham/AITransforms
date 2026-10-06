# F22-1: Event Tracking QA Checklist

**Process:** Proc 22 - Funnel Instrumentation & Unit Economics  
**Core:** 268 (Analytics Implementation)  
**Owner:** Developer (implementation), CEO (validation)  
**Format:** Google Sheet or Notion database

---

## Checklist Structure

**Columns:**
1. Event Name
2. Category (Acquisition, Activation, Retention, Revenue, Referral)
3. Trigger Condition
4. Properties Tracked
5. Tested? (Yes/No)
6. Test Date
7. Tester Name
8. Notes

---

## 50 Events to Track

### Acquisition (7 events)

| Event Name | Trigger Condition | Properties Tracked |
|------------|-------------------|-------------------|
| `page_view` | Any page load | page_url, page_title, referrer, utm_source, utm_medium, utm_campaign |
| `qr_scan` | QR code scan (offline marketing) | qr_code_id, location, material_type |
| `utm_click` | Click with UTM parameters | utm_source, utm_medium, utm_campaign, utm_content, landing_page |
| `lead_magnet_view` | Lead magnet page view | magnet_type, specialty |
| `email_capture` | Email submitted on lead magnet | email, magnet_type, specialty |
| `ad_click` | Click from paid ad | ad_platform, ad_campaign, ad_creative_id, cost |
| `organic_search` | Arrival via Google search | search_query, landing_page |

---

### Activation (10 events)

| Event Name | Trigger Condition | Properties Tracked |
|------------|-------------------|-------------------|
| `signup_start` | User clicks "Sign Up" button | source_page, button_location |
| `signup_email_entered` | Email entered in signup form | email_domain |
| `signup_complete` | Account created successfully | user_id, signup_method (email/google), specialty, exam_goal |
| `trial_start` | Free trial activated | trial_days, specialty |
| `first_login` | First time logging in after signup | time_since_signup, device_type |
| `aha_moment` | 3 features used in 7 days | features_used, days_to_aha |
| `goal_set` | User sets exam goal | exam_name, exam_date, days_until_exam |
| `profile_complete` | User fills out profile | specialty, year_of_study, university |
| `mobile_app_install` | App installed | platform (ios/android), source_campaign |
| `first_feature_used` | First interaction with any feature | feature_name, time_since_signup |

---

### Retention (12 events)

| Event Name | Trigger Condition | Properties Tracked |
|------------|-------------------|-------------------|
| `session_start` | User opens app/logs into web | session_id, time_since_last_session |
| `session_end` | User closes app/logs out | session_duration, features_used_in_session |
| `feature_used_mcq` | User starts MCQ practice | specialty, topic, question_count |
| `feature_used_osce` | User watches OSCE video | specialty, video_id, completion_percentage |
| `feature_used_study_plan` | User accesses study plan | plan_type, days_remaining |
| `feature_used_article` | User reads article | article_id, read_time, completion_percentage |
| `daily_active` | At least 1 session today | features_used, total_time |
| `weekly_active` | At least 1 session this week | days_active, total_sessions |
| `streak_achieved` | Consecutive days of activity | streak_length, longest_streak |
| `question_answered` | User submits MCQ answer | question_id, correct, time_taken, topic |
| `video_completed` | User finishes OSCE video | video_id, watch_duration |
| `progress_checked` | User views progress dashboard | weak_topics_count, overall_accuracy |

---

### Revenue (11 events)

| Event Name | Trigger Condition | Properties Tracked |
|------------|-------------------|-------------------|
| `paywall_impression` | User sees pricing/upgrade prompt | location, trial_day, features_attempted |
| `checkout_start` | User clicks "Subscribe" button | plan_selected, price, trial_days_remaining |
| `checkout_email_entered` | Email entered in Stripe Checkout | email_match (same as signup?) |
| `payment_method_added` | Card details entered | card_brand, card_country |
| `payment_success` | Stripe webhook: payment succeeded | amount, currency, plan, stripe_customer_id |
| `payment_failed` | Stripe webhook: payment failed | failure_reason, retry_count |
| `subscription_started` | First successful payment | plan, billing_cycle, mrr |
| `subscription_renewed` | Recurring payment succeeded | renewal_count, days_since_start, mrr |
| `subscription_upgraded` | User upgrades plan | from_plan, to_plan, mrr_change |
| `subscription_downgraded` | User downgrades plan | from_plan, to_plan, mrr_change |
| `subscription_canceled` | User cancels subscription | cancellation_reason, days_active, ltv |

---

### Referral (10 events)

| Event Name | Trigger Condition | Properties Tracked |
|------------|-------------------|-------------------|
| `referral_code_generated` | User creates referral code | user_id, code |
| `referral_link_shared` | User clicks "Share" on referral | share_method (email/sms/whatsapp) |
| `referral_click` | Invitee clicks referral link | referral_code, inviter_id, referrer |
| `referral_signup` | Invitee completes signup via referral | referral_code, inviter_id, invitee_id |
| `referral_conversion` | Invitee subscribes (paid) | referral_code, inviter_id, invitee_id, amount |
| `referral_reward_applied` | Inviter receives reward | reward_type, months_added |
| `testimonial_form_opened` | User opens testimonial form | user_id, days_since_exam |
| `testimonial_submitted` | User submits testimonial | nps_score, can_publish, exam_result |
| `video_invite_sent` | User invited to video testimonial | nps_score |
| `video_testimonial_completed` | User completes video testimonial | video_id, approval_status |

---

## QA Testing Protocol

### For Each Event:

**1. Trigger Test**
```bash
# Example: Test signup_complete event
1. Open browser DevTools → Network tab
2. Complete signup flow
3. Search for Mixpanel/GA4 request
4. Verify event fired with correct name
```

**2. Properties Test**
```bash
# Verify all properties present and correct
1. Check request payload
2. Confirm: user_id, timestamp, all custom properties
3. Test edge cases (missing data, invalid values)
```

**3. Cross-Device Test**
```bash
# Ensure event fires on all platforms
1. Web (desktop)
2. Web (mobile)
3. iOS app
4. Android app
```

**4. Production Validation**
```bash
# After deployment
1. Trigger event in production
2. Check Mixpanel/GA4 dashboard within 5 minutes
3. Verify event appears with correct properties
```

---

## QA Checklist Template

**Google Sheet Structure:**

| Event | Category | Tested? | Test Date | Tester | Web Desktop | Web Mobile | iOS | Android | Notes |
|-------|----------|---------|-----------|--------|-------------|------------|-----|---------|-------|
| page_view | Acquisition | ✅ | 2026-10-01 | Dev1 | ✅ | ✅ | ✅ | ✅ | All properties tracking correctly |
| signup_complete | Activation | ✅ | 2026-10-02 | Dev1 | ✅ | ✅ | ✅ | ❌ | iOS missing specialty property |
| payment_success | Revenue | ⏳ | - | - | - | - | - | - | Pending Stripe test mode validation |

**Legend:**
- ✅ = Passed
- ❌ = Failed
- ⏳ = In Progress
- ⬜ = Not Started

---

## Implementation Tracking

**Mixpanel Setup:**
```javascript
// Initialize Mixpanel
mixpanel.init('YOUR_PROJECT_TOKEN');

// Identify user on signup
mixpanel.identify(user.id);
mixpanel.people.set({
    '$email': user.email,
    '$name': user.name,
    'specialty': user.specialty,
    'exam_goal': user.exam_goal,
    'signup_date': user.created_at
});

// Track event with properties
mixpanel.track('signup_complete', {
    'signup_method': 'email',
    'specialty': user.specialty,
    'referral_code': referral_code || null,
    'utm_source': utm_source || 'direct'
});
```

**Google Analytics 4 Setup:**
```javascript
// Initialize GA4
gtag('config', 'G-XXXXXXXXXX');

// Track event
gtag('event', 'signup_complete', {
    'method': 'email',
    'specialty': user.specialty,
    'user_id': user.id
});
```

---

## Common Testing Issues

**Issue 1: Event Fires Multiple Times**
- **Cause:** Multiple event listeners attached
- **Fix:** Debounce or use once() listener
- **Test:** Trigger action 3 times, verify event fires once

**Issue 2: Properties Missing**
- **Cause:** Variable undefined at event time
- **Fix:** Add null checks, fallback values
- **Test:** Trigger with missing data, verify defaults

**Issue 3: Events Not Appearing in Dashboard**
- **Cause:** Incorrect API key, blocked by adblocker, CORS issue
- **Fix:** Check console errors, test in incognito
- **Test:** Disable adblockers, check network tab

**Issue 4: Wrong User Attributed**
- **Cause:** User not identified before tracking
- **Fix:** Call identify() before track()
- **Test:** Switch users, verify events attributed correctly

---

## Validation Script

**Run After Implementation:**
```python
# validate_tracking.py
import requests
from datetime import datetime, timedelta

def validate_event_tracking(event_name, expected_properties):
    """Check if event is firing with correct properties"""
    
    # Query Mixpanel for recent events
    response = requests.get(
        'https://mixpanel.com/api/2.0/events',
        auth=('API_SECRET', ''),
        params={
            'event': event_name,
            'from_date': (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d'),
            'to_date': datetime.now().strftime('%Y-%m-%d')
        }
    )
    
    if response.status_code != 200:
        return f"❌ API Error: {response.status_code}"
    
    data = response.json()
    
    if not data.get('results'):
        return f"❌ No events found for {event_name}"
    
    # Check properties
    sample_event = data['results'][0]
    missing_props = [p for p in expected_properties if p not in sample_event['properties']]
    
    if missing_props:
        return f"⚠️  Missing properties: {missing_props}"
    
    return f"✅ {event_name} tracking correctly"

# Validate all 50 events
events_to_validate = [
    ('signup_complete', ['signup_method', 'specialty', 'referral_code']),
    ('payment_success', ['amount', 'plan', 'stripe_customer_id']),
    # ... all 50 events
]

for event, props in events_to_validate:
    print(validate_event_tracking(event, props))
```

---

## Timeline

**Week 1: Foundation (Acquisition + Activation)**
- Day 1-2: Set up Mixpanel + GA4
- Day 3-4: Implement & test 17 events
- Day 5: QA validation

**Week 2: Core Features (Retention + Revenue)**
- Day 1-3: Implement & test 23 events
- Day 4-5: QA validation + fix issues

**Week 3: Growth (Referral + Polish)**
- Day 1-2: Implement & test 10 events
- Day 3-4: Cross-platform testing
- Day 5: Final validation + documentation

**Week 4: Monitoring**
- Set up alerts for missing events
- Train team on dashboard usage
- Document for future reference
