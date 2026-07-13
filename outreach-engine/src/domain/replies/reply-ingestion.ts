/**
 * Reply Ingestion (T063, contracts/dispatch-webhook.md "Processing contract").
 *
 * verify -> dedup -> match provider_thread_id -> outcome-regression guard
 * (apply `replied` only from `sent`/`unresponsive`; retain-but-don't-move
 * for `call_booked`/`closed`; harmless no-op if already `replied`) -> halt
 * cadence only when applied.
 */

import type { Db } from "@/db/client.js";
import * as WebhookEventRepo from "./webhook-event.js";
import type { WebhookProvider } from "./webhook-event.js";
import * as AttemptRepo from "@/domain/prospects/outreach-attempt.js";
import * as ProspectRepo from "@/domain/prospects/prospect.js";
import * as CadenceRepo from "@/domain/cadence/follow-up-cadence-state.js";
import { verifyWebhookSignature } from "@/services/dispatch/webhook-signature.js";
import { logger } from "@/lib/logger.js";

export interface ReplyEventPayload {
  providerEventId: string;
  threadId: string;
  eventType: string;
}

export interface ReplyWebhookInput {
  provider: WebhookProvider;
  rawBody: string;
  signatureHeader: string | null | undefined;
  secret: string;
  payload: ReplyEventPayload;
}

export interface ReplyIngestionResult {
  signatureValid: boolean;
  processed: boolean;
  deduplicated: boolean;
  matched: boolean;
  applied: boolean;
}

const REPLY_TRIGGERS_TRANSITION: ReadonlySet<string> = new Set([
  "sent",
  "unresponsive",
]);

export async function ingestReply(
  db: Db,
  input: ReplyWebhookInput,
): Promise<ReplyIngestionResult> {
  const signatureValid = verifyWebhookSignature(
    input.rawBody,
    input.signatureHeader,
    input.secret,
  );
  if (!signatureValid) {
    logger.warn("webhook_signature_rejected", { provider: input.provider });
    return {
      signatureValid: false,
      processed: false,
      deduplicated: false,
      matched: false,
      applied: false,
    };
  }

  if (input.payload.eventType !== "reply") {
    return {
      signatureValid: true,
      processed: true,
      deduplicated: false,
      matched: false,
      applied: false,
    };
  }

  const existing = await WebhookEventRepo.findByProviderEventId(
    db,
    input.provider,
    input.payload.providerEventId,
  );
  if (existing) {
    return {
      signatureValid: true,
      processed: true,
      deduplicated: true,
      matched: existing.matchedOutreachAttemptId !== null,
      applied: false,
    };
  }

  const attempt = await AttemptRepo.findByProviderThreadId(
    db,
    input.payload.threadId,
  );
  if (!attempt) {
    await WebhookEventRepo.create(db, {
      provider: input.provider,
      providerEventId: input.payload.providerEventId,
      signatureVerified: true,
      matchedOutreachAttemptId: null,
      resultedInTransition: false,
    });
    logger.warn("webhook_thread_unmatched", {
      provider: input.provider,
      threadId: input.payload.threadId,
    });
    return {
      signatureValid: true,
      processed: true,
      deduplicated: false,
      matched: false,
      applied: false,
    };
  }

  const prospect = await ProspectRepo.getById(db, attempt.prospectId);
  const applied = Boolean(
    prospect && REPLY_TRIGGERS_TRANSITION.has(prospect.currentOutcomeStatus),
  );

  if (applied && prospect) {
    await ProspectRepo.setOutcomeStatus(db, prospect.id, "replied");
    await CadenceRepo.markInactive(db, attempt.id);
  } else if (prospect) {
    logger.info("webhook_reply_superseded", {
      provider: input.provider,
      outreachAttemptId: attempt.id,
      currentOutcomeStatus: prospect.currentOutcomeStatus,
    });
  }

  await WebhookEventRepo.create(db, {
    provider: input.provider,
    providerEventId: input.payload.providerEventId,
    signatureVerified: true,
    matchedOutreachAttemptId: attempt.id,
    resultedInTransition: applied,
  });

  return {
    signatureValid: true,
    processed: true,
    deduplicated: false,
    matched: true,
    applied,
  };
}
