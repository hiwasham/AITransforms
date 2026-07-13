/**
 * Environment/secrets config loader (T013). Never logged (plan.md Security
 * Considerations — Constitution Principle V).
 *
 * MVP-1 scope: only the fields the vertical slice actually touches
 * (DB path, plus placeholders for the LLM/Telegram/dispatch credentials
 * that real, non-mocked clients will need in Phase 2/Future — reading
 * them here now, even unused, keeps the loader the single place secrets
 * ever get read from env).
 */

export interface Config {
  dbDataDir: string | undefined; // undefined = in-memory (tests)
  llmApiKey: string | undefined;
  llmModel: string;
  llmTimeoutMs: number;
  telegramBotToken: string | undefined;
  telegramBotUsername: string;
  instantlyApiKey: string | undefined;
  instantlyWebhookSecret: string | undefined;
  unipileApiKey: string | undefined;
  unipileWebhookSecret: string | undefined;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const timeoutMs = Number(env.OUTREACH_LLM_TIMEOUT_MS);
  return {
    dbDataDir: env.OUTREACH_DB_DATA_DIR,
    llmApiKey: env.ANTHROPIC_API_KEY,
    llmModel: env.OUTREACH_LLM_MODEL ?? "claude-sonnet-5",
    llmTimeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 60_000,
    telegramBotToken: env.TELEGRAM_BOT_TOKEN,
    telegramBotUsername: env.OUTREACH_TELEGRAM_BOT_USERNAME ?? "AITransformsBot",
    instantlyApiKey: env.INSTANTLY_API_KEY,
    instantlyWebhookSecret: env.INSTANTLY_WEBHOOK_SECRET,
    unipileApiKey: env.UNIPILE_API_KEY,
    unipileWebhookSecret: env.UNIPILE_WEBHOOK_SECRET,
  };
}
