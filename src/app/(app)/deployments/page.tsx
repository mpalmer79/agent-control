import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { demoDeployments } from "@/lib/mock/demo-data";

export const metadata: Metadata = { title: "Deployments" };

export default function DeploymentsPage() {
  const active = demoDeployments.filter((d) => d.status === "active").length;
  const pending = demoDeployments.filter(
    (d) => d.status === "pending_approval",
  ).length;

  return (
    <PlaceholderPage
      title="Deployments"
      description="Promotion and rollback across development, staging, and production."
      phase="Phase 3: Control plane modules"
      summary={[
        { label: "Active", value: String(active) },
        { label: "Pending approval", value: String(pending) },
        { label: "Environments", value: "3" },
        { label: "Rollback ready", value: "Yes" },
      ]}
      upcoming={[
        "Deployment timeline per agent and environment",
        "Quality gate enforcement for production promotions",
        "Approval requests created for medium and high risk",
        "Rollback that preserves the failed deployment record",
      ]}
    />
  );
}
