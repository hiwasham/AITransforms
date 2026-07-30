/**
 * node:http <-> web-standard Request/Response bridge for the served
 * runtime (T100). The route handlers already speak fetch types; this file
 * converts an IncomingMessage into a Request, hands it to the app, and
 * writes the Response back. Handler crashes surface as a JSON 500 with no
 * internals in the body (details go to the structured log instead —
 * Constitution V/VI).
 */

import { createServer, type Server, type IncomingMessage } from "node:http";
import type { App } from "./router.js";
import { logger } from "@/lib/logger.js";

export interface HttpServerOptions {
  /** null preserves the full runtime's historical unbounded behavior. */
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

function bridgeErrorHeaders(options: HttpServerOptions): Record<string, string> {
  return {
    ...(options.errorHeaders ?? {}),
    "content-type": "application/json",
  };
}

export function createHttpServer(app: App, options: HttpServerOptions): Server {
  if (
    options.maxBodyBytes !== null &&
    (!Number.isSafeInteger(options.maxBodyBytes) || options.maxBodyBytes < 0)
  ) {
    throw new Error("maxBodyBytes must be a non-negative safe integer or null");
  }

  return createServer(async (req, res) => {
    try {
      const url = `http://${req.headers.host ?? "localhost"}${req.url ?? "/"}`;
      const method = req.method ?? "GET";
      const body =
        method === "GET" || method === "HEAD"
          ? undefined
          : await readBody(req, options.maxBodyBytes);
      const request = new Request(url, {
        method,
        headers: Object.entries(req.headers).flatMap(([name, value]) =>
          value === undefined
            ? []
            : Array.isArray(value)
              ? value.map((v) => [name, v] as [string, string])
              : [[name, value] as [string, string]],
        ),
        body: body && body.length > 0 ? body : undefined,
      });

      const response = await app.handle(request);
      const payload = Buffer.from(await response.arrayBuffer());
      const headers: Record<string, string> = {};
      response.headers.forEach((value, name) => {
        headers[name] = value;
      });
      res.writeHead(response.status, headers);
      res.end(payload);
    } catch (error) {
      if (error instanceof RequestBodyTooLargeError) {
        res.writeHead(413, bridgeErrorHeaders(options));
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
      const raw = error instanceof Error ? error.message : String(error);
      logger.error("http_request_failed", {
        method: req.method,
        path: req.url,
        error: raw,
      });
      res.writeHead(500, bridgeErrorHeaders(options));
      res.end(
        JSON.stringify({
          error: { code: "internal_error", message: "Internal server error" },
        }),
      );
    }
  });
}
