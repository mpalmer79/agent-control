import type { AuditAction } from "@/types/domain";

// Audit events are append-only. The write path never updates or deletes
// records; corrections are new events that reference the prior record.
export interface AuditEventInput {
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  actorUserId?: string;
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  correlationId: string;
}
