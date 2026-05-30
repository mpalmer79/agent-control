// Read-oriented view service for the Phase 3 control plane.
//
// Each function returns a Loaded<T> ({ data, source }) using the shared load()
// fallback. The Phase 3 view models are rich aggregates (narratives, derived
// rates, linked evidence) assembled from the seed scenario. The load() wrapper
// still reports the source honestly based on whether a database is configured.
// Database-backed assembly of these aggregates (joining the Phase 2
// repositories) lands alongside the Phase 4 write workflows; the lean
// repository reads remain available in src/server/repositories. No live calls,
// no secrets.

import { load, type Loaded } from "@/server/data-source";
import * as views from "@/server/views/demo-views";
import * as obs from "@/server/views/observability-views";
import type {
  AgentDetailView,
  AgentListItem,
  ApprovalListItem,
  ApprovalSummaryView,
  AuditEventListItem,
  AuditSummaryView,
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
} from "@/types/views";

// Serve a seed-derived builder through the load() fallback. The source reflects
// whether a database is configured, which keeps the demo banner honest.
function view<T>(correlationId: string, build: () => T): Promise<Loaded<T>> {
  return load<T>(correlationId, async () => build(), build);
}

// Agents
export function listAgents(
  correlationId: string,
): Promise<Loaded<AgentListItem[]>> {
  return view(correlationId, () => views.buildAgentList());
}

export function getAgentDetail(
  correlationId: string,
  id: string,
): Promise<Loaded<AgentDetailView | null>> {
  return view(correlationId, () => views.buildAgentDetail(id));
}

// Prompts
export function listPrompts(
  correlationId: string,
): Promise<Loaded<PromptListItem[]>> {
  return view(correlationId, () => views.buildPromptList());
}

export function getPromptDetail(
  correlationId: string,
  id: string,
): Promise<Loaded<PromptDetailView | null>> {
  return view(correlationId, () => views.buildPromptDetail(id));
}

// Deployments
export function listDeployments(
  correlationId: string,
): Promise<Loaded<DeploymentListItem[]>> {
  return view(correlationId, () => views.buildDeploymentList());
}

export function getDeploymentDetail(
  correlationId: string,
  id: string,
): Promise<Loaded<DeploymentDetailView | null>> {
  return view(correlationId, () => views.buildDeploymentDetail(id));
}

export function getRollbackCandidates(
  correlationId: string,
  agentKey?: string,
): Promise<Loaded<string[]>> {
  return view(correlationId, () =>
    views
      .buildDeploymentList()
      .filter((d) => d.isRollbackCandidate)
      .filter((d) => (agentKey ? d.id.startsWith(`${agentKey}-`) : true))
      .map((d) => d.id),
  );
}

// Governance
export function listApprovals(
  correlationId: string,
): Promise<Loaded<ApprovalListItem[]>> {
  return view(correlationId, () => views.buildApprovalList());
}

export function getApprovalSummary(
  correlationId: string,
): Promise<Loaded<ApprovalSummaryView>> {
  return view(correlationId, () => views.buildApprovalSummary());
}

export function getApprovalDetail(
  correlationId: string,
  id: string,
): Promise<Loaded<ApprovalListItem | null>> {
  return view(
    correlationId,
    () => views.buildApprovalList().find((a) => a.id === id) ?? null,
  );
}

export function getPendingApprovals(
  correlationId: string,
): Promise<Loaded<ApprovalListItem[]>> {
  return view(correlationId, () =>
    views.buildApprovalList().filter((a) => a.status === "pending"),
  );
}

// Evaluations
export function listEvaluations(
  correlationId: string,
): Promise<Loaded<EvaluationListItem[]>> {
  return view(correlationId, () => views.buildEvaluationList());
}

export function getEvaluationSummary(
  correlationId: string,
): Promise<Loaded<EvaluationSummaryView>> {
  return view(correlationId, () => views.buildEvaluationSummary());
}

export function getFailedEvaluations(
  correlationId: string,
): Promise<Loaded<EvaluationListItem[]>> {
  return view(correlationId, () =>
    views.buildEvaluationList().filter((e) => e.passed === false),
  );
}

// Incidents
export function listIncidents(
  correlationId: string,
): Promise<Loaded<IncidentListItem[]>> {
  return view(correlationId, () => views.buildIncidentList());
}

export function getIncidentSummary(
  correlationId: string,
): Promise<Loaded<IncidentSummaryView>> {
  return view(correlationId, () => views.buildIncidentSummary());
}

export function getOpenIncidents(
  correlationId: string,
): Promise<Loaded<IncidentListItem[]>> {
  return view(correlationId, () =>
    views.buildIncidentList().filter((i) => i.status === "open"),
  );
}

// Audit
export function listAuditEvents(
  correlationId: string,
): Promise<Loaded<AuditEventListItem[]>> {
  return view(correlationId, () => views.buildAuditList());
}

export function getAuditSummary(
  correlationId: string,
): Promise<Loaded<AuditSummaryView>> {
  return view(correlationId, () => views.buildAuditSummary());
}

export function getAuditEventsForResource(
  correlationId: string,
  resourceId: string,
): Promise<Loaded<AuditEventListItem[]>> {
  return view(correlationId, () => views.buildAuditForResource(resourceId));
}

// Models
export function listModels(
  correlationId: string,
): Promise<Loaded<ModelListItem[]>> {
  return view(correlationId, () => views.buildModelList());
}

// Observability and metrics
export function getMetricsSummary(
  correlationId: string,
): Promise<Loaded<MetricsSummaryView>> {
  return view(correlationId, () => views.buildMetricsSummary());
}

export function getObservability(
  correlationId: string,
): Promise<Loaded<ObservabilityView>> {
  return view(correlationId, () => views.buildObservability());
}

// ---------------------------------------------------------------------------
// Phase 5: operational evidence
// ---------------------------------------------------------------------------

export function getOperationalOverview(correlationId: string) {
  return view(correlationId, () => obs.buildOperationalOverview());
}

export function getCostDetail(correlationId: string) {
  return view(correlationId, () => obs.buildCostDetail());
}

export function getEvaluationTrends(correlationId: string) {
  return view(correlationId, () => obs.buildEvaluationTrends());
}

export function getOutboxSummary(correlationId: string) {
  return view(correlationId, () => obs.buildOutboxSummary());
}

export function getTraceDetail(correlationId: string, traceId: string) {
  return view(correlationId, () => obs.buildTraceDetail(traceId));
}

export function getTraceList(correlationId: string) {
  return view(correlationId, () => obs.buildTraceList());
}

export function getIncidentDetail(correlationId: string, id: string) {
  return view(correlationId, () => obs.buildIncidentDetail(id));
}

export function getIncidentCandidates(correlationId: string) {
  return view(correlationId, () => obs.buildIncidentCandidates());
}
