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
  telegramBotToken: string | undefined;
  instantlyApiKey: string | undefined;
  instantlyWebhookSecret: string | undefined;
  unipileApiKey: string | undefined;
  unipileWebhookSecret: string | undefined;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    dbDataDir: env.OUTREACH_DB_DATA_DIR,
    llmApiKey: env.ANTHROPIC_API_KEY,
    telegramBotToken: env.TELEGRAM_BOT_TOKEN,
    instantlyApiKey: env.INSTANTLY_API_KEY,
    instantlyWebhookSecret: env.INSTANTLY_WEBHOOK_SECRET,
    unipileApiKey: env.UNIPILE_API_KEY,
    unipileWebhookSecret: env.UNIPILE_WEBHOOK_SECRET,
  };
}
