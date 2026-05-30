import { getDemoContext } from "@/server/context";
import { load } from "@/server/data-source";
import { mapEvaluation } from "@/server/mappers";
import { mockEvaluations } from "@/server/mock-source";
import { evaluationRepository } from "@/server/repositories";
import { resolveOrganizationId } from "@/server/resolve-org";

export function listEvaluations(correlationId: string) {
  const ctx = getDemoContext(correlationId);
  return load(
    correlationId,
    async () => {
      const organizationId = await resolveOrganizationId(ctx.organizationSlug);
      const rows =
        await evaluationRepository.listByOrganization(organizationId);
      return rows.map(mapEvaluation);
    },
    () => mockEvaluations(),
  );
}
