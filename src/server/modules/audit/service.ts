import { getDemoContext } from "@/server/context";
import { load } from "@/server/data-source";
import { mapAuditEvent } from "@/server/mappers";
import { mockAuditEvents } from "@/server/mock-source";
import { auditRepository } from "@/server/repositories";
import { resolveOrganizationId } from "@/server/resolve-org";

export function listAuditEvents(correlationId: string) {
  const ctx = getDemoContext(correlationId);
  return load(
    correlationId,
    async () => {
      const organizationId = await resolveOrganizationId(ctx.organizationSlug);
      const rows = await auditRepository.list(organizationId);
      return rows.map(mapAuditEvent);
    },
    () => mockAuditEvents(),
  );
}

export function getRecentAuditEvents(correlationId: string, limit = 10) {
  const ctx = getDemoContext(correlationId);
  return load(
    correlationId,
    async () => {
      const organizationId = await resolveOrganizationId(ctx.organizationSlug);
      const rows = await auditRepository.getRecent(organizationId, limit);
      return rows.map(mapAuditEvent);
    },
    () => mockAuditEvents().slice(0, limit),
  );
}
