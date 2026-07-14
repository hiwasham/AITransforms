import { afterEach, describe, expect, it, vi } from "vitest";
import {
  TelegramLongPollTransport,
  type IncomingTelegramUpdate,
} from "@/services/telegram/update-transport.js";
import { logger } from "@/lib/logger.js";

/**
 * Unit tests for the Telegram long-poll update transport (T111, FR-016).
 * No live network — fetch is injected. Covers ordered delivery with offset
 * advancement, poison-update isolation, poll-failure retry, clean
 * start/stop lifecycle, and the bot-token-never-in-logs guarantee
 * (Constitution V/VI).
 */

const BOT_TOKEN = "7000000001:AAsecret-bot-token-XYZ";

function update(id: number, text: string): IncomingTelegramUpdate {
  return { update_id: id, message: { chat: { id: 42 }, text } };
}

function telegramOk(result: unknown): Response {
  return new Response(JSON.stringify({ ok: true, result }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

interface PollCall {
  url: string;
  body: Record<string, unknown>;
}

/**
 * Fake Telegram getUpdates endpoint: serves queued batches in order; once
 * drained, hangs like a real long poll until the abort signal fires.
 */
function makeFetch(batches: Array<IncomingTelegramUpdate[] | Error>, calls: PollCall[]) {
  const queue = [...batches];
  const fetchImpl: typeof fetch = (url, init) => {
    calls.push({
      url: String(url),
      body: JSON.parse(init?.body as string) as Record<string, unknown>,
    });
    const next = queue.shift();
    if (next === undefined) {
      // Drained: emulate a long poll that only ends when aborted.
      return new Promise<Response>((_, reject) => {
        const signal = init?.signal;
        if (signal?.aborted) {
          reject(new DOMException("aborted", "AbortError"));
          return;
        }
        signal?.addEventListener("abort", () =>
          reject(new DOMException("aborted", "AbortError")),
        );
      });
    }
    if (next instanceof Error) return Promise.reject(next);
    return Promise.resolve(telegramOk(next));
  };
  return fetchImpl;
}

function collectLogs(): string[] {
  const logged: string[] = [];
  for (const level of ["info", "warn", "error"] as const) {
    vi.spyOn(logger, level).mockImplementation((event, fields) => {
      logged.push(JSON.stringify({ event, ...fields }));
    });
  }
  return logged;
}

async function waitFor(predicate: () => boolean): Promise<void> {
  for (let i = 0; i < 500 && !predicate(); i++) {
    await new Promise((r) => setTimeout(r, 5));
  }
  expect(predicate()).toBe(true);
}

describe("TelegramLongPollTransport (T111)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("refuses construction without a bot token", () => {
    expect(
      () =>
        new TelegramLongPollTransport({
          botToken: "",
          consumer: { processUpdate: async () => {} },
        }),
    ).toThrow(/bot token/i);
  });

  it("delivers updates in order and advances the offset past the last update_id", async () => {
    const calls: PollCall[] = [];
    const seen: string[] = [];
    const transport = new TelegramLongPollTransport({
      botToken: BOT_TOKEN,
      consumer: {
        processUpdate: async (u) => {
          seen.push((u as IncomingTelegramUpdate).message?.text ?? "");
        },
      },
      fetchImpl: makeFetch(
        [[update(10, "first"), update(11, "second")], [update(12, "third")]],
        calls,
      ),
      retryDelayMs: 0,
    });

    transport.start();
    await waitFor(() => seen.length === 3);
    await transport.stop();

    expect(seen).toEqual(["first", "second", "third"]);
    expect(calls[0]!.url).toContain("/getUpdates");
    // First poll carries no offset; after update_id 11 the next asks for 12,
    // after 12 the next asks for 13.
    expect(calls[0]!.body.offset).toBeUndefined();
    expect(calls[1]!.body.offset).toBe(12);
    expect(calls[2]!.body.offset).toBe(13);
  });

  it("logs a consumer failure, keeps polling, and advances past the poison update", async () => {
    const logged = collectLogs();
    const calls: PollCall[] = [];
    const seen: number[] = [];
    const transport = new TelegramLongPollTransport({
      botToken: BOT_TOKEN,
      consumer: {
        processUpdate: async (u) => {
          const id = (u as IncomingTelegramUpdate).update_id;
          if (id === 20) throw new Error(`boom for ${BOT_TOKEN}`);
          seen.push(id);
        },
      },
      fetchImpl: makeFetch([[update(20, "poison")], [update(21, "fine")]], calls),
      retryDelayMs: 0,
    });

    transport.start();
    await waitFor(() => seen.includes(21));
    await transport.stop();

    const all = logged.join("\n");
    expect(all).toContain("bfv_transport_update_failed");
    expect(all).not.toContain(BOT_TOKEN);
    // Poison update did not wedge the loop: offset moved past it.
    expect(calls[1]!.body.offset).toBe(21);
  });

  it("logs a failed poll (scrubbed) and retries", async () => {
    const logged = collectLogs();
    const calls: PollCall[] = [];
    const seen: number[] = [];
    const transport = new TelegramLongPollTransport({
      botToken: BOT_TOKEN,
      consumer: {
        processUpdate: async (u) => {
          seen.push((u as IncomingTelegramUpdate).update_id);
        },
      },
      fetchImpl: makeFetch(
        [new Error(`connect ECONNREFUSED https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`), [update(30, "after retry")]],
        calls,
      ),
      retryDelayMs: 0,
    });

    transport.start();
    await waitFor(() => seen.includes(30));
    await transport.stop();

    const all = logged.join("\n");
    expect(all).toContain("bfv_transport_poll_failed");
    expect(all).not.toContain(BOT_TOKEN);
    expect(all).toContain("[redacted-bot-token]");
  });

  it("stop() aborts the in-flight long poll and halts polling", async () => {
    const logged = collectLogs();
    const calls: PollCall[] = [];
    const transport = new TelegramLongPollTransport({
      botToken: BOT_TOKEN,
      consumer: { processUpdate: async () => {} },
      fetchImpl: makeFetch([], calls), // hangs immediately, like a quiet chat
      retryDelayMs: 0,
    });

    transport.start();
    await waitFor(() => calls.length === 1);
    await transport.stop();
    // Give any (incorrect) continued polling a chance to surface.
    await new Promise((r) => setTimeout(r, 25));

    expect(calls.length).toBe(1);
    const all = logged.join("\n");
    expect(all).toContain("bfv_transport_started");
    expect(all).toContain("bfv_transport_stopped");
    expect(all).not.toContain(BOT_TOKEN);
  });

  it("start() twice throws; stop() before start() is a no-op", async () => {
    const transport = new TelegramLongPollTransport({
      botToken: BOT_TOKEN,
      consumer: { processUpdate: async () => {} },
      fetchImpl: makeFetch([], []),
      retryDelayMs: 0,
    });

    await transport.stop(); // never started — must not throw
    transport.start();
    expect(() => transport.start()).toThrow(/already/i);
    await transport.stop();
  });
});
