# SOP-268: Analytics Implementation & Instrumentation

**Process:** Proc 22 - Funnel Instrumentation & Unit Economics  
**Core:** 268 (Analytics Implementation)  
**Owner:** Developer  
**Accountable:** CTO  
**Version:** 1.0  
**Last Updated:** 2026-10-06

---

## Purpose

Implement comprehensive event tracking, dashboards, and automated alerts across the AARRR funnel to enable data-driven decisions.

---

## Scope

**In Scope:**
- Event taxonomy definition (50 events across AARRR)
- Mixpanel SDK integration and QA
- KPI dashboard configuration
- Automated alert setup (critical + warning)
- Alert response playbooks
- Monthly analytics audit

**Out of Scope:**
- Attribution strategy (covered in SOP-266)
- Unit economics calculations (covered in SOP-267)
- Data warehousing infrastructure
- Custom analytics platform development

---

## Roles & Responsibilities

| Role | Responsibility |
|------|----------------|
| Developer | Event implementation, SDK integration, dashboard build |
| Data Analyst | Event taxonomy, dashboard design, alert thresholds |
| CEO | KPI prioritization, alert escalation paths |
| CTO | Platform selection, technical architecture |
| Marketing Lead | Marketing funnel metrics definition |

---

## Prerequisites

- [ ] Mixpanel account created with project token
- [ ] Development, staging, production environments configured
- [ ] User authentication system live (for user_id tracking)
- [ ] Attribution capture implemented (SOP-266)
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
       
       // Attribution (from SOP-266)
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

### 4. Build KPI Dashboards

**Frequency:** One-time build, revisit quarterly  
**Owner:** Data Analyst (design) + Developer (build)

**Steps:**

4.1. **Create CEO Dashboard** (Mixpanel Insights):

   **Layout:**
   ```
   +-------------------+-------------------+-------------------+
   |   DAU (today)     |   WAU (7-day)    |   MAU (30-day)   |
   |   2,450 (+5%)     |   8,120 (+12%)   |   18,500 (+8%)   |
   +-------------------+-------------------+-------------------+
   |              Stickiness (DAU/MAU)                        |
   |              13.2% (target: >15%)                        |
   +----------------------------------------------------------+
   |                    AARRR Funnel (This Month)             |
   +----------------------------------------------------------+
   | Acquisition   | 3,200 signups                           |
   | Activation    | 1,920 activated (60%)                   |
   | Retention     | 1,152 D7 retained (60% of activated)    |
   | Revenue       | 384 paid (20% of retained)              |
   | Referral      | 96 referred (25% of paid)               |
   +----------------------------------------------------------+
   |                    MRR Trend (Last 6 Months)             |
   |  [Line chart showing MRR growth from $5k → $12k]        |
   +----------------------------------------------------------+
   |                    Churn Rate (Rolling 30-day)           |
   |  [Line chart showing churn 8% → 5%]                      |
   +----------------------------------------------------------+
   ```

   **Metrics definitions:**
   ```javascript
   // DAU: Unique users with session_start today
   DAU = COUNT(DISTINCT user_id WHERE event='session_start' AND date=TODAY)
   
   // WAU: Unique users with session_start in last 7 days
   WAU = COUNT(DISTINCT user_id WHERE event='session_start' AND date>=TODAY-7)
   
   // MAU: Unique users with session_start in last 30 days
   MAU = COUNT(DISTINCT user_id WHERE event='session_start' AND date>=TODAY-30)
   
   // Stickiness: DAU / MAU (higher = more engaged users)
   Stickiness = DAU / MAU
   
   // ARPU: Average revenue per user (monthly)
   ARPU = SUM(amount WHERE event='payment_success' AND date>=MONTH_START) / 
          COUNT(DISTINCT user_id WHERE event='subscription_started')
   ```

4.2. **Create Marketing Dashboard** (Mixpanel Insights):
   - Signups by source (pie chart)
   - Conversion funnel by source (Landing → Signup → Trial → Paid)
   - CAC by source (from SOP-267 data)
   - Campaign performance table (signups, conversions, CAC per utm_campaign)

4.3. **Create Product Dashboard** (Mixpanel Insights):
   - Feature usage (bar chart: which features used most)
   - Activation funnel (Signup → First Login → 3 Features → Aha Moment)
   - Time to aha moment (histogram: days from signup to aha)
   - Feature correlation with retention (which features predict D7/D30 retention)

4.4. **Set dashboard permissions**:
   - CEO Dashboard: Nasim (owner), all team (view)
   - Marketing Dashboard: Marketing Lead (owner), CEO (view)
   - Product Dashboard: Developer + Data Analyst (owner), CEO (view)

**Output:** 3 live dashboards in Mixpanel

---

### 5. Configure Automated Alerts

**Frequency:** One-time setup, tune thresholds quarterly  
**Owner:** Developer + Data Analyst

**Steps:**

5.1. **Define alert thresholds**:

   **Critical Alerts** (immediate Slack notification):
   | Metric | Threshold | Action |
   |--------|-----------|--------|
   | Signups drop >50% | vs 7-day avg | Page CEO + Marketing Lead |
   | Payment success rate <70% | trailing 24h | Page CTO + Developer |
   | Churn spike >15% | trailing 7 days | Page CEO |
   | Server error rate >5% | trailing 1h | Page CTO |

   **Warning Alerts** (daily digest):
   | Metric | Threshold | Action |
   |--------|-----------|--------|
   | DAU drop >20% | vs 7-day avg | Email CEO |
   | Activation rate <50% | trailing 7 days | Email Product |
   | ARPU drop >10% | vs last month | Email CEO |
   | Feature usage drop >30% | any single feature | Email Product |

5.2. **Implement alert system** (Mixpanel Insights Alerts):
   - Navigate to each dashboard metric
   - Click "Create Alert"
   - Set threshold + notification channel (Slack webhook)
   - Test alert (manually trigger threshold breach)

5.3. **Set up Slack integration**:
   ```bash
   # 1. Create Slack webhook URL
   # 2. Add webhook to Mixpanel project settings
   # 3. Test with manual alert trigger
   ```

5.4. **Alternative: Custom alert script** (if Mixpanel Insights alerts insufficient):
   ```python
   # alerts/check_kpis.py
   import mixpanel_api
   import requests
   from datetime import datetime, timedelta
   
   SLACK_WEBHOOK = os.getenv('SLACK_WEBHOOK_URL')
   
   def check_signup_drop():
       today_signups = mixpanel.query('/events', {
           'event': 'signup_complete',
           'from_date': datetime.now().date(),
           'to_date': datetime.now().date()
       })['data']['values'][0]
       
       avg_7day_signups = mixpanel.query('/events', {
           'event': 'signup_complete',
           'from_date': (datetime.now() - timedelta(days=7)).date(),
           'to_date': (datetime.now() - timedelta(days=1)).date()
       })['data']['values'].mean()
       
       if today_signups < avg_7day_signups * 0.5:
           send_slack_alert(
               channel='#critical-alerts',
               message=f'🚨 SIGNUPS DOWN 50%: {today_signups} today vs {avg_7day_signups} 7-day avg'
           )
   
   def send_slack_alert(channel, message):
       requests.post(SLACK_WEBHOOK, json={
           'channel': channel,
           'text': message
       })
   
   # Schedule: Run every hour
   ```

**Output:** Automated alerts configured and tested

---

### 6. Create Alert Response Playbooks

**Frequency:** One-time creation, update as team learns  
**Owner:** CEO (approval) + Developer (technical steps)

**Steps:**

6.1. **Signups drop >50% playbook**:
   ```markdown
   ## Alert: Signups Down 50%
   
   **When:** Trailing 24h signups < 50% of 7-day average
   **Owner:** Marketing Lead (investigate), CTO (technical)
   
   ### Checklist:
   1. [ ] Check website uptime (is site accessible?)
   2. [ ] Check analytics tracking (is signup_complete event firing?)
   3. [ ] Check ad campaigns (did spend drop? campaigns paused?)
   4. [ ] Check referral sources (did organic search traffic drop?)
   5. [ ] Check competitor activity (new competitor launch? price war?)
   6. [ ] Check seasonality (exam season ended? holidays?)
   
   ### Response:
   - If technical (site down, tracking broken): CTO fixes immediately
   - If marketing (ad spend down): Marketing Lead adjusts budget
   - If external (competitor, seasonality): CEO decides strategy
   ```

6.2. **Payment failures >30% playbook**:
   ```markdown
   ## Alert: Payment Success Rate <70%
   
   **When:** Trailing 24h payment_success / checkout_started < 70%
   **Owner:** CTO (technical), CEO (business)
   
   ### Checklist:
   1. [ ] Check Stripe dashboard (are webhooks firing?)
   2. [ ] Check payment gateway errors (declined? 3DS failures?)
   3. [ ] Check checkout flow (is form broken? mobile vs desktop?)
   4. [ ] Check specific card types (is one provider failing?)
   5. [ ] Check geography (is one country failing?)
   
   ### Response:
   - If Stripe issue: Contact Stripe support immediately
   - If form issue: Developer fixes checkout UI
   - If fraud detection: Adjust Stripe Radar rules
   ```

6.3. **Churn spike >15% playbook**:
   ```markdown
   ## Alert: Churn Rate Spike
   
   **When:** Trailing 7-day churn > 15% (target: <5%)
   **Owner:** CEO (strategy), Product (execution)
   
   ### Checklist:
   1. [ ] Check cancellation reasons (exit survey data)
   2. [ ] Check cohort analysis (which cohorts churning most?)
   3. [ ] Check feature usage (did engagement drop first?)
   4. [ ] Check customer support tickets (common complaints?)
   5. [ ] Check competitor actions (better product? lower price?)
   
   ### Response:
   - If product issue: Fix bugs, add requested features
   - If pricing issue: CEO considers pricing adjustment
   - If engagement issue: Re-engagement campaign (SOP-257)
   ```

6.4. **Document playbooks** in shared folder (`/playbooks/alerts/`).

**Output:** 4 critical + 4 warning alert playbooks

---

### 7. Monthly Analytics Audit

**Frequency:** Monthly (1st of month)  
**Owner:** Data Analyst

**Steps:**

7.1. **Check event accuracy**:
   ```sql
   -- Events with missing properties
   SELECT event_name, COUNT(*) as missing_count
   FROM mixpanel_events
   WHERE user_id IS NULL OR utm_source IS NULL
   GROUP BY event_name
   HAVING COUNT(*) > 10;
   
   -- Events with suspicious volumes (10x spike or 90% drop)
   SELECT event_name, COUNT(*) as current_month, 
          LAG(COUNT(*)) OVER (ORDER BY month) as last_month
   FROM mixpanel_events
   GROUP BY event_name, DATE_TRUNC('month', timestamp)
   HAVING current_month > last_month * 10 OR current_month < last_month * 0.1;
   ```

7.2. **Check for unused events**:
   ```sql
   -- Events tracked but never used in dashboards/queries
   SELECT event_name, COUNT(*) as event_count, 
          MAX(timestamp) as last_tracked
   FROM mixpanel_events
   WHERE timestamp >= NOW() - INTERVAL '30 days'
   GROUP BY event_name
   ORDER BY event_count ASC
   LIMIT 20;
   ```

7.3. **Check dashboard health**:
   - All dashboards load within 5 seconds
   - No broken charts (missing data, errors)
   - Metrics match SQL verification queries (spot-check 5 metrics)

7.4. **Review alert history**:
   - How many alerts fired this month?
   - Were alerts actionable or noise?
   - Should thresholds be adjusted?

7.5. **Document findings** in monthly report (Google Doc):
   ```markdown
   # Analytics Audit - October 2026
   
   ## Summary
   - Events tracked: 50
   - Events with issues: 2 (see below)
   - Dashboards healthy: 3/3
   - Alerts fired: 5 (3 critical, 2 warning)
   
   ## Issues Found
   1. **aha_moment event missing 12% of time** - Bug in feature counter logic, fixed 2026-10-15
   2. **payment_success amount sometimes null** - Stripe webhook occasionally missing amount, investigating
   
   ## Recommendations
   - Add new event: `onboarding_video_watched` (requested by Product)
   - Archive unused event: `word_of_mouth_tracked` (never used, hard to track)
   - Adjust alert: Increase payment failure threshold from 70% to 75% (too many false alarms)
   ```

**Output:** Monthly audit report emailed to CEO + CTO

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

## KPIs & Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Event tracking coverage | 100% (50/50 events) | - | - |
| Event QA pass rate | >95% | - | - |
| Dashboard load time | <5 seconds | - | - |
| Alert false positive rate | <20% | - | - |
| Monthly analytics audit | 100% on-time | - | - |

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

## Appendix B: Mixpanel Insights vs Amplitude vs GA4

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
- Excellent funnel and cohort analysis (critical for SOP-267)
- Strong user properties (unlimited vs GA4's 25 custom limit)

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-10-06 | Initial SOP | Stage 3 Ops Team |

---

## Approval

**Reviewed By:**
- [ ] CEO (Nasim) - KPI prioritization, alert escalation
- [ ] CTO (TBD) - Technical architecture, platform selection
- [ ] Developer (TBD) - Implementation feasibility, timeline
- [ ] Data Analyst (TBD) - Event taxonomy, dashboard design

**Approved:** _____________ **Next Review:** Q1 2027