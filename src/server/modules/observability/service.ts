import { getDemoContext } from "@/server/context";
import { load } from "@/server/data-source";
import { mockMetricsSummary } from "@/server/mock-source";
import {
  agentRepository,
  approvalRepository,
  costRepository,
  deploymentRepository,
  evaluationRepository,
  incidentRepository,
} from "@/server/repositories";
import { resolveOrganizationId } from "@/server/resolve-org";
import type { MetricsSummary } from "@/types/resources";

// Dashboard metrics summary. Uses the database when configured, aggregating
// counts across repositories, and falls back to the seed-derived summary.
export function getDashboardMetrics(correlationId: string) {
  const ctx = getDemoContext(correlationId);
  return load<MetricsSummary>(
    correlationId,
    async () => {
      const organizationId = await resolveOrganizationId(ctx.organizationSlug);
      const [
        totalAgents,
        activeDeployments,
        pendingApprovals,
        openIncidents,
        costAggregate,
        completed,
        passed,
      ] = await Promise.all([
        agentRepository.count(organizationId),
        deploymentRepository.countActive(organizationId),
        approvalRepository.countPending(organizationId),
        incidentRepository.countOpen(organizationId),
        costRepository.sumEstimatedCost(organizationId),
        evaluationRepository.countCompleted(organizationId),
        evaluationRepository.countPassed(organizationId),
      ]);
      return {
        totalAgents,
        activeDeployments,
        pendingApprovals,
        openIncidents,
        estimatedMonthlyCost: costAggregate._sum.estimatedCost ?? 0,
        evaluationPassRate: completed > 0 ? passed / completed : 0,
      };
    },
    () => mockMetricsSummary(),
  );
}
