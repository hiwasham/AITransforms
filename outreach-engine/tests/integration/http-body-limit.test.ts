import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import { request as httpRequest, type Server } from "node:http";
import type { App } from "@/server/router.js";
import { createHttpServer } from "@/server/http.js";

describe("bounded HTTP request bodies", () => {
  let server: Server;
  let base: string;

  beforeEach(async () => {
    const app: App = {
      async handle(request) {
        return new Response(
          JSON.stringify({ bytes: (await request.arrayBuffer()).byteLength }),
          { headers: { "content-type": "application/json" } },
        );
      },
    };
    server = createHttpServer(app, {
      maxBodyBytes: 8,
      errorHeaders: { "cache-control": "no-store" },
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address() as AddressInfo;
    base = `http://127.0.0.1:${port}`;
  });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  });

  it("accepts the exact configured boundary", async () => {
    const response = await fetch(base, { method: "POST", body: "12345678" });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ bytes: 8 });
  });

  it("rejects a raw Content-Length over the limit with a fixed 413", async () => {
    const response = await fetch(base, { method: "POST", body: "123456789" });

    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({
      error: { code: "payload_too_large", message: "Payload too large" },
    });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("rejects chunked input as soon as its total crosses the limit", async () => {
    const { status, body, headers } = await new Promise<{
      status: number;
      body: string;
      headers: Record<string, string | string[] | undefined>;
    }>((resolve, reject) => {
      const url = new URL(base);
      const request = httpRequest(
        {
          hostname: url.hostname,
          port: url.port,
          path: "/",
          method: "POST",
          headers: { "content-type": "application/octet-stream" },
        },
        (response) => {
          const chunks: Buffer[] = [];
          response.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
          response.on("end", () =>
            resolve({
              status: response.statusCode ?? 0,
              body: Buffer.concat(chunks).toString("utf8"),
              headers: response.headers,
            }),
          );
        },
      );
      request.on("error", reject);
      request.write("12345");
      request.end("6789");
    });

    expect(status).toBe(413);
    expect(JSON.parse(body)).toEqual({
      error: { code: "payload_too_large", message: "Payload too large" },
    });
    expect(headers["cache-control"]).toBe("no-store");
  });
});
