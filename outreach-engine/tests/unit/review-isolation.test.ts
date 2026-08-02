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

import { describe, expect, it, vi } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { runInNewContext } from "node:vm";

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

interface FakeElement {
  textContent: string;
  className: string;
  href: string;
  style: { display?: string };
  addEventListener: (type: string, handler: () => void) => void;
}

const UI_IDS = [
  "screen-empty",
  "screen-done",
  "screen-review",
  "error",
  "progress",
  "reason-hint",
  "company",
  "contact",
  "flag",
  "decision-badge",
  "research",
  "pain",
  "message-body",
  "bfv-link",
  "done-counts",
  "btn-approve",
  "btn-reject",
  "btn-next",
  "btn-back",
] as const;

function packageFixture(id: string, company: string) {
  return {
    id,
    company,
    contact: "Contact",
    researchSummary: "Research",
    painPoint: "Pain",
    messageBody: "Message",
    bfvLinkTelegram: "https://t.me/example",
    generatorFlag: null,
    decision: "pending",
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function startClient(fetchMock: ReturnType<typeof vi.fn>) {
  const elements = {} as Record<(typeof UI_IDS)[number], FakeElement>;
  for (const id of UI_IDS) {
    elements[id] = {
      textContent: "",
      className: "",
      href: "",
      style: {},
      addEventListener: vi.fn(),
    };
  }
  let keydown: ((event: Record<string, unknown>) => void) | undefined;
  const assign = vi.fn();
  const script = readFileSync(join(SRC, "ui", "review.js"), "utf8");

  runInNewContext(script, {
    document: {
      getElementById: (id: (typeof UI_IDS)[number]) => elements[id],
      addEventListener: (type: string, handler: typeof keydown) => {
        if (type === "keydown") keydown = handler;
      },
    },
    window: { location: { assign } },
    fetch: fetchMock,
    encodeURIComponent,
    URL,
  });

  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  await vi.waitFor(() => expect(elements.company.textContent).not.toBe(""));

  return {
    elements,
    assign,
    press: async (key: string) => {
      const preventDefault = vi.fn();
      keydown?.({
        key,
        metaKey: false,
        ctrlKey: false,
        altKey: false,
        preventDefault,
      });
      await Promise.resolve();
      return preventDefault;
    },
  };
}

describe("review dashboard client behavior", () => {
  it("keeps non-HTTPS imported links inert", async () => {
    const unsafe = {
      ...packageFixture("a", "Alpha"),
      bfvLinkTelegram: "javascript:alert(document.cookie)",
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ package: unsafe, counts: { reviewed: 0, total: 1 } }),
      );
    const client = await startClient(fetchMock);

    expect(client.elements["bfv-link"].textContent).toBe(
      "javascript:alert(document.cookie)",
    );
    expect(client.elements["bfv-link"].href).toBe("#");
  });

  it("executes A/N/ArrowLeft/R and a rejection-reason key", async () => {
    const a = packageFixture("a", "Alpha");
    const b = packageFixture("b", "Beta");
    const c = packageFixture("c", "Gamma");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ package: a, counts: { reviewed: 0, total: 3 } }))
      .mockResolvedValueOnce(
        jsonResponse({
          package: { ...a, decision: "approved" },
          next: b,
          counts: { reviewed: 1, total: 3 },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ package: b, next: c, counts: { reviewed: 1, total: 3 } }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ package: b, counts: { reviewed: 1, total: 3 } }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          package: { ...b, decision: "rejected" },
          next: c,
          counts: { reviewed: 2, total: 3 },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ package: { ...b, decision: "rejected", rejectionReason: "generic" } }),
      );
    const client = await startClient(fetchMock);

    await client.press("a");
    await vi.waitFor(() => expect(client.elements.company.textContent).toBe("Beta"));
    await client.press("n");
    await vi.waitFor(() => expect(client.elements.company.textContent).toBe("Gamma"));
    await client.press("ArrowLeft");
    await vi.waitFor(() => expect(client.elements.company.textContent).toBe("Beta"));
    await client.press("r");
    await vi.waitFor(() => expect(client.elements.company.textContent).toBe("Gamma"));
    await client.press("g");
    await vi.waitFor(() =>
      expect(client.elements["reason-hint"].textContent).toBe("tagged: generic"),
    );

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "/review/packages/next",
      "/review/packages/a/decision",
      "/review/packages/b/decision",
      "/review/packages/b",
      "/review/packages/b/decision",
      "/review/packages/b/rejection-reason",
    ]);
    expect(JSON.parse(fetchMock.mock.calls[1]?.[1]?.body as string)).toEqual({
      action: "approve",
    });
    expect(JSON.parse(fetchMock.mock.calls[2]?.[1]?.body as string)).toEqual({
      action: "next",
    });
    expect(JSON.parse(fetchMock.mock.calls[4]?.[1]?.body as string)).toEqual({
      action: "reject",
    });
    expect(JSON.parse(fetchMock.mock.calls[5]?.[1]?.body as string)).toEqual({
      reason: "generic",
    });
  });

  it("stays on the current package after HTTP, network, and 401 failures", async () => {
    const a = packageFixture("a", "Alpha");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ package: a, counts: { reviewed: 0, total: 1 } }))
      .mockResolvedValueOnce(
        jsonResponse({ error: { message: "write refused" } }, 500),
      )
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(jsonResponse({ error: { message: "expired" } }, 401));
    const client = await startClient(fetchMock);

    await client.press("a");
    await vi.waitFor(() =>
      expect(client.elements.error.textContent).toContain("write refused"),
    );
    expect(client.elements.company.textContent).toBe("Alpha");

    await Promise.resolve();
    await client.press("n");
    await vi.waitFor(() => expect(client.elements.error.textContent).toContain("offline"));
    expect(client.elements.company.textContent).toBe("Alpha");

    await Promise.resolve();
    await client.press("r");
    await vi.waitFor(() => expect(client.assign).toHaveBeenCalledWith("/login"));
    expect(client.elements.company.textContent).toBe("Alpha");
  });
});
