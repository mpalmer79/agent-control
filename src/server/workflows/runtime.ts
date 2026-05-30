// Workflow runtime helpers.
//
// Shared logic for governed mutations: deciding whether to persist (database
// configured) or simulate (demo mode), and recording audit and outbox evidence
// when persisting. Keeps the workflow services free of branching boilerplate.

import { isDatabaseConfigured } from "@/lib/config/env";
import { logger } from "@/lib/observability/logger";
import type {
  PolicyDecision,
  WorkflowAction,
  WorkflowActionResult,
  WorkflowStatus,
  AffectedResource,
} from "@/types/workflows";

export function isPersistenceEnabled(): boolean {
  return isDatabaseConfigured();
}

interface ResultInput {
  action: WorkflowAction;
  status: WorkflowStatus;
  message: string;
  correlationId: string;
  policyDecision: PolicyDecision;
  affectedResource?: AffectedResource;
  auditEventId?: string;
  outboxEventId?: string;
}

export function buildResult(input: ResultInput): WorkflowActionResult {
  const simulated = input.status === "simulated";
  return {
    action: input.action,
    status: input.status,
    message: input.message,
    correlationId: input.correlationId,
    policyDecision: input.policyDecision,
    affectedResource: input.affectedResource,
    // Persisted evidence IDs are only present when actually persisted.
    auditEventId: simulated ? undefined : input.auditEventId,
    outboxEventId: simulated ? undefined : input.outboxEventId,
    simulated,
  };
}

// Build a blocked result. No mutation occurs and no outbox event is created.
export function blockedResult(
  action: WorkflowAction,
  correlationId: string,
  policyDecision: PolicyDecision,
  affectedResource?: AffectedResource,
): WorkflowActionResult {
  const message =
    policyDecision.blockingIssues[0]?.message ??
    "The action was blocked by policy.";
  logger.info("workflow blocked by policy", {
    correlationId,
    action,
    blockingIssues: policyDecision.blockingIssues.map((i) => i.code),
  });
  return buildResult({
    action,
    status: "blocked",
    message,
    correlationId,
    policyDecision,
    affectedResource,
  });
}

// Log a workflow outcome with its correlation ID.
export function logWorkflow(
  action: WorkflowAction,
  status: WorkflowStatus,
  correlationId: string,
): void {
  logger.info("workflow action", { action, status, correlationId });
}
