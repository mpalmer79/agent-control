import type { AgentStatus, RiskLevel } from "@/types/domain";

export interface AgentInput {
  name: string;
  description?: string;
  ownerUserId: string;
  riskLevel: RiskLevel;
}

export interface AgentRecord extends AgentInput {
  id: string;
  organizationId: string;
  status: AgentStatus;
  createdAt: string;
  updatedAt: string;
}
