import { createHash } from "node:crypto";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from "vitest";
import type { Db } from "@/db/client.js";
import { createTestDb } from "../helpers/test-db.js";
import { createDashboardApp } from "@/server/dashboard-app.js";
import { logger, type LogFields } from "@/lib/logger.js";
import {
  issueSession,
  sessionCookie,
  type DashboardConfig,
} from "@/server/dashboard-auth.js";

const ORIGIN = "https://outreach.example.test:10000";
const CSP =
  "default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'self'; img-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'";
const PASSWORD = "correct-operator-password";
const SIGNING_KEY = Buffer.alloc(32, 2);

function authCookie(): string {
  return sessionCookie(issueSession(SIGNING_KEY)).split(";", 1)[0]!;
}

describe("public dashboard HTTP contract", () => {
  let info: MockInstance<(event: string, fields?: LogFields) => void>;

  beforeEach(() => {
    info = vi.spyOn(logger, "info").mockImplementation(() => undefined);
  });

  afterEach(() => {
    info.mockRestore();
  });

  function app(db: Db = null as unknown as Db) {
    const config: DashboardConfig = {
      dbDataDir: "/var/lib/aitransforms-outreach/pglite",
      publicOrigin: ORIGIN,
      passwordDigest: createHash("sha256").update(PASSWORD).digest(),
      signingKey: SIGNING_KEY,
      releaseSha: "d".repeat(40),
    };
    return createDashboardApp({ db, config });
  }

  it("serves only a fixed, no-store health response with the security policy", async () => {
    const response = await app().handle(new Request(`${ORIGIN}/healthz`));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
    expect(response.headers.get("content-type")).toBe("application/json");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("content-security-policy")).toBe(CSP);
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
    expect(response.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("serves a self-contained password-only login form", async () => {
    const response = await app().handle(new Request(`${ORIGIN}/login`));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "text/html; charset=utf-8",
    );
    const html = await response.text();
    expect(html).toContain('<form method="post" action="/login">');
    expect(html).toContain('type="password"');
    expect(html).toContain('name="password"');
    expect(html).not.toContain('name="username"');
    expect(html).not.toMatch(/<script|<link|src=/i);
  });

  it("accepts the password from the canonical origin and issues the exact secure session cookie", async () => {
    const response = await app().handle(
      new Request(`${ORIGIN}/login`, {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          origin: ORIGIN,
        },
        body: new URLSearchParams({ password: PASSWORD }),
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/");
    expect(response.headers.get("set-cookie")).toMatch(
      /^__Host-outreach_session=[A-Za-z0-9_.-]+; Path=\/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200$/,
    );
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("accepts a direct browser form login when the proxy omits Origin", async () => {
    const response = await app().handle(
      new Request(`${ORIGIN}/login`, {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ password: PASSWORD }),
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/");
    expect(response.headers.get("set-cookie")).toMatch(
      /^__Host-outreach_session=[A-Za-z0-9_.-]+; Path=\/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200$/,
    );
  });

  it("records safe login outcomes without credentials or cookies", async () => {
    const requestId = "11111111-1111-4111-8111-111111111111";
    const response = await app().handle(
      new Request(`${ORIGIN}/login`, {
        method: "POST",
        headers: {
          "x-request-id": requestId,
          "content-type": "application/x-www-form-urlencoded",
          origin: ORIGIN,
        },
        body: new URLSearchParams({ password: PASSWORD }),
      }),
    );

    expect(response.status).toBe(303);
    expect(info).toHaveBeenCalledWith("dashboard_login_attempt", {
      request_id: requestId,
      outcome: "authenticated",
      limiter_blocked: false,
    });
  });

  it("accepts the exact 4 KiB login boundary and rejects one byte more", async () => {
    const submit = (candidate: string) =>
      app().handle(
        new Request(`${ORIGIN}/login`, {
          method: "POST",
          headers: {
            "content-type": "application/x-www-form-urlencoded",
            origin: ORIGIN,
          },
          body: `password=${candidate}`,
        }),
      );

    const exact = await submit("x".repeat(4096 - "password=".length));
    expect(exact.status).toBe(401);

    const oversized = await submit("x".repeat(4097 - "password=".length));
    expect(oversized.status).toBe(413);
    expect(await oversized.json()).toEqual({
      error: { code: "payload_too_large", message: "Payload too large" },
    });
    expect(oversized.headers.get("cache-control")).toBe("no-store");
    expect(info).toHaveBeenLastCalledWith("dashboard_login_attempt", {
      request_id: "unavailable",
      outcome: "payload_too_large",
      limiter_blocked: false,
    });
  });

  it("returns fixed login failures without credential detail", async () => {
    const submit = (body: string, headers: Record<string, string>) =>
      app().handle(
        new Request(`${ORIGIN}/login`, { method: "POST", headers, body }),
      );
    const formHeaders = {
      "content-type": "application/x-www-form-urlencoded",
      origin: ORIGIN,
    };

    const cases = [
      {
        response: await submit(`password=${PASSWORD}`, {
          ...formHeaders,
          origin: "https://evil.example",
        }),
        status: 403,
        code: "forbidden",
        message: "Request forbidden",
        outcome: "origin_rejected",
      },
      {
        response: await submit(`password=${PASSWORD}`, {
          "content-type": "application/json",
          origin: ORIGIN,
        }),
        status: 415,
        code: "unsupported_media_type",
        message: "Unsupported media type",
        outcome: "media_type_rejected",
      },
      {
        response: await submit("password=%E0%A4%A", formHeaders),
        status: 400,
        code: "invalid_request",
        message: "Invalid request",
        outcome: "invalid_request",
      },
      {
        response: await submit("password=", formHeaders),
        status: 400,
        code: "invalid_request",
        message: "Invalid request",
        outcome: "invalid_request",
      },
      {
        response: await submit("password=one&password=two", formHeaders),
        status: 400,
        code: "invalid_request",
        message: "Invalid request",
        outcome: "invalid_request",
      },
      {
        response: await submit("password=wrong&username=operator", formHeaders),
        status: 400,
        code: "invalid_request",
        message: "Invalid request",
        outcome: "invalid_request",
      },
      {
        response: await submit("password=wrong", formHeaders),
        status: 401,
        code: "authentication_failed",
        message: "Authentication failed",
        outcome: "credentials_rejected",
      },
    ];

    for (const { response, status, code, message } of cases) {
      expect(response.status).toBe(status);
      expect(await response.json()).toEqual({ error: { code, message } });
      expect(response.headers.get("set-cookie")).toBeNull();
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(response.headers.get("content-security-policy")).toBe(CSP);
    }

    const events = info.mock.calls.filter(
      ([event]) => event === "dashboard_login_attempt",
    );
    expect(events).toHaveLength(cases.length);
    for (const [index, testCase] of cases.entries()) {
      expect(events[index]?.[1]).toMatchObject({ outcome: testCase.outcome });
    }
  });

  it("redirects unauthenticated UI navigation but fixes assets and APIs at 401", async () => {
    const dashboard = app();

    const navigation = await dashboard.handle(new Request(`${ORIGIN}/`));
    expect(navigation.status).toBe(303);
    expect(navigation.headers.get("location")).toBe("/login");

    for (const path of ["/ui/review.js", "/review/packages/next"]) {
      const response = await dashboard.handle(new Request(`${ORIGIN}${path}`));
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({
        error: { code: "unauthorized", message: "Authentication required" },
      });
      expect(response.headers.get("cache-control")).toBe("no-store");
    }
  });

  it("serves dashboard HTML and JavaScript only with a valid session", async () => {
    const headers = { cookie: authCookie() };
    const dashboard = app();

    const page = await dashboard.handle(new Request(`${ORIGIN}/`, { headers }));
    expect(page.status).toBe(200);
    expect(page.headers.get("content-type")).toBe("text/html; charset=utf-8");
    expect(await page.text()).toContain("Prospect Review");

    const script = await dashboard.handle(
      new Request(`${ORIGIN}/ui/review.js`, { headers }),
    );
    expect(script.status).toBe(200);
    expect(script.headers.get("content-type")).toBe(
      "text/javascript; charset=utf-8",
    );
    expect(await script.text()).toContain("Review dashboard client");
  });

  it("rejects tampered sessions according to navigation versus API policy", async () => {
    const token = issueSession(SIGNING_KEY);
    const [payload, signature] = token.split(".") as [string, string];
    const replacement = signature[0] === "A" ? "B" : "A";
    const cookie = `__Host-outreach_session=${payload}.${replacement}${signature.slice(1)}`;

    const page = await app().handle(
      new Request(`${ORIGIN}/`, { headers: { cookie } }),
    );
    expect(page.status).toBe(303);
    expect(page.headers.get("location")).toBe("/login");

    const api = await app().handle(
      new Request(`${ORIGIN}/review/packages/next`, { headers: { cookie } }),
    );
    expect(api.status).toBe(401);
  });

  it("logs out without requiring a valid session but requires the canonical origin", async () => {
    const response = await app().handle(
      new Request(`${ORIGIN}/logout`, {
        method: "POST",
        headers: { origin: ORIGIN, cookie: "__Host-outreach_session=invalid" },
      }),
    );
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/login");
    expect(response.headers.get("set-cookie")).toBe(
      "__Host-outreach_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0",
    );

    const crossSite = await app().handle(
      new Request(`${ORIGIN}/logout`, {
        method: "POST",
        headers: { origin: "https://evil.example" },
      }),
    );
    expect(crossSite.status).toBe(403);
    expect(crossSite.headers.get("set-cookie")).toBeNull();

    const missingOrigin = await app().handle(
      new Request(`${ORIGIN}/logout`, { method: "POST" }),
    );
    expect(missingOrigin.status).toBe(403);
    expect(missingOrigin.headers.get("set-cookie")).toBeNull();
  });

  it("checks authentication before origin and JSON type on review mutations", async () => {
    const unauthenticated = await app().handle(
      new Request(`${ORIGIN}/review/imports`, {
        method: "POST",
        headers: { "content-type": "text/plain" },
        body: "x",
      }),
    );
    expect(unauthenticated.status).toBe(401);

    const cookie = authCookie();
    const missingOrigin = await app().handle(
      new Request(`${ORIGIN}/review/imports`, {
        method: "POST",
        headers: { cookie, "content-type": "application/json" },
        body: "{}",
      }),
    );
    expect(missingOrigin.status).toBe(403);

    const wrongType = await app().handle(
      new Request(`${ORIGIN}/review/imports`, {
        method: "POST",
        headers: { cookie, origin: ORIGIN, "content-type": "text/plain" },
        body: "{}",
      }),
    );
    expect(wrongType.status).toBe(415);
  });

  it("never registers engine or unclassified method/path pairs", async () => {
    const cases: Array<[string, string]> = [
      ["POST", "/batches/generate"],
      ["GET", "/prospects"],
      ["POST", "/internal/dispatch/process"],
      ["POST", "/webhooks/instantly"],
      ["DELETE", "/login"],
      ["POST", "/review/packages/next"],
      ["GET", "/review/packages/%E0%A4%A"],
      ["GET", "/unknown"],
    ];

    for (const [method, path] of cases) {
      const response = await app().handle(
        new Request(`${ORIGIN}${path}`, { method }),
      );
      expect(response.status, `${method} ${path}`).toBe(404);
      expect(await response.json()).toEqual({
        error: { code: "not_found", message: "No such endpoint" },
      });
      expect(response.headers.get("cache-control")).toBe("no-store");
    }
  });

  it("globally rate-limits login after 50 credential failures", async () => {
    const dashboard = app();
    const request = () =>
      new Request(`${ORIGIN}/login`, {
        method: "POST",
        headers: {
          origin: ORIGIN,
          "content-type": "application/x-www-form-urlencoded",
        },
        body: "password=wrong",
      });

    for (let attempt = 1; attempt <= 50; attempt++) {
      expect((await dashboard.handle(request())).status, `attempt ${attempt}`).toBe(
        401,
      );
    }
    const blocked = await dashboard.handle(request());
    expect(blocked.status).toBe(429);
    expect(await blocked.json()).toEqual({
      error: { code: "rate_limited", message: "Too many requests" },
    });
    expect(info).toHaveBeenLastCalledWith("dashboard_login_attempt", {
      request_id: "unavailable",
      outcome: "rate_limited",
      limiter_blocked: true,
    });
  });

  it("audits a rejected review mutation without logging an invalid value", async () => {
    const db = await createTestDb();
    try {
      const dashboard = app(db);
      const response = await dashboard.handle(
        new Request(`${ORIGIN}/review/packages/not-a-uuid/decision`, {
          method: "POST",
          headers: {
            cookie: authCookie(),
            origin: ORIGIN,
            "content-type": "application/json",
          },
          body: JSON.stringify({ action: "destroy" }),
        }),
      );

      expect(response.status).toBe(400);
      const events = info.mock.calls.filter(
        ([event]) => event === "dashboard_review_mutation",
      );
      expect(events).toHaveLength(1);
      expect(events[0]?.[1]).toMatchObject({
        route: "review_package_decision",
        status: 400,
        dispatch_mode: "mock",
      });
      expect(events[0]?.[1]).not.toHaveProperty("action");
      expect(events[0]?.[1]).not.toHaveProperty("package_id");
    } finally {
      await db.close();
    }
  });

  it("audits a throwing review mutation exactly once with status 500", async () => {
    const db = {
      query: vi.fn().mockRejectedValue(new Error("database unavailable")),
    } as unknown as Db;
    const dashboard = app(db);
    const csv = [
      "prospect,company,research_summary,pain_point,bfv_link_telegram,bfv_link_video,personalized_message,approval_status",
      "Jane,Acme Co,summary,pain,tg,vid,message,pending",
    ].join("\n");

    await expect(
      dashboard.handle(
        new Request(`${ORIGIN}/review/imports`, {
          method: "POST",
          headers: {
            cookie: authCookie(),
            origin: ORIGIN,
            "content-type": "application/json",
          },
          body: JSON.stringify({ sourceName: "failure.csv", csv }),
        }),
      ),
    ).rejects.toThrow("database unavailable");

    const events = info.mock.calls.filter(
      ([event]) => event === "dashboard_review_mutation",
    );
    expect(events).toHaveLength(1);
    expect(events[0]?.[1]).toMatchObject({
      route: "review_import",
      status: 500,
      dispatch_mode: "mock",
    });
  });

  it(
    "dispatches exactly the five selected review routes with an authenticated session",
    async () => {
      const db = await createTestDb();
      try {
        const dashboard = app(db);
        const cookie = authCookie();
        const mutationHeaders = {
          cookie,
          origin: ORIGIN,
          "x-request-id": "22222222-2222-4222-8222-222222222222",
          "content-type": "application/json; charset=utf-8",
        };
        const csv = [
          "prospect,company,research_summary,pain_point,bfv_link_telegram,bfv_link_video,personalized_message,approval_status",
          'Jane,Acme Co,summary,pain,https://t.me/b?start=1,,"hello",pending',
        ].join("\n");

        const imported = await dashboard.handle(
          new Request(`${ORIGIN}/review/imports`, {
            method: "POST",
            headers: mutationHeaders,
            body: JSON.stringify({ sourceName: "dashboard.csv", csv }),
          }),
        );
        expect(imported.status).toBe(201);

        const next = await dashboard.handle(
          new Request(`${ORIGIN}/review/packages/next`, {
            headers: { cookie },
          }),
        );
        expect(next.status).toBe(200);
        const nextBody = (await next.json()) as { package: { id: string } };
        const id = nextBody.package.id;

        const one = await dashboard.handle(
          new Request(`${ORIGIN}/review/packages/${id}`, {
            headers: { cookie },
          }),
        );
        expect(one.status).toBe(200);

        const decided = await dashboard.handle(
          new Request(`${ORIGIN}/review/packages/${id}/decision`, {
            method: "POST",
            headers: mutationHeaders,
            body: JSON.stringify({ action: "reject" }),
          }),
        );
        expect(decided.status).toBe(200);

        const reason = await dashboard.handle(
          new Request(`${ORIGIN}/review/packages/${id}/rejection-reason`, {
            method: "POST",
            headers: mutationHeaders,
            body: JSON.stringify({ reason: "other" }),
          }),
        );
        expect(reason.status).toBe(200);

        const events = info.mock.calls.filter(
          ([event]) => event === "dashboard_review_mutation",
        );
        expect(events).toHaveLength(3);
        expect(events[0]?.[1]).toMatchObject({
          request_id: "22222222-2222-4222-8222-222222222222",
          session_audit_id: expect.stringMatching(/^[A-Za-z0-9_-]{22}$/),
          dispatch_mode: "mock",
          route: "review_import",
          status: 201,
        });
        expect(events[1]?.[1]).toMatchObject({
          request_id: "22222222-2222-4222-8222-222222222222",
          dispatch_mode: "mock",
          route: "review_package_decision",
          package_id: id,
          action: "reject",
          status: 200,
        });
        expect(events[2]?.[1]).toMatchObject({
          request_id: "22222222-2222-4222-8222-222222222222",
          dispatch_mode: "mock",
          route: "review_package_rejection_reason",
          package_id: id,
          reason: "other",
          status: 200,
        });
        const auditIds = events.map(([, fields]) =>
          (fields as { session_audit_id: string }).session_audit_id,
        );
        expect(new Set(auditIds).size).toBe(1);
      } finally {
        await db.close();
      }
    },
    120_000,
  );
});
