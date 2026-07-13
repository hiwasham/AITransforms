import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyWebhookSignature } from "@/services/dispatch/webhook-signature.js";

describe("verifyWebhookSignature (T053, fail-closed)", () => {
  const secret = "test-secret";
  const body = JSON.stringify({ providerEventId: "evt_1", threadId: "th_1", eventType: "reply" });
  const validSignature = createHmac("sha256", secret).update(body).digest("hex");

  it("accepts a correctly-signed body", () => {
    expect(verifyWebhookSignature(body, validSignature, secret)).toBe(true);
  });

  it("rejects a missing signature (fail-closed)", () => {
    expect(verifyWebhookSignature(body, null, secret)).toBe(false);
    expect(verifyWebhookSignature(body, undefined, secret)).toBe(false);
    expect(verifyWebhookSignature(body, "", secret)).toBe(false);
  });

  it("rejects a malformed signature", () => {
    expect(verifyWebhookSignature(body, "not-hex-at-all!!", secret)).toBe(false);
  });

  it("rejects a signature computed with the wrong secret", () => {
    const wrongSignature = createHmac("sha256", "wrong-secret").update(body).digest("hex");
    expect(verifyWebhookSignature(body, wrongSignature, secret)).toBe(false);
  });

  it("rejects a valid signature for a different body (tamper detection)", () => {
    const tamperedBody = JSON.stringify({ providerEventId: "evt_1", threadId: "th_2", eventType: "reply" });
    expect(verifyWebhookSignature(tamperedBody, validSignature, secret)).toBe(false);
  });
});
