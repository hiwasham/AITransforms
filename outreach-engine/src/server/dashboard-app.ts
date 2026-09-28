import type { Db } from "@/db/client.js";
import { jsonResponse } from "@/api/lib/errors.js";
import { createReviewImportHandler } from "@/api/review/imports/route.js";
import { createNextPackageHandler } from "@/api/review/packages/next/route.js";
import { createGetReviewPackageHandler } from "@/api/review/packages/[id]/route.js";
import {
  createDecisionHandler,
  REVIEW_ACTIONS,
} from "@/api/review/packages/[id]/decision/route.js";
import { createRejectionReasonHandler } from "@/api/review/packages/[id]/rejection-reason/route.js";
import { REJECTION_REASONS } from "@/domain/review/review-package.js";
import { readFile } from "node:fs/promises";
import { logger, type LogFields } from "@/lib/logger.js";
import {
  clearSessionCookie,
  deriveSessionAuditId,
  issueSession,
  LoginLimiter,
  passwordMatches,
  readSessionCookie,
  sessionCookie,
  verifySession,
  type DashboardConfig,
  type SessionClaims,
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
  allowMissingOrigin?: true;
  acceptedContentType: AcceptedContentType;
  audit?: {
    route:
      | "review_import"
      | "review_package_decision"
      | "review_package_rejection_reason";
    bodyField?: "action" | "reason";
  };
}

const SAFE_AUDIT_VALUES: Record<
  "action" | "reason",
  ReadonlySet<string>
> = {
  action: new Set(REVIEW_ACTIONS),
  reason: new Set(REJECTION_REASONS),
} as const;

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

function requestId(request: Request): string {
  const value = request.headers.get("x-request-id");
  return value &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
    ? value
    : "unavailable";
}

function safePackageId(id: string | undefined): string | null {
  return id &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id,
    )
    ? id
    : null;
}

function loginOutcome(status: number): string {
  switch (status) {
    case 303:
      return "authenticated";
    case 401:
      return "credentials_rejected";
    case 403:
      return "origin_rejected";
    case 413:
      return "payload_too_large";
    case 415:
      return "media_type_rejected";
    case 429:
      return "rate_limited";
    default:
      return status >= 500 ? "internal_error" : "invalid_request";
  }
}

async function safeReviewBodyFields(
  policy: DashboardRoute,
  request: Request,
): Promise<LogFields> {
  const field = policy.audit?.bodyField;
  if (!field || mediaType(request) !== "application/json") return {};
  try {
    const body = (await request.clone().json()) as Record<string, unknown>;
    const value = body[field];
    return typeof value === "string" && SAFE_AUDIT_VALUES[field].has(value)
      ? { [field]: value }
      : {};
  } catch {
    return {};
  }
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
      allowMissingOrigin: true,
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
      audit: { route: "review_import" },
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
      audit: { route: "review_package_decision", bodyField: "action" },
      handler: createDecisionHandler(deps.db) as RouteHandler,
    },
    {
      method: "POST",
      segments: ["review", "packages", ":id", "rejection-reason"],
      access: "protected",
      mutation: true,
      acceptedContentType: "json",
      audit: {
        route: "review_package_rejection_reason",
        bodyField: "reason",
      },
      handler: createRejectionReasonHandler(deps.db) as RouteHandler,
    },
  ];

  async function enforce(
    policy: DashboardRoute,
    request: Request,
    context: { params: Record<string, string> },
  ): Promise<Response> {
    let session: SessionClaims | null = null;
    let reviewBodyFields: LogFields = {};
    if (policy.access !== "public") {
      const token = readSessionCookie(request.headers.get("cookie") ?? undefined);
      session = token ? verifySession(token, deps.config.signingKey) : null;
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

    let response: Response;
    const origin = request.headers.get("origin");
    if (
      policy.mutation &&
      origin !== deps.config.publicOrigin &&
      !(policy.allowMissingOrigin && origin === null)
    ) {
      response = fixedError("forbidden", "Request forbidden", 403);
    } else if (policy.acceptedContentType !== null) {
      const expected =
        policy.acceptedContentType === "form"
          ? "application/x-www-form-urlencoded"
          : "application/json";
      if (mediaType(request) !== expected) {
        response = fixedError(
          "unsupported_media_type",
          "Unsupported media type",
          415,
        );
      } else {
        response = await runHandler();
      }
    } else {
      response = await runHandler();
    }

    auditResponse(response.status);
    return response;

    async function runHandler(): Promise<Response> {
      if (policy.audit && session) {
        reviewBodyFields = await safeReviewBodyFields(policy, request);
      }
      try {
        return await policy.handler(request, context);
      } catch (error) {
        auditResponse(500);
        throw error;
      }
    }

    function auditResponse(status: number): void {
      if (policy.method === "POST" && policy.segments[0] === "login") {
        logger.info("dashboard_login_attempt", {
          request_id: requestId(request),
          outcome: loginOutcome(status),
          limiter_blocked: loginLimiter.isBlocked(),
        });
      }
      if (policy.audit && session) {
        logReviewMutation(status, session, policy.audit.route);
      }
    }

    function logReviewMutation(
      status: number,
      authenticatedSession: SessionClaims,
      route: NonNullable<DashboardRoute["audit"]>["route"],
    ): void {
      const packageId = safePackageId(context.params.id);
      logger.info("dashboard_review_mutation", {
        request_id: requestId(request),
        session_audit_id: deriveSessionAuditId(
          authenticatedSession,
          deps.config.signingKey,
        ),
        dispatch_mode: "mock",
        route,
        status,
        ...(packageId ? { package_id: packageId } : {}),
        ...reviewBodyFields,
      });
    }
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
