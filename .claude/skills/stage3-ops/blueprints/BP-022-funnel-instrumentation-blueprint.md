# BP-022: Financial Performance Management Blueprint

**Process:** Proc 22 - Financial Performance Management
**Level:** L2 Blueprint (Strategic Context)
**Cores:** 262 (Analytics Implementation & Event Instrumentation), 263 (KPI Dashboard & Real-Time Monitoring), 264 (Unit Economics & Cohort Analysis)
**Owner:** CEO (Dr. Abdullah Al Alawi)
**Last Updated:** 2026-10-09

> **Core-ID correction (2026-10-09).** This blueprint was drafted against an
> assumed core set. The narrative below (components, flow, risks, timeline) is
> still accurate; only the **labels** were wrong. Read every "Core 266/267/268"
> in the body against this table:
>
> | In the narrative | Live core | Live name |
> |---|---|---|
> | Core 268 (Analytics Implementation) | **262** | Analytics Implementation & Event Instrumentation |
> | Core 266 (Marketing Attribution) | **262** | (attribution is the acquisition half of 262) |
> | Core 267 (Unit Economics) | **264** | Unit Economics & Cohort Analysis |
> | — (previously folded into 268) | **263** | KPI Dashboard & Real-Time Monitoring |
>
> Cores 266/267/268 in fact belong to **Proc 16** (Delivery to Success).
> Live proc 22 processes as "Financial Performance Management" in Stage 3 HQ.
> There is **no** separate Marketing Attribution core: attribution content folds
> into Core 262 as implementation detail.

---

## Executive Summary

**What:** Comprehensive data infrastructure tracking every user from first touch through conversion, enabling real-time visibility into acquisition costs, customer lifetime value, and unit economics sustainability.

**Why:** Without attribution and analytics, Bayan operates blind—spending on channels that may not convert, unable to identify churn drivers, and unable to prove unit economics to investors. This process transforms Bayan from "build and hope" to data-driven growth.

**Expected Impact:**
- CAC visibility per channel within 30 days → cut losing channels, scale winners
- LTV:CAC ratio >3:1 within 90 days → prove sustainable unit economics
- Payback period <3 months → preserve runway, enable aggressive scaling
- Real-time alerts on funnel breaks → fix issues before they compound

**Investment:**
- **Time:** 2-3 weeks full-time developer + part-time data analyst
- **Cost:** $100-300/month (Mixpanel + ad platform APIs)
- **Risk:** Medium (technical complexity, data quality dependency)

---

## Strategic Context

### The Problem We're Solving

**Current state (pre-Proc 22):**
- Marketing spends $X on Google/Facebook/organic → how many paying customers came from each? Unknown.
- Users sign up → which ones activate? Which features predict retention? Unknown.
- Subscribers churn → why? When? Which cohorts are most at risk? Unknown.
- CEO asks "what's our CAC?" → Marketer (Nasim) guesses, no data to back it up.
- Investor asks "what's your LTV:CAC?" → no answer, or answer based on assumptions.

**Consequences:**
- Money wasted on underperforming channels (could be 30-50% of ad spend)
- Product decisions based on gut feel (which features to prioritize?)
- Inability to forecast revenue (don't know cohort retention curves)
- Investor skepticism (no data = higher dilution or rejection)
- Reactive firefighting (discover problems weeks after they started)

**The breaking point:** At $10k/month ad spend, a 20% attribution error = $2k/month wasted. At $50k/month, it's $10k/month. Bayan cannot scale without this.

### The Opportunity

**Best case (Proc 22 fully implemented):**
- Real-time CAC dashboard → discover Google Search converts 3x better than Facebook → shift budget, save $5k/month immediately
- Cohort analysis → October cohort retained 20% better than September → identify why (onboarding change?) → replicate for all future cohorts
- Automated alerts → payment gateway fails at 3 AM → CEO paged within 5 minutes → fix before losing $2k in failed checkouts
- Investor pitch → "Our LTV is $180, CAC is $45, ratio is 4:1, payback is 2.1 months" → credibility +50%, dilution -5%

**Financial impact (conservative estimate):**
- Year 1: Save $30k from cutting bad channels + improve conversion 10% = +$50k revenue → **$80k net impact**
- Year 2: Optimize to LTV:CAC 4:1 (from 2:1) = double customer profitability → **$200k+ net impact**

---

## Core Components

### Core 262 (was labelled 266): Attribution & Source Tracking

**Purpose:** Track every user from first click to conversion so we know which channels work.

**Key mechanisms:**
- UTM parameter capture (utm_source, utm_medium, utm_campaign) persisted through signup
- Referral code attribution (credit referrer for conversion)
- Offline attribution (QR codes on conference materials tracked same as digital)
- Cross-domain tracking (preserve attribution when user goes to Stripe payment page)

**Success metric:** >95% of signups have known source (not "direct")

**What this enables:**
- Marketer (Nasim) can answer "which campaign should we pause?" with data, not gut feel
- CEO can compare cost per signup by channel to decide budget allocation
- Attribution report feeds directly into CAC calculation (Core 264)

**Risks:**
- Users clear cookies → lose attribution (mitigation: backup in email link)
- Multiple devices → same user, two sources (mitigation: first-touch attribution model)
- Ad blockers strip UTM params (mitigation: ~10% of users, acceptable loss)

---

### Core 264 (was labelled 267): Unit Economics & Cohort Analysis

**Purpose:** Calculate LTV, CAC, payback period, and churn by cohort to prove sustainable economics.

**Key mechanisms:**
- Cohort definition (group users by signup month + source + specialty)
- CAC calculation per channel (ad spend / paid customers, not just signups)
- LTV calculation (ARPU × average customer lifetime, or retention-based prediction)
- Payback period (months to recover CAC from cumulative revenue)
- Retention curves (M0, M1, M2, M3, M6, M12 for each cohort)
- Churn analysis (segment by cohort age, reason, geography)

**Success metrics:**
- LTV:CAC ratio >3:1 (sustainable, VC-fundable)
- Payback period <3 months (preserves runway, enables scaling)
- M1 retention >60%, M3 >50%, M6 >40% (SaaS benchmarks)

**What this enables:**
- CEO can pitch investors with "our unit economics are sustainable" + data proof
- Board can decide "should we raise a growth round to scale?" based on payback period
- Marketing can justify higher CAC if LTV is proportionally higher (premium segment)

**Risks:**
- Early cohorts have incomplete lifecycles → predictive LTV less accurate (mitigation: use retention curves)
- Seasonal variance (exam season) skews retention (mitigation: control for seasonality in analysis)
- Small cohorts (<10 users) have high variance (mitigation: flag as "insufficient data")

---

### Core 262 (was labelled 268): Analytics Implementation & Instrumentation

**Purpose:** Implement event tracking, dashboards, and alerts so we have real-time visibility.

**Key mechanisms:**
- 50 events across AARRR funnel (Acquisition, Activation, Retention, Revenue, Referral)
- Mixpanel SDK integration (frontend + backend event tracking)
- 3 KPI dashboards (CEO, Marketing, Product)
- Automated alerts (critical: page immediately, warning: daily digest)
- Alert response playbooks (what to do when alert fires)

**Success metrics:**
- All 50 events tracked with >95% accuracy
- Dashboards load <5 seconds
- Critical alerts fire within 5 minutes of threshold breach
- Alert false positive rate <20%

**What this enables:**
- CEO checks dashboard every morning → knows business health in 30 seconds
- Developer deploys feature → sees adoption within hours (not weeks)
- Payment gateway fails → CEO paged immediately → fix before losing thousands
- Product decides which features to prioritize based on usage data (not guesses)

**Risks:**
- Event tracking code has bugs → data inaccurate (mitigation: comprehensive QA, monthly audit)
- Too many alerts → alert fatigue, ignored (mitigation: tune thresholds quarterly)
- Mixpanel monthly event limit hit → tracking stops (mitigation: monitor usage, upgrade plan proactively)

---

## Process Flow (How The Cores Work Together)

```
User Journey                  Core 262 (attr)         Core 264                Core 262 (events)
─────────────────────────────────────────────────────────────────────────────────────────
1. User clicks ad           → Capture UTM params    →                        → Track page_view
   (Google Search)             (utm_source=google)
                            
2. User signs up            → Store attribution     → User enters cohort     → Track signup_complete
                               in database             (2026-10, google)
                            
3. User activates           →                        →                        → Track aha_moment
   (uses 3 features)
                            
4. User subscribes          →                        → Add to paid cohort     → Track payment_success
   ($29/month)                                        → Count toward Google   → Track subscription_started
                                                         CAC denominator
                            
5. 30 days pass             →                        → Revenue tracked:       → Track session_start (daily)
                                                         Month 0 = $29
                            
6. User churns (Month 3)    →                        → Cohort M3 churn +1    → Track subscription_canceled
                                                      → LTV = $29 × 3 = $87
                            
7. Monthly analysis         → Attribution report:    → Unit economics report: → Dashboard refreshes:
                               - Google: 20 paid       - Google CAC: $42        - CEO sees all metrics
                               - Facebook: 8 paid      - LTV: $87               - Alerts: all green
                               - Referral: 5 paid      - LTV:CAC: 2.1:1
                                                      → ACTION: Google is
                                                         best channel, scale it
```

**The integration:** Core 262 (attribution) feeds Core 264 (CAC), which uses Core 262 (events) to calculate LTV. Cores 264 and 263 both rest on Core 262's event tracking as the data foundation.

---

## Success Criteria

**Phase 1: Foundations (Weeks 1-2)**
- [ ] UTM tracking live in production
- [ ] 50 events tracked and QA'd
- [ ] Mixpanel dashboards built
- [ ] Attribution data flowing into database

**Phase 2: Metrics (Week 3)**
- [ ] First cohort defined and tracked
- [ ] CAC calculated per channel
- [ ] LTV calculation method chosen
- [ ] Unit economics dashboard live

**Phase 3: Optimization (Week 4+)**
- [ ] Automated alerts configured
- [ ] First monthly unit economics report delivered
- [ ] Marketer (Nasim) makes budget decision based on CAC data
- [ ] CEO pitches investor with LTV:CAC proof

**Ultimate success:** CEO can answer "what's our unit economics?" in 10 seconds with data, and the board trusts the answer enough to approve a growth round.

---

## Dependencies & Prerequisites

**Before starting Proc 22:**
- [ ] User authentication system live (need user_id for tracking)
- [ ] Payment gateway integrated (need revenue events)
- [ ] Marketing campaigns running (need traffic to track)
- [ ] Mixpanel account created (need platform for analytics)

**During Proc 22:**
- [ ] Developer available 3 weeks full-time
- [ ] Data Analyst available 1 week part-time
- [ ] CEO available for KPI prioritization (4 hours)
- [ ] Budget approved: $300/month for tools

**Blockers:**
- If attribution not implemented (SOP-262-attribution-tracking) → can't calculate accurate CAC (SOP-264-unit-economics-and-cohort-analysis)
- If events not tracked (SOP-262-event-instrumentation) → can't build cohort retention curves (SOP-264-unit-economics-and-cohort-analysis)
- If payment webhooks not configured → revenue events missing → LTV calculation broken

---

## Resource Requirements

**People:**
- Developer: 3 weeks full-time (implementation, QA, debugging)
- Data Analyst: 1 week part-time (event taxonomy, dashboard design, thresholds)
- Marketer (Nasim): 3 days part-time (UTM taxonomy, campaign tracking, reporting)
- CEO: 4 hours (KPI prioritization, alert escalation paths, targets approval)
- CTO: 2 days part-time (platform selection, technical architecture review)

**Tools:**
- Mixpanel: $25-300/month (depends on event volume)
- Google Ads API: Free (already paying for ads)
- Facebook Ads API: Free (already paying for ads)
- Slack: Free tier sufficient for alerts

**Budget:**
- **Development:** $0 (internal team)
- **Tools:** $100-300/month ongoing
- **Training:** 1 day team training on dashboards (internal, $0)
- **Total Year 1:** ~$2,000

**ROI:** $2k investment → $80k+ Year 1 impact = **40x return**

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Event tracking has bugs → data inaccurate** | Medium | High | Comprehensive QA (SOP-262-event-instrumentation, Procedure 3), monthly audits |
| **Developer underestimates complexity** | Medium | Medium | Break into 3 phases with checkpoints, allow buffer time |
| **Mixpanel event limit hit → tracking stops** | Low | High | Monitor usage at 80%, upgrade plan proactively |
| **Attribution window too short/long** | Low | Medium | Start with 30 days (industry standard), adjust if needed |
| **Small cohorts → high variance in metrics** | High | Low | Flag cohorts <10 users as "insufficient data", don't act on them |
| **Alert fatigue → alerts ignored** | Medium | Medium | Start conservative (few alerts), tune thresholds quarterly |
| **Too much data → analysis paralysis** | Low | Medium | Focus on 5 core KPIs (DAU, LTV, CAC, payback, churn), ignore rest |

**Critical path risk:** If Core 262 (event tracking) fails, the entire process collapses. Mitigation: Do Core 262 first, verify data quality before building dashboards.

---

## Alternatives Considered

**Alternative 1: Manual spreadsheet tracking**
- **Pros:** No code, fast to start, flexible
- **Cons:** Doesn't scale, error-prone, no real-time data, 10+ hours/week manual work
- **Verdict:** Only viable pre-launch (<100 users); after that, technical solution required

**Alternative 2: Google Analytics 4 instead of Mixpanel**
- **Pros:** Free, unlimited events
- **Cons:** 4-8 hour data latency (vs Mixpanel's <1 min), limited user properties, weaker funnel/cohort tools
- **Verdict:** Good for early bootstrapping, but migrate to Mixpanel once revenue >$5k/month

**Alternative 3: Build custom analytics platform**
- **Pros:** Full control, no per-event costs
- **Cons:** 6+ months dev time, ongoing maintenance burden, missed opportunity cost
- **Verdict:** Not viable for early-stage SaaS; buy (Mixpanel) not build

**Alternative 4: Hire agency to build dashboards**
- **Pros:** Fast execution, expert design
- **Cons:** $5k-15k upfront, agency doesn't understand business context, vendor lock-in
- **Verdict:** Consider if internal team lacks time, but prefer internal ownership for agility

**Chosen approach:** Core 262 on Mixpanel (event tracking + dashboards), internal team builds, 3-week timeline.

---

## Timeline & Milestones

```
Week 1: Foundations
├─ Day 1-2: Event taxonomy definition (50 events) [Data Analyst]
├─ Day 3-5: Mixpanel SDK integration + QA [Developer]
└─ Milestone: All 50 events tracked in staging

Week 2: Attribution & Dashboards
├─ Day 1-2: UTM tracking + referral attribution [Developer]
├─ Day 3-4: Dashboard build (CEO, Marketing, Product) [Data Analyst + Developer]
└─ Milestone: Attribution data flowing, dashboards live

Week 3: Unit Economics & Alerts
├─ Day 1-2: Cohort definition + CAC calculation [Data Analyst]
├─ Day 3-4: LTV calculation + payback period [Data Analyst]
├─ Day 5: Automated alerts + playbooks [Developer + Data Analyst]
└─ Milestone: First unit economics report delivered

Week 4: Polish & Handoff
├─ Day 1-2: Monthly audit process documented
├─ Day 3: Team training (how to use dashboards)
└─ Milestone: Process fully operational, team self-sufficient
```

**Critical path:** Event tracking (Week 1) → Attribution (Week 2) → Cohorts (Week 3). Any delay in Week 1 pushes entire timeline.

---

## Post-Launch Operations

**Daily:**
- CEO checks dashboard (5 min)
- Automated alerts fire if thresholds breached

**Weekly:**
- Marketer (Nasim) reviews top 5 channels by signups (15 min)
- Developer spot-checks event accuracy (30 min)

**Monthly:**
- Data Analyst runs unit economics report (4 hours)
- Data Analyst runs analytics audit (2 hours)
- CEO + Marketer (Nasim) review report, decide budget allocation (1 hour)

**Quarterly:**
- Team reviews event taxonomy (add new events, archive unused)
- Team tunes alert thresholds based on 3 months data
- CEO reviews LTV calculation method (switch from predictive to historical?)

**Ongoing maintenance:** ~10 hours/month (mostly Data Analyst), $100-300/month tools

---

## Connection to Broader Strategy

**How Proc 22 enables other processes:**

**→ Proc 16 (Delivery to Success):**
- Activation metrics from Core 262 → identify which onboarding steps predict retention
- Re-engagement alerts (from Core 263) → trigger drip campaign (SOP-257)

**→ Proc 17 (Success to Referral):**
- Referral attribution (Core 262) → calculate referral CAC (negative CAC = reward cost)
- Cohort analysis (Core 264) → identify which users are most likely to refer

**→ Stage 4 (Optimization & Scaling):**
- Unit economics (Core 264) → justify raising growth capital to scale
- Payback period <3 months → enables aggressive customer acquisition

**→ Product roadmap:**
- Feature usage data (Core 262) → prioritize features that drive activation and retention
- Churn reasons (Core 264) → identify product gaps to fix

**The big picture:** Proc 22 is the "central nervous system" of Bayan's growth. Without it, the company operates on instinct. With it, every decision—marketing budget, product roadmap, hiring, fundraising—is backed by data.

---

## Key Decisions Required

**Before implementation:**
1. **Attribution model:** First-touch (recommended), Last-touch, or Multi-touch? → **Decision owner: CEO**
2. **LTV calculation method:** Historical, Retention-based, or Simple? → **Decision owner: Data Analyst** (recommend → CEO approves)
3. **Platform choice:** Mixpanel (recommended), Amplitude, or GA4? → **Decision owner: CTO**
4. **Alert thresholds:** How sensitive should alerts be? → **Decision owner: CEO** (conservative first, tune later)
5. **Cohort segmentation:** Signup month only, or also by source/specialty/geo? → **Decision owner: Data Analyst**

**During implementation:**
6. **Event naming:** Follow what convention? (snake_case, camelCase, past-tense?) → **Decision owner: Developer**
7. **Dashboard access:** Who can view what dashboard? → **Decision owner: CEO**
8. **Playbook ownership:** Who is on-call for critical alerts? → **Decision owner: CEO**

**Decision deadline:** All decisions must be made in Week 0 (pre-implementation kickoff). Changing decisions mid-implementation causes delays.

---

## Success Indicators (6 Months Post-Launch)

**Quantitative:**
- LTV:CAC ratio improved from unknown → 3.5:1
- Payback period measured and stable at 2.5 months
- Marketing budget shifted: Best channel +50% spend, worst channel -80%
- Churn rate dropped 30% (from baseline) by fixing identified issues
- 100% of board meetings include unit economics slide (vs 0% before)

**Qualitative:**
- CEO confidently pitches "our unit economics" to investors (before: avoided topic)
- Marketer (Nasim) makes budget decisions in 10 minutes (before: days of debate)
- Developer prioritizes features based on usage data (before: CEO gut feel)
- Team morale improved: "We know what's working" vs "We're guessing"

**The ultimate test:** Would an investor fund Bayan's growth round based on unit economics data? If yes → Proc 22 succeeded. If no → dig into which metric is broken and fix it.

---

## Appendix: Key Terminology

| Term | Definition | Example |
|------|------------|---------|
| **AARRR** | Pirate metrics: Acquisition, Activation, Retention, Revenue, Referral | Framework for organizing events and metrics |
| **Cohort** | Group of users who signed up in same time period | "October 2026 cohort" = all users who signed up in Oct 2026 |
| **CAC** | Customer Acquisition Cost: total spend / paid customers | $850 ad spend / 20 paid customers = $42.50 CAC |
| **LTV** | Lifetime Value: total revenue per customer over their lifetime | $29/month × 6 months average = $174 LTV |
| **LTV:CAC** | Ratio of LTV to CAC; >3:1 is sustainable | $174 LTV / $42.50 CAC = 4.1:1 (good) |
| **Payback Period** | Months to recover CAC from cumulative revenue | CAC $42.50 / $29 MRR = 1.5 months |
| **Churn Rate** | % of customers who cancel per month | 5 cancel / 100 active = 5% monthly churn |
| **DAU/WAU/MAU** | Daily/Weekly/Monthly Active Users | DAU = users with session_start today |
| **Stickiness** | DAU / MAU ratio; higher = more engaged users | 2,450 DAU / 18,500 MAU = 13.2% |
| **ARPU** | Average Revenue Per User per month | $58,000 MRR / 2,000 users = $29 ARPU |

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-10-06 | Initial L2 Blueprint | Stage 3 Ops Team |

---

## Approval

**Blueprint Owner:** CEO (Dr. Abdullah Al Alawi)

**Reviewed By:**
- [ ] CTO - Technical feasibility, platform selection
- [ ] Marketer (Nasim) - Attribution model, campaign tracking
- [ ] Data Analyst - Metrics definitions, calculation methods
- [ ] Developer - Implementation timeline, resource estimate

**Approved:** _____________ **Next Review:** Q1 2027