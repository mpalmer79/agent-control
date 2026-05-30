import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { demoAgents } from "@/lib/mock/demo-data";

export const metadata: Metadata = { title: "Agents" };

export default function AgentsPage() {
  const active = demoAgents.filter((a) => a.status === "active").length;
  const highRisk = demoAgents.filter((a) => a.riskLevel === "high").length;

  return (
    <PlaceholderPage
      title="Agents"
      description="Agent registry with identity, versions, ownership, and risk classification."
      phase="Phase 3: Control plane modules"
      summary={[
        { label: "Total agents", value: String(demoAgents.length) },
        { label: "Active", value: String(active) },
        { label: "High risk", value: String(highRisk) },
        { label: "Environments", value: "3" },
      ]}
      upcoming={[
        "Agent registry list with status, owner, and risk level",
        "Agent detail with versions, deployments, evaluations, and cost",
        "Agent version registration referencing a prompt version and model",
        "Audit events emitted for every agent action",
      ]}
    />
  );
}
