# SOP-263: KPI Dashboard & Real-Time Monitoring

**Process:** Proc 22 - Financial Performance Management
**Core:** 263 - KPI Dashboard & Real-Time Monitoring
**Owner:** Data Analyst (design), Developer (build)
**Accountable:** CEO (Dr. Abdullah Al Alawi)
**Version:** 1.1
**Last Updated:** 2026-10-09

> **Core-ID note (2026-10-09):** Carved out of the original "SOP-268 Analytics
> Implementation" document, which conflated instrumentation with monitoring.
> Event instrumentation is **Core 262**; unit economics is **Core 264**. This
> SOP owns dashboards, alert thresholds, and alert response.

---

## Purpose

Turn instrumented events into a small number of dashboards that a busy operator
actually opens, with alerts that fire on real problems and stay quiet otherwise.

---

## Scope

**In Scope:**
- CEO dashboard and funnel dashboard layout
- Metric definitions and refresh cadence
- Automated alert thresholds (critical + warning)
- Alert response playbooks
- Alert hygiene: false-positive tracking and threshold tuning

**Out of Scope:**
- Event taxonomy and SDK implementation (SOP-262-event-instrumentation)
- Attribution reporting (SOP-262-attribution-tracking)
- Unit economics computation (SOP-264-unit-economics-and-cohort-analysis)
- Incident response for infrastructure outages (Proc 7)

---

## Roles & Responsibilities

| Role | Responsibility |
|------|----------------|
| Data Analyst | Dashboard design, metric definitions, thresholds, tuning |
| Developer | Dashboard build, alert plumbing, Slack integration |
| CEO (Dr. Abdullah Al Alawi) | Metric prioritization, escalation paths, alert-fatigue policy |
| CTO (TBD) | Platform selection, technical architecture |
| Marketer (Nasim) | Marketing funnel metric definitions |

---

## Prerequisites

- [ ] Mixpanel project live with events flowing (SOP-262-event-instrumentation)
- [ ] Slack workspace with alert channels created
- [ ] Named owner for every alert (unowned alerts are ignored alerts)
- [ ] Alert channels distinguish critical (paging) from warning (digest)

---

## Procedure


### 1. Build KPI Dashboards

**Frequency:** One-time build, revisit quarterly  
**Owner:** Data Analyst (design) + Developer (build)

**Steps:**

1.1. **Create CEO Dashboard** (Mixpanel Insights):

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

1.2. **Create Marketing Dashboard** (Mixpanel Insights):
   - Signups by source (pie chart)
   - Conversion funnel by source (Landing → Signup → Trial → Paid)
   - CAC by source (from SOP-264-unit-economics data)
   - Campaign performance table (signups, conversions, CAC per utm_campaign)

1.3. **Create Product Dashboard** (Mixpanel Insights):
   - Feature usage (bar chart: which features used most)
   - Activation funnel (Signup → First Login → 3 Features → Aha Moment)
   - Time to aha moment (histogram: days from signup to aha)
   - Feature correlation with retention (which features predict D7/D30 retention)

1.4. **Set dashboard permissions**:
   - CEO Dashboard: Nasim (owner), all team (view)
   - Marketing Dashboard: Marketer (Nasim) (owner), CEO (view)
   - Product Dashboard: Developer + Data Analyst (owner), CEO (view)

**Output:** 3 live dashboards in Mixpanel

---

### 2. Configure Automated Alerts

**Frequency:** One-time setup, tune thresholds quarterly  
**Owner:** Developer + Data Analyst

**Steps:**

2.1. **Define alert thresholds**:

   **Critical Alerts** (immediate Slack notification):
   | Metric | Threshold | Action |
   |--------|-----------|--------|
   | Signups drop >50% | vs 7-day avg | Page CEO (Dr. Abdullah Al Alawi) (Dr. Abdullah Al Alawi) + Marketer (Nasim) (Nasim) |
   | Payment success rate <70% | trailing 24h | Page CTO (TBD) (TBD) + Developer (TBD) |
   | Churn spike >15% | trailing 7 days | Page CEO (Dr. Abdullah Al Alawi) |
   | Server error rate >5% | trailing 1h | Page CTO (TBD) |

   **Warning Alerts** (daily digest):
   | Metric | Threshold | Action |
   |--------|-----------|--------|
   | DAU drop >20% | vs 7-day avg | Email CEO (Dr. Abdullah Al Alawi) |
   | Activation rate <50% | trailing 7 days | Email Marketer |
   | ARPU drop >10% | vs last month | Email CEO (Dr. Abdullah Al Alawi) |
   | Feature usage drop >30% | any single feature | Email Marketer |

2.2. **Implement alert system** (Mixpanel Insights Alerts):
   - Navigate to each dashboard metric
   - Click "Create Alert"
   - Set threshold + notification channel (Slack webhook)
   - Test alert (manually trigger threshold breach)

2.3. **Set up Slack integration**:
   ```bash
   # 1. Create Slack webhook URL
   # 2. Add webhook to Mixpanel project settings
   # 3. Test with manual alert trigger
   ```

2.4. **Alternative: Custom alert script** (if Mixpanel Insights alerts insufficient):
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

### 3. Create Alert Response Playbooks

**Frequency:** One-time creation, update as team learns  
**Owner:** CEO (approval) + Developer (technical steps)

**Steps:**

3.1. **Signups drop >50% playbook**:
   ```markdown
   ## Alert: Signups Down 50%
   
   **When:** Trailing 24h signups < 50% of 7-day average
   **Owner:** Marketer (Nasim) (investigate), CTO (technical)
   
   ### Checklist:
   1. [ ] Check website uptime (is site accessible?)
   2. [ ] Check analytics tracking (is signup_complete event firing?)
   3. [ ] Check ad campaigns (did spend drop? campaigns paused?)
   4. [ ] Check referral sources (did organic search traffic drop?)
   5. [ ] Check competitor activity (new competitor launch? price war?)
   6. [ ] Check seasonality (exam season ended? holidays?)
   
   ### Response:
   - If technical (site down, tracking broken): CTO fixes immediately
   - If marketing (ad spend down): Marketer (Nasim) adjusts budget
   - If external (competitor, seasonality): CEO decides strategy
   ```

3.2. **Payment failures >30% playbook**:
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

3.3. **Churn spike >15% playbook**:
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

3.4. **Document playbooks** in shared folder (`/playbooks/alerts/`).

**Output:** 4 critical + 4 warning alert playbooks

---

### 4. Monthly Analytics Audit

**Frequency:** Monthly (1st of month)  
**Owner:** Data Analyst

**Steps:**

4.1. **Check event accuracy**:
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

4.2. **Check for unused events**:
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

4.3. **Check dashboard health**:
   - All dashboards load within 5 seconds
   - No broken charts (missing data, errors)
   - Metrics match SQL verification queries (spot-check 5 metrics)

4.4. **Review alert history**:
   - How many alerts fired this month?
   - Were alerts actionable or noise?
   - Should thresholds be adjusted?

4.5. **Document findings** in monthly report (Google Doc):
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


---

## Edge Cases

**Case 1: Alert fires but nothing is wrong (false positive)**
- **Cause:** Threshold set on a noisy metric, or compared against an unstable baseline
- **Detection:** Alert acknowledged with no action taken
- **Solution:** Log every false positive. Any alert exceeding 20% false-positive rate gets its threshold tightened or its baseline widened (7-day mean → 14-day mean). An alert nobody trusts is worse than no alert — it trains the team to ignore the channel.

**Case 2: A real problem fires no alert**
- **Cause:** The metric was not instrumented, or the threshold was calibrated on a healthier period
- **Detection:** Problem discovered by a human or a user complaint first
- **Solution:** Add the missing metric or recalibrate. Every incident should end with a dashboard change, otherwise the same blind spot recurs.

**Case 3: Day-of-week rhythm trips the signup alert every weekend**
- **Cause:** Threshold compares today against a flat 7-day average
- **Detection:** Recurring weekend-only alerts
- **Solution:** Compare like-for-like (weekday vs weekday, or week-over-week). Flat averages on seasonal metrics produce scheduled noise.

**Case 4: Dashboard is built but nobody opens it**
- **Cause:** Too many metrics; no decision attached to any of them
- **Detection:** Zero sessions on the dashboard for 2+ weeks
- **Solution:** Cut to the metrics that map to a decision the CEO actually makes. A dashboard is a decision surface, not a data archive. Track dashboard sessions as a usage KPI.

**Case 5: Alert storm during an incident**
- **Cause:** Cascading metrics all breach at once (signups down AND errors up AND payments failing)
- **Detection:** 5+ critical alerts within one hour
- **Solution:** Suppress downstream alerts when a root-cause alert is active. Configure alert grouping so one incident produces one page, not nine.

---

## KPIs & Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Dashboard load time | <5 seconds | - | - |
| Alert false positive rate | <20% | - | - |
| Critical alert acknowledgement (business hours) | <30 min | - | - |
| CEO dashboard weekly sessions | >=2 | - | - |
| Alerts with a named owner | 100% | - | - |

---

## Appendix A: Dashboard-vs-Alert Decision Rule

| Question | Dashboard | Alert |
|----------|-----------|-------|
| Would a human catch it within a week? | Yes | No |
| Is it actionable right now? | Any | Must be yes |
| Does it page someone off-hours? | No | Only if revenue or access is at stake |
| Cadence | Reviewed on a schedule | Fires on condition |

An alert that only needs a weekly look belongs on a dashboard. A dashboard tile nobody opens does not become useful by adding a siren.

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-10-06 | Initial content (as part of SOP-268, core ID unverified) | Stage 3 Ops Team |
| 1.1 | 2026-10-09 | Split into its own SOP, re-headed to live Core 263 | Stage 3 Ops Team |

---

## Approval

**Reviewed By:**
- [ ] CEO (Dr. Abdullah Al Alawi) - Metric prioritization, escalation, alert-fatigue policy
- [ ] CTO (TBD) - Platform selection
- [ ] Developer (TBD) - Dashboard build, alert plumbing
- [ ] Data Analyst (TBD) - Metric definitions, thresholds
- [ ] Marketer (Nasim) - Funnel metric definitions

**Approved:** _____________ **Next Review:** Q1 2027

