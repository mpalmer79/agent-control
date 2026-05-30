// Shared workflow result types for governed actions.
//
// Workflow services return one of these typed results so API routes and UI
// components can render success, blocked, pending-approval, failed, and
// simulated states consistently. Simulated results are used in demo mode when
// no database is configured; they never claim persisted evidence IDs.

export type WorkflowStatus =
  | "success"
  | "blocked"
  | "pending_approval"
  | "failed"
  | "simulated";

export type WorkflowAction =
  | "approval.approve"
  | "approval.reject"
  | "deployment.request_promotion"
  | "deployment.promote"
  | "deployment.rollback";

export interface PolicyIssue {
  code: string;
  message: string;
  severity: "warning" | "blocking";
}

export interface PolicyDecision {
  allowed: boolean;
  action: WorkflowAction;
  requiredApprovals: number;
  blockingIssues: PolicyIssue[];
  warnings: PolicyIssue[];
  reasons: string[];
}

export interface AffectedResource {
  type: string;
  id: string;
  label: string;
}

export interface WorkflowActionResult {
  action: WorkflowAction;
  status: WorkflowStatus;
  message: string;
  correlationId: string;
  policyDecision: PolicyDecision;
  auditEventId?: string;
  outboxEventId?: string;
  affectedResource?: AffectedResource;
  simulated: boolean;
}

export type ApprovalDecisionResult = WorkflowActionResult;
export type DeploymentPromotionResult = WorkflowActionResult;
export type DeploymentRollbackResult = WorkflowActionResult;
