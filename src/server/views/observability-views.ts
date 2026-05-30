// Seed-derived view builders for the Phase 5 operational evidence layer.
//
// These compute the operational overview, cost breakdowns, evaluation trends,
// outbox summary, correlation traces, and incident detail from the seed
// scenario in src/data/seed. They are the demo-safe path used when the database
// is not configured and define the demo computations both data paths present.
// No live calls and no secrets.

import {
  seedAgents,
  seedApprovals,
  seedAuditEvents,
  seedCosts,
  seedDeployments,
  seedEvaluations,
  seedIncidents,
  seedUsers,
} from "@/data/seed";
import { toDomainEnum } from "@/server/data-source";
import {
  dedupeCandidates,
  evaluateCostSpike,
  evaluateErrorRate,
  evaluateEvaluationFailure,
  evaluateOutboxBacklog,
} from "@/server/modules/incidents/rules";
import type { IncidentSeverity, IncidentStatus } from "@/types/domain";
import type {
  BudgetSignal,
  CostDetailView,
  EvaluationCategory,
  EvaluationCategoryBreakdown,
  EvaluationTrendsView,
  IncidentCandidate,
  IncidentDetailView,
  IncidentSignal,
  OperationalOverview,
  OutboxEventRow,
  OutboxSummaryView,
  TraceDetailView,
  TraceEntry,
  TraceListItem,
} from "@/types/observability";

// Per-agent demo telemetry consistent with the incident and cost story.
const AGENT_ERROR_RATE: Record<string, number> = {
  support: 0.012,
  billing: 0.021,
  fraud: 0.094,
};

const COST_SPIKE_THRESHOLD = 2; // current cost at least 2x baseline
const ERROR_RATE_THRESHOLD = 0.05;
const OUTBOX_BACKLOG_THRESHOLD = 10;
const MONTHLY_BUDGET = 1500;

function userName(key: string | null | undefined): string {
  if (!key) return "System";
  return seedUsers.find((u) => u.key === key)?.fullName ?? "System";
}

function agentName(key: string | null): string {
  if (!key) return "Platform";
  return seedAgents.find((a) => a.key === key)?.name ?? key;
}

function evaluationCategory(suiteName: string): EvaluationCategory {
  const prefix = suiteName.split("-")[0];
  const known: EvaluationCategory[] = [
    "functional",
    "safety",
    "regression",
    "cost",
    "latency",
    "format",
  ];
  // Map safety to the regression category bucket only if not a known category.
  return (known.find((c) => c === prefix) ??
    "functional") as EvaluationCategory;
}

// ---------------------------------------------------------------------------
// Cost
// ---------------------------------------------------------------------------

function sumBy(keyFn: (c: (typeof seedCosts)[number]) => string) {
  const map = new Map<string, number>();
  for (const cost of seedCosts) {
    const k = keyFn(cost);
    map.set(k, (map.get(k) ?? 0) + cost.estimatedCost);
  }
  return [...map.entries()].map(([label, estimatedCost]) => ({
    label,
    estimatedCost,
  }));
}

export function buildCostDetail(): CostDetailView {
  const total = seedCosts.reduce((s, c) => s + c.estimatedCost, 0);
  const byAgent = sumBy((c) => agentName(c.agentKey));
  const byProvider = sumBy((c) => c.provider);
  const byEnvironment = sumBy((c) => c.environment.toLowerCase());

  // Budget signals compare the projected monthly cost per agent (daily seed
  // cost times 30) against the monthly budget.
  const budgetSignals: BudgetSignal[] = byAgent.map((row) => {
    const monthly = row.estimatedCost * 30;
    const level =
      monthly >= MONTHLY_BUDGET
        ? ("critical" as const)
        : monthly >= MONTHLY_BUDGET * 0.6
          ? ("warning" as const)
          : ("ok" as const);
    return {
      scope: row.label,
      estimatedCost: monthly,
      threshold: MONTHLY_BUDGET,
      level,
    };
  });

  return {
    estimatedDaily: total,
    estimatedMonthly: total * 30,
    byAgent,
    byProvider,
    byEnvironment,
    trend: [
      { date: "2026-05-23", estimatedCost: 420 },
      { date: "2026-05-24", estimatedCost: 445 },
      { date: "2026-05-25", estimatedCost: 470 },
      { date: "2026-05-26", estimatedCost: 510 },
      { date: "2026-05-27", estimatedCost: 540 },
      { date: "2026-05-28", estimatedCost: 920 },
      { date: "2026-05-29", estimatedCost: 980 },
    ],
    budgetSignals,
  };
}

export function hasBudgetWarning(): boolean {
  return buildCostDetail().budgetSignals.some((s) => s.level !== "ok");
}

// ---------------------------------------------------------------------------
// Evaluations
// ---------------------------------------------------------------------------

export function buildEvaluationTrends(): EvaluationTrendsView {
  const completed = seedEvaluations.filter((e) => e.status === "COMPLETED");
  const passed = completed.filter((e) => e.passed === true).length;
  const passRate = completed.length > 0 ? passed / completed.length : 0;

  const categoryMap = new Map<
    EvaluationCategory,
    { passed: number; failed: number }
  >();
  for (const e of completed) {
    const category = evaluationCategory(e.suiteName);
    const entry = categoryMap.get(category) ?? { passed: 0, failed: 0 };
    if (e.passed === false) entry.failed += 1;
    else entry.passed += 1;
    categoryMap.set(category, entry);
  }
  const categories: EvaluationCategoryBreakdown[] = [
    ...categoryMap.entries(),
  ].map(([category, counts]) => {
    const total = counts.passed + counts.failed;
    return {
      category,
      passed: counts.passed,
      failed: counts.failed,
      passRate: total > 0 ? counts.passed / total : 0,
    };
  });

  return {
    passRate,
    trend: [
      { date: "2026-05-24", passRate: 0.95 },
      { date: "2026-05-26", passRate: 0.96 },
      { date: "2026-05-28", passRate: 0.8 },
      { date: "2026-05-29", passRate: 0.8 },
    ],
    categories,
  };
}

// ---------------------------------------------------------------------------
// Outbox
// ---------------------------------------------------------------------------

// The seed-runner creates one outbox event per active deployment. The demo
// outbox view mirrors that, all pending (no publisher yet).
export function buildOutboxRows(): OutboxEventRow[] {
  return seedDeployments
    .filter((d) => d.status === "ACTIVE")
    .map((d, index) => ({
      id: `outbox-${index}`,
      eventType: "DeploymentPromoted",
      aggregateType: "deployment",
      aggregateId: d.key,
      status: "pending" as const,
      correlationId: d.correlationId,
      occurredAt: d.deployedAt ?? "2026-05-28T14:10:00Z",
      publishedAt: null,
    }));
}

export function buildOutboxSummary(): OutboxSummaryView {
  const rows = buildOutboxRows();
  return {
    pending: rows.filter((r) => r.status === "pending").length,
    published: rows.filter((r) => r.status === "published").length,
    failed: rows.filter((r) => r.status === "failed").length,
    recent: rows,
  };
}

// ---------------------------------------------------------------------------
// Traces
// ---------------------------------------------------------------------------

function traceEntriesFor(correlationId: string): TraceEntry[] {
  const entries: TraceEntry[] = [];

  for (const [index, e] of seedAuditEvents.entries()) {
    if (e.correlationId === correlationId) {
      entries.push({
        id: `audit-${index}`,
        kind: "audit",
        title: e.action,
        detail: `${e.resourceType}: ${e.resourceId} by ${userName(e.actorKey)}`,
        timestamp: e.createdAt,
      });
    }
  }

  for (const [index, d] of seedDeployments.entries()) {
    if (d.correlationId === correlationId) {
      entries.push({
        id: `deployment-${index}`,
        kind: "deployment",
        title: `Deployment ${d.status.toLowerCase()}`,
        detail: `${agentName(d.agentKey)} ${d.version} to ${d.environment.toLowerCase()}`,
        timestamp: d.deployedAt ?? "2026-05-28T14:10:00Z",
      });
    }
  }

  for (const [index, a] of seedApprovals.entries()) {
    if (a.correlationId === correlationId) {
      entries.push({
        id: `approval-${index}`,
        kind: "approval",
        title: `Approval ${a.status.toLowerCase()}`,
        detail: a.resourceLabel,
        timestamp: a.createdAt,
      });
    }
  }

  for (const [index, c] of seedCosts.entries()) {
    if (c.correlationId === correlationId) {
      entries.push({
        id: `cost-${index}`,
        kind: "cost",
        title: "Cost recorded",
        detail: `${agentName(c.agentKey)} estimated ${c.estimatedCost.toFixed(2)} USD`,
        timestamp: c.createdAt,
      });
    }
  }

  for (const [index, i] of seedIncidents.entries()) {
    if (i.correlationId === correlationId) {
      entries.push({
        id: `incident-${index}`,
        kind: "incident",
        title: "Incident created",
        detail: i.title,
        timestamp: i.createdAt,
      });
    }
  }

  // Outbox events share the deployment correlation IDs.
  for (const row of buildOutboxRows()) {
    if (row.correlationId === correlationId) {
      entries.push({
        id: row.id,
        kind: "outbox",
        title: `Outbox ${row.eventType}`,
        detail: `${row.aggregateType}: ${row.aggregateId} (${row.status})`,
        timestamp: row.occurredAt,
      });
    }
  }

  return entries.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export function buildTraceDetail(correlationId: string): TraceDetailView {
  const entries = traceEntriesFor(correlationId);
  const auditCount = entries.filter((e) => e.kind === "audit").length;
  const outboxCount = entries.filter((e) => e.kind === "outbox").length;
  const incidentCount = entries.filter((e) => e.kind === "incident").length;
  const summary =
    entries.length === 0
      ? "No evidence found for this correlation ID."
      : `${entries.length} related records across audit, deployment, cost, incident, and outbox evidence.`;
  return {
    correlationId,
    summary,
    entries,
    auditCount,
    outboxCount,
    incidentCount,
  };
}

export function buildTraceList(): TraceListItem[] {
  const ids = new Set<string>();
  for (const e of seedAuditEvents) ids.add(e.correlationId);
  for (const d of seedDeployments) ids.add(d.correlationId);
  for (const i of seedIncidents) ids.add(i.correlationId);
  return [...ids].map((correlationId) => {
    const entries = traceEntriesFor(correlationId);
    const latest = entries[entries.length - 1]?.timestamp ?? "";
    return {
      correlationId,
      label:
        entries.find((e) => e.kind === "incident")?.detail ?? correlationId,
      entryCount: entries.length,
      latest,
    };
  });
}

// ---------------------------------------------------------------------------
// Incidents
// ---------------------------------------------------------------------------

const INCIDENT_SIGNAL: Record<string, IncidentSignal> = {
  "fraud-cost": "cost_spike",
  "support-latency": "provider_outage",
};

function incidentNarrative(key: string): string {
  if (key === "fraud-cost") {
    return "The Fraud Triage Agent v3 promotion correlated with a cost spike and elevated error rate. The safety evaluation for v3 failed, which should have blocked promotion. The recommended recovery is a rollback to the prior stable v2 deployment.";
  }
  return "A transient provider latency increase affected the agent. It has since recovered and the incident is resolved.";
}

function incidentRecommendedAction(key: string, status: string): string {
  if (status === "RESOLVED")
    return "No action required. The incident is resolved.";
  if (key === "fraud-cost")
    return "Roll back the Fraud Triage Agent to the prior stable deployment and review the v3 prompt change.";
  return "Acknowledge the incident and monitor.";
}

export function buildIncidentDetail(id: string): IncidentDetailView | null {
  const incident = seedIncidents.find((i) => i.key === id);
  if (!incident) return null;

  const trace = traceEntriesFor(incident.correlationId);
  const auditEvidence = trace.filter((e) => e.kind === "audit");
  const outboxEvidence = trace.filter((e) => e.kind === "outbox");

  const evaluationEvidence = seedEvaluations
    .filter((e) => e.correlationId === incident.correlationId)
    .map((e) => ({
      suiteName: e.suiteName,
      score: e.score,
      passed: e.passed,
    }));

  const agentCost = seedCosts
    .filter((c) => c.agentKey === incident.agentKey)
    .reduce((s, c) => s + c.estimatedCost, 0);

  const relatedMetrics = [
    {
      label: "Error rate",
      value: `${((AGENT_ERROR_RATE[incident.agentKey ?? ""] ?? 0) * 100).toFixed(1)} percent`,
    },
    { label: "Estimated cost", value: `${agentCost.toFixed(2)} USD` },
    {
      label: "Failed evaluations",
      value: String(
        evaluationEvidence.filter((e) => e.passed === false).length,
      ),
    },
  ];

  return {
    id: incident.key,
    title: incident.title,
    severity: toDomainEnum<IncidentSeverity>(incident.severity),
    status: toDomainEnum<IncidentStatus>(incident.status),
    agentName: agentName(incident.agentKey),
    description: incident.description,
    correlationId: incident.correlationId,
    createdAt: incident.createdAt,
    resolvedAt: incident.resolvedAt ?? null,
    signal: INCIDENT_SIGNAL[incident.key] ?? "error_rate",
    relatedMetrics,
    auditEvidence,
    outboxEvidence,
    evaluationEvidence,
    narrative: incidentNarrative(incident.key),
    recommendedAction: incidentRecommendedAction(incident.key, incident.status),
  };
}

// Evaluate incident rules against the seed scenario and return candidates that
// do not already match an open incident.
export function buildIncidentCandidates(): IncidentCandidate[] {
  const candidates: IncidentCandidate[] = [];

  // Cost spike for the fraud agent: v3 cost vs v2 baseline.
  const fraudV3 = seedCosts.find((c) => c.correlationId === "corr_fraud_v3");
  const fraudV2 = seedCosts.find((c) => c.correlationId === "corr_fraud_v2");
  if (fraudV3 && fraudV2) {
    const cost = evaluateCostSpike({
      agentKey: "fraud",
      correlationId: "corr_fraud_v3",
      currentCost: fraudV3.estimatedCost,
      baselineCost: fraudV2.estimatedCost,
      threshold: COST_SPIKE_THRESHOLD,
    });
    if (cost) candidates.push(cost);
  }

  // Error rate per agent.
  for (const [agentKey, errorRate] of Object.entries(AGENT_ERROR_RATE)) {
    const er = evaluateErrorRate({
      agentKey,
      correlationId: `corr_${agentKey}_v3`,
      errorRate,
      threshold: ERROR_RATE_THRESHOLD,
    });
    if (er) candidates.push(er);
  }

  // Failed evaluations.
  for (const e of seedEvaluations) {
    const ev = evaluateEvaluationFailure({
      agentKey: e.agentKey,
      correlationId: e.correlationId,
      suiteName: e.suiteName,
      score: e.score,
      passed: e.passed,
    });
    if (ev) candidates.push(ev);
  }

  // Outbox backlog.
  const backlog = evaluateOutboxBacklog({
    correlationId: "corr_outbox",
    pending: buildOutboxRows().length,
    failed: 0,
    threshold: OUTBOX_BACKLOG_THRESHOLD,
  });
  if (backlog) candidates.push(backlog);

  const openSignals = seedIncidents
    .filter((i) => i.status === "OPEN")
    .map((i) => ({
      signal: INCIDENT_SIGNAL[i.key] ?? "error_rate",
      agentKey: i.agentKey,
    }));

  return dedupeCandidates(candidates, openSignals);
}

// ---------------------------------------------------------------------------
// Operational overview
// ---------------------------------------------------------------------------

export function buildOperationalOverview(): OperationalOverview {
  const openIncidents = seedIncidents.filter((i) => i.status === "OPEN").length;
  const failedEvaluations = seedEvaluations.filter(
    (e) => e.status === "COMPLETED" && e.passed === false,
  ).length;
  const pendingOutbox = buildOutboxRows().length;
  const budgetWarning = hasBudgetWarning();

  // Health score starts at 100 and is reduced by open issues.
  let score = 100;
  score -= openIncidents * 20;
  score -= failedEvaluations * 10;
  if (budgetWarning) score -= 10;
  score = Math.max(0, score);
  const label = score >= 80 ? "healthy" : score >= 50 ? "degraded" : "at_risk";

  const statusOf = (d: (typeof seedDeployments)[number]): string => d.status;
  const deployments = {
    active: seedDeployments.filter((d) => statusOf(d) === "ACTIVE").length,
    pendingApproval: seedDeployments.filter(
      (d) => statusOf(d) === "PENDING_APPROVAL",
    ).length,
    blocked: seedDeployments.filter((d) => statusOf(d) === "BLOCKED").length,
    rolledBack: seedDeployments.filter((d) => statusOf(d) === "ROLLED_BACK")
      .length,
    recentPromotions: seedDeployments.filter((d) => statusOf(d) === "ACTIVE")
      .length,
    recentRollbacks: seedDeployments.filter(
      (d) => statusOf(d) === "ROLLED_BACK",
    ).length,
  };

  const governance = {
    pendingApprovals: seedApprovals.filter((a) => a.status === "PENDING")
      .length,
    approved: seedApprovals.filter((a) => a.status === "APPROVED").length,
    rejected: seedApprovals.filter((a) => a.status === "REJECTED").length,
  };

  const topRiskAgents = seedAgents
    .filter((a) => (AGENT_ERROR_RATE[a.key] ?? 0) > ERROR_RATE_THRESHOLD)
    .map((a) => ({
      id: a.key,
      name: a.name,
      reason: "Elevated error rate and an open incident",
    }));

  return {
    health: {
      score,
      label,
      openIncidents,
      failedEvaluations,
      budgetWarning,
      pendingOutbox,
    },
    deployments,
    governance,
    topRiskAgents,
  };
}
