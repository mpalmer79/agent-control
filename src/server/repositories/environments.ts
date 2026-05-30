import { prisma } from "@/lib/prisma/client";
import { tenantWhere } from "./shared";

export const environmentRepository = {
  list(organizationId: string) {
    return prisma.environment.findMany({
      where: tenantWhere(organizationId),
      orderBy: { name: "asc" },
    });
  },

  count(organizationId: string) {
    return prisma.environment.count({ where: tenantWhere(organizationId) });
  },
};
