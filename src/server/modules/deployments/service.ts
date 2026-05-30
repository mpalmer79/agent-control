import { getDemoContext } from "@/server/context";
import { load } from "@/server/data-source";
import { mapDeployment } from "@/server/mappers";
import { mockDeployments } from "@/server/mock-source";
import { deploymentRepository } from "@/server/repositories";
import { resolveOrganizationId } from "@/server/resolve-org";

export function listDeployments(correlationId: string) {
  const ctx = getDemoContext(correlationId);
  return load(
    correlationId,
    async () => {
      const organizationId = await resolveOrganizationId(ctx.organizationSlug);
      const rows =
        await deploymentRepository.listByOrganization(organizationId);
      return rows.map(mapDeployment);
    },
    () => mockDeployments(),
  );
}

export function getRecentDeployments(correlationId: string, limit = 5) {
  const ctx = getDemoContext(correlationId);
  return load(
    correlationId,
    async () => {
      const organizationId = await resolveOrganizationId(ctx.organizationSlug);
      const rows = await deploymentRepository.getRecent(organizationId, limit);
      return rows.map(mapDeployment);
    },
    () => mockDeployments().slice(0, limit),
  );
}

export async function getDeploymentSummary(correlationId: string) {
  const { data, source } = await listDeployments(correlationId);
  const active = data.filter((d) => d.status === "active").length;
  const pending = data.filter((d) => d.status === "pending_approval").length;
  return { data: { total: data.length, active, pending }, source };
}
