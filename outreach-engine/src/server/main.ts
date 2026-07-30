/**
 * Production entry point for the served runtime (T100): a single
 * systemd-managed long-lived Node process (plan.md Target Platform)
 * hosting the seven contract HTTP endpoints plus the Telegram long-poll
 * update transport (T111), so BFV deep-link conversations and
 * POST /webhooks/:provider are live.
 *
 * Run: `npm start` (see package.json — node with type stripping plus the
 * `@/` alias loader). Required env: OUTREACH_DB_DATA_DIR,
 * ANTHROPIC_API_KEY, TELEGRAM_BOT_TOKEN. Optional: OUTREACH_PORT
 * (default 3100), OUTREACH_TELEGRAM_BOT_USERNAME, webhook secrets.
 *
 * Startup is fail-fast on missing required config; missing webhook
 * secrets only warn because those endpoints already fail closed (every
 * signature check rejects). Dispatch still uses MockDispatchClient until
 * the real provider clients land (T059/T060) — loudly logged at boot so
 * the go-live gap is visible in the journal.
 */

import type { AddressInfo } from "node:net";
import { pathToFileURL } from "node:url";
import { loadConfig, type Config } from "@/lib/config.js";
import { createDb } from "@/db/client.js";
import { logger } from "@/lib/logger.js";
import { AnthropicLLMClient } from "@/services/llm/anthropic-client.js";
import { MockDispatchClient } from "@/services/dispatch/mock-client.js";
import { TelegramBFVBotClient } from "@/services/telegram/telegram-bfv-bot-client.js";
import { DbBFVContextStore } from "@/services/telegram/db-context-store.js";
import { TelegramLongPollTransport } from "@/services/telegram/update-transport.js";
import { createApp } from "./app.js";
import { createHttpServer } from "./http.js";

const DEFAULT_PORT = 3100;

/** Fail-fast guard: the served runtime must not boot half-configured. */
export function assertServableConfig(config: Config): void {
  const missing: string[] = [];
  if (!config.dbDataDir) missing.push("OUTREACH_DB_DATA_DIR");
  if (!config.llmApiKey) missing.push("ANTHROPIC_API_KEY");
  if (!config.telegramBotToken) missing.push("TELEGRAM_BOT_TOKEN");
  if (missing.length > 0) {
    throw new Error(
      `Served runtime requires environment variables: ${missing.join(", ")}`,
    );
  }
}

export async function main(): Promise<void> {
  const config = loadConfig();
  assertServableConfig(config);

  const db = await createDb(config.dbDataDir);
  const llmClient = new AnthropicLLMClient({
    apiKey: config.llmApiKey!,
    model: config.llmModel,
    timeoutMs: config.llmTimeoutMs,
  });
  const botClient = new TelegramBFVBotClient({
    botToken: config.telegramBotToken!,
    botUsername: config.telegramBotUsername,
    contextStore: new DbBFVContextStore(db),
    llmClient,
  });
  const transport = new TelegramLongPollTransport({
    botToken: config.telegramBotToken!,
    consumer: botClient,
  });

  const dispatchClient = new MockDispatchClient();
  logger.warn("dispatch_client_mock_active", {
    note: "real provider dispatch clients (T059/T060) not yet implemented — sends are simulated",
  });
  if (!config.instantlyWebhookSecret || !config.unipileWebhookSecret) {
    logger.warn("webhook_secret_missing", {
      note: "unset provider webhook secrets: those /webhooks/:provider requests will all be rejected (fail-closed)",
    });
  }

  const app = createApp({
    db,
    llmClient,
    botClient,
    dispatchClient,
    webhookSecrets: {
      instantly: config.instantlyWebhookSecret ?? "",
      unipile: config.unipileWebhookSecret ?? "",
    },
    telegramBotUsername: config.telegramBotUsername,
  });

  const server = createHttpServer(app, { maxBodyBytes: null });
  const port = Number(process.env.OUTREACH_PORT) || DEFAULT_PORT;
  await new Promise<void>((resolve) => server.listen(port, resolve));
  transport.start();
  logger.info("server_started", {
    port: (server.address() as AddressInfo).port,
    dbDataDir: config.dbDataDir,
  });

  let shuttingDown = false;
  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info("server_shutdown_begin", { signal });
    await transport.stop();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await db.close();
    logger.info("server_stopped", {});
    process.exit(0);
  };
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

// Only boot when executed as the entry point (`npm start`), never on
// import — the test suite imports assertServableConfig from here.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    logger.error("server_start_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  });
}
