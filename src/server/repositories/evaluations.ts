import { prisma } from "@/lib/prisma/client";
import { clampLimit } from "./shared";

// Evaluation runs are reached through an agent version, which belongs to a
// tenant-scoped agent.
export const evaluationRepository = {
  listByOrganization(organizationId: string, limit?: number) {
    return prisma.evaluationRun.findMany({
      where: { agentVersion: { agent: { organizationId } } },
      orderBy: { createdAt: "desc" },
      take: clampLimit(limit),
      include: { agentVersion: { include: { agent: true } } },
    });
  },

  countPassed(organizationId: string) {
    return prisma.evaluationRun.count({
      where: {
        agentVersion: { agent: { organizationId } },
        passed: true,
      },
    });
  },

  countCompleted(organizationId: string) {
    return prisma.evaluationRun.count({
      where: {
        agentVersion: { agent: { organizationId } },
        status: "COMPLETED",
      },
    });
  },
};
