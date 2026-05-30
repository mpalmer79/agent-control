import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatCard } from "@/components/dashboard/stat-card";
import type { MetricCard } from "@/types/metrics";

const metric: MetricCard = {
  id: "agents",
  label: "Total agents",
  value: "6",
  helpText: "Across all environments",
  trend: "up",
  trendLabel: "+1 this week",
  intent: "default",
};

describe("StatCard", () => {
  it("renders the metric label, value, and help text", () => {
    render(<StatCard metric={metric} />);
    expect(screen.getByText("Total agents")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("Across all environments")).toBeInTheDocument();
  });
});
