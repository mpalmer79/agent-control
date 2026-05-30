// Mock data source built from the seed data.
//
// This produces the same DTO shapes as the database path, derived from the seed
// scenario in src/data/seed. It keeps the foundation API aligned with what the
// seeded database would contain, with no live calls and no secrets.

import {
  seedAgents,
  seedApprovals,
  seedAuditEvents,
  seedCosts,
  seedDeployments,
  seedEvaluations,
  seedIncidents,
  seedPrompts,
  seedUsers,
} from "@/data/seed";
import { toDomainEnum } from "@/server/data-source";
import type {
  AgentListItem,
  ApprovalListItem,
  AuditEventListItem,
  DeploymentListItem,
  EvaluationListItem,
  IncidentListItem,
  MetricsSummary,
  PromptListItem,
} from "@/types/resources";
import type {
  AgentStatus,
  ApprovalStatus,
  DeploymentStatus,
  EnvironmentName,
  EvaluationStatus,
  IncidentSeverity,
  IncidentStatus,
  RiskLevel,
} from "@/types/domain";

function userName(key: string | null | undefined): string {
  if (!key) return "System";
  const user = seedUsers.find((u) => u.key === key);
  return user ? user.fullName : "System";
}

function agentName(key: string): string {
  const agent = seedAgents.find((a) => a.key === key);
  return agent ? agent.name : key;
}

export function mockAgents(): AgentListItem[] {
  return seedAgents.map((agent) => ({
    id: agent.key,
    name: agent.name,
    owner: userName(agent.ownerKey),
    status: toDomainEnum<AgentStatus>(agent.status),
    riskLevel: toDomainEnum<RiskLevel>(agent.riskLevel),
  }));
}

export function mockPrompts(): PromptListItem[] {
  return seedPrompts.map((prompt) => {
    const versions = [...prompt.versions];
    const latest = versions[versions.length - 1];
    return {
      id: prompt.key,
      name: prompt.name,
      versionCount: versions.length,
      latestVersion: latest ? latest.version : null,
    };
  });
}

export function mockDeployments(): DeploymentListItem[] {
  return seedDeployments.map((deployment) => ({
    id: deployment.key,
    agentName: agentName(deployment.agentKey),
    version: deployment.version,
    environment: toDomainEnum<EnvironmentName>(deployment.environment),
    status: toDomainEnum<DeploymentStatus>(deployment.status),
    createdAt: deployment.deployedAt ?? "",
  }));
}

export function mockApprovals(): ApprovalListItem[] {
  return seedApprovals.map((approval) => ({
    id: approval.key,
    resourceLabel: approval.resourceLabel,
    requestedBy: userName(approval.requestedByKey),
    assignedTo: userName(approval.assignedToKey),
    status: toDomainEnum<ApprovalStatus>(approval.status),
    createdAt: approval.createdAt,
  }));
}

export function mockEvaluations(): EvaluationListItem[] {
  return seedEvaluations.map((evaluation, index) => ({
    id: `${evaluation.agentKey}-${evaluation.version}-${index}`,
    agentName: agentName(evaluation.agentKey),
    suiteName: evaluation.suiteName,
    status: toDomainEnum<EvaluationStatus>(evaluation.status),
    score: evaluation.score,
    passed: evaluation.passed,
  }));
}

export function mockIncidents(): IncidentListItem[] {
  return seedIncidents.map((incident) => ({
    id: incident.key,
    title: incident.title,
    agentName: agentName(incident.agentKey),
    severity: toDomainEnum<IncidentSeverity>(incident.severity),
    status: toDomainEnum<IncidentStatus>(incident.status),
    createdAt: incident.createdAt,
  }));
}

export function mockAuditEvents(): AuditEventListItem[] {
  return seedAuditEvents.map((event, index) => ({
    id: `audit-${index}`,
    action: event.action,
    actor: userName(event.actorKey),
    resourceType: event.resourceType,
    resourceId: event.resourceId,
    correlationId: event.correlationId,
    createdAt: event.createdAt,
  }));
}

export function mockMetricsSummary(): MetricsSummary {
  const totalAgents = seedAgents.length;
  const activeDeployments = seedDeployments.filter(
    (d) => d.status === "ACTIVE",
  ).length;
  const pendingApprovals = seedApprovals.filter(
    (a) => a.status === "PENDING",
  ).length;
  const openIncidents = seedIncidents.filter((i) => i.status === "OPEN").length;
  const estimatedMonthlyCost = seedCosts.reduce(
    (sum, record) => sum + record.estimatedCost,
    0,
  );
  const completed = seedEvaluations.filter((e) => e.status === "COMPLETED");
  const passed = completed.filter((e) => e.passed === true).length;
  const evaluationPassRate =
    completed.length > 0 ? passed / completed.length : 0;

  return {
    totalAgents,
    activeDeployments,
    pendingApprovals,
    openIncidents,
    estimatedMonthlyCost,
    evaluationPassRate,
  };
}
