import { describe, expect, it } from "vitest";

import {
  seedAgents,
  seedApprovals,
  seedAuditEvents,
  seedCosts,
  seedDeployments,
  seedEvaluations,
  seedIncidents,
  seedModels,
  seedPrompts,
  seedUsers,
} from "@/data/seed";

const userKeys = new Set(seedUsers.map((u) => u.key));
const agentKeys = new Set(seedAgents.map((a) => a.key));
const promptKeys = new Set(seedPrompts.map((p) => p.key));
const modelKeys = new Set(seedModels.map((m) => m.key));

const AGENT_STATUSES = new Set(["DRAFT", "ACTIVE", "PAUSED", "ARCHIVED"]);
const RISK_LEVELS = new Set(["LOW", "MEDIUM", "HIGH"]);
const DEPLOYMENT_STATUSES = new Set([
  "REQUESTED",
  "PENDING_APPROVAL",
  "ACTIVE",
  "SUPERSEDED",
  "ROLLED_BACK",
  "BLOCKED",
]);
const ENVIRONMENTS = new Set(["DEVELOPMENT", "STAGING", "PRODUCTION"]);

describe("seed data integrity", () => {
  it("uses only fictional example email addresses", () => {
    for (const user of seedUsers) {
      expect(user.email.endsWith("@example.com")).toBe(true);
    }
  });

  it("links agents to known users, prompts, and models", () => {
    for (const agent of seedAgents) {
      expect(userKeys.has(agent.ownerKey)).toBe(true);
      expect(promptKeys.has(agent.promptKey)).toBe(true);
      expect(modelKeys.has(agent.modelKey)).toBe(true);
      expect(agent.versions).toContain(agent.activeVersion);
      expect(AGENT_STATUSES.has(agent.status)).toBe(true);
      expect(RISK_LEVELS.has(agent.riskLevel)).toBe(true);
    }
  });

  it("links deployments to known agents and versions with valid status", () => {
    for (const deployment of seedDeployments) {
      const agent = seedAgents.find((a) => a.key === deployment.agentKey);
      expect(agent).toBeDefined();
      expect(agent?.versions).toContain(deployment.version);
      expect(DEPLOYMENT_STATUSES.has(deployment.status)).toBe(true);
      expect(ENVIRONMENTS.has(deployment.environment)).toBe(true);
      expect(userKeys.has(deployment.deployedByKey)).toBe(true);
    }
  });

  it("links evaluations, approvals, incidents, and costs to known entities", () => {
    for (const evaluation of seedEvaluations) {
      expect(agentKeys.has(evaluation.agentKey)).toBe(true);
    }
    for (const approval of seedApprovals) {
      expect(userKeys.has(approval.requestedByKey)).toBe(true);
      expect(userKeys.has(approval.assignedToKey)).toBe(true);
    }
    for (const incident of seedIncidents) {
      expect(agentKeys.has(incident.agentKey)).toBe(true);
    }
    for (const cost of seedCosts) {
      expect(agentKeys.has(cost.agentKey)).toBe(true);
      expect(modelKeys.has(cost.modelKey)).toBe(true);
    }
  });

  it("references known actors in audit events", () => {
    for (const event of seedAuditEvents) {
      if (event.actorKey !== null) {
        expect(userKeys.has(event.actorKey)).toBe(true);
      }
    }
  });

  it("contains no secret-like values", () => {
    const serialized = JSON.stringify([
      seedUsers,
      seedModels,
      seedAgents,
      seedPrompts,
      seedDeployments,
      seedApprovals,
      seedEvaluations,
      seedIncidents,
      seedCosts,
      seedAuditEvents,
    ]);
    expect(serialized).not.toMatch(
      /sk_live|pk_live|sk_test|password|api[_-]?key/i,
    );
  });
});
