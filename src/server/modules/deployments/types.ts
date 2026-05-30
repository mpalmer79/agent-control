import type { DeploymentStatus, EnvironmentName } from "@/types/domain";

export interface DeploymentRequest {
  agentId: string;
  agentVersionId: string;
  environment: EnvironmentName;
}

export interface DeploymentRecord extends DeploymentRequest {
  id: string;
  status: DeploymentStatus;
  deployedBy: string;
  approvedBy?: string;
  correlationId: string;
  createdAt: string;
}

// The quality gates a production deployment must satisfy. Evaluated in Phase 3
// and Phase 4. Documented here to make the contract explicit.
export interface DeploymentGateResult {
  name:
    | "agent_version_approved"
    | "prompt_approved"
    | "model_enabled_for_production"
    | "evaluations_passing"
    | "no_critical_policy_violations"
    | "human_approval";
  passed: boolean;
}
