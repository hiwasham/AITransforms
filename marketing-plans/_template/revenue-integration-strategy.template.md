# {{CLIENT}} — Revenue Integration Strategy

How the studied models combine into one {{CLIENT}} revenue machine, and the
Phase 0 + Phase 1 task list to execute it. Companion to
`analytics-events-spec.md` (the measurement layer this plan depends on).

Sources synthesized: {{SOURCES}}
<!-- INSTANCE: list the playbooks/models studied and one line on what each teaches. -->

## Thesis

{{THESIS}}
<!-- INSTANCE: the one asymmetry — what the client already owns that others lack
({{MOAT}}), and the layers it's missing that the studied models have perfected.
State the reversal plainly (e.g. "most startups have a funnel and no moat; this
client is the reverse"). -->

## Sources = layers of ONE machine

| Layer | Source | Its job | {{CLIENT}} gap it closes |
|---|---|---|---|
| Engine | {{ENGINE_SOURCE}} | {{ENGINE_JOB}} | {{ENGINE_GAP}} |
| Packaging / price ladder | {{PACKAGING_SOURCE}} | {{PACKAGING_JOB}} | {{PACKAGING_GAP}} |
| Demand / conversion | {{DEMAND_SOURCE}} | {{DEMAND_JOB}} | {{DEMAND_GAP}} |
| Product / moat | {{CLIENT}} | {{MOAT}} | (the asset the others lack) |

## Synergy — each source's weakness is another's strength

| This source's fatal weakness… | …is fixed by |
|---|---|
| {{CLIENT}}: {{CLIENT_WEAKNESS}} | {{WHAT_FIXES_IT}} |
| {{SOURCE_A}}: {{SOURCE_A_WEAKNESS}} | {{WHAT_FIXES_IT}} |
| {{SOURCE_B}}: {{SOURCE_B_WEAKNESS}} | {{WHAT_FIXES_IT}} |

**Convergence point (highest-leverage single build):** {{CONVERGENCE_BUILD}}
<!-- INSTANCE: the one artifact where several engines meet (e.g. a free
diagnostic that does lead-gen + personalization + plan generation at once). -->

## The combined revenue machine (end to end)

1. **TOP — Demand:** {{DEMAND_MECHANISM}} (lead magnet; captures contact before the wall).
2. **MIDDLE — Conversion:** {{CONVERSION_MECHANISM}} (education-based follow-up funnel + metered paywall).
3. **PRICE LADDER:** {{PRICE_LADDER}}.
4. **ENGINE:** {{ENGINE_MECHANISM}} (AI agent / automation; also runs the client's own funnel).
5. **MOAT (linchpin):** {{MOAT}} — today invisible to buyers. Make it the hero of
   every message. It justifies premium price, makes the AI trustworthy, unlocks
   B2B, and is the safety rail that lets aggressive tactics run without becoming a scam.

## Phase 0 — Precondition (1–2 weeks). Do not skip.

Owner: `@process-owner` (reassign when real owners exist). Build the
vendor-neutral event layer now (see `analytics-events-spec.md`).

| Task | Owner | Done when (verify) | Est |
|---|---|---|---|
| Build `track()` event layer + sink + analytics stub | @process-owner | Core events landing as rows | 2–3 d |
| Build funnel dashboard as SQL views | @process-owner | Views return real numbers, not zeros | 1–2 d |
| Lock ONE canonical count — query live DB, update everywhere | @process-owner | Same number site/app/brochure/brief | 1 d |
| Quantify {{LEGACY_LEAK}} — count + model $ at risk + propose plan | @process-owner (pull) → **{{DECISION_MAKER}} decides** | Count + $ + written proposal delivered | 1 d pull |

⚠️ Anything touching existing users / money is a {{DECISION_MAKER}} decision —
pull + propose only, no migration without sign-off.

## Phase 1 — Cheapest, highest ROI, existing assets (3–4 weeks, overlaps Phase 0)

| Task | Owner | Done when (verify) | Est |
|---|---|---|---|
| Moat-as-hero copy rewrite (hero, pricing, B2B, paywall) | @process-owner + **sign-off** | {{GUARDRAIL_CHECK}} | 3–4 d |
| {{LEAD_MAGNET}} | @process-owner | Live, segmented, fires events, feeds signup | 1–2 wk |
| Education drip ({{DRIP_CHANNELS}}) | @process-owner | Sequence live; sends tracked | 3–5 d |
| Add {{MID_TIER_SKU}} | **{{DECISION_MAKER}} (price)** + @process-owner | SKU live, priced for {{ICP}} | 3–4 d after price |

Dependencies: anything that calls `track()` needs Phase 0 rows first. Copy
rewrite + pricing don't.

## Guardrails (non-negotiable)

{{GUARDRAILS}}
<!-- INSTANCE: the brand red lines from master-prompt §2. Copy the ladder SHAPE
from the studied models, not their numbers — localize pricing for {{ICP}}. -->

## What to cut if time runs short

Keep Phase 0 + Phase 1 only. In order: (1) instrument the funnel + lock the
canonical number; (2) moat-as-hero + education drip (uses assets already owned);
(3) the lead magnet. Cut cohort, full AI agent, and B2B to later — higher
effort, and none pays off until measurement exists anyway.
