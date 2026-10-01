# Bayan — Conversion-First Plan (revised for Dr. Abdullah)

**Prepared:** 2026-09-30 · **Replaces the channel order of:** `bayan-ceo-marketing-plan.md`
**Horizon:** 30-day trial, then months 2–3 · **Primary goal:** paid conversion of the existing base
**Prepared for:** Dr. Abdullah's 2026-09-29 review

> This is the same machine already designed in `revenue-integration-strategy.md`,
> `growth-engine-design.md`, and `analytics-events-spec.md` — reordered to put
> **conversion first and traffic last**, exactly as Dr. Abdullah asked. Nothing here
> is a new framework; it is the back-half of the funnel Bayan already owns, sequenced
> for revenue. Draft-first: nothing ships without CEO sign-off.

---

## 1. Bottom line (read this if nothing else)

Dr. Abdullah is right. The 90-day plan led with traffic (SEO/GEO/AI-visibility) for a
product whose real problem is that **1,300 users are already in the door and <1% pay.**
His arithmetic holds: +500 visits at today's conversion ≈ **+$10–50/mo**; moving the
existing base from 1% → 5% ≈ **thousands/mo**. We pivot to conversion first.

But there is a structural fact under the 1% that changes what "conversion" even means:

**A large share of the 1,300 cannot pay — because they already have everything for free.**

Pricing enforcement began **2026-05-01**. Every account created before that date is
**grandfathered to full free access, permanently** (the app's own access model). Add the
13 humanitarian free-access countries. The result: the real *addressable* base — users who
could actually become paying customers — is **far smaller than 1,300**, and we do not yet
know its size because **the conversion funnel isn't yet instrumented for trial→paid.** (Week 1
inventories what's already emitting — PostHog is listed as connected in the project's
integration status — before building anything new.)

So Week 1 is not "write landing pages and hope." Week 1 is: **measure the funnel, count who
is actually convertible, and only then aim the conversion work at them.** That is the
difference between a plan that produces $50/mo and one that produces real MRR.

---

## 2. Why the existing users don't pay (the analysis Dr. Abdullah asked for)

Five reasons, ranked by how much revenue each one blocks. #1–2 are structural and no email
sequence fixes them; #3–5 are the fixable conversion levers.

| # | Reason | Evidence | Fixable by marketing? |
|---|---|---|---|
| 1 | **Grandfathering** — pre-May-2026 accounts have full free access forever | App access model, rule #3; enforcement date `2026-05-01` | ❌ CEO decision (sunset/convert) — pull + propose only |
| 2 | **Free-country + wrong-segment** — 13 humanitarian countries free; some users aren't in a paying profession/exam | Access model; free-country list (Oman is NOT on it) | ❌ Removes them from the denominator |
| 3 | **No trial→paid trigger** — 30-day trial exists in config, but there's no paywall moment, no "your trial ends in 3 days," no upgrade nudge | `revenue-integration-strategy.md`; empty Sale-to-Delivery process | ✅ Core lever |
| 4 | **No nurture / lifecycle** — the 1,300 get no onboarding, no re-engagement, no education drip. They sign up, hit the 5-Q/day wall, and go quiet | `growth-engine-design.md`: Delivery-to-Success is empty | ✅ Core lever |
| 5 | **Price-ladder gap** — jump is free → $9.99–29/mo full sub. No single-exam / exam-window pass for a candidate who only needs one exam | Pricing config; `revenue-integration-strategy.md` | ✅ New low SKU |

**The honest headline for the CEO:** *we can't fully answer "why don't they pay" until Week 1
instruments the funnel and segments the 1,300.* But we already know the two biggest blockers
are structural (grandfathering + free-country), and the three fixable levers are activation,
lifecycle nurture, and a mid-tier price rung.

**Bonus finding (on-scope, no extra ask):** the official question count appears as **8 different
values** across the live surfaces (4,000 / 5,000 / 5,589 / 5,610 / 5,760 / 10,000+ …). That
inconsistency will actively undercut landing-page conversion, so locking one number is part of
the Week-1 work — this is the useful core of the "source of truth" idea, folded into marketing
at no extra charge.

---

## 3. The 30-day trial — weekly deliverables, not frameworks

Concrete artifacts every week. Week 1 is exactly what Dr. Abdullah specified.

### Week 1 — Diagnose + first landing pages
| Deliverable | Done when (verify) |
|---|---|
| **Non-payer segmentation report** — split the 1,300 by **eligibility** into grandfathered / free-country / **addressable** / unresolved (mutually exclusive), then cross-tab active/inactive *within* each (inactivity is a usage state, not a cohort); the addressable count `A` is the real conversion denominator | One page: eligibility counts + active/inactive cross-tab + `A` + a $-at-stake *formula* (`A × scenario % × verified net price`), not a made-up amount |
| **Funnel event audit (PostHog-first)** — inventory what PostHog already emits; build the `track()` layer + `analytics_events` sink from `analytics-events-spec.md` only for the gaps; baseline the 6 rates | existing events inventoried; the 10 core events landing as rows; trial→paid + activation rates read real numbers |
| **3 landing pages drafted** — (a) highest-volume winnable exam (e.g. SMLE / OMSB), (b) free readiness-diagnostic opt-in, (c) upgrade/pricing page with the moat as hero | 3 pages, compliance-passed, ready for sign-off |
| **Locked question count** — one official number, applied to the pages | Same number on every page; no 4k/5k/10k drift |

### Week 2 — Activation + trial→paid trigger
| Deliverable | Done when |
|---|---|
| **Onboarding flow** — first-login 5-Q weak-area diagnostic → personalized "your gap" screen → routed to the matching bank (first value in session 1) | Live; fires activation event |
| **Trial→paid sequence** — trial-day-1, mid-trial value email, day-3-before-expiry nudge, expiry offer | Sequence live; sends tracked |
| **Paywall moment** — a clear, non-aggressive upgrade prompt at the 5-Q/day wall | Prompt live; `paywall_hit` + `subscribe_clicked` tracked |

### Week 3 — Reactivate the dormant base + mid-tier SKU
| Deliverable | Done when |
|---|---|
| **Winback drip to the addressable dormant users** — education-based (Bayan's 472 reviewed articles), via email + @BayanMedEd Telegram | Drip live to the addressable cohort only; opens/clicks tracked |
| **Single-exam / exam-window pass SKU** — the missing low rung, priced for an IMG self-funder | SKU live in checkout, priced (CEO signs the price) |
| **Grandfathering proposal** — count + $ at risk + a gentle convert/sunset option for the CEO to decide | Written proposal on CEO's desk (no user migration without sign-off) |

### Week 4 — Measure, report, decide
| Deliverable | Done when |
|---|---|
| **30-day results readout** — the 6 funnel rates before/after, new paid count, MRR added, cost | One-page scorecard, real numbers |
| **Go/no-go on months 2–3** — what worked, what to double down on, whether to unlock a small paid-acquisition test | Written recommendation tied to the numbers |

---

## 4. The numbers (specific, as requested)

> ⚠️ **Method note:** targets are set on the **addressable base**, which Week 1 pins down —
> not on the vanity 1,300. Conversion figures are industry benchmarks (SaaS/EdTech freemium),
> cited below. Every number here is a model with its inputs shown, so it can be checked, not a
> promise pulled from air; all targets re-baseline against Bayan's own data once Week-1
> instrumentation is live.

**Baseline (verified):** 1,300 registered · **$277 total revenue to date** · <1% conversion · funnel uninstrumented.

**Benchmark context (sources verified 2026-10-01):** freemium free→paid averages **~3.7%**
across SaaS, and **~2.6% in EdTech specifically** — EdTech sits at the *low* end (First Page
Sage, 80+ clients 2021–2025). General freemium runs 2–5%; "good" is 4–5%, best-in-class 6–8%
(and AI-native products skew to that top band). Bayan at **<1% sits below even the EdTech
average** — the headroom is real. A re-engaged, nurtured base with a working paywall and a
mid-tier SKU realistically reaches **3–5% of the addressable cohort within 90 days.** Note the
Month-1 **scenario** of 3% sits just above the 2.6% EdTech average — on the reasoning that an
activated existing base converts higher than cold EdTech acquisition — but it stays a *scenario*,
not a committed target, until Week-1 instrumentation gives Bayan's own baseline.

**Worked model (illustrative scenario — not a target; replace `A` with Week-1's addressable count):**

| | Month 1 | Month 2 | Month 3 |
|---|---|---|---|
| Cumulative conversion of addressable base `A` | 3% | 5% | 7% |
| If `A = 400` → **cumulative** paid | 12 | 20 | 28 |
| **New** buyers added that month | 12 | 8 | 8 |
| If recurring @ $16/mo → gross MRR run-rate | $192 | $320 | $448 |
| …of which *incremental* MRR vs prior month | +$192 | +$128 | +$128 |
| If one-time exam pass @ $16 → gross receipts that month | $192 | $128 | $128 |

Read this honestly for the CEO: the 12/20/28 are **cumulative** buyers, so only **12 / 8 / 8**
are *new* each month. If the SKU is a monthly subscription, $192/$320/$448 is the **run-rate
level** (incremental lift is +$192/+$128/+$128), not new money each month. If it's a one-time
exam pass, those are **receipts, not MRR** — don't call them MRR. And don't compare any of
these monthly figures to the **$277 lifetime-to-date**: that's a cumulative total over an
unknown window, so compare it only to cumulative receipts over the same window, never to a
monthly run-rate. `A`, the price, and the sub-vs-pass mix are all **[confirm in Week 1]**.

**CAC:**
- **Existing-base conversion (Weeks 1–4) = $0 paid-media — not $0 CAC.** No ad spend, but the loaded program cost (Nasim's fee + any engineering + tooling + payment fees) is real; report media CAC and fully-loaded CAC *separately*. It's still the cheapest MRR available because it converts users already in the door.
- **New paid acquisition:** held at **$0 until the funnel proves it converts organically.** If Week-4 data justifies a test, EdTech CAC runs **~$10–150 per signup/trial and ~$50–300 per *paying* customer** (verified 2026-10-01, EdTech/online-tutoring benchmarks) — only defensible once **LTV:CAC ≥ 3:1** with payback inside 12 months is demonstrable, which needs retention data we don't yet have.

**Budget (two scenarios):**

| Scenario | Ad spend | Tooling | Recommended for |
|---|---|---|---|
| **Lifecycle-only** (default for the 30-day trial) | $0 | email + analytics; use existing Telegram + free/low tiers (~$0–150/mo) | The trial — proves the machine at near-zero risk |
| **+ Paid test** (only if Week-4 data justifies) | $300–500, drafted not funded | same | Months 2–3, on your approval |

**Nasim's fee:** `[PROPOSED — Nasim/Hiwa confirm before sending]` a fixed **30-day trial fee of $____**,
scoped to exactly the weekly deliverables above. Recommended structure for a cost-conscious CEO:
a modest fixed trial fee so the "yes" is easy, with months 2–3 optionally tied to the results the
trial produces. *(This number is the one input the plan cannot invent — it is your decision.)*

---

## 5. What we are NOT doing now (and why)

| Item | Decision | Why |
|---|---|---|
| SEO / GEO / AI-visibility | **Demoted to "compounding, later"** — kept alive (the trackers still run) but not the lead | It's real long-term value, but it pays in weeks-to-months and does nothing for the 1,300 already here. Conversion first. |
| Second Brain / Product Brain | **Accepted the decline; not re-pitched** | Only the useful core (lock one official number) is folded into marketing at no extra charge, because the landing pages need it anyway. |
| Turkey trip | **Parked** | No documented ROI case exists in the record. Not worth defending a soft cost to a CEO in cost-discipline mode. Bring it back only with a specific event/deal that pays for itself. |

---

## 6. Guardrails (non-negotiable for a medical brand)

- No pass / outcome guarantees, ever ("on the first attempt" is banned).
- Never bare "AI-powered" — always "AI assists with drafting; humans own what reaches learners."
- "Gulf Licensing Exam Preparation," not bare "Prometric"; no NCLEX/US framing in Gulf copy.
- Verified counts only — one locked question number; nothing invented.
- No fake scarcity / countdown timers around a licensing career.
- Grandfathering is a CEO decision touching real users — **pull + propose only, never migrate without sign-off.**
- Draft-first: no page goes live, no email sends, no ad money spent without explicit CEO sign-off.

---

## 7. Risks & assumptions

| Item | Status |
|---|---|
| Addressable base size unknown until Week-1 segmentation | ⚠️ The whole numbers model hinges on it — Week 1 pins it before any target is committed |
| Conversion funnel not instrumented for trial→paid (PostHog connected, those events unconfirmed) | ⚠️ Week 1 inventories PostHog first, then fills only the gaps |
| Grandfathering may be most of the base | ⚠️ If so, the fixable denominator is small and the CEO's sunset/convert decision becomes the biggest lever |
| Conversion %s are benchmarks, not Bayan-measured | 💬 Framed as models with inputs shown; re-baselined against real data after Week 1 |
| Retention data absent → LTV unknown | 💬 Blocks any paid-acquisition CAC defense until Week-4 data exists |
| Nasim's fee is a decision, not a derivation | ⚠️ Flagged `[confirm]`; the one input the plan can't compute |
