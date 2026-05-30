import { prisma } from "@/lib/prisma/client";
import { clampLimit, tenantWhere } from "./shared";

export const agentRepository = {
  list(organizationId: string, limit?: number) {
    return prisma.agent.findMany({
      where: tenantWhere(organizationId),
      orderBy: { name: "asc" },
      take: clampLimit(limit),
      include: { owner: true },
    });
  },

  findById(organizationId: string, id: string) {
    return prisma.agent.findFirst({
      where: tenantWhere(organizationId, { id }),
      include: { owner: true, versions: true },
    });
  },

  count(organizationId: string) {
    return prisma.agent.count({ where: tenantWhere(organizationId) });
  },

  countByStatus(
    organizationId: string,
    status: "ACTIVE" | "DRAFT" | "PAUSED" | "ARCHIVED",
  ) {
    return prisma.agent.count({
      where: { organizationId, status },
    });
  },
};
