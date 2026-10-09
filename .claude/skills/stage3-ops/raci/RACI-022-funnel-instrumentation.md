# RACI-022: Funnel Instrumentation & Unit Economics

**Process:** Proc 22 - Funnel Instrumentation & Unit Economics  
**Cores:** 266 (Marketing Attribution), 267 (Unit Economics), 268 (Analytics Implementation)  
**Owner:** CEO (Nasim)  
**Last Updated:** 2026-10-06

---

## RACI Legend

- **R (Responsible)**: Does the work
- **A (Accountable)**: Final decision authority, single point of accountability
- **C (Consulted)**: Provides input before decisions/actions
- **I (Informed)**: Kept updated on progress/decisions

---

## Stakeholder Roster

| Role | Name | Responsibilities |
|------|------|------------------|
| CEO | Nasim | Business strategy, KPI targets, investor reporting |
| CTO | TBD | Technical architecture, data infrastructure |
| Developer | TBD | Implementation, integration, maintenance |
| Marketing Lead | TBD | Campaign attribution, channel optimization |
| Data Analyst | TBD | Dashboard design, insight generation |

---

## Core 266: Marketing Attribution & Source Tracking

**Purpose:** Track every user's acquisition source from first touch through conversion

### Activities & RACI

| Activity | CEO | CTO | Developer | Marketing Lead | Data Analyst |
|----------|-----|-----|-----------|----------------|--------------|
| **Define attribution model** (first-touch vs last-touch vs multi-touch) | **A** | C | I | **R** | C |
| **Set up UTM parameter taxonomy** (campaign naming conventions) | C | I | **R** | **A** | I |
| **Implement UTM tracking** (capture on landing, persist through signup) | I | C | **R/A** | I | I |
| **Configure cross-domain tracking** (website → payment gateway) | I | **A** | **R** | I | C |
| **Set up offline attribution** (QR codes, print materials) | **A** | I | **R** | **R** | I |
| **Track referral attribution** (referral code → conversion) | C | I | **R/A** | C | I |
| **Build attribution reports** (source → conversion funnel by channel) | C | I | C | **A** | **R** |
| **Validate attribution accuracy** (spot-check campaigns) | I | I | C | **R/A** | C |
| **Monthly attribution review** (channel performance, CAC by source) | **A** | I | I | **R** | **R** |

### Decision Rights

**Strategic Decisions (CEO/Marketing Lead):**
- Which attribution model to use (first-touch, last-touch, multi-touch)
- UTM naming conventions and campaign taxonomy
- Offline-to-online attribution strategy
- Channel budget allocation based on CAC per source

**Technical Decisions (CTO/Developer):**
- Where to store attribution data (Mixpanel properties vs dedicated table)
- Cookie lifetime for attribution windows
- Cross-domain tracking implementation approach
- How to handle missing/incomplete UTM parameters

**Operational Decisions (Developer/Marketing Lead):**
- When to create new UTM campaigns vs reuse existing
- How to handle typos/variations in UTM parameters
- Attribution cleanup and normalization rules

### Communication Flows

**Daily:**
- Developer → Marketing Lead: New campaign UTM codes ready for use
- Developer → CTO: Attribution tracking errors/failures

**Weekly:**
- Marketing Lead → CEO: Top 5 performing channels by signups
- Data Analyst → Marketing Lead: Attribution anomalies (sudden drops, spikes)

**Monthly:**
- Marketing Lead → CEO: Full attribution report with CAC per source
- CTO → CEO: Attribution data quality metrics (completeness, accuracy)

---

## Core 267: Unit Economics & Cohort Analysis

**Purpose:** Calculate and track LTV, CAC, payback period, churn by cohort

### Activities & RACI

| Activity | CEO | CTO | Developer | Marketing Lead | Data Analyst |
|----------|-----|-----|-----------|----------------|--------------|
| **Define cohort segmentation** (signup month, source, specialty) | **A** | I | I | C | **R** |
| **Calculate CAC per channel** (ad spend + organic effort / signups) | **A** | I | C | **R** | **R** |
| **Calculate LTV** (ARPU × avg customer lifetime) | **A** | I | C | I | **R** |
| **Track payback period** (months to recover CAC) | **A** | I | I | C | **R** |
| **Monitor cohort retention curves** (Day 1, 7, 30, 90, 180) | C | I | I | I | **R/A** |
| **Analyze churn by cohort** (M0, M1-M3, M3+ churn rates) | **A** | I | I | C | **R** |
| **Build unit economics dashboard** (LTV:CAC, payback, cohort grid) | C | C | **R** | I | **A** |
| **Set up automated cohort reports** (monthly email to CEO) | **A** | I | **R** | I | C |
| **Quarterly unit economics review** (investor-ready metrics) | **A** | C | I | C | **R** |

### Decision Rights

**Strategic Decisions (CEO):**
- Target LTV:CAC ratio (minimum acceptable)
- Maximum acceptable payback period
- Cohort retention targets by month
- When to cut underperforming channels (CAC too high)

**Analytical Decisions (Data Analyst):**
- How to segment cohorts (which dimensions matter)
- LTV calculation methodology (historical vs predictive)
- Churn attribution (voluntary vs involuntary, reasons)
- Which retention metrics to track (D1, D7, D30 vs WAU/MAU)

**Technical Decisions (Developer/CTO):**
- Cohort data storage schema
- Performance optimization for large cohort queries
- Real-time vs batch processing for unit economics

### Communication Flows

**Weekly:**
- Data Analyst → CEO: Cohort health snapshot (latest cohort retention)
- Data Analyst → Marketing Lead: CAC trends by channel

**Monthly:**
- Data Analyst → CEO: Full unit economics report (LTV, CAC, payback, cohorts)
- CEO → Investors: Unit economics summary (if fundraising)

**Quarterly:**
- CEO → All: Unit economics targets vs actuals, strategic adjustments

---

## Core 268: Analytics Implementation & Instrumentation

**Purpose:** Implement event tracking, dashboards, and automated alerts

### Activities & RACI

| Activity | CEO | CTO | Developer | Marketing Lead | Data Analyst |
|----------|-----|-----|-----------|----------------|--------------|
| **Define events to track** (50 events across AARRR) | C | C | **R** | C | **A** |
| **Implement event tracking code** (Mixpanel SDK integration) | I | **A** | **R** | I | C |
| **QA event tracking** (verify all 50 events fire correctly) | I | C | **R/A** | I | C |
| **Set up KPI dashboards** (CEO dashboard, funnel dashboard) | **A** | I | **R** | C | **R** |
| **Configure automated alerts** (critical + warning thresholds) | **A** | C | **R** | I | C |
| **Create alert response playbooks** (what to do when alert fires) | **A** | C | **R** | **R** | I |
| **Monitor dashboard health** (data freshness, accuracy) | I | C | **R/A** | I | C |
| **Monthly analytics audit** (event accuracy, unused events) | C | C | **R** | I | **A** |
| **Quarterly metrics review** (add new metrics, archive old ones) | **A** | C | C | C | **R** |

### Decision Rights

**Strategic Decisions (CEO):**
- Which KPIs matter most (prioritize dashboard focus)
- Alert thresholds (when to notify vs wait)
- Escalation paths (who gets paged for critical alerts)

**Analytical Decisions (Data Analyst):**
- Event taxonomy (how to name/group events)
- Which properties to track per event
- Dashboard layout and visualization choices
- Metric definitions (how to calculate DAU, activation, etc.)

**Technical Decisions (CTO/Developer):**
- Analytics platform choice (Mixpanel vs Amplitude vs GA4)
- Event tracking architecture (client-side vs server-side)
- Alert delivery mechanism (Slack vs email vs PagerDuty)
- Data retention policy

### Communication Flows

**Daily:**
- Developer → Data Analyst: New events deployed to production
- Automated → CEO: Critical alerts (signup drop, payment failures, churn spike)

**Weekly:**
- Data Analyst → CEO: KPI digest (warnings, trends)
- Developer → CTO: Analytics system health (errors, missing events)

**Monthly:**
- Data Analyst → CEO + Marketing Lead: Full analytics review (all KPIs, trends, insights)
- Developer → CTO: Analytics technical debt (deprecated events, cleanup needed)

**Quarterly:**
- CEO → All: Metrics that matter (add new, archive old)
- Data Analyst → CEO: Analytics maturity assessment (coverage, accuracy, usage)

---

## Cross-Core Dependencies

**Core 266 → Core 267:**
- Attribution data feeds CAC calculations (need cost per source)
- Cohort analysis requires source segmentation from attribution

**Core 266 → Core 268:**
- Attribution events are part of the 50-event tracking plan
- Attribution reports live in the KPI dashboards

**Core 267 → Core 268:**
- Unit economics metrics require event tracking (signups, payments, churn)
- Cohort retention curves are built on session/activity events

**All Cores → Stage 3 Documentation:**
- RACI matrices inform SOP ownership
- Decision rights map to escalation paths in SOPs
- Communication flows become "status reporting" sections in SOPs

---

## Approval & Sign-Off

**RACI Reviewers:**
- [ ] CEO (Nasim) - Strategy, decision rights, communication flows
- [ ] CTO (TBD) - Technical feasibility, resource allocation
- [ ] Developer (TBD) - Implementation workload, timeline
- [ ] Marketing Lead (TBD) - Attribution model, channel tracking
- [ ] Data Analyst (TBD) - Metrics definitions, reporting cadence

**Approval Date:** _____________  
**Next Review:** Q1 2027 (or when team structure changes)

---

## Notes

**Team Structure Assumption:** This RACI assumes a lean team (CEO + 4 roles). As Bayan scales, roles may split (e.g., separate Growth Analyst vs Product Analyst, Frontend vs Backend Developer). Revisit RACI when team > 10 people.

**Outsourced Work:** If analytics implementation is outsourced (contractor, agency), the Developer role in this RACI maps to "External Developer" with the CTO as the internal A (accountable for vendor management).

**Tooling Lock-In:** This RACI is platform-agnostic (works with Mixpanel, Amplitude, GA4). SOP-266/267/268 will specify the chosen tools.
