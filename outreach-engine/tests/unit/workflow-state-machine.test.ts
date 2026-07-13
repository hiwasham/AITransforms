import { describe, expect, it } from "vitest";
import {
  isValidTransition,
  canReachSentDirectlyFromApproved,
  TERMINAL_TO_BATCH_RESUME,
  ALL_WORKFLOW_STATES,
} from "@/domain/pipeline/workflow-state-machine.js";

describe("Workflow State Machine transition legality (T021)", () => {
  it("allows the full happy-path chain", () => {
    expect(isValidTransition("generated", "quality_checked")).toBe(true);
    expect(isValidTransition("quality_checked", "human_review_queue")).toBe(true);
    expect(isValidTransition("human_review_queue", "approved")).toBe(true);
    expect(isValidTransition("approved", "dispatching")).toBe(true);
    expect(isValidTransition("dispatching", "sent")).toBe(true);
    expect(isValidTransition("sent", "response_tracking")).toBe(true);
  });

  it("sent is unreachable directly from approved — dispatch is a separate step (CHK003)", () => {
    expect(canReachSentDirectlyFromApproved()).toBe(false);
    expect(isValidTransition("approved", "sent")).toBe(false);
  });

  it("allows the revision-retry loop and its bounded exit", () => {
    expect(isValidTransition("quality_checked", "revision_requested")).toBe(true);
    expect(isValidTransition("revision_requested", "quality_checked")).toBe(true);
    expect(isValidTransition("revision_requested", "needs_manual_draft")).toBe(true);
  });

  it("allows the dispatch failure/retry sub-machine", () => {
    expect(isValidTransition("dispatching", "dispatch_failed")).toBe(true);
    expect(isValidTransition("dispatch_failed", "dispatching")).toBe(true);
  });

  it("rejects illegal jumps", () => {
    expect(isValidTransition("generated", "sent")).toBe(false);
    expect(isValidTransition("human_review_queue", "sent")).toBe(false);
    expect(isValidTransition("needs_attention", "human_review_queue")).toBe(false);
    expect(isValidTransition("response_tracking", "sent")).toBe(false);
  });

  it("exposes the explicit terminal-to-batch-resume state set (data-model.md)", () => {
    const expected = [
      "needs_attention",
      "needs_manual_draft",
      "human_review_queue",
      "approved",
      "dispatching",
      "dispatch_failed",
      "sent",
      "response_tracking",
    ];
    for (const state of expected) {
      expect(TERMINAL_TO_BATCH_RESUME.has(state as never)).toBe(true);
    }
    // generated is explicitly NOT terminal-to-batch-resume — it's the one
    // state a retry may act on.
    expect(TERMINAL_TO_BATCH_RESUME.has("generated" as never)).toBe(false);
  });

  it("every workflow state is covered by ALL_WORKFLOW_STATES", () => {
    expect(ALL_WORKFLOW_STATES).toHaveLength(11);
  });
});
