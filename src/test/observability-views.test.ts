import { describe, expect, it } from "vitest";

import {
  buildCostDetail,
  buildEvaluationTrends,
  buildIncidentCandidates,
  buildIncidentDetail,
  buildOperationalOverview,
  buildOutboxSummary,
  buildTraceDetail,
  buildTraceList,
} from "@/server/views/observability-views";

describe("observability views", () => {
  it("builds a cost detail with breakdowns and budget signals", () => {
    const cost = buildCostDetail();
    expect(cost.byAgent.length).toBeGreaterThan(0);
    expect(cost.byProvider.length).toBeGreaterThan(0);
    expect(cost.byEnvironment.length).toBeGreaterThan(0);
    expect(cost.estimatedMonthly).toBeGreaterThan(cost.estimatedDaily);
    expect(cost.budgetSignals.length).toBeGreaterThan(0);
  });

  it("flags at least one budget signal above ok", () => {
    const cost = buildCostDetail();
    expect(cost.budgetSignals.some((s) => s.level !== "ok")).toBe(true);
  });

  it("builds evaluation trends with category breakdown", () => {
    const trends = buildEvaluationTrends();
    expect(trends.passRate).toBeGreaterThanOrEqual(0);
    expect(trends.passRate).toBeLessThanOrEqual(1);
    expect(trends.categories.length).toBeGreaterThan(0);
  });

  it("builds an outbox summary from active deployments", () => {
    const outbox = buildOutboxSummary();
    expect(outbox.pending).toBeGreaterThan(0);
    expect(outbox.recent.every((r) => r.status === "pending")).toBe(true);
  });

  it("builds a trace ordered by time for the fraud correlation", () => {
    const trace = buildTraceDetail("corr_fraud_v3");
    expect(trace.entries.length).toBeGreaterThan(1);
    const timestamps = trace.entries.map((e) => e.timestamp);
    const sorted = [...timestamps].sort((a, b) => a.localeCompare(b));
    expect(timestamps).toEqual(sorted);
    expect(trace.auditCount).toBeGreaterThan(0);
    expect(trace.incidentCount).toBeGreaterThan(0);
  });

  it("returns an empty trace summary for an unknown correlation id", () => {
    const trace = buildTraceDetail("does-not-exist");
    expect(trace.entries).toHaveLength(0);
    expect(trace.summary).toContain("No evidence");
  });

  it("lists traces with entry counts", () => {
    const list = buildTraceList();
    expect(list.length).toBeGreaterThan(0);
    expect(list.some((t) => t.correlationId === "corr_fraud_v3")).toBe(true);
    expect(list.every((t) => t.entryCount >= 0)).toBe(true);
  });

  it("builds incident detail with linked evidence", () => {
    const detail = buildIncidentDetail("fraud-cost");
    expect(detail).not.toBeNull();
    expect(detail?.auditEvidence.length).toBeGreaterThan(0);
    expect(detail?.evaluationEvidence.some((e) => e.passed === false)).toBe(
      true,
    );
    expect(detail?.recommendedAction.length).toBeGreaterThan(0);
  });

  it("returns null incident detail for unknown id", () => {
    expect(buildIncidentDetail("nope")).toBeNull();
  });

  it("does not duplicate the open cost spike incident in candidates", () => {
    const candidates = buildIncidentCandidates();
    // The fraud cost spike is already an open incident, so it must be deduped.
    expect(
      candidates.some(
        (c) => c.signal === "cost_spike" && c.agentKey === "fraud",
      ),
    ).toBe(false);
  });

  it("computes an operational health score that reflects open issues", () => {
    const overview = buildOperationalOverview();
    expect(overview.health.score).toBeLessThan(100);
    expect(["healthy", "degraded", "at_risk"]).toContain(overview.health.label);
    expect(overview.topRiskAgents.length).toBeGreaterThan(0);
  });
});
