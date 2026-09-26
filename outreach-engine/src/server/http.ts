/**
 * node:http <-> web-standard Request/Response bridge for the served
 * runtime (T100). The route handlers already speak fetch types; this file
 * converts an IncomingMessage into a Request, hands it to the app, and
 * writes the Response back. Handler crashes surface as a JSON 500 with no
 * internals in the body (details go to the structured log instead —
 * Constitution V/VI).
 */

import { createServer, type Server, type IncomingMessage } from "node:http";
import { randomUUID } from "node:crypto";
import type { App } from "./router.js";
import { logger } from "@/lib/logger.js";

export interface HttpServerOptions {
  /** null disables the cap for explicit internal or test callers. */
  maxBodyBytes: number | null;
  /** Headers applied to bridge-generated 413 and 500 responses. */
  errorHeaders?: Record<string, string>;
}

class RequestBodyTooLargeError extends Error {}

async function readBody(
  req: IncomingMessage,
  maxBodyBytes: number | null,
): Promise<Buffer> {
  const declaredLength = req.headers["content-length"];
  if (
    maxBodyBytes !== null &&
    declaredLength !== undefined &&
    Number(declaredLength) > maxBodyBytes
  ) {
    req.resume();
    throw new RequestBodyTooLargeError();
  }

  const chunks: Buffer[] = [];
  let total = 0;
  let oversized = false;
  for await (const chunk of req) {
    const buffer = Buffer.from(chunk as Uint8Array);
    total += buffer.length;
    if (maxBodyBytes !== null && total > maxBodyBytes) {
      oversized = true;
      chunks.length = 0;
      continue;
    }
    if (!oversized) chunks.push(buffer);
  }
  if (oversized) throw new RequestBodyTooLargeError();
  return Buffer.concat(chunks);
}

function bridgeErrorHeaders(
  options: HttpServerOptions,
  requestId: string,
): Record<string, string> {
  return {
    ...(options.errorHeaders ?? {}),
    "content-type": "application/json",
    "x-request-id": requestId,
  };
}

function requestHeaders(req: IncomingMessage, requestId: string): Headers {
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) headers.append(name, item);
    } else {
      headers.append(name, value);
    }
  }
  headers.set("x-request-id", requestId);
  return headers;
}

export function createHttpServer(app: App, options: HttpServerOptions): Server {
  if (
    options.maxBodyBytes !== null &&
    (!Number.isSafeInteger(options.maxBodyBytes) || options.maxBodyBytes < 0)
  ) {
    throw new Error("maxBodyBytes must be a non-negative safe integer or null");
  }

  return createServer(async (req, res) => {
    const requestId = randomUUID();
    try {
      const url = `http://${req.headers.host ?? "localhost"}${req.url ?? "/"}`;
      const method = req.method ?? "GET";
      const body =
        method === "GET" || method === "HEAD"
          ? undefined
          : await readBody(req, options.maxBodyBytes);
      const request = new Request(url, {
        method,
        headers: requestHeaders(req, requestId),
        body: body && body.length > 0 ? body : undefined,
      });

      const response = await app.handle(request);
      const payload = Buffer.from(await response.arrayBuffer());
      const headers: Record<string, string> = {};
      response.headers.forEach((value, name) => {
        headers[name] = value;
      });
      headers["x-request-id"] = requestId;
      res.writeHead(response.status, headers);
      res.end(payload);
      logger.info("http_request_completed", {
        request_id: requestId,
        method,
        status: response.status,
      });
    } catch (error) {
      if (error instanceof RequestBodyTooLargeError) {
        logger.warn("http_request_rejected", {
          request_id: requestId,
          method: req.method ?? "GET",
          status: 413,
        });
        res.writeHead(413, bridgeErrorHeaders(options, requestId));
        res.end(
          JSON.stringify({
            error: {
              code: "payload_too_large",
              message: "Payload too large",
            },
          }),
        );
        return;
      }
      logger.error("http_request_failed", {
        request_id: requestId,
        method: req.method ?? "GET",
        status: 500,
        error_name: error instanceof Error ? error.name : "UnknownError",
      });
      res.writeHead(500, bridgeErrorHeaders(options, requestId));
      res.end(
        JSON.stringify({
          error: { code: "internal_error", message: "Internal server error" },
        }),
      );
    }
  });
}
