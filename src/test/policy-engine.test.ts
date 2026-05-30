import { describe, expect, it } from "vitest";

import {
  evaluateApprovalDecision,
  evaluatePromotion,
  evaluateRollback,
} from "@/server/modules/governance/policy-engine";

const cleanPromotion = {
  agentExists: true,
  agentVersionExists: true,
  environment: "production" as const,
  riskLevel: "medium" as const,
  promptVersionApproved: true,
  modelEnabledForProduction: true,
  evaluationsPassing: true,
  hasOpenCriticalIncident: false,
  hasRecordedApproval: true,
};

describe("promotion policy", () => {
  it("allows a fully satisfied production promotion", () => {
    const decision = evaluatePromotion(cleanPromotion);
    expect(decision.allowed).toBe(true);
    expect(decision.requiredApprovals).toBe(1);
  });

  it("blocks when evaluations are failing", () => {
    const decision = evaluatePromotion({
      ...cleanPromotion,
      evaluationsPassing: false,
    });
    expect(decision.allowed).toBe(false);
    expect(decision.blockingIssues.map((i) => i.code)).toContain(
      "evaluations_failing",
    );
  });

  it("blocks when the model is not production enabled", () => {
    const decision = evaluatePromotion({
      ...cleanPromotion,
      modelEnabledForProduction: false,
    });
    expect(decision.allowed).toBe(false);
    expect(decision.blockingIssues.map((i) => i.code)).toContain(
      "model_not_production_enabled",
    );
  });

  it("blocks when there is an open critical incident", () => {
    const decision = evaluatePromotion({
      ...cleanPromotion,
      hasOpenCriticalIncident: true,
    });
    expect(decision.allowed).toBe(false);
  });

  it("notes when production promotion needs approval", () => {
    const decision = evaluatePromotion({
      ...cleanPromotion,
      hasRecordedApproval: false,
    });
    // No blocking issue; the workflow routes to pending approval.
    expect(decision.allowed).toBe(true);
    expect(decision.reasons.join(" ")).toContain("approval");
  });
});

describe("rollback policy", () => {
  const cleanRollback = {
    targetExists: true,
    sameAgent: true,
    targetBlocked: false,
    targetEnvironment: "production" as const,
    targetHasFailedCriticalEvaluation: false,
  };

  it("allows rollback to a prior stable deployment", () => {
    expect(evaluateRollback(cleanRollback).allowed).toBe(true);
  });

  it("blocks rollback to a target with a failed critical evaluation", () => {
    const decision = evaluateRollback({
      ...cleanRollback,
      targetHasFailedCriticalEvaluation: true,
    });
    expect(decision.allowed).toBe(false);
  });

  it("blocks rollback to a different agent", () => {
    expect(
      evaluateRollback({ ...cleanRollback, sameAgent: false }).allowed,
    ).toBe(false);
  });
});

describe("approval decision policy", () => {
  it("allows approving a pending request", () => {
    const decision = evaluateApprovalDecision({
      approvalExists: true,
      isPending: true,
      isRejection: false,
      hasReason: false,
    });
    expect(decision.allowed).toBe(true);
  });

  it("blocks a decision on an already-decided request", () => {
    const decision = evaluateApprovalDecision({
      approvalExists: true,
      isPending: false,
      isRejection: false,
      hasReason: false,
    });
    expect(decision.allowed).toBe(false);
    expect(decision.blockingIssues.map((i) => i.code)).toContain(
      "approval_not_pending",
    );
  });

  it("requires a reason to reject", () => {
    const decision = evaluateApprovalDecision({
      approvalExists: true,
      isPending: true,
      isRejection: true,
      hasReason: false,
    });
    expect(decision.allowed).toBe(false);
    expect(decision.blockingIssues.map((i) => i.code)).toContain(
      "reason_required",
    );
  });
});
