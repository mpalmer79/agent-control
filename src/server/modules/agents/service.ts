import { getDemoContext } from "@/server/context";
import { load } from "@/server/data-source";
import { mapAgent } from "@/server/mappers";
import { mockAgents } from "@/server/mock-source";
import { agentRepository } from "@/server/repositories";
import { resolveOrganizationId } from "@/server/resolve-org";
import type { AgentListItem } from "@/types/resources";

export function listAgents(correlationId: string) {
  const ctx = getDemoContext(correlationId);
  return load(
    correlationId,
    async () => {
      const organizationId = await resolveOrganizationId(ctx.organizationSlug);
      const rows = await agentRepository.list(organizationId);
      return rows.map(mapAgent);
    },
    () => mockAgents(),
  );
}

export function getAgentById(correlationId: string, id: string) {
  const ctx = getDemoContext(correlationId);
  return load<AgentListItem | null>(
    correlationId,
    async () => {
      const organizationId = await resolveOrganizationId(ctx.organizationSlug);
      const row = await agentRepository.findById(organizationId, id);
      return row ? mapAgent(row) : null;
    },
    () => mockAgents().find((agent) => agent.id === id) ?? null,
  );
}

export async function getAgentOverview(correlationId: string) {
  const { data, source } = await listAgents(correlationId);
  const byStatus: Record<string, number> = {};
  for (const agent of data) {
    byStatus[agent.status] = (byStatus[agent.status] ?? 0) + 1;
  }
  return { data: { total: data.length, byStatus }, source };
}
