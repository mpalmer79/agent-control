import { describe, expect, it } from "vitest";

import {
  dedupeCandidates,
  evaluateCostSpike,
  evaluateErrorRate,
  evaluateEvaluationFailure,
  evaluateOutboxBacklog,
} from "@/server/modules/incidents/rules";

describe("incident rules", () => {
  it("fires a cost spike when current cost exceeds the threshold multiple", () => {
    const candidate = evaluateCostSpike({
      agentKey: "fraud",
      correlationId: "c1",
      currentCost: 30,
      baselineCost: 11.25,
      threshold: 2,
    });
    expect(candidate).not.toBeNull();
    expect(candidate?.signal).toBe("cost_spike");
  });

  it("does not fire a cost spike below the threshold", () => {
    expect(
      evaluateCostSpike({
        agentKey: "support",
        correlationId: "c1",
        currentCost: 12,
        baselineCost: 11,
        threshold: 2,
      }),
    ).toBeNull();
  });

  it("escalates cost spike severity for very large spikes", () => {
    const candidate = evaluateCostSpike({
      agentKey: "fraud",
      correlationId: "c1",
      currentCost: 100,
      baselineCost: 10,
      threshold: 2,
    });
    expect(candidate?.severity).toBe("critical");
  });

  it("fires an error rate incident over the threshold", () => {
    const candidate = evaluateErrorRate({
      agentKey: "fraud",
      correlationId: "c1",
      errorRate: 0.094,
      threshold: 0.05,
    });
    expect(candidate?.signal).toBe("error_rate");
  });

  it("does not fire an error rate incident under the threshold", () => {
    expect(
      evaluateErrorRate({
        agentKey: "support",
        correlationId: "c1",
        errorRate: 0.012,
        threshold: 0.05,
      }),
    ).toBeNull();
  });

  it("fires an evaluation failure incident only for failed evaluations", () => {
    expect(
      evaluateEvaluationFailure({
        agentKey: "fraud",
        correlationId: "c1",
        suiteName: "safety-v2",
        score: 0.61,
        passed: false,
      }),
    ).not.toBeNull();
    expect(
      evaluateEvaluationFailure({
        agentKey: "support",
        correlationId: "c1",
        suiteName: "safety-v2",
        score: 0.96,
        passed: true,
      }),
    ).toBeNull();
  });

  it("fires an outbox backlog incident over the threshold", () => {
    expect(
      evaluateOutboxBacklog({
        correlationId: "c1",
        pending: 12,
        failed: 0,
        threshold: 10,
      }),
    ).not.toBeNull();
    expect(
      evaluateOutboxBacklog({
        correlationId: "c1",
        pending: 2,
        failed: 0,
        threshold: 10,
      }),
    ).toBeNull();
  });

  it("dedupes candidates against open incidents by signal and agent", () => {
    const candidates = [
      {
        signal: "cost_spike" as const,
        severity: "high" as const,
        title: "x",
        agentKey: "fraud",
        correlationId: "c1",
        reason: "r",
      },
    ];
    const filtered = dedupeCandidates(candidates, [
      { signal: "cost_spike", agentKey: "fraud" },
    ]);
    expect(filtered).toHaveLength(0);
  });
});
