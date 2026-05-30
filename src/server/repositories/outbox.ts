import { prisma } from "@/lib/prisma/client";
import { clampLimit } from "./shared";
import { db, type Db } from "./types";

// Outbox events are append-only on the producer side. A background publisher
// reads pending rows and marks them published in later phases. The create
// accepts an optional transaction client so the event is written atomically
// with the workflow state change.
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

  create(
    input: {
      organizationId: string;
      eventType: string;
      aggregateType: string;
      aggregateId: string;
      payloadJson: object;
      correlationId: string;
    },
    tx?: Db,
  ) {
    return db(tx).outboxEvent.create({
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
