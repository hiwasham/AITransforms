import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AddressInfo } from "node:net";
import { describe, expect, it } from "vitest";
import { startDashboard } from "@/server/dashboard-main.js";

describe("dashboard production runtime", () => {
  it(
    "binds only to loopback, applies the 1 MiB bridge cap, and stops cleanly",
    async () => {
      const dbDataDir = await mkdtemp(join(tmpdir(), "outreach-dashboard-"));
      const env: NodeJS.ProcessEnv = {
        OUTREACH_RUNTIME_MODE: "dashboard",
        OUTREACH_DISPATCH_MODE: "mock",
        OUTREACH_DB_DATA_DIR: dbDataDir,
        OUTREACH_PUBLIC_ORIGIN: "https://outreach.example.test:10000",
        OUTREACH_OPERATOR_PASSWORD: Buffer.alloc(16, 7).toString("base64url"),
        OUTREACH_SESSION_SIGNING_KEY: Buffer.alloc(32, 9).toString("base64url"),
      };

      try {
        const runtime = await startDashboard({ env, port: 0 });
        try {
          const address = runtime.server.address() as AddressInfo;
          expect(address.address).toBe("127.0.0.1");
          const base = `http://127.0.0.1:${address.port}`;

          const health = await fetch(`${base}/healthz`);
          expect(health.status).toBe(200);

          const oversized = await fetch(`${base}/login`, {
            method: "POST",
            headers: {
              origin: env.OUTREACH_PUBLIC_ORIGIN!,
              "content-type": "application/x-www-form-urlencoded",
            },
            body: "x".repeat(1024 * 1024 + 1),
          });
          expect(oversized.status).toBe(413);
          expect(oversized.headers.get("cache-control")).toBe("no-store");
          expect(oversized.headers.get("content-security-policy")).toContain(
            "frame-ancestors 'none'",
          );
        } finally {
          await runtime.stop();
        }
        expect(runtime.server.listening).toBe(false);
      } finally {
        await rm(dbDataDir, { recursive: true, force: true });
      }
    },
    120_000,
  );
});
