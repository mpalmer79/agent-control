import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { DemoModeBanner } from "@/components/shared/demo-mode-banner";
import { DetailCard } from "@/components/shared/detail-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { RiskBadge } from "@/components/shared/risk-badge";
import { OperationalHealthCard } from "@/components/observability/operational-health-card";
import { OutboxStatusBadge } from "@/components/observability/outbox-status-badge";
import { CostSignalBadge } from "@/components/observability/cost-signal-badge";
import { TraceLink } from "@/components/observability/trace-link";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AGENT_STATUS_INTENT,
  AGENT_STATUS_LABELS,
} from "@/lib/constants/status";
import { formatCurrency, formatDate, formatPercent } from "@/lib/utils";
import { correlationIdFromHeaders } from "@/server/request";
import {
  getCostDetail,
  getEvaluationTrends,
  getObservability,
  getOperationalOverview,
  getOutboxSummary,
} from "@/server/views";

export const metadata: Metadata = { title: "Observability" };

export default async function ObservabilityPage() {
  const correlationId = await correlationIdFromHeaders();
  const [
    { data: view, source },
    { data: overview },
    { data: outbox },
    { data: cost },
    { data: evaluations },
  ] = await Promise.all([
    getObservability(correlationId),
    getOperationalOverview(correlationId),
    getOutboxSummary(correlationId),
    getCostDetail(correlationId),
    getEvaluationTrends(correlationId),
  ]);

  const recentOutbox = outbox.recent[0];

  return (
    <>
      <PageHeader
        title="Observability"
        description="Operational health, agent and provider metrics, cost, evaluations, incidents, and evidence."
        actions={
          <Link
            href="/traces"
            className="text-sm text-muted-foreground hover:underline"
          >
            Trace lookup
          </Link>
        }
      />
      <DemoModeBanner source={source} />

      <Alert>
        <AlertTitle>Simulated telemetry</AlertTitle>
        <AlertDescription>
          Telemetry in the MVP is demo-seeded with a simulated runtime. Real
          telemetry ingestion arrives in a later phase.
        </AlertDescription>
      </Alert>

      <section className="grid gap-4 lg:grid-cols-3">
        <OperationalHealthCard health={overview.health} />
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Deployment health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>{overview.deployments.active} active</p>
            <p>{overview.deployments.pendingApproval} pending approval</p>
            <p>{overview.deployments.rolledBack} rolled back</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Governance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>{overview.governance.pendingApprovals} pending approvals</p>
            <p>{overview.governance.approved} approved</p>
            <p>{overview.governance.rejected} rejected</p>
          </CardContent>
        </Card>
      </section>

      <DetailCard title="Agent health">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Error rate</TableHead>
              <TableHead>Eval pass</TableHead>
              <TableHead>Monthly cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {view.agentHealth.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>
                  <StatusBadge
                    label={AGENT_STATUS_LABELS[row.status]}
                    intent={AGENT_STATUS_INTENT[row.status]}
                  />
                </TableCell>
                <TableCell>
                  <RiskBadge riskLevel={row.riskLevel} />
                </TableCell>
                <TableCell>{formatPercent(row.errorRate)}</TableCell>
                <TableCell>{formatPercent(row.evaluationPassRate)}</TableCell>
                <TableCell>
                  {formatCurrency(row.estimatedMonthlyCost)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DetailCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <DetailCard title="Provider health">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Error rate</TableHead>
                <TableHead>P95 latency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {view.providerHealth.map((row) => (
                <TableRow key={row.provider}>
                  <TableCell className="font-medium capitalize">
                    {row.provider}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={row.status === "healthy" ? "success" : "warning"}
                    >
                      {row.status === "healthy" ? "Healthy" : "Degraded"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatPercent(row.errorRate)}</TableCell>
                  <TableCell>{row.p95LatencyMs} ms</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DetailCard>

        <DetailCard
          title="Cost summary"
          description="Estimated spend across agents (demo-seeded)"
        >
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-semibold">
                {formatCurrency(cost.estimatedMonthly)}
              </p>
              <span className="text-xs text-muted-foreground">
                estimated monthly
              </span>
            </div>
            <ul className="space-y-2">
              {cost.budgetSignals.map((signal) => (
                <li
                  key={signal.scope}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span>{signal.scope}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {formatCurrency(signal.estimatedCost)}
                    </span>
                    <CostSignalBadge level={signal.level} />
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/observability/costs"
              className="text-sm text-primary hover:underline"
            >
              View cost detail
            </Link>
          </div>
        </DetailCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DetailCard
          title="Evaluation trends"
          description="Pass rate by category"
        >
          <p className="mb-3 text-2xl font-semibold">
            {formatPercent(evaluations.passRate)}
          </p>
          <ul className="space-y-2">
            {evaluations.categories.map((cat) => (
              <li
                key={cat.category}
                className="flex items-center justify-between text-sm capitalize"
              >
                <span>{cat.category}</span>
                <span className="text-muted-foreground">
                  {formatPercent(cat.passRate)} ({cat.passed}/
                  {cat.passed + cat.failed})
                </span>
              </li>
            ))}
          </ul>
        </DetailCard>

        <DetailCard
          title="Outbox"
          description="Pending domain events awaiting publication"
        >
          <div className="mb-3 flex gap-4 text-sm">
            <span>{outbox.pending} pending</span>
            <span>{outbox.published} published</span>
            <span>{outbox.failed} failed</span>
          </div>
          <Link
            href="/observability/outbox"
            className="text-sm text-primary hover:underline"
          >
            View outbox events
          </Link>
        </DetailCard>
      </div>

      <DetailCard
        title="Open incidents"
        description="Active operational incidents"
      >
        {view.openIncidents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No open incidents.</p>
        ) : (
          <ul className="space-y-2">
            {view.openIncidents.map((incident) => (
              <li
                key={incident.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <Link
                  href={`/incidents/${incident.id}`}
                  className="hover:underline"
                >
                  {incident.title}
                </Link>
                <TraceLink correlationId={incident.correlationId} />
              </li>
            ))}
          </ul>
        )}
      </DetailCard>

      {recentOutbox ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          Recent outbox event: {recentOutbox.eventType}
          <OutboxStatusBadge status={recentOutbox.status} /> at{" "}
          {formatDate(recentOutbox.occurredAt)}
        </p>
      ) : null}
    </>
  );
}
