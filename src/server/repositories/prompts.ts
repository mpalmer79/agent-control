import { prisma } from "@/lib/prisma/client";
import { clampLimit, tenantWhere } from "./shared";

export const promptRepository = {
  list(organizationId: string, limit?: number) {
    return prisma.prompt.findMany({
      where: tenantWhere(organizationId),
      orderBy: { name: "asc" },
      take: clampLimit(limit),
      include: { versions: { orderBy: { createdAt: "desc" } } },
    });
  },

  findById(organizationId: string, id: string) {
    return prisma.prompt.findFirst({
      where: tenantWhere(organizationId, { id }),
      include: { versions: { orderBy: { createdAt: "desc" } } },
    });
  },

  count(organizationId: string) {
    return prisma.prompt.count({ where: tenantWhere(organizationId) });
  },
};
