import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { DemoModeBanner } from "@/components/shared/demo-mode-banner";
import { DetailCard, DetailList } from "@/components/shared/detail-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { ApprovalActionPanel } from "@/components/workflows/approval-action-panel";
import {
  APPROVAL_STATUS_INTENT,
  APPROVAL_STATUS_LABELS,
} from "@/lib/constants/status";
import { formatDate } from "@/lib/utils";
import { hasPermission } from "@/server/auth/permissions";
import { getPrincipal } from "@/server/auth/principal";
import { correlationIdFromHeaders } from "@/server/request";
import { getApprovalDetail } from "@/server/views";

export const metadata: Metadata = { title: "Approval detail" };

export default async function ApprovalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const correlationId = await correlationIdFromHeaders();
  const { data: approval, source } = await getApprovalDetail(correlationId, id);

  if (!approval) {
    notFound();
  }

  const principal = await getPrincipal();
  const canDecide = hasPermission(principal, "approvals:decide");

  return (
    <>
      <PageHeader
        title="Approval request"
        description={approval.resourceLabel}
        actions={
          <Link
            href="/governance"
            className="text-sm text-muted-foreground hover:underline"
          >
            Back to governance
          </Link>
        }
      />
      <DemoModeBanner source={source} />

      <DetailCard title="Overview">
        <DetailList
          items={[
            { label: "Resource", value: approval.resourceLabel },
            { label: "Resource type", value: approval.resourceType },
            { label: "Requested by", value: approval.requestedBy },
            {
              label: "Assigned to",
              value: approval.assignedTo ?? "unassigned",
            },
            {
              label: "Status",
              value: (
                <StatusBadge
                  label={APPROVAL_STATUS_LABELS[approval.status]}
                  intent={APPROVAL_STATUS_INTENT[approval.status]}
                />
              ),
            },
            {
              label: "Decision reason",
              value: approval.decisionReason ?? "n/a",
            },
            { label: "Created", value: formatDate(approval.createdAt) },
            {
              label: "Decided",
              value: approval.decidedAt
                ? formatDate(approval.decidedAt)
                : "n/a",
            },
          ]}
        />
      </DetailCard>

      <DetailCard
        title="Decision"
        description="Approve or reject this request. Decisions are immutable evidence."
      >
        <ApprovalActionPanel
          approvalId={approval.id}
          canDecide={canDecide}
          isPending={approval.status === "pending"}
        />
      </DetailCard>
    </>
  );
}
