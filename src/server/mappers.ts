// Mappers from Prisma rows to API resource DTOs.
//
// These accept the relation-included rows returned by the repositories and
// produce the stable DTO shapes. Structural typing keeps the inputs decoupled
// from the full Prisma types.

import { toDomainEnum } from "@/server/data-source";
import type {
  AgentListItem,
  ApprovalListItem,
  AuditEventListItem,
  DeploymentListItem,
  EvaluationListItem,
  IncidentListItem,
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

function iso(value: Date | null | undefined): string {
  return value ? value.toISOString() : "";
}

export function mapAgent(row: {
  id: string;
  name: string;
  status: string;
  riskLevel: string;
  owner?: { fullName: string } | null;
}): AgentListItem {
  return {
    id: row.id,
    name: row.name,
    owner: row.owner?.fullName ?? "Unassigned",
    status: toDomainEnum<AgentStatus>(row.status),
    riskLevel: toDomainEnum<RiskLevel>(row.riskLevel),
  };
}

export function mapPrompt(row: {
  id: string;
  name: string;
  versions: { version: string }[];
}): PromptListItem {
  const latest = row.versions[0];
  return {
    id: row.id,
    name: row.name,
    versionCount: row.versions.length,
    latestVersion: latest ? latest.version : null,
  };
}

export function mapDeployment(row: {
  id: string;
  environment: string;
  status: string;
  createdAt: Date;
  deployedAt?: Date | null;
  agent?: { name: string } | null;
  agentVersion?: { version: string } | null;
}): DeploymentListItem {
  return {
    id: row.id,
    agentName: row.agent?.name ?? "Unknown agent",
    version: row.agentVersion?.version ?? "",
    environment: toDomainEnum<EnvironmentName>(row.environment),
    status: toDomainEnum<DeploymentStatus>(row.status),
    createdAt: iso(row.deployedAt ?? row.createdAt),
  };
}

export function mapApproval(row: {
  id: string;
  resourceType: string;
  resourceId: string;
  status: string;
  createdAt: Date;
  requester?: { fullName: string } | null;
  assignee?: { fullName: string } | null;
}): ApprovalListItem {
  return {
    id: row.id,
    resourceLabel: `${row.resourceType} ${row.resourceId}`,
    requestedBy: row.requester?.fullName ?? "Unknown",
    assignedTo: row.assignee?.fullName ?? null,
    status: toDomainEnum<ApprovalStatus>(row.status),
    createdAt: iso(row.createdAt),
  };
}

export function mapEvaluation(row: {
  id: string;
  suiteName: string;
  status: string;
  score: number | null;
  passed: boolean | null;
  agentVersion?: { agent?: { name: string } | null } | null;
}): EvaluationListItem {
  return {
    id: row.id,
    agentName: row.agentVersion?.agent?.name ?? "Unknown agent",
    suiteName: row.suiteName,
    status: toDomainEnum<EvaluationStatus>(row.status),
    score: row.score,
    passed: row.passed,
  };
}

export function mapIncident(row: {
  id: string;
  title: string;
  severity: string;
  status: string;
  createdAt: Date;
  agent?: { name: string } | null;
}): IncidentListItem {
  return {
    id: row.id,
    title: row.title,
    agentName: row.agent?.name ?? "Platform",
    severity: toDomainEnum<IncidentSeverity>(row.severity),
    status: toDomainEnum<IncidentStatus>(row.status),
    createdAt: iso(row.createdAt),
  };
}

export function mapAuditEvent(row: {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string;
  correlationId: string;
  createdAt: Date;
  actor?: { fullName: string } | null;
}): AuditEventListItem {
  return {
    id: row.id,
    action: row.action,
    actor: row.actor?.fullName ?? "System",
    resourceType: row.resourceType,
    resourceId: row.resourceId,
    correlationId: row.correlationId,
    createdAt: iso(row.createdAt),
  };
}
