import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { DemoModeBanner } from "@/components/shared/demo-mode-banner";
import { DetailCard, DetailList } from "@/components/shared/detail-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { RiskBadge } from "@/components/shared/risk-badge";
import { EnvironmentBadge } from "@/components/shared/environment-badge";
import { CorrelationId } from "@/components/shared/correlation-id";
import { Timeline } from "@/components/shared/timeline";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
  DEPLOYMENT_STATUS_INTENT,
  DEPLOYMENT_STATUS_LABELS,
  INCIDENT_SEVERITY_INTENT,
  INCIDENT_SEVERITY_LABELS,
  evaluationPassIntent,
  evaluationPassLabel,
} from "@/lib/constants/status";
import { formatCurrency, formatDate, formatPercent } from "@/lib/utils";
import { correlationIdFromHeaders } from "@/server/request";
import { getAgentDetail } from "@/server/views";

export const metadata: Metadata = { title: "Agent detail" };

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const correlationId = await correlationIdFromHeaders();
  const { data: agent, source } = await getAgentDetail(correlationId, id);

  if (!agent) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={agent.name}
        description={agent.description ?? undefined}
        actions={
          <Link
            href="/agents"
            className="text-sm text-muted-foreground hover:underline"
          >
            Back to agents
          </Link>
        }
      />
      <DemoModeBanner source={source} />

      <Alert>
        <AlertTitle>Operational summary</AlertTitle>
        <AlertDescription>{agent.narrative}</AlertDescription>
      </Alert>

      <DetailCard title="Overview">
        <DetailList
          items={[
            {
              label: "Status",
              value: (
                <StatusBadge
                  label={AGENT_STATUS_LABELS[agent.status]}
                  intent={AGENT_STATUS_INTENT[agent.status]}
                />
              ),
            },
            {
              label: "Risk level",
              value: <RiskBadge riskLevel={agent.riskLevel} />,
            },
            { label: "Owner", value: agent.owner },
            {
              label: "Environment",
              value: <EnvironmentBadge environment={agent.environment} />,
            },
            { label: "Active model", value: agent.activeModel },
            {
              label: "Active prompt version",
              value: agent.activePromptVersion,
            },
            {
              label: "Evaluation pass rate",
              value: formatPercent(agent.evaluationPassRate),
            },
            {
              label: "Estimated monthly cost",
              value: formatCurrency(agent.estimatedMonthlyCost),
            },
          ]}
        />
      </DetailCard>

      <DetailCard
        title="Recent deployments"
        description="Promotions and rollbacks for this agent"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Version</TableHead>
              <TableHead>Environment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Deployed by</TableHead>
              <TableHead>When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agent.deployments.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/deployments/${d.id}`}
                    className="hover:underline"
                  >
                    {d.version}
                  </Link>
                </TableCell>
                <TableCell>
                  <EnvironmentBadge environment={d.environment} />
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={DEPLOYMENT_STATUS_LABELS[d.status]}
                    intent={DEPLOYMENT_STATUS_INTENT[d.status]}
                  />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {d.deployedBy}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {d.deployedAt ? formatDate(d.deployedAt) : "n/a"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DetailCard>

      <DetailCard
        title="Recent evaluations"
        description="Quality, safety, and regression results"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Suite</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agent.evaluations.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-medium">{e.suiteName}</TableCell>
                <TableCell>{e.version}</TableCell>
                <TableCell>
                  {e.score === null ? "n/a" : e.score.toFixed(2)}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={evaluationPassLabel(e.passed)}
                    intent={evaluationPassIntent(e.passed)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DetailCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <DetailCard title="Related incidents">
          {agent.incidents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No incidents recorded.
            </p>
          ) : (
            <ul className="space-y-3">
              {agent.incidents.map((i) => (
                <li
                  key={i.id}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-sm">{i.title}</span>
                  <Badge
                    variant={
                      INCIDENT_SEVERITY_INTENT[i.severity] === "destructive"
                        ? "destructive"
                        : "warning"
                    }
                  >
                    {INCIDENT_SEVERITY_LABELS[i.severity]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </DetailCard>

        <DetailCard
          title="Recent audit events"
          description="Append-only evidence"
        >
          <Timeline
            entries={agent.auditEvents.map((e) => ({
              id: e.id,
              title: e.action,
              meta: `${e.actor}`,
              timestamp: e.createdAt,
            }))}
          />
          {agent.auditEvents.length > 0 ? (
            <p className="mt-4 text-xs text-muted-foreground">
              Correlation:{" "}
              <CorrelationId value={agent.auditEvents[0]!.correlationId} />
            </p>
          ) : null}
        </DetailCard>
      </div>
    </>
  );
}
