/**
 * Batch Orchestrator (T043) — MVP-1 scope, simplified per the MVP
 * Execution Plan categorization in tasks.md:
 *
 *   INCLUDED:  scrape -> BFV -> script -> lint coordination for a single
 *              ingested prospect (the vertical slice's Research -> BFV ->
 *              Script -> Quality validation stages).
 *   DEFERRED (Phase 2 / Future — NOT implemented in this pass):
 *              - Batch Candidate Pool union with re-engagement-eligible
 *                prospects (FR-026)
 *              - Resume-on-retry for a partially-completed batch date
 *                (data-model.md's Resume Rule)
 *              - Full FR-007 dedup (redirect resolution, history-wide
 *                fuzzy matching) — only the minimal normalizeUrl() dedup
 *                key needed to satisfy the schema is applied here.
 */

import type { Db } from "@/db/client.js";
import type { LLMClient } from "@/services/llm/llm-client.js";
import type { BFVBotClient } from "@/services/telegram/bfv-bot-client.js";
import type { ScrapeResult } from "@/services/scraper/scraper-client.js";
import * as ProspectRepo from "@/domain/prospects/prospect.js";
import * as AttemptRepo from "@/domain/prospects/outreach-attempt.js";
import * as SnapshotRepo from "@/domain/pipeline/scraped-site-snapshot.js";
import * as BFVRepo from "@/domain/pipeline/bfv-deliverable.js";
import * as ScriptRepo from "@/domain/pipeline/outreach-script.js";
import * as LinterRepo from "@/domain/linter/linter.js";
import { normalizeUrl } from "@/domain/prospects/dedup.js";
import { isValidTransition } from "@/domain/pipeline/workflow-state-machine.js";
import { canRetry, MAX_REVISION_ATTEMPTS } from "@/domain/pipeline/revision-retry.js";
import { logger } from "@/lib/logger.js";

export interface BatchOrchestratorDeps {
  scrapeUrl: (url: string) => Promise<ScrapeResult>;
  botClient: BFVBotClient;
  llmClient: LLMClient;
  telegramBotUsername?: string; // used to build the deep link URL; a fixture value in tests
}

export interface ProcessProspectInput {
  businessName: string;
  sourceUrl: string;
  batchDate: string; // YYYY-MM-DD
}

export interface ProcessProspectResult {
  prospectId: string;
  outreachAttemptId: string;
  workflowState: string;
  deduped: boolean;
}

async function setState(
  db: Db,
  attemptId: string,
  from: string,
  to: string,
): Promise<void> {
  if (!isValidTransition(from as never, to as never)) {
    throw new Error(`Illegal workflow transition: ${from} -> ${to}`);
  }
  await AttemptRepo.setWorkflowState(db, attemptId, to as never);
  logger.info("workflow_state_transition", { attemptId, from, to });
}

export async function processProspect(
  db: Db,
  deps: BatchOrchestratorDeps,
  input: ProcessProspectInput,
): Promise<ProcessProspectResult> {
  const normalizedDomain = normalizeUrl(input.sourceUrl);

  const existing = await ProspectRepo.findByNormalizedDomain(db, normalizedDomain);
  if (existing) {
    logger.info("prospect_deduped", { normalizedDomain });
    // MVP-1: report the dedup, don't create a second attempt (full
    // re-engagement-aware re-attempt logic is Phase 2/Future, T075).
    return {
      prospectId: existing.id,
      outreachAttemptId: "",
      workflowState: "deduped",
      deduped: true,
    };
  }

  const prospect = await ProspectRepo.create(db, {
    businessName: input.businessName,
    sourceUrl: input.sourceUrl,
    normalizedDomain,
  });

  const attempt = await AttemptRepo.create(db, {
    prospectId: prospect.id,
    attemptNumber: 1,
    batchDate: input.batchDate,
  });
  logger.info("attempt_created", { attemptId: attempt.id, prospectId: prospect.id });

  // --- Research (scrape) ---
  const scrape = await deps.scrapeUrl(input.sourceUrl);
  await SnapshotRepo.create(db, {
    outreachAttemptId: attempt.id,
    status: scrape.status,
    rawContent: scrape.rawContent,
    extractedFacts: scrape.extractedFacts,
  });

  if (scrape.status !== "complete") {
    await setState(db, attempt.id, "generated", "needs_attention");
    logger.warn("attempt_needs_attention", {
      attemptId: attempt.id,
      reason: "scrape_incomplete",
      status: scrape.status,
    });
    return {
      prospectId: prospect.id,
      outreachAttemptId: attempt.id,
      workflowState: "needs_attention",
      deduped: false,
    };
  }

  const facts = scrape.extractedFacts ?? {};

  // --- BFV provisioning + verification ---
  const provisioned = await deps.botClient.provisionContext(attempt.id, facts);
  const bfv = await BFVRepo.create(db, {
    outreachAttemptId: attempt.id,
    telegramDeepLinkToken: provisioned.telegramDeepLinkToken,
    contextRef: provisioned.contextRef,
  });
  const ready = await BFVRepo.checkReadiness(
    deps.botClient,
    deps.llmClient,
    provisioned.contextRef,
  );
  if (!ready) {
    await BFVRepo.markVerificationFailed(db, bfv.id);
    await setState(db, attempt.id, "generated", "needs_attention");
    logger.warn("attempt_needs_attention", {
      attemptId: attempt.id,
      reason: "bfv_verification_failed",
    });
    return {
      prospectId: prospect.id,
      outreachAttemptId: attempt.id,
      workflowState: "needs_attention",
      deduped: false,
    };
  }
  await BFVRepo.markVerified(db, bfv.id);

  const botUsername = deps.telegramBotUsername ?? "AITransformsBot";
  const telegramDeepLinkUrl = `https://t.me/${botUsername}?start=${provisioned.telegramDeepLinkToken}`;

  // --- Script generation + Quality validation (bounded revision loop) ---
  let script = await ScriptRepo.generateAndStore(db, deps.llmClient, {
    outreachAttemptId: attempt.id,
    extractedFacts: facts,
    telegramDeepLinkUrl,
  });

  await setState(db, attempt.id, "generated", "quality_checked");

  let report = await LinterRepo.runLint(db, deps.llmClient, {
    outreachScriptId: script.id,
    bodyText: script.bodyText,
    prospectFacts: facts,
  });

  let attemptsSoFar = 1;
  while (report.verdict === "fail" && canRetry(attemptsSoFar)) {
    await setState(db, attempt.id, "quality_checked", "revision_requested");
    logger.info("revision_requested", {
      attemptId: attempt.id,
      revisionAttempt: attemptsSoFar,
      feedback: report.revisionFeedback,
    });

    script = await ScriptRepo.generateAndStore(db, deps.llmClient, {
      outreachAttemptId: attempt.id,
      extractedFacts: facts,
      telegramDeepLinkUrl,
      revisionFeedback: report.revisionFeedback ?? undefined,
    });
    await setState(db, attempt.id, "revision_requested", "quality_checked");

    report = await LinterRepo.runLint(db, deps.llmClient, {
      outreachScriptId: script.id,
      bodyText: script.bodyText,
      prospectFacts: facts,
    });
    attemptsSoFar += 1;
  }

  if (report.verdict === "fail") {
    await setState(db, attempt.id, "quality_checked", "revision_requested");
    await AttemptRepo.setWorkflowState(db, attempt.id, "needs_manual_draft");
    logger.warn("attempt_needs_manual_draft", {
      attemptId: attempt.id,
      revisionAttempts: attemptsSoFar,
      cap: MAX_REVISION_ATTEMPTS,
    });
    return {
      prospectId: prospect.id,
      outreachAttemptId: attempt.id,
      workflowState: "needs_manual_draft",
      deduped: false,
    };
  }

  await setState(db, attempt.id, "quality_checked", "human_review_queue");

  return {
    prospectId: prospect.id,
    outreachAttemptId: attempt.id,
    workflowState: "human_review_queue",
    deduped: false,
  };
}

export interface RunBatchInput {
  prospectList: Array<{ businessName: string; sourceUrl: string }>;
  batchDate: string;
}

export interface RunBatchResult {
  batchDate: string;
  accepted: number;
  deduped: number;
  processing: Array<ProcessProspectResult>;
}

export async function runBatch(
  db: Db,
  deps: BatchOrchestratorDeps,
  input: RunBatchInput,
): Promise<RunBatchResult> {
  const results: ProcessProspectResult[] = [];
  let deduped = 0;

  for (const p of input.prospectList) {
    const result = await processProspect(db, deps, {
      businessName: p.businessName,
      sourceUrl: p.sourceUrl,
      batchDate: input.batchDate,
    });
    if (result.deduped) deduped += 1;
    results.push(result);
  }

  logger.info("batch_generated", {
    batchDate: input.batchDate,
    accepted: results.length - deduped,
    deduped,
    shortfall: results.length - deduped < 100,
  });

  return {
    batchDate: input.batchDate,
    accepted: results.length - deduped,
    deduped,
    processing: results,
  };
}
