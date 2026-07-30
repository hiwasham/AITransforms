/**
 * Mechanical isolation guards for the review surface (M011, specs/002
 * FR-018 + plan Security Considerations). These are static-source
 * assertions, not behaviour tests — they fail the build the moment the
 * two structural invariants that keep the review dashboard safe erode:
 *
 *   1. No innerHTML/outerHTML/insertAdjacentHTML anywhere under src/ui/.
 *      The review surface renders untrusted scraped + LLM text; every
 *      write must go through textContent (XSS containment).
 *   2. The review domain + API never import the outreach workflow state
 *      machine, prospects, or outreach_attempts. The review queue is a
 *      separate CSV-fed table with no FK into the pipeline (FR-018); an
 *      import edge here would couple the two queues the plan keeps apart.
 */

import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const SRC = new URL("../../src/", import.meta.url).pathname;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

describe("review surface isolation (M011)", () => {
  it("no innerHTML-family sinks under src/ui/", () => {
    const uiFiles = walk(join(SRC, "ui")).filter((f) => f.endsWith(".js"));
    expect(uiFiles.length).toBeGreaterThan(0); // guard the guard
    // Match the dangerous WRITE, not the word: `.innerHTML =` /
    // `.outerHTML =` assignments and `.insertAdjacentHTML(` calls. A
    // mention in a comment ("never innerHTML") is not a sink, and reading
    // the property is not an injection path.
    const SINK = /\.(innerHTML|outerHTML)\s*=|\.insertAdjacentHTML\s*\(/;
    const offenders: string[] = [];
    for (const f of uiFiles) {
      const src = readFileSync(f, "utf8");
      if (SINK.test(src)) offenders.push(f);
    }
    expect(offenders).toEqual([]);
  });

  it("review domain + API do not import the workflow/prospect layer", () => {
    const reviewFiles = [
      ...walk(join(SRC, "domain", "review")),
      ...walk(join(SRC, "api", "review")),
    ].filter((f) => f.endsWith(".ts"));
    expect(reviewFiles.length).toBeGreaterThan(0);

    // Match import specifiers only (not prose in comments): the module
    // path segment after @/ or a relative path.
    const forbidden =
      /from\s+["'][^"']*(domain\/(prospects|pipeline)|workflow|outreach-attempt|state-machine)[^"']*["']/;
    const offenders: string[] = [];
    for (const f of reviewFiles) {
      const src = readFileSync(f, "utf8");
      for (const line of src.split("\n")) {
        if (line.trimStart().startsWith("import") && forbidden.test(line)) {
          offenders.push(`${f}: ${line.trim()}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("dashboard composition imports no integration client or engine route", () => {
    const compositionFiles = [
      join(SRC, "server", "dashboard-app.ts"),
      join(SRC, "server", "dashboard-main.ts"),
    ];
    const forbidden =
      /from\s+["'][^"']*(services\/(llm|telegram|scraper|dispatch)|api\/(batches|prospects|internal|webhooks))[^"']*["']/;
    const offenders: string[] = [];
    for (const file of compositionFiles) {
      const source = readFileSync(file, "utf8");
      for (const statement of source.matchAll(/import[\s\S]*?from\s+["'][^"']+["'];/g)) {
        if (forbidden.test(statement[0])) {
          offenders.push(`${file}: ${statement[0]}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("keeps simulation mode, logout, and expired-session recovery visible", () => {
    const html = readFileSync(join(SRC, "ui", "index.html"), "utf8");
    const script = readFileSync(join(SRC, "ui", "review.js"), "utf8");

    expect(html).toContain("SIMULATION MODE — nothing will be sent");
    expect(html).toMatch(/<form[^>]*method="post"[^>]*action="\/logout"/);
    expect(script).toContain("response.status === 401");
    expect(script).toContain('window.location.assign("/login")');
  });
});
