// Incident rule engine.
//
// Pure functions that detect operational conditions and return incident
// candidates. They do not read or write the database; the service layer gathers
// facts and decides whether to create incidents. Severity scales with the size
// of the signal. Keeping the rules pure makes them straightforward to test.

import type { IncidentCandidate, IncidentSignal } from "@/types/observability";
import type { IncidentSeverity } from "@/types/domain";

export interface CostSpikeInput {
  agentKey: string;
  correlationId: string;
  currentCost: number;
  baselineCost: number;
  threshold: number;
}

export interface ErrorRateInput {
  agentKey: string;
  correlationId: string;
  errorRate: number;
  threshold: number;
}

export interface EvaluationFailureInput {
  agentKey: string;
  correlationId: string;
  suiteName: string;
  score: number | null;
  passed: boolean | null;
}

export interface OutboxBacklogInput {
  correlationId: string;
  pending: number;
  failed: number;
  threshold: number;
}

function candidate(
  signal: IncidentSignal,
  severity: IncidentSeverity,
  title: string,
  agentKey: string | null,
  correlationId: string,
  reason: string,
): IncidentCandidate {
  return { signal, severity, title, agentKey, correlationId, reason };
}

// Cost spike: fires when current cost exceeds baseline by at least the
// threshold multiplier. Severity scales with how far over the line it is.
export function evaluateCostSpike(
  input: CostSpikeInput,
): IncidentCandidate | null {
  if (input.baselineCost <= 0) {
    return null;
  }
  const ratio = input.currentCost / input.baselineCost;
  if (ratio < input.threshold) {
    return null;
  }
  const severity: IncidentSeverity =
    ratio >= input.threshold * 2 ? "critical" : "high";
  return candidate(
    "cost_spike",
    severity,
    `Cost spike detected for ${input.agentKey}`,
    input.agentKey,
    input.correlationId,
    `Estimated cost is ${ratio.toFixed(1)}x the baseline.`,
  );
}

// Error rate: fires when error rate exceeds the threshold. Severity scales with
// how far past the threshold it is.
export function evaluateErrorRate(
  input: ErrorRateInput,
): IncidentCandidate | null {
  if (input.errorRate < input.threshold) {
    return null;
  }
  const severity: IncidentSeverity =
    input.errorRate >= input.threshold * 2 ? "high" : "medium";
  return candidate(
    "error_rate",
    severity,
    `Elevated error rate for ${input.agentKey}`,
    input.agentKey,
    input.correlationId,
    `Error rate ${(input.errorRate * 100).toFixed(1)} percent exceeds the threshold.`,
  );
}

// Evaluation failure: fires when a critical evaluation failed. Severity scales
// with how low the score is.
export function evaluateEvaluationFailure(
  input: EvaluationFailureInput,
): IncidentCandidate | null {
  if (input.passed !== false) {
    return null;
  }
  const severity: IncidentSeverity =
    input.score !== null && input.score < 0.5 ? "high" : "medium";
  return candidate(
    "evaluation_failure",
    severity,
    `Failed evaluation ${input.suiteName} for ${input.agentKey}`,
    input.agentKey,
    input.correlationId,
    `The ${input.suiteName} evaluation failed and blocks production promotion.`,
  );
}

// Outbox backlog: fires when pending or failed outbox events exceed the
// threshold. Failed events raise severity.
export function evaluateOutboxBacklog(
  input: OutboxBacklogInput,
): IncidentCandidate | null {
  const total = input.pending + input.failed;
  if (total < input.threshold) {
    return null;
  }
  const severity: IncidentSeverity = input.failed > 0 ? "high" : "medium";
  return candidate(
    "outbox_backlog",
    severity,
    "Outbox backlog detected",
    null,
    input.correlationId,
    `There are ${input.pending} pending and ${input.failed} failed outbox events.`,
  );
}

// Deduplicate candidates against open incident signal and agent pairs so the
// same condition does not create duplicate incidents.
export function dedupeCandidates(
  candidates: IncidentCandidate[],
  openSignals: { signal: IncidentSignal; agentKey: string | null }[],
): IncidentCandidate[] {
  return candidates.filter(
    (c) =>
      !openSignals.some(
        (o) => o.signal === c.signal && o.agentKey === c.agentKey,
      ),
  );
}
