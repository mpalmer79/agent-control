// Seed-derived view builders for the Phase 3 control plane modules.
//
// These compute the rich UI view models from the seed scenario in
// src/data/seed. They are the demo-safe path used when the database is not
// configured, and they define the demo computations (narratives, derived rates)
// that both data paths present consistently. No live calls and no secrets.

import {
  seedAgents,
  seedApprovals,
  seedAuditEvents,
  seedCosts,
  seedDeployments,
  seedEvaluations,
  seedIncidents,
  seedModels,
  seedPrompts,
  seedUsers,
} from "@/data/seed";
import { toDomainEnum } from "@/server/data-source";
import type {
  AgentDetailView,
  AgentHealthRow,
  AgentListItem,
  ApprovalListItem,
  ApprovalSummaryView,
  AuditEventListItem,
  AuditSummaryView,
  CostSummaryView,
  DeploymentDetailView,
  DeploymentListItem,
  EvaluationListItem,
  EvaluationSummaryView,
  IncidentListItem,
  IncidentSummaryView,
  MetricsSummaryView,
  ModelListItem,
  ObservabilityView,
  PromptDetailView,
  PromptListItem,
  ProviderHealthRow,
} from "@/types/views";
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
} from "@/types/domain";

// Per-agent demo telemetry. Fictional but consistent with the incident and cost
// story (Fraud Triage Agent is the problem child).
const AGENT_TELEMETRY: Record<
  string,
  { environment: EnvironmentName; errorRate: number; lastActivity: string }
> = {
  support: {
    environment: "production",
    errorRate: 0.012,
    lastActivity: "2026-05-29T18:00:00Z",
  },
  billing: {
    environment: "production",
    errorRate: 0.021,
    lastActivity: "2026-05-29T16:45:00Z",
  },
  fraud: {
    environment: "production",
    errorRate: 0.094,
    lastActivity: "2026-05-28T18:00:00Z",
  },
};

function userName(key: string | null | undefined): string {
  if (!key) return "System";
  return seedUsers.find((u) => u.key === key)?.fullName ?? "System";
}

function agentByKey(key: string) {
  return seedAgents.find((a) => a.key === key);
}

function agentName(key: string): string {
  return agentByKey(key)?.name ?? key;
}

function modelDisplayName(key: string): string {
  return seedModels.find((m) => m.key === key)?.displayName ?? key;
}

function telemetry(key: string) {
  return (
    AGENT_TELEMETRY[key] ?? {
      environment: "development" as EnvironmentName,
      errorRate: 0.01,
      lastActivity: "2026-05-20T12:00:00Z",
    }
  );
}

function agentEvaluations(key: string) {
  return seedEvaluations.filter((e) => e.agentKey === key);
}

function agentPassRate(key: string): number {
  const completed = agentEvaluations(key).filter(
    (e) => e.status === "COMPLETED",
  );
  if (completed.length === 0) return 1;
  const passed = completed.filter((e) => e.passed === true).length;
  return passed / completed.length;
}

function agentMonthlyCost(key: string): number {
  return seedCosts
    .filter((c) => c.agentKey === key)
    .reduce((sum, c) => sum + c.estimatedCost, 0);
}

function agentOpenIncidents(key: string): number {
  return seedIncidents.filter((i) => i.agentKey === key && i.status === "OPEN")
    .length;
}

function latestDeployment(key: string) {
  const deployments = seedDeployments
    .filter((d) => d.agentKey === key)
    .slice()
    .sort((a, b) => (a.deployedAt ?? "").localeCompare(b.deployedAt ?? ""));
  return deployments[deployments.length - 1];
}

export function buildAgentList(): AgentListItem[] {
  return seedAgents.map((agent) => {
    const tele = telemetry(agent.key);
    const latest = latestDeployment(agent.key);
    return {
      id: agent.key,
      name: agent.name,
      status: toDomainEnum<AgentStatus>(agent.status),
      riskLevel: toDomainEnum<RiskLevel>(agent.riskLevel),
      owner: userName(agent.ownerKey),
      environment: tele.environment,
      activeModel: modelDisplayName(agent.modelKey),
      activePromptVersion: agent.activeVersion,
      latestDeploymentStatus: latest
        ? toDomainEnum<DeploymentStatus>(latest.status)
        : null,
      evaluationPassRate: agentPassRate(agent.key),
      openIncidents: agentOpenIncidents(agent.key),
      estimatedMonthlyCost: agentMonthlyCost(agent.key),
      lastActivity: tele.lastActivity,
    };
  });
}

export function buildAgentDetail(id: string): AgentDetailView | null {
  const agent = agentByKey(id);
  if (!agent) return null;

  const versions = agent.versions.map((version, index) => ({
    id: `${agent.key}-${version}`,
    version,
    promptVersion: version,
    model: modelDisplayName(agent.modelKey),
    createdBy: userName(agent.ownerKey),
    createdAt: `2026-05-${10 + index}T12:00:00Z`,
    isActive: version === agent.activeVersion,
  }));

  const deployments = seedDeployments
    .filter((d) => d.agentKey === agent.key)
    .map((d) => ({
      id: d.key,
      version: d.version,
      environment: toDomainEnum<EnvironmentName>(d.environment),
      status: toDomainEnum<DeploymentStatus>(d.status),
      deployedBy: userName(d.deployedByKey),
      deployedAt: d.deployedAt ?? null,
    }));

  const evaluations = agentEvaluations(agent.key).map((e, index) => ({
    id: `${agent.key}-${e.version}-${index}`,
    suiteName: e.suiteName,
    status: toDomainEnum<EvaluationStatus>(e.status),
    score: e.score,
    passed: e.passed,
    version: e.version,
  }));

  const incidents = seedIncidents
    .filter((i) => i.agentKey === agent.key)
    .map((i) => ({
      id: i.key,
      title: i.title,
      severity: toDomainEnum<IncidentSeverity>(i.severity),
      status: toDomainEnum<IncidentStatus>(i.status),
      createdAt: i.createdAt,
    }));

  const correlationIds = new Set(
    seedDeployments
      .filter((d) => d.agentKey === agent.key)
      .map((d) => d.correlationId),
  );
  const auditEvents = seedAuditEvents
    .filter((e) => correlationIds.has(e.correlationId))
    .map((e, index) => ({
      id: `audit-${agent.key}-${index}`,
      action: e.action,
      actor: userName(e.actorKey),
      correlationId: e.correlationId,
      createdAt: e.createdAt,
    }));

  const passRate = agentPassRate(agent.key);
  const openIncidents = agentOpenIncidents(agent.key);
  const narrative =
    openIncidents > 0 || passRate < 0.8
      ? `${agent.name} needs attention. The active version ${agent.activeVersion} has a low evaluation pass rate and an open incident. A prior stable deployment is available as a rollback target.`
      : `${agent.name} is healthy. Evaluations are passing and there are no open incidents on the active version ${agent.activeVersion}.`;

  return {
    id: agent.key,
    name: agent.name,
    description: agent.description,
    status: toDomainEnum<AgentStatus>(agent.status),
    riskLevel: toDomainEnum<RiskLevel>(agent.riskLevel),
    owner: userName(agent.ownerKey),
    environment: telemetry(agent.key).environment,
    activeModel: modelDisplayName(agent.modelKey),
    activePromptVersion: agent.activeVersion,
    evaluationPassRate: passRate,
    estimatedMonthlyCost: agentMonthlyCost(agent.key),
    versions,
    deployments,
    evaluations,
    incidents,
    auditEvents,
    narrative,
  };
}

export function buildPromptList(): PromptListItem[] {
  return seedPrompts.map((prompt) => {
    const versions = [...prompt.versions];
    const latest = versions[versions.length - 1];
    const relatedAgents = seedAgents.filter((a) => a.promptKey === prompt.key);
    const isActiveVersion = relatedAgents.some(
      (a) => a.activeVersion === latest?.version,
    );
    return {
      id: prompt.key,
      name: prompt.name,
      currentVersion: latest ? latest.version : null,
      status: (isActiveVersion ? "approved" : "draft") as PromptVersionStatus,
      relatedAgentCount: relatedAgents.length,
      lastChanged: `2026-05-${10 + versions.length}T12:00:00Z`,
      createdBy: userName(prompt.createdByKey),
    };
  });
}

export function buildPromptDetail(id: string): PromptDetailView | null {
  const prompt = seedPrompts.find((p) => p.key === id);
  if (!prompt) return null;
  const relatedAgents = seedAgents.filter((a) => a.promptKey === prompt.key);
  const activeVersions = new Set<string>(
    relatedAgents.map((a) => a.activeVersion),
  );
  const versions = prompt.versions.map((v, index) => ({
    id: `${prompt.key}-${v.version}`,
    version: v.version,
    status: (activeVersions.has(v.version)
      ? "approved"
      : "draft") as PromptVersionStatus,
    changeReason: v.changeReason,
    createdBy: userName(prompt.createdByKey),
    createdAt: `2026-05-${10 + index}T12:00:00Z`,
    isCurrent: index === prompt.versions.length - 1,
  }));
  const latest = prompt.versions[prompt.versions.length - 1];

  const auditEvents = seedAuditEvents
    .filter((e) => {
      const resourceType: string = e.resourceType;
      return resourceType === "prompt" || resourceType === "approval";
    })
    .filter((e) => relatedAgents.some((a) => e.resourceId.includes(a.key)))
    .map((e, index) => ({
      id: `prompt-audit-${prompt.key}-${index}`,
      action: e.action,
      actor: userName(e.actorKey),
      correlationId: e.correlationId,
      createdAt: e.createdAt,
    }));

  return {
    id: prompt.key,
    name: prompt.name,
    description: prompt.description,
    currentVersion: latest ? latest.version : null,
    status: (activeVersions.has(latest?.version ?? "")
      ? "approved"
      : "draft") as PromptVersionStatus,
    templatePreview: `Seed template for ${prompt.name} ${latest?.version ?? ""}.`,
    variables: ["context"],
    changeReason: latest?.changeReason ?? null,
    relatedAgents: relatedAgents.map((a) => a.name),
    versions,
    auditEvents,
  };
}

const ROLLBACK_CANDIDATE_STATUSES = new Set(["SUPERSEDED"]);

export function buildDeploymentList(): DeploymentListItem[] {
  return seedDeployments.map((d) => ({
    id: d.key,
    agentName: agentName(d.agentKey),
    version: d.version,
    environment: toDomainEnum<EnvironmentName>(d.environment),
    status: toDomainEnum<DeploymentStatus>(d.status),
    deployedBy: userName(d.deployedByKey),
    approvedBy: d.approvedByKey ? userName(d.approvedByKey) : null,
    deployedAt: d.deployedAt ?? null,
    correlationId: d.correlationId,
    isRollbackCandidate: ROLLBACK_CANDIDATE_STATUSES.has(d.status),
  }));
}

export function buildDeploymentDetail(id: string): DeploymentDetailView | null {
  const d = seedDeployments.find((x) => x.key === id);
  if (!d) return null;
  const agent = agentByKey(d.agentKey);

  const approvalEvidence = seedApprovals
    .filter((a) => a.correlationId === d.correlationId)
    .map((a) => ({
      id: a.key,
      resourceType: a.resourceType,
      resourceLabel: a.resourceLabel,
      requestedBy: userName(a.requestedByKey),
      assignedTo: userName(a.assignedToKey),
      status: toDomainEnum<ApprovalStatus>(a.status),
      decisionReason: a.decisionReason,
      createdAt: a.createdAt,
      decidedAt: a.status === "PENDING" ? null : a.createdAt,
    }));

  const evaluationEvidence = seedEvaluations
    .filter((e) => e.agentKey === d.agentKey && e.version === d.version)
    .map((e, index) => ({
      id: `${d.key}-eval-${index}`,
      suiteName: e.suiteName,
      status: toDomainEnum<EvaluationStatus>(e.status),
      score: e.score,
      passed: e.passed,
      version: e.version,
    }));

  const auditEvents = seedAuditEvents
    .filter((e) => e.correlationId === d.correlationId)
    .map((e, index) => ({
      id: `${d.key}-audit-${index}`,
      action: e.action,
      actor: userName(e.actorKey),
      correlationId: e.correlationId,
      createdAt: e.createdAt,
    }));

  const hasFailedEval = evaluationEvidence.some((e) => e.passed === false);
  const rollbackReadiness = hasFailedEval
    ? "This deployment has a failed evaluation. A prior stable deployment is available as a rollback target. Rollback execution arrives in a later phase."
    : "This deployment passed its evaluations. Rollback execution arrives in a later phase.";

  return {
    id: d.key,
    agentName: agentName(d.agentKey),
    version: d.version,
    promptVersion: d.version,
    model: agent ? modelDisplayName(agent.modelKey) : null,
    environment: toDomainEnum<EnvironmentName>(d.environment),
    status: toDomainEnum<DeploymentStatus>(d.status),
    deployedBy: userName(d.deployedByKey),
    approvedBy: d.approvedByKey ? userName(d.approvedByKey) : null,
    deployedAt: d.deployedAt ?? null,
    correlationId: d.correlationId,
    approvalEvidence,
    evaluationEvidence,
    auditEvents,
    rollbackReadiness,
  };
}

export function buildApprovalList(): ApprovalListItem[] {
  return seedApprovals.map((a) => ({
    id: a.key,
    resourceType: a.resourceType,
    resourceLabel: a.resourceLabel,
    requestedBy: userName(a.requestedByKey),
    assignedTo: userName(a.assignedToKey),
    status: toDomainEnum<ApprovalStatus>(a.status),
    decisionReason: a.decisionReason,
    createdAt: a.createdAt,
    decidedAt: a.status === "PENDING" ? null : a.createdAt,
  }));
}

export function buildApprovalSummary(): ApprovalSummaryView {
  const list = seedApprovals;
  const riskCounts: Record<RiskLevel, number> = { low: 0, medium: 0, high: 0 };
  for (const approval of list) {
    const agent = seedAgents.find((a) => approval.resourceId.includes(a.key));
    const risk = agent
      ? toDomainEnum<RiskLevel>(agent.riskLevel)
      : ("medium" as RiskLevel);
    riskCounts[risk] += 1;
  }
  return {
    total: list.length,
    pending: list.filter((a) => a.status === "PENDING").length,
    approved: list.filter((a) => a.status === "APPROVED").length,
    rejected: list.filter((a) => a.status === "REJECTED").length,
    riskDistribution: (["low", "medium", "high"] as RiskLevel[]).map(
      (riskLevel) => ({ riskLevel, count: riskCounts[riskLevel] }),
    ),
  };
}

function evaluationBlocksDeployment(passed: boolean | null): boolean {
  return passed === false;
}

export function buildEvaluationList(): EvaluationListItem[] {
  return seedEvaluations.map((e, index) => ({
    id: `${e.agentKey}-${e.version}-${index}`,
    agentName: agentName(e.agentKey),
    suiteName: e.suiteName,
    status: toDomainEnum<EvaluationStatus>(e.status),
    score: e.score,
    passed: e.passed,
    version: e.version,
    completedAt: "2026-05-28T13:40:00Z",
    blocksDeployment: evaluationBlocksDeployment(e.passed),
  }));
}

export function buildEvaluationSummary(): EvaluationSummaryView {
  const completed = seedEvaluations.filter((e) => e.status === "COMPLETED");
  const passed = completed.filter((e) => e.passed === true).length;
  const failed = completed.filter((e) => e.passed === false).length;
  return {
    passRate: completed.length > 0 ? passed / completed.length : 0,
    total: completed.length,
    passed,
    failed,
  };
}

export function buildIncidentList(): IncidentListItem[] {
  return seedIncidents.map((i) => ({
    id: i.key,
    title: i.title,
    agentName: agentName(i.agentKey),
    severity: toDomainEnum<IncidentSeverity>(i.severity),
    status: toDomainEnum<IncidentStatus>(i.status),
    description: i.description,
    correlationId: i.correlationId,
    createdAt: i.createdAt,
    resolvedAt: i.resolvedAt ?? null,
  }));
}

export function buildIncidentSummary(): IncidentSummaryView {
  const severities: IncidentSeverity[] = ["low", "medium", "high", "critical"];
  return {
    open: seedIncidents.filter((i) => i.status === "OPEN").length,
    total: seedIncidents.length,
    bySeverity: severities.map((severity) => ({
      severity,
      count: seedIncidents.filter(
        (i) => toDomainEnum<IncidentSeverity>(i.severity) === severity,
      ).length,
    })),
  };
}

export function buildAuditList(): AuditEventListItem[] {
  return seedAuditEvents.map((e, index) => ({
    id: `audit-${index}`,
    action: e.action,
    actor: userName(e.actorKey),
    resourceType: e.resourceType,
    resourceId: e.resourceId,
    correlationId: e.correlationId,
    createdAt: e.createdAt,
    hasStateSnapshot: false,
  }));
}

export function buildAuditSummary(): AuditSummaryView {
  const counts = new Map<string, number>();
  for (const event of seedAuditEvents) {
    counts.set(event.action, (counts.get(event.action) ?? 0) + 1);
  }
  return {
    total: seedAuditEvents.length,
    recentActions: [...counts.entries()].map(([action, count]) => ({
      action,
      count,
    })),
  };
}

export function buildAuditForResource(
  resourceId: string,
): AuditEventListItem[] {
  return buildAuditList().filter((e) => e.resourceId === resourceId);
}

export function buildModelList(): ModelListItem[] {
  return seedModels.map((m) => ({
    id: m.key,
    displayName: m.displayName,
    provider: m.providerKey,
    riskLevel: toDomainEnum<RiskLevel>(m.riskLevel),
    contextWindow: m.contextWindow,
    enabledForProduction: m.enabledForProduction,
  }));
}

export function buildMetricsSummary(): MetricsSummaryView {
  const completed = seedEvaluations.filter((e) => e.status === "COMPLETED");
  const passed = completed.filter((e) => e.passed === true).length;
  return {
    totalAgents: seedAgents.length,
    activeAgents: seedAgents.filter((a) => a.status === "ACTIVE").length,
    activeDeployments: seedDeployments.filter((d) => d.status === "ACTIVE")
      .length,
    pendingApprovals: seedApprovals.filter((a) => a.status === "PENDING")
      .length,
    failedEvaluations: completed.filter((e) => e.passed === false).length,
    openIncidents: seedIncidents.filter((i) => i.status === "OPEN").length,
    estimatedMonthlyCost: seedCosts.reduce(
      (sum, c) => sum + c.estimatedCost,
      0,
    ),
    evaluationPassRate: completed.length > 0 ? passed / completed.length : 0,
  };
}

export function buildAgentHealth(): AgentHealthRow[] {
  return seedAgents.map((agent) => ({
    id: agent.key,
    name: agent.name,
    status: toDomainEnum<AgentStatus>(agent.status),
    riskLevel: toDomainEnum<RiskLevel>(agent.riskLevel),
    errorRate: telemetry(agent.key).errorRate,
    evaluationPassRate: agentPassRate(agent.key),
    estimatedMonthlyCost: agentMonthlyCost(agent.key),
  }));
}

export function buildCostSummary(): CostSummaryView {
  const byAgentMap = new Map<string, number>();
  for (const cost of seedCosts) {
    const name = agentName(cost.agentKey);
    byAgentMap.set(name, (byAgentMap.get(name) ?? 0) + cost.estimatedCost);
  }
  return {
    estimatedTotal: seedCosts.reduce((sum, c) => sum + c.estimatedCost, 0),
    recordCount: seedCosts.length,
    byAgent: [...byAgentMap.entries()].map(([agentName, estimatedCost]) => ({
      agentName,
      estimatedCost,
    })),
    series: [
      { date: "2026-05-23", estimatedCost: 420 },
      { date: "2026-05-24", estimatedCost: 445 },
      { date: "2026-05-25", estimatedCost: 470 },
      { date: "2026-05-26", estimatedCost: 510 },
      { date: "2026-05-27", estimatedCost: 540 },
      { date: "2026-05-28", estimatedCost: 920 },
      { date: "2026-05-29", estimatedCost: 980 },
    ],
  };
}

function buildProviderHealth(): ProviderHealthRow[] {
  return [
    {
      provider: "anthropic",
      status: "healthy",
      errorRate: 0.004,
      p95LatencyMs: 820,
    },
    {
      provider: "openai",
      status: "degraded",
      errorRate: 0.071,
      p95LatencyMs: 1980,
    },
    {
      provider: "google",
      status: "healthy",
      errorRate: 0.006,
      p95LatencyMs: 910,
    },
  ];
}

export function buildObservability(): ObservabilityView {
  return {
    metrics: buildMetricsSummary(),
    agentHealth: buildAgentHealth(),
    providerHealth: buildProviderHealth(),
    cost: buildCostSummary(),
    openIncidents: buildIncidentList().filter((i) => i.status === "open"),
  };
}
