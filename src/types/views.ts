// UI-facing view models for the Phase 3 control plane modules.
//
// These shapes are produced by the service layer (database path mapped through
// mappers, or seed-derived mock path) and consumed by server components. Raw
// Prisma models are never exposed to client components.

import type {
  AgentStatus,
  ApprovalStatus,
  DeploymentStatus,
  EnvironmentName,
  EvaluationStatus,
  IncidentSeverity,
  IncidentStatus,
  PromptVersionStatus,
  RiskLevel,
} from "./domain";

export type { DataSource } from "./resources";

// ---------------------------------------------------------------------------
// Agents
// ---------------------------------------------------------------------------

export interface AgentListItem {
  id: string;
  name: string;
  status: AgentStatus;
  riskLevel: RiskLevel;
  owner: string;
  environment: EnvironmentName;
  activeModel: string;
  activePromptVersion: string;
  latestDeploymentStatus: DeploymentStatus | null;
  evaluationPassRate: number;
  openIncidents: number;
  estimatedMonthlyCost: number;
  lastActivity: string | null;
}

export interface AgentVersionSummary {
  id: string;
  version: string;
  promptVersion: string | null;
  model: string | null;
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

export interface AgentDeploymentSummary {
  id: string;
  version: string;
  environment: EnvironmentName;
  status: DeploymentStatus;
  deployedBy: string;
  deployedAt: string | null;
}

export interface AgentIncidentSummary {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  createdAt: string;
}

export interface AgentEvaluationSummary {
  id: string;
  suiteName: string;
  status: EvaluationStatus;
  score: number | null;
  passed: boolean | null;
  version: string;
}

export interface AgentAuditSummary {
  id: string;
  action: string;
  actor: string;
  correlationId: string;
  createdAt: string;
}

export interface AgentDetailView {
  id: string;
  name: string;
  description: string | null;
  status: AgentStatus;
  riskLevel: RiskLevel;
  owner: string;
  environment: EnvironmentName;
  activeModel: string;
  activePromptVersion: string;
  evaluationPassRate: number;
  estimatedMonthlyCost: number;
  versions: AgentVersionSummary[];
  deployments: AgentDeploymentSummary[];
  evaluations: AgentEvaluationSummary[];
  incidents: AgentIncidentSummary[];
  auditEvents: AgentAuditSummary[];
  narrative: string;
}

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

export interface PromptListItem {
  id: string;
  name: string;
  currentVersion: string | null;
  status: PromptVersionStatus;
  relatedAgentCount: number;
  lastChanged: string | null;
  createdBy: string;
}

export interface PromptVersionSummary {
  id: string;
  version: string;
  status: PromptVersionStatus;
  changeReason: string | null;
  createdBy: string;
  createdAt: string;
  isCurrent: boolean;
}

export interface PromptDetailView {
  id: string;
  name: string;
  description: string | null;
  currentVersion: string | null;
  status: PromptVersionStatus;
  templatePreview: string;
  variables: string[];
  changeReason: string | null;
  relatedAgents: string[];
  versions: PromptVersionSummary[];
  auditEvents: AgentAuditSummary[];
}

// ---------------------------------------------------------------------------
// Deployments
// ---------------------------------------------------------------------------

export interface DeploymentListItem {
  id: string;
  agentName: string;
  version: string;
  environment: EnvironmentName;
  status: DeploymentStatus;
  deployedBy: string;
  approvedBy: string | null;
  deployedAt: string | null;
  correlationId: string;
  isRollbackCandidate: boolean;
}

export interface DeploymentDetailView {
  id: string;
  agentName: string;
  version: string;
  promptVersion: string | null;
  model: string | null;
  environment: EnvironmentName;
  status: DeploymentStatus;
  deployedBy: string;
  approvedBy: string | null;
  deployedAt: string | null;
  correlationId: string;
  approvalEvidence: ApprovalListItem[];
  evaluationEvidence: AgentEvaluationSummary[];
  auditEvents: AgentAuditSummary[];
  rollbackReadiness: string;
}

// ---------------------------------------------------------------------------
// Governance and approvals
// ---------------------------------------------------------------------------

export interface ApprovalListItem {
  id: string;
  resourceType: string;
  resourceLabel: string;
  requestedBy: string;
  assignedTo: string | null;
  status: ApprovalStatus;
  decisionReason: string | null;
  createdAt: string;
  decidedAt: string | null;
}

export interface ApprovalSummaryView {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  riskDistribution: { riskLevel: RiskLevel; count: number }[];
}

// ---------------------------------------------------------------------------
// Evaluations
// ---------------------------------------------------------------------------

export interface EvaluationListItem {
  id: string;
  agentName: string;
  suiteName: string;
  status: EvaluationStatus;
  score: number | null;
  passed: boolean | null;
  version: string;
  completedAt: string | null;
  blocksDeployment: boolean;
}

export interface EvaluationSummaryView {
  passRate: number;
  total: number;
  passed: number;
  failed: number;
}

// ---------------------------------------------------------------------------
// Incidents
// ---------------------------------------------------------------------------

export interface IncidentListItem {
  id: string;
  title: string;
  agentName: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  description: string | null;
  correlationId: string;
  createdAt: string;
  resolvedAt: string | null;
}

export interface IncidentSummaryView {
  open: number;
  total: number;
  bySeverity: { severity: IncidentSeverity; count: number }[];
}

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------

export interface AuditEventListItem {
  id: string;
  action: string;
  actor: string;
  resourceType: string;
  resourceId: string;
  correlationId: string;
  createdAt: string;
  hasStateSnapshot: boolean;
}

export interface AuditSummaryView {
  total: number;
  recentActions: { action: string; count: number }[];
}

// ---------------------------------------------------------------------------
// Models
// ---------------------------------------------------------------------------

export interface ModelListItem {
  id: string;
  displayName: string;
  provider: string;
  riskLevel: RiskLevel;
  contextWindow: number;
  enabledForProduction: boolean;
}

// ---------------------------------------------------------------------------
// Observability and metrics
// ---------------------------------------------------------------------------

export interface MetricsSummaryView {
  totalAgents: number;
  activeAgents: number;
  activeDeployments: number;
  pendingApprovals: number;
  failedEvaluations: number;
  openIncidents: number;
  estimatedMonthlyCost: number;
  evaluationPassRate: number;
}

export interface AgentHealthRow {
  id: string;
  name: string;
  status: AgentStatus;
  riskLevel: RiskLevel;
  errorRate: number;
  evaluationPassRate: number;
  estimatedMonthlyCost: number;
}

export interface CostSummaryView {
  estimatedTotal: number;
  recordCount: number;
  byAgent: { agentName: string; estimatedCost: number }[];
  series: { date: string; estimatedCost: number }[];
}

export interface ProviderHealthRow {
  provider: string;
  status: "healthy" | "degraded";
  errorRate: number;
  p95LatencyMs: number;
}

export interface ObservabilityView {
  metrics: MetricsSummaryView;
  agentHealth: AgentHealthRow[];
  providerHealth: ProviderHealthRow[];
  cost: CostSummaryView;
  openIncidents: IncidentListItem[];
}
