import { prisma } from "@/lib/prisma/client";
import { clampLimit } from "./shared";

// Deployments are reached through their agent, which is tenant-scoped. Queries
// filter by the agent's organizationId to preserve tenant isolation.
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

  findById(organizationId: string, id: string) {
    return prisma.deployment.findFirst({
      where: { id, agent: { organizationId } },
      include: { agent: true, agentVersion: true },
    });
  },

  getRollbackCandidates(organizationId: string, agentId: string) {
    return prisma.deployment.findMany({
      where: { agentId, status: "SUPERSEDED", agent: { organizationId } },
      orderBy: { createdAt: "desc" },
      include: { agent: true, agentVersion: true },
    });
  },

  // Narrow status transition used inside a transaction by the workflow layer.
  setStatus(
    id: string,
    status:
      | "REQUESTED"
      | "PENDING_APPROVAL"
      | "ACTIVE"
      | "SUPERSEDED"
      | "ROLLED_BACK"
      | "BLOCKED",
    data?: { approvedBy?: string; deployedAt?: Date },
  ) {
    return prisma.deployment.update({
      where: { id },
      data: { status, ...data },
    });
  },
};
