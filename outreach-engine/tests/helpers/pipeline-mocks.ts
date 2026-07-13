import { MockLLMClient } from "@/services/llm/llm-client.js";
import { MockBFVBotClient } from "@/services/telegram/bfv-bot-client.js";
import { MockDispatchClient } from "@/services/dispatch/mock-client.js";
import { scrapeUrl } from "@/services/scraper/scraper-client.js";
import type { BatchOrchestratorDeps } from "@/domain/pipeline/batch-orchestrator.js";

/**
 * A deterministic "smart" mock LLM client used across integration tests:
 * for script-generation prompts, it builds a real Hook->Pain->BFV->Ask
 * message (so the mechanical linter checks genuinely pass/fail against
 * realistic text); for judge prompts, it passes by default (individual
 * tests can override via setResponder for the failure-path scenarios).
 */
export function createSmartLLMClient(): MockLLMClient {
  const llm = new MockLLMClient();
  llm.setResponder((prompt) => {
    if (prompt.includes("You are judging")) {
      return "PASS";
    }
    // Script generation prompt: pull the BFV link out and the first
    // "excerpt" fact, build a compliant short message.
    const linkMatch = prompt.match(/https:\/\/t\.me\/\S+/);
    const link = linkMatch?.[0] ?? "https://t.me/AITransformsBot?start=abc";
    return (
      `Hey there, I saw your site. Your team seems busy with orders. ` +
      `I made a small bot from your site: ${link}. Want to try it?`
    );
  });
  return llm;
}

export function createPipelineTestDeps(
  overrides: Partial<BatchOrchestratorDeps> = {},
): BatchOrchestratorDeps {
  return {
    scrapeUrl,
    botClient: new MockBFVBotClient(),
    llmClient: createSmartLLMClient(),
    telegramBotUsername: "AITransformsTestBot",
    ...overrides,
  };
}

export { MockDispatchClient };
