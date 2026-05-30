import { describe, expect, it } from "vitest";

import { demoAgents } from "@/lib/mock/demo-data";
import {
  getDashboardMetricCards,
  getDashboardSummary,
} from "@/lib/mock/metrics";

describe("mock data layer", () => {
  it("exposes demo agents with required fields", () => {
    expect(demoAgents.length).toBeGreaterThan(0);
    for (const agent of demoAgents) {
      expect(agent.id).toBeTruthy();
      expect(agent.name).toBeTruthy();
      expect(agent.evaluationPassRate).toBeGreaterThanOrEqual(0);
      expect(agent.evaluationPassRate).toBeLessThanOrEqual(1);
    }
  });

  it("derives a dashboard summary consistent with the agents", () => {
    const summary = getDashboardSummary();
    expect(summary.totalAgents).toBe(demoAgents.length);
    expect(summary.estimatedMonthlyCost).toBeGreaterThan(0);
  });

  it("builds one metric card per dashboard metric", () => {
    const cards = getDashboardMetricCards();
    expect(cards).toHaveLength(6);
    for (const card of cards) {
      expect(card.value.length).toBeGreaterThan(0);
    }
  });
});
