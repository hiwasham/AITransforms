import type { Db } from "@/db/client.js";
import { jsonResponse } from "@/api/lib/errors.js";
import { createReviewImportHandler } from "@/api/review/imports/route.js";
import { createNextPackageHandler } from "@/api/review/packages/next/route.js";
import { createGetReviewPackageHandler } from "@/api/review/packages/[id]/route.js";
import { createDecisionHandler } from "@/api/review/packages/[id]/decision/route.js";
import { createRejectionReasonHandler } from "@/api/review/packages/[id]/rejection-reason/route.js";
import { readFile } from "node:fs/promises";
import {
  clearSessionCookie,
  issueSession,
  LoginLimiter,
  passwordMatches,
  readSessionCookie,
  sessionCookie,
  verifySession,
  type DashboardConfig,
} from "./dashboard-auth.js";
import {
  createRouter,
  type App,
  type Route,
  type RouteHandler,
} from "./router.js";

export const DASHBOARD_SECURITY_HEADERS = {
  "cache-control": "no-store",
  "content-security-policy":
    "default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'self'; img-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
} as const;
const LOGIN_PAGE = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Outreach dashboard login</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; font-family: system-ui, sans-serif; background: #f7f7f7; color: #1a1a1a; }
    main { width: min(24rem, calc(100% - 2rem)); padding: 2rem; border: 1px solid #ddd; border-radius: .75rem; background: white; }
    label, input, button { display: block; width: 100%; font: inherit; }
    input { margin: .5rem 0 1rem; padding: .75rem; box-sizing: border-box; }
    button { padding: .75rem; font-weight: 700; cursor: pointer; }
  </style>
</head>
<body>
  <main>
    <h1>Outreach dashboard</h1>
    <form method="post" action="/login">
      <label for="password">Operator password</label>
      <input id="password" name="password" type="password" autocomplete="current-password" required autofocus>
      <button type="submit">Sign in</button>
    </form>
  </main>
</body>
</html>`;

type AccessClass = "public" | "navigation" | "protected";
type AcceptedContentType = "form" | "json" | null;

interface DashboardRoute extends Route {
  access: AccessClass;
  mutation: boolean;
  acceptedContentType: AcceptedContentType;
}

function hasValidFormEncoding(body: string): boolean {
  try {
    for (const component of body.split(/[&=]/)) {
      decodeURIComponent(component.replace(/\+/g, " "));
    }
    return true;
  } catch {
    return false;
  }
}

export interface DashboardAppDeps {
  db: Db;
  config: DashboardConfig;
}

function secure(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(DASHBOARD_SECURITY_HEADERS)) {
    headers.set(name, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function fixedError(code: string, message: string, status: number): Response {
  return jsonResponse({ error: { code, message } }, status);
}

function mediaType(request: Request): string | null {
  return (
    request.headers
      .get("content-type")
      ?.split(";", 1)[0]
      ?.trim()
      .toLowerCase() ?? null
  );
}

export function createDashboardApp(deps: DashboardAppDeps): App {
  const loginLimiter = new LoginLimiter();

  async function login(request: Request): Promise<Response> {
    if (loginLimiter.isBlocked()) {
      return fixedError("rate_limited", "Too many requests", 429);
    }

    const body = await request.text();
    if (Buffer.byteLength(body) > 4 * 1024) {
      return fixedError("payload_too_large", "Payload too large", 413);
    }
    if (!hasValidFormEncoding(body)) {
      return fixedError("invalid_request", "Invalid request", 400);
    }
    const form = new URLSearchParams(body);
    const fields = [...form.keys()];
    const password = form.get("password");
    if (
      fields.length !== 1 ||
      fields[0] !== "password" ||
      password === null ||
      password.length === 0
    ) {
      return fixedError("invalid_request", "Invalid request", 400);
    }
    if (!passwordMatches(password, deps.config.passwordDigest)) {
      loginLimiter.recordFailure();
      return fixedError("authentication_failed", "Authentication failed", 401);
    }

    const token = issueSession(deps.config.signingKey);
    return new Response(null, {
      status: 303,
      headers: { location: "/", "set-cookie": sessionCookie(token) },
    });
  }

  const uiRoot = new URL("../ui/", import.meta.url);
  const serveUi = (file: string, contentType: string): RouteHandler => async () =>
    new Response(await readFile(new URL(file, uiRoot), "utf8"), {
      headers: { "content-type": contentType },
    });

  const policies: DashboardRoute[] = [
    {
      method: "GET",
      segments: ["login"],
      access: "public",
      mutation: false,
      acceptedContentType: null,
      handler: (() =>
        Promise.resolve(
          new Response(LOGIN_PAGE, {
            headers: { "content-type": "text/html; charset=utf-8" },
          }),
        )) as RouteHandler,
    },
    {
      method: "POST",
      segments: ["login"],
      access: "public",
      mutation: true,
      acceptedContentType: "form",
      handler: login,
    },
    {
      method: "POST",
      segments: ["logout"],
      access: "public",
      mutation: true,
      acceptedContentType: null,
      handler: (() =>
        Promise.resolve(
          new Response(null, {
            status: 303,
            headers: {
              location: "/login",
              "set-cookie": clearSessionCookie(),
            },
          }),
        )) as RouteHandler,
    },
    {
      method: "GET",
      segments: ["healthz"],
      access: "public",
      mutation: false,
      acceptedContentType: null,
      handler: (() =>
        Promise.resolve(jsonResponse({ status: "ok" }))) as RouteHandler,
    },
    {
      method: "GET",
      segments: [],
      access: "navigation",
      mutation: false,
      acceptedContentType: null,
      handler: serveUi("index.html", "text/html; charset=utf-8"),
    },
    {
      method: "GET",
      segments: ["ui", "review.js"],
      access: "protected",
      mutation: false,
      acceptedContentType: null,
      handler: serveUi("review.js", "text/javascript; charset=utf-8"),
    },
    {
      method: "POST",
      segments: ["review", "imports"],
      access: "protected",
      mutation: true,
      acceptedContentType: "json",
      handler: createReviewImportHandler(deps.db) as RouteHandler,
    },
    {
      method: "GET",
      segments: ["review", "packages", "next"],
      access: "protected",
      mutation: false,
      acceptedContentType: null,
      handler: createNextPackageHandler(deps.db) as RouteHandler,
    },
    {
      method: "GET",
      segments: ["review", "packages", ":id"],
      access: "protected",
      mutation: false,
      acceptedContentType: null,
      handler: createGetReviewPackageHandler(deps.db) as RouteHandler,
    },
    {
      method: "POST",
      segments: ["review", "packages", ":id", "decision"],
      access: "protected",
      mutation: true,
      acceptedContentType: "json",
      handler: createDecisionHandler(deps.db) as RouteHandler,
    },
    {
      method: "POST",
      segments: ["review", "packages", ":id", "rejection-reason"],
      access: "protected",
      mutation: true,
      acceptedContentType: "json",
      handler: createRejectionReasonHandler(deps.db) as RouteHandler,
    },
  ];

  async function enforce(
    policy: DashboardRoute,
    request: Request,
    context: { params: Record<string, string> },
  ): Promise<Response> {
    if (policy.access !== "public") {
      const token = readSessionCookie(request.headers.get("cookie") ?? undefined);
      const session = token
        ? verifySession(token, deps.config.signingKey)
        : null;
      if (!session) {
        if (policy.access === "navigation") {
          return new Response(null, {
            status: 303,
            headers: { location: "/login" },
          });
        }
        return fixedError(
          "unauthorized",
          "Authentication required",
          401,
        );
      }
    }
    if (
      policy.mutation &&
      request.headers.get("origin") !== deps.config.publicOrigin
    ) {
      return fixedError("forbidden", "Request forbidden", 403);
    }
    if (policy.acceptedContentType !== null) {
      const expected =
        policy.acceptedContentType === "form"
          ? "application/x-www-form-urlencoded"
          : "application/json";
      if (mediaType(request) !== expected) {
        return fixedError(
          "unsupported_media_type",
          "Unsupported media type",
          415,
        );
      }
    }
    return policy.handler(request, context);
  }

  const router = createRouter(
    policies.map((policy) => ({
      ...policy,
      handler: (request, context) => enforce(policy, request, context),
    })),
  );

  return {
    async handle(request: Request): Promise<Response> {
      return secure(await router.handle(request));
    },
  };
}
