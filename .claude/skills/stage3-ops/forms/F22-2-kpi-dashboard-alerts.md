# F22-2: KPI Dashboard & Alert Configuration

**Process:** Proc 22 - Funnel Instrumentation & Unit Economics  
**Core:** 268 (Analytics Implementation)  
**Owner:** CEO (dashboard review), Developer (alert config)  
**Platform:** Mixpanel Insights + Slack/Email alerts

---

## Dashboard Structure

**Top-Level Metrics (Daily View):**

```
┌─────────────────────────────────────────────────────────────┐
│ Bayan KPI Dashboard — [Date Range]                         │
├─────────────────────────────────────────────────────────────┤
│ AARRR FUNNEL                                                │
├─────────────────────────────────────────────────────────────┤
│ Acquisition:    50 signups    (↑ 12% vs last week)         │
│ Activation:     30 activated  (60% of signups)             │
│ Retention:      250 DAU       (↓ 3% vs last week)          │
│ Revenue:        $1,450 MRR    (↑ 8% vs last month)         │
│ Referral:       12 new refs   (↑ 5 vs last week)           │
├─────────────────────────────────────────────────────────────┤
│ UNIT ECONOMICS                                              │
├─────────────────────────────────────────────────────────────┤
│ CAC:           $42.50         (↓ $5 vs last month)          │
│ LTV:           $180.00        (↑ $12 vs last month)         │
│ LTV:CAC Ratio: 4.2:1          (Target: >3:1)               │
│ Payback:       1.8 months     (Target: <3 months)          │
├─────────────────────────────────────────────────────────────┤
│ COHORT HEALTH                                               │
├─────────────────────────────────────────────────────────────┤
│ M0 Churn:      8%             (Target: <10%)                │
│ M1-M3 Churn:   5%             (Target: <8%)                 │
│ M3+ Churn:     3%             (Target: <5%)                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Metrics Definitions

### Acquisition Metrics

**Daily Signups:**
```sql
SELECT COUNT(DISTINCT user_id)
FROM user_events
WHERE event_name = 'signup_complete'
AND timestamp >= CURRENT_DATE
```

**Traffic Sources:**
```sql
SELECT 
    utm_source,
    COUNT(DISTINCT user_id) as signups,
    ROUND(100.0 * COUNT(DISTINCT user_id) / SUM(COUNT(DISTINCT user_id)) OVER (), 2) as percentage
FROM user_events
WHERE event_name = 'signup_complete'
AND timestamp >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY utm_source
ORDER BY signups DESC
```

**Cost Per Signup (CPS):**
```python
def calculate_cps():
    # Pull from ad platforms
    google_spend = get_google_ads_spend(last_7_days)
    facebook_spend = get_facebook_ads_spend(last_7_days)
    
    total_spend = google_spend + facebook_spend
    total_signups = db.count("SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '7 days'")
    
    return total_spend / total_signups if total_signups > 0 else 0
```

---

### Activation Metrics

**Aha Moment Rate:**
```sql
-- 3 features used within 7 days of signup
SELECT 
    COUNT(DISTINCT CASE WHEN features_used >= 3 AND days_to_aha <= 7 THEN user_id END) as activated,
    COUNT(DISTINCT user_id) as total_signups,
    ROUND(100.0 * COUNT(DISTINCT CASE WHEN features_used >= 3 AND days_to_aha <= 7 THEN user_id END) / COUNT(DISTINCT user_id), 2) as aha_rate
FROM (
    SELECT 
        user_id,
        COUNT(DISTINCT feature_name) as features_used,
        MIN(EXTRACT(DAY FROM (timestamp - signup_timestamp))) as days_to_aha
    FROM user_feature_events
    WHERE signup_timestamp >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY user_id, signup_timestamp
) subquery
```

**Time to First Value:**
```sql
SELECT 
    AVG(EXTRACT(HOUR FROM (first_feature_timestamp - signup_timestamp))) as avg_hours_to_first_feature
FROM users
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
AND first_feature_timestamp IS NOT NULL
```

---

### Retention Metrics

**DAU/WAU/MAU:**
```sql
-- Daily Active Users
SELECT COUNT(DISTINCT user_id)
FROM user_events
WHERE event_name = 'session_start'
AND timestamp >= CURRENT_DATE;

-- Weekly Active Users
SELECT COUNT(DISTINCT user_id)
FROM user_events
WHERE event_name = 'session_start'
AND timestamp >= CURRENT_DATE - INTERVAL '7 days';

-- Monthly Active Users
SELECT COUNT(DISTINCT user_id)
FROM user_events
WHERE event_name = 'session_start'
AND timestamp >= CURRENT_DATE - INTERVAL '30 days';
```

**Stickiness (DAU/MAU):**
```python
def calculate_stickiness():
    dau = db.query("SELECT COUNT(DISTINCT user_id) FROM sessions WHERE date = CURRENT_DATE").fetchone()[0]
    mau = db.query("SELECT COUNT(DISTINCT user_id) FROM sessions WHERE date >= CURRENT_DATE - INTERVAL '30 days'").fetchone()[0]
    
    return round(100.0 * dau / mau, 2) if mau > 0 else 0
```

**Feature Usage Distribution:**
```sql
SELECT 
    feature_name,
    COUNT(DISTINCT user_id) as users,
    COUNT(*) as total_uses,
    ROUND(AVG(session_duration_seconds), 2) as avg_duration
FROM feature_usage_events
WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY feature_name
ORDER BY users DESC
```

---

### Revenue Metrics

**MRR (Monthly Recurring Revenue):**
```sql
SELECT SUM(mrr)
FROM subscriptions
WHERE status = 'active'
AND billing_cycle = 'monthly'
```

**ARPU (Average Revenue Per User):**
```python
def calculate_arpu():
    total_mrr = db.query("SELECT SUM(mrr) FROM subscriptions WHERE status = 'active'").fetchone()[0]
    active_users = db.query("SELECT COUNT(*) FROM subscriptions WHERE status = 'active'").fetchone()[0]
    
    return round(total_mrr / active_users, 2) if active_users > 0 else 0
```

**Conversion Rate (Trial → Paid):**
```sql
SELECT 
    COUNT(DISTINCT CASE WHEN subscription_started_at IS NOT NULL THEN user_id END) as converted,
    COUNT(DISTINCT user_id) as total_trials,
    ROUND(100.0 * COUNT(DISTINCT CASE WHEN subscription_started_at IS NOT NULL THEN user_id END) / COUNT(DISTINCT user_id), 2) as conversion_rate
FROM users
WHERE trial_started_at >= CURRENT_DATE - INTERVAL '30 days'
```

---

### Referral Metrics

**Viral Coefficient (K-factor):**
```python
def calculate_viral_coefficient():
    # K = (invites sent per user) × (conversion rate)
    
    total_users = db.query("SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '30 days'").fetchone()[0]
    total_invites = db.query("SELECT COUNT(*) FROM referrals WHERE created_at >= NOW() - INTERVAL '30 days'").fetchone()[0]
    total_conversions = db.query("SELECT COUNT(*) FROM referrals WHERE conversion_at >= NOW() - INTERVAL '30 days'").fetchone()[0]
    
    invites_per_user = total_invites / total_users if total_users > 0 else 0
    conversion_rate = total_conversions / total_invites if total_invites > 0 else 0
    
    k_factor = invites_per_user * conversion_rate
    
    return round(k_factor, 3)
```

**Referral-Driven Signups:**
```sql
SELECT 
    COUNT(DISTINCT user_id) as referral_signups,
    ROUND(100.0 * COUNT(DISTINCT user_id) / (SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'), 2) as percentage_of_signups
FROM users
WHERE referred_by IS NOT NULL
AND created_at >= CURRENT_DATE - INTERVAL '7 days'
```

---

## Alert Configuration

### Critical Alerts (Immediate Slack Notification)

**Alert 1: Daily Signups Drop >30%**
```python
def check_signup_drop():
    today_signups = db.query("SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE").fetchone()[0]
    yesterday_signups = db.query("SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' AND created_at < CURRENT_DATE").fetchone()[0]
    
    if yesterday_signups > 0:
        drop_percentage = ((yesterday_signups - today_signups) / yesterday_signups) * 100
        
        if drop_percentage > 30:
            send_slack_alert(
                channel='#alerts-critical',
                message=f"⚠️ CRITICAL: Daily signups dropped {drop_percentage:.1f}% (Today: {today_signups}, Yesterday: {yesterday_signups})"
            )
```

**Alert 2: Payment Failure Spike**
```python
def check_payment_failures():
    failures_last_hour = db.query("""
        SELECT COUNT(*) 
        FROM payment_events 
        WHERE event_name = 'payment_failed'
        AND timestamp >= NOW() - INTERVAL '1 hour'
    """).fetchone()[0]
    
    avg_failures_per_hour = db.query("""
        SELECT AVG(hourly_failures)
        FROM (
            SELECT DATE_TRUNC('hour', timestamp) as hour, COUNT(*) as hourly_failures
            FROM payment_events
            WHERE event_name = 'payment_failed'
            AND timestamp >= NOW() - INTERVAL '7 days'
            GROUP BY DATE_TRUNC('hour', timestamp)
        ) subquery
    """).fetchone()[0]
    
    if failures_last_hour > avg_failures_per_hour * 2:
        send_slack_alert(
            channel='#alerts-critical',
            message=f"⚠️ Payment failures spiking: {failures_last_hour} in last hour (avg: {avg_failures_per_hour:.1f})"
        )
```

**Alert 3: Churn Spike (M0 >15%)**
```python
def check_m0_churn():
    # M0 churn: cancellations within 30 days of signup
    m0_churn_rate = db.query("""
        SELECT 
            ROUND(100.0 * COUNT(DISTINCT CASE WHEN canceled_at - created_at <= INTERVAL '30 days' THEN user_id END) / COUNT(DISTINCT user_id), 2)
        FROM users
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    """).fetchone()[0]
    
    if m0_churn_rate > 15:
        send_slack_alert(
            channel='#alerts-critical',
            message=f"⚠️ M0 churn spiking: {m0_churn_rate}% (target: <10%)"
        )
```

---

### Warning Alerts (Daily Digest Email)

**Alert 4: Activation Rate Drop**
```python
def check_activation_rate():
    activation_rate = db.query("""
        SELECT 
            ROUND(100.0 * COUNT(DISTINCT CASE WHEN aha_moment_at IS NOT NULL THEN user_id END) / COUNT(DISTINCT user_id), 2)
        FROM users
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    """).fetchone()[0]
    
    if activation_rate < 40:  # Target: 50%
        return {
            'severity': 'warning',
            'message': f"Activation rate below target: {activation_rate}% (target: 50%)"
        }
```

**Alert 5: DAU Decline**
```python
def check_dau_decline():
    today_dau = db.query("SELECT COUNT(DISTINCT user_id) FROM sessions WHERE date = CURRENT_DATE").fetchone()[0]
    last_week_avg_dau = db.query("""
        SELECT AVG(daily_active_users)
        FROM (
            SELECT date, COUNT(DISTINCT user_id) as daily_active_users
            FROM sessions
            WHERE date >= CURRENT_DATE - INTERVAL '7 days'
            AND date < CURRENT_DATE
            GROUP BY date
        ) subquery
    """).fetchone()[0]
    
    decline_percentage = ((last_week_avg_dau - today_dau) / last_week_avg_dau) * 100
    
    if decline_percentage > 10:
        return {
            'severity': 'warning',
            'message': f"DAU declined {decline_percentage:.1f}% vs last week avg (Today: {today_dau}, Avg: {last_week_avg_dau:.0f})"
        }
```

**Alert 6: Referral Program Stall**
```python
def check_referral_stall():
    referrals_this_week = db.query("""
        SELECT COUNT(*)
        FROM referrals
        WHERE conversion_at >= CURRENT_DATE - INTERVAL '7 days'
    """).fetchone()[0]
    
    if referrals_this_week == 0:
        return {
            'severity': 'warning',
            'message': "No referral conversions this week (target: 5-10/week)"
        }
```

---

## Alert Delivery

**Slack Integration:**
```python
import requests

def send_slack_alert(channel, message, severity='critical'):
    webhook_url = os.getenv('SLACK_WEBHOOK_URL')
    
    color = '#FF0000' if severity == 'critical' else '#FFA500'  # Red or orange
    
    payload = {
        'channel': channel,
        'attachments': [{
            'color': color,
            'text': message,
            'footer': 'Bayan Analytics',
            'ts': int(datetime.now().timestamp())
        }]
    }
    
    response = requests.post(webhook_url, json=payload)
    
    # Log alert
    db.execute("""
        INSERT INTO alert_log (channel, message, severity, sent_at)
        VALUES (%s, %s, %s, NOW())
    """, [channel, message, severity])
```

**Email Digest:**
```python
def send_daily_digest():
    warnings = []
    
    # Check all warning conditions
    warnings.append(check_activation_rate())
    warnings.append(check_dau_decline())
    warnings.append(check_referral_stall())
    
    # Filter out None values
    warnings = [w for w in warnings if w is not None]
    
    if warnings:
        email_body = "Daily KPI Digest — Warnings:\n\n"
        for i, warning in enumerate(warnings, 1):
            email_body += f"{i}. {warning['message']}\n"
        
        resend.send({
            'to': 'nasim@bayan.edu.om',
            'subject': f"Bayan KPI Digest — {datetime.now().strftime('%Y-%m-%d')}",
            'body': email_body
        })
```

---

## Monitoring Schedule

**Cron Jobs:**
```bash
# Check critical alerts every 15 minutes
*/15 * * * * /usr/bin/python3 /app/scripts/check_critical_alerts.py

# Send daily digest at 9 AM local time
0 9 * * * /usr/bin/python3 /app/scripts/send_daily_digest.py

# Weekly report every Monday at 10 AM
0 10 * * 1 /usr/bin/python3 /app/scripts/send_weekly_report.py
```

**Implementation:**
```python
# check_critical_alerts.py
if __name__ == '__main__':
    check_signup_drop()
    check_payment_failures()
    check_m0_churn()
```

---

## Dashboard Access

**Mixpanel Dashboards:**
- CEO Dashboard: https://mixpanel.com/project/XXXXXX/view/dashboards/ceo
- Funnel Dashboard: https://mixpanel.com/project/XXXXXX/view/dashboards/funnel
- Cohort Analysis: https://mixpanel.com/project/XXXXXX/view/dashboards/cohorts

**Google Data Studio (Alternative):**
- Connect to Mixpanel data export
- Build custom dashboards with BigQuery backend
- Embed in Notion for team visibility

---

## Alert Response Playbook

**Signup Drop Alert:**
1. Check: Are paid ads paused? Budget exhausted?
2. Check: Is website down? (uptime monitor)
3. Check: Did a competitor launch something big?
4. Action: Increase ad spend if budget available, post on social media

**Payment Failure Alert:**
1. Check: Stripe dashboard for failure reasons
2. Check: Are multiple users affected or isolated?
3. Action: Email affected users with payment update link
4. Escalate: Contact Stripe support if widespread

**Churn Spike Alert:**
1. Segment: Which cohort is churning? (specialty, source, plan)
2. Survey: Send exit survey to recent churners
3. Action: Offer pause option instead of cancel
4. Root cause: Review recent product changes, emails sent

---

## KPI Targets Summary

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Activation Rate | 50% | 45% | ⚠️ Below |
| M0 Churn | <10% | 8% | ✅ On Track |
| DAU/MAU Ratio | 25% | 22% | ⚠️ Below |
| Trial → Paid | 15% | 12% | ⚠️ Below |
| LTV:CAC Ratio | >3:1 | 4.2:1 | ✅ Exceeding |
| Viral Coefficient | >0.3 | 0.25 | ⚠️ Below |

---

## Quarterly Review Checklist

- [ ] Update target benchmarks based on cohort data
- [ ] Review alert thresholds (too sensitive? too loose?)
- [ ] Add new metrics for features launched this quarter
- [ ] Archive unused metrics
- [ ] Train new team members on dashboard usage
- [ ] Export data for investor updates
