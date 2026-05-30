import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { DemoModeBanner } from "@/components/shared/demo-mode-banner";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { EnvironmentBadge } from "@/components/shared/environment-badge";
import { CorrelationId } from "@/components/shared/correlation-id";
import { Badge } from "@/components/ui/badge";
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
  DEPLOYMENT_STATUS_INTENT,
  DEPLOYMENT_STATUS_LABELS,
} from "@/lib/constants/status";
import { formatDate } from "@/lib/utils";
import { correlationIdFromHeaders } from "@/server/request";
import { listDeployments } from "@/server/views";

export const metadata: Metadata = { title: "Deployments" };

export default async function DeploymentsPage() {
  const correlationId = await correlationIdFromHeaders();
  const { data: deployments, source } = await listDeployments(correlationId);

  return (
    <>
      <PageHeader
        title="Deployments"
        description="Promotion and rollback history across development, staging, and production."
      />
      <DemoModeBanner source={source} />

      {deployments.length === 0 ? (
        <EmptyState title="No deployments yet" />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deployed by</TableHead>
                  <TableHead>Approved by</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead>Correlation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deployments.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/deployments/${d.id}`}
                        className="hover:underline"
                      >
                        {d.agentName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {d.version}
                      {d.isRollbackCandidate ? (
                        <Badge variant="outline" className="ml-2">
                          Rollback target
                        </Badge>
                      ) : null}
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
                      {d.approvedBy ?? "n/a"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {d.deployedAt ? formatDate(d.deployedAt) : "n/a"}
                    </TableCell>
                    <TableCell>
                      <CorrelationId value={d.correlationId} />
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
