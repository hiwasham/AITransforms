/**
 * Structured logging utility (T012, plan.md Observability — Constitution
 * Principle VI, NON-NEGOTIABLE). Every log line is a single JSON object so
 * pipeline steps, workflow transitions, and webhook events are all
 * machine-parseable, never free-text.
 */

export type LogLevel = "info" | "warn" | "error";

export interface LogFields {
  [key: string]: unknown;
}

function emit(level: LogLevel, event: string, fields: LogFields = {}): void {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    event,
    ...fields,
  });
  (level === "error" ? console.error : console.log)(line);
}

export const logger = {
  info: (event: string, fields?: LogFields) => emit("info", event, fields),
  warn: (event: string, fields?: LogFields) => emit("warn", event, fields),
  error: (event: string, fields?: LogFields) => emit("error", event, fields),
};
