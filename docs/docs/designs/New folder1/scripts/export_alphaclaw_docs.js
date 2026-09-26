#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const repo = "/home/miraddo/alphaclaw";
const out = path.join(root, ".phase1", "corpus", "export.ndjson");

const docs = [
  ["alphaclaw-readme", "README.md"],
  ["alphaclaw-project-agents", "AGENTS.md"],
  ["alphaclaw-contributing", "CONTRIBUTING.md"],
  ["alphaclaw-runtime-agents", "lib/setup/core-prompts/AGENTS.md"],
  ["alphaclaw-runtime-tools", "lib/setup/core-prompts/TOOLS.md"],
];

const rows = docs.map(([slug, relPath]) => {
  const abs = path.join(repo, relPath);
  if (!fs.existsSync(abs)) {
    throw new Error(`missing corpus document: ${abs}`);
  }
  return {
    slug,
    title: relPath,
    visibility: "world",
    source_path: abs,
    content: fs.readFileSync(abs, "utf8"),
  };
});

fs.writeFileSync(out, rows.map((row) => JSON.stringify(row)).join("\n") + "\n");
console.log(`wrote ${rows.length} rows to ${out}`);
