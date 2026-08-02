import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

const SESSION_VERSION = 1;
const SESSION_TTL_SECONDS = 12 * 60 * 60;
const MAX_CLOCK_SKEW_SECONDS = 60;
export const SESSION_COOKIE_NAME = "__Host-outreach_session";
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_FAILURE_LIMIT = 50;

export interface DashboardConfig {
  dbDataDir: string;
  publicOrigin: string;
  releaseSha: string;
  passwordDigest: Buffer;
  signingKey: Buffer;
}

export interface SessionClaims {
  version: 1;
  issuedAt: number;
  expiresAt: number;
  nonce: string;
}

export function readSessionCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  const values = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.startsWith(`${SESSION_COOKIE_NAME}=`))
    .map((part) => part.slice(SESSION_COOKIE_NAME.length + 1));
  if (values.length !== 1 || !/^[A-Za-z0-9_.-]+$/.test(values[0]!)) return null;
  return values[0]!;
}

export function sessionCookie(token: string): string {
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export class LoginLimiter {
  private windowStartedAt: number | null = null;
  private failures = 0;

  private resetIfExpired(nowMs: number): void {
    if (
      this.windowStartedAt !== null &&
      nowMs - this.windowStartedAt >= LOGIN_WINDOW_MS
    ) {
      this.windowStartedAt = null;
      this.failures = 0;
    }
  }

  isBlocked(nowMs = Date.now()): boolean {
    this.resetIfExpired(nowMs);
    return this.failures >= LOGIN_FAILURE_LIMIT;
  }

  recordFailure(nowMs = Date.now()): void {
    this.resetIfExpired(nowMs);
    this.windowStartedAt ??= nowMs;
    this.failures += 1;
  }
}

interface SessionPayload {
  v: number;
  iat: number;
  exp: number;
  nonce: string;
}

function signPayload(payload: string, signingKey: Buffer): Buffer {
  return createHmac("sha256", signingKey).update(payload).digest();
}

export function issueSession(
  signingKey: Buffer,
  options: { nowSeconds?: number; nonce?: Buffer } = {},
): string {
  const nowSeconds = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  const nonce = options.nonce ?? randomBytes(16);
  if (nonce.length !== 16) throw new Error("Session nonce must be 128 bits");
  const payload = Buffer.from(
    JSON.stringify({
      v: SESSION_VERSION,
      iat: nowSeconds,
      exp: nowSeconds + SESSION_TTL_SECONDS,
      nonce: nonce.toString("base64url"),
    } satisfies SessionPayload),
  ).toString("base64url");
  return `${payload}.${signPayload(payload, signingKey).toString("base64url")}`;
}

export function verifySession(
  token: string,
  signingKey: Buffer,
  nowSeconds = Math.floor(Date.now() / 1000),
): SessionClaims | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, encodedSignature] = parts;
  if (!payload || !encodedSignature || !/^[A-Za-z0-9_-]+$/.test(token.replace(".", ""))) {
    return null;
  }

  const actualSignature = Buffer.from(encodedSignature, "base64url");
  const expectedSignature = signPayload(payload, signingKey);
  if (
    actualSignature.toString("base64url") !== encodedSignature ||
    actualSignature.length !== expectedSignature.length ||
    !timingSafeEqual(actualSignature, expectedSignature)
  ) {
    return null;
  }

  try {
    const value = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as SessionPayload;
    const keys = Object.keys(value).sort().join(",");
    if (keys !== "exp,iat,nonce,v") return null;
    if (
      value.v !== SESSION_VERSION ||
      !Number.isInteger(value.iat) ||
      !Number.isInteger(value.exp) ||
      value.exp !== value.iat + SESSION_TTL_SECONDS ||
      value.iat > nowSeconds + MAX_CLOCK_SKEW_SECONDS ||
      value.exp <= nowSeconds ||
      typeof value.nonce !== "string" ||
      Buffer.from(value.nonce, "base64url").length !== 16
    ) {
      return null;
    }
    return {
      version: 1,
      issuedAt: value.iat,
      expiresAt: value.exp,
      nonce: value.nonce,
    };
  } catch {
    return null;
  }
}

export function deriveSessionAuditId(
  session: SessionClaims,
  signingKey: Buffer,
): string {
  return createHmac("sha256", signingKey)
    .update("dashboard-session-audit-v1\0")
    .update(session.nonce)
    .digest()
    .subarray(0, 16)
    .toString("base64url");
}

export function passwordMatches(candidate: string, expectedDigest: Buffer): boolean {
  const candidateDigest = createHash("sha256").update(candidate).digest();
  return (
    expectedDigest.length === candidateDigest.length &&
    timingSafeEqual(candidateDigest, expectedDigest)
  );
}

function required(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name];
  if (!value) throw new Error(`Dashboard runtime requires ${name}`);
  return value;
}

function decodeBase64Url(value: string, name: string): Buffer {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error(`${name} must be canonical base64url`);
  }
  const decoded = Buffer.from(value, "base64url");
  if (decoded.toString("base64url") !== value) {
    throw new Error(`${name} must be canonical base64url`);
  }
  return decoded;
}

export function loadDashboardConfig(
  env: NodeJS.ProcessEnv = process.env,
): DashboardConfig {
  if (env.OUTREACH_RUNTIME_MODE !== "dashboard") {
    throw new Error("OUTREACH_RUNTIME_MODE must be dashboard");
  }
  if (env.OUTREACH_DISPATCH_MODE !== "mock") {
    throw new Error("OUTREACH_DISPATCH_MODE must be mock");
  }

  const dbDataDir = required(env, "OUTREACH_DB_DATA_DIR");
  const publicOrigin = required(env, "OUTREACH_PUBLIC_ORIGIN");
  const releaseSha = required(env, "OUTREACH_RELEASE_SHA");
  if (!/^[0-9a-f]{40}$/.test(releaseSha)) {
    throw new Error("OUTREACH_RELEASE_SHA must be a lowercase 40-character Git SHA");
  }
  const origin = new URL(publicOrigin);
  if (origin.protocol !== "https:" || origin.origin !== publicOrigin) {
    throw new Error("OUTREACH_PUBLIC_ORIGIN must be an exact HTTPS origin");
  }

  const password = required(env, "OUTREACH_OPERATOR_PASSWORD");
  const signingSecret = required(env, "OUTREACH_SESSION_SIGNING_KEY");
  const passwordBytes = decodeBase64Url(password, "OUTREACH_OPERATOR_PASSWORD");
  const signingKey = decodeBase64Url(
    signingSecret,
    "OUTREACH_SESSION_SIGNING_KEY",
  );
  if (passwordBytes.length < 16) {
    throw new Error("OUTREACH_OPERATOR_PASSWORD must contain at least 128 bits");
  }
  if (signingKey.length !== 32) {
    throw new Error("OUTREACH_SESSION_SIGNING_KEY must contain exactly 256 bits");
  }

  const passwordDigest = createHash("sha256").update(password).digest();
  delete env.OUTREACH_OPERATOR_PASSWORD;
  delete env.OUTREACH_SESSION_SIGNING_KEY;

  return { dbDataDir, publicOrigin, releaseSha, passwordDigest, signingKey };
}
