import { prisma } from "@/lib/prisma/client";
import { clampLimit, tenantWhere } from "./shared";
import { db, type Db } from "./types";

export const approvalRepository = {
  list(organizationId: string, limit?: number) {
    return prisma.approval.findMany({
      where: tenantWhere(organizationId),
      orderBy: { createdAt: "desc" },
      take: clampLimit(limit),
      include: { requester: true, assignee: true },
    });
  },

  findById(organizationId: string, id: string, tx?: Db) {
    return db(tx).approval.findFirst({
      where: tenantWhere(organizationId, { id }),
      include: { requester: true, assignee: true },
    });
  },

  findPendingById(organizationId: string, id: string, tx?: Db) {
    return db(tx).approval.findFirst({
      where: { id, organizationId, status: "PENDING" },
    });
  },

  countPending(organizationId: string) {
    return prisma.approval.count({
      where: { organizationId, status: "PENDING" },
    });
  },

  countByStatus(
    organizationId: string,
    status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" | "CANCELED",
  ) {
    return prisma.approval.count({ where: { organizationId, status } });
  },

  // Record a decision on a pending approval. The where clause includes the
  // PENDING status so a concurrent second decision cannot overwrite the first;
  // the returned count is 0 when the request was already decided. Accepts a
  // transaction client so the decision is atomic with audit and outbox writes.
  recordDecision(
    organizationId: string,
    id: string,
    status: "APPROVED" | "REJECTED",
    decisionReason: string | null,
    tx?: Db,
  ) {
    return db(tx).approval.updateMany({
      where: { id, organizationId, status: "PENDING" },
      data: { status, decisionReason, decidedAt: new Date() },
    });
  },
};
