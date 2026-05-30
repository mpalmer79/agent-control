import { describe, expect, it, vi } from "vitest";

// These tests verify repository mutation helpers shape their queries correctly
// (tenant scoping, pending-only decisions, supersede targeting) by passing a
// fake transaction client. They do not require a live database.

import { approvalRepository } from "@/server/repositories/approvals";
import { deploymentRepository } from "@/server/repositories/deployments";

function fakeTx() {
  const calls: Record<string, unknown[]> = {};
  const record = (name: string) =>
    vi.fn((arg: unknown) => {
      calls[name] = [...(calls[name] ?? []), arg];
      return Promise.resolve({ count: 1, id: "x" });
    });
  return {
    client: {
      approval: { updateMany: record("approval.updateMany") },
      deployment: {
        update: record("deployment.update"),
        updateMany: record("deployment.updateMany"),
      },
    },
    calls,
  };
}

describe("approval repository", () => {
  it("records decisions only on pending approvals, organization-scoped", async () => {
    const { client, calls } = fakeTx();
    await approvalRepository.recordDecision(
      "org-1",
      "appr-1",
      "APPROVED",
      null,
      client as never,
    );
    const arg = calls["approval.updateMany"]![0] as {
      where: Record<string, unknown>;
    };
    expect(arg.where).toMatchObject({
      id: "appr-1",
      organizationId: "org-1",
      status: "PENDING",
    });
  });
});

describe("deployment repository", () => {
  it("supersede targets only the same agent and environment, excluding the promoted deployment", async () => {
    const { client, calls } = fakeTx();
    await deploymentRepository.supersedeActiveForAgentEnvironment(
      "org-1",
      "agent-1",
      "PRODUCTION",
      "dep-keep",
      client as never,
    );
    const arg = calls["deployment.updateMany"]![0] as {
      where: Record<string, unknown>;
      data: Record<string, unknown>;
    };
    expect(arg.where).toMatchObject({
      agentId: "agent-1",
      environment: "PRODUCTION",
      status: "ACTIVE",
      id: { not: "dep-keep" },
      agent: { organizationId: "org-1" },
    });
    expect(arg.data).toEqual({ status: "SUPERSEDED" });
  });

  it("marks a deployment rolled back while preserving the record", async () => {
    const { client, calls } = fakeTx();
    await deploymentRepository.markRolledBack(
      "dep-old",
      "dep-target",
      client as never,
    );
    const arg = calls["deployment.update"]![0] as {
      where: Record<string, unknown>;
      data: Record<string, unknown>;
    };
    expect(arg.where).toEqual({ id: "dep-old" });
    expect(arg.data).toEqual({
      status: "ROLLED_BACK",
      rollbackFromDeployment: "dep-target",
    });
  });

  it("marks a deployment active with an approver and timestamp", async () => {
    const { client, calls } = fakeTx();
    await deploymentRepository.markActive(
      "dep-1",
      { approvedBy: "user-1" },
      client as never,
    );
    const arg = calls["deployment.update"]![0] as {
      data: Record<string, unknown>;
    };
    expect(arg.data.status).toBe("ACTIVE");
    expect(arg.data.approvedBy).toBe("user-1");
    expect(arg.data.deployedAt).toBeInstanceOf(Date);
  });
});
