import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { DemoModeBanner } from "@/components/shared/demo-mode-banner";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { RiskBadge } from "@/components/shared/risk-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/lib/constants/status";
import { formatDate } from "@/lib/utils";
import { correlationIdFromHeaders } from "@/server/request";
import { getApprovalSummary, listApprovals } from "@/server/views";

export const metadata: Metadata = { title: "Governance" };

export default async function GovernancePage() {
  const correlationId = await correlationIdFromHeaders();
  const [{ data: summary, source }, { data: approvals }] = await Promise.all([
    getApprovalSummary(correlationId),
    listApprovals(correlationId),
  ]);

  const summaryCards = [
    { label: "Total", value: summary.total },
    { label: "Pending", value: summary.pending },
    { label: "Approved", value: summary.approved },
    { label: "Rejected", value: summary.rejected },
  ];

  return (
    <>
      <PageHeader
        title="Governance"
        description="Approval queue, decisions, and risk distribution. High-risk actions fail closed."
      />
      <DemoModeBanner source={source} />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Alert>
        <AlertTitle>Policy enforcement</AlertTitle>
        <AlertDescription>
          Production deployments must satisfy approved prompt and model gates,
          passing evaluations, no unresolved critical policy violations, and
          required human approval. Approve and reject actions arrive in Phase 4.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Risk distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-6">
          {summary.riskDistribution.map((entry) => (
            <div key={entry.riskLevel} className="flex items-center gap-2">
              <RiskBadge riskLevel={entry.riskLevel} />
              <span className="text-sm text-muted-foreground">
                {entry.count}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <SectionHeader
          title="Approval queue"
          description="Pending and decided approval requests"
        />
        {approvals.length === 0 ? (
          <EmptyState title="No approvals" />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource</TableHead>
                    <TableHead>Requested by</TableHead>
                    <TableHead>Assigned to</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvals.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">
                        {a.resourceLabel}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {a.requestedBy}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {a.assignedTo ?? "unassigned"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          label={APPROVAL_STATUS_LABELS[a.status]}
                          intent={APPROVAL_STATUS_INTENT[a.status]}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {a.decisionReason ?? "n/a"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(a.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
