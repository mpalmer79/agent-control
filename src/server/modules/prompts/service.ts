import { getDemoContext } from "@/server/context";
import { load } from "@/server/data-source";
import { mapPrompt } from "@/server/mappers";
import { mockPrompts } from "@/server/mock-source";
import { promptRepository } from "@/server/repositories";
import { resolveOrganizationId } from "@/server/resolve-org";

export function listPrompts(correlationId: string) {
  const ctx = getDemoContext(correlationId);
  return load(
    correlationId,
    async () => {
      const organizationId = await resolveOrganizationId(ctx.organizationSlug);
      const rows = await promptRepository.list(organizationId);
      return rows.map(mapPrompt);
    },
    () => mockPrompts(),
  );
}
