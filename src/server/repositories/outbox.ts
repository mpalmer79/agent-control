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

  create(input: {
    organizationId: string;
    eventType: string;
    aggregateType: string;
    aggregateId: string;
    payloadJson: object;
    correlationId: string;
  }) {
    return prisma.outboxEvent.create({
      data: {
        organizationId: input.organizationId,
        eventType: input.eventType,
        aggregateType: input.aggregateType,
        aggregateId: input.aggregateId,
        payloadJson: input.payloadJson,
        correlationId: input.correlationId,
      },
    });
  },
};
