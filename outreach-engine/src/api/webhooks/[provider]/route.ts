/**
 * POST /webhooks/:provider (T066, contracts/dispatch-webhook.md).
 *
 * Fail-closed signature check; synchronous inline processing (no queue) to
 * meet the SC-006 5-minute detection-and-halt bound; response includes
 * `applied` per the outcome-regression guard.
 */

import type { Db } from "@/db/client.js";
import type { WebhookProvider } from "@/domain/replies/webhook-event.js";
import { ingestReply, type ReplyEventPayload } from "@/domain/replies/reply-ingestion.js";
import { jsonResponse, errorResponse } from "@/api/lib/errors.js";

export interface WebhookSecrets {
  instantly: string;
  unipile: string;
}

const SIGNATURE_HEADER = "x-webhook-signature";

function isKnownProvider(value: string): value is WebhookProvider {
  return value === "instantly" || value === "unipile";
}

export function createWebhookHandler(db: Db, secrets: WebhookSecrets) {
  return async function POST(
    req: Request,
    ctx: { params: { provider: string } },
  ): Promise<Response> {
    const { provider } = ctx.params;
    if (!isKnownProvider(provider)) {
      return errorResponse("unknown_provider", `Unknown provider '${provider}'`, 404);
    }

    const rawBody = await req.text();
    const signatureHeader = req.headers.get(SIGNATURE_HEADER);

    let payload: ReplyEventPayload;
    try {
      payload = JSON.parse(rawBody) as ReplyEventPayload;
    } catch {
      return errorResponse("invalid_body", "Request body must be valid JSON", 400);
    }

    const result = await ingestReply(db, {
      provider,
      rawBody,
      signatureHeader,
      secret: secrets[provider],
      payload,
    });

    if (!result.signatureValid) {
      return errorResponse("invalid_signature", "Webhook signature missing or invalid", 401);
    }

    return jsonResponse({
      processed: result.processed,
      deduplicated: result.deduplicated,
      matched: result.matched,
      applied: result.applied,
    });
  };
}
