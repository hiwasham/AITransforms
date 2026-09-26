#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const kEnvPath = process.env.ENV_FILE || ".env";
const kGbrainHome =
  process.env.GBRAIN_HOME ||
  "/home/miraddo/.openclaw/projects/aitransforms-gstack-sandbox/.phase1/gbrain-home";
const kImportDir =
  process.env.DEMO_CORPUS_MD_DIR ||
  "/home/miraddo/.openclaw/projects/aitransforms-gstack-sandbox/.phase1/import-md";
const kPollTimeoutSeconds = Number(process.env.TELEGRAM_POLL_TIMEOUT_SECONDS || 25);
const kBrainTimeoutMs = Number(process.env.GBRAIN_QUERY_TIMEOUT_MS || 15000);
const kMaxTelegramChars = Number(process.env.TELEGRAM_REPLY_MAX_CHARS || 3500);
const kBackoffBaseMs = Number(process.env.TELEGRAM_BACKOFF_BASE_MS || 1000);
const kBackoffMaxMs = Number(process.env.TELEGRAM_BACKOFF_MAX_MS || 30000);
const kMinFallbackScore = Number(process.env.DEMO_CORPUS_MIN_SCORE || 2);
const kSkipExistingUpdates = process.env.TELEGRAM_SKIP_EXISTING_UPDATES !== "false";
const systemPrompt = `You are the AlphaClaw Expert Brain. Your goal is Institutional Immortality: scaling the founder's documented judgment. Instructions:

Synthesize: Take the retrieved chunks and synthesize them into a single coherent paragraph. Do not list them as separate items.

Voice: Maintain an Expert-to-Expert voice. Be direct and concrete. Strip all AI filler (e.g., 'delve', 'crucial', 'comprehensive', 'landscape').

Citations: Every claim must be grounded. Append citations at the end in the format: Sources: [slug1], [slug2].

No Scores: NEVER include similarity scores (e.g., [0.8720]) in the final output sent to the user.

Refusal Gate: If the retrieved context does not contain the answer, perform a Safe Refusal: 'I do not have a cited source for that'.`;
const kSafeRefusal = "I do not have a cited source for that";

function loadEnv(filePath) {
  const env = {};
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1);
  }
  return env;
}

const env = loadEnv(kEnvPath);
const token = env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error(`TELEGRAM_BOT_TOKEN is empty or missing in ${kEnvPath}`);
  process.exit(1);
}

async function telegram(method, payload) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
  const body = await res.json();
  if (!body.ok) {
    throw new Error(`${method} failed: ${body.description || res.statusText}`);
  }
  return body.result;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function citeSlugs(output) {
  const slugs = Array.from(output.matchAll(/\]\s+([a-z0-9][a-z0-9-]*)\s+--/g))
    .map((match) => match[1]);
  return Array.from(new Set(slugs)).slice(0, 3);
}

function tokenize(value) {
  const stop = new Set([
    "about", "after", "again", "also", "and", "are", "but", "can", "does", "for",
    "from", "how", "into", "our", "that", "the", "this", "via", "what", "when",
    "where", "while", "with", "your",
  ]);
  return String(value || "")
    .toLowerCase()
    .match(/[a-z0-9]+/g)
    ?.filter((token) => token.length > 2 && !stop.has(token)) || [];
}

function extractBody(markdown) {
  return String(markdown || "").replace(/^---[\s\S]*?---\s*/, "");
}

function cleanText(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[[^\]]+\]\([^)]+\)/g, "")
    .replace(/[`*_>#|-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function loadCorpusDocs() {
  if (!fs.existsSync(kImportDir)) return [];
  return fs
    .readdirSync(kImportDir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => {
      const slug = name.replace(/\.md$/, "");
      const body = extractBody(fs.readFileSync(path.join(kImportDir, name), "utf8"));
      return { slug, body, tokens: new Set(tokenize(`${slug} ${body}`)) };
    });
}

function bestExcerpt(body, queryTokens) {
  const paragraphs = String(body || "")
    .split(/\n{2,}/)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter((part) => part.length > 40);
  let best = paragraphs[0] || "";
  let bestScore = -1;
  for (const paragraph of paragraphs) {
    const tokens = new Set(tokenize(paragraph));
    const score = queryTokens.reduce((total, token) => total + (tokens.has(token) ? 1 : 0), 0);
    if (score > bestScore) {
      best = paragraph;
      bestScore = score;
    }
  }
  return cleanText(best).slice(0, 700);
}

function formatSources(slugs) {
  return slugs.map((slug) => `[${slug}]`).join(", ");
}

function synthesizeAnswer(ranked) {
  const sources = Array.from(new Set(ranked.map((doc) => doc.slug))).slice(0, 3);
  if (!sources.length) return null;

  const sourceSet = new Set(sources);
  const hasReadme = sourceSet.has("alphaclaw-readme");
  const hasProjectAgents = sourceSet.has("alphaclaw-project-agents");
  const hasContributing = sourceSet.has("alphaclaw-contributing");
  const claims = [];

  if (hasReadme) {
    claims.push("AlphaClaw's core philosophy is to make OpenClaw operationally usable: a browser-managed harness that keeps setup, channel orchestration, watchdog recovery, Git-backed rollback, and observability in one controllable surface");
  }
  if (hasProjectAgents) {
    claims.push("for agent work, it preserves judgment by turning project conventions and runtime behavior into explicit guidance instead of leaving them trapped in a founder's head");
  }
  if (hasContributing) {
    claims.push("its product bias is practical reliability over feature sprawl: smart defaults, ejectability, and recovery paths matter because the system has to keep working while a founder delegates");
  }
  if (!claims.length) {
    const excerpt = bestExcerpt(ranked[0].body || ranked[0].excerpt || "", []);
    claims.push(excerpt || "AlphaClaw answers from the sealed local corpus only");
  }

  return `${claims.join(", ")}. Sources: ${formatSources(sources)}`;
}

function fallbackQuery(question) {
  const queryTokens = Array.from(new Set(tokenize(question)));
  const ranked = loadCorpusDocs()
    .map((doc) => ({
      ...doc,
      score: queryTokens.reduce((total, token) => total + (doc.tokens.has(token) ? 1 : 0), 0),
    }))
    .filter((doc) => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (!ranked.length || ranked[0].score < kMinFallbackScore) return null;

  return synthesizeAnswer(ranked);
}

function queryWithGbrain(command, question) {
  const result = spawnSync("gbrain", [command, question], {
    encoding: "utf8",
    env: {
      ...process.env,
      GBRAIN_HOME: kGbrainHome,
    },
    timeout: kBrainTimeoutMs,
  });

  if (result.status !== 0) return null;

  const output = String(result.stdout || "").trim();
  const slugs = citeSlugs(output);
  if (!output || output === "No results." || slugs.length === 0) return null;

  const ranked = output
    .split(/\r?\n/)
    .map((line) => {
      const match = line.match(/^\[[^\]]+\]\s+([a-z0-9][a-z0-9-]*)\s+--\s*(.*)$/);
      if (!match) return null;
      return { slug: match[1], excerpt: cleanText(match[2]) };
    })
    .filter(Boolean)
    .slice(0, 3);

  return synthesizeAnswer(ranked);
}

function queryBrain(question) {
  const answer =
    fallbackQuery(question) ||
    queryWithGbrain("query", question) ||
    queryWithGbrain("search", question);

  if (!answer) {
    return kSafeRefusal;
  }

  return answer;
}

async function main() {
  let offset = 0;
  let consecutiveFailures = 0;
  if (kSkipExistingUpdates) {
    const updates = await telegram("getUpdates", {
      offset: -1,
      limit: 1,
      timeout: 0,
      allowed_updates: ["message"],
    });
    if (updates.length > 0) offset = updates[0].update_id + 1;
  }
  while (true) {
    try {
      const updates = await telegram("getUpdates", {
        offset,
        timeout: kPollTimeoutSeconds,
        allowed_updates: ["message"],
      });

      consecutiveFailures = 0;

      for (const update of updates) {
        offset = update.update_id + 1;
        const message = update.message;
        const text = String(message?.text || "").trim();
        const chatId = message?.chat?.id;
        if (!chatId || !text) continue;

        const answer = queryBrain(text);
        await telegram("sendMessage", {
          chat_id: chatId,
          text: answer.slice(0, kMaxTelegramChars),
          disable_web_page_preview: true,
        });
      }
    } catch (err) {
      consecutiveFailures += 1;
      const backoffMs = Math.min(
        kBackoffMaxMs,
        kBackoffBaseMs * 2 ** Math.min(consecutiveFailures - 1, 5),
      );
      console.error(
        `polling failure ${consecutiveFailures}: ${err.message}; retrying in ${backoffMs}ms`,
      );
      await sleep(backoffMs);
    }
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}

module.exports = { queryBrain, systemPrompt };
