import { describe, expect, it } from "vitest";

import { seedAgents } from "@/data/seed";
import {
  mockAgents,
  mockApprovals,
  mockAuditEvents,
  mockDeployments,
  mockEvaluations,
  mockIncidents,
  mockMetricsSummary,
  mockPrompts,
} from "@/server/mock-source";

describe("mock data source", () => {
  it("maps every seed agent to a DTO", () => {
    const agents = mockAgents();
    expect(agents).toHaveLength(seedAgents.length);
    for (const agent of agents) {
      expect(agent.id).toBeTruthy();
      expect(agent.name).toBeTruthy();
      expect(agent.owner).toBeTruthy();
    }
  });

  it("produces non-empty collections for each resource", () => {
    expect(mockPrompts().length).toBeGreaterThan(0);
    expect(mockDeployments().length).toBeGreaterThan(0);
    expect(mockApprovals().length).toBeGreaterThan(0);
    expect(mockEvaluations().length).toBeGreaterThan(0);
    expect(mockIncidents().length).toBeGreaterThan(0);
    expect(mockAuditEvents().length).toBeGreaterThan(0);
  });

  it("derives a metrics summary consistent with the seed agents", () => {
    const summary = mockMetricsSummary();
    expect(summary.totalAgents).toBe(seedAgents.length);
    expect(summary.evaluationPassRate).toBeGreaterThanOrEqual(0);
    expect(summary.evaluationPassRate).toBeLessThanOrEqual(1);
    expect(summary.estimatedMonthlyCost).toBeGreaterThan(0);
  });
});
