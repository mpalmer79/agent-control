// Demo-safe mock data for the Phase 1 shell.
//
// This data is illustrative only. It uses realistic but fictional names and no
// real customer data. It aligns with the scenario in SEED_DATA_PLAN.md so the
// shell tells the same operational story as the seeded database will in later
// phases. There are no live provider calls and no secrets.

import type {
  AgentSummary,
  ApprovalSummary,
  AuditActivity,
  DeploymentActivity,
  IncidentSummary,
} from "@/types/domain";

export const demoAgents: AgentSummary[] = [
  {
    id: "agent_support",
    name: "Customer Support Agent",
    owner: "Alex Kim",
    environment: "production",
    status: "active",
    riskLevel: "medium",
    errorRate: 0.012,
    evaluationPassRate: 0.96,
    monthlyCost: 1840,
  },
  {
    id: "agent_billing",
    name: "Billing Assistant",
    owner: "Alex Kim",
    environment: "production",
    status: "active",
    riskLevel: "high",
    errorRate: 0.021,
    evaluationPassRate: 0.91,
    monthlyCost: 2120,
  },
  {
    id: "agent_sales",
    name: "Sales Outreach Agent",
    owner: "Morgan Lee",
    environment: "production",
    status: "active",
    riskLevel: "low",
    errorRate: 0.008,
    evaluationPassRate: 0.98,
    monthlyCost: 760,
  },
  {
    id: "agent_kb",
    name: "Knowledge Base Agent",
    owner: "Priya Shah",
    environment: "staging",
    status: "paused",
    riskLevel: "medium",
    errorRate: 0.015,
    evaluationPassRate: 0.93,
    monthlyCost: 410,
  },
  {
    id: "agent_fraud",
    name: "Fraud Triage Agent",
    owner: "Alex Kim",
    environment: "production",
    status: "active",
    riskLevel: "high",
    errorRate: 0.094,
    evaluationPassRate: 0.61,
    monthlyCost: 5380,
  },
  {
    id: "agent_docs",
    name: "Internal Docs Agent",
    owner: "Sam Cole",
    environment: "development",
    status: "draft",
    riskLevel: "low",
    errorRate: 0.004,
    evaluationPassRate: 0.99,
    monthlyCost: 120,
  },
];

export const demoDeployments: DeploymentActivity[] = [
  {
    id: "dep_fraud_v3",
    agentName: "Fraud Triage Agent",
    version: "v3",
    environment: "production",
    status: "active",
    actor: "Alex Kim",
    occurredAt: "2026-05-28T14:10:00Z",
  },
  {
    id: "dep_support_v4",
    agentName: "Customer Support Agent",
    version: "v4",
    environment: "production",
    status: "active",
    actor: "Alex Kim",
    occurredAt: "2026-05-26T09:30:00Z",
  },
  {
    id: "dep_billing_v2",
    agentName: "Billing Assistant",
    version: "v2",
    environment: "production",
    status: "pending_approval",
    actor: "Alex Kim",
    occurredAt: "2026-05-29T16:45:00Z",
  },
  {
    id: "dep_sales_v5",
    agentName: "Sales Outreach Agent",
    version: "v5",
    environment: "production",
    status: "active",
    actor: "Morgan Lee",
    occurredAt: "2026-05-25T11:05:00Z",
  },
  {
    id: "dep_fraud_v2",
    agentName: "Fraud Triage Agent",
    version: "v2",
    environment: "production",
    status: "superseded",
    actor: "Alex Kim",
    occurredAt: "2026-05-20T13:00:00Z",
  },
];

export const demoApprovals: ApprovalSummary[] = [
  {
    id: "appr_billing_v2",
    resourceType: "deployment",
    resourceLabel: "Billing Assistant v2 to production",
    requestedBy: "Alex Kim",
    assignedTo: "Priya Shah",
    status: "pending",
    createdAt: "2026-05-29T16:45:00Z",
  },
  {
    id: "appr_support_v4",
    resourceType: "deployment",
    resourceLabel: "Customer Support Agent v4 to production",
    requestedBy: "Alex Kim",
    assignedTo: "Priya Shah",
    status: "approved",
    createdAt: "2026-05-26T09:10:00Z",
  },
  {
    id: "appr_fraud_v3",
    resourceType: "deployment",
    resourceLabel: "Fraud Triage Agent v3 to production",
    requestedBy: "Alex Kim",
    assignedTo: "Priya Shah",
    status: "rejected",
    createdAt: "2026-05-19T10:00:00Z",
  },
];

export const demoIncidents: IncidentSummary[] = [
  {
    id: "inc_fraud_cost",
    title: "Cost spike and elevated error rate on Fraud Triage Agent",
    agentName: "Fraud Triage Agent",
    severity: "high",
    status: "open",
    createdAt: "2026-05-28T15:00:00Z",
  },
  {
    id: "inc_provider_latency",
    title: "Elevated provider latency on Customer Support Agent",
    agentName: "Customer Support Agent",
    severity: "medium",
    status: "resolved",
    createdAt: "2026-05-21T08:20:00Z",
  },
];

export const demoAuditActivity: AuditActivity[] = [
  {
    id: "audit_1",
    action: "deployment.promoted",
    actor: "Alex Kim",
    resourceType: "deployment",
    resourceLabel: "Fraud Triage Agent v3",
    correlationId: "corr_fraud_v3",
    createdAt: "2026-05-28T14:10:00Z",
  },
  {
    id: "audit_2",
    action: "evaluation.completed",
    actor: "System",
    resourceType: "evaluation_run",
    resourceLabel: "Fraud Triage Agent v3 safety suite",
    correlationId: "corr_fraud_v3",
    createdAt: "2026-05-28T13:40:00Z",
  },
  {
    id: "audit_3",
    action: "incident.created",
    actor: "System",
    resourceType: "incident",
    resourceLabel: "Cost spike on Fraud Triage Agent",
    correlationId: "corr_fraud_v3",
    createdAt: "2026-05-28T15:00:00Z",
  },
  {
    id: "audit_4",
    action: "approval.requested",
    actor: "Alex Kim",
    resourceType: "approval",
    resourceLabel: "Billing Assistant v2 to production",
    correlationId: "corr_billing_v2",
    createdAt: "2026-05-29T16:45:00Z",
  },
];

// Estimated cost per day over a recent window, used for the cost trend preview.
export const demoCostSeries: { date: string; estimatedCost: number }[] = [
  { date: "2026-05-23", estimatedCost: 420 },
  { date: "2026-05-24", estimatedCost: 445 },
  { date: "2026-05-25", estimatedCost: 470 },
  { date: "2026-05-26", estimatedCost: 510 },
  { date: "2026-05-27", estimatedCost: 540 },
  { date: "2026-05-28", estimatedCost: 920 },
  { date: "2026-05-29", estimatedCost: 980 },
];
