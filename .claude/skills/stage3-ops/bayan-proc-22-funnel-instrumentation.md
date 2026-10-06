# Bayan Proc 22: Funnel Instrumentation & Unit Economics

**EMPOWER Layer:** 3 (Enabling Processes)  
**Purpose:** Measure and track all customer lifecycle metrics to enable data-driven optimization  
**Owner:** CEO (measurement strategy) + Tech Lead (implementation)  
**Status:** Planned (not yet built in Stage 3)

---

## Why This Matters

**Current state:** Flying blind. No funnel data = every projection marked `[TBD]` in the marketing plan.

**Impact of the gap:**
- Can't measure AARRR metrics (Acquisition, Activation, Retention, Referral, Revenue)
- Can't calculate unit economics (LTV, CAC, payback period)
- Can't optimize conversion rates between stages
- Can't prove marketing ROI to investors

**Once built:** Every core (255-267) gets real-time dashboards, A/B testing capability, and cohort analysis.

---

## Scope: 3 Cores

### Core 268: Analytics Implementation
**Purpose:** Install tracking across all user touchpoints

**Key Activities:**
1. Install GA4 + Mixpanel/Amplitude
2. Define event taxonomy (page views, feature usage, conversions)
3. Implement server-side tracking (backend events)
4. Set up UTM parameter structure for attribution
5. Configure cross-domain tracking (bayan.edu.om ↔ bayanai.tech ↔ medad.om)

**Deliverables:**
- Event tracking spec (50+ events across all cores)
- Implementation guide for dev team
- QA checklist for event validation

---

### Core 269: KPI Dashboard
**Purpose:** Real-time visibility into funnel health

**Key Metrics by Stage:**

**Market to Lead (Proc 15):**
- Traffic sources breakdown (organic, paid, referral)
- Lead magnet conversion rate (QR scan → email capture)
- Content engagement (video completion, article reads)

**Lead to Sale (Proc 14):**
- Trial start rate (visitor → trial)
- Aha moment rate (3 features in 7 days)
- Trial → paid conversion rate
- Paywall impression → conversion rate

**Sale to Delivery (Proc TBD):**
- Payment success rate
- Account provisioning time (payment → first login)
- Onboarding completion rate

**Delivery to Success (Proc TBD):**
- Weekly active users (WAU)
- Feature adoption (% using MCQ vs OSCE vs Articles)
- Exam pass rate (users who sat exam after using Bayan)

**Success to Referral (Proc TBD):**
- Referral invite send rate
- Referral conversion rate (invite → signup)
- Viral coefficient (k-factor)

**Unit Economics:**
- Customer Acquisition Cost (CAC) by channel
- Lifetime Value (LTV) by cohort
- LTV:CAC ratio (target: 3:1)
- Payback period (target: <12 months)
- Monthly Recurring Revenue (MRR)
- Churn rate by cohort

**Deliverables:**
- Dashboard mockup (data visualization)
- Metric definitions document (how each metric is calculated)
- Alert thresholds (when to notify CEO)

---

### Core 270: Unit Economics Tracking
**Purpose:** Cohort-based financial modeling

**Key Activities:**
1. Define cohorts (by signup month, by acquisition channel, by geography)
2. Track cohort revenue over time (month 1, 3, 6, 12 revenue)
3. Calculate cohort-level CAC (spend / signups)
4. Model LTV by cohort (retention curve × ARPU)
5. Build payback period calculator
6. Forecast MRR based on cohort behavior

**Deliverables:**
- Cohort analysis spreadsheet (updated monthly)
- Unit economics model (Google Sheets or Python)
- Break-even analysis (when Bayan reaches cash-flow positive)

---

## L1: Core Process (RACI)

### Core 268: Analytics Implementation

**Activities & RACI:**

| Activity | Responsible | Accountable | Consulted | Informed |
|----------|-------------|-------------|-----------|----------|
| Define event taxonomy | Tech Lead | CEO | Nasim (marketing events) | — |
| Install GA4 | Tech Lead | CEO | — | Nasim |
| Install Mixpanel | Tech Lead | CEO | — | Nasim |
| Implement backend tracking | Tech Lead | CEO | — | Nasim |
| Set up UTM structure | Nasim | CEO | Tech Lead | — |
| QA event firing | Tech Lead | CEO | Nasim | — |

**KPIs:**
- Event coverage: 95%+ of user actions tracked
- Data quality: <5% event failure rate
- Implementation time: 2-3 weeks

---

### Core 269: KPI Dashboard

**Activities & RACI:**

| Activity | Responsible | Accountable | Consulted | Informed |
|----------|-------------|-------------|-----------|----------|
| Define metrics | CEO | CEO | Nasim, Tech Lead | — |
| Design dashboard | Nasim | CEO | Tech Lead | — |
| Build dashboard | Tech Lead | CEO | Nasim | — |
| Set alert thresholds | CEO | CEO | Nasim | Tech Lead |
| Weekly metric review | Nasim | CEO | — | Tech Lead |

**KPIs:**
- Dashboard load time: <3 seconds
- Data freshness: Real-time (< 5 min delay)
- Metric accuracy: 100% match with source data

---

### Core 270: Unit Economics Tracking

**Activities & RACI:**

| Activity | Responsible | Accountable | Consulted | Informed |
|----------|-------------|-------------|-----------|----------|
| Define cohorts | CEO | CEO | Nasim | Tech Lead |
| Build cohort model | Nasim | CEO | Tech Lead | — |
| Calculate monthly LTV/CAC | Nasim | CEO | — | Tech Lead |
| Update investor deck | CEO | CEO | Nasim | — |
| Monthly economics review | Nasim | CEO | — | Tech Lead |

**KPIs:**
- LTV:CAC ratio: Target 3:1
- Payback period: Target <12 months
- MRR growth: Target 20% month-over-month

---

## L2: Blueprints (Functional Breakdown)

### Core 268: Analytics Implementation Blueprint

**Sub-processes:**
1. **Event Taxonomy Design** (Week 1)
   - Map all user journeys
   - Define events per journey stage
   - Assign event naming convention
   - Quality gate: CEO approves event list

2. **Tool Installation** (Week 1-2)
   - Install GA4 (front-end + back-end)
   - Install Mixpanel (event streaming)
   - Configure cross-domain tracking
   - Quality gate: Events firing in test environment

3. **Implementation** (Week 2-3)
   - Instrument all pages
   - Add backend event triggers
   - Implement UTM parameter capture
   - Quality gate: 95%+ event coverage achieved

4. **QA & Validation** (Week 3)
   - Test all events in staging
   - Verify data flowing to dashboards
   - Validate attribution accuracy
   - Quality gate: <5% event failure rate

**Decision Trees:**
- If event failure rate >5% → halt launch, debug
- If cross-domain tracking fails → implement server-side workaround
- If Mixpanel cost exceeds budget → switch to Amplitude

**Handoff Protocol:**
- Tech Lead → Nasim: "Analytics live, dashboard ready to build"
- Include: Event catalog, API credentials, dashboard access

---

### Core 269: KPI Dashboard Blueprint

**Sub-processes:**
1. **Metric Definition** (Week 1)
   - List all metrics per stage (AARRR)
   - Define calculation logic for each
   - Set benchmark targets
   - Quality gate: CEO approves metric list

2. **Dashboard Design** (Week 1)
   - Sketch layout (mobile + desktop)
   - Choose visualization types
   - Define drill-down paths
   - Quality gate: Nasim approves design

3. **Dashboard Build** (Week 2)
   - Connect data sources (GA4, Mixpanel, Stripe)
   - Build visualizations
   - Implement filters (date range, segment, cohort)
   - Quality gate: Dashboard loads in <3 seconds

4. **Alert Configuration** (Week 2)
   - Set thresholds per metric
   - Configure Slack/email notifications
   - Test alert firing
   - Quality gate: Alerts trigger correctly

**Decision Trees:**
- If metric conflicts between tools → GA4 is source of truth
- If dashboard load time >3s → implement caching
- If metric drops >20% week-over-week → trigger urgent CEO alert

**Handoff Protocol:**
- Tech Lead → CEO + Nasim: "Dashboard live, alerts configured"
- Include: Dashboard URL, alert channel, metric definitions doc

---

### Core 270: Unit Economics Tracking Blueprint

**Sub-processes:**
1. **Cohort Definition** (Week 1)
   - Define cohort dimensions (month, channel, geo)
   - Set cohort tracking window (12 months)
   - Build cohort segmentation logic
   - Quality gate: CEO approves cohort structure

2. **Model Build** (Week 1-2)
   - Export cohort data from analytics
   - Calculate cohort revenue curves
   - Build LTV projection model
   - Calculate cohort-level CAC
   - Quality gate: Model matches actual historical data

3. **Monthly Reporting** (Ongoing)
   - Update cohort performance
   - Calculate current LTV:CAC
   - Update MRR forecast
   - Quality gate: Report delivered by 5th of each month

4. **Investor Reporting** (Quarterly)
   - Package unit economics into deck
   - Highlight progress toward break-even
   - Show cohort improvement over time
   - Quality gate: CEO approves before sending to investors

**Decision Trees:**
- If LTV:CAC <1.5 → red alert, pause paid acquisition
- If payback period >18 months → revisit pricing strategy
- If churn rate >8% monthly → trigger retention audit

**Handoff Protocol:**
- Nasim → CEO: Monthly unit economics report (by 5th of month)
- Include: LTV/CAC table, cohort curves, MRR forecast, break-even projection

---

## L3: SOPs (Step-by-Step Guides)

### Core 268: Analytics Implementation SOP

**Step 1: Define Event Taxonomy**
1. Open Google Sheet: "Bayan Event Tracking Spec"
2. List all user journeys (one per core 255-267)
3. For each journey stage, define events:
   - Page view events (e.g., `page_view_pricing`)
   - Click events (e.g., `click_start_trial`)
   - Feature usage events (e.g., `feature_mcq_attempt`)
   - Conversion events (e.g., `conversion_trial_to_paid`)
4. Follow naming convention: `category_action_object`
5. Mark: **CHECKPOINT →** CEO reviews and approves

**Step 2: Install GA4**
1. Create GA4 property at analytics.google.com
2. Add GA4 tracking code to `<head>` of all pages
3. Configure enhanced measurement (scrolls, video plays)
4. Enable cross-domain tracking for bayan.edu.om ↔ bayanai.tech ↔ medad.om
5. Test: Visit site, check Real-Time report
6. Mark: **CHECKPOINT →** Events firing in GA4

**Step 3: Install Mixpanel**
1. Create Mixpanel project at mixpanel.com
2. Add Mixpanel SDK to site (JS for front-end, Python for back-end)
3. Implement event tracking per taxonomy
4. Set user properties (role, specialty, location, subscription status)
5. Test: Trigger event, check Mixpanel dashboard
6. Mark: **CHECKPOINT →** Events firing in Mixpanel

**Step 4: Implement Backend Tracking**
1. Add Mixpanel server-side SDK to backend code
2. Trigger events for backend actions:
   - Account creation
   - Subscription start/end
   - Payment success/failure
   - Feature usage (if not captured client-side)
3. Include user ID in all events
4. Test: Trigger backend action, verify event in Mixpanel
5. Mark: **CHECKPOINT →** Backend events firing

**Step 5: Set Up UTM Structure**
1. Define UTM parameters for all campaigns:
   - `utm_source`: google, facebook, linkedin, email, qr
   - `utm_medium`: cpc, social, email, offline
   - `utm_campaign`: [campaign-name]
   - `utm_content`: [variant]
2. Document UTM structure in shared doc
3. Configure GA4 to capture UTM parameters
4. Test: Visit site with UTM parameters, verify in GA4
5. Mark: **CHECKPOINT →** UTM tracking working

**Step 6: QA Event Firing**
1. Open "Bayan Event Tracking Spec" sheet
2. For each event, manually trigger action on site
3. Check event appears in GA4 + Mixpanel within 5 minutes
4. Record pass/fail in QA column
5. If event fails, debug with Tech Lead
6. Target: 95%+ events passing
7. Mark: **COMPLETE →** Analytics implementation live

**Troubleshooting:**
- Event not firing → check browser console for errors
- Event firing but wrong data → check event parameters
- Cross-domain tracking broken → verify linker parameter in URL

---

### Core 269: KPI Dashboard SOP

**Step 1: Define Metrics**
1. Open "Bayan Metrics Definitions" doc
2. For each funnel stage, list key metrics
3. For each metric, define:
   - Calculation formula
   - Data source (GA4, Mixpanel, Stripe)
   - Benchmark target
   - Alert threshold
4. Example: "Trial → Paid Conversion Rate = (Paid Subscriptions / Trial Starts) × 100%, target 15%"
5. Mark: **CHECKPOINT →** CEO approves metrics

**Step 2: Design Dashboard**
1. Sketch layout on paper or Figma
2. Top section: Key metrics (trial conversion, MRR, churn)
3. Middle section: Funnel visualization (AARRR stages)
4. Bottom section: Cohort table (monthly cohorts × revenue)
5. Add filters: Date range, segment (B2C vs B2B), cohort
6. Mark: **CHECKPOINT →** Nasim approves design

**Step 3: Build Dashboard**
1. Choose tool: Mixpanel Insights, Google Data Studio, or custom (Retool, Streamlit)
2. Connect data sources:
   - GA4 via API or native integration
   - Mixpanel via native queries
   - Stripe via API for revenue data
3. Build visualizations per design
4. Implement filters and drill-downs
5. Test: Load dashboard, verify data accuracy vs source
6. Mark: **CHECKPOINT →** Dashboard loads in <3 seconds

**Step 4: Configure Alerts**
1. For each critical metric, set alert threshold:
   - Trial conversion drops >20% → urgent alert
   - MRR drops >10% → urgent alert
   - Churn rate exceeds 8% → warning alert
2. Connect alerts to Slack channel: `#bayan-metrics`
3. Test: Manually trigger threshold, verify alert fires
4. Mark: **COMPLETE →** Dashboard + alerts live

**Troubleshooting:**
- Dashboard slow → implement data caching or pre-aggregation
- Metric mismatch between tools → GA4 is source of truth, reconcile Mixpanel
- Alert not firing → check webhook connection, verify threshold logic

---

### Core 270: Unit Economics Tracking SOP

**Step 1: Define Cohorts**
1. Open "Bayan Unit Economics Model" spreadsheet
2. Create cohort sheet with columns:
   - Cohort (YYYY-MM format, e.g., 2026-10)
   - Signup Count
   - Acquisition Channel (organic, paid, referral)
   - Geography (Oman, UAE, Saudi, Other)
3. Populate historical cohorts from analytics
4. Mark: **CHECKPOINT →** CEO approves cohort structure

**Step 2: Calculate Cohort Revenue**
1. For each cohort, track monthly revenue:
   - Month 0 (signup month)
   - Month 1, 2, 3... up to Month 12
2. Export Stripe data by cohort
3. Build revenue curve chart (X=month, Y=cumulative revenue per user)
4. Mark: **CHECKPOINT →** Revenue curves match Stripe data

**Step 3: Calculate LTV**
1. For each cohort, calculate:
   - Retention rate per month (% still active)
   - ARPU (Average Revenue Per User) per month
   - LTV = ARPU × Average Customer Lifetime (in months)
2. Use formula: `LTV = ARPU / Churn Rate`
3. Example: ARPU = $20/mo, Churn = 5%/mo → LTV = $20 / 0.05 = $400
4. Mark: **CHECKPOINT →** LTV calculated per cohort

**Step 4: Calculate CAC**
1. For each cohort, sum acquisition spend:
   - Paid ads spend
   - Content creation cost (allocate Nasim's time)
   - Event/booth costs
2. Divide by signup count
3. Example: $5,000 spend / 100 signups = $50 CAC
4. Mark: **CHECKPOINT →** CAC calculated per cohort

**Step 5: Calculate LTV:CAC Ratio**
1. Divide LTV by CAC for each cohort
2. Example: $400 LTV / $50 CAC = 8:1 ratio
3. Target: 3:1 minimum
4. Color code: Green (>3:1), Yellow (1.5-3:1), Red (<1.5:1)
5. Mark: **CHECKPOINT →** Ratio calculated per cohort

**Step 6: Build Payback Period Calculation**
1. For each cohort, sum cumulative revenue per month
2. Find month where cumulative revenue >= CAC
3. Example: CAC = $50, Month 3 cumulative revenue = $60 → Payback = 3 months
4. Target: <12 months
5. Mark: **CHECKPOINT →** Payback calculated per cohort

**Step 7: Forecast MRR**
1. For each future month, project signups (based on plan)
2. Apply retention curves from historical cohorts
3. Sum projected active users × ARPU = Forecasted MRR
4. Example: 500 users × $20 ARPU = $10,000 MRR
5. Mark: **CHECKPOINT →** MRR forecast built

**Step 8: Monthly Report**
1. On 5th of each month, update spreadsheet with last month's data
2. Export summary slide:
   - Current MRR
   - LTV:CAC ratio by channel
   - Cohort performance table
   - Break-even projection
3. Send to CEO via Slack
4. Mark: **COMPLETE →** Monthly report delivered

**Troubleshooting:**
- LTV drops → investigate churn spike, check product issues
- CAC spikes → check paid ad efficiency, adjust targeting
- Payback period increases → consider pricing increase or churn reduction

---

## L4: Forms (Templates & Tools)

### Core 268: Analytics Implementation Forms

**Event Tracking Spec Template** (Google Sheet)
- Columns: Event Name, Category, Action, Object, Parameters, Priority, Status
- Example row: `click_start_trial`, `conversion`, `click`, `start_trial_button`, `{plan: free, source: homepage}`, High, ✅

**QA Checklist** (Google Doc)
- [ ] GA4 installed on all pages
- [ ] Mixpanel installed on all pages
- [ ] Backend events firing
- [ ] Cross-domain tracking works
- [ ] UTM parameters captured
- [ ] Event failure rate <5%

---

### Core 269: KPI Dashboard Forms

**Metrics Definitions Doc** (Google Doc)
| Metric | Formula | Source | Target | Alert Threshold |
|--------|---------|--------|--------|-----------------|
| Trial Start Rate | (Trials / Visitors) × 100% | GA4 | 5% | <3% |
| Aha Moment Rate | (Users with 3+ features / Trials) × 100% | Mixpanel | 40% | <30% |
| Trial → Paid | (Paid / Trials) × 100% | Stripe + Mixpanel | 15% | <10% |

**Dashboard Mockup** (Figma link in SOP)

---

### Core 270: Unit Economics Tracking Forms

**Unit Economics Model** (Google Sheets)
- Sheet 1: Cohort Data
- Sheet 2: Revenue Curves
- Sheet 3: LTV/CAC Calculations
- Sheet 4: MRR Forecast
- Sheet 5: Break-Even Projection

**Monthly Report Template** (Google Slides)
- Slide 1: MRR Overview (current, growth %)
- Slide 2: Cohort Performance Table
- Slide 3: LTV:CAC by Channel
- Slide 4: Break-Even Projection

---

## Integration with Other Processes

**Proc 15 (Market to Lead):**
- Core 268 tracks: Traffic sources, lead magnet conversions
- Core 269 displays: Top-of-funnel metrics
- Core 270 calculates: CAC by acquisition channel

**Proc 14 (Lead to Sale):**
- Core 268 tracks: Trial starts, aha moments, conversions
- Core 269 displays: Mid-funnel metrics
- Core 270 calculates: Trial → paid conversion rates per cohort

**Proc TBD (Sale to Delivery to Success):**
- Core 268 tracks: Onboarding completion, feature adoption
- Core 269 displays: Retention metrics
- Core 270 calculates: LTV by cohort

**All Cores (255-267):**
- Depend on Proc 22 for measurement
- Optimization decisions driven by dashboard insights
- ROI calculation enabled by unit economics tracking

---

## Implementation Timeline

**Week 1:**
- Core 268 Step 1-2: Event taxonomy + GA4 install
- Core 269 Step 1: Metric definitions
- Core 270 Step 1: Cohort structure

**Week 2:**
- Core 268 Step 3-4: Mixpanel + backend tracking
- Core 269 Step 2-3: Dashboard design + build
- Core 270 Step 2-4: Revenue curves + LTV/CAC calculations

**Week 3:**
- Core 268 Step 5-6: UTM structure + QA
- Core 269 Step 4: Alert configuration
- Core 270 Step 5-7: Payback + MRR forecast

**Week 4:**
- All cores live
- First monthly report delivered
- Begin optimization of cores 255-267 based on data

---

## Success Criteria

**Core 268:**
- ✅ 95%+ event coverage
- ✅ <5% event failure rate
- ✅ Cross-domain tracking working

**Core 269:**
- ✅ Dashboard loads in <3 seconds
- ✅ Real-time data (<5 min delay)
- ✅ Alerts firing correctly

**Core 270:**
- ✅ LTV:CAC ratio calculated per cohort
- ✅ Payback period <12 months
- ✅ Monthly report delivered on time

**Overall Impact:**
- All 7 existing cores (255-261) now have data
- Marketing plan projections replaced with actuals
- CEO can show investors real unit economics
- Optimization cycles accelerate (data-driven decisions)
