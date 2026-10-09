# SOP-264: Unit Economics & Cohort Analysis

**Process:** Proc 22 - Financial Performance Management
**Core:** 264 - Unit Economics & Cohort Analysis
**Owner:** Data Analyst
**Accountable:** CEO (Dr. Abdullah Al Alawi)
**Version:** 1.1
**Last Updated:** 2026-10-09

> **Core-ID note (2026-10-09):** This SOP was written as "SOP-267" against an
> unverified core ID. The live Proc 22 core for unit economics is **264**.
> Upstream: Core 262 (attribution feeds CAC, instrumentation feeds retention).
> Sibling: `SOP-263-kpi-dashboard-and-monitoring.md`.

---

## Purpose

Calculate and track LTV, CAC, payback period, and churn by cohort to ensure sustainable unit economics (LTV:CAC >3:1, payback <3 months).

---

## Scope

**In Scope:**
- CAC calculation per channel
- LTV calculation (historical and predictive)
- Payback period tracking
- Cohort retention analysis
- Churn segmentation and root cause analysis

**Out of Scope:**
- Attribution tracking (covered in SOP-262-attribution-tracking)
- Event implementation (covered in SOP-262-event-instrumentation)
- Financial forecasting (separate finance SOP)

---

## Roles & Responsibilities

| Role | Responsibility |
|------|----------------|
| Data Analyst | Cohort analysis, metrics calculation, reporting |
| CEO | Target setting, strategic decisions based on unit economics |
| Marketer (Nasim) | CAC optimization, channel budget allocation |
| Developer | Data infrastructure, automated reporting |

---

## Prerequisites

- [ ] Attribution data available (SOP-262-attribution-tracking complete)
- [ ] Payment events tracked (subscription_started, subscription_renewed, subscription_canceled)
- [ ] Session/activity events tracked (session_start for retention)
- [ ] Ad spend data collection automated or manual process established

---

## Procedure

### 1. Define Cohorts

**Frequency:** One-time setup (revisit quarterly)  
**Owner:** Data Analyst

**Steps:**

1.1. **Primary cohort dimension: Signup Month**
   - Group users by `DATE_TRUNC('month', created_at)`
   - Example cohorts: "2026-09", "2026-10", "2026-11"

1.2. **Secondary cohort dimensions** (for segmentation):
   - **Source**: utm_source (google, facebook, organic, referral)
   - **Specialty**: user.specialty (Internal Medicine, Surgery, Pediatrics, etc.)
   - **Plan**: subscription.plan (free_trial, monthly, annual)
   - **Geography**: user.country (Oman, UAE, Saudi, Egypt, etc.)

1.3. **Document cohort schema**:
   ```sql
   CREATE TABLE cohorts AS
   SELECT 
       user_id,
       DATE_TRUNC('month', created_at) as cohort_month,
       utm_source as cohort_source,
       specialty as cohort_specialty,
       country as cohort_geo
   FROM users;
   ```

1.4. **Set retention measurement periods**:
   - Day 1, 7, 30 (activation window)
   - Month 0, 1, 2, 3, 6, 12 (subscription lifecycle)

**Output:** Cohort schema agreed and documented

---

### 2. Calculate CAC (Customer Acquisition Cost)

**Frequency:** Monthly (by cohort and channel)  
**Owner:** Marketer (Nasim) + Data Analyst

**Steps:**

2.1. **Collect ad spend data** per channel:
   ```python
   # Google Ads
   google_spend = google_ads_api.get_spend(
       start_date='2026-10-01',
       end_date='2026-10-31'
   )
   
   # Facebook Ads
   facebook_spend = facebook_ads_api.get_spend(
       start_date='2026-10-01',
       end_date='2026-10-31'
   )
   
   # Manual channels (email, content, SEO) - estimate time cost
   organic_spend = estimate_organic_cost(month='2026-10')
   ```

2.2. **Count paid customers** per channel (not just signups):
   ```sql
   SELECT 
       utm_source,
       COUNT(DISTINCT u.id) as paid_customers
   FROM users u
   JOIN subscriptions s ON u.id = s.user_id
   WHERE u.created_at >= '2026-10-01'
   AND u.created_at < '2026-11-01'
   AND s.status = 'active'
   AND s.started_at IS NOT NULL  -- Exclude trials that never converted
   GROUP BY utm_source;
   ```

2.3. **Calculate CAC per channel**:
   ```python
   cac_by_channel = {
       'google': google_spend / google_paid_customers,
       'facebook': facebook_spend / facebook_paid_customers,
       'organic': organic_spend / organic_paid_customers,
       'referral': 0  # Negative CAC (rewards cost money but less than ads)
   }
   ```

2.4. **Store in database**:
   ```sql
   INSERT INTO unit_economics_monthly (
       cohort_month, channel, cac, ad_spend, paid_customers
   ) VALUES (
       '2026-10-01', 'google', 42.50, 850.00, 20
   );
   ```

2.5. **Blended CAC** (all channels combined):
   ```python
   blended_cac = total_spend / total_paid_customers
   ```

**Output:** CAC per channel and blended CAC for the month

---

### 3. Calculate LTV (Lifetime Value)

**Frequency:** Monthly (historical), Quarterly (predictive model update)  
**Owner:** Data Analyst

**Steps:**

3.1. **Calculate ARPU** (Average Revenue Per User):
   ```sql
   SELECT 
       AVG(mrr) as arpu
   FROM subscriptions
   WHERE status = 'active';
   ```

3.2. **Calculate average customer lifetime** (months):
   ```sql
   -- Historical method (completed lifecycles only)
   SELECT 
       AVG(EXTRACT(MONTH FROM AGE(canceled_at, started_at))) as avg_lifetime_months
   FROM subscriptions
   WHERE status = 'canceled'
   AND canceled_at IS NOT NULL;
   
   -- Predictive method (survival analysis)
   -- Use cohort retention curves to predict lifetime
   ```

3.3. **Calculate churn rate** (inverse of lifetime):
   ```sql
   -- Monthly churn rate
   SELECT 
       COUNT(DISTINCT CASE WHEN canceled_at >= DATE_TRUNC('month', NOW()) THEN user_id END) * 1.0 / 
       COUNT(DISTINCT CASE WHEN started_at < DATE_TRUNC('month', NOW()) THEN user_id END) as monthly_churn_rate
   FROM subscriptions
   WHERE status IN ('active', 'canceled');
   ```

3.4. **Calculate LTV**:
   ```python
   # Method 1: Simple (ARPU / churn_rate)
   ltv_simple = arpu / monthly_churn_rate
   
   # Method 2: Retention-based (sum of retention curve × ARPU)
   ltv_retention = sum([
       retention_month_n * arpu * (1 - monthly_churn_rate) ** n
       for n in range(0, 36)  # 3-year window
   ])
   
   # Method 3: Historical average
   ltv_historical = avg_lifetime_months * arpu
   ```

3.5. **Choose LTV method**:
   - **0-6 months post-launch**: Use retention-based (no completed lifecycles yet)
   - **6-12 months**: Blend retention + historical
   - **12+ months**: Prefer historical (more accurate)

**Output:** LTV per cohort and blended LTV

---

### 4. Calculate Payback Period

**Frequency:** Monthly per cohort  
**Owner:** Data Analyst

**Steps:**

4.1. **Calculate cumulative revenue per cohort**:
   ```sql
   WITH cohort_revenue AS (
       SELECT 
           DATE_TRUNC('month', u.created_at) as cohort_month,
           u.id as user_id,
           SUM(p.amount) as total_revenue,
           MIN(p.created_at) as first_payment_date,
           u.created_at as signup_date
       FROM users u
       JOIN payments p ON u.id = p.user_id
       WHERE p.status = 'succeeded'
       GROUP BY cohort_month, u.id, u.created_at
   )
   SELECT 
       cohort_month,
       user_id,
       total_revenue,
       EXTRACT(DAY FROM AGE(first_payment_date, signup_date)) as days_to_first_payment,
       EXTRACT(MONTH FROM AGE(NOW(), signup_date)) as months_since_signup
   FROM cohort_revenue;
   ```

4.2. **Calculate average payback** per cohort:
   ```python
   def calculate_payback_period(cohort_month, cac):
       # Get cumulative revenue by month-since-signup
       revenue_curve = db.query("""
           SELECT 
               months_since_signup,
               AVG(cumulative_revenue) as avg_revenue
           FROM (
               SELECT 
                   user_id,
                   EXTRACT(MONTH FROM AGE(payment_date, signup_date)) as months_since_signup,
                   SUM(amount) OVER (PARTITION BY user_id ORDER BY payment_date) as cumulative_revenue
               FROM payments
               WHERE cohort_month = %s
           ) subquery
           GROUP BY months_since_signup
           ORDER BY months_since_signup
       """, [cohort_month])
       
       # Find month where avg_revenue >= CAC
       for row in revenue_curve:
           if row['avg_revenue'] >= cac:
               return row['months_since_signup']
       
       return None  # Not yet paid back
   ```

4.3. **Flag cohorts with >3 month payback**:
   ```python
   if payback_period > 3:
       alert_ceo(f"Cohort {cohort_month} payback: {payback_period} months (target: <3)")
   ```

**Output:** Payback period per cohort

---

### 5. Cohort Retention Analysis

**Frequency:** Weekly (latest cohort), Monthly (all cohorts)  
**Owner:** Data Analyst

**Steps:**

5.1. **Build retention matrix** (SQL):
   ```sql
   WITH cohort_activity AS (
       SELECT 
           DATE_TRUNC('month', u.created_at) as cohort_month,
           u.id as user_id,
           DATE_TRUNC('month', s.date) as activity_month
       FROM users u
       JOIN sessions s ON u.id = s.user_id
       GROUP BY cohort_month, u.id, activity_month
   ),
   cohort_size AS (
       SELECT 
           DATE_TRUNC('month', created_at) as cohort_month,
           COUNT(DISTINCT id) as cohort_size
       FROM users
       GROUP BY cohort_month
   )
   SELECT 
       ca.cohort_month,
       EXTRACT(MONTH FROM AGE(ca.activity_month, ca.cohort_month)) as months_since_signup,
       COUNT(DISTINCT ca.user_id) as active_users,
       cs.cohort_size,
       ROUND(100.0 * COUNT(DISTINCT ca.user_id) / cs.cohort_size, 2) as retention_rate
   FROM cohort_activity ca
   JOIN cohort_size cs ON ca.cohort_month = cs.cohort_month
   GROUP BY ca.cohort_month, months_since_signup, cs.cohort_size
   ORDER BY ca.cohort_month, months_since_signup;
   ```

5.2. **Visualize retention curves** (chart):
   ```
   100% |██████████████████████████
    80% |█████████████████████─────
    60% |█████████████────────────
    40% |████████──────────────────
    20% |████──────────────────────
     0% |──────────────────────────────
         M0  M1  M2  M3  M4  M5  M6
   ```

5.3. **Compare cohorts** (overlay curves):
   - Identify improving vs declining retention
   - Segment by source, specialty, plan

5.4. **Flag anomalies**:
   ```python
   if cohort_retention_m1 < 50:  # Target: >60%
       alert_ceo(f"Cohort {cohort_month} M1 retention: {cohort_retention_m1}% (target: >60%)")
   ```

**Output:** Retention matrix and visualizations

---

### 6. Churn Analysis

**Frequency:** Monthly  
**Owner:** Data Analyst

**Steps:**

6.1. **Segment churn by cohort age**:
   ```sql
   SELECT 
       CASE 
           WHEN months_active <= 1 THEN 'M0'
           WHEN months_active <= 3 THEN 'M1-M3'
           ELSE 'M3+'
       END as cohort_age,
       COUNT(*) as churned_users,
       AVG(months_active) as avg_months_before_churn
   FROM (
       SELECT 
           user_id,
           EXTRACT(MONTH FROM AGE(canceled_at, started_at)) as months_active
       FROM subscriptions
       WHERE status = 'canceled'
       AND canceled_at >= DATE_TRUNC('month', NOW())
   ) subquery
   GROUP BY cohort_age;
   ```

6.2. **Analyze churn reasons** (if exit survey exists):
   ```sql
   SELECT 
       churn_reason,
       COUNT(*) as count,
       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
   FROM cancellations
   WHERE canceled_at >= DATE_TRUNC('month', NOW())
   GROUP BY churn_reason
   ORDER BY count DESC;
   ```

6.3. **Identify high-risk segments**:
   ```sql
   -- Low engagement → high churn correlation
   SELECT 
       specialty,
       AVG(sessions_per_week) as avg_engagement,
       COUNT(DISTINCT CASE WHEN canceled_at IS NOT NULL THEN user_id END) * 1.0 / 
       COUNT(DISTINCT user_id) as churn_rate
   FROM users u
   LEFT JOIN subscriptions s ON u.id = s.user_id
   GROUP BY specialty
   HAVING churn_rate > 0.10  -- >10% churn
   ORDER BY churn_rate DESC;
   ```

6.4. **Recommend interventions**:
   - High M0 churn → improve onboarding (SOP-255)
   - High M3+ churn → add features, re-engagement (SOP-257)
   - Specialty-specific churn → content gaps

**Output:** Monthly churn report with root causes

---

### 7. Unit Economics Dashboard

**Frequency:** Real-time (automated), reviewed weekly  
**Owner:** Developer (build), Data Analyst (maintain)

**Steps:**

7.1. **Build dashboard** (Mixpanel Insights or Google Data Studio):

   **Key Metrics Panel:**
   - Blended CAC (current month)
   - Blended LTV (all cohorts)
   - LTV:CAC Ratio (target: >3:1)
   - Payback Period (target: <3 months)
   - Monthly Churn Rate (target: <5%)

7.2. **Cohort Grid** (rows = cohorts, cols = months since signup):
   ```
   Cohort    | M0   | M1   | M2   | M3   | M6   | LTV   | CAC   | LTV:CAC
   ----------|------|------|------|------|------|-------|-------|--------
   2026-09   | 100% | 65%  | 58%  | 52%  | 45%  | $180  | $42   | 4.3:1
   2026-10   | 100% | 62%  | 55%  | 48%  | -    | $165  | $48   | 3.4:1
   2026-11   | 100% | 60%  | -    | -    | -    | $150* | $52   | 2.9:1
   ```
   (*predictive)

7.3. **Trend Charts:**
   - CAC over time (by channel)
   - LTV over time (by cohort)
   - LTV:CAC ratio trend
   - Payback period trend

7.4. **Alert Tiles** (red/yellow/green):
   - ⚠️ LTV:CAC < 3:1
   - ⚠️ Payback > 3 months
   - ⚠️ M0 churn > 10%

7.5. **Automate refresh**:
   ```python
   # Scheduled job (daily at 6 AM)
   @scheduler.task('cron', hour=6)
   def refresh_unit_economics_dashboard():
       calculate_cac_all_cohorts()
       calculate_ltv_all_cohorts()
       calculate_payback_all_cohorts()
       update_dashboard_cache()
   ```

**Output:** Live unit economics dashboard

---

### 8. Monthly Unit Economics Report

**Frequency:** Monthly (1st of month for prior month)  
**Owner:** Data Analyst

**Steps:**

8.1. **Generate report** (Google Doc template):

   **Summary:**
   - Blended CAC: $X (vs last month: ±Y%)
   - Blended LTV: $X (vs last month: ±Y%)
   - LTV:CAC: X:1 (target: >3:1) [✅ / ⚠️]
   - Payback: X months (target: <3) [✅ / ⚠️]
   - Churn Rate: X% (target: <5%) [✅ / ⚠️]

   **Cohort Highlights:**
   - Best Cohort: [Month] (LTV:CAC X:1, reason)
   - Worst Cohort: [Month] (LTV:CAC X:1, reason)
   - Improving: [List cohorts with improving retention]
   - Declining: [List cohorts with declining retention]

   **Channel Performance:**
   - Lowest CAC: [Channel] ($X)
   - Highest CAC: [Channel] ($X)
   - Recommendation: [Scale/Pause/Optimize]

   **Risks:**
   - [List any metrics outside target range]

   **Next Month Actions:**
   - [Specific recommendations]

8.2. **Email to CEO + Marketer (Nasim)**.

8.3. **Store report** in `/reports/unit-economics/YYYY-MM.pdf`.

**Output:** Monthly unit economics report emailed and archived

---

## Edge Cases

**Case 1: Cohort too small (<10 users)**
- **Problem:** Metrics unreliable, outliers skew averages
- **Solution:** Flag as "insufficient sample size", exclude from averages
- **Report as:** "Pending (n=X)"

**Case 2: Annual plans skew LTV**
- **Problem:** Annual customers pay upfront, inflating M0 LTV
- **Solution:** Normalize to monthly equivalent (annual_price / 12)
- **Metric:** Use "Monthly Normalized LTV" for comparisons

**Case 3: Referral rewards cost money**
- **Problem:** Referral CAC negative (rewards) or positive (reward cost)?
- **Solution:** CAC = reward cost / referred paid customers
- **Note:** Still lower than ads, but not truly $0

**Case 4: Free-to-paid conversion window varies**
- **Problem:** Some trials convert immediately, others take 14 days
- **Solution:** Measure payback from signup date (not first payment date)
- **Rationale:** CAC spent at signup, not at conversion

**Case 5: Churn data incomplete (canceled but reason unknown)**
- **Problem:** 40% of cancellations have no exit survey
- **Solution:** Tag as "Unknown" but still include in churn rate
- **Action:** Improve exit survey response rate (make mandatory?)

---

## KPIs & Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Blended CAC | <$50 | - | - |
| Blended LTV | >$150 | - | - |
| LTV:CAC Ratio | >3:1 | - | - |
| Payback Period | <3 months | - | - |
| M0 Churn | <10% | - | - |
| M1-M3 Churn | <8% | - | - |
| M3+ Churn | <5% | - | - |

---

## Appendix A: LTV Calculation Methods

| Method | Formula | Pros | Cons | When to Use |
|--------|---------|------|------|-------------|
| **Simple** | ARPU / Churn Rate | Fast, easy | Assumes constant churn | Quick estimates |
| **Historical** | Avg(Lifetime) × ARPU | Real data | Requires completed cycles | 12+ months live |
| **Retention-Based** | Σ(Retention[n] × ARPU × Discount[n]) | Predictive early | Complex | 0-12 months live |
| **Cohort-Specific** | Per-cohort LTV avg | Most accurate | Data-intensive | Mature business |

**Bayan Recommendation:** Start with Retention-Based (months 0-6), transition to Historical (6-12), then Cohort-Specific (12+).

---

## Appendix B: Cohort Retention Benchmarks

**SaaS Industry Benchmarks:**
- M0 (Month 0): 100% (by definition)
- M1 (Month 1): 60-80% (good: >70%)
- M2 (Month 2): 50-70% (good: >60%)
- M3 (Month 3): 45-65% (good: >55%)
- M6 (Month 6): 35-55% (good: >45%)
- M12 (Month 12): 25-45% (good: >35%)

**Bayan Targets** (conservative for edu-tech):
- M1: >60%
- M3: >50%
- M6: >40%
- M12: >30%

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-10-06 | Initial SOP | Stage 3 Ops Team |

---

## Approval

**Reviewed By:**
- [ ] CEO (Dr. Abdullah Al Alawi) - Targets, strategic decisions
- [ ] Data Analyst - Calculation methods, reporting
- [ ] Marketer (Nasim) - CAC accuracy, channel insights
- [ ] Developer - Dashboard automation

**Approved:** _____________ **Next Review:** Q1 2027
