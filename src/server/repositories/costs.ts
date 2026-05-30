import { prisma } from "@/lib/prisma/client";
import { clampLimit, tenantWhere } from "./shared";

// Cost records are append-only.
export const costRepository = {
  list(organizationId: string, limit?: number) {
    return prisma.costRecord.findMany({
      where: tenantWhere(organizationId),
      orderBy: { createdAt: "desc" },
      take: clampLimit(limit),
    });
  },

  sumEstimatedCost(organizationId: string) {
    return prisma.costRecord.aggregate({
      where: tenantWhere(organizationId),
      _sum: { estimatedCost: true },
    });
  },
};
