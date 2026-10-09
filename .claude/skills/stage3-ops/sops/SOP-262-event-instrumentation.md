# SOP-262: Analytics Implementation & Event Instrumentation

**Process:** Proc 22 - Financial Performance Management
**Core:** 262 - Analytics Implementation & Event Instrumentation
**Owner:** Developer
**Accountable:** CTO (TBD)
**Version:** 1.1
**Last Updated:** 2026-10-09

> **Core-ID note (2026-10-09):** This SOP was written as "SOP-262-event-instrumentation" against an
> unverified core ID. The live Proc 22 core for event instrumentation is **262**.
> Attribution instrumentation lives in `SOP-262-attribution-tracking.md`;
> dashboards and alerts in `SOP-263-kpi-dashboard-and-monitoring.md`; unit
> economics in `SOP-264-unit-economics-and-cohort-analysis.md`.

---

## Purpose

Implement comprehensive event tracking across the AARRR funnel so every
downstream metric in Proc 22 — CAC, LTV, payback, retention — is computed from
data that is actually known to be correct.

---


## Scope

**In Scope:**
- Event taxonomy definition (50 events across AARRR)
- Mixpanel SDK integration
- Event QA and tracking-plan maintenance
- Data-quality monitoring for the event pipeline

**Out of Scope:**
- Attribution strategy and UTM handling (SOP-262-attribution-tracking)
- Dashboard and alert configuration (SOP-263-kpi-dashboard-and-monitoring)
- Unit economics calculations (SOP-264-unit-economics-and-cohort-analysis)
- Data warehousing infrastructure
- Custom analytics platform development

---

## Roles & Responsibilities

| Role | Responsibility |
|------|----------------|
| Developer | Event implementation, SDK integration |
| Data Analyst | Event taxonomy, QA standards |
| CTO | Platform selection, technical architecture |
| Marketer (Nasim) | Marketing funnel metrics definition |
| CEO (Dr. Abdullah Al Alawi) | KPI prioritization |

---

## Prerequisites

- [ ] Mixpanel account created with project token
- [ ] Development, staging, production environments configured
- [ ] User authentication system live (for user_id tracking)
- [ ] Attribution capture implemented (SOP-262-attribution-tracking)
- [ ] Payment gateway webhooks configured (for revenue events)

---

## Procedure


### 1. Define Event Taxonomy

**Frequency:** One-time setup (revisit quarterly)  
**Owner:** Data Analyst + Developer

**Steps:**

1.1. **Map AARRR stages to user journey**:
   - **Acquisition**: Landing → Signup
   - **Activation**: First login → Aha moment (3 features used)
   - **Retention**: Return visits, feature engagement
   - **Revenue**: Trial start → Subscription → Renewal
   - **Referral**: Invite sent → Conversion

1.2. **Define 50 core events** (see Appendix A for full list):

   **Acquisition (7 events):**
   - `page_view` (landing pages)
   - `signup_start` (form opened)
   - `signup_complete` (account created)
   - `email_verified`
   - `trial_started`
   - `onboarding_started`
   - `onboarding_complete`

   **Activation (10 events):**
   - `first_login`
   - `feature_used` (with property: feature_name)
   - `aha_moment` (3 features used within 7 days)
   - `profile_completed`
   - `first_content_view`
   - `first_search`
   - `first_bookmark`
   - `first_note_created`
   - `first_practice_question`
   - `first_study_session_complete`

   **Retention (12 events):**
   - `session_start`
   - `session_end`
   - `daily_active` (triggered server-side)
   - `weekly_active` (triggered server-side)
   - `content_consumed` (video, article, flashcard)
   - `quiz_completed`
   - `study_plan_updated`
   - `achievement_unlocked`
   - `streak_extended`
   - `email_opened` (drip campaign)
   - `push_notification_opened`
   - `re_engagement_success`

   **Revenue (11 events):**
   - `pricing_page_view`
   - `checkout_started`
   - `payment_info_entered`
   - `payment_failed`
   - `payment_success`
   - `subscription_started`
   - `subscription_renewed`
   - `subscription_upgraded`
   - `subscription_downgraded`
   - `subscription_paused`
   - `subscription_canceled`

   **Referral (10 events):**
   - `referral_link_generated`
   - `referral_invite_sent`
   - `referral_link_clicked`
   - `referral_signup_complete`
   - `referral_conversion` (referred user paid)
   - `testimonial_requested`
   - `testimonial_submitted`
   - `review_requested`
   - `social_share`
   - `word_of_mouth_tracked`

1.3. **Define event properties** (standardized across all events):
   ```javascript
   {
       // Universal properties (every event)
       user_id: 'abc123',
       distinct_id: 'abc123',  // Mixpanel identifier
       timestamp: '2026-10-06T14:30:00Z',
       platform: 'web',  // web, ios, android
       
       // Attribution (from SOP-262-attribution-tracking)
       utm_source: 'google',
       utm_medium: 'cpc',
       utm_campaign: '202610-awareness-medicine-video1',
       
       // User properties
       specialty: 'Internal Medicine',
       exam_type: 'USMLE Step 1',
       country: 'Oman',
       signup_date: '2026-09-15',
       
       // Event-specific properties
       feature_name: 'flashcards',  // for feature_used
       amount: 29.99,  // for payment_success
       plan: 'monthly',  // for subscription_started
   }
   ```

1.4. **Document in tracking plan** (Google Sheet):
   | Event Name | Trigger | Properties | Owner | Priority |
   |------------|---------|------------|-------|----------|
   | signup_complete | User submits signup form | email, utm_* | Developer | P0 |
   | aha_moment | 3 features used within 7 days | features_used_count | Backend | P0 |

**Output:** 50-event taxonomy documented and approved

---

### 2. Implement Event Tracking (Mixpanel SDK)

**Frequency:** One-time per event (ongoing as features added)  
**Owner:** Developer

**Steps:**

2.1. **Install Mixpanel SDK**:
   ```bash
   # Frontend (web)
   npm install mixpanel-browser
   
   # Backend (Node.js)
   npm install mixpanel
   ```

2.2. **Initialize Mixpanel** (frontend):
   ```javascript
   // src/analytics/mixpanel.ts
   import mixpanel from 'mixpanel-browser';
   
   const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
   
   mixpanel.init(MIXPANEL_TOKEN, {
       debug: process.env.NODE_ENV === 'development',
       track_pageview: true,
       persistence: 'localStorage'
   });
   
   export const analytics = {
       identify: (userId: string) => {
           mixpanel.identify(userId);
       },
       
       track: (eventName: string, properties?: Record<string, any>) => {
           mixpanel.track(eventName, {
               ...properties,
               platform: 'web',
               timestamp: new Date().toISOString()
           });
       },
       
       setUserProperties: (properties: Record<string, any>) => {
           mixpanel.people.set(properties);
       }
   };
   ```

2.3. **Track signup flow**:
   ```javascript
   // pages/signup.tsx
   import { analytics } from '@/analytics/mixpanel';
   
   function SignupPage() {
       const handleSignupStart = () => {
           analytics.track('signup_start');
       };
       
       const handleSignupComplete = async (email: string) => {
           const user = await createUser(email);
           
           analytics.identify(user.id);
           analytics.track('signup_complete', {
               email: email,
               utm_source: sessionStorage.getItem('utm_source'),
               utm_medium: sessionStorage.getItem('utm_medium'),
               utm_campaign: sessionStorage.getItem('utm_campaign')
           });
           
           analytics.setUserProperties({
               $email: email,
               signup_date: new Date().toISOString(),
               specialty: user.specialty,
               exam_type: user.exam_type
           });
       };
       
       return (
           <form onFocus={handleSignupStart} onSubmit={handleSignupComplete}>
               {/* form fields */}
           </form>
       );
   }
   ```

2.4. **Track activation events**:
   ```javascript
   // components/Feature.tsx
   import { analytics } from '@/analytics/mixpanel';
   
   function Feature({ name }: { name: string }) {
       const handleFeatureUse = () => {
           analytics.track('feature_used', {
               feature_name: name
           });
           
           // Check for aha moment (3 features used)
           const featuresUsed = getUniqueFeaturesUsed(user.id);
           if (featuresUsed.length >= 3) {
               analytics.track('aha_moment', {
                   features_used_count: featuresUsed.length,
                   features_list: featuresUsed
               });
           }
       };
       
       return <button onClick={handleFeatureUse}>{name}</button>;
   }
   ```

2.5. **Track revenue events** (backend webhook):
   ```javascript
   // api/webhooks/stripe.ts
   import Mixpanel from 'mixpanel';
   
   const mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN);
   
   export async function handleStripeWebhook(event) {
       if (event.type === 'checkout.session.completed') {
           const session = event.data.object;
           const userId = session.client_reference_id;
           
           mixpanel.track('payment_success', {
               distinct_id: userId,
               amount: session.amount_total / 100,
               plan: session.metadata.plan,
               payment_method: session.payment_method_types[0]
           });
       }
       
       if (event.type === 'customer.subscription.created') {
           const subscription = event.data.object;
           mixpanel.track('subscription_started', {
               distinct_id: subscription.metadata.user_id,
               plan: subscription.items.data[0].price.id,
               interval: subscription.items.data[0].price.recurring.interval
           });
       }
   }
   ```

2.6. **Track retention events** (server-side cron):
   ```python
   # jobs/track_dau.py
   import mixpanel
   from datetime import datetime, timedelta
   
   mp = mixpanel.Mixpanel(os.getenv('MIXPANEL_TOKEN'))
   
   def track_daily_active_users():
       # Get users active in last 24h
       active_users = db.query("""
           SELECT DISTINCT user_id 
           FROM sessions 
           WHERE created_at >= NOW() - INTERVAL '24 hours'
       """)
       
       for user in active_users:
           mp.track(user['user_id'], 'daily_active', {
               'timestamp': datetime.now().isoformat()
           })
   
   # Schedule: Run daily at 00:05 UTC
   ```

**Output:** All 50 events tracked in production

---

### 3. QA Event Tracking

**Frequency:** One-time per event, then spot-checks monthly  
**Owner:** Developer

**Steps:**

3.1. **Use tracking plan spreadsheet** (from step 1.4) as QA checklist.

3.2. **For each event, verify**:
   - Event fires in Mixpanel Live View within 30 seconds
   - All required properties present
   - Property values correct (not null, not "undefined")
   - User identified correctly (distinct_id = user_id)
   - Attribution params carried through (utm_source, utm_medium, etc.)

3.3. **Test signup flow end-to-end**:
   ```bash
   # 1. Clear cookies/localStorage
   # 2. Click campaign link with UTMs
   # 3. Complete signup
   # 4. Check Mixpanel for:
   #    - signup_start (with no user_id yet)
   #    - signup_complete (with user_id + UTMs)
   ```

3.4. **Test activation flow**:
   - Use 3 different features as new user
   - Verify `feature_used` fires 3 times with correct feature_name
   - Verify `aha_moment` fires with features_used_count=3

3.5. **Test revenue flow**:
   - Complete test checkout (Stripe test mode)
   - Verify `checkout_started`, `payment_success`, `subscription_started` all fire
   - Verify amount and plan properties correct

3.6. **Document failures** in tracking plan (mark event as "QA FAIL" with reason).

**Output:** All 50 events QA'd and verified

---


---

## Edge Cases

**Case 1: User opts out of tracking (GDPR, privacy)**
- **Problem:** Cannot track events for opted-out users
- **Solution:** Set mixpanel.opt_out_tracking() after user opts out
- **Consequence:** User excluded from all metrics (DAU, conversion, etc.)

**Case 2: Event fires multiple times (duplicate tracking)**
- **Problem:** Button clicked twice → event tracked twice
- **Solution:** Debounce event tracking (ignore duplicates within 1 second)
- **Code:**
  ```javascript
  const trackOnce = debounce((eventName, props) => {
      analytics.track(eventName, props);
  }, 1000);
  ```

**Case 3: Offline user returns (events queued)**
- **Problem:** User loses internet → events not sent → reconnects
- **Solution:** Mixpanel SDK queues events in localStorage, sends on reconnect
- **Note:** No action needed, SDK handles automatically

**Case 4: Mixpanel project reaches monthly event limit**
- **Problem:** Free tier = 20M events/month, paid = custom limit
- **Solution:** Monitor event volume, upgrade plan before hitting limit
- **Alert:** Set Mixpanel usage alert at 80% of monthly limit

**Case 5: Analytics tracking slows down page load**
- **Problem:** Tracking code blocks rendering
- **Solution:** Load Mixpanel SDK asynchronously, defer non-critical events
- **Code:**
  ```javascript
  // Async load
  <script async src="https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js"></script>
  
  // Defer non-critical events until after page load
  window.addEventListener('load', () => {
      analytics.track('page_fully_loaded');
  });
  ```

---


---


---

## KPIs & Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Event tracking coverage | 100% (50/50 events) | - | - |
| Event QA pass rate | >95% | - | - |
| Tracking-plan drift (undocumented events in prod) | 0 | - | - |
| Event volume vs Mixpanel plan limit | <80% | - | - |

---

## Appendix A: Full 50-Event List


**Acquisition (7):**
1. page_view
2. signup_start
3. signup_complete
4. email_verified
5. trial_started
6. onboarding_started
7. onboarding_complete

**Activation (10):**
8. first_login
9. feature_used
10. aha_moment
11. profile_completed
12. first_content_view
13. first_search
14. first_bookmark
15. first_note_created
16. first_practice_question
17. first_study_session_complete

**Retention (12):**
18. session_start
19. session_end
20. daily_active
21. weekly_active
22. content_consumed
23. quiz_completed
24. study_plan_updated
25. achievement_unlocked
26. streak_extended
27. email_opened
28. push_notification_opened
29. re_engagement_success

**Revenue (11):**
30. pricing_page_view
31. checkout_started
32. payment_info_entered
33. payment_failed
34. payment_success
35. subscription_started
36. subscription_renewed
37. subscription_upgraded
38. subscription_downgraded
39. subscription_paused
40. subscription_canceled

**Referral (10):**
41. referral_link_generated
42. referral_invite_sent
43. referral_link_clicked
44. referral_signup_complete
45. referral_conversion
46. testimonial_requested
47. testimonial_submitted
48. review_requested
49. social_share
50. word_of_mouth_tracked

---

---


| Feature | Mixpanel | Amplitude | GA4 |
|---------|----------|-----------|-----|
| **Event tracking** | ✅ Excellent | ✅ Excellent | ✅ Good |
| **User properties** | ✅ Unlimited | ✅ Unlimited | ⚠️ Limited (25 custom) |
| **Funnel analysis** | ✅ Native | ✅ Native | ⚠️ Basic |
| **Cohort analysis** | ✅ Native | ✅ Native | ⚠️ Basic |
| **Real-time data** | ✅ <1 min latency | ✅ <1 min latency | ❌ 4-8h latency |
| **Pricing** | $25/mo → $999/mo | $995/mo → custom | ✅ Free (unlimited) |
| **Learning curve** | Medium | Medium | High |
| **Bayan choice** | ✅ **Recommended** | Good alternative | Not recommended |

**Why Mixpanel for Bayan:**
- Real-time data (vs GA4's 4-8 hour delay)
- Affordable at early stage ($25-$100/mo vs Amplitude $995+)
- Excellent funnel and cohort analysis (critical for SOP-264-unit-economics)
- Strong user properties (unlimited vs GA4's 25 custom limit)

---

---

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-10-06 | Initial SOP (as SOP-262-event-instrumentation/SOP-262-attribution-tracking, core IDs unverified) | Stage 3 Ops Team |
| 1.1 | 2026-10-09 | Re-headed to live core IDs; Proc 22 restructured to 262/263/264 | Stage 3 Ops Team |

---

## Approval

**Reviewed By:**
- [ ] CEO (Dr. Abdullah Al Alawi) - Priority, escalation, public-claims policy
- [ ] CTO (TBD) - Platform selection, technical architecture
- [ ] Developer (TBD) - Implementation feasibility, timeline
- [ ] Marketer (Nasim) - Funnel metric definitions, channel reporting
- [ ] Data Analyst (TBD) - Taxonomy, dashboard design, thresholds

**Approved:** _____________ **Next Review:** Q1 2027
