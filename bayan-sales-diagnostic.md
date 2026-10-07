![[Sales Diagnostic & Assessment Results.html]]
# Bayan Learning — Sales Diagnostic & Assessment Results

**Date:** 2026-10-03
**Method:** EMPOWER-style Sales Process Diagnostic, run against the Bayan workspace files (Master Prompt, CEO marketing plan, B2B track, B2B sizing memo, product-archive pricing doc, Sale-to-Delivery assessment). All revenue/process figures tagged `[verified]` / `[confirm]` / `[unverified]` per Bayan discipline. No figures invented.

---

# ARTIFACT 1: SALES DIAGNOSTIC & ASSESSMENT RESULTS

## Scoring Summary

| Metric | Score | % | Rating |
|---|---|---|---|
| **Process Maturity** | 13/70 | 19% | **Critical** (0–24%) |
| **Owner Independence** | 0/50 | 0% | **Critical** (0–19%) |

## Current Sales Performance Profile

| Field                    | Value                                                                                                                                                    | Basis                           |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Average Sale Value (B2C) | ~$16 blended ARPU `[confirm]` (tiers $9.99–$29/mo; $69–$199/yr)                                                                                          | `conversion-numbers-annex`      |
| Average Sale Value (B2B) | $0 cash year 1 (free 1-yr pilots); per-pilot gross $1,200–$7,200/yr at renewal (20–120 seats × ~$60 blended)                                             | sizing memo §1, §5 `[verified]` |
| Sales Cycle Length (B2C) | Instant (automated checkout)                                                                                                                             | verified                        |
| Sales Cycle Length (B2B) | Weeks–months per account, relationship-first ("friendship first, then proposal"); >12 months to cash (free trial → renewal)                              | sizing memo §5 `[verified]`     |
| Conversion Rates         | **No funnel data exists.** Trial→paid institutional conversion rate is explicitly `[unverified]` — every renewal assumption is a guess                   | sizing memo unknown #5          |
| Monthly Sales Volume     | ~$277 lifetime receipts across ~1,300 registered users (~$0.21/user) `[confirm]`                                                                         | conversion annex                |
| Lead Sources (B2B)       | 100% warm book: institutions already on free 1-yr trials + Oman/MedResearch Academy relationships. Cold outreach explicitly ruled out (CS04: 0.2% reply) | b2b-track §3 `[verified]`       |
| Win Rate (12 mo)         | 0 signed B2B contracts on record; target = one signed lighthouse contract                                                                                | sizing memo §7 `[verified]`     |
| Pipeline Value           | $0 documented active pipeline; warm-book institution count unknown `[confirm]` (sizing unknown #6)                                                       | sizing memo                     |

**Insight:** Bayan has a *sales motion*, not yet a *sales engine*. The Lead-to-Sale SOP exists (rank warmth → book call → tailored one-pager → close/nurture), but every stage after "signed" is an empty process (Sale→Delivery and Delivery→Success are marked BUILD in the growth-engine design). Benchmarks (lead→qualified 13–20%, qualified→proposal 50–70%, proposal→close 20–30%) are meaningless until funnel instrumentation lands — the first job is measurement, not optimization.

## Process Maturity by Area (0–7 each)

| # | Category | Score | Assessment |
|---|---|---|---|
| 1 | Lead Qualification & Scoring | **3** | Warmth-ranking exists in the Lead-to-Sale SOP (score by usage + relationship), but informal and manual; no automated scoring or nurture sequences |
| 2 | Sales Process Documentation | **3** | Lead-to-Sale SOP documented (Level 1 map + Level 2 blueprint) — the one real asset. Stops at "signed"; not yet proven repeatable |
| 3 | CRM & Pipeline Management | **1** | No CRM. Warm-book list to be pulled manually; pipeline tracked in notes/spreadsheets |
| 4 | Discovery & Needs Assessment | **1** | Largely conversational (relationship-first style); no structured framework or documented question set |
| 5 | Objection Handling | **1** | No documented objections or responses; improvised per conversation. Common objections unknown — never systematically captured |
| 6 | Proposal Development & Pricing | **3** | Tailored per-institution one-pagers (not generic deck) — deliberate quality choice. Seat pricing is documented/systematic ($35/$69/$99 per seat, min 20, invoice-based) but contract-value basis unknown `[confirm]` |
| 7 | Performance Tracking & Analytics | **1** | PostHog instrumented for B2C; B2B trial-seat→B2C conversion tracking is a *planned* move, not live. No sales reports exist |
| 8 | Team Training & Development | **0** | No sales team to train; Nasim operates from the SOP doc directly. No formal program |
| 9 | Technology & Tool Integration | **1** | Siloed: email/conversations ↔ manual Supabase seat provisioning. No sales-side automation |
| 10 | Forecasting & Revenue Planning | **1** | No forecasting. SOM scenarios ($5.4k–$86.4k ARR) exist as planning ranges, not forecasts |

## Owner Involvement Analysis (0–5 each)

| Area | Score | Delegation Opportunity |
|---|---|---|
| Lead qualification | 0 | Warmth-ranking is scriptable → delegable to Nasim with SOP |
| Discovery calls | 0 | CEO's relationship-first style is the wedge — keep CEO on first 3 lighthouse calls, record → derive framework |
| Proposal development | 0 | One-pager template → delegable after 2 documented examples |
| Objection handling | 0 | Capture objections from warm-book calls into a living doc |
| Closing | 0 | Keep (CEO sign-off is a hard guardrail anyway) |
| Pricing decisions | 0 | Keep (CEO 20% commission basis + contract value are CEO calls) |
| CRM management | 0 | N/A — no CRM; a shared sheet + SOP suffices at this stage |
| Sales training | 0 | N/A — no team; the SOP *is* the training asset |
| Technology management | 0 | Provisioning SOP → delegable to VA/Nasim |
| Forecasting | 0 | Emerges only after instrumentation (PostHog trial-seat tracking) |

**Risk:** identical to the Sale-to-Delivery finding — the CEO is the entire engine. Capacity is capped at ~10 hr/week for B2B, shared B2C-weighted. Three simultaneous pilot conversations would stall the motion.

## Top 5 Improvement Opportunities (Impact vs. Effort)

1. **Instrument trial-seat → B2C conversion (PostHog)** — Effort: Low · Impact: High · Timeline: 1–2 wks · Priority **9/10**. Turns free pilots from a cost into a measurable acquisition channel; produces the data that currently makes every B2B number unknowable. First step: tag institutional seats in PostHog per the funnel-instrumentation gate.
2. **Pull the warm book + run renewal/expansion on the 2–3 warmest** — Effort: Low · Impact: High · Timeline: 2–4 wks · Priority **9/10**. Fastest path to the verdict-flipping number (avg negotiated contract value per institution) and to one signed lighthouse. First step: pull the free-trial institution list (sizing unknown #6).
3. **Capture contract value per institution from move #2** — Effort: Low · Impact: High · Priority **8/10**. If deals land as flat site/CME licenses, the prize is 10–50× the seat model. First step: add "log the real number" as a mandatory SOP output.
4. **Objection + discovery capture doc** — Effort: Low · Impact: Medium · Timeline: ongoing · Priority **7/10**. Every warm-book call logs objections and budget signals into one doc; becomes the objection-handling framework. First step: add 3 fields to the SOP's call-notes step.
5. **Pilot Welcome Kit + success roadmap** (from Sale-to-Delivery assessment) — Effort: Medium · Impact: Medium · Priority **6/10**. Protects renewal conversion 12 months out. First step: 3-email admin sequence + one-page pilot roadmap.

## Competitive Position Summary

- **Pricing position:** Documented seat prices ($35–$99/seat/yr) with no regional B2B comparator — every regional incumbent (GulfMedExams, StudyPrometric, prometricmcq) is B2C-only. Global institutional sellers (AMBOSS, Lecturio, Osmosis) are contact-sales, not Gulf-exam-specific.
- **Key advantages:** Oman-built, Gulf-exam-specific, clinician-reviewed content (5,589 questions); institutional lane regionally uncontested; existing warm relationships.
- **Key disadvantages:** No proof Gulf institutions buy seat licenses at all `[confirm]` (sizing unknown #4); zero funnel data; free-trial model defers cash >12 months; 10 hr/week capacity.
- **Differentiation opportunity:** "Fits Gulf exams" vs. foreign tools — but unproven demand means the lighthouse contract matters more than positioning polish.

## Capacity & Constraints Analysis

- **Current capacity:** ~2–3 active institutional conversations at once (10 hr/week cap, B2C-weighted).
- **Main scaling constraint:** CEO bandwidth — every stage is owner-executed (0/50 independence).
- **Next hiring trigger:** after lighthouse contract signed + contract-value number known (justifies a dedicated B2B owner beyond Nasim's scoped hours).
- **Customer concentration risk:** **High** — 100% of future B2B revenue sits in an unknown-sized warm book; B2C lifetime revenue is $277 total.

## Implementation Roadmap

- **Quick wins (Weeks 1–4):** pull warm-book list; instrument trial-seat tracking; add contract-value + objection capture to SOP.
- **Medium (Months 1–3):** 2–3 renewal/expansion conversations → one signed lighthouse; Pilot Welcome Kit; proposal one-pager template from real examples.
- **Long-term (Months 6–12):** convert proven motion into delegated owner-independent loop (CS03-style); site-license/CME pricing exploration if contract values justify.

---

# ARTIFACT 2: MASTER PROMPT SALES AMENDMENT

# Sales Process & Performance Profile for Bayan Learning

## Current Sales Structure (Grade: D)

**Sales Team Composition:**
- Team Size: 2 (CEO/owner + Nasim, ~10 hr/week scoped, B2C-weighted)
- Lead Qualification: Nasim (warmth-ranking per Lead-to-Sale SOP)
- Discovery/Demos: CEO (relationship-first conversations)
- Proposal Development: CEO (tailored per-institution one-pagers)
- Closing: CEO (hard guardrail: no outreach/proposal/entitlement change without CEO sign-off)
- Sales Capacity: ~2–3 active institutional conversations; unlimited B2C (automated)
- Owner Involvement: ~10 hr/week B2B share, 100% of B2B deals

**Sales Process Flow (B2B):**
1. Warm list pulled → warmth-ranked (manual, days)
2. Relationship-first call booked (days–weeks)
3. Tailored one-pager proposal sent (days)
4. Contract value captured / signed OR nurtured (weeks–months)
- Average Sales Cycle: weeks–months to signature; >12 months to cash (free 1-yr trial → renewal)
- B2C: instant automated checkout

## Sales Performance Metrics (Grade: F — no data)

**Conversion Rates:** All `[unverified]` — zero funnel data. Benchmarks (13–20% / 50–70% / 20–30% / 2–5%) not yet measurable.

**Pipeline Health:**
- Active Opportunities: warm-book institutions on free trials — count `[confirm]` (unknown #6)
- Total Pipeline Value: $0 cash year 1; renewal upside $5.4k–$86.4k/yr ARR (SOM scenarios)
- Average Deal Size: $1,200–$7,200/yr per pilot (20–120 seats × ~$60), net of CEO 20% commission
- Win Rate (12 mo): 0 signed B2B contracts on record
- Pipeline Predictability: Low · Forecasting Accuracy: None (no forecast process)

**Customer Acquisition:**
- Lead Sources: B2B 100% warm book; B2C organic/direct (55+ countries, 1,300 registered)
- CAC / LTV / LTV:CAC: not measurable; B2C lifetime receipts ~$277 total

## Sales Process Effectiveness (Grade: D)

- Sales Process Documentation: **Basic** — Lead-to-Sale SOP (map + blueprint) exists; post-sale stages undocumented (Sale→Delivery marked BUILD)
- Scripts: None documented (opening, discovery, presentation, closing all conversational)
- Lead Qualification: informal warmth-scoring; no scoring system
- Discovery: conversational, relationship-first; no framework
- Objection Handling: improvised; top objections never systematically captured; no documented responses
- Proposal: tailored one-pagers (deliberate quality choice); creation time days; proposal-to-close rate unknown
- Pricing: systematic seat list ($35/$69/$99, min 20 seats, invoice, 50% off individual); negotiated contract value unknown `[confirm]` — the verdict-flipping number

**Technology & Tools:**
- CRM: none
- Integration: minimal — manual Supabase seat provisioning; PostHog B2C-only
- Automation: B2C checkout ~100%; B2B ~0%
- Analytics: PostHog instrumented (B2C); trial-seat→B2C tracking planned, not live

## Offer Strategy & Performance (Grade: C)

- B2C tiers: Student $9.99/$69 · Nurse $19/$129 · Physician $29/$199 (30-day trial, ~43% annual save) `[verified]`
- B2B: institutional seats min 20, 1-yr free trial; currently free trials to selected institutions
- Best/worst performing offer: unknown — no offer-performance tracking
- Promotions/guarantees: none; **no pass/outcome guarantees ever (hard medical-brand guardrail)**; free access in Oman + humanitarian country list
- Refund rate: not tracked (revenue too small to date)

## Team Development & Training (Grade: F)

- No formal sales training; the Lead-to-Sale SOP is the only teaching asset
- No coaching process or performance reviews; owner-independence layer (CS03) explicitly deferred until motion is repeatable

## Competitive Position (Grade: C)

- Pricing vs competitors: no regional B2B comparator (all regional players B2C-only); global institutional sellers contact-sales
- Price objection frequency: unknown (no documented sales conversations)
- Key advantages: Gulf-exam-specific, Oman-built, clinician-reviewed, institutional lane uncontested regionally
- Key disadvantages: unproven institutional demand `[confirm]`; no logos yet; free-trial model defers cash >12 months
- Differentiation clarity: Medium — wedge defined but not yet validated by a signed contract

**Capacity & Risk:**
- Capacity: 2–3 active conversations
- Main scaling constraint: CEO bandwidth (owner-executed at every stage)
- Customer concentration: High — 100% warm-book dependence; B2C revenue negligible
- Revenue mix: ~100% new (no repeat/renewal revenue yet — first renewals land month 12+)

## Process Maturity Assessment

- **Process Maturity: 13/70 (19%) — Critical**
- **Owner Independence: 0/50 (0%) — Critical**

| Category | Score |
|---|---|
| Lead Qualification | 3/7 |
| Process Documentation | 3/7 |
| CRM & Pipeline | 1/7 |
| Discovery Process | 1/7 |
| Objection Handling | 1/7 |
| Proposal Development | 3/7 |
| Performance Tracking | 1/7 |
| Team Training | 0/7 |
| Technology Integration | 1/7 |
| Forecasting | 1/7 |

## Top 3 Sales Improvement Opportunities

1. **Instrument trial-seat → B2C conversion** (Priority 9/10) — Impact: makes the free-pilot model measurable and produces the unknowns (conversion, contract value) · Effort: Low · Timeline: 1–2 wks · First step: tag institutional seats in PostHog
2. **Warm-book renewal/expansion on 2–3 warmest institutions** (Priority 9/10) — Impact: one signed lighthouse + real contract-value data point · Effort: Low · Timeline: 2–4 wks · First step: pull the free-trial institution list
3. **Objection + contract-value capture in the SOP** (Priority 8/10) — Impact: builds the missing objection framework and the verdict-flipping pricing number from real calls · Effort: Low · Timeline: ongoing · First step: add mandatory "log the real number + objections" outputs to the SOP

## AI Guidance Instructions

When discussing sales strategy, revenue growth, or team development for Bayan Learning, always:

1. **Reference actual metrics:** $0 year-1 B2B cash (free 1-yr trials); $1,200–$7,200/yr per-pilot gross at renewal; ~$16 B2C blended ARPU `[confirm]`; ~10 hr/week B2B capacity; 100% owner involvement.
2. **Prioritize based on assessment:** instrumentation and warm-book conversion before any cold outreach (CS04: 0.2% cold reply); owner-delegation of provisioning/qualification before capacity expansion; leverage clinician-reviewed + Gulf-exam-specific wedge.
3. **Consider constraints:** no CRM, no funnel data, no signed B2B contract yet; CEO sign-off guardrail on all outreach/proposals/entitlements; unproven Gulf institutional demand `[confirm]`.
4. **Apply maturity context:** both scores Critical — recommend measurement and documentation over optimization; the one strong asset is the Lead-to-Sale SOP.
5. **Align with competitive position:** regional B2B lane uncontested but possibly empty; the lighthouse contract validates everything.
6. **Process-specific improvements needed (all areas <5):** lead scoring automation, CRM-lite (even a shared sheet), structured discovery framework, objection library, proposal templates from real one-pagers, trial-seat analytics, SOP-as-training, sales-side automation, SOM-based forecasting once data exists.

---

**Provenance:** Generated 2026-10-03 from `bayan-b2b-sizing-memo.md`, `bayan-b2b-track.md`, `bayan-ceo-marketing-plan.md`, `growth-engine-design.md`, `product-archive/08-pricing-exam-catalog-and-access-model.md`, `research.md`, and the Sale-to-Delivery assessment in this folder. Companion piece: Sale-to-Delivery Assessment (2026-10-03). All unverified figures tagged; no prices or counts invented.
