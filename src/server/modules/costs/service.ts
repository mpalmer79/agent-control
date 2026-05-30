import { getDemoContext } from "@/server/context";
import { load } from "@/server/data-source";
import { seedCosts } from "@/data/seed";
import { costRepository } from "@/server/repositories";
import { resolveOrganizationId } from "@/server/resolve-org";

export function getCostSummary(correlationId: string) {
  const ctx = getDemoContext(correlationId);
  return load<{ estimatedTotal: number; recordCount: number }>(
    correlationId,
    async () => {
      const organizationId = await resolveOrganizationId(ctx.organizationSlug);
      const aggregate = await costRepository.sumEstimatedCost(organizationId);
      const records = await costRepository.list(organizationId);
      return {
        estimatedTotal: aggregate._sum.estimatedCost ?? 0,
        recordCount: records.length,
      };
    },
    () => ({
      estimatedTotal: seedCosts.reduce((sum, c) => sum + c.estimatedCost, 0),
      recordCount: seedCosts.length,
    }),
  );
}
