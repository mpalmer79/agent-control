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
};
