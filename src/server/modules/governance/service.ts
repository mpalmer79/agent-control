import { getDemoContext } from "@/server/context";
import { load } from "@/server/data-source";
import { mapApproval } from "@/server/mappers";
import { mockApprovals } from "@/server/mock-source";
import { approvalRepository } from "@/server/repositories";
import { resolveOrganizationId } from "@/server/resolve-org";

export function listApprovals(correlationId: string) {
  const ctx = getDemoContext(correlationId);
  return load(
    correlationId,
    async () => {
      const organizationId = await resolveOrganizationId(ctx.organizationSlug);
      const rows = await approvalRepository.list(organizationId);
      return rows.map(mapApproval);
    },
    () => mockApprovals(),
  );
}

export async function getApprovalSummary(correlationId: string) {
  const { data, source } = await listApprovals(correlationId);
  const pending = data.filter((a) => a.status === "pending").length;
  return { data: { total: data.length, pending }, source };
}
