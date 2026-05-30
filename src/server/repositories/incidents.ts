import { prisma } from "@/lib/prisma/client";
import { clampLimit, tenantWhere } from "./shared";

export const incidentRepository = {
  list(organizationId: string, limit?: number) {
    return prisma.incident.findMany({
      where: tenantWhere(organizationId),
      orderBy: { createdAt: "desc" },
      take: clampLimit(limit),
      include: { agent: true },
    });
  },

  countOpen(organizationId: string) {
    return prisma.incident.count({
      where: { organizationId, status: "OPEN" },
    });
  },
};
