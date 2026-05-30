import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { DemoModeBanner } from "@/components/shared/demo-mode-banner";
import { StatCard } from "@/components/dashboard/stat-card";
import { AgentHealth } from "@/components/dashboard/agent-health";
import { RecentDeployments } from "@/components/dashboard/recent-deployments";
import { ApprovalQueuePreview } from "@/components/dashboard/approval-queue-preview";
import { IncidentPreview } from "@/components/dashboard/incident-preview";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import { correlationIdFromHeaders } from "@/server/request";
import { getMetricsSummary } from "@/server/views";
import { dashboardMetricCards } from "@/server/views/metric-cards";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const correlationId = await correlationIdFromHeaders();
  const { data: metrics, source } = await getMetricsSummary(correlationId);
  const cards = dashboardMetricCards(metrics);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Operational overview across agents, deployments, governance, and cost."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={ROUTES.agents}>View agents</Link>
          </Button>
        }
      />

      <DemoModeBanner source={source} />

      <section
        aria-label="Key metrics"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {cards.map((metric) => (
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
