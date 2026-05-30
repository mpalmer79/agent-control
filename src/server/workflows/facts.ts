// Fact gatherers for the policy engine, derived from the seed scenario.
//
// These build the fact shapes the policy engine consumes. They use the seed
// data so the governed workflows behave consistently in the demo. The database
// path can populate the same fact shapes from repositories in a later phase.

import {
  seedAgents,
  seedApprovals,
  seedDeployments,
  seedEvaluations,
  seedIncidents,
  seedModels,
} from "@/data/seed";
import { toDomainEnum } from "@/server/data-source";
import type {
  ApprovalDecisionFacts,
  PromotionFacts,
  RollbackFacts,
} from "@/server/modules/governance/policy-engine";
import type { EnvironmentName, RiskLevel } from "@/types/domain";

function deploymentByKey(key: string) {
  return seedDeployments.find((d) => d.key === key);
}

function agentByKey(key: string) {
  return seedAgents.find((a) => a.key === key);
}

// Gather promotion facts for a deployment record (identified by its seed key).
export function promotionFactsForDeployment(
  deploymentKey: string,
): PromotionFacts {
  const deployment = deploymentByKey(deploymentKey);
  const agent = deployment ? agentByKey(deployment.agentKey) : undefined;
  const model = agent
    ? seedModels.find((m) => m.key === agent.modelKey)
    : undefined;

  const evaluations = deployment
    ? seedEvaluations.filter(
        (e) =>
          e.agentKey === deployment.agentKey &&
          e.version === deployment.version,
      )
    : [];
  const evaluationsPassing =
    evaluations.length > 0
      ? evaluations.every((e) => e.passed !== false)
      : true;

  const hasOpenCriticalIncident = deployment
    ? seedIncidents.some((i) => {
        const severity: string = i.severity;
        const status: string = i.status;
        return (
          i.agentKey === deployment.agentKey &&
          status === "OPEN" &&
          (severity === "HIGH" || severity === "CRITICAL")
        );
      })
    : false;

  const hasRecordedApproval = deployment
    ? seedApprovals.some(
        (a) =>
          a.correlationId === deployment.correlationId &&
          a.status === "APPROVED",
      )
    : false;

  return {
    agentExists: Boolean(agent),
    agentVersionExists: Boolean(deployment),
    environment: deployment
      ? toDomainEnum<EnvironmentName>(deployment.environment)
      : "development",
    riskLevel: agent ? toDomainEnum<RiskLevel>(agent.riskLevel) : "low",
    promptVersionApproved: agent
      ? deployment?.version === agent.activeVersion
      : false,
    modelEnabledForProduction: model ? model.enabledForProduction : false,
    evaluationsPassing,
    hasOpenCriticalIncident,
    hasRecordedApproval,
  };
}

// Gather rollback facts for a target deployment relative to a source agent.
export function rollbackFactsForDeployment(
  targetKey: string,
  agentKey: string,
): RollbackFacts {
  const target = deploymentByKey(targetKey);
  const failedEval = target
    ? seedEvaluations.some(
        (e) =>
          e.agentKey === target.agentKey &&
          e.version === target.version &&
          e.passed === false,
      )
    : false;

  return {
    targetExists: Boolean(target),
    sameAgent: target ? target.agentKey === agentKey : false,
    targetBlocked: target ? (target.status as string) === "BLOCKED" : false,
    targetEnvironment: target
      ? toDomainEnum<EnvironmentName>(target.environment)
      : "development",
    targetHasFailedCriticalEvaluation: failedEval,
  };
}

export function approvalDecisionFacts(
  approvalKey: string,
  isRejection: boolean,
  reason: string | undefined,
): ApprovalDecisionFacts {
  const approval = seedApprovals.find((a) => a.key === approvalKey);
  return {
    approvalExists: Boolean(approval),
    isPending: approval ? approval.status === "PENDING" : false,
    isRejection,
    hasReason: Boolean(reason && reason.trim().length > 0),
  };
}

// Helpers exposed for services and tests.
export function findSeedApproval(approvalKey: string) {
  return seedApprovals.find((a) => a.key === approvalKey);
}

export function findSeedDeployment(deploymentKey: string) {
  return deploymentByKey(deploymentKey);
}

export function rollbackCandidatesForAgent(agentKey: string): string[] {
  return seedDeployments
    .filter((d) => d.agentKey === agentKey && d.status === "SUPERSEDED")
    .map((d) => d.key);
}
