// Fact source selection for governed workflows.
//
// Demo mode (no database): facts are gathered from the seed scenario
// (src/server/workflows/facts.ts), which keeps the portfolio demo working
// without a database. Database mode: facts are gathered from the repositories so
// persisted mutations are never based on stale seed data. The policy engine
// stays pure; only the fact gathering differs by mode.

import { toDomainEnum } from "@/server/data-source";
import {
  approvalRepository,
  deploymentRepository,
  incidentRepository,
} from "@/server/repositories";
import type {
  ApprovalDecisionFacts,
  PromotionFacts,
  RollbackFacts,
} from "@/server/modules/governance/policy-engine";
import {
  approvalDecisionFacts as seedApprovalDecisionFacts,
  promotionFactsForDeployment as seedPromotionFacts,
  rollbackFactsForDeployment as seedRollbackFacts,
} from "@/server/workflows/facts";
import type { EnvironmentName, RiskLevel } from "@/types/domain";

// Promotion facts from the database for a deployment in organization scope.
export async function dbPromotionFacts(
  organizationId: string,
  deploymentId: string,
): Promise<PromotionFacts> {
  const deployment = await deploymentRepository.findByIdWithGates(
    organizationId,
    deploymentId,
  );
  if (!deployment) {
    return {
      agentExists: false,
      agentVersionExists: false,
      environment: "development",
      riskLevel: "low",
      promptVersionApproved: false,
      modelEnabledForProduction: false,
      evaluationsPassing: false,
      hasOpenCriticalIncident: false,
      hasRecordedApproval: false,
    };
  }

  const version = deployment.agentVersion;
  const evaluations = version?.evaluationRuns ?? [];
  const evaluationsPassing =
    evaluations.length > 0
      ? evaluations.every((e) => e.passed !== false)
      : true;

  const openCritical = await incidentRepository.list(organizationId);
  const hasOpenCriticalIncident = openCritical.some(
    (i) =>
      i.agentId === deployment.agentId &&
      i.status === "OPEN" &&
      (i.severity === "HIGH" || i.severity === "CRITICAL"),
  );

  const approvals = await approvalRepository.list(organizationId);
  const hasRecordedApproval = approvals.some(
    (a) =>
      a.correlationId === deployment.correlationId && a.status === "APPROVED",
  );

  return {
    agentExists: Boolean(deployment.agent),
    agentVersionExists: Boolean(version),
    environment: toDomainEnum<EnvironmentName>(deployment.environment),
    riskLevel: deployment.agent
      ? toDomainEnum<RiskLevel>(deployment.agent.riskLevel)
      : "low",
    promptVersionApproved: version?.promptVersion?.status === "APPROVED",
    modelEnabledForProduction: version?.model?.enabledForProduction ?? false,
    evaluationsPassing,
    hasOpenCriticalIncident,
    hasRecordedApproval,
  };
}

export async function dbRollbackFacts(
  organizationId: string,
  currentDeploymentId: string,
  targetDeploymentId: string,
): Promise<RollbackFacts> {
  const current = await deploymentRepository.findById(
    organizationId,
    currentDeploymentId,
  );
  const target = await deploymentRepository.findByIdWithGates(
    organizationId,
    targetDeploymentId,
  );
  const failedEval =
    target?.agentVersion?.evaluationRuns.some((e) => e.passed === false) ??
    false;

  return {
    targetExists: Boolean(target),
    sameAgent: Boolean(target && current && target.agentId === current.agentId),
    targetBlocked: target?.status === "BLOCKED",
    targetEnvironment: target
      ? toDomainEnum<EnvironmentName>(target.environment)
      : "development",
    targetHasFailedCriticalEvaluation: failedEval,
  };
}

export async function dbApprovalDecisionFacts(
  organizationId: string,
  approvalId: string,
  isRejection: boolean,
  reason: string | undefined,
): Promise<ApprovalDecisionFacts> {
  const approval = await approvalRepository.findById(
    organizationId,
    approvalId,
  );
  return {
    approvalExists: Boolean(approval),
    isPending: approval?.status === "PENDING",
    isRejection,
    hasReason: Boolean(reason && reason.trim().length > 0),
  };
}

// Re-export the seed-derived gatherers for the demo path so callers select a
// source through one module.
export { seedApprovalDecisionFacts, seedPromotionFacts, seedRollbackFacts };
