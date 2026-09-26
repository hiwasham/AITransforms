#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = process.cwd();
const phaseDir = path.join(root, ".phase1");
const corpusDir = path.join(phaseDir, "corpus");
const allowlistPath = path.join(corpusDir, "allowlist.txt");
const exportPath = path.join(corpusDir, "export.ndjson");
const strippedPath = path.join(corpusDir, "sanitized.ndjson");
const sealedPath = path.join(corpusDir, "demo-corpus.jsonl");
const checksumPath = path.join(corpusDir, "demo-corpus.sha256");

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

function readAllowlist() {
  if (!fs.existsSync(allowlistPath)) fail(`missing allow-list: ${allowlistPath}`);
  const slugs = fs
    .readFileSync(allowlistPath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
  if (slugs.length === 0) fail("allow-list is empty; refusing export");
  return new Set(slugs);
}

function readJsonl(file) {
  if (!fs.existsSync(file)) fail(`missing input: ${file}`);
  return fs
    .readFileSync(file, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, idx) => {
      try {
        return JSON.parse(line);
      } catch (err) {
        fail(`invalid JSONL at ${file}:${idx + 1}: ${err.message}`);
      }
    });
}

function writeJsonl(file, rows) {
  fs.writeFileSync(file, rows.map((row) => JSON.stringify(row)).join("\n") + "\n");
}

function exportFromProd() {
  const cmd = process.env.PHASE1_EXPORT_CMD;
  if (!cmd) {
    fail("PHASE1_EXPORT_CMD is not set; refusing to touch production brain implicitly");
  }
  const shell = spawnSync(cmd, {
    shell: true,
    cwd: root,
    encoding: "utf8",
    env: process.env,
  });
  if (shell.status !== 0) {
    process.stderr.write(shell.stderr || "");
    fail(`export command failed with exit ${shell.status}`);
  }
}

function stripRows(rows, allowlist) {
  return rows.filter((row) => {
    const slug = row.slug || row.page?.slug;
    const visibility = row.visibility || row.page?.visibility || "world";
    if (!slug || !allowlist.has(slug)) return false;
    if (visibility === "private") return false;
    if (row.internal === true) return false;
    return true;
  });
}

function verifyRows(rows, allowlist) {
  const seen = new Set();
  for (const row of rows) {
    const slug = row.slug || row.page?.slug;
    const visibility = row.visibility || row.page?.visibility || "world";
    if (!allowlist.has(slug)) fail(`off-list slug survived strip: ${slug}`);
    if (visibility === "private") fail(`private row survived strip: ${slug}`);
    seen.add(slug);
  }
  for (const slug of allowlist) {
    if (!seen.has(slug)) {
      fail(`allow-listed slug missing from sanitized corpus: ${slug}`);
    }
  }
}

function seal() {
  const sum = spawnSync("sha256sum", [strippedPath], { encoding: "utf8" });
  if (sum.status !== 0) fail("sha256sum failed");
  const hash = sum.stdout.trim().split(/\s+/)[0];
  fs.copyFileSync(strippedPath, sealedPath);
  fs.writeFileSync(checksumPath, `${hash}  demo-corpus.jsonl\n`);
  fs.chmodSync(sealedPath, 0o444);
}

function main() {
  const allowlist = readAllowlist();
  exportFromProd();
  const rows = readJsonl(exportPath);
  const stripped = stripRows(rows, allowlist);
  verifyRows(stripped, allowlist);
  writeJsonl(strippedPath, stripped);
  seal();
  console.log(`sanitized rows: ${stripped.length}`);
  console.log(`sealed corpus: ${sealedPath}`);
  console.log(`checksum: ${checksumPath}`);
}

main();
