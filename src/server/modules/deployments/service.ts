import { getDemoContext } from "@/server/context";
import { load } from "@/server/data-source";
import { logger } from "@/lib/observability/logger";
import { NotFoundError, toAppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma/client";
import { mapDeployment } from "@/server/mappers";
import { mockDeployments } from "@/server/mock-source";
import {
  auditRepository,
  deploymentRepository,
  outboxRepository,
} from "@/server/repositories";
import { resolveOrganizationId } from "@/server/resolve-org";
import { requirePermission } from "@/server/auth/permissions";
import { getPrincipal } from "@/server/auth/principal";
import {
  evaluatePromotion,
  evaluateRollback,
} from "@/server/modules/governance/policy-engine";
import {
  findSeedDeployment,
  rollbackCandidatesForAgent,
} from "@/server/workflows/facts";
import {
  dbPromotionFacts,
  dbRollbackFacts,
  seedPromotionFacts,
  seedRollbackFacts,
} from "@/server/workflows/fact-source";
import {
  blockedResult,
  buildResult,
  isPersistenceEnabled,
} from "@/server/workflows/runtime";
import type {
  DeploymentPromotionResult,
  DeploymentRollbackResult,
  WorkflowActionResult,
} from "@/types/workflows";

export function listDeployments(correlationId: string) {
  const ctx = getDemoContext(correlationId);
  return load(
    correlationId,
    async () => {
      const organizationId = await resolveOrganizationId(ctx.organizationSlug);
      const rows =
        await deploymentRepository.listByOrganization(organizationId);
      return rows.map(mapDeployment);
    },
    () => mockDeployments(),
  );
}

export function getRecentDeployments(correlationId: string, limit = 5) {
  const ctx = getDemoContext(correlationId);
  return load(
    correlationId,
    async () => {
      const organizationId = await resolveOrganizationId(ctx.organizationSlug);
      const rows = await deploymentRepository.getRecent(organizationId, limit);
      return rows.map(mapDeployment);
    },
    () => mockDeployments().slice(0, limit),
  );
}

export async function getDeploymentSummary(correlationId: string) {
  const { data, source } = await listDeployments(correlationId);
  const active = data.filter((d) => d.status === "active").length;
  const pending = data.filter((d) => d.status === "pending_approval").length;
  return { data: { total: data.length, active, pending }, source };
}

// ---------------------------------------------------------------------------
// Workflow actions
// ---------------------------------------------------------------------------

interface PromotionInput {
  deploymentId: string;
  request?: boolean;
}

// Promote a deployment, or request promotion. Enforces the promote permission,
// evaluates the promotion policy, and either blocks, returns pending_approval
// (production without a recorded approval), or promotes. Persisted promotions
// supersede the prior active production deployment and record audit and outbox
// evidence. Demo mode returns a clearly simulated result.
export async function promoteDeployment(
  correlationId: string,
  input: PromotionInput,
): Promise<DeploymentPromotionResult> {
  const principal = await getPrincipal();
  requirePermission(
    principal,
    input.request ? "deployments:request" : "deployments:promote",
  );

  const action = input.request
    ? "deployment.request_promotion"
    : "deployment.promote";
  const persistence = isPersistenceEnabled();
  const organizationId = persistence
    ? await resolveOrganizationId(principal.organizationSlug)
    : null;
  const facts =
    persistence && organizationId
      ? await dbPromotionFacts(organizationId, input.deploymentId)
      : seedPromotionFacts(input.deploymentId);
  const decision = evaluatePromotion(facts);
  decision.action = action;

  const seed = findSeedDeployment(input.deploymentId);
  const affectedResource = seed
    ? {
        type: "deployment",
        id: seed.key,
        label: `${seed.agentKey} ${seed.version}`,
      }
    : undefined;

  if (!decision.allowed) {
    return blockedResult(action, correlationId, decision, affectedResource);
  }

  // Production promotion without a recorded approval routes to pending approval
  // rather than promoting directly.
  const needsApproval =
    facts.environment === "production" && !facts.hasRecordedApproval;
  if (needsApproval || input.request) {
    const message = input.request
      ? "Promotion requested. Awaiting human approval."
      : "Promotion requires human approval. An approval request is pending.";
    if (!isPersistenceEnabled()) {
      return buildResult({
        action,
        status: "simulated",
        message: `${message} (simulated, no database configured)`,
        correlationId,
        policyDecision: decision,
        affectedResource,
      });
    }
    return persistWorkflow({
      action,
      status: "pending_approval",
      message,
      correlationId,
      decision,
      affectedResource,
      auditAction: "deployment.promotion_requested",
      eventType: "DeploymentPromotionRequested",
      deploymentId: input.deploymentId,
      transition: "pending_approval",
      newState: { status: "PENDING_APPROVAL" },
    });
  }

  const message = "Deployment promoted.";
  if (!isPersistenceEnabled()) {
    return buildResult({
      action,
      status: "simulated",
      message: `${message} (simulated, no database configured)`,
      correlationId,
      policyDecision: decision,
      affectedResource,
    });
  }
  return persistWorkflow({
    action,
    status: "success",
    message,
    correlationId,
    decision,
    affectedResource,
    auditAction: "deployment.promoted",
    eventType: "DeploymentPromoted",
    deploymentId: input.deploymentId,
    transition: "promote",
    newState: { status: "ACTIVE" },
  });
}

interface RollbackInput {
  deploymentId: string;
  targetDeploymentId: string;
}

// Roll back to a prior stable deployment. Enforces the rollback permission and
// evaluates the rollback policy. The failed deployment record is preserved; the
// target is made active and audit and outbox evidence is recorded.
export async function rollbackDeployment(
  correlationId: string,
  input: RollbackInput,
): Promise<DeploymentRollbackResult> {
  const principal = await getPrincipal();
  requirePermission(principal, "deployments:rollback");

  const persistence = isPersistenceEnabled();
  const organizationId = persistence
    ? await resolveOrganizationId(principal.organizationSlug)
    : null;
  const current = findSeedDeployment(input.deploymentId);
  const agentKey = current?.agentKey ?? "";
  const facts =
    persistence && organizationId
      ? await dbRollbackFacts(
          organizationId,
          input.deploymentId,
          input.targetDeploymentId,
        )
      : seedRollbackFacts(input.targetDeploymentId, agentKey);
  const decision = evaluateRollback(facts);

  const target = findSeedDeployment(input.targetDeploymentId);
  const affectedResource = target
    ? {
        type: "deployment",
        id: target.key,
        label: `${target.agentKey} ${target.version}`,
      }
    : undefined;

  if (!decision.allowed) {
    return blockedResult(
      "deployment.rollback",
      correlationId,
      decision,
      affectedResource,
    );
  }

  const message = "Rolled back to the prior stable deployment.";
  if (!isPersistenceEnabled()) {
    return buildResult({
      action: "deployment.rollback",
      status: "simulated",
      message: `${message} (simulated, no database configured)`,
      correlationId,
      policyDecision: decision,
      affectedResource,
    });
  }
  return persistWorkflow({
    action: "deployment.rollback",
    status: "success",
    message,
    correlationId,
    decision,
    affectedResource,
    auditAction: "deployment.rolled_back",
    eventType: "DeploymentRolledBack",
    deploymentId: input.targetDeploymentId,
    transition: "rollback",
    newState: { status: "ACTIVE" },
    rolledBackFrom: input.deploymentId,
  });
}

export function getRollbackCandidates(correlationId: string, agentKey: string) {
  return load(
    correlationId,
    async () => {
      // Database assembly of rollback candidates joins through the agent and
      // arrives with the database-backed workflow path; the lean repository
      // read is available via deploymentRepository.getRollbackCandidates.
      return rollbackCandidatesForAgent(agentKey);
    },
    () => rollbackCandidatesForAgent(agentKey),
  );
}

// The persisted state transition a workflow performs. The deployment record is
// actually changed, not just evidenced:
// - pending_approval: the deployment moves to PENDING_APPROVAL.
// - promote: the deployment becomes ACTIVE and prior active deployments for the
//   same agent and environment are superseded.
// - rollback: the target becomes ACTIVE, prior active deployments are
//   superseded, and the rolled-back-from deployment is marked ROLLED_BACK
//   (preserved, never deleted).
type Transition = "pending_approval" | "promote" | "rollback";

interface PersistInput {
  action: WorkflowActionResult["action"];
  status: WorkflowActionResult["status"];
  message: string;
  correlationId: string;
  decision: DeploymentPromotionResult["policyDecision"];
  affectedResource?: WorkflowActionResult["affectedResource"];
  auditAction: string;
  eventType: string;
  // The deployment whose state changes (the target being activated for
  // promotion and rollback).
  deploymentId: string;
  transition: Transition;
  newState: Record<string, unknown>;
  // For rollback, the deployment being rolled back from (preserved).
  rolledBackFrom?: string;
}

// Persist a workflow state transition with audit and outbox evidence in a
// single Prisma transaction. The deployment state change, the append-only audit
// event, and the pending outbox event all commit together or not at all.
async function persistWorkflow(
  input: PersistInput,
): Promise<WorkflowActionResult> {
  try {
    const principal = await getPrincipal();
    const organizationId = await resolveOrganizationId(
      principal.organizationSlug,
    );

    // Verify existence and tenant scope before the transaction.
    const deployment = await deploymentRepository.findById(
      organizationId,
      input.deploymentId,
    );
    if (!deployment) {
      throw new NotFoundError("Deployment not found");
    }

    const evidence = await prisma.$transaction(async (tx) => {
      // Apply the actual state change.
      if (input.transition === "pending_approval") {
        await deploymentRepository.markPendingApproval(input.deploymentId, tx);
      } else if (input.transition === "promote") {
        await deploymentRepository.supersedeActiveForAgentEnvironment(
          organizationId,
          deployment.agentId,
          deployment.environment,
          input.deploymentId,
          tx,
        );
        await deploymentRepository.markActive(
          input.deploymentId,
          { approvedBy: principal.userId },
          tx,
        );
      } else {
        // rollback: activate the target, supersede other active deployments,
        // and preserve the rolled-back-from record by marking it ROLLED_BACK.
        await deploymentRepository.supersedeActiveForAgentEnvironment(
          organizationId,
          deployment.agentId,
          deployment.environment,
          input.deploymentId,
          tx,
        );
        await deploymentRepository.markActive(
          input.deploymentId,
          { approvedBy: principal.userId },
          tx,
        );
        if (input.rolledBackFrom) {
          await deploymentRepository.markRolledBack(
            input.rolledBackFrom,
            input.deploymentId,
            tx,
          );
        }
      }

      const audit = await auditRepository.create(
        {
          organizationId,
          actorUserId: null,
          action: input.auditAction,
          resourceType: "deployment",
          resourceId: input.deploymentId,
          correlationId: input.correlationId,
          previousStateJson: { status: deployment.status },
          newStateJson: input.newState,
        },
        tx,
      );

      const outbox = await outboxRepository.create(
        {
          organizationId,
          eventType: input.eventType,
          aggregateType: "deployment",
          aggregateId: input.deploymentId,
          payloadJson: {
            deployment_id: input.deploymentId,
            ...(input.rolledBackFrom
              ? { rolled_back_from_deployment_id: input.rolledBackFrom }
              : {}),
          },
          correlationId: input.correlationId,
        },
        tx,
      );

      return { auditId: audit.id, outboxId: outbox.id };
    });

    logger.info("deployment workflow persisted", {
      correlationId: input.correlationId,
      action: input.action,
      status: input.status,
    });

    return buildResult({
      action: input.action,
      status: input.status,
      message: input.message,
      correlationId: input.correlationId,
      policyDecision: input.decision,
      affectedResource: input.affectedResource,
      auditEventId: evidence.auditId,
      outboxEventId: evidence.outboxId,
    });
  } catch (error) {
    throw toAppError(error);
  }
}
