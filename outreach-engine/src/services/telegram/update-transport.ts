/**
 * Telegram update transport (T111, FR-016): a long-poll loop that feeds
 * incoming updates to TelegramBFVBotClient.processUpdate().
 *
 * Long-poll (`getUpdates` with offset tracking) was chosen over
 * `setWebhook` because it needs no externally-addressable URL — the served
 * runtime (T100) is not yet deployed, and long-poll works from any
 * long-lived process. The T100 runtime owns the lifecycle: it calls
 * start() on boot and stop() on shutdown (SIGTERM).
 *
 * Failure isolation: a consumer error on one update is logged and the
 * offset still advances (a poison update must not wedge the loop); a
 * failed poll is logged and retried after a delay. All lifecycle and
 * failure events are structured logs (Constitution VI), and the bot token
 * — which Telegram forces into the request URL — is scrubbed from every
 * error before it is logged (Constitution V).
 */

import type { TelegramUpdate } from "./telegram-bfv-bot-client.js";
import { logger } from "@/lib/logger.js";

/** An update as delivered by getUpdates: payload plus its sequence id. */
export interface IncomingTelegramUpdate extends TelegramUpdate {
  update_id: number;
}

/** What the transport feeds — TelegramBFVBotClient satisfies this. */
export interface UpdateConsumer {
  processUpdate(update: TelegramUpdate): Promise<void>;
}

export interface UpdateTransportOptions {
  botToken: string;
  consumer: UpdateConsumer;
  /** Telegram long-poll hold time in seconds (default 30). */
  pollTimeoutSeconds?: number;
  /** Delay before retrying after a failed poll (default 5000ms). */
  retryDelayMs?: number;
  /** Test seam — point at a fixture instead of api.telegram.org. */
  baseUrl?: string;
  /** Test seam — inject a fake fetch; defaults to the global. */
  fetchImpl?: typeof fetch;
}

interface GetUpdatesResponse {
  ok?: boolean;
  result?: IncomingTelegramUpdate[];
}

export class TelegramLongPollTransport {
  private readonly botToken: string;
  private readonly consumer: UpdateConsumer;
  private readonly pollTimeoutSeconds: number;
  private readonly retryDelayMs: number;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  private offset: number | undefined;
  private running = false;
  private loop: Promise<void> | null = null;
  private abort: AbortController | null = null;

  constructor(options: UpdateTransportOptions) {
    if (!options.botToken) {
      throw new Error(
        "TelegramLongPollTransport requires a bot token (set TELEGRAM_BOT_TOKEN)",
      );
    }
    this.botToken = options.botToken;
    this.consumer = options.consumer;
    this.pollTimeoutSeconds = options.pollTimeoutSeconds ?? 30;
    this.retryDelayMs = options.retryDelayMs ?? 5000;
    this.baseUrl = options.baseUrl ?? "https://api.telegram.org";
    this.fetchImpl =
      options.fetchImpl ?? ((...args) => globalThis.fetch(...args));
  }

  /** Begin polling. The served runtime (T100) calls this on boot. */
  start(): void {
    if (this.running) {
      throw new Error("TelegramLongPollTransport is already running");
    }
    this.running = true;
    logger.info("bfv_transport_started", {
      pollTimeoutSeconds: this.pollTimeoutSeconds,
    });
    this.loop = this.run();
  }

  /**
   * Stop polling: aborts the in-flight getUpdates and resolves once the
   * loop has fully exited. Safe to call when never started.
   */
  async stop(): Promise<void> {
    if (!this.running) return;
    this.running = false;
    this.abort?.abort();
    await this.loop;
    this.loop = null;
    logger.info("bfv_transport_stopped", {});
  }

  private async run(): Promise<void> {
    while (this.running) {
      let updates: IncomingTelegramUpdate[];
      try {
        updates = await this.poll();
      } catch (error) {
        if (!this.running) return; // aborted by stop()
        const raw = error instanceof Error ? error.message : String(error);
        logger.error("bfv_transport_poll_failed", { error: this.scrub(raw) });
        await this.sleep(this.retryDelayMs);
        continue;
      }
      for (const update of updates) {
        // Advance first: a poison update must not be re-fetched forever.
        this.offset = update.update_id + 1;
        try {
          await this.consumer.processUpdate(update);
        } catch (error) {
          const raw = error instanceof Error ? error.message : String(error);
          logger.error("bfv_transport_update_failed", {
            updateId: update.update_id,
            error: this.scrub(raw),
          });
        }
      }
    }
  }

  private async poll(): Promise<IncomingTelegramUpdate[]> {
    this.abort = new AbortController();
    const res = await this.fetchImpl(
      `${this.baseUrl}/bot${this.botToken}/getUpdates`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          timeout: this.pollTimeoutSeconds,
          allowed_updates: ["message"],
          ...(this.offset !== undefined ? { offset: this.offset } : {}),
        }),
        signal: this.abort.signal,
      },
    );
    if (!res.ok) {
      throw new Error(`Telegram getUpdates failed with HTTP ${res.status}`);
    }
    const body = (await res.json()) as GetUpdatesResponse;
    if (body.ok !== true) {
      throw new Error("Telegram getUpdates returned ok=false");
    }
    return body.result ?? [];
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private scrub(text: string): string {
    return text.replaceAll(this.botToken, "[redacted-bot-token]");
  }
}
