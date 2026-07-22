/**
 * Composition root + router for the served runtime (T100). Wires the
 * existing factory route handlers (`src/api/**\/route.ts`) — until now
 * invoked only directly by the test suite — into a single
 * `handle(Request) => Response` app that the node:http bridge (http.ts)
 * serves.
 *
 * Routing is a flat table over the seven contract endpoints; `:name`
 * segments capture dynamic params in the `{ params }` ctx shape the
 * handlers already take. No framework: the handlers speak web-standard
 * Request/Response, so plain matching is all that's needed
 * (plan.md names Next.js Route Handlers as the eventual host — the
 * handlers keep that exact signature, this just serves them without
 * pulling Next.js into a dependency surface that is otherwise PGLite-only).
 */

import type { Db } from "@/db/client.js";
import { readFile } from "node:fs/promises";
import type { LLMClient } from "@/services/llm/llm-client.js";
import type { BFVBotClient } from "@/services/telegram/bfv-bot-client.js";
import type { DispatchClient } from "@/services/dispatch/interface.js";
import type { WebhookSecrets } from "@/api/webhooks/[provider]/route.js";
import { scrapeUrl } from "@/services/scraper/scraper-client.js";
import { createGenerateBatchHandler } from "@/api/batches/generate/route.js";
import { createGetBatchHandler } from "@/api/batches/[date]/route.js";
import { createListProspectsHandler } from "@/api/prospects/route.js";
import { createGetProspectHandler } from "@/api/prospects/[id]/route.js";
import { createApproveHandler } from "@/api/prospects/[id]/approve/route.js";
import { createDispatchProcessHandler } from "@/api/internal/dispatch/process/route.js";
import { createWebhookHandler } from "@/api/webhooks/[provider]/route.js";
import { createReviewImportHandler } from "@/api/review/imports/route.js";
import { createNextPackageHandler } from "@/api/review/packages/next/route.js";
import { createGetReviewPackageHandler } from "@/api/review/packages/[id]/route.js";
import { createDecisionHandler } from "@/api/review/packages/[id]/decision/route.js";
import { createRejectionReasonHandler } from "@/api/review/packages/[id]/rejection-reason/route.js";
import { errorResponse } from "@/api/lib/errors.js";

export interface AppDeps {
  db: Db;
  llmClient: LLMClient;
  botClient: BFVBotClient;
  dispatchClient: DispatchClient;
  webhookSecrets: WebhookSecrets;
  telegramBotUsername: string;
}

export interface App {
  handle(req: Request): Promise<Response>;
}

type RouteHandler = (
  req: Request,
  ctx: { params: Record<string, string> },
) => Promise<Response>;

interface Route {
  method: string;
  segments: string[]; // ":name" segments capture
  handler: RouteHandler;
}

function matchParams(
  segments: string[],
  path: string[],
): Record<string, string> | null {
  if (segments.length !== path.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;
    if (seg.startsWith(":")) params[seg.slice(1)] = decodeURIComponent(path[i]!);
    else if (seg !== path[i]) return null;
  }
  return params;
}

export function createApp(deps: AppDeps): App {
  const { db } = deps;
  const routes: Route[] = [
    {
      method: "POST",
      segments: ["batches", "generate"],
      handler: createGenerateBatchHandler(db, {
        scrapeUrl,
        botClient: deps.botClient,
        llmClient: deps.llmClient,
        telegramBotUsername: deps.telegramBotUsername,
      }) as RouteHandler,
    },
    {
      method: "GET",
      segments: ["batches", ":date"],
      handler: createGetBatchHandler(db) as RouteHandler,
    },
    {
      method: "GET",
      segments: ["prospects"],
      handler: createListProspectsHandler(db) as RouteHandler,
    },
    {
      method: "GET",
      segments: ["prospects", ":id"],
      handler: createGetProspectHandler(db) as RouteHandler,
    },
    {
      method: "POST",
      segments: ["prospects", ":id", "approve"],
      handler: createApproveHandler(db) as RouteHandler,
    },
    {
      method: "POST",
      segments: ["internal", "dispatch", "process"],
      handler: createDispatchProcessHandler(db, deps.dispatchClient) as RouteHandler,
    },
    {
      method: "POST",
      segments: ["webhooks", ":provider"],
      handler: createWebhookHandler(db, deps.webhookSecrets) as RouteHandler,
    },
    // Review dashboard (specs/002-operator-review-dashboard MVP-0).
    // Isolated from the workflow state machine (spec 002 FR-018).
    {
      method: "POST",
      segments: ["review", "imports"],
      handler: createReviewImportHandler(db) as RouteHandler,
    },
    {
      method: "GET",
      segments: ["review", "packages", "next"],
      handler: createNextPackageHandler(db) as RouteHandler,
    },
    {
      method: "GET",
      segments: ["review", "packages", ":id"],
      handler: createGetReviewPackageHandler(db) as RouteHandler,
    },
    {
      method: "POST",
      segments: ["review", "packages", ":id", "decision"],
      handler: createDecisionHandler(db) as RouteHandler,
    },
    {
      method: "POST",
      segments: ["review", "packages", ":id", "rejection-reason"],
      handler: createRejectionReasonHandler(db) as RouteHandler,
    },
  ];

  // Review UI (M009): two static files served from src/ui/ by explicit
  // allowlist — no generic file serving, so path traversal is
  // structurally impossible (plan 002 Security Considerations).
  const uiRoot = new URL("../ui/", import.meta.url);
  const UI_FILES: Record<string, { file: string; type: string }> = {
    "/": { file: "index.html", type: "text/html; charset=utf-8" },
    "/ui/review.js": { file: "review.js", type: "text/javascript; charset=utf-8" },
  };

  async function serveUi(pathname: string): Promise<Response | null> {
    const entry = UI_FILES[pathname];
    if (!entry) return null;
    const body = await readFile(new URL(entry.file, uiRoot), "utf8");
    return new Response(body, { headers: { "content-type": entry.type } });
  }

  return {
    async handle(req: Request): Promise<Response> {
      const url = new URL(req.url);
      if (req.method === "GET") {
        const ui = await serveUi(url.pathname);
        if (ui) return ui;
      }
      const path = url.pathname.split("/").filter(Boolean);
      for (const route of routes) {
        if (route.method !== req.method) continue;
        const params = matchParams(route.segments, path);
        if (params) return route.handler(req, { params });
      }
      return errorResponse("not_found", "No such endpoint", 404);
    },
  };
}
