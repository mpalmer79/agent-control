// Observability, trace, cost, and incident evidence view models for Phase 5.
//
// These are produced by the seed-derived view builders (demo path) and consumed
// by server components. They extend, rather than replace, the Phase 3
// ObservabilityView in src/types/views.ts.

import type { IncidentSeverity, IncidentStatus } from "./domain";

// ---------------------------------------------------------------------------
// Operational overview and health
// ---------------------------------------------------------------------------

export interface OperationalHealth {
  score: number;
  label: "healthy" | "degraded" | "at_risk";
  openIncidents: number;
  failedEvaluations: number;
  budgetWarning: boolean;
  pendingOutbox: number;
}

export interface DeploymentHealthSummary {
  active: number;
  pendingApproval: number;
  blocked: number;
  rolledBack: number;
  recentPromotions: number;
  recentRollbacks: number;
}

export interface GovernanceMetrics {
  pendingApprovals: number;
  approved: number;
  rejected: number;
}

export interface OperationalOverview {
  health: OperationalHealth;
  deployments: DeploymentHealthSummary;
  governance: GovernanceMetrics;
  topRiskAgents: { id: string; name: string; reason: string }[];
}

// ---------------------------------------------------------------------------
// Cost
// ---------------------------------------------------------------------------

export interface CostBreakdownRow {
  label: string;
  estimatedCost: number;
}

export type BudgetSignalLevel = "ok" | "warning" | "critical";

export interface BudgetSignal {
  scope: string;
  estimatedCost: number;
  threshold: number;
  level: BudgetSignalLevel;
}

export interface CostDetailView {
  estimatedDaily: number;
  estimatedMonthly: number;
  byAgent: CostBreakdownRow[];
  byProvider: CostBreakdownRow[];
  byEnvironment: CostBreakdownRow[];
  trend: { date: string; estimatedCost: number }[];
  budgetSignals: BudgetSignal[];
}

// ---------------------------------------------------------------------------
// Evaluations
// ---------------------------------------------------------------------------

export type EvaluationCategory =
  | "functional"
  | "safety"
  | "regression"
  | "cost"
  | "latency"
  | "format";

export interface EvaluationCategoryBreakdown {
  category: EvaluationCategory;
  passed: number;
  failed: number;
  passRate: number;
}

export interface EvaluationTrendPoint {
  date: string;
  passRate: number;
}

export interface EvaluationTrendsView {
  passRate: number;
  trend: EvaluationTrendPoint[];
  categories: EvaluationCategoryBreakdown[];
}

// ---------------------------------------------------------------------------
// Outbox
// ---------------------------------------------------------------------------

export type OutboxStatus = "pending" | "published" | "failed";

export interface OutboxEventRow {
  id: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  status: OutboxStatus;
  correlationId: string;
  occurredAt: string;
  publishedAt: string | null;
}

export interface OutboxSummaryView {
  pending: number;
  published: number;
  failed: number;
  recent: OutboxEventRow[];
}

// ---------------------------------------------------------------------------
// Traces
// ---------------------------------------------------------------------------

export type TraceEntryKind =
  | "audit"
  | "outbox"
  | "incident"
  | "cost"
  | "deployment"
  | "approval";

export interface TraceEntry {
  id: string;
  kind: TraceEntryKind;
  title: string;
  detail: string;
  timestamp: string;
}

export interface TraceDetailView {
  correlationId: string;
  summary: string;
  entries: TraceEntry[];
  auditCount: number;
  outboxCount: number;
  incidentCount: number;
}

export interface TraceListItem {
  correlationId: string;
  label: string;
  entryCount: number;
  latest: string;
}

// ---------------------------------------------------------------------------
// Incident evidence
// ---------------------------------------------------------------------------

export type IncidentSignal =
  | "cost_spike"
  | "error_rate"
  | "evaluation_failure"
  | "outbox_backlog"
  | "provider_outage";

export interface IncidentDetailView {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  agentName: string | null;
  description: string | null;
  correlationId: string;
  createdAt: string;
  resolvedAt: string | null;
  signal: IncidentSignal;
  relatedMetrics: { label: string; value: string }[];
  auditEvidence: TraceEntry[];
  outboxEvidence: TraceEntry[];
  evaluationEvidence: {
    suiteName: string;
    score: number | null;
    passed: boolean | null;
  }[];
  narrative: string;
  recommendedAction: string;
}

export interface IncidentCandidate {
  signal: IncidentSignal;
  severity: IncidentSeverity;
  title: string;
  agentKey: string | null;
  correlationId: string;
  reason: string;
}
