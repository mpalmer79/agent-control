import { prisma } from "@/lib/prisma/client";
import { clampLimit, tenantWhere } from "./shared";

export const approvalRepository = {
  list(organizationId: string, limit?: number) {
    return prisma.approval.findMany({
      where: tenantWhere(organizationId),
      orderBy: { createdAt: "desc" },
      take: clampLimit(limit),
      include: { requester: true, assignee: true },
    });
  },

  countPending(organizationId: string) {
    return prisma.approval.count({
      where: { organizationId, status: "PENDING" },
    });
  },
};
