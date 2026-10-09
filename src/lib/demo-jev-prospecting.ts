#!/usr/bin/env node
/**
 * demo-jev-prospecting.ts — Jev System-1 demo for AITransforms prospecting.
 *
 * Shows the lead-scoring rubric from agent/skills/prospecting/SKILL.md replaced
 * with a typed Jev Score (ordered Skip < Cold < Warm < Hot).
 *
 * Run:   npx tsx src/lib/demo-jev-prospecting.ts
 *
 * Reads OPENROUTER_API_KEY from env or ../../../jev/openrouter_apis.json.
 */

import { JevClient } from "./jev-client.js";

const SAMPLE_LEADS = [
  {
    name: "Perfect-fit SaaS founder",
    profile: `CEO at DataFlow (15-person team). Built a workflow automation SaaS on Make.com.
    Tweets about hitting 429 rate limits weekly. Revenue $30k MRR, growing 20% monthly.
    Looking for a scalable alternative before onboarding enterprise clients.`,
  },
  {
    name: "Warm indie hacker",
    profile: `Solo dev building a ComfyUI image-gen API for e-commerce. Mentioned VRAM issues
    in a Reddit post 2 months ago. Currently using 3090, considering cloud GPUs. Revenue unknown,
    likely pre-$10k MRR. Active in ComfyUI Discord.`,
  },
  {
    name: "Cold corporate IT",
    profile: `VP Engineering at a Fortune 500 logistics company. LinkedIn shows they use SAP and
    Oracle. No mention of Make.com, ComfyUI, or AI agents. Posted about migrating to Kubernetes
    6 months ago. Team size 200+.`,
  },
  {
    name: "Skip — agency looking for outsourcing",
    profile: `Marketing agency owner. Website says they help SMBs with Facebook ads and landing pages.
    No technical bottleneck visible. Looking for white-label services to resell. No dev team mentioned.`,
  },
];

async function main() {
  console.log("=== Jev prospecting lead-score demo ===\n");

  const jev = new JevClient(); // reads key from env or ../../../jev/openrouter_apis.json

  for (const lead of SAMPLE_LEADS) {
    console.log(`\n--- ${lead.name} ---`);
    console.log(`Profile: "${lead.profile.slice(0, 100).replace(/\s+/g, " ")}..."\n`);

    const t0 = Date.now();
    const res = await jev.decide(
      { profile: lead.profile },
      {
        fit_score: {
          type: "score",
          instructions: "Rate how well this prospect fits the ICP given the qualification evidence",
          criteria: [
            "Skip — no clear technical bottleneck or not a fit",
            "Cold — possible fit but weak signals or early stage",
            "Warm — clear bottleneck, some urgency, good ICP match",
            "Hot — perfect fit: urgent bottleneck, revenue, decision-maker, ready to buy",
          ],
        },
      },
    );
    const latency = Date.now() - t0;

    const ans = res.answers.fit_score;
    if (ans.type !== "score") throw new Error("Expected score answer");

    console.log(`Jev Score: ${ans.score.toFixed(2)} (0=Skip, 1=Cold, 2=Warm, 3=Hot)`);
    console.log(`Confidence: ${ans.confidence.toFixed(2)}`);
    console.log(`Probabilities: ${JSON.stringify(ans.probabilities)}`);
    console.log(`Latency: ${latency}ms  |  Tokens: ${res.usage.input_tokens} in, ${res.usage.output_tokens} out`);

    // Map to the prospecting rubric's Hot/Warm/Cold/Skip buckets
    const bucket =
      ans.score >= 2.5 ? "Hot" : ans.score >= 1.5 ? "Warm" : ans.score >= 0.5 ? "Cold" : "Skip";
    console.log(`\n→ Bucket: ${bucket}`);

    // Flag for human review if confidence < 0.7
    const flagged = jev.reviewFlags(res.answers, 0.7);
    if (flagged.length > 0) {
      console.log(`⚠ REVIEW: low confidence (${ans.confidence.toFixed(2)} < 0.7) — route to human`);
    }
  }

  console.log("\n=== What this replaces ===");
  console.log("Current: agent/skills/prospecting/SKILL.md prose rubric → free-text LLM → parse a Hot/Warm/Cold/Skip tag");
  console.log("Jev:     typed Score question → .score (0-3 float) + .confidence + .probabilities");
  console.log("\nBenefit: calibrated threshold (e.g. score >= 2.5 = Hot, confidence < 0.7 = human-review), no parse.");
  console.log("Cost:    ~$0.042/1M input tokens (~$0.00002/call).");
}

main().catch((err) => {
  console.error("Demo failed:", err);
  process.exit(1);
});
