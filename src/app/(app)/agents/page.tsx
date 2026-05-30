import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { DemoModeBanner } from "@/components/shared/demo-mode-banner";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { RiskBadge } from "@/components/shared/risk-badge";
import { EnvironmentBadge } from "@/components/shared/environment-badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { listAgents } from "@/server/views";

export const metadata: Metadata = { title: "Agents" };

export default async function AgentsPage() {
  const correlationId = await correlationIdFromHeaders();
  const { data: agents, source } = await listAgents(correlationId);

  return (
    <>
      <PageHeader
        title="Agents"
        description="Registry of managed agents with status, risk, ownership, and operational health."
      />
      <DemoModeBanner source={source} />

      {agents.length === 0 ? (
        <EmptyState
          title="No agents yet"
          description="Seed the demo data to populate the registry."
        />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Active model</TableHead>
                  <TableHead>Prompt</TableHead>
                  <TableHead>Eval pass</TableHead>
                  <TableHead>Incidents</TableHead>
                  <TableHead>Monthly cost</TableHead>
                  <TableHead>Last activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/agents/${agent.id}`}
                        className="hover:underline"
                      >
                        {agent.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={AGENT_STATUS_LABELS[agent.status]}
                        intent={AGENT_STATUS_INTENT[agent.status]}
                      />
                    </TableCell>
                    <TableCell>
                      <RiskBadge riskLevel={agent.riskLevel} />
                    </TableCell>
                    <TableCell>
                      <EnvironmentBadge environment={agent.environment} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {agent.activeModel}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {agent.activePromptVersion}
                    </TableCell>
                    <TableCell>
                      {formatPercent(agent.evaluationPassRate)}
                    </TableCell>
                    <TableCell>{agent.openIncidents}</TableCell>
                    <TableCell>
                      {formatCurrency(agent.estimatedMonthlyCost)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {agent.lastActivity
                        ? formatDate(agent.lastActivity)
                        : "n/a"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
