# Bayan — 30-Day Conversion-First Plan (v2)

**To:** Dr. Abdullah Al-Alawi · **From:** Nasim & Hiwa · **Date:** 2026-10-04
**Revision:** v2 — folds in everything built since your 2026-09-29 review.

> Same machine already designed in `revenue-integration-strategy.md`,
> `growth-engine-design.md`, and `analytics-events-spec.md` — reordered to put
> **conversion first, traffic last**, exactly as you asked. Nothing here ships
> without your sign-off.

---

## 0. A note on the timing (read first)

You gave us your notes on **29 September**. This plan is **5 days later** than we said it would be. That is on us, and we're sorry.

Here is what those 5 days went into — not more planning, but building:

- A **full live audit** of Bayan's search and AI-answer visibility (measured, not guessed — every "now" number in §6 is what your site scores today).
- **10 exam pages drafted and ready** (Prometric cluster + hub), **6 technical GEO fixes drafted**, **7 Days-31–60 content pieces drafted**.
- A **keyword map** showing exactly which searches you can win at zero difficulty — including one you already rank **#28** for.
- The **measurement spec** the whole conversion plan depends on.

You asked for execution, not frameworks. This revision shows the execution that has already happened, and the four weeks ahead.

---

## 1. Bottom line

You are right. The earlier plan led with traffic (SEO / AI-visibility) for a product whose real problem is that **~1,300 users are already in the door and under 1% pay.** Your arithmetic holds: +500 visits at today's conversion ≈ **+$10–50/mo**; moving the existing base from under 1% to a few percent ≈ **thousands/mo**. We pivot to conversion first.

But there is a structural fact under that under-1% that changes what "conversion" even means:

**A large share of the 1,300 cannot pay — because they already have everything for free.**

Pricing enforcement began **2026-05-01**. Every account created before that date is **grandfathered to full free access, permanently**. Add the 13 humanitarian free-access countries. The real *addressable* base — users who could actually become paying customers — is therefore **far smaller than 1,300**, and we do not yet know its size because the funnel isn't instrumented for trial→paid.

So Week 1 is not "write landing pages and hope." Week 1 is: **measure the funnel, count who is actually convertible, then aim the conversion work at them.** That is the difference between a plan that produces $50/mo and one that produces real MRR.

---

## 2. Why the existing users don't pay (the analysis you asked for)

Five reasons, ranked by how much revenue each blocks. #1–2 are structural — no email fixes them; #3–5 are the fixable levers.

| # | Reason | Evidence | Fixable by marketing? |
|---|---|---|---|
| 1 | **Grandfathering** — pre-May-2026 accounts keep full free access forever | App access rule; enforcement date `2026-05-01` | ❌ Your decision (sunset/convert) — we pull + propose only |
| 2 | **Free-country + wrong-segment** — 13 humanitarian countries free; some users aren't in a paying profession/exam | Access model; free-country list (Oman is *not* on it) | ❌ Removes them from the denominator |
| 3 | **No trial→paid trigger** — no paywall moment, no "your trial ends in 3 days," no upgrade nudge | `revenue-integration-strategy.md`; empty Sale-to-Delivery process | ✅ Core lever |
| 4 | **No nurture / lifecycle** — the 1,300 get no onboarding, no re-engagement. They sign up, hit the 5-Q/day wall, go quiet | `growth-engine-design.md`: Delivery-to-Success is empty | ✅ Core lever |
| 5 | **Price-ladder gap** — jump is free → $9.99–29/mo. No single-exam / exam-window pass for a candidate who needs only one exam | Pricing config | ✅ New low SKU |

**The honest headline:** we can't fully answer "why don't they pay" until Week 1 instruments the funnel and segments the base. But we already know the two biggest blockers are structural, and the three fixable levers are **activation, lifecycle nurture, and a mid-tier price rung.**

**Bonus finding (on-scope, no extra ask):** the official question count appears as **8 different values** across your live surfaces (4,000 / 5,000 / 5,589 / 5,610 / 5,760 / 10,000+ …). That inconsistency actively undercuts landing-page conversion, so locking one number is part of the Week-1 work.

---

## 3. The four-week calendar — concrete, every week

Week 1 is exactly what you specified. **Lead-to-Sale (conversion → revenue) runs every week; Market-to-Lead (content, social, Instagram) builds underneath it.**

### Week 1 — Diagnose + first landing pages
| Deliverable | Done when |
|---|---|
| **Non-payer segmentation report** — split into grandfathered / free-country / **addressable** / unresolved; cross-tab active/inactive | One page: counts + addressable count `A` + `$ at stake` **formula**, not a made-up amount |
| **Funnel event audit (PostHog-first)** — inventory what already emits; build only the gaps; baseline the 6 rates | Existing events inventoried; the 10 core events landing as rows |
| **3 landing pages drafted** — (a) highest-volume winnable exam (SMLE/OMSB), (b) free readiness-diagnostic opt-in, (c) upgrade/pricing page with the moat as hero | 3 pages, compliance-passed, ready for sign-off |
| **Locked question count** — one official number, applied to the pages | Same number everywhere; no 4k/5k/10k drift |

### Week 2 — Activation + trial→paid trigger
| Deliverable | Done when |
|---|---|
| **Onboarding flow** — first-login diagnostic → personalized "your gap" screen → routed to the matching bank | Live; fires the activation event |
| **Trial→paid SOP** — a documented, repeatable sequence: trial-day-1, mid-trial value, 3-days-before-expiry nudge, expiry offer | Written as an SOP Nasim runs; sequence live; sends tracked |
| **Paywall moment** — a clear, non-aggressive upgrade prompt at the 5-Q/day wall | Prompt live; `paywall_hit` + `subscribe_clicked` tracked |

### Week 3 — Reactivate the dormant base + mid-tier SKU + **Market-to-Lead engine**
| Deliverable | Done when |
|---|---|
| **Winback drip to addressable dormant users** — education-based (Bayan's 472 reviewed articles), via email + @BayanMedEd Telegram | Drip live to the addressable cohort only; opens/clicks tracked |
| **Single-exam / exam-window pass SKU** — the missing low rung | SKU live in checkout, priced (you sign the price) |
| **Grandfathering proposal** — count + $ at risk + a gentle convert/sunset option | Written proposal on your desk (no migration without sign-off) |
| **Instagram + social engine — first cohort** — exam-specific content rhythm per exam path (SMLE, OMSB, nursing), reel + carousel cadence, first 2 weeks scheduled | Calendar live; first posts scheduled and tagged to the matching landing page *(built from Nasim's Instagram plan)* |

### Week 4 — Measure, report, decide
| Deliverable | Done when |
|---|---|
| **30-day results readout** — the 6 funnel rates before/after, new paid count, MRR added, cost | One-page scorecard, real numbers |
| **Go/no-go on months 2–3** — what worked, what to double down on, whether to unlock a small paid test | Written recommendation tied to the numbers |
| **Instagram + social — scale decision** — which exam path's content pulled best | Recommendation + month-2 cadence |

---

## 4. What we've already built (so you're not paying for planning)

This is the work finished **before** this document — much of it while you waited.

| Asset | State | What it does |
|---|---|---|
| Brand profile + full site audit | ✅ done | Ground truth for every decision below |
| **AI-visibility audit** (14 prompts × 5 engines) | ✅ scored | Shows exactly where Bayan is invisible (un-branded category questions score 4–7) |
| **Live 90-day plan** (6 moves / 11 items) | ✅ active | The engine this 30-day sprint plugs into |
| AEO audit (score 71, 6 actionable fails) | ✅ ready | The shortest path to a score lift |
| Keyword research | ✅ done | Found the **#28-rank, zero-difficulty** win you already own |
| **6 GEO fixes** (llms.txt, FAQ schema, BLUF, meta, noscript) | ✅ drafted + deploy runbook | Lift AI + Google + Website scores at once |
| **10 Prometric/exam pages** (HUB + 9 exams) | ✅ drafted | The pages that capture the zero-score probes |
| **Days 31–60 content** (7 pieces incl. MRCP, ABG, SMLE-vs-OMSB, OMSB) | ✅ drafted | Owns the uncontested long-tail cluster |
| Social calendar (exam-specific) | ✅ drafted | Rhythm for the Instagram engine above |
| Conversion-first plan + numbers annex + B2B track/sizing | ✅ written | This document and its backups |
| Analytics event spec (vendor-neutral) | ✅ written | The measurement layer Week 1 implements |
| CEO decision briefs (grandfathering, mid-tier price) | ✅ ready | The two decisions only you can make |

**Nothing here needed new headcount or paid spend.** Every item is a draft waiting on your go.

---

## 5. The system underneath — how this keeps working without you

The conversion work above is the *first* win. Underneath it sits one small system that stops the same problem from coming back: **one approved source of truth for Bayan's facts.**

You already have the symptoms today — the question count shows eight different numbers, and the brand reads two ways across your two sites. Every new landing page, Instagram post, or brochure risks re-introducing the drift.

**What it is, at no extra cost to the 30-day sprint:**
- One approved record of every product's numbers, pricing, and brand — that anyone can ask in plain language (English or Arabic).
- An automatic check that flags any live page that disagrees with it.
- **You approve the official numbers once.** After that, no one asks you again.
- It reads your public pages only, and changes nothing without your sign-off.

This is not a separate product pitch — it is the **consistency layer the conversion machine needs**. You declined the bigger "Second Brain" build; we're not re-pitching it. We are keeping the *one* piece the marketing genuinely can't do without: **locked, approved facts** — folded into the Week-1 landing-page work. (The only thing we keep from it is the single locked question count, §3, Week 1.)

---

## 6. UX & design as a revenue lever

Conversion and revenue are not only copy and price — they are **how the product feels in the first 60 seconds.** Bayan's mobile experience is currently costing conversions before any email is opened:

| Metric | Now | Target | Why it matters |
|---|---|---|---|
| Mobile LCP (load) | **5,039 ms** | **< 2,500 ms** | A 5-second load loses the candidate before the first question |
| First-value time | unmeasured | first session | Users who reach value in session 1 convert far higher |
| Paywall → subscribe | unmeasured | measured | The single highest-leverage screen in the funnel |

The design work (already scoped in the growth-engine design doc) focuses on three screens that move revenue directly: **the first-login diagnostic** (activation), **the weak-area "your gap" screen** (the reason to pay), and **the paywall/upgrade page** (the moment of decision). Good UX here raises conversion with **zero added ad spend** — it multiplies every other lever in this plan.

---

## 7. The numbers (specific, as requested)

> ⚠️ Targets are set on the **addressable base**, which Week 1 pins down — not the vanity 1,300. Conversion figures are industry benchmarks; every number is a model with its inputs shown.

**Baseline:** ~1,300 registered · **$277 total revenue to date** · under 1% conversion · funnel uninstrumented.

**Benchmark context (verified 2026-10-01):** freemium free→paid averages **~3.7%** across SaaS, **~2.6%** in EdTech specifically (First Page Sage). "Good" is 4–5%, best-in-class 6–8%. Bayan at under 1% sits below even the EdTech average — the headroom is real. Realistic 90-day range: **3–5% of the addressable cohort.**

**Worked model (scenario — replace `A` with Week-1's addressable count):**

| | Month 1 | Month 2 | Month 3 |
|---|---|---|---|
| Cumulative conversion of `A` | 3% | 5% | 7% |
| If `A = 400` → cumulative paid | 12 | 20 | 28 |
| **New** buyers each month | 12 | 8 | 8 |
| Recurring @ $16/mo → MRR run-rate | $192 | $320 | $448 |
| *Incremental* MRR vs prior month | +$192 | +$128 | +$128 |

The 12/20/28 are **cumulative**; only 12/8/8 are new each month. Recurring → run-rate; one-time pass → receipts, not MRR. Never compare these to the **$277 lifetime** total. `A`, the price, and sub-vs-pass mix are all **[confirm in Week 1]**.

**CAC:** existing-base conversion = **$0 paid media** (no ad spend), but the loaded program cost is real — we report media CAC and fully-loaded CAC separately. New paid acquisition stays at **$0 until the funnel proves it converts organically** (EdTech CAC ~$10–150/signup, ~$50–300/paying customer — only after LTV:CAC ≥ 3:1 is demonstrable).

**Budget:** lifecycle-only for the trial = **$0 ad spend** (email + analytics, existing Telegram / low tiers ~$0–150/mo). A paid test ($300–500) only if Week-4 data justifies it.

**Nasim's fee:** unchanged from last month, paid **at month-end**.

---

## 8. What we are NOT doing now (and why)

| Item | Decision | Why |
|---|---|---|
| SEO / GEO / AI-visibility | **Compounding, later** — trackers keep running, not the lead | Real long-term value, but it pays in weeks-to-months and does nothing for the 1,300 already here |
| Second Brain / Product Brain | **Declined; not re-pitched** | Only the useful core (locked facts + one question number) folded into marketing at no extra cost |
| Turkey trip | **Parked** | No documented ROI case; bring it back only with a specific event/deal that pays for itself |

---

## 9. Guardrails (non-negotiable for a medical brand)

- No pass / outcome guarantees, ever ("on the first attempt" is banned).
- Never bare "AI-powered" — always "AI assists with drafting; humans own what reaches learners."
- "Gulf Licensing Exam Preparation," not bare "Prometric"; no NCLEX/US framing in Gulf copy.
- Verified counts only — one locked question number; nothing invented.
- No fake scarcity / countdown timers around a licensing career.
- Grandfathering is your decision touching real users — **pull + propose only.**
- Draft-first: no page goes live, no email sends, no ad money spent without your sign-off.

---

## 10. What we need from you

1. **The go** to start Week 1 (segmentation + funnel instrumentation + first 3 landing pages) — by end of week.
2. **Nasim's fee confirmation** (unchanged from last month, paid at month-end) — no other budget needed for the sprint.
3. Later, when the data is in: your decision on **grandfathering** and the **mid-tier SKU price** (Week 3).

If you approve, Week 1 ships immediately — the segmentation analysis and the first 3 landing pages in your hands by the end of the week.