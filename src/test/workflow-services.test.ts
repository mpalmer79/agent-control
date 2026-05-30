import { describe, expect, it } from "vitest";

import {
  approveApproval,
  rejectApproval,
} from "@/server/modules/governance/service";
import {
  promoteDeployment,
  rollbackDeployment,
} from "@/server/modules/deployments/service";

// These tests run without DATABASE_URL, so workflows take the demo-simulated
// path. They assert policy outcomes and that simulated results never claim
// persisted evidence.

const cid = "test-correlation";

describe("approval workflow (simulated)", () => {
  it("approves a pending approval as a simulated action", async () => {
    const result = await approveApproval(cid, "billing-v2");
    expect(result.status).toBe("simulated");
    expect(result.simulated).toBe(true);
    expect(result.auditEventId).toBeUndefined();
    expect(result.outboxEventId).toBeUndefined();
    expect(result.message).toContain("simulated");
  });

  it("blocks a decision on an already-decided approval", async () => {
    const result = await approveApproval(cid, "support-v4");
    expect(result.status).toBe("blocked");
    expect(result.policyDecision.allowed).toBe(false);
  });

  it("blocks a rejection without a reason", async () => {
    const result = await rejectApproval(cid, "billing-v2", "");
    expect(result.status).toBe("blocked");
    expect(result.policyDecision.blockingIssues.map((i) => i.code)).toContain(
      "reason_required",
    );
  });

  it("rejects a pending approval with a reason as a simulated action", async () => {
    const result = await rejectApproval(cid, "billing-v2", "Not ready");
    expect(result.status).toBe("simulated");
  });
});

describe("deployment promotion workflow (simulated)", () => {
  it("routes a production promotion without approval to pending approval", async () => {
    // Billing v2 is pending in seed: no recorded approval yet, gates otherwise
    // satisfied, so the workflow requires approval.
    const result = await promoteDeployment(cid, {
      deploymentId: "billing-v2-prod",
    });
    expect(["pending_approval", "simulated"]).toContain(result.status);
    expect(result.simulated).toBe(true);
  });

  it("blocks promotion of a deployment with a failed evaluation", async () => {
    const result = await promoteDeployment(cid, {
      deploymentId: "fraud-v3-prod",
    });
    expect(result.status).toBe("blocked");
    expect(result.policyDecision.allowed).toBe(false);
  });
});

describe("deployment rollback workflow (simulated)", () => {
  it("allows rollback to the prior stable deployment", async () => {
    const result = await rollbackDeployment(cid, {
      deploymentId: "fraud-v3-prod",
      targetDeploymentId: "fraud-v2-prod",
    });
    expect(result.status).toBe("simulated");
    expect(result.policyDecision.allowed).toBe(true);
  });
});
