import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { pathToFileURL } from "node:url";
import { createDb } from "@/db/client.js";
import { logger } from "@/lib/logger.js";
import { loadDashboardConfig } from "./dashboard-auth.js";
import {
  createDashboardApp,
  DASHBOARD_SECURITY_HEADERS,
} from "./dashboard-app.js";
import { createHttpServer } from "./http.js";

const DEFAULT_PORT = 3100;
const DASHBOARD_HOST = "127.0.0.1";
const DASHBOARD_BODY_LIMIT = 1024 * 1024;

export interface DashboardStartOptions {
  env?: NodeJS.ProcessEnv;
  /** Test seam; production obtains a non-zero port from OUTREACH_PORT. */
  port?: number;
}

export interface DashboardRuntime {
  server: Server;
  stop(): Promise<void>;
}

function dashboardPort(env: NodeJS.ProcessEnv, override?: number): number {
  if (override !== undefined) {
    if (!Number.isInteger(override) || override < 0 || override > 65535) {
      throw new Error("Dashboard port override must be between 0 and 65535");
    }
    return override;
  }
  if (env.OUTREACH_PORT === undefined) return DEFAULT_PORT;
  const port = Number(env.OUTREACH_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("OUTREACH_PORT must be an integer between 1 and 65535");
  }
  return port;
}

export async function startDashboard(
  options: DashboardStartOptions = {},
): Promise<DashboardRuntime> {
  const env = options.env ?? process.env;
  const config = loadDashboardConfig(env);
  const port = dashboardPort(env, options.port);
  const db = await createDb(config.dbDataDir);
  const app = createDashboardApp({ db, config });
  const server = createHttpServer(app, {
    maxBodyBytes: DASHBOARD_BODY_LIMIT,
    errorHeaders: { ...DASHBOARD_SECURITY_HEADERS },
  });

  try {
    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(port, DASHBOARD_HOST, () => {
        server.off("error", reject);
        resolve();
      });
    });
  } catch (error) {
    await db.close();
    throw error;
  }

  logger.info("dashboard_server_started", {
    host: DASHBOARD_HOST,
    port: (server.address() as AddressInfo).port,
    runtime_mode: "dashboard",
    dispatch_mode: "mock",
  });

  let stopped = false;
  return {
    server,
    async stop(): Promise<void> {
      if (stopped) return;
      stopped = true;
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
      await db.close();
      logger.info("dashboard_server_stopped", {});
    },
  };
}

async function main(): Promise<void> {
  const runtime = await startDashboard();
  let shuttingDown = false;
  const shutdown = async (signal: string): Promise<void> => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info("dashboard_server_shutdown_begin", { signal });
    await runtime.stop();
    process.exit(0);
  };
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    logger.error("dashboard_server_start_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  });
}
