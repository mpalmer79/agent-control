// API resource DTOs.
//
// These are the shapes returned by the read-only foundation API endpoints. They
// map cleanly to schema fields (no computed runtime metrics yet). Both the
// database path and the mock path produce these shapes so the API contract is
// stable across data sources. Runtime metrics arrive in Phase 5.

import type {
  AgentStatus,
  ApprovalStatus,
  DeploymentStatus,
  EnvironmentName,
  EvaluationStatus,
  IncidentSeverity,
  IncidentStatus,
  RiskLevel,
} from "./domain";

export type DataSource = "database" | "mock";

export interface AgentListItem {
  id: string;
  name: string;
  owner: string;
  status: AgentStatus;
  riskLevel: RiskLevel;
}

export interface PromptListItem {
  id: string;
  name: string;
  versionCount: number;
  latestVersion: string | null;
}

export interface DeploymentListItem {
  id: string;
  agentName: string;
  version: string;
  environment: EnvironmentName;
  status: DeploymentStatus;
  createdAt: string;
}

export interface ApprovalListItem {
  id: string;
  resourceLabel: string;
  requestedBy: string;
  assignedTo: string | null;
  status: ApprovalStatus;
  createdAt: string;
}

export interface EvaluationListItem {
  id: string;
  agentName: string;
  suiteName: string;
  status: EvaluationStatus;
  score: number | null;
  passed: boolean | null;
}

export interface IncidentListItem {
  id: string;
  title: string;
  agentName: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  createdAt: string;
}

export interface AuditEventListItem {
  id: string;
  action: string;
  actor: string;
  resourceType: string;
  resourceId: string;
  correlationId: string;
  createdAt: string;
}

export interface MetricsSummary {
  totalAgents: number;
  activeDeployments: number;
  pendingApprovals: number;
  openIncidents: number;
  estimatedMonthlyCost: number;
  evaluationPassRate: number;
}
