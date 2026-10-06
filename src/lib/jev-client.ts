#!/usr/bin/env node
/**
 * jev-client.ts — Minimal TypeScript Jev client for AITransforms.
 *
 * Wire format matches what jevkit.py uses: POST /v1/systemone with
 * {"state": {context}, "questions": {name: question}}.
 *
 * ENV:
 *   OPENROUTER_API_KEY=sk-or-v1-... (reads from ../../../jev/openrouter_apis.json if unset)
 *   JEV_MODEL=typesafe/jev-1.13 (default)
 *   JEV_BASE_URL=https://openrouter.ai/api (default)
 */

export interface JevQuestion {
  type: "choice" | "noul" | "score";
  instructions: string;
  criteria?: Record<string, string> | string[]; // Choice=dict, Score=list, Noul=optional
}

export interface JevRequest {
  state: Record<string, unknown>;
  questions: Record<string, JevQuestion>;
  model?: string;
}

export interface JevChoiceAnswer {
  type: "choice";
  choice: string;
  confidence: number;
  probabilities: Record<string, number>;
}

export interface JevNoulAnswer {
  type: "noul";
  noul: number; // 0-1, probability of yes
}

export interface JevScoreAnswer {
  type: "score";
  score: number;
  confidence: number;
  legend: Record<string, string>;
  probabilities: Record<string, number>;
}

export type JevAnswer = JevChoiceAnswer | JevNoulAnswer | JevScoreAnswer;

export interface JevResponse {
  answers: Record<string, JevAnswer>;
  model: string;
  usage: { input_tokens: number; output_tokens: number };
}

export interface JevClientOptions {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  fetch?: typeof fetch;
}

const DEFAULT_BASE_URL = "https://openrouter.ai/api";
const DEFAULT_MODEL = "typesafe/jev-1.13";

export class JevClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly fetch: typeof fetch;

  constructor(opts: JevClientOptions = {}) {
    this.apiKey = opts.apiKey ?? process.env.OPENROUTER_API_KEY ?? this.loadKeyFromFile();
    this.baseUrl = opts.baseUrl ?? process.env.JEV_BASE_URL ?? DEFAULT_BASE_URL;
    this.model = opts.model ?? process.env.JEV_MODEL ?? DEFAULT_MODEL;
    this.fetch = opts.fetch ?? globalThis.fetch;

    if (!this.apiKey) {
      throw new Error(
        "JevClient: no API key. Set OPENROUTER_API_KEY in env or add a ../../../jev/openrouter_apis.json file.",
      );
    }
  }

  private loadKeyFromFile(): string {
    try {
      const fs = require("fs");
      const path = require("path");

      // Try 1: read jev repo's .env (has a working key)
      const envFile = path.resolve(__dirname, "../../../jev/.env");
      if (fs.existsSync(envFile)) {
        const raw = fs.readFileSync(envFile, "utf-8");
        const match = raw.match(/^OPENROUTER_API_KEY=(.+)$/m);
        if (match?.[1]) return match[1].trim();
      }

      // Try 2: openrouter_apis.json (fallback, but keys may have no credits)
      const keyFile = path.resolve(__dirname, "../../../jev/openrouter_apis.json");
      if (fs.existsSync(keyFile)) {
        const raw = fs.readFileSync(keyFile, "utf-8");
        const keys = raw.trim().split("\n");
        return keys[0]?.trim() || "";
      }

      return "";
    } catch {
      return "";
    }
  }

  async decide(
    state: Record<string, unknown>,
    questions: Record<string, JevQuestion>,
  ): Promise<JevResponse> {
    const req: JevRequest = { state, questions, model: this.model };

    const res = await this.fetch(`${this.baseUrl}/v1/systemone`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Jev API error ${res.status}: ${body}`);
    }

    return (await res.json()) as JevResponse;
  }

  /** Helper: review_flags — names of answers below the confidence threshold. */
  reviewFlags(answers: Record<string, JevAnswer>, threshold = 0.7): string[] {
    const flagged: string[] = [];
    for (const [name, ans] of Object.entries(answers)) {
      if (ans.type === "choice" || ans.type === "score") {
        if (ans.confidence < threshold) flagged.push(name);
      } else if (ans.type === "noul") {
        // Noul: ambiguous middle band
        if (ans.noul > 1.0 - threshold && ans.noul < threshold) flagged.push(name);
      }
    }
    return flagged;
  }
}
