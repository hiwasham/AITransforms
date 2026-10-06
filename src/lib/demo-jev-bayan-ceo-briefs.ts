#!/usr/bin/env node
/**
 * demo-jev-bayan-ceo-briefs.ts — Jev scoring for Bayan CEO decision briefs.
 *
 * Bayan revenue system: two gated CEO decisions (grandfathering sunset + mid-tier SKU).
 * Current state: prose tradeoff tables, CEO picks A/B/C manually.
 * Jev: structured multi-criteria scoring → transparent recommendation.
 *
 * Run:   npx tsx src/lib/demo-jev-bayan-ceo-briefs.ts
 */

import { JevClient } from "./jev-client.js";

// Brief 1: Grandfathering sunset decision
const GRANDFATHERING_CONTEXT = {
  decision: "What to do with pre-paywall (pre-2026-05-01) free accounts",
  business: "Bayan EdTech SaaS, Gulf medical licensing exam prep, <1% paying today, $277 lifetime revenue",
  numbers: {
    engaged_lifers: "[TBD — pull from DB]",
    dormant_lifers: "[TBD — pull from DB]",
    dollars_at_risk_annual: "[TBD — engaged count × $9.99 × 12]",
  },
  options: [
    {
      id: "A",
      label: "Grandfather forever (do nothing)",
      recovers_revenue: "none — permanent leak",
      churn_risk: "zero, but sets precedent",
    },
    {
      id: "B",
      label: "Sunset with grace (announce → N-day window → convert)",
      recovers_revenue: "high",
      churn_risk: "moderate — some walk",
    },
    {
      id: "C",
      label: "Convert dormant only (reclaim inactive, keep engaged free)",
      recovers_revenue: "partial",
      churn_risk: "low — protects few real fans",
    },
  ],
  current_recommendation: "C, then revisit",
  rationale:
    "Bayan is pre-traction; engaged early users worth more as advocates than reclaimed seats. Reclaim only dormant now (near-zero goodwill cost), hold engaged-lifer decision until Phase 0 shows real conversion value.",
};

// Brief 2: Mid-tier SKU pricing
const MID_TIER_CONTEXT = {
  decision: "Price and shape of one-time single-exam pass SKU",
  business: "Captures IMG who won't commit to recurring sub but will pay once for exam run-up",
  numbers: {
    current_tiers: "[TBD — $9.99 / $19 / $29 monthly?]",
    exam_calendar: "SMLE/OMSB/DHA/OEN — 60-90 days to sitting",
    competitor_prices: "[TBD — Gulf IMG market one-time/q-bank pricing]",
    trial_to_paid_rate: "[TBD — baseline willingness-to-pay]",
  },
  options: [
    {
      id: "A",
      label: "Aggressive entry (low price)",
      upside: "max volume, easy yes",
      risk: "cannibalizes recurring sub",
    },
    {
      id: "B",
      label: "Anchored mid (~2-3× monthly sub)",
      upside: "reads as 'commit to your exam', protects sub",
      risk: "fewer buyers if mispriced",
    },
    {
      id: "C",
      label: "Two SKUs (single-exam vs all-access window)",
      upside: "more choice",
      risk: "more complexity, splits message",
    },
  ],
  current_recommendation: "B, single SKU",
  rationale:
    "Price at ~2.5× monthly sub, window = next sitting (~60-90d), localized down for price-sensitive IMGs. One SKU keeps message clean. Price is PayPal config change, treat as starting point to A/B.",
};

async function main() {
  console.log("=== Jev CEO decision scoring — Bayan revenue briefs ===\n");

  const jev = new JevClient();

  // Decision 1: Grandfathering sunset
  console.log("--- Decision 1: Grandfathering sunset ---");
  console.log(`Context: ${GRANDFATHERING_CONTEXT.decision}`);
  console.log(`Current manual recommendation: ${GRANDFATHERING_CONTEXT.current_recommendation}\n`);

  const t1 = Date.now();
  const res1 = await jev.decide(
    {
      decision: GRANDFATHERING_CONTEXT.decision,
      business_context: GRANDFATHERING_CONTEXT.business,
      numbers: GRANDFATHERING_CONTEXT.numbers,
      options: GRANDFATHERING_CONTEXT.options,
    },
    {
      best_option: {
        type: "choice",
        instructions:
          "Which grandfathering option best balances revenue recovery, churn risk, and brand trust for a pre-traction medical EdTech startup?",
        criteria: {
          A: "Grandfather forever (no revenue recovery, zero churn risk, sets precedent)",
          B: "Sunset with grace (high revenue recovery, moderate churn risk, some walk)",
          C: "Convert dormant only (partial recovery, low churn, protects real fans)",
        },
      },
      revenue_impact: {
        type: "score",
        instructions: "Rate the revenue recovery potential of the recommended option",
        criteria: ["None", "Partial", "Moderate", "High"],
      },
      churn_risk: {
        type: "score",
        instructions: "Rate the goodwill/churn risk of the recommended option",
        criteria: ["Minimal", "Low", "Moderate", "High"],
      },
      reversible: {
        type: "noul",
        instructions:
          "Is this decision easily reversible if it backfires? (Re-comping accounts is trivial, but a botched public announcement damages trust permanently)",
      },
    },
  );
  const latency1 = Date.now() - t1;

  console.log(`Jev recommendation: Option ${res1.answers.best_option.choice}`);
  console.log(`  Confidence: ${res1.answers.best_option.confidence.toFixed(2)}`);
  console.log(`  Probabilities: ${JSON.stringify(res1.answers.best_option.probabilities)}`);
  console.log(`  Revenue impact score: ${res1.answers.revenue_impact.score.toFixed(2)} / 3`);
  console.log(`  Churn risk score: ${res1.answers.churn_risk.score.toFixed(2)} / 3`);
  console.log(`  Reversible? ${res1.answers.reversible.noul.toFixed(2)} (0=no, 1=yes)`);
  console.log(`  Latency: ${latency1}ms | Tokens: ${res1.usage.input_tokens} in`);

  const flagged1 = jev.reviewFlags(res1.answers, 0.7);
  if (flagged1.length > 0) {
    console.log(`  ⚠ REVIEW: low confidence on ${flagged1.join(", ")} — CEO should see the tradeoff matrix`);
  }

  console.log(
    `\n✓ Manual recommendation was "${GRANDFATHERING_CONTEXT.current_recommendation}" — Jev ${res1.answers.best_option.choice === "C" ? "AGREES" : `suggests ${res1.answers.best_option.choice} instead`}\n`,
  );

  // Decision 2: Mid-tier SKU pricing
  console.log("--- Decision 2: Mid-tier SKU pricing ---");
  console.log(`Context: ${MID_TIER_CONTEXT.decision}`);
  console.log(`Current manual recommendation: ${MID_TIER_CONTEXT.current_recommendation}\n`);

  const t2 = Date.now();
  const res2 = await jev.decide(
    {
      decision: MID_TIER_CONTEXT.decision,
      business_context: MID_TIER_CONTEXT.business,
      numbers: MID_TIER_CONTEXT.numbers,
      options: MID_TIER_CONTEXT.options,
    },
    {
      best_option: {
        type: "choice",
        instructions:
          "Which mid-tier SKU pricing strategy best balances volume, sub cannibalization, and message simplicity for a price-sensitive IMG market?",
        criteria: {
          A: "Aggressive entry (low price, max volume, cannibalizes sub)",
          B: "Anchored mid (~2-3× monthly, protects sub, fewer buyers if mispriced)",
          C: "Two SKUs (more choice, more complexity)",
        },
      },
      volume_potential: {
        type: "score",
        instructions: "Rate the likely purchase volume of this pricing approach",
        criteria: ["Low", "Moderate", "High", "Very High"],
      },
      sub_cannibalization_risk: {
        type: "score",
        instructions: "Rate the risk this SKU cannibalizes the recurring subscription",
        criteria: ["Minimal", "Low", "Moderate", "High"],
      },
      complexity_cost: {
        type: "score",
        instructions: "Rate the message/operational complexity of this approach",
        criteria: ["Simple", "Moderate", "Complex", "Very Complex"],
      },
      reversible: {
        type: "noul",
        instructions: "Is this pricing decision easily reversible via PayPal config changes?",
      },
    },
  );
  const latency2 = Date.now() - t2;

  console.log(`Jev recommendation: Option ${res2.answers.best_option.choice}`);
  console.log(`  Confidence: ${res2.answers.best_option.confidence.toFixed(2)}`);
  console.log(`  Probabilities: ${JSON.stringify(res2.answers.best_option.probabilities)}`);
  console.log(`  Volume potential: ${res2.answers.volume_potential.score.toFixed(2)} / 3`);
  console.log(
    `  Sub cannibalization risk: ${res2.answers.sub_cannibalization_risk.score.toFixed(2)} / 3`,
  );
  console.log(`  Complexity cost: ${res2.answers.complexity_cost.score.toFixed(2)} / 3`);
  console.log(`  Reversible? ${res2.answers.reversible.noul.toFixed(2)} (0=no, 1=yes)`);
  console.log(`  Latency: ${latency2}ms | Tokens: ${res2.usage.input_tokens} in`);

  const flagged2 = jev.reviewFlags(res2.answers, 0.7);
  if (flagged2.length > 0) {
    console.log(`  ⚠ REVIEW: low confidence on ${flagged2.join(", ")} — CEO should see the tradeoff matrix`);
  }

  console.log(
    `\n✓ Manual recommendation was "${MID_TIER_CONTEXT.current_recommendation}" — Jev ${res2.answers.best_option.choice === "B" ? "AGREES" : `suggests ${res2.answers.best_option.choice} instead`}\n`,
  );

  console.log("=== What this replaces ===");
  console.log("Current: prose tradeoff tables in ceo-decision-briefs.md → CEO reads + picks A/B/C manually");
  console.log("Jev:     structured multi-criteria Choice + Score → transparent recommendation + confidence");
  console.log("\nBenefit: CEO sees calibrated probabilities for each option, not just one recommendation.");
  console.log("         Low confidence (<0.7) surfaces 'this is genuinely close, decide manually.'");
  console.log("         Transparent criteria (revenue / churn / reversibility) replace implicit judgment.");
  console.log("\nCost:    ~$0.00003 per decision (600-700 tokens/brief).");
}

main().catch((err) => {
  console.error("Demo failed:", err);
  process.exit(1);
});
