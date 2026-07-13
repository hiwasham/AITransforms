/**
 * Standard API error-response shape (contracts/outreach-api.md Errors).
 *
 * Note: a minimal version was needed immediately for the MVP-1 route
 * handlers (T044-T047) to return anything sensible on failure — the full
 * T014 (a consistent taxonomy across every endpoint including Phase 2/
 * Future ones) remains categorized Phase 2, but this base shape is what
 * that later work extends, not replaces.
 */

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export function errorResponse(
  code: string,
  message: string,
  status: number,
): Response {
  return jsonResponse({ error: { code, message } }, status);
}

export const CONFLICT_ILLEGAL_TRANSITION = "illegal_workflow_transition";
