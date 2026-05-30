// Shared demo seed routine.
//
// One implementation used by both the CLI seed (prisma/seed.ts) and the guarded
// demo reset endpoint. It loads the demo scenario from src/data/seed into
// PostgreSQL. The data is fictional, contains no secrets, and aligns with
// SEED_DATA_PLAN.md and DEMO_SCRIPT.md. The routine is idempotent: it clears
// known demo rows before inserting.

import type { PrismaClient } from "@prisma/client";

import {
  seedAgents,
  seedApprovals,
  seedAuditEvents,
  seedCosts,
  seedDeployments,
  seedEnvironments,
  seedEvaluations,
  seedIncidents,
  seedModels,
  seedOrganization,
  seedPrompts,
  seedProviders,
  seedUsers,
} from "@/data/seed";

export interface SeedCounts {
  users: number;
  models: number;
  agents: number;
  deployments: number;
  evaluations: number;
  approvals: number;
  incidents: number;
  costRecords: number;
  auditEvents: number;
  outboxEvents: number;
}

export async function clearDemoData(prisma: PrismaClient): Promise<void> {
  // Delete in dependency order. Intended for the demo database only.
  await prisma.auditEvent.deleteMany();
  await prisma.costRecord.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.evaluationRun.deleteMany();
  await prisma.deployment.deleteMany();
  await prisma.agentVersion.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.promptVersion.deleteMany();
  await prisma.prompt.deleteMany();
  await prisma.model.deleteMany();
  await prisma.modelProvider.deleteMany();
  await prisma.environment.deleteMany();
  await prisma.user.deleteMany();
  await prisma.outboxEvent.deleteMany();
  await prisma.organization.deleteMany();
}

export async function runDemoSeed(prisma: PrismaClient): Promise<SeedCounts> {
  await clearDemoData(prisma);

  const organization = await prisma.organization.create({
    data: { name: seedOrganization.name, slug: seedOrganization.slug },
  });
  const organizationId = organization.id;

  for (const environment of seedEnvironments) {
    await prisma.environment.create({
      data: {
        organizationId,
        name: environment.name,
        description: environment.description,
      },
    });
  }

  const userIdByKey = new Map<string, string>();
  for (const user of seedUsers) {
    const created = await prisma.user.create({
      data: {
        organizationId,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
    userIdByKey.set(user.key, created.id);
  }

  const providerIdByKey = new Map<string, string>();
  for (const provider of seedProviders) {
    const created = await prisma.modelProvider.create({
      data: { key: provider.key, name: provider.name },
    });
    providerIdByKey.set(provider.key, created.id);
  }

  const modelIdByKey = new Map<string, string>();
  for (const model of seedModels) {
    const providerId = providerIdByKey.get(model.providerKey);
    if (!providerId) continue;
    const created = await prisma.model.create({
      data: {
        providerId,
        modelKey: model.modelKey,
        displayName: model.displayName,
        contextWindow: model.contextWindow,
        inputCostPerMillion: model.inputCostPerMillion,
        outputCostPerMillion: model.outputCostPerMillion,
        riskLevel: model.riskLevel,
        enabledForProduction: model.enabledForProduction,
      },
    });
    modelIdByKey.set(model.key, created.id);
  }

  // Determine which prompt versions are the active version of an agent, so they
  // can be marked APPROVED.
  const approvedPromptVersions = new Set<string>();
  for (const agent of seedAgents) {
    approvedPromptVersions.add(`${agent.promptKey}:${agent.activeVersion}`);
  }

  const promptVersionIdByKey = new Map<string, string>();
  for (const prompt of seedPrompts) {
    const createdBy = userIdByKey.get(prompt.createdByKey) ?? "";
    const created = await prisma.prompt.create({
      data: {
        organizationId,
        name: prompt.name,
        description: prompt.description,
        createdBy,
      },
    });
    for (const version of prompt.versions) {
      const isApproved = approvedPromptVersions.has(
        `${prompt.key}:${version.version}`,
      );
      const createdVersion = await prisma.promptVersion.create({
        data: {
          promptId: created.id,
          version: version.version,
          status: isApproved ? "APPROVED" : "DRAFT",
          templateText: `Seed template for ${prompt.name} ${version.version}.`,
          changeReason: version.changeReason,
          createdBy,
        },
      });
      promptVersionIdByKey.set(
        `${prompt.key}:${version.version}`,
        createdVersion.id,
      );
    }
  }

  const agentVersionIdByKey = new Map<string, string>();
  const agentIdByKey = new Map<string, string>();
  for (const agent of seedAgents) {
    const ownerUserId = userIdByKey.get(agent.ownerKey) ?? "";
    const created = await prisma.agent.create({
      data: {
        organizationId,
        name: agent.name,
        description: agent.description,
        ownerUserId,
        status: agent.status,
        riskLevel: agent.riskLevel,
      },
    });
    agentIdByKey.set(agent.key, created.id);

    for (const version of agent.versions) {
      const promptVersionId = promptVersionIdByKey.get(
        `${agent.promptKey}:${version}`,
      );
      const modelId = modelIdByKey.get(agent.modelKey);
      const createdVersion = await prisma.agentVersion.create({
        data: {
          agentId: created.id,
          version,
          promptVersionId: promptVersionId ?? null,
          modelId: modelId ?? null,
          createdBy: ownerUserId,
        },
      });
      agentVersionIdByKey.set(`${agent.key}:${version}`, createdVersion.id);
    }
  }

  for (const deployment of seedDeployments) {
    const agentId = agentIdByKey.get(deployment.agentKey);
    const agentVersionId = agentVersionIdByKey.get(
      `${deployment.agentKey}:${deployment.version}`,
    );
    if (!agentId || !agentVersionId) continue;
    await prisma.deployment.create({
      data: {
        agentId,
        agentVersionId,
        environment: deployment.environment,
        status: deployment.status,
        deployedBy: userIdByKey.get(deployment.deployedByKey) ?? "",
        approvedBy: deployment.approvedByKey
          ? (userIdByKey.get(deployment.approvedByKey) ?? null)
          : null,
        deployedAt: deployment.deployedAt
          ? new Date(deployment.deployedAt)
          : null,
        correlationId: deployment.correlationId,
      },
    });
  }

  for (const evaluation of seedEvaluations) {
    const agentVersionId = agentVersionIdByKey.get(
      `${evaluation.agentKey}:${evaluation.version}`,
    );
    if (!agentVersionId) continue;
    await prisma.evaluationRun.create({
      data: {
        agentVersionId,
        suiteName: evaluation.suiteName,
        status: evaluation.status,
        score: evaluation.score,
        passed: evaluation.passed,
        completedAt: new Date(),
        createdBy: userIdByKey.get("alex") ?? "",
      },
    });
  }

  for (const approval of seedApprovals) {
    await prisma.approval.create({
      data: {
        organizationId,
        resourceType: approval.resourceType,
        resourceId: approval.resourceId,
        requestedBy: userIdByKey.get(approval.requestedByKey) ?? "",
        assignedTo: userIdByKey.get(approval.assignedToKey) ?? null,
        status: approval.status,
        decisionReason: approval.decisionReason,
        decidedAt: approval.status === "PENDING" ? null : new Date(),
        correlationId: approval.correlationId,
        createdAt: new Date(approval.createdAt),
      },
    });
  }

  for (const incident of seedIncidents) {
    await prisma.incident.create({
      data: {
        organizationId,
        agentId: agentIdByKey.get(incident.agentKey) ?? null,
        severity: incident.severity,
        status: incident.status,
        title: incident.title,
        description: incident.description,
        correlationId: incident.correlationId,
        createdAt: new Date(incident.createdAt),
        resolvedAt: incident.resolvedAt ? new Date(incident.resolvedAt) : null,
      },
    });
  }

  for (const cost of seedCosts) {
    await prisma.costRecord.create({
      data: {
        organizationId,
        agentId: agentIdByKey.get(cost.agentKey) ?? null,
        modelId: modelIdByKey.get(cost.modelKey) ?? null,
        provider: cost.provider,
        inputTokens: cost.inputTokens,
        outputTokens: cost.outputTokens,
        estimatedCost: cost.estimatedCost,
        environment: cost.environment,
        correlationId: cost.correlationId,
        createdAt: new Date(cost.createdAt),
      },
    });
  }

  for (const event of seedAuditEvents) {
    await prisma.auditEvent.create({
      data: {
        organizationId,
        actorUserId: event.actorKey
          ? (userIdByKey.get(event.actorKey) ?? null)
          : null,
        action: event.action,
        resourceType: event.resourceType,
        resourceId: event.resourceId,
        correlationId: event.correlationId,
        createdAt: new Date(event.createdAt),
      },
    });
  }

  // Seed a few outbox events to represent emitted domain events for the demo
  // deployments. A background publisher marks these published in later phases.
  let outboxEvents = 0;
  for (const deployment of seedDeployments) {
    if (deployment.status !== "ACTIVE") continue;
    const agentId = agentIdByKey.get(deployment.agentKey);
    if (!agentId) continue;
    await prisma.outboxEvent.create({
      data: {
        organizationId,
        eventType: "DeploymentPromoted",
        aggregateType: "deployment",
        aggregateId: deployment.key,
        payloadJson: {
          agentId,
          environment: deployment.environment,
          version: deployment.version,
        },
        correlationId: deployment.correlationId,
      },
    });
    outboxEvents += 1;
  }

  return {
    users: seedUsers.length,
    models: seedModels.length,
    agents: seedAgents.length,
    deployments: seedDeployments.length,
    evaluations: seedEvaluations.length,
    approvals: seedApprovals.length,
    incidents: seedIncidents.length,
    costRecords: seedCosts.length,
    auditEvents: seedAuditEvents.length,
    outboxEvents,
  };
}
