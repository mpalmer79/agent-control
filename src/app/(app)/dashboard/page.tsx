import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { DemoModeBanner } from "@/components/shared/demo-mode-banner";
import { StatCard } from "@/components/dashboard/stat-card";
import { AgentHealth } from "@/components/dashboard/agent-health";
import { RecentDeployments } from "@/components/dashboard/recent-deployments";
import { ApprovalQueuePreview } from "@/components/dashboard/approval-queue-preview";
import { IncidentPreview } from "@/components/dashboard/incident-preview";
import { OperationalHealthCard } from "@/components/observability/operational-health-card";
import { TraceLink } from "@/components/observability/trace-link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DetailCard } from "@/components/shared/detail-card";
import { ROUTES } from "@/lib/constants/routes";
import { correlationIdFromHeaders } from "@/server/request";
import { getMetricsSummary, getOperationalOverview } from "@/server/views";
import { dashboardMetricCards } from "@/server/views/metric-cards";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const correlationId = await correlationIdFromHeaders();
  const [{ data: metrics, source }, { data: overview }] = await Promise.all([
    getMetricsSummary(correlationId),
    getOperationalOverview(correlationId),
  ]);
  const cards = dashboardMetricCards(metrics);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Operational overview across agents, deployments, governance, cost, and incidents."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={ROUTES.incidents}>View incidents</Link>
          </Button>
        }
      />

      <DemoModeBanner source={source} />

      {overview.health.openIncidents > 0 || overview.health.budgetWarning ? (
        <Alert variant="warning">
          <AlertTitle>Operational attention needed</AlertTitle>
          <AlertDescription>
            {overview.health.openIncidents} open incident(s) and{" "}
            {overview.health.failedEvaluations} failed evaluation(s). Follow a
            correlation ID from an incident to its audit and outbox evidence.
          </AlertDescription>
        </Alert>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-3">
        <OperationalHealthCard health={overview.health} />
        <DetailCard
          title="Top risk agents"
          description="Agents needing attention"
        >
          {overview.topRiskAgents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No agents at risk.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {overview.topRiskAgents.map((agent) => (
                <li key={agent.id}>
                  <Link
                    href={`/agents/${agent.id}`}
                    className="font-medium hover:underline"
                  >
                    {agent.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {agent.reason}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </DetailCard>
        <DetailCard
          title="Reviewer walkthrough"
          description="The fastest path through the story"
        >
          <ol className="list-decimal space-y-1 pl-4 text-sm text-muted-foreground">
            <li>Open an incident.</li>
            <li>Inspect the triggering signal.</li>
            <li>Follow the correlation ID.</li>
            <li>Review audit and outbox evidence.</li>
            <li>Return to the deployment and roll back.</li>
          </ol>
          <div className="mt-3 flex items-center gap-3">
            <Link
              href={ROUTES.walkthrough}
              className="text-sm font-medium text-primary hover:underline"
            >
              Start guided walkthrough
            </Link>
            <TraceLink correlationId="corr_fraud_v3" />
          </div>
        </DetailCard>
      </section>

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
