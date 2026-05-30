import { getDemoContext } from "@/server/context";
import { load } from "@/server/data-source";
import { mapIncident } from "@/server/mappers";
import { mockIncidents } from "@/server/mock-source";
import { incidentRepository } from "@/server/repositories";
import { resolveOrganizationId } from "@/server/resolve-org";

export function listIncidents(correlationId: string) {
  const ctx = getDemoContext(correlationId);
  return load(
    correlationId,
    async () => {
      const organizationId = await resolveOrganizationId(ctx.organizationSlug);
      const rows = await incidentRepository.list(organizationId);
      return rows.map(mapIncident);
    },
    () => mockIncidents(),
  );
}
