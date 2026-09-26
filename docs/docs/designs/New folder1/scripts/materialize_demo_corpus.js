#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const corpusPath = path.join(root, ".phase1", "corpus", "demo-corpus.jsonl");
const outDir = path.join(root, ".phase1", "import-md");

if (!fs.existsSync(corpusPath)) {
  console.error(`missing sealed corpus: ${corpusPath}`);
  process.exit(1);
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const rows = fs
  .readFileSync(corpusPath, "utf8")
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => JSON.parse(line));

for (const row of rows) {
  const slug = String(row.slug || "").trim();
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    throw new Error(`invalid slug for materialized corpus: ${slug}`);
  }
  const title = String(row.title || slug).replaceAll('"', '\\"');
  const sourcePath = String(row.source_path || "").replaceAll('"', '\\"');
  const content = String(row.content || "");
  const frontmatter = [
    "---",
    `slug: "${slug}"`,
    `title: "${title}"`,
    'type: "demo-corpus"',
    'visibility: "world"',
    `source_path: "${sourcePath}"`,
    "---",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(outDir, `${slug}.md`), frontmatter + content);
}

console.log(`materialized ${rows.length} markdown files in ${outDir}`);
