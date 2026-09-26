#!/usr/bin/env node

// PROTOTYPE ONLY: throwaway logic contract for the Chris UK registration proof.

const { performance } = require("perf_hooks");

const kSources = {
  event: "UK event page",
  email: "latest workshop email",
  contract: "safe refusal contract",
};

const kSafeRefusal =
  "I can only answer from Chris-approved UK Creating Healing Circles workshop material. I do not have a cited source for that, and I should not guess.";

const qaPrompts = [
  "Why might qualified people hesitate to register?",
  "Am I a fit if I am IFS-informed but not Level I?",
  "What lodging should I know about?",
  "Can you give me therapy advice for my client?",
  "What does Chris privately think about this workshop?",
];

function sourceLabels(slugs) {
  return slugs.map((slug) => `[${slug}]`).join(", ");
}

function answerQuestion(rawQuestion) {
  const question = String(rawQuestion || "").toLowerCase();

  if (
    question.includes("therapy") ||
    question.includes("client") ||
    question.includes("privately") ||
    question.includes("private") ||
    question.includes("think about")
  ) {
    return {
      refused: true,
      sources: [kSources.contract],
      answer: `${kSafeRefusal} Sources: ${sourceLabels([kSources.contract])}`,
    };
  }

  if (question.includes("hesitate") || question.includes("register")) {
    return {
      refused: false,
      sources: [kSources.event, kSources.email],
      answer:
        "Qualified practitioners may hesitate for five practical reasons: eligibility is broad enough to include IFS-informed and IFS Institute Level I trained practitioners, but some buyers may still wonder whether their exact background qualifies; lodging is separate from the $1,650 workshop price and must be booked with Ham Green House; the workshop price is listed in USD while the UK venue and lodging context can raise GBP/payment questions; refunds are available until 21 days before the workshop, minus a 3% processing fee, with no refunds inside 20 days; and the certificate is available, but buyers may want to know how it applies to IFS-I certification. Gentle follow-up draft: \"If you are IFS-informed or Level I trained and unsure whether this workshop fits your background, send us a short note about your training and group-facilitation experience. We can help you decide before you register.\" Boundary: I can support UK workshop registration questions from approved sources only; I cannot give therapy advice or make unsourced claims. Sources: " +
        sourceLabels([kSources.event, kSources.email]),
    };
  }

  if (question.includes("fit") || question.includes("informed") || question.includes("level i")) {
    return {
      refused: false,
      sources: [kSources.event, kSources.email],
      answer:
        "You may be a fit if you are IFS-informed or IFS Institute Level I trained and want experiential practice using IFS in a group format. If your background is unclear, the right next step is to send a short note about your training and group-facilitation experience so Chris's team can help you decide before registration. Boundary: this is event-fit guidance, not therapy or certification advice. Sources: " +
        sourceLabels([kSources.event, kSources.email]),
    };
  }

  if (question.includes("lodging") || question.includes("hotel") || question.includes("stay")) {
    return {
      refused: false,
      sources: [kSources.event, kSources.email],
      answer:
        "Lodging is not included in the $1,650 workshop price. The event material points participants to Penny Brohn Centre Ham Green House for separate booking, including a 4-night bed, breakfast, and evening meal package, plus limited camping spaces. The workshop price includes lunch each day; lodging is handled directly with the venue. Sources: " +
        sourceLabels([kSources.event, kSources.email]),
    };
  }

  return {
    refused: true,
    sources: [kSources.contract],
    answer: `${kSafeRefusal} Sources: ${sourceLabels([kSources.contract])}`,
  };
}

function runQa() {
  for (const prompt of qaPrompts) {
    const start = performance.now();
    const result = answerQuestion(prompt);
    const latencyMs = Math.round((performance.now() - start) * 1000) / 1000;
    console.log("PROMPT:", prompt);
    console.log("REFUSED:", result.refused);
    console.log("SOURCES:", result.sources.join(", "));
    console.log("LATENCY_MS:", latencyMs);
    console.log("ANSWER:", result.answer);
    console.log("---");
  }
}

if (require.main === module) {
  runQa();
}

module.exports = { answerQuestion, qaPrompts };
