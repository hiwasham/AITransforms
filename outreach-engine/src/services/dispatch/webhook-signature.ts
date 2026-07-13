/**
 * Shared webhook signature-verification utility (T061,
 * contracts/dispatch-webhook.md "Required signature verification").
 *
 * Fail-closed: any missing/malformed/mismatched signature verifies false.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  secret: string,
): boolean {
  if (!signatureHeader) {
    return false;
  }

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  const providedBuf = Buffer.from(signatureHeader, "utf8");

  if (expectedBuf.length !== providedBuf.length) {
    return false;
  }
  return timingSafeEqual(expectedBuf, providedBuf);
}
