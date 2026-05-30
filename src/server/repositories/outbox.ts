import { prisma } from "@/lib/prisma/client";
import { clampLimit } from "./shared";

// Outbox events are append-only on the producer side. A background publisher
// reads pending rows and marks them published in later phases.
export const outboxRepository = {
  listPending(organizationId: string, limit?: number) {
    return prisma.outboxEvent.findMany({
      where: { organizationId, status: "PENDING" },
      orderBy: { occurredAt: "asc" },
      take: clampLimit(limit),
    });
  },

  countPending(organizationId: string) {
    return prisma.outboxEvent.count({
      where: { organizationId, status: "PENDING" },
    });
  },
};
