import { prisma } from "@/lib/prisma/client";
import { clampLimit, tenantWhere } from "./shared";

export const userRepository = {
  list(organizationId: string, limit?: number) {
    return prisma.user.findMany({
      where: tenantWhere(organizationId),
      orderBy: { fullName: "asc" },
      take: clampLimit(limit),
    });
  },

  findById(organizationId: string, id: string) {
    return prisma.user.findFirst({
      where: tenantWhere(organizationId, { id }),
    });
  },

  count(organizationId: string) {
    return prisma.user.count({ where: tenantWhere(organizationId) });
  },
};
