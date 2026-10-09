![[deepseek_html_20261003_2db0f0.html]]
# Bayan — Revenue Integration Strategy

How 
- the four archived models combine into one Bayan revenue machine, 
	- (1) Empower + Stage3 cohort model, 
	- (2) magistermarketing AI-agent SaaS, 
	- (3) Eben Pagan AI Marketing Club, 
	- (4) Bayan's own current state.
- and the Phase 0 + Phase 1 task list to execute it.

 Companion to [analytics-events-spec.md](analytics-events-spec.md) 
 - (the measurement layer this plan depends on).
 

Bayan
- already owns the one layer every other startup lacks
	- — a trustworthy, clinician-gated content moat — 
- and is missing the three layers the other archives have each perfected: 
	- demand, 
	- packaging, 
	- and engine. 
The play is to bolt proven funnel / packaging / agent machinery onto a moat that already exists. 
Most startups have a funnel and no moat; Bayan is the reverse.

## Four sources = four layers of ONE machine

| Layer | Source | Its job | Bayan gap it closes |
|---|---|---|---|
| Engine | Magister | AI agent powering the study-coach AND Bayan's own marketing ops | empty AI-course slot; no marketing automation |
| Packaging / price ladder | Empower + Stage3 | free diagnostic → sub → cohort → institution; metered-coach paywall | no mid tier; dormant B2B; untuned trial→paid |
| Demand / conversion | Eben Pagan | offer science, copy, education-based follow-up funnel, lead magnet | no funnel; no lifecycle/referral; moat invisible |
| Product / moat | Bayan | 5,610 clinician-reviewed Qs, 20-point rubric, dated PMIDs, human gate | (the asset the other three lack) |
## Synergy — each source's weakness is another's strength

| This source's fatal weakness…                                         | …is fixed by                                                                                                         |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Bayan: pre-traction, no instrumented funnel (50+ installs, 0 ratings) | Eben (funnel) + Empower (packaging)                                                                                  |
| Empower: thin content, community 93% silent (28 of 428 active)        | Bayan's deep clinician-reviewed corpus fills the empty tiers                                                         |
| Eben: hype/guru tactics would destroy a medical brand                 | Bayan's moat makes education-based marketing credible                                                                |
| Magister: an engine with no domain, content, or safety gate           | Bayan supplies domain + reviewed content + clinician fence; Magister supplies the engine Bayan's empty AI slot needs |
|                                                                       |                                                                                                                      |

Note: Stage3 was captured on Bayan's OWN trial account, and the Magister archive is Magister's client workspace FOR Bayan. 
Two of four sources were already Bayan scouting these models — this completes an evaluation Bayan started.


**Convergence point (highest-leverage single build): a free readiness diagnostic** —
three engines meet there: Eben's "move the free line" lead magnet + Empower's "AI Audit" + Magister's audit→plan compiler. 
One artifact does lead-gen, personalization, and study-plan generation at once.

## The combined revenue machine (end to end)

1. **TOP — Demand:** 
	   - Free Readiness Diagnostic (50-Q mock or OSCE walkthrough, segmented by exam path).
	   - Scores weak areas → emails report + generated study plan. 
	   - Captures contact before the wall.
2. **MIDDLE — Conversion:** 
	   - Education-based follow-up funnel drips Bayan's 472    clinician-reviewed articles ("one lesson a week until they buy") via the existing    @BayanMedEd Telegram + email. 
	   - Eben's 25–50%-convert-over-a-year lever.
	   - Paywall =  Empower's metered AI-coach wrapping the existing 5-Q/day free tier.
3. **PRICE LADDER:** 
	   - free diagnostic → existing $9.99/$19/$29 sub → NEW low mid-tier    (single-exam / exam-window pass) → NEW clinician-led live cohort (timed to exam    sittings; Bayan's 15+ reviewers = the scarce live-expert asset) → activate the    dormant institutional B2B lane.
4. **ENGINE:** 
	   - Magister's task-contract agent becomes the AI study-coach that only    answers with citations to clinician-reviewed content (the differentiator vs raw    ChatGPT). Magister also runs Bayan's own funnel.
5. **MOAT (linchpin):** 
	   - the 20-point review rubric + human gate + dated PMIDs is    today invisible to buyers. 
	   - Make it the hero of every message. 
	   - It justifies premium    price, makes the AI tutor trustworthy, unlocks B2B, and is the safety rail that    lets every aggressive tactic run without becoming a guru-scam.

## Phase 0 — Precondition (1–2 weeks). Do not skip.

Owner: `@process-owner` (reassign when real owners exist). Analytics: build the
vendor-neutral event layer now; GA4 connects later (see analytics-events-spec.md).

| Task | Owner | Done when (verify) | Est |
|---|---|---|---|
| Build `track()` event layer + Supabase `analytics_events` sink + GA4 adapter stub | @process-owner | 10 core events landing as rows; GA4 stub unconnected | 2–3 d |
| Build 6-rate funnel dashboard as SQL views | @process-owner | Views return real numbers, not zeros | 1–2 d |
| Lock ONE question count — query live DB, update site/app/brochure/CEO brief | @process-owner | Same number everywhere; no 4k/5k/10k drift | 1 d |
| Quantify grandfathering leak — count pre-2026-05-01 free accounts, model $ at risk, propose sunset/convert plan | @process-owner (pull) → **CEO decides** | Count + $ estimate + written proposal on CEO's desk | 1 d pull |

⚠️ Grandfathering is a CEO decision touching existing users — pull + propose only,
no user migration without sign-off.

## Phase 1 — Cheapest, highest ROI, existing assets (3–4 weeks, overlaps Phase 0)

| Task | Owner | Done when (verify) | Est |
|---|---|---|---|
| Moat-as-hero copy rewrite (hero, pricing, B2B, paywall) | @process-owner + **Clinical sign-off** | Bare "AI-powered" gone; review claim on hero/pricing/B2B; human-review caveat present | 3–4 d |
| Free diagnostic lead magnet (50-Q by exam path → score → emailed report + plan) | @process-owner | Live, segmented, fires events 1–3, feeds signup | 1–2 wk |
| Education drip (articles → weekly WhatsApp/@BayanMedEd + email) | @process-owner | Sequence live; sends tracked | 3–5 d |
| Add low mid-tier (single-exam / exam-window pass SKU) | **CEO (price)** + @process-owner | SKU live in PayPal, priced for IMG ICP | 3–4 d after price |

Dependencies: diagnostic + drip call `track()`, so they need Phase 0 rows 1–2 first.
Copy rewrite + mid-tier don't. Total window: ~4–5 weeks to all live + producing data.

## Guardrails (non-negotiable for a medical brand)

1. No pass/outcome guarantee ever — cap at access/effort-based refunds.
2. No fake scarcity / countdown timers around a licensing career.
3. Never bare "AI-powered" — always "AI assists with drafting; humans own what reaches learners."
4. AI coach never invents clinical facts — cites reviewed content only.
5. Localize prices far below Empower's US anchors ($9,998 cohort / $999 mo). Copy the ladder shape, not the numbers.
6. Don't over-paywall — let candidates feel the clinical rigor before the wall.
7. Keep MedResearch Academy a separate brand; don't cite SQUH/OMSB/SQU as the founder's employer; segment by exam path, not "speaks to everyone."

## What to cut if time runs short

Keep Phase 0 + Phase 1 only. The three must-dos, in order:
1. Instrument the funnel + lock the question number.
2. Moat-as-hero + education drip (uses the 472 articles already owned).
3. Free diagnostic lead magnet.

Cut cohort, full AI agent, and B2B to later — higher effort, and none pays off until
Phase 0 measurement exists anyway.


