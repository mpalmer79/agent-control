import { prisma } from "@/lib/prisma/client";
import { clampLimit } from "./shared";
import { db, type Db } from "./types";

type DeploymentStatusValue =
  | "REQUESTED"
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "SUPERSEDED"
  | "ROLLED_BACK"
  | "BLOCKED";

// Deployments are reached through their agent, which is tenant-scoped. Queries
// filter by the agent's organizationId to preserve tenant isolation. Mutation
// helpers accept an optional transaction client so they run atomically with the
// audit and outbox writes in a workflow.
export const deploymentRepository = {
  listByOrganization(organizationId: string, limit?: number) {
    return prisma.deployment.findMany({
      where: { agent: { organizationId } },
      orderBy: { createdAt: "desc" },
      take: clampLimit(limit),
      include: { agent: true, agentVersion: true },
    });
  },

  getRecent(organizationId: string, limit = 5) {
    return prisma.deployment.findMany({
      where: { agent: { organizationId } },
      orderBy: { createdAt: "desc" },
      take: clampLimit(limit),
      include: { agent: true, agentVersion: true },
    });
  },

  countActive(organizationId: string) {
    return prisma.deployment.count({
      where: { agent: { organizationId }, status: "ACTIVE" },
    });
  },

  findById(organizationId: string, id: string, tx?: Db) {
    return db(tx).deployment.findFirst({
      where: { id, agent: { organizationId } },
      include: { agent: true, agentVersion: true },
    });
  },

  // Read a deployment with the relations needed to evaluate promotion gates:
  // the agent (status, risk), the agent version with its prompt version status
  // and model production flag, and the version's evaluation runs.
  findByIdWithGates(organizationId: string, id: string, tx?: Db) {
    return db(tx).deployment.findFirst({
      where: { id, agent: { organizationId } },
      include: {
        agent: true,
        agentVersion: {
          include: {
            promptVersion: true,
            model: true,
            evaluationRuns: true,
          },
        },
      },
    });
  },

  getRollbackCandidates(organizationId: string, agentId: string) {
    return prisma.deployment.findMany({
      where: { agentId, status: "SUPERSEDED", agent: { organizationId } },
      orderBy: { createdAt: "desc" },
      include: { agent: true, agentVersion: true },
    });
  },

  // Mark a deployment pending approval. Organization scope is verified by the
  // caller via findById before this runs inside the transaction.
  markPendingApproval(id: string, tx?: Db) {
    return db(tx).deployment.update({
      where: { id },
      data: { status: "PENDING_APPROVAL" },
    });
  },

  // Mark a deployment active and record who approved and when.
  markActive(
    id: string,
    data: { approvedBy?: string | null; deployedAt?: Date },
    tx?: Db,
  ) {
    return db(tx).deployment.update({
      where: { id },
      data: {
        status: "ACTIVE",
        approvedBy: data.approvedBy ?? undefined,
        deployedAt: data.deployedAt ?? new Date(),
      },
    });
  },

  // Mark a deployment rolled back, recording the deployment it was rolled back
  // from. The record is preserved, never deleted.
  markRolledBack(id: string, rollbackFromDeployment: string, tx?: Db) {
    return db(tx).deployment.update({
      where: { id },
      data: { status: "ROLLED_BACK", rollbackFromDeployment },
    });
  },

  // Supersede the currently active deployment(s) for an agent and environment,
  // excluding the deployment being promoted. Tenant-scoped through the agent.
  // Returns the number of rows updated.
  supersedeActiveForAgentEnvironment(
    organizationId: string,
    agentId: string,
    environment: "DEVELOPMENT" | "STAGING" | "PRODUCTION",
    exceptDeploymentId: string,
    tx?: Db,
  ) {
    return db(tx).deployment.updateMany({
      where: {
        agentId,
        environment,
        status: "ACTIVE",
        id: { not: exceptDeploymentId },
        agent: { organizationId },
      },
      data: { status: "SUPERSEDED" },
    });
  },

  // Narrow status transition used inside a transaction by the workflow layer.
  setStatus(
    id: string,
    status: DeploymentStatusValue,
    data?: { approvedBy?: string; deployedAt?: Date },
    tx?: Db,
  ) {
    return db(tx).deployment.update({
      where: { id },
      data: { status, ...data },
    });
  },
};
