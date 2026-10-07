[[03.Projects/AITransforms/marketing-plans/bayan/bayan-conversion-first-plan-magister v3|bayan-conversion-first-plan-magister v3]]
![[deepseek_html_20261003_b7842a.html]]
# Bayan — 30-Day Conversion-First Trial (revised)

**Revision:** Updated after the CEO-review material was supplied in `inbox/paste-1-fe13620d.md` through `inbox/paste-7-fe13620d.md` and `inbox/analytics-events-spec-fe13620d.md`.  
**Status:** Draft for Dr. Abdullah's review only. The live canonical marketing plan is not changed by this file. Nothing here authorizes publishing, customer messaging, changing entitlements/prices, deploying product changes, or ad spend.  
**Trial:** 30 days after approval; start date **[confirm]**.  
**Business objective:** establish the actually addressable user cohort and convert its eligible members before paying to acquire more traffic.  
**Scope owner:** Nasim's time, role, and delivery capacity **[confirm]**; engineering/data owner **[confirm]**; clinical reviewer **[confirm]**.

## Executive recommendation

**Lead with the denominator, not a traffic target.** The CEO-provided brief reports 1,300 registered users, less than 1% conversion, and $277 total revenue to date. Supplied planning excerpts also report that accounts created before **2026-05-01** have permanent free access and that 13 countries receive humanitarian free access. If those rules are confirmed against the authoritative product policy, those users should not be treated as ordinary missed purchase opportunities. The addressable base could therefore be substantially smaller than 1,300. Its size is unknown until a deduplicated account-level entitlement and country audit is completed.

Keep grandfathered access intact unless the CEO explicitly decides otherwise after reviewing the source terms and user impact. Do not include those accounts in the paying-opportunity denominator under the current policy. Treat country eligibility the same way. “Inactive” is an engagement state that can overlap any access group, not an eligibility category. “Wrong segment” is a hypothesis to check against declared exam interest and actual offer fit, not a reason to silently remove users.

The funnel is reported as uninstrumented in the supplied strategy excerpt, but Bayan already has a PostHog connection in the project's integration status. Therefore Week 1 first checks existing PostHog/payment/product events and the complete event specification; build a new `track()` layer and Supabase sink only if an inventory shows they are needed. The supplied `analytics-events-spec` excerpt names the work and a 10-event completion criterion, but does not include the actual event schema.

The 30-day trial has four weekly deliverable sets: (1) cohort and event audit, three full landing-page drafts, and a content-count reconciliation; (2) draft activation and trial-to-paid concepts; (3) draft reactivation and a low-tier product proposal, plus a grandfathering impact memo; (4) a measured readout and CEO go/no-go. Deployment, payment changes, access-policy changes, and outbound messages remain approval-gated.

## What the supplied data supports—and what it does not

The supplied materials offer useful working hypotheses: legacy free access, country-based access, absent or weak trial prompts, lifecycle gaps, and a possible price-ladder gap. They do **not** yet rank causes by revenue blocked. We need cohort counts and funnel data before claiming which factor is largest or that any particular intervention will lift conversion.

| Hypothesis from supplied excerpt | Evidence supplied | What to verify before treating it as a fact | Safe trial response |
|---|---|---|---|
| Pre-2026-05-01 accounts have permanent full free access | Excerpt cites “App access model, rule #3” and enforcement date `2026-05-01`; underlying source not in the excerpts | Read exact entitlement rule, scope, grandfather cutoff, whether it is user-visible/contractual, and any exceptions | Count and report separately; do not sunset, migrate, or message a conversion offer that removes an existing right. Any optional additive offer needs CEO review. |
| 13 humanitarian countries get free access; Oman is not on the list | Excerpt states the count and Oman exclusion; the country list itself is absent | Retrieve the authoritative country list and current country-resolution rule; verify how users with missing/changed country are treated | Exclude policy-free eligible accounts from paid denominator; retain an unresolved bucket for unknown country. Do not infer residence from nationality/IP. |
| Some signups do not match a paying profession or available exam | Narrative hypothesis in pasted material | Verify user-declared profession/exam interest and live offer coverage; don't infer from demographic proxies | Cross-tab segment/intent. A mismatch is not necessarily ineligible until product offer fit is checked. |
| 30-day trial exists, but no trial-to-paid trigger/paywall prompt | Excerpt cites pricing config and `revenue-integration-strategy.md`; source files were not included in full | Inspect actual deployed/configured trial, payment state, current prompts, cancellation/expiry behavior | Draft trigger and UX; do not deploy or alter entitlements before exact approval. |
| No onboarding/nurture; a 5-question daily limit is the first wall | Excerpt cites `growth-engine-design.md`; underlying flow and logs not supplied | Read current app behavior, message history/consent, actual daily limit and its event coverage | Draft first-value onboarding and gentle wall prompt; do not send lifecycle messages until the exact audience, content, consent basis, and timing are approved. |
| Free-to-subscription price jump; no single-exam pass | Excerpt reports `$9.99–29/mo` subscriptions and missing exam pass | Verify current currency, live prices, plan contents, payment completion, purchase mix, refunds | Prepare a priced-offer decision brief only after price and contribution data; no SKU creation before CEO approval. |
| Eight different question-count values are visible | Excerpt says 8 values, listing examples `4,000 / 5,000 / 5,589 / 5,610 / 5,760 / 10,000+`; complete inventory and source-of-truth query absent | Query the authoritative content database and enumerate all live surfaces, timestamps, and definitions (active, reviewed, total, etc.) | Reconcile one approved definition/number; use it in new drafts only after clinical/data sign-off. Do not replace live claims before approval. |

### Cohort model

Use two dimensions so the cohort math is valid:

**Mutually exclusive entitlement/eligibility group** for a fixed account snapshot:

- `G` — grandfathered under the confirmed policy.
- `F` — eligible for free-country access under the confirmed policy, excluding G by a documented precedence rule.
- `A` — addressable non-payer: a unique, non-paying account with an eligible location/entitlement and a verified matching paid offer.
- `U` — unresolved access, country, duplicate, payment, or offer-fit evidence. Exclude from the paid denominator until resolved.

After deduplication: `G + F + A + U = 1,300`, if the supplied total is confirmed against the account export. Report counts, shares, cutoff date, source, and rules. The conversion denominator is fixed `A`, not all registered users.

**Engagement state** as a cross-tab over each group: active / inactive / unknown, defined with an agreed activity window and event. Inactive is not an extra mutually exclusive group; `G`, `F`, and `A` can each include inactive accounts. “Wrong segment” remains a separate declared-intent/offer-fit attribute.

## 30-day trial: four weekly deliverable sets

### Week 1 — Diagnose, instrument only the gaps, and draft the three paths

**Deliverables**

1. **Non-payer segmentation report.** Reconcile the reported 1,300 accounts into `G / F / A / U`; cross-tab active/inactive status. Show counts and percentages, access rule, snapshot date, evidence source, definition of inactivity, and addressable base `A`. Include a formula for “$ at stake,” not a made-up amount: `A × scenario conversion × verified net price/contribution`. Do not change the grandfathering or free-country policy.
2. **Funnel/event inventory.** Inspect existing PostHog data, product/payment events, current trial/paywall config, and the complete `analytics-events-spec.md`. Determine whether the app already emits usable events. If not, draft the smallest approved implementation plan: `track()` → one defined sink → the 10 named core events → six funnel rates. The excerpt provided does not list the 10 event names or six rates; retrieve and approve that schema before coding. Verify rows and dashboard against test events, not zeros or estimates.
3. **Three full-copy landing-page drafts:**
   - (a) one exam-specific path selected from verified coverage and the highest-volume eligible user intent from the segmentation; OMSB/SMLE are candidates to assess, not selected targets until evidence supports them;
   - (b) a proposed free readiness-diagnostic opt-in page; the suggested “50-question” diagnostic remains a product/content proposal until its length, scoring, clinical review, privacy/data handling, and delivery are verified;
   - (c) an upgrade/pricing page using only substantiated evidence of clinician review and content quality. Do not promote the unverified `20-point rubric`, dated PMID process, or question count until the clinical/data owner verifies them.
4. **Question-count reconciliation.** Query the source of truth, enumerate conflicting values across live surfaces, and propose one defined number (e.g., questions reviewed vs total questions). Apply it only to the new drafts pending clinical/CEO approval; production copy changes require approval.

**Owners:** Nasim drafts the report and copy; data/engineering owner **[confirm]** supplies access/event evidence; clinical reviewer **[confirm]** verifies medical/content claims; CEO decides policy and offer questions.

**Capacity gate:** the supplied Phase 0 excerpt estimates 2–3 days for event instrumentation, 1–2 days for the dashboard, 1 day for count reconciliation, and 1 day for grandfathering analysis, before the three page drafts. These are 5–7 estimated workdays before copy work, while the existing live plan records 10 hours/week total planning bandwidth. Owner availability and what “day” means are unknown. Do not promise Week 1 completion without confirming engineering/data capacity; if capacity is limited, prioritize policy/cohort readout and event inventory, and mark the other outputs explicitly in progress rather than silently dropping verification.

**Done when:** cohort arithmetic reconciles or the unresolved count is explicit; usable event coverage is known; all three page drafts are fact-checked or show `[confirm]`; one question-count definition is proposed with source evidence; nothing is live.

### Week 2 — Activation and trial-to-paid: prepare, do not deploy

1. Draft an onboarding concept: first-login diagnostic or first useful practice action → clear feedback → link to the relevant verified question bank. Do not assert the five-question/day cap until the product behavior is checked. Avoid clinical personalization claims beyond what the product actually measures.
2. Draft an opt-in lifecycle sequence for a verified 30-day trial, if the current trial is confirmed: first-day orientation, mid-trial useful content, a reminder before expiry, and an expiry/plan-choice message. The trial length, trigger events, audience, consent state, sender system, and suppression/cancellation behavior must be verified. Do not send.
3. Draft a non-coercive upgrade prompt for any confirmed usage limit. Use transparent terms and a clear route to compare plans; no artificial urgency or countdown tied to licensing outcomes.
4. Specify events and guardrails for activation, trial start/expiry, paywall display, plan selection, checkout, successful payment, failure/refund, and unsubscribe only after checking the authoritative event spec. Do not invent event names.

**Done when:** product and lifecycle mockups/copy are review-ready, with current-state facts sourced and deployment/outbound still off pending CEO, clinical, privacy/consent, and engineering sign-off.

### Week 3 — Reactivation, price-ladder proposal, and grandfathering memo

1. Draft a permission/consent-aware education sequence for verified, addressable dormant users only. The supplied excerpt suggests Bayan's 472 articles and email plus `@BayanMedEd` Telegram, but article count, rights to contact each account, list membership, and channel operation must be checked. No email, direct message, or Telegram send in this phase.
2. Prepare a single-exam / exam-window-pass pricing brief: candidate audience, proposed entitlement and duration, comparison with the verified subscription plans, refund/payment constraints, contribution calculation, and a CEO-set price field. This is a proposal, not a live SKU. Do not price it for an assumed IMG persona without research.
3. Deliver a grandfathering impact memo: eligible count, revenue scenarios under clearly stated assumptions, support/trust/legal risks, and options that preserve existing access. The recommendation is to leave permanent access unchanged unless the CEO, after reviewing the policy and user impact, chooses otherwise. No migration, sunset, or contact without an explicit approved decision.

**Done when:** all outputs identify their verified basis and unknowns; outbound and product mutations remain disabled.

### Week 4 — Readout and CEO go/no-go

Deliver a one-page scorecard with the fixed-cohort count, six agreed funnel rates (once schema is confirmed), numerator/denominator and closed date windows, first-time paying users, collected receipts, refunds/failures, and instrumentation coverage. Separate observed conversion from incremental effect; use a holdout/control only if feasible and approved. Show total trial cost, including Nasim, engineering, tools, and any authorized media, with the actual period and amounts. Recommend stop / revise / continue for months 2–3. No scale recommendation based on page views, open rates, or a reclassified denominator alone.

## Measurement and target policy

Do **not** commit the supplied 3% / 5% / 7% rates as Bayan targets before Week 1. They are scenarios in the CEO-review material, not Bayan-measured rates and not validated by the cited SaaS benchmark. The live addressable denominator, baseline numerator, measurement window, price, and recurring-versus-one-time product mix are unknown. The annex shows the arithmetic both ways and defines the exact data gate for turning a scenario into a target.

Primary metric: unique addressable non-payers at the fixed cutoff who complete a first successful paid transaction within the agreed observation window, divided by fixed `A`. Show numerator and denominator. For a recurring plan, report new MRR from active subscriptions separately; for an exam-window pass, report one-time receipts, not MRR. Adjust for refunds and churn only using verified matched-period data. Do not compare lifetime revenue to monthly revenue.

## Budget, staffing, and CAC decision

The canonical live plan records a **$500/month planning cap** and 10 hours/week; these do not establish cash authorization, current spending, or who can do engineering. The supplied proposal suggests lifecycle/tooling costs of `$0–150/mo` and a later `$300–500` paid test, but those amounts are estimates, not confirmed provider quotes or approved spend.

- **M1 default:** $0 paid media. Use read-only checks of connected PostHog first. Any new email, analytics, engineering, or payment-provider cost is **[confirm]**.
- **Later paid scenario:** $300–500 is only a proposed range, not approved. If it must fit inside the existing $500 cap, permitted media is at most `max(0, $500 − confirmed non-media costs)`; a $300 test fits only if non-media costs are no more than $200, and a $500 test fits only if they are zero. Otherwise it requires a separately approved higher cap. Do not spend until an allowable CAC is calculated from verified net contribution and incremental conversions.
- **CAC:** no-ad media spend is $0; that does not make fully loaded acquisition/program cost $0. Include Nasim, engineering, tooling, content production, transaction costs, and media when dividing by incremental first-time purchasers. LTV:CAC cannot be claimed before retention and margin data exist.
- **Nasim fee:** propose a fixed 30-day scope only after Nasim/Hiwa confirm the actual amount, currency, payment basis, included deliverables, and whether it sits inside the $500 cap. Keep **`[PROPOSED — Nasim/Hiwa confirm: fixed 30-day fee = $____]`** in the email until then. No invented fee.

## SEO/GEO, travel, Second Brain

SEO, GEO, and AI-visibility assets are **compounding, later**. Preserve useful drafts and existing trackers, but do not lead with new traffic acquisition until conversion measurement and offer economics are sound. Do not claim they do nothing for current users; their role is longer-term demand and discoverability, not a substitute for fixing the measured existing-user path.

Turkey travel is parked: no documented event/deal, approved business case, or cost/return evidence is available in the material reviewed. Second Brain is declined and will not be re-pitched. A one-time question-count reconciliation is retained as a direct conversion-copy quality task, not a new knowledge system or added program.

## Brand, privacy, and release controls

- Use “Gulf Licensing Exam Preparation,” not “Prometric” as a standalone category/brand label; avoid NCLEX/US framing in Gulf-focused copy unless an independently verified audience/page requires it.
- No pass, success, or clinical-outcome guarantees; no fake scarcity/countdowns; no unsupported claims about AI functionality. Keep clinician review and human responsibility accurate.
- Verify all question/article counts, plan prices, entitlements, trial terms, event behavior, and diagnostic scoring before they appear as facts.
- Use minimum necessary account data for segmentation; confirm internal access, retention, and applicable privacy/consent basis before exporting or targeting users.
- All landing pages, onboarding/paywall concepts, lifecycle messages, pricing/SKU changes, user access changes, and campaigns remain drafts until the exact audience, content/mutation, timing, costs, and owner are approved. No email, social message, public page, production deployment, or spend has been authorized by this document.

## Evidence and provenance

**Project material inspected before this revision:** `PLAN.md` (live plan v6, refreshed 2026-09-28; $500/month planning cap, 10 hours/week), `BRAND.md`, `audits/2026-09-23-222353-light-audit.md`, and `resources/workflow-results/seo-site-audit/2026-09-27/seo-audit-report.md`. The latter says the site audit did not have conversion-rate or session-recording data. Project integration status lists PostHog as connected and no selected GA4 property.

**New CEO-review excerpts supplied with this revision:** `inbox/paste-1-fe13620d.md` through `inbox/paste-7-fe13620d.md` and `inbox/analytics-events-spec-fe13620d.md`. They report access rules, prices, trial and product behavior, content proof points, event work, and suggested forecasts. The complete underlying app access model, pricing/config, revenue/growth strategy files, event schema, account export, country list, and database content-count query were not supplied. Therefore these are attributed as supplied claims and must be verified before implementation or external use.

**External context:** ChartMogul + ProductLed, [The Conversion Report](https://chartmogul.com/reports/saas-conversion-report/), January 2026, 200 software products; reported 8% median free-to-paid over a six-month definition with broad dispersion. Context only—not a 90-day Bayan forecast. See the annex for detailed calculation notes.
