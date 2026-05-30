import type { ApprovalStatus, RiskLevel } from "@/types/domain";

export interface ApprovalRequest {
  resourceType: string;
  resourceId: string;
  requestedBy: string;
  assignedTo?: string;
}

export interface ApprovalDecision {
  approvalId: string;
  status: Extract<ApprovalStatus, "approved" | "rejected">;
  decisionReason: string;
  decidedBy: string;
}

export interface PolicyFinding {
  policyName: string;
  severity: "info" | "warning" | "critical";
  message: string;
}

export interface RiskAssessment {
  effectiveRisk: RiskLevel;
  requiresApproval: boolean;
}
