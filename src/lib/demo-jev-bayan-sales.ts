/**
 * Bayan Sales — Jev Integration Demo
 *
 * Real sales decisions from the Bayan revenue system:
 * 1. Lead qualification (warmth scoring)
 * 2. Discovery call readiness gate
 * 3. Proposal timing decision
 * 4. Renewal/expansion priority scoring
 */

import { JevClient, type JevQuestion } from "./jev-client.js";

const client = new JevClient();

async function main() {

// ============================================================================
// Decision 1: Lead Qualification (Warmth Scoring)
// ============================================================================

console.log("=== BAYAN SALES DECISION 1: Lead Qualification (Warmth Scoring) ===\n");

const warmthCriteria = ["cold", "cool", "warm", "hot"];
const warmthLegend = {
  cold: "No usage, no relationship, cold outbound (CS04: 0.2% reply rate). Skip.",
  cool: "Inactive free trial, minimal usage, no relationship. Low priority nurture.",
  warm: "Active free trial usage (last 30d), OR existing relationship (Oman/MedResearch). Ready for outreach.",
  hot: "High engagement + relationship + approaching renewal window. Priority contact."
};

const sampleLeads = [
  {
    name: "Oman Medical Specialty Board",
    description: "Free trial institution, 45 active trial seats last 30d, existing MedResearch Academy relationship, renewal in 60 days",
  },
  {
    name: "Sultan Qaboos University Hospital",
    description: "Free trial, 8 seats provisioned, 2 active last 90d, no prior relationship",
  },
  {
    name: "Private Gulf clinic (cold outbound)",
    description: "No trial, no relationship, found via LinkedIn search",
  },
  {
    name: "DHA Dubai residency program",
    description: "Free trial, 120 seats, 87 active last 30d, direct CEO relationship from conference",
  },
];

for (const lead of sampleLeads) {
  const state = {
    lead_name: lead.name,
    context: lead.description,
  };

  const questions: Record<string, JevQuestion> = {
    warmth: {
      type: "score",
      instructions: "Lead warmth score based on usage + relationship + timing",
      criteria: warmthCriteria,
    }
  };

  const response = await client.decide(state, questions);
  const result = response.answers;

  if (result.warmth.type !== "score") throw new Error("Expected score");
  const { score, confidence, probabilities } = result.warmth;

  const bucket = warmthCriteria[Math.round(score)];
  const flagged = client.reviewFlags(result, 0.7);

  console.log(`Lead: ${lead.name}`);
  console.log(`  Warmth: ${score}/3 (${bucket}) — conf ${confidence.toFixed(2)}`);

  // probabilities is a Record<string, number> with string keys "0", "1", "2", "3"
  const probArray = [probabilities["0"], probabilities["1"], probabilities["2"], probabilities["3"]];
  console.log(`  Probabilities: ${probArray.map((p, i) => `${["cold","cool","warm","hot"][i]}=${(p*100).toFixed(0)}%`).join(", ")}`);

  if (flagged.length > 0) {
    console.log(`  ⚠ REVIEW: ${flagged.join(", ")} (confidence < 0.7 — manual warmth check)`);
  }

  // Action routing
  if (score === 3) {
    console.log(`  → ACTION: Priority contact (10 hr/week CEO capacity — move immediately)`);
  } else if (score === 2) {
    console.log(`  → ACTION: Nasim outreach (tailored one-pager, book discovery call)`);
  } else if (score === 1) {
    console.log(`  → ACTION: Low-touch nurture sequence (email drip, no CEO time)`);
  } else {
    console.log(`  → ACTION: Skip (0.2% cold-outbound reply rate — not worth capacity)`);
  }

  console.log();
}

// ============================================================================
// Decision 2: Discovery Call Readiness Gate
// ============================================================================

console.log("\n=== BAYAN SALES DECISION 2: Discovery Call Readiness Gate ===\n");

const callCandidates = [
  {
    name: "OMSB (Oman Medical Specialty Board)",
    context: "45 active seats, MedResearch relationship, contacted us asking about institutional pricing",
  },
  {
    name: "Small Oman clinic",
    context: "5 trial seats, 0 active last 90d, no relationship, cold LinkedIn reply",
  },
  {
    name: "DHA Dubai residency",
    context: "120 seats, 87 active, CEO met program director at Gulf Med Ed conference, they asked for a follow-up",
  },
];

for (const candidate of callCandidates) {
  const state = {
    lead_name: candidate.name,
    context: candidate.context,
  };

  const questions: Record<string, JevQuestion> = {
    ready: {
      type: "noul",
      instructions: "Is this lead ready for a CEO discovery call (relationship-first style)? " +
        "Consider: warm relationship exists OR active trial usage shows intent. " +
        "CEO has 10 hr/week B2B capacity — 2-3 active conversations max."
    }
  };

  const response = await client.decide(state, questions);
  const result = response.answers;

  if (result.ready.type !== "noul") throw new Error("Expected noul");
  const { noul } = result.ready;

  const flagged = client.reviewFlags(result, 0.7);

  console.log(`Lead: ${candidate.name}`);
  console.log(`  Ready for CEO call: ${(noul * 100).toFixed(0)}%`);

  if (flagged.length > 0) {
    console.log(`  ⚠ REVIEW: ambiguous (${(noul * 100).toFixed(0)}% in 30-70% band — manual judgment)`);
  }

  if (noul >= 0.7) {
    console.log(`  → ACTION: Book CEO discovery call (relationship-first, capture objections + contract value signals)`);
  } else if (noul >= 0.3) {
    console.log(`  → ACTION: Nasim warmup first (email, gauge interest, qualify before CEO time)`);
  } else {
    console.log(`  → ACTION: Not ready (nurture or disqualify — don't burn CEO capacity)`);
  }

  console.log();
}

// ============================================================================
// Decision 3: Proposal Timing (after discovery call)
// ============================================================================

console.log("\n=== BAYAN SALES DECISION 3: Proposal Timing Decision ===\n");

const discoveryOutcomes = [
  {
    name: "OMSB call outcome",
    notes: "Program director confirmed $8k budget for 60 seats, wants proposal before board meeting in 2 weeks, asked about CME licensing option",
  },
  {
    name: "Small clinic call outcome",
    notes: "Interested in concept, but said 'we'll think about it', no budget mentioned, unclear who makes purchasing decisions",
  },
  {
    name: "Syrian refugee hospital",
    notes: "On the 13-country humanitarian free-access list, asking if they can get institutional admin dashboard for their 200 residents",
  },
];

for (const outcome of discoveryOutcomes) {
  const state = {
    lead_name: outcome.name,
    discovery_notes: outcome.notes,
  };

  const questions: Record<string, JevQuestion> = {
    timing: {
      type: "choice",
      instructions: "When should we send the tailored one-pager proposal?",
      criteria: {
        send_now: "Send immediately — budget confirmed, decision-maker engaged, renewal window open",
        send_after_followup: "One follow-up email first — interest shown but need to confirm decision-maker buy-in",
        nurture_and_wait: "Long nurture — interest is exploratory, no budget signal, wait for renewal window or trigger event",
        disqualify: "No fit — free-country humanitarian access, or no institutional buying authority"
      }
    }
  };

  const response = await client.decide(state, questions);
  const result = response.answers;

  if (result.timing.type !== "choice") throw new Error("Expected choice");
  const { choice, confidence, probabilities } = result.timing;

  const flagged = client.reviewFlags(result, 0.7);

  console.log(`Discovery outcome: ${outcome.name}`);
  console.log(`  Timing decision: ${choice} — conf ${confidence.toFixed(2)}`);
  console.log(`  Probabilities: ${Object.entries(probabilities).map(([k, v]) => `${k}=${(v*100).toFixed(0)}%`).join(", ")}`);

  if (flagged.length > 0) {
    console.log(`  ⚠ REVIEW: ${flagged.join(", ")} (confidence < 0.7 — CEO judgment call)`);
  }

  if (choice === "send_now") {
    console.log(`  → ACTION: Draft tailored one-pager now (CEO creates, captures contract value + objections in SOP log)`);
  } else if (choice === "send_after_followup") {
    console.log(`  → ACTION: Nasim follow-up email (confirm decision-maker, gauge budget, then flag CEO for proposal)`);
  } else if (choice === "nurture_and_wait") {
    console.log(`  → ACTION: Add to nurture sequence (quarterly check-in, wait for renewal trigger or budget signal)`);
  } else {
    console.log(`  → ACTION: Disqualify (humanitarian access = policy right, or no purchasing authority — log and close)`);
  }

  console.log();
}

// ============================================================================
// Decision 4: Renewal/Expansion Priority Scoring
// ============================================================================

console.log("\n=== BAYAN SALES DECISION 4: Renewal/Expansion Priority ===\n");

const renewalCandidates = [
  {
    name: "OMSB renewal check",
    context: "60-seat free trial ending in 45 days, 52 active users last 30d, program director asked about pricing 2 months ago, no follow-up since",
  },
  {
    name: "DHA expansion opportunity",
    context: "120-seat trial, 87 active, program coordinator emailed asking if they can add 30 more seats for incoming cohort, trial expires in 90 days",
  },
  {
    name: "Muscat clinic trial",
    context: "10-seat trial, 1 user active last 90d, trial expires in 180 days, no contact since trial started",
  },
];

for (const candidate of renewalCandidates) {
  const state = {
    institution: candidate.name,
    context: candidate.context,
  };

  const renewalPriorityCriteria = ["low", "medium", "high", "critical"];
  const renewalPriorityLegend = {
    low: "Dormant trial, no usage, no relationship. Low renewal likelihood.",
    medium: "Some usage, existing trial in place, but no expansion signals or budget discussion yet.",
    high: "Active usage, prior positive engagement, approaching renewal, or expansion interest shown.",
    critical: "High usage, decision-maker relationship, renewal window NOW, contract value signals present."
  };

  const questions: Record<string, JevQuestion> = {
    priority: {
      type: "score",
      instructions: "Renewal/expansion priority for CEO outreach capacity allocation",
      criteria: renewalPriorityCriteria,
    }
  };

  const response = await client.decide(state, questions);
  const result = response.answers;

  if (result.priority.type !== "score") throw new Error("Expected score");
  const { score, confidence, probabilities } = result.priority;

  const bucket = renewalPriorityCriteria[Math.round(score)];
  const flagged = client.reviewFlags(result, 0.7);

  console.log(`Institution: ${candidate.name}`);
  console.log(`  Priority: ${score}/3 (${bucket}) — conf ${confidence.toFixed(2)}`);

  const probArray = [probabilities["0"], probabilities["1"], probabilities["2"], probabilities["3"]];
  console.log(`  Probabilities: ${probArray.map((p, i) => `${["low","med","high","crit"][i]}=${(p*100).toFixed(0)}%`).join(", ")}`);

  if (flagged.length > 0) {
    console.log(`  ⚠ REVIEW: ${flagged.join(", ")} (confidence < 0.7)`);
  }

  if (score === 3) {
    console.log(`  → ACTION: CEO immediate outreach (lighthouse contract opportunity — capture real contract value in SOP log)`);
  } else if (score === 2) {
    console.log(`  → ACTION: Nasim outreach this week (book renewal conversation, surface objections + budget)`);
  } else if (score === 1) {
    console.log(`  → ACTION: Standard renewal drip (automated email sequence, escalate only if they engage)`);
  } else {
    console.log(`  → ACTION: Low touch (quarterly check-in, deprioritize until usage picks up)`);
  }

  console.log();
}

console.log("\n=== SUMMARY ===");
console.log("Cost per decision: ~$0.00002 (~400-500 tokens/call)");
console.log("All 4 decisions replace manual CEO/Nasim judgment with calibrated System-1 scoring.");
console.log("Low-confidence flags route edge cases to human review (the 10 hr/week capacity constraint).");
console.log("\nNext: wire these into the Lead-to-Sale SOP as automated scoring gates.");
}

main().catch(console.error);
