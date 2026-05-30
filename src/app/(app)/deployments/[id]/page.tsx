import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { DemoModeBanner } from "@/components/shared/demo-mode-banner";
import { DetailCard, DetailList } from "@/components/shared/detail-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EnvironmentBadge } from "@/components/shared/environment-badge";
import { CorrelationId } from "@/components/shared/correlation-id";
import { Timeline } from "@/components/shared/timeline";
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
  APPROVAL_STATUS_INTENT,
  APPROVAL_STATUS_LABELS,
  DEPLOYMENT_STATUS_INTENT,
  DEPLOYMENT_STATUS_LABELS,
  evaluationPassIntent,
  evaluationPassLabel,
} from "@/lib/constants/status";
import { correlationIdFromHeaders } from "@/server/request";
import { getDeploymentDetail } from "@/server/views";

export const metadata: Metadata = { title: "Deployment detail" };

export default async function DeploymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const correlationId = await correlationIdFromHeaders();
  const { data: deployment, source } = await getDeploymentDetail(
    correlationId,
    id,
  );

  if (!deployment) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={`${deployment.agentName} ${deployment.version}`}
        description="Deployment overview with approval and evaluation evidence."
        actions={
          <Link
            href="/deployments"
            className="text-sm text-muted-foreground hover:underline"
          >
            Back to deployments
          </Link>
        }
      />
      <DemoModeBanner source={source} />

      <DetailCard title="Overview">
        <DetailList
          items={[
            { label: "Agent", value: deployment.agentName },
            { label: "Agent version", value: deployment.version },
            {
              label: "Prompt version",
              value: deployment.promptVersion ?? "n/a",
            },
            { label: "Model", value: deployment.model ?? "n/a" },
            {
              label: "Environment",
              value: <EnvironmentBadge environment={deployment.environment} />,
            },
            {
              label: "Status",
              value: (
                <StatusBadge
                  label={DEPLOYMENT_STATUS_LABELS[deployment.status]}
                  intent={DEPLOYMENT_STATUS_INTENT[deployment.status]}
                />
              ),
            },
            { label: "Deployed by", value: deployment.deployedBy },
            { label: "Approved by", value: deployment.approvedBy ?? "n/a" },
            {
              label: "Correlation",
              value: <CorrelationId value={deployment.correlationId} />,
            },
          ]}
        />
      </DetailCard>

      <DetailCard
        title="Approval evidence"
        description="Approvals associated with this deployment"
      >
        {deployment.approvalEvidence.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No approval was required or recorded for this deployment.
          </p>
        ) : (
          <ul className="space-y-3">
            {deployment.approvalEvidence.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium">{a.resourceLabel}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.requestedBy} to {a.assignedTo ?? "unassigned"}
                    {a.decisionReason ? `, ${a.decisionReason}` : ""}
                  </p>
                </div>
                <StatusBadge
                  label={APPROVAL_STATUS_LABELS[a.status]}
                  intent={APPROVAL_STATUS_INTENT[a.status]}
                />
              </li>
            ))}
          </ul>
        )}
      </DetailCard>

      <DetailCard
        title="Evaluation evidence"
        description="Evaluation results for this version"
      >
        {deployment.evaluationEvidence.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No evaluations recorded for this version.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Suite</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deployment.evaluationEvidence.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.suiteName}</TableCell>
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
        )}
      </DetailCard>

      <DetailCard title="Audit trail">
        <Timeline
          entries={deployment.auditEvents.map((e) => ({
            id: e.id,
            title: e.action,
            meta: e.actor,
            timestamp: e.createdAt,
          }))}
        />
      </DetailCard>

      <Alert>
        <AlertTitle>Rollback readiness</AlertTitle>
        <AlertDescription>{deployment.rollbackReadiness}</AlertDescription>
      </Alert>
    </>
  );
}
