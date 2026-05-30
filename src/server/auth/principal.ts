// Authenticated principal and role model.
//
// The principal carries identity, organization scope, and a role. Phase 4 adds
// a role-to-permission map and demo principals for each role so the governance
// workflows can be exercised and tested. Without Clerk, a safe demo principal
// (administrator) is returned so the portfolio demo and the static shell remain
// reviewable without login. Full Clerk-backed role mapping remains a future
// hardening step; the mapping point is marked below.

import { seedOrganization } from "@/data/seed";
import { isClerkConfigured } from "@/lib/config/env";
import type { UserRole } from "@/types/domain";

export type Permission =
  | "approvals:read"
  | "approvals:decide"
  | "deployments:read"
  | "deployments:request"
  | "deployments:promote"
  | "deployments:rollback"
  | "audit:read"
  | "incidents:read"
  | "evaluations:read"
  | "settings:read";

export interface Principal {
  userId: string;
  fullName: string;
  email: string;
  role: UserRole;
  organizationId: string;
  organizationSlug: string;
  isDemo: boolean;
}

const READ_PERMISSIONS: Permission[] = [
  "approvals:read",
  "deployments:read",
  "audit:read",
  "incidents:read",
  "evaluations:read",
  "settings:read",
];

// Role to permission map. Aligns with SYSTEM_DESIGN.md section 10 and the
// Phase 4 rules: administrators do everything, platform engineers request and
// run promotions and rollbacks, reviewers decide approvals, auditors and
// executives are read-only.
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  administrator: [
    ...READ_PERMISSIONS,
    "approvals:decide",
    "deployments:request",
    "deployments:promote",
    "deployments:rollback",
  ],
  platform_engineer: [
    ...READ_PERMISSIONS,
    "deployments:request",
    "deployments:promote",
    "deployments:rollback",
  ],
  reviewer: [...READ_PERMISSIONS, "approvals:decide"],
  auditor: [...READ_PERMISSIONS],
  executive: [...READ_PERMISSIONS],
};

function demoPrincipal(
  role: UserRole,
  fullName: string,
  email: string,
): Principal {
  return {
    userId: `demo-${role}`,
    fullName,
    email,
    role,
    organizationId: seedOrganization.slug,
    organizationSlug: seedOrganization.slug,
    isDemo: true,
  };
}

// The default demo principal is an administrator so the portfolio demo can
// exercise every governed workflow without login.
const DEMO_PRINCIPAL = demoPrincipal(
  "administrator",
  "Demo Administrator",
  "demo.admin@example.com",
);

export function getDemoPrincipal(): Principal {
  return DEMO_PRINCIPAL;
}

// Build a demo principal for a specific role. Used by tests and, in a later
// phase, by a role switcher for the demo.
export function getDemoPrincipalForRole(role: UserRole): Principal {
  const labels: Record<UserRole, [string, string]> = {
    administrator: ["Demo Administrator", "demo.admin@example.com"],
    platform_engineer: ["Demo Engineer", "demo.engineer@example.com"],
    reviewer: ["Demo Reviewer", "demo.reviewer@example.com"],
    auditor: ["Demo Auditor", "demo.auditor@example.com"],
    executive: ["Demo Executive", "demo.executive@example.com"],
  };
  const [fullName, email] = labels[role];
  return demoPrincipal(role, fullName, email);
}

// Resolve the current principal. Without Clerk, returns the demo administrator.
// When Clerk is configured, mapping the Clerk session to a Principal (including
// organization and role resolution) is the future hardening step; until then
// the demo principal keeps the experience working without blocking review.
export async function getPrincipal(): Promise<Principal> {
  if (!isClerkConfigured()) {
    return DEMO_PRINCIPAL;
  }
  return DEMO_PRINCIPAL;
}
