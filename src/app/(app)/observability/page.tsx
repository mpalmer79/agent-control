import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { demoIncidents } from "@/lib/mock/demo-data";

export const metadata: Metadata = { title: "Observability" };

export default function ObservabilityPage() {
  const open = demoIncidents.filter((i) => i.status === "open").length;

  return (
    <PlaceholderPage
      title="Observability"
      description="Metrics, incidents, and cost trends, joined by correlation IDs."
      phase="Phase 5: Observability and incidents"
      summary={[
        { label: "Open incidents", value: String(open) },
        { label: "Metrics tracked", value: "10" },
        { label: "Cost trend", value: "7 days" },
        { label: "Tracing", value: "Correlation IDs" },
      ]}
      upcoming={[
        "Agent and model metrics with latency percentiles",
        "Cost dashboard with per-agent breakdown",
        "Incident creation on cost spikes and elevated error rates",
        "Correlation-ID trace lookup across logs, costs, and audit",
      ]}
    />
  );
}
