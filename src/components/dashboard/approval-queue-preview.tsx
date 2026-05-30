import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { demoApprovals } from "@/lib/mock/demo-data";
import {
  APPROVAL_STATUS_INTENT,
  APPROVAL_STATUS_LABELS,
} from "@/lib/constants/status";

export function ApprovalQueuePreview() {
  const pending = demoApprovals.filter((a) => a.status === "pending");
  const items = pending.length > 0 ? pending : demoApprovals.slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval queue</CardTitle>
        <CardDescription>Requests awaiting a reviewer decision</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((approval) => (
          <div
            key={approval.id}
            className="flex items-start justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
          >
            <div className="space-y-1">
              <p className="text-sm font-medium">{approval.resourceLabel}</p>
              <p className="text-xs text-muted-foreground">
                Requested by {approval.requestedBy}, assigned to{" "}
                {approval.assignedTo}
              </p>
            </div>
            <StatusBadge
              label={APPROVAL_STATUS_LABELS[approval.status]}
              intent={APPROVAL_STATUS_INTENT[approval.status]}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
