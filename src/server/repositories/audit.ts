import { prisma } from "@/lib/prisma/client";
import { clampLimit, tenantWhere } from "./shared";
import { db, type Db } from "./types";

// Audit events are append-only. This repository exposes reads and a guarded
// create. There is no update or delete by design. The create accepts an
// optional transaction client so it can be written atomically with a workflow
// state change.
export const auditRepository = {
  list(organizationId: string, limit?: number) {
    return prisma.auditEvent.findMany({
      where: tenantWhere(organizationId),
      orderBy: { createdAt: "desc" },
      take: clampLimit(limit),
      include: { actor: true },
    });
  },

  getRecent(organizationId: string, limit = 10) {
    return prisma.auditEvent.findMany({
      where: tenantWhere(organizationId),
      orderBy: { createdAt: "desc" },
      take: clampLimit(limit),
      include: { actor: true },
    });
  },

  create(
    input: {
      organizationId: string;
      actorUserId?: string | null;
      action: string;
      resourceType: string;
      resourceId: string;
      correlationId: string;
      previousStateJson?: object | null;
      newStateJson?: object | null;
    },
    tx?: Db,
  ) {
    return db(tx).auditEvent.create({
      data: {
        organizationId: input.organizationId,
        actorUserId: input.actorUserId ?? null,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        correlationId: input.correlationId,
        previousStateJson: input.previousStateJson ?? undefined,
        newStateJson: input.newStateJson ?? undefined,
      },
    });
  },
};
