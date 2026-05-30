import { getDemoContext } from "@/server/context";
import { load } from "@/server/data-source";
import { logger } from "@/lib/observability/logger";
import { NotFoundError, toAppError } from "@/lib/errors";
import { mapApproval } from "@/server/mappers";
import { mockApprovals } from "@/server/mock-source";
import {
  approvalRepository,
  auditRepository,
  outboxRepository,
} from "@/server/repositories";
import { resolveOrganizationId } from "@/server/resolve-org";
import { requirePermission } from "@/server/auth/permissions";
import { getPrincipal } from "@/server/auth/principal";
import { evaluateApprovalDecision } from "@/server/modules/governance/policy-engine";
import {
  approvalDecisionFacts,
  findSeedApproval,
} from "@/server/workflows/facts";
import {
  blockedResult,
  buildResult,
  isPersistenceEnabled,
} from "@/server/workflows/runtime";
import type { ApprovalDecisionResult } from "@/types/workflows";

export function listApprovals(correlationId: string) {
  const ctx = getDemoContext(correlationId);
  return load(
    correlationId,
    async () => {
      const organizationId = await resolveOrganizationId(ctx.organizationSlug);
      const rows = await approvalRepository.list(organizationId);
      return rows.map(mapApproval);
    },
    () => mockApprovals(),
  );
}

export async function getApprovalSummary(correlationId: string) {
  const { data, source } = await listApprovals(correlationId);
  const pending = data.filter((a) => a.status === "pending").length;
  return { data: { total: data.length, pending }, source };
}

interface DecisionInput {
  approvalId: string;
  reason?: string;
}

// Approve or reject a pending approval. Resolves the principal, enforces the
// decide permission, evaluates policy, and (when persistence is enabled) records
// the decision with audit and outbox evidence in a transaction. In demo mode
// the result is clearly marked simulated and no evidence IDs are claimed.
async function decideApproval(
  correlationId: string,
  input: DecisionInput,
  isRejection: boolean,
): Promise<ApprovalDecisionResult> {
  const principal = await getPrincipal();
  requirePermission(principal, "approvals:decide");

  const action = isRejection ? "approval.reject" : "approval.approve";
  const facts = approvalDecisionFacts(
    input.approvalId,
    isRejection,
    input.reason,
  );
  const decision = evaluateApprovalDecision(facts);

  const seed = findSeedApproval(input.approvalId);
  const affectedResource = seed
    ? { type: "approval", id: seed.key, label: seed.resourceLabel }
    : undefined;

  if (!decision.allowed) {
    return blockedResult(action, correlationId, decision, affectedResource);
  }

  const status = isRejection ? "REJECTED" : "APPROVED";
  const message = isRejection
    ? "Approval request rejected."
    : "Approval request approved.";

  if (!isPersistenceEnabled()) {
    logger.info("approval decision simulated", { correlationId, action });
    return buildResult({
      action,
      status: "simulated",
      message: `${message} (simulated, no database configured)`,
      correlationId,
      policyDecision: decision,
      affectedResource,
    });
  }

  try {
    const organizationId = await resolveOrganizationId(
      principal.organizationSlug,
    );
    const existing = await approvalRepository.findById(
      organizationId,
      input.approvalId,
    );
    if (!existing) {
      throw new NotFoundError("Approval request not found");
    }

    const updated = await approvalRepository.recordDecision(
      organizationId,
      input.approvalId,
      status,
      input.reason ?? null,
    );
    if (updated.count === 0) {
      // Another decision won the race; treat as already decided.
      return blockedResult(
        action,
        correlationId,
        evaluateApprovalDecision({ ...facts, isPending: false }),
        affectedResource,
      );
    }

    const audit = await auditRepository.create({
      organizationId,
      actorUserId: null,
      action: isRejection ? "approval.rejected" : "approval.approved",
      resourceType: "approval",
      resourceId: input.approvalId,
      correlationId,
      previousStateJson: { status: "PENDING" },
      newStateJson: { status, decisionReason: input.reason ?? null },
    });

    const outbox = await outboxRepository.create({
      organizationId,
      eventType: isRejection ? "ApprovalRejected" : "ApprovalApproved",
      aggregateType: "approval",
      aggregateId: input.approvalId,
      payloadJson: {
        approval_id: input.approvalId,
        status: status.toLowerCase(),
        decision_reason: input.reason ?? null,
      },
      correlationId,
    });

    return buildResult({
      action,
      status: "success",
      message,
      correlationId,
      policyDecision: decision,
      affectedResource,
      auditEventId: audit.id,
      outboxEventId: outbox.id,
    });
  } catch (error) {
    throw toAppError(error);
  }
}

export function approveApproval(
  correlationId: string,
  approvalId: string,
  reason?: string,
): Promise<ApprovalDecisionResult> {
  return decideApproval(correlationId, { approvalId, reason }, false);
}

export function rejectApproval(
  correlationId: string,
  approvalId: string,
  reason: string,
): Promise<ApprovalDecisionResult> {
  return decideApproval(correlationId, { approvalId, reason }, true);
}
