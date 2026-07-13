/**
 * Batch Orchestrator (T043) — MVP-1 scope, simplified per the MVP
 * Execution Plan categorization in tasks.md:
 *
 *   INCLUDED:  scrape -> BFV -> script -> lint coordination for a single
 *              ingested prospect (the vertical slice's Research -> BFV ->
 *              Script -> Quality validation stages), plus the batch Resume
 *              Rule (T104, data-model.md): a re-invocation for an
 *              already-started date resumes attempts stranded at exactly
 *              `generated`, continuing from the first missing of
 *              snapshot -> BFV -> script — never redoing a step whose
 *              output already exists.
 *   DEFERRED (Phase 2 / Future — NOT implemented in this pass):
 *              - Batch Candidate Pool union with re-engagement-eligible
 *                prospects (FR-026)
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
  /** True when this entry was recovered by the Resume Rule sweep (T104). */
  resumed?: boolean;
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

function deepLinkUrl(deps: BatchOrchestratorDeps, token: string): string {
  const botUsername = deps.telegramBotUsername ?? "AITransformsBot";
  return `https://t.me/${botUsername}?start=${token}`;
}

/** Readiness-checks an existing BFV row; returns its deep-link token, or null on failure. */
async function verifyBfv(
  db: Db,
  deps: BatchOrchestratorDeps,
  bfv: { id: string; contextRef: string; telegramDeepLinkToken: string },
): Promise<string | null> {
  const ready = await BFVRepo.checkReadiness(
    deps.botClient,
    deps.llmClient,
    bfv.contextRef,
  );
  if (!ready) {
    await BFVRepo.markVerificationFailed(db, bfv.id);
    return null;
  }
  await BFVRepo.markVerified(db, bfv.id);
  return bfv.telegramDeepLinkToken;
}

/** BFV provisioning + verification; returns the deep-link token, or null on failure. */
async function provisionAndVerifyBfv(
  db: Db,
  deps: BatchOrchestratorDeps,
  attemptId: string,
  facts: Record<string, unknown>,
): Promise<string | null> {
  const provisioned = await deps.botClient.provisionContext(attemptId, facts);
  const bfv = await BFVRepo.create(db, {
    outreachAttemptId: attemptId,
    telegramDeepLinkToken: provisioned.telegramDeepLinkToken,
    contextRef: provisioned.contextRef,
  });
  return verifyBfv(db, deps, bfv);
}

/**
 * Script generation + quality validation (bounded revision loop). The
 * attempt must be at `generated`. `existingScript` is the Resume Rule's
 * entry point: a crash-survivor current revision is linted as-is instead
 * of being regenerated.
 */
async function runScriptAndLint(
  db: Db,
  deps: BatchOrchestratorDeps,
  attemptId: string,
  facts: Record<string, unknown>,
  telegramDeepLinkUrl: string,
  existingScript: ScriptRepo.OutreachScript | null,
): Promise<"human_review_queue" | "needs_manual_draft"> {
  let script =
    existingScript ??
    (await ScriptRepo.generateAndStore(db, deps.llmClient, {
      outreachAttemptId: attemptId,
      extractedFacts: facts,
      telegramDeepLinkUrl,
    }));

  await setState(db, attemptId, "generated", "quality_checked");

  let report = await LinterRepo.runLint(db, deps.llmClient, {
    outreachScriptId: script.id,
    bodyText: script.bodyText,
    prospectFacts: facts,
  });

  let attemptsSoFar = 1;
  while (report.verdict === "fail" && canRetry(attemptsSoFar)) {
    await setState(db, attemptId, "quality_checked", "revision_requested");
    logger.info("revision_requested", {
      attemptId,
      revisionAttempt: attemptsSoFar,
      feedback: report.revisionFeedback,
    });

    script = await ScriptRepo.generateAndStore(db, deps.llmClient, {
      outreachAttemptId: attemptId,
      extractedFacts: facts,
      telegramDeepLinkUrl,
      revisionFeedback: report.revisionFeedback ?? undefined,
    });
    await setState(db, attemptId, "revision_requested", "quality_checked");

    report = await LinterRepo.runLint(db, deps.llmClient, {
      outreachScriptId: script.id,
      bodyText: script.bodyText,
      prospectFacts: facts,
    });
    attemptsSoFar += 1;
  }

  if (report.verdict === "fail") {
    await setState(db, attemptId, "quality_checked", "revision_requested");
    await AttemptRepo.setWorkflowState(db, attemptId, "needs_manual_draft");
    logger.warn("attempt_needs_manual_draft", {
      attemptId,
      revisionAttempts: attemptsSoFar,
      cap: MAX_REVISION_ATTEMPTS,
    });
    return "needs_manual_draft";
  }

  await setState(db, attemptId, "quality_checked", "human_review_queue");
  return "human_review_queue";
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
  const token = await provisionAndVerifyBfv(db, deps, attempt.id, facts);
  if (token === null) {
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

  // --- Script generation + Quality validation (bounded revision loop) ---
  const outcome = await runScriptAndLint(
    db,
    deps,
    attempt.id,
    facts,
    deepLinkUrl(deps, token),
    null,
  );

  return {
    prospectId: prospect.id,
    outreachAttemptId: attempt.id,
    workflowState: outcome,
    deduped: false,
  };
}

/**
 * Resume Rule (T104, data-model.md / contracts/outreach-api.md resume
 * semantics): continue a `generated`-stranded attempt from the first
 * missing of snapshot -> BFV -> script. Never redoes a step whose output
 * already exists — an existing BFV row is re-verified (or its stored
 * verdict re-applied), never re-provisioned; an existing current script
 * revision is linted as-is.
 */
async function resumeAttempt(
  db: Db,
  deps: BatchOrchestratorDeps,
  attempt: AttemptRepo.OutreachAttempt,
): Promise<ProcessProspectResult> {
  logger.info("attempt_resumed", {
    attemptId: attempt.id,
    batchDate: attempt.batchDate,
  });
  const base = {
    prospectId: attempt.prospectId,
    outreachAttemptId: attempt.id,
    deduped: false,
    resumed: true,
  };

  // --- Research (scrape) — only if the snapshot is missing ---
  let snapshot = await SnapshotRepo.getByAttemptId(db, attempt.id);
  if (!snapshot) {
    const prospect = await ProspectRepo.getById(db, attempt.prospectId);
    if (!prospect) {
      // FK-impossible; guard narrows the type.
      throw new Error(`Prospect ${attempt.prospectId} missing for attempt ${attempt.id}`);
    }
    const scrape = await deps.scrapeUrl(prospect.sourceUrl);
    snapshot = await SnapshotRepo.create(db, {
      outreachAttemptId: attempt.id,
      status: scrape.status,
      rawContent: scrape.rawContent,
      extractedFacts: scrape.extractedFacts,
    });
  }
  if (snapshot.status !== "complete") {
    // Re-apply the verdict the crash swallowed — never re-scrape.
    await setState(db, attempt.id, "generated", "needs_attention");
    logger.warn("attempt_needs_attention", {
      attemptId: attempt.id,
      reason: "scrape_incomplete",
      status: snapshot.status,
    });
    return { ...base, workflowState: "needs_attention" };
  }
  const facts = snapshot.extractedFacts ?? {};

  // --- BFV — provision only if the row is missing ---
  const bfv = await BFVRepo.getByAttemptId(db, attempt.id);
  let token: string | null;
  if (!bfv) {
    token = await provisionAndVerifyBfv(db, deps, attempt.id, facts);
  } else if (bfv.verificationStatus === "verified") {
    token = bfv.telegramDeepLinkToken;
  } else if (bfv.verificationStatus === "pending_verification") {
    token = await verifyBfv(db, deps, bfv);
  } else {
    // verification_failed was persisted but the state flip was lost mid-crash.
    token = null;
  }
  if (token === null) {
    await setState(db, attempt.id, "generated", "needs_attention");
    logger.warn("attempt_needs_attention", {
      attemptId: attempt.id,
      reason: "bfv_verification_failed",
    });
    return { ...base, workflowState: "needs_attention" };
  }

  // --- Script + lint — an existing current revision is linted, not regenerated ---
  const existingScript = await ScriptRepo.getCurrentByAttemptId(db, attempt.id);
  const outcome = await runScriptAndLint(
    db,
    deps,
    attempt.id,
    facts,
    deepLinkUrl(deps, token),
    existingScript,
  );
  return { ...base, workflowState: outcome };
}

export interface RunBatchInput {
  prospectList: Array<{ businessName: string; sourceUrl: string }>;
  batchDate: string;
}

export interface RunBatchResult {
  batchDate: string;
  accepted: number;
  deduped: number;
  /** Attempts recovered by the Resume Rule sweep (T104). */
  resumed: number;
  processing: Array<ProcessProspectResult>;
}

export async function runBatch(
  db: Db,
  deps: BatchOrchestratorDeps,
  input: RunBatchInput,
): Promise<RunBatchResult> {
  const results: ProcessProspectResult[] = [];
  let deduped = 0;

  // --- Resume Rule sweep (T104) — before the day's list is processed ---
  // Only attempts at exactly `generated` for this date qualify; every
  // TERMINAL_TO_BATCH_RESUME state is excluded by the query itself, so a
  // retry can never double-produce work already at rest in the review
  // queue or beyond (Constitution Principle VII).
  const stranded = await AttemptRepo.findResumable(db, input.batchDate);
  for (const attempt of stranded) {
    results.push(await resumeAttempt(db, deps, attempt));
  }

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
    resumed: stranded.length,
    shortfall: results.length - deduped < 100,
  });

  return {
    batchDate: input.batchDate,
    accepted: results.length - deduped,
    deduped,
    resumed: stranded.length,
    processing: results,
  };
}
