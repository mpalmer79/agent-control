import { describe, expect, it } from "vitest";

import {
  buildAgentDetail,
  buildAgentList,
  buildApprovalSummary,
  buildDeploymentDetail,
  buildDeploymentList,
  buildEvaluationList,
  buildEvaluationSummary,
  buildIncidentList,
  buildMetricsSummary,
  buildPromptDetail,
  buildPromptList,
} from "@/server/views/demo-views";

describe("demo view builders", () => {
  it("builds an agent list with operational fields", () => {
    const agents = buildAgentList();
    expect(agents.length).toBeGreaterThan(0);
    for (const agent of agents) {
      expect(agent.id).toBeTruthy();
      expect(agent.activeModel).toBeTruthy();
      expect(agent.evaluationPassRate).toBeGreaterThanOrEqual(0);
      expect(agent.evaluationPassRate).toBeLessThanOrEqual(1);
    }
  });

  it("builds agent detail with linked sections", () => {
    const detail = buildAgentDetail("fraud");
    expect(detail).not.toBeNull();
    expect(detail?.versions.length).toBeGreaterThan(0);
    expect(detail?.deployments.length).toBeGreaterThan(0);
    expect(detail?.evaluations.some((e) => e.passed === false)).toBe(true);
    expect(detail?.narrative).toContain("Fraud Triage Agent");
  });

  it("returns null for an unknown agent", () => {
    expect(buildAgentDetail("does-not-exist")).toBeNull();
  });

  it("marks the failed evaluation as deployment blocking", () => {
    const failed = buildEvaluationList().filter((e) => e.blocksDeployment);
    expect(failed.length).toBeGreaterThan(0);
    for (const evaluation of failed) {
      expect(evaluation.passed).toBe(false);
    }
  });

  it("summarizes evaluations consistently", () => {
    const summary = buildEvaluationSummary();
    expect(summary.passed + summary.failed).toBeLessThanOrEqual(summary.total);
    expect(summary.passRate).toBeGreaterThanOrEqual(0);
    expect(summary.passRate).toBeLessThanOrEqual(1);
  });

  it("identifies a rollback candidate deployment", () => {
    const candidates = buildDeploymentList().filter(
      (d) => d.isRollbackCandidate,
    );
    expect(candidates.length).toBeGreaterThan(0);
  });

  it("links deployment detail evidence by correlation id", () => {
    const detail = buildDeploymentDetail("fraud-v3-prod");
    expect(detail).not.toBeNull();
    expect(detail?.evaluationEvidence.length).toBeGreaterThan(0);
    expect(detail?.rollbackReadiness.length).toBeGreaterThan(0);
  });

  it("builds prompt list and detail", () => {
    const prompts = buildPromptList();
    expect(prompts.length).toBeGreaterThan(0);
    const detail = buildPromptDetail(prompts[0]!.id);
    expect(detail).not.toBeNull();
    expect(detail?.versions.length).toBeGreaterThan(0);
  });

  it("summarizes approvals with a risk distribution", () => {
    const summary = buildApprovalSummary();
    expect(summary.total).toBe(
      summary.pending + summary.approved + summary.rejected,
    );
    expect(summary.riskDistribution).toHaveLength(3);
  });

  it("reports open incidents in the metrics summary", () => {
    const metrics = buildMetricsSummary();
    const open = buildIncidentList().filter((i) => i.status === "open").length;
    expect(metrics.openIncidents).toBe(open);
  });
});
