import type {
  AgentStatus,
  ApprovalStatus,
  DeploymentStatus,
  EvaluationStatus,
  IncidentSeverity,
  IncidentStatus,
  PromptVersionStatus,
  RiskLevel,
} from "@/types/domain";

// Visual intent for status badges. Intents map to badge variants in the UI and
// never rely on color alone; labels are always shown alongside.
export type StatusIntent =
  | "default"
  | "success"
  | "warning"
  | "destructive"
  | "muted";

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const RISK_LEVEL_INTENT: Record<RiskLevel, StatusIntent> = {
  low: "muted",
  medium: "warning",
  high: "destructive",
};

export const AGENT_STATUS_LABELS: Record<AgentStatus, string> = {
  draft: "Draft",
  active: "Active",
  paused: "Paused",
  archived: "Archived",
};

export const AGENT_STATUS_INTENT: Record<AgentStatus, StatusIntent> = {
  draft: "muted",
  active: "success",
  paused: "warning",
  archived: "default",
};

export const DEPLOYMENT_STATUS_LABELS: Record<DeploymentStatus, string> = {
  requested: "Requested",
  pending_approval: "Pending approval",
  active: "Active",
  superseded: "Superseded",
  rolled_back: "Rolled back",
  blocked: "Blocked",
};

export const DEPLOYMENT_STATUS_INTENT: Record<DeploymentStatus, StatusIntent> =
  {
    requested: "default",
    pending_approval: "warning",
    active: "success",
    superseded: "muted",
    rolled_back: "warning",
    blocked: "destructive",
  };

export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  expired: "Expired",
  canceled: "Canceled",
};

export const APPROVAL_STATUS_INTENT: Record<ApprovalStatus, StatusIntent> = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
  expired: "muted",
  canceled: "muted",
};

export const INCIDENT_SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const INCIDENT_SEVERITY_INTENT: Record<IncidentSeverity, StatusIntent> =
  {
    low: "muted",
    medium: "warning",
    high: "destructive",
    critical: "destructive",
  };

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  open: "Open",
  acknowledged: "Acknowledged",
  resolved: "Resolved",
};

export const INCIDENT_STATUS_INTENT: Record<IncidentStatus, StatusIntent> = {
  open: "destructive",
  acknowledged: "warning",
  resolved: "success",
};

export const EVALUATION_STATUS_LABELS: Record<EvaluationStatus, string> = {
  queued: "Queued",
  running: "Running",
  completed: "Completed",
  failed: "Failed",
};

export const EVALUATION_STATUS_INTENT: Record<EvaluationStatus, StatusIntent> =
  {
    queued: "muted",
    running: "default",
    completed: "success",
    failed: "destructive",
  };

export const PROMPT_VERSION_STATUS_LABELS: Record<PromptVersionStatus, string> =
  {
    draft: "Draft",
    in_review: "In review",
    approved: "Approved",
    archived: "Archived",
  };

export const PROMPT_VERSION_STATUS_INTENT: Record<
  PromptVersionStatus,
  StatusIntent
> = {
  draft: "muted",
  in_review: "warning",
  approved: "success",
  archived: "default",
};

// Intent for a pass/fail evaluation result.
export function evaluationPassIntent(passed: boolean | null): StatusIntent {
  if (passed === true) return "success";
  if (passed === false) return "destructive";
  return "muted";
}

export function evaluationPassLabel(passed: boolean | null): string {
  if (passed === true) return "Passed";
  if (passed === false) return "Failed";
  return "Pending";
}
