"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/workflows/confirmation-dialog";
import { WorkflowResultAlert } from "@/components/workflows/workflow-result-alert";
import type { WorkflowActionResult } from "@/types/workflows";

interface DeploymentActionPanelProps {
  deploymentId: string;
  canPromote: boolean;
  canRollback: boolean;
  rollbackTargetId: string | null;
}

// Client panel that drives the promote and rollback workflows for a deployment.
// Actions are disabled when the viewer lacks permission or no rollback target
// exists. The result alert shows success, pending approval, blocked, simulated,
// and error states.
export function DeploymentActionPanel({
  deploymentId,
  canPromote,
  canRollback,
  rollbackTargetId,
}: DeploymentActionPanelProps) {
  const router = useRouter();
  const [result, setResult] = React.useState<WorkflowActionResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(path: string, body?: Record<string, unknown>) {
    setError(null);
    try {
      const response = await fetch(path, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <ConfirmationDialog
          trigger={<Button disabled={!canPromote}>Promote</Button>}
          title="Promote deployment"
          description="Promotion is gated by policy. Production may require approval."
          confirmLabel="Promote"
          onConfirm={() => submit(`/api/deployments/${deploymentId}/promote`)}
        />

        <ConfirmationDialog
          trigger={
            <Button variant="outline" disabled={!canPromote}>
              Request promotion
            </Button>
          }
          title="Request promotion"
          description="Create an approval request for this promotion."
          confirmLabel="Request"
          onConfirm={() =>
            submit("/api/deployments/request-promotion", { deploymentId })
          }
        />

        <ConfirmationDialog
          trigger={
            <Button
              variant="destructive"
              disabled={!canRollback || !rollbackTargetId}
            >
              Roll back
            </Button>
          }
          title="Roll back deployment"
          description="Roll back to the prior stable deployment. The failed deployment record is preserved."
          confirmLabel="Roll back"
          destructive
          confirmDisabled={!rollbackTargetId}
          onConfirm={() =>
            submit(`/api/deployments/${deploymentId}/rollback`, {
              targetDeploymentId: rollbackTargetId,
            })
          }
        />
      </div>

      {!canPromote && !canRollback ? (
        <p className="text-sm text-muted-foreground">
          Your role cannot run deployment actions. Platform Engineer or
          Administrator required.
        </p>
      ) : null}

      {result ? <WorkflowResultAlert result={result} /> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
