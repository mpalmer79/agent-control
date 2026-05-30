import { prisma } from "@/lib/prisma/client";
import { clampLimit } from "./shared";

// Models are a shared registry, not tenant-owned, so they are not scoped by
// organizationId. Production gating is controlled by enabledForProduction.
export const modelRepository = {
  list(limit?: number) {
    return prisma.model.findMany({
      orderBy: { displayName: "asc" },
      take: clampLimit(limit),
      include: { provider: true },
    });
  },

  findById(id: string) {
    return prisma.model.findUnique({
      where: { id },
      include: { provider: true },
    });
  },

  count() {
    return prisma.model.count();
  },
};
