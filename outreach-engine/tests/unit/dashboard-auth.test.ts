import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  clearSessionCookie,
  deriveSessionAuditId,
  LoginLimiter,
  issueSession,
  loadDashboardConfig,
  passwordMatches,
  readSessionCookie,
  sessionCookie,
  verifySession,
} from "@/server/dashboard-auth.js";

function validEnv(): NodeJS.ProcessEnv {
  return {
    OUTREACH_RUNTIME_MODE: "dashboard",
    OUTREACH_DISPATCH_MODE: "mock",
    OUTREACH_DB_DATA_DIR: "/var/lib/aitransforms-outreach/pglite",
    OUTREACH_PUBLIC_ORIGIN: "https://outreach.example.test:10000",
    OUTREACH_OPERATOR_PASSWORD: Buffer.alloc(16, 7).toString("base64url"),
    OUTREACH_SESSION_SIGNING_KEY: Buffer.alloc(32, 9).toString("base64url"),
    OUTREACH_RELEASE_SHA: "a".repeat(40),
  };
}

describe("dashboard authentication config", () => {
  it("loads only dashboard/mock mode, derives binary secrets, and removes raw env values", () => {
    const password = Buffer.alloc(16, 7).toString("base64url");
    const signingSecret = Buffer.alloc(32, 9).toString("base64url");
    const env: NodeJS.ProcessEnv = {
      OUTREACH_RUNTIME_MODE: "dashboard",
      OUTREACH_DISPATCH_MODE: "mock",
      OUTREACH_DB_DATA_DIR: "/var/lib/aitransforms-outreach/pglite",
      OUTREACH_PUBLIC_ORIGIN:
        "https://finland-freedom1-89-167-19-64.tail0dc61e.ts.net:3111",
      OUTREACH_OPERATOR_PASSWORD: password,
      OUTREACH_SESSION_SIGNING_KEY: signingSecret,
      OUTREACH_RELEASE_SHA: "b".repeat(40),
    };

    const config = loadDashboardConfig(env);

    expect(config.passwordDigest).toEqual(
      createHash("sha256").update(password).digest(),
    );
    expect(config.signingKey).toEqual(Buffer.alloc(32, 9));
    expect(config.publicOrigin).toBe(
      "https://finland-freedom1-89-167-19-64.tail0dc61e.ts.net:3111",
    );
    expect(config.dbDataDir).toBe("/var/lib/aitransforms-outreach/pglite");
    expect(config.releaseSha).toBe("b".repeat(40));
    expect(env.OUTREACH_OPERATOR_PASSWORD).toBeUndefined();
    expect(env.OUTREACH_SESSION_SIGNING_KEY).toBeUndefined();
  });

  it("compares a bounded candidate through its SHA-256 digest", () => {
    const digest = createHash("sha256").update("correct-password").digest();

    expect(passwordMatches("correct-password", digest)).toBe(true);
    expect(passwordMatches("wrong-password", digest)).toBe(false);
  });

  it("issues a versioned 12-hour absolute session and rejects it at expiry", () => {
    const signingKey = Buffer.alloc(32, 4);
    const nowSeconds = 1_800_000_000;
    const token = issueSession(signingKey, {
      nowSeconds,
      nonce: Buffer.alloc(16, 5),
    });

    expect(verifySession(token, signingKey, nowSeconds)).toEqual({
      version: 1,
      issuedAt: nowSeconds,
      expiresAt: nowSeconds + 12 * 60 * 60,
      nonce: Buffer.alloc(16, 5).toString("base64url"),
    });
    expect(
      verifySession(token, signingKey, nowSeconds + 12 * 60 * 60),
    ).toBeNull();

    const [payload, signature] = token.split(".") as [string, string];
    const alphabet =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    const lastIndex = alphabet.indexOf(signature.at(-1)!);
    const nonCanonical = `${payload}.${signature.slice(0, -1)}${alphabet[lastIndex + 1]}`;
    expect(Buffer.from(nonCanonical.split(".")[1]!, "base64url")).toEqual(
      Buffer.from(signature, "base64url"),
    );
    expect(verifySession(nonCanonical, signingKey, nowSeconds)).toBeNull();
  });

  it("derives a stable non-secret audit ID for each session", () => {
    const signingKey = Buffer.alloc(32, 4);
    const nowSeconds = 1_800_000_000;
    const first = verifySession(
      issueSession(signingKey, { nowSeconds, nonce: Buffer.alloc(16, 1) }),
      signingKey,
      nowSeconds,
    );
    const second = verifySession(
      issueSession(signingKey, { nowSeconds, nonce: Buffer.alloc(16, 2) }),
      signingKey,
      nowSeconds,
    );

    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    expect(deriveSessionAuditId(first!, signingKey)).toMatch(
      /^[A-Za-z0-9_-]{22}$/,
    );
    expect(deriveSessionAuditId(first!, signingKey)).toBe(
      deriveSessionAuditId(first!, signingKey),
    );
    expect(deriveSessionAuditId(first!, signingKey)).not.toBe(
      deriveSessionAuditId(second!, signingKey),
    );
    expect(deriveSessionAuditId(first!, signingKey)).not.toContain(first!.nonce);
  });

  it("uses one exact secure host cookie and rejects missing or duplicate values", () => {
    expect(readSessionCookie("a=1; __Host-outreach_session=token-value")).toBe(
      "token-value",
    );
    expect(readSessionCookie(undefined)).toBeNull();
    expect(
      readSessionCookie(
        "__Host-outreach_session=one; __Host-outreach_session=two",
      ),
    ).toBeNull();
    expect(sessionCookie("token-value")).toBe(
      "__Host-outreach_session=token-value; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200",
    );
  });

  it("blocks after 50 failures in a fixed 15-minute window and resets", () => {
    const limiter = new LoginLimiter();
    const startedAt = 10_000;
    for (let i = 0; i < 49; i++) limiter.recordFailure(startedAt);
    expect(limiter.isBlocked(startedAt)).toBe(false);
    limiter.recordFailure(startedAt);
    expect(limiter.isBlocked(startedAt)).toBe(true);
    expect(limiter.isBlocked(startedAt + 15 * 60 * 1000)).toBe(false);
  });

  it.each([
    ["runtime mode", { OUTREACH_RUNTIME_MODE: "full" }, /must be dashboard/],
    ["dispatch mode", { OUTREACH_DISPATCH_MODE: "live" }, /must be mock/],
    [
      "release SHA",
      { OUTREACH_RELEASE_SHA: "not-a-sha" },
      /40-character Git SHA/,
    ],
    ["HTTP origin", { OUTREACH_PUBLIC_ORIGIN: "http://example.test" }, /HTTPS origin/],
    [
      "origin path",
      { OUTREACH_PUBLIC_ORIGIN: "https://example.test/path" },
      /exact HTTPS origin/,
    ],
    [
      "short password",
      { OUTREACH_OPERATOR_PASSWORD: Buffer.alloc(15).toString("base64url") },
      /128 bits/,
    ],
    [
      "short signing key",
      { OUTREACH_SESSION_SIGNING_KEY: Buffer.alloc(31).toString("base64url") },
      /256 bits/,
    ],
    [
      "malformed password encoding",
      {
        OUTREACH_OPERATOR_PASSWORD: `!${Buffer.alloc(16, 7).toString("base64url")}`,
      },
      /base64url/,
    ],
    [
      "malformed signing-key encoding",
      {
        OUTREACH_SESSION_SIGNING_KEY: `!${Buffer.alloc(32, 9).toString("base64url")}`,
      },
      /base64url/,
    ],
  ])("rejects invalid %s before startup", (_label, overrides, error) => {
    expect(() => loadDashboardConfig({ ...validEnv(), ...overrides })).toThrow(
      error,
    );
  });

  it("rejects malformed, tampered, and future-issued sessions", () => {
    const signingKey = Buffer.alloc(32, 4);
    const now = 1_800_000_000;
    const token = issueSession(signingKey, {
      nowSeconds: now,
      nonce: Buffer.alloc(16, 1),
    });
    const [payload, signature] = token.split(".") as [string, string];
    const changed = signature[0] === "A" ? "B" : "A";

    expect(verifySession("not-a-session", signingKey, now)).toBeNull();
    expect(
      verifySession(`${payload}.${changed}${signature.slice(1)}`, signingKey, now),
    ).toBeNull();
    expect(
      verifySession(
        issueSession(signingKey, {
          nowSeconds: now + 61,
          nonce: Buffer.alloc(16, 2),
        }),
        signingKey,
        now,
      ),
    ).toBeNull();
  });

  it("rejects malformed cookie values and clears the exact host cookie", () => {
    expect(readSessionCookie("__Host-outreach_session=has%20space")).toBeNull();
    expect(readSessionCookie("__Host-outreach_session=")).toBeNull();
    expect(clearSessionCookie()).toBe(
      "__Host-outreach_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0",
    );
  });
});
