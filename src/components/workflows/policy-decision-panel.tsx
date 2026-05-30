import { CheckCircle2 } from "lucide-react";

import { DetailCard } from "@/components/shared/detail-card";
import { BlockingIssuesList } from "@/components/workflows/blocking-issues-list";
import type { PolicyDecision } from "@/types/workflows";

// Shows a policy decision: whether it is allowed, required approvals, blocking
// issues, warnings, and any reasons.
export function PolicyDecisionPanel({
  decision,
}: {
  decision: PolicyDecision;
}) {
  const allIssues = [...decision.blockingIssues, ...decision.warnings];
  return (
    <DetailCard title="Policy decision">
      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-2">
          {decision.allowed ? (
            <>
              <CheckCircle2
                className="h-4 w-4 text-success"
                aria-hidden="true"
              />
              <span>Allowed by policy.</span>
            </>
          ) : (
            <span className="font-medium text-destructive">
              Blocked by policy.
            </span>
          )}
        </div>
        {decision.requiredApprovals > 0 ? (
          <p className="text-muted-foreground">
            Required approvals: {decision.requiredApprovals}
          </p>
        ) : null}
        <BlockingIssuesList issues={allIssues} />
        {decision.reasons.length > 0 ? (
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            {decision.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </DetailCard>
  );
}
