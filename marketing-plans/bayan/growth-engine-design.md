---
title: "Bayan Growth & Revenue Engine — Office-Hours Design Doc"
product: "Bayan Learning (flagship)"
framework: "EMPOWER Business Process Framework (hq.stage3.app, team Bayan) mapped to AARRR"
prepared: 2026-09-26
mode: "Builder / ship-fast"
status: "design — approval pending before any live edits or chatbot spend"
sources: "research.md, master-prompt.md, master-prompt2.md, live hq.stage3.app account (read-only recon 2026-09-26)"
---

# Bayan Growth & Revenue Engine

**Goal (user):** the full pipeline for a growth engine, especially more revenue, built
inside the EMPOWER Business Process Framework, and improve the cores already drafted
(with DeepSeek help).

## Current state (live, read-only recon)

Team **Bayan** — 13 processes, 3 layers, 48 activities. Every process is status `draft`.

**Strategic Planning Layer**
- proc 4 — Vision, Mission & Values Definition — **8 cores** (215 ICP, 216 Segmentation,
  217 Competitive Intel, 218 Value Proposition, 219 Customer Journey, 220 Go-to-Market,
  221 Pricing, 222 Channel/Partnership). All blank scaffolds: 0 activities, generic
  one-line seed descriptions.
- proc 5 — Customer & Market Strategy — 3 cores
- proc 9 — New Product/Service Strategy — 0 cores

**Customer Lifecycle (revenue-generating)**
- proc 12 — Success to Market — 1 core
- proc 13 — Market to Lead — 1 core
- proc 14 — Lead to Sale — **4 cores** (CRM Enrichment, Proposal Generation, Bulk
  Personalised Outreach, Lead Qualification & Scoring). The most-built process.
- proc 15 — Sale to Delivery — **0 cores (EMPTY)**
- proc 16 — Delivery to Success — **0 cores (EMPTY)**
- proc 17 — Success to Lead — **0 cores (EMPTY)**

**Enabling Processes**
- proc 20 — Information & Knowledge Management — 3 cores
- proc 22 — Financial Performance Management — 1 core
- proc 24 — Procure to Pay — 0 cores
- proc 25 — Hire to Retire — 0 cores

## Three findings that shape the engine

### Finding 1 — You built the front of the funnel; the revenue hides in the empty back half.
The Customer Lifecycle is a closed loop: Market → Lead → Sale → Delivery → Success →
(back to Lead). You've populated **Market-to-Lead** and **Lead-to-Sale** (get attention,
close). But **Sale-to-Delivery** (onboarding/activation), **Delivery-to-Success**
(retention), and **Success-to-Lead** (referral/expansion) are all **empty**. For a SaaS
business with thousands of free users and near-zero paid conversion, the money is not in
more lead-gen — it's in activation → trial → paid → retention. Bayan's own stated #1
problem (research.md) is "convert early free adoption into sustainable paid revenue." That
IS Sale-to-Delivery + Delivery-to-Success — the two processes you left at zero cores.
**Build those first.**

### Finding 2 — Lead-to-Sale is a B2B agency motion; the flagship revenue is B2C self-serve.
CRM Enrichment, Proposal Generation, MQL→SQL routing, bulk cold outreach — that's how you
sell a *service* to an institution with a salesperson. Bayan Learning sells subscriptions
to individual IMG exam candidates who self-serve inside the product. Nobody sends them a
proposal. These cores aren't wrong; they belong to a **second, institutional motion**, not
the flagship. Split the engine into two motions:
- **Motion A — Self-Serve (B2C):** the flagship. Product-led. Free → activate → trial →
  paid → retain → refer. This is the empty back-half of the lifecycle.
- **Motion B — Institutional (B2B):** hospitals / universities / training-board pilots.
  This is where Lead-to-Sale's proposals/CRM/qualification legitimately live, and where the
  CEO's *20% of confirmed sale* commission actually pays out.

### Finding 3 — Everything is generic; nothing is Bayan yet.
The 8 strategy cores are blank seed templates and the coach opened by guessing the business
was cold-outreach lead-gen. But you already own the content to fill them — `research.md` has
the ICP (IMG self-funders, SCFHS/OMSB/DHA tracks), segmentation (doctors/residents/nurses ×
exam), competitors (UWorld/AMBOSS/Prometric prep), positioning ("clinician-reviewed,
exam-aligned, adaptive"; "AI assists, humans own"), pricing (free-in-Oman, paid
international), and the founder-credibility spine. The improvement is not to invent content;
it's to **pour the research you already have into the scaffolds and delete the agency
defaults.**

## The measurement gate (do this before trusting any KPI)
Bayan has **zero funnel data** (no MRR / installs / trials / conversion / retention). Every
core's KPI is un-instrumented today. So the first Enabling core to build is **funnel
instrumentation** (analytics + attribution + a baseline snapshot). Until it exists, every
KPI target is marked `[TBD — funnel data]`. This is `research.md`'s #1 open decision, and it
gates any revenue projection.

## Target design — two motions mapped onto your existing 13 processes

**Strategic Planning (fill scaffolds with Bayan facts — no chatbot needed, I can draft all 8):**
| Core | Fill from |
|---|---|
| 215 ICP & Persona | research.md ICP: IMG self-funder + institutional buyer personas |
| 216 Segmentation & Targeting | doctor / resident / nurse × exam track (SCFHS, OMSB, DHA, USMLE-adjacent) |
| 217 Competitive & Market Intel | UWorld, AMBOSS, Prometric prep; Bayan's regional/price wedge |
| 218 Value Proposition & Positioning | "clinician-reviewed, exam-aligned, adaptive"; "AI assists, humans own" |
| 219 Customer Journey & Experience | awareness → trial → paid → retained, per segment (drives Motion A cores) |
| 220 Go-to-Market | Oman-first free, international paid; exhibition + social + app-store |
| 221 Pricing & Monetization | free-in-Oman, paid international; Founder's Offer to convert free base |
| 222 Channel & Partnership | institutional/board partnerships (feeds Motion B) — *cut candidate if short* |

**Customer Lifecycle:**
| Process | Motion A (self-serve, flagship) | Motion B (institutional) |
|---|---|---|
| 13 Market → Lead | organic/social/exhibition/app-store → registered user | institutional lead gen |
| 14 Lead → Sale | **re-scope needed:** Activation/PQL scoring, Paywall/Offer, Lifecycle messaging, Learner segmentation | keep the 4 DeepSeek cores here, re-grounded in Bayan facts |
| 15 Sale → Delivery **(BUILD)** | onboarding: first value fast (weak-area diagnostic), trial setup | pilot onboarding |
| 16 Delivery → Success **(BUILD)** | retention: study cadence, streaks, monthly-active, resubscribe, winback | pilot success / renewal |
| 17 Success → Lead **(BUILD)** | referral: study-group spread, invites, pass-story social proof | case studies, expansion |

**Enabling:**
- proc 20 Knowledge Mgmt → document the **medical-integrity gate** ("AI assists, humans own";
  clinician double-check) as a real core — it's a differentiator, not overhead.
- proc 22 Financial Performance → **funnel instrumentation + unit economics (LTV/CAC)** = the
  measurement gate above.

## Where the revenue comes from (priority order — "especially more Revenue")
1. **Instrument the funnel (proc 22).** Can't grow what you can't see. Baseline first.
2. **Build Sale-to-Delivery + Delivery-to-Success (proc 15, 16).** Activation + trial→paid +
   retention. Converting the *existing free base* is the fastest MRR with zero new ad spend.
3. **Founder's Offer to a slice of the free base.** Generates the first real conversion +
   price-sensitivity data. (This is DeepSeek's "beta transition" idea — kept, it's good.)
4. **Institutional pilots (Motion B, re-scoped proc 14).** Bigger deals; this is where the
   CEO's 20% commission pays and where the raise ladder (Plan 1 → Plan 3/4) gets earned.

## Worked example — one core done right (proc 15 · Sale-to-Delivery · Activation · Motion A)
**Objective:** a newly-registered free user reaches first "exam-ready" value inside session 1.
- **RACI:** R = growth/product; A = founder; C = clinician reviewer; I = CEO (weekly metric).
- **SOP (skeleton):** L1 — on first login, run a 5-question weak-area diagnostic → show a
  personalized "your gap" screen → route to the matching question bank. L2 — day-1 email/push
  with the one next action; capture "reached first value" event.
- **KPIs:** register → first-value rate `[TBD]`; time-to-first-value `[TBD]`; first-value →
  trial `[TBD]`. Instrument before setting targets.

## Using the Sessions Coach (chatbot) — budget plan (40 messages)
The coach runs the EMPOWER assessment and generates core content. Spend the scarce budget on
the **empty, high-revenue** processes, not the ones already drafted.
- **Prime it first** with the Bayan master prompt + key research facts so it stops guessing
  (calling you "Amin", assuming cold-outreach). ~1-2 messages.
- **Run Exercise 3.1 (Sale-to-Delivery assessment)** against Bayan Learning self-serve.
  ~8-12 messages → output populates proc 15.
- **If budget remains,** repeat for Delivery-to-Success (proc 16).
- I author every message before sending so none are wasted, and save each response to disk.

## Implementation order (ship fast)
1. Draft all 8 strategy cores (proc 4) from research.md — no chatbot, no spend.
2. Instrument the funnel (proc 22) — the measurement gate.
3. Build proc 15 + 16 (activation + retention) — the revenue back-half — via coach + drafting.
4. Re-scope proc 14's 4 cores to Motion B, re-grounded in Bayan facts.
5. proc 17 referral + proc 20 integrity gate.

## What to cut if time runs short
- **Cut:** referral (17), Channel/Partnership (222), Procure-to-Pay (24), Hire-to-Retire (25).
- **Keep (minimum revenue engine):** funnel instrumentation + Sale-to-Delivery +
  Delivery-to-Success + ICP/Segmentation/Pricing strategy cores.

## Risks & assumptions
- Zero funnel data → all KPIs `[TBD]` until proc 22 instrumentation ships.
- Free-in-Oman muddies conversion data — segment Oman vs international from day one.
- 40-message coach cap is non-refillable on this account; messages authored before sending.
- Writing into the live account is outward-facing — each write confirmed before it's made.
- Metric drift (research.md: "30+" vs "55 countries") — lock canonical numbers with the CEO
  before any public copy; internal cores may use working figures flagged `[confirm]`.
- Trial-account note: applying the method to your own business is the intended use.

