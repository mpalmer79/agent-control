import { describe, expect, it } from "vitest";

import { dashboardMetricCards } from "@/server/views/metric-cards";
import { buildMetricsSummary } from "@/server/views/demo-views";

describe("dashboard metric cards", () => {
  it("builds one card per dashboard metric", () => {
    const cards = dashboardMetricCards(buildMetricsSummary());
    expect(cards).toHaveLength(7);
    for (const card of cards) {
      expect(card.value.length).toBeGreaterThan(0);
      expect(card.label.length).toBeGreaterThan(0);
    }
  });

  it("flags failed evaluations with a destructive intent", () => {
    const cards = dashboardMetricCards({
      ...buildMetricsSummary(),
      failedEvaluations: 2,
    });
    const card = cards.find((c) => c.id === "evaluations");
    expect(card?.intent).toBe("destructive");
  });
});
