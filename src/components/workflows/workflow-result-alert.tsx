import {
  CheckCircle2,
  CircleSlash,
  Clock,
  FlaskConical,
  XCircle,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CorrelationId } from "@/components/shared/correlation-id";
import type { WorkflowActionResult } from "@/types/workflows";

const TITLES: Record<WorkflowActionResult["status"], string> = {
  success: "Action completed",
  blocked: "Action blocked by policy",
  pending_approval: "Awaiting approval",
  failed: "Action failed",
  simulated: "Simulated action",
};

// Renders the outcome of a workflow action with the correct intent and the
// correlation ID. Used by the approval and deployment action panels.
export function WorkflowResultAlert({
  result,
}: {
  result: WorkflowActionResult;
}) {
  const variant =
    result.status === "blocked" || result.status === "failed"
      ? "destructive"
      : result.status === "pending_approval" || result.status === "simulated"
        ? "warning"
        : "default";

  const Icon =
    result.status === "success"
      ? CheckCircle2
      : result.status === "blocked"
        ? CircleSlash
        : result.status === "failed"
          ? XCircle
          : result.status === "simulated"
            ? FlaskConical
            : Clock;

  return (
    <Alert variant={variant}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{TITLES[result.status]}</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{result.message}</p>
        {result.policyDecision.blockingIssues.length > 0 ? (
          <ul className="list-disc space-y-1 pl-5">
            {result.policyDecision.blockingIssues.map((issue) => (
              <li key={issue.code}>{issue.message}</li>
            ))}
          </ul>
        ) : null}
        <p className="text-xs">
          Correlation <CorrelationId value={result.correlationId} />
          {result.auditEventId ? (
            <span className="ml-2">Audit event recorded.</span>
          ) : null}
          {result.outboxEventId ? (
            <span className="ml-1">Outbox event created.</span>
          ) : null}
        </p>
      </AlertDescription>
    </Alert>
  );
}
