import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { AgentHealth } from "@/components/dashboard/agent-health";
import { RecentDeployments } from "@/components/dashboard/recent-deployments";
import { ApprovalQueuePreview } from "@/components/dashboard/approval-queue-preview";
import { IncidentPreview } from "@/components/dashboard/incident-preview";
import { getDashboardMetricCards } from "@/lib/mock/metrics";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  const metrics = getDashboardMetricCards();

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Operational overview across agents, deployments, governance, and cost. Shell data shown from the demo scenario."
      />

      <section
        aria-label="Key metrics"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {metrics.map((metric) => (
          <StatCard key={metric.id} metric={metric} />
        ))}
      </section>

      <AgentHealth />

      <div className="grid gap-6 lg:grid-cols-2">
        <ApprovalQueuePreview />
        <IncidentPreview />
      </div>

      <RecentDeployments />
    </>
  );
}
