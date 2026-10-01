# Bayan conversion-first trial — revised numbers annex

**Companion to:** `resources/bayan-conversion-first-plan.md`  
**Status:** Draft for CEO review. Scenario arithmetic is not a forecast, commitment, or authorization to spend.  
**Revision basis:** includes excerpts supplied in `inbox/paste-1-fe13620d.md` through `inbox/paste-7-fe13620d.md` and `inbox/analytics-events-spec-fe13620d.md`.  
**Currency:** the user-supplied `$277` and `$16` are treated as USD for arithmetic only; currency, time period, gross/net basis, and product type require confirmation (**[confirm]**).

## 1. Inputs: source and confidence

| Input | Supplied value | Status / caveat |
|---|---:|---|
| Registered users | 1,300 | CEO-review brief; reconcile to deduplicated account export and cutoff date **[confirm]**. |
| Conversion | <1% | CEO-review brief; exact numerator, denominator, and observation window **[confirm]**. |
| Revenue | $277 total to date | CEO-review brief; currency, date range, payer count, refunds, fees, and gross/net status **[confirm]**. |
| Pre-2026-05-01 free access | Permanent for accounts created before `2026-05-01` | Supplied excerpt cites an app access rule not included in full; verify exact deployed policy and any terms before using. |
| Humanitarian free countries | 13; Oman reportedly not included | Supplied excerpt; actual country list and country-resolution policy **[confirm]**. |
| Addressable non-payers `A` | Unknown | Must be computed only after deduplicating and applying verified entitlement, geography, payment status, and offer-fit rules. |
| Trial | 30 days | Supplied excerpt says it exists in config; live trial and expiry behavior **[confirm]**. |
| Free usage cap | 5 questions/day | Supplied excerpt; actual production behavior **[confirm]**. |
| Existing subscription prices | $9.99–$29/month | Supplied excerpt says this is current price range; verify live plans/currency/contents **[confirm]**. |
| Proposed blended ARPU | ~$16 | Scenario assumption supplied by user; not verified and not necessarily MRR (depends on the mix of one-time vs recurring offers). |
| Tools/lifecycle estimate | $0–$150/month | Supplied estimate only; provider pricing, existing subscriptions, engineering, and fees **[confirm]**. |
| Optional paid test | $300–$500 | Supplied proposed range only; no authorization. |
| Nasim's trial fee | `$____` | Deliberately unfilled; amount, currency, scope, billing terms, and relation to $500 cap **[confirm with Nasim/Hiwa]**. |
| Question counts | 4,000 / 5,000 / 5,589 / 5,610 / 5,760 / 10,000+ among examples | Supplied excerpts list these values and claim eight variants; only six examples are enumerated in the excerpt. Authoritative count and definitions **[confirm]**. |

## 2. Baseline arithmetic from the materialized pasted files

I computed these from the saved paste files, not by trusting the rounded prose claims:

- If the reported `<1%` uses exactly 1,300 as the denominator, `0.01 × 1,300 = 13`; the payer count is therefore **fewer than 13**. It is not a verified payer count, because the rate window and numerator are missing.
- `$277 ÷ 1,300 = $0.2130769…`, or approximately **$0.2131 per registered user** across an unknown "to date" window. This is not ARPU, ARPPU, MRR, LTV, or revenue per *eligible* user.
- The pasted "+500 visits at today's conversion ≈ +$10–50/month" cannot be checked without the per-payer price, conversion window, repeat/retention behavior, and acquisition source. It illustrates missing inputs, not an evidence-based result.
- "1% → 5% on 1,300 = thousands/month" depends on all 1,300 being eligible and the $/payer being recurring. At a hypothetical $16/month: 1% ≈ 13 payers ≈ `$208` gross run-rate; 5% ≈ 65 payers ≈ `$1,040`; the gap is `$832` gross monthly run-rate, before fees, refunds, churn, and eligibility exclusions. This is a hypothetical on an invalid-until-verified denominator, not a Bayan projection.

## 3. Cohort segmentation: the denominator to calculate

The conversion denominator is **not** 1,300. Deduplicate the account export, then assign every account to exactly one mutually exclusive eligibility group at a fixed snapshot date:

- `G` — **grandfathered**: created before `2026-05-01`, holding permanent free access under the confirmed policy.
- `F` — **free-country**: eligible for humanitarian free access under the confirmed country list, excluding any already counted in `G` by a documented precedence rule.
- `A` — **addressable non-payer**: a unique, non-paying account with an eligible location/entitlement and a verified matching paid offer. This is the real conversion denominator.
- `U` — **unresolved**: missing/ambiguous access, country, duplicate, payment, or offer-fit evidence. Excluded from the paid denominator until resolved.

After deduplication, `G + F + A + U = 1,300` only if the supplied total is confirmed against the export. Report counts, shares, cutoff date, source, and rules for each group.

**Engagement is a separate dimension.** Active / inactive / unknown is a cross-tab *within* each group, defined by an agreed activity window and event — not a fifth bucket. `G`, `F`, and `A` can each contain inactive accounts. "Wrong segment" is a declared-intent/offer-fit attribute to check, not a reason to silently drop a user.

## 4. The supplied scenario model (illustrative — not a target)

The supplied material proposes a cumulative conversion scenario of **3% / 5% / 7%** over three months on an addressable base, at a blended **~$16**. For arithmetic only I use `A = 400` as a placeholder; replace it with the Week-1 addressable count before any number here is used.

### If `$16` means a monthly recurring subscription price

| | Month 1 | Month 2 | Month 3 |
|---|---:|---:|---:|
| Cumulative conversion of `A` | 3% | 5% | 7% |
| Cumulative paid (`A = 400`) | 12 | 20 | 28 |
| **New** buyers that month | 12 | 8 | 8 |
| Gross MRR **run-rate level** | $192 | $320 | $448 |
| *Incremental* MRR vs prior month | +$192 | +$128 | +$128 |

All calculations are before churn, refunds, payment fees, taxes, variable service/content costs, and Nasim/tools/engineering costs. Actual retained MRR requires verified subscription billing and churn. Read two things honestly: the 12/20/28 are **cumulative** buyers, so only **12 / 8 / 8** are *new* each month; and `$192/$320/$448` are **run-rate levels**, not new money added each month — the incremental additions are **+$192 / +$128 / +$128**. Month 1's `$192` does **not** exceed the `$277` lifetime-to-date — and in any case the two are not comparable (see "Compare like with like").

### If the `$16` product is a one-time exam pass

Then `$192 / $320 / $448` are **cumulative gross receipts** by each milestone, **not MRR** — do not call them MRR. Added receipts between milestones are `$192 / $128 / $128`. There is no run-rate; a one-time pass does not recur.

### If the offer mix includes both subscriptions and passes

Report three separate quantities, never one blended "revenue" number:
- **MRR** = active recurring subscriptions × net monthly price (after churn).
- **One-time receipts** = exam-pass units × net pass price, in the month collected.
- **Net contribution** = receipts − (payment fees + variable service/content cost) per unit.

### Compare like with like

Never compare a monthly MRR run-rate to the `$277` lifetime-to-date. First establish the window the `$277` covers; then compare it only to cumulative receipts over the same window. Monthly run-rate vs lifetime total is a category error, not a result.

## 5. Target policy: how a scenario becomes a target

The 3% / 5% / 7% figures are **proposed scenarios from the supplied material, not committed targets** and not a forecast. They become targets only after Week-1 instrumentation gives Bayan's own baseline on the fixed addressable denominator.

**Benchmark context (verified 2026-10-01, First Page Sage, 80+ clients 2021–2025):** freemium free→paid averages **~3.7%** across SaaS and **~2.6% in EdTech specifically** — EdTech sits at the low end. "Good" is 4–5%; best-in-class 6–8% (AI-native products skew toward that top band). Bayan at **<1% sits below even the EdTech average**, so the headroom is real. A re-engaged, nurtured base with a working paywall and a mid-tier SKU can plausibly reach **3–5% of the addressable cohort within 90 days**. The Month-1 scenario of 3% sits just above the 2.6% EdTech average on the reasoning that an *activated existing base* converts higher than cold acquisition — but it stays a scenario until measured.

A benchmark explains why the headroom exists; it does **not** validate 3/5/7% for Bayan over 90 days. Only Bayan's own instrumented baseline can do that.

**Data gate (turn scenario → target):** fixed `A`; baseline numerator and denominator with closed date windows; verified net price; recurring-vs-one-time product mix. Until those four are known, every rate here is illustrative.

## 6. Revenue model: keep the two streams separate

- **Recurring (subscription):** report **new MRR** from active subscriptions only; adjust for churn with verified matched-period data. Never fold one-time receipts into MRR.
- **One-time (exam/window pass):** report **collected receipts** in the month collected. These are not MRR and carry no run-rate.
- **Net, not gross:** subtract payment fees, refunds, taxes, and variable service/content cost per unit before calling anything "revenue retained."

## 7. CAC and unit economics

- **Existing-base conversion (Weeks 1–4): $0 paid media is not $0 CAC.** No ad spend, but the fully-loaded program cost is real — Nasim's fee + any engineering + tooling + payment fees. Report **media CAC and fully-loaded CAC separately**. It remains the cheapest MRR available because it converts users already in the door.
- **New paid acquisition:** held at **$0 until the funnel proves it converts organically**. If Week-4 data justifies a test, EdTech CAC runs **~$10–150 per signup/trial and ~$50–300 per paying customer** (verified 2026-10-01). It is defensible only once **LTV:CAC ≥ 3:1** with payback inside 12 months is demonstrable — which needs retention data Bayan does not yet have.
- **LTV:CAC cannot be claimed before retention and margin data exist.** State it as a guardrail, not a measured ratio.

## 8. Monthly budget scenarios

The canonical live plan records a **$500/month planning cap** and 10 hours/week; this does not establish cash authorization, actual available cash, current spend, or who can do engineering. The `$0–150` tooling and later `$300–500` paid test are **proposals**, not confirmed quotes or approved spend.

### Lifecycle-only (proposed default for Month 1)

| Line | Amount | Basis |
|---|---:|---|
| Paid media | $0 | No acquisition spend in the trial. |
| Email / analytics / tools | $0–150/mo | Estimate only, not verified. Check existing PostHog + current subscriptions before adding any cost. |
| Nasim fee | `$____` | **[confirm with Nasim/Hiwa]** — the one input the plan cannot compute. |
| Engineering / data | TBD | Supplied Phase-0 estimate is 5–7 workdays before copy; owner availability **[confirm]**. |
| Transaction fees | variable | Per-payment; applies only once there are payers. |
| **Total** | **≈ $0–150/mo + Nasim fee + any engineering** | Fully-loaded, not media-only. |

### Optional paid test (Months 2–3 only; not approved)

Only if Week-4 data justifies it. Two ways it could fit:
- **Inside the $500 cap:** permitted media is at most `max(0, $500 − confirmed non-media costs)`. A $300 test fits only if non-media costs ≤ $200; a $500 test fits only if non-media costs = $0.
- **Above the cap:** requires a separately approved higher cap.

**No paid campaign is justified until the baseline is measured** and an allowable CAC is computed from verified net contribution and incremental conversions.

## 9. Nasim's fee and commercial terms

Nasim's 30-day trial fee is **`[PROPOSED — Nasim/Hiwa confirm: fixed 30-day trial fee of $____]`**, scoped to exactly the weekly deliverables in the plan. Currency, gross/net basis, included deliverables, and whether it sits inside the $500/month cap all require confirmation **[confirm]**. Recommended structure for a cost-conscious CEO: a modest fixed trial fee so the "yes" is easy, with months 2–3 optionally tied to the results the trial produces. **This number is the one input the plan cannot invent — it is Hiwa/Nasim's decision.**

## 10. Cited benchmark context

1. **Freemium conversion — First Page Sage (verified 2026-10-01, 80+ clients 2021–2025):** free→paid ~3.7% SaaS, ~2.6% EdTech; "good" 4–5%, best-in-class 6–8%. Used in §5 as *context for why headroom exists*, never as proof of a Bayan target. (This replaces an earlier unverified ChartMogul/ProductLed "8% median" figure and a Baymard cart-abandonment figure that were in a prior draft of this annex — both dropped as unverified and inconsistent with the plan's benchmark.)
2. **EdTech CAC — ~$10–150/signup, ~$50–300/paying (verified 2026-10-01).** A separately circulated "$30–$80 blended low-ticket MENA CAC" figure is **excluded — no verifiable source.**
3. **LTV:CAC ≥ 3:1 with ≤12-month payback** is an industry **guardrail**, not a Bayan-measured ratio. It gates paid acquisition; it does not describe current performance.

## 11. Decisions and data needed before any target or spend

| # | Needed | Owner |
|---|---|---|
| 1 | Deduplicated account export → fixed `G/F/A/U` counts + `A` | Data/engineering **[confirm]** |
| 2 | Exact grandfathering + free-country policy from the authoritative source | CEO / product |
| 3 | Baseline conversion numerator, denominator, closed date window | Data (post-instrumentation) |
| 4 | Verified net price + recurring-vs-one-time product mix | CEO / product |
| 5 | Nasim's fee (amount, currency, basis, cap relationship) | Nasim / Hiwa |

Nothing in this annex authorizes spend, messaging, entitlement changes, or a committed target. Every rate is a model with its inputs shown, re-baselined against Bayan's own data once Week-1 instrumentation is live.
