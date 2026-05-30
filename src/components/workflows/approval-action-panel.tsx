"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/workflows/confirmation-dialog";
import { DecisionReasonField } from "@/components/workflows/decision-reason-field";
import { WorkflowResultAlert } from "@/components/workflows/workflow-result-alert";
import type { WorkflowActionResult } from "@/types/workflows";

interface ApprovalActionPanelProps {
  approvalId: string;
  canDecide: boolean;
  isPending: boolean;
}

// Client panel that drives the approve and reject workflows for a pending
// approval. Disabled when the viewer cannot decide or the request is not
// pending. Shows the workflow result, including simulated and blocked states.
export function ApprovalActionPanel({
  approvalId,
  canDecide,
  isPending,
}: ApprovalActionPanelProps) {
  const router = useRouter();
  const [reason, setReason] = React.useState("");
  const [result, setResult] = React.useState<WorkflowActionResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(path: string, body: Record<string, unknown>) {
    setError(null);
    try {
      const response = await fetch(path, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await response.json();
      if (json.success) {
        setResult(json.data as WorkflowActionResult);
        router.refresh();
      } else {
        setError(json.error?.message ?? "The action could not be completed.");
      }
    } catch {
      setError("A network error prevented the action.");
    }
  }

  if (!isPending) {
    return (
      <p className="text-sm text-muted-foreground">
        This request has been decided. Decisions are immutable; a correction is
        recorded as a new action.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {!canDecide ? (
        <p className="text-sm text-muted-foreground">
          Your role cannot decide approvals. Reviewer or Administrator required.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <ConfirmationDialog
          trigger={<Button disabled={!canDecide}>Approve</Button>}
          title="Approve request"
          description="Recording an approval is immutable evidence."
          confirmLabel="Approve"
          onConfirm={() =>
            submit(`/api/approvals/${approvalId}/approve`, { reason })
          }
        >
          <DecisionReasonField value={reason} onChange={setReason} />
        </ConfirmationDialog>

        <ConfirmationDialog
          trigger={
            <Button variant="destructive" disabled={!canDecide}>
              Reject
            </Button>
          }
          title="Reject request"
          description="A reason is required to reject."
          confirmLabel="Reject"
          destructive
          confirmDisabled={reason.trim().length === 0}
          onConfirm={() =>
            submit(`/api/approvals/${approvalId}/reject`, { reason })
          }
        >
          <DecisionReasonField value={reason} onChange={setReason} required />
        </ConfirmationDialog>
      </div>

      {result ? <WorkflowResultAlert result={result} /> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
