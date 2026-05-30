import { describe, expect, it } from "vitest";

import {
  assertSameOrganization,
  hasPermission,
  requirePermission,
  requireRole,
} from "@/server/auth/permissions";
import { getDemoPrincipalForRole } from "@/server/auth/principal";
import { ForbiddenError } from "@/lib/errors";

describe("permissions", () => {
  it("grants administrators every Phase 4 action", () => {
    const admin = getDemoPrincipalForRole("administrator");
    expect(hasPermission(admin, "approvals:decide")).toBe(true);
    expect(hasPermission(admin, "deployments:promote")).toBe(true);
    expect(hasPermission(admin, "deployments:rollback")).toBe(true);
  });

  it("lets reviewers decide approvals but not promote", () => {
    const reviewer = getDemoPrincipalForRole("reviewer");
    expect(hasPermission(reviewer, "approvals:decide")).toBe(true);
    expect(hasPermission(reviewer, "deployments:promote")).toBe(false);
  });

  it("lets platform engineers promote and rollback but not decide approvals", () => {
    const engineer = getDemoPrincipalForRole("platform_engineer");
    expect(hasPermission(engineer, "deployments:promote")).toBe(true);
    expect(hasPermission(engineer, "deployments:rollback")).toBe(true);
    expect(hasPermission(engineer, "approvals:decide")).toBe(false);
  });

  it("keeps auditors and executives read-only", () => {
    for (const role of ["auditor", "executive"] as const) {
      const principal = getDemoPrincipalForRole(role);
      expect(hasPermission(principal, "approvals:read")).toBe(true);
      expect(hasPermission(principal, "approvals:decide")).toBe(false);
      expect(hasPermission(principal, "deployments:promote")).toBe(false);
    }
  });

  it("throws a forbidden error when permission is missing", () => {
    const auditor = getDemoPrincipalForRole("auditor");
    expect(() => requirePermission(auditor, "deployments:promote")).toThrow(
      ForbiddenError,
    );
  });

  it("enforces role and organization checks", () => {
    const reviewer = getDemoPrincipalForRole("reviewer");
    expect(() => requireRole(reviewer, "administrator")).toThrow(
      ForbiddenError,
    );
    expect(() => assertSameOrganization(reviewer, "other-org")).toThrow(
      ForbiddenError,
    );
    expect(() =>
      assertSameOrganization(reviewer, reviewer.organizationId),
    ).not.toThrow();
  });
});
