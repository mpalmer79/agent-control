// Governance policy engine.
//
// Evaluates whether a governed action is allowed. The engine is pure: it takes
// a set of facts and returns a PolicyDecision. Facts are gathered by the
// service layer from the seed-derived demo source (or the database in a later
// phase), which keeps the engine testable and free of data-access concerns.
//
// This is intentionally lightweight. A full policy language is out of scope.

import type {
  PolicyDecision,
  PolicyIssue,
  WorkflowAction,
} from "@/types/workflows";
import type { EnvironmentName, RiskLevel } from "@/types/domain";

export interface PromotionFacts {
  agentExists: boolean;
  agentVersionExists: boolean;
  environment: EnvironmentName;
  riskLevel: RiskLevel;
  promptVersionApproved: boolean;
  modelEnabledForProduction: boolean;
  evaluationsPassing: boolean;
  hasOpenCriticalIncident: boolean;
  hasRecordedApproval: boolean;
}

export interface RollbackFacts {
  targetExists: boolean;
  sameAgent: boolean;
  targetBlocked: boolean;
  targetEnvironment: EnvironmentName;
  targetHasFailedCriticalEvaluation: boolean;
}

export interface ApprovalDecisionFacts {
  approvalExists: boolean;
  isPending: boolean;
  isRejection: boolean;
  hasReason: boolean;
}

function blocking(code: string, message: string): PolicyIssue {
  return { code, message, severity: "blocking" };
}

function warning(code: string, message: string): PolicyIssue {
  return { code, message, severity: "warning" };
}

function decide(
  action: WorkflowAction,
  blockingIssues: PolicyIssue[],
  warnings: PolicyIssue[],
  requiredApprovals: number,
  reasons: string[],
): PolicyDecision {
  return {
    allowed: blockingIssues.length === 0,
    action,
    requiredApprovals,
    blockingIssues,
    warnings,
    reasons,
  };
}

export function evaluatePromotion(facts: PromotionFacts): PolicyDecision {
  const blockingIssues: PolicyIssue[] = [];
  const warnings: PolicyIssue[] = [];
  const reasons: string[] = [];

  if (!facts.agentExists) {
    blockingIssues.push(blocking("agent_missing", "Agent does not exist."));
  }
  if (!facts.agentVersionExists) {
    blockingIssues.push(
      blocking("agent_version_missing", "Agent version does not exist."),
    );
  }

  const isProduction = facts.environment === "production";
  const requiresApproval =
    isProduction || facts.riskLevel === "high" || facts.riskLevel === "medium";

  if (isProduction) {
    if (!facts.promptVersionApproved) {
      blockingIssues.push(
        blocking(
          "prompt_not_approved",
          "The prompt version is not approved for production.",
        ),
      );
    }
    if (!facts.modelEnabledForProduction) {
      blockingIssues.push(
        blocking(
          "model_not_production_enabled",
          "The selected model is not enabled for production.",
        ),
      );
    }
    if (!facts.evaluationsPassing) {
      blockingIssues.push(
        blocking(
          "evaluations_failing",
          "Required evaluations are not passing.",
        ),
      );
    }
    if (facts.hasOpenCriticalIncident) {
      blockingIssues.push(
        blocking(
          "open_critical_incident",
          "The agent has an open critical incident.",
        ),
      );
    }
    if (!facts.hasRecordedApproval) {
      // Not a hard block: the workflow returns pending_approval and creates the
      // approval request instead.
      reasons.push("Production promotion requires human approval.");
    }
  }

  if (facts.riskLevel === "high") {
    reasons.push("High-risk agents require reviewer approval.");
  }

  return decide(
    "deployment.promote",
    blockingIssues,
    warnings,
    requiresApproval ? 1 : 0,
    reasons,
  );
}

export function evaluateRollback(facts: RollbackFacts): PolicyDecision {
  const blockingIssues: PolicyIssue[] = [];
  const warnings: PolicyIssue[] = [];
  const reasons: string[] = [];

  if (!facts.targetExists) {
    blockingIssues.push(
      blocking("target_missing", "The rollback target does not exist."),
    );
  }
  if (!facts.sameAgent) {
    blockingIssues.push(
      blocking(
        "target_other_agent",
        "The rollback target belongs to a different agent.",
      ),
    );
  }
  if (facts.targetBlocked) {
    blockingIssues.push(
      blocking("target_blocked", "The rollback target is blocked."),
    );
  }
  if (facts.targetHasFailedCriticalEvaluation) {
    blockingIssues.push(
      blocking(
        "target_failed_evaluation",
        "The rollback target has a failed critical evaluation.",
      ),
    );
  }

  if (facts.targetEnvironment === "production") {
    reasons.push("Rollback to production creates audit evidence.");
  }

  return decide("deployment.rollback", blockingIssues, warnings, 0, reasons);
}

export function evaluateApprovalDecision(
  facts: ApprovalDecisionFacts,
): PolicyDecision {
  const blockingIssues: PolicyIssue[] = [];
  const warnings: PolicyIssue[] = [];
  const reasons: string[] = [];

  if (!facts.approvalExists) {
    blockingIssues.push(
      blocking("approval_missing", "The approval request does not exist."),
    );
  }
  if (facts.approvalExists && !facts.isPending) {
    blockingIssues.push(
      blocking(
        "approval_not_pending",
        "The approval request has already been decided.",
      ),
    );
  }
  if (facts.isRejection && !facts.hasReason) {
    blockingIssues.push(
      blocking("reason_required", "A reason is required to reject a request."),
    );
  }

  return decide(
    facts.isRejection ? "approval.reject" : "approval.approve",
    blockingIssues,
    warnings,
    0,
    reasons,
  );
}
