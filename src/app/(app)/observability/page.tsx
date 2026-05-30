import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { DemoModeBanner } from "@/components/shared/demo-mode-banner";
import { DetailCard } from "@/components/shared/detail-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { RiskBadge } from "@/components/shared/risk-badge";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { formatCurrency, formatPercent } from "@/lib/utils";
import { correlationIdFromHeaders } from "@/server/request";
import { getObservability } from "@/server/views";

export const metadata: Metadata = { title: "Observability" };

export default async function ObservabilityPage() {
  const correlationId = await correlationIdFromHeaders();
  const { data: view, source } = await getObservability(correlationId);

  return (
    <>
      <PageHeader
        title="Observability"
        description="Agent and provider health, latency, error, and cost summaries."
        actions={
          <Link
            href="/incidents"
            className="text-sm text-muted-foreground hover:underline"
          >
            View incidents
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
          description="Estimated spend across agents"
        >
          <div className="space-y-3">
            <p className="text-2xl font-semibold">
              {formatCurrency(view.cost.estimatedTotal)}
            </p>
            <ul className="space-y-2">
              {view.cost.byAgent.map((entry) => (
                <li
                  key={entry.agentName}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{entry.agentName}</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(entry.estimatedCost)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
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
                <span>{incident.title}</span>
                <span className="text-muted-foreground">
                  {incident.agentName}
                </span>
              </li>
            ))}
          </ul>
        )}
      </DetailCard>
    </>
  );
}
