// Authorization utilities.
//
// Permission checks are enforced in the service layer, never only in the UI.
// Failures use the typed application errors so the API maps them to safe
// responses without leaking internals.

import { ForbiddenError } from "@/lib/errors";
import {
  ROLE_PERMISSIONS,
  type Permission,
  type Principal,
} from "@/server/auth/principal";
import type { UserRole } from "@/types/domain";

export function hasPermission(
  principal: Principal,
  permission: Permission,
): boolean {
  return ROLE_PERMISSIONS[principal.role].includes(permission);
}

export function requirePermission(
  principal: Principal,
  permission: Permission,
): void {
  if (!hasPermission(principal, permission)) {
    throw new ForbiddenError(
      `Role ${principal.role} does not have permission ${permission}`,
    );
  }
}

export function requireRole(principal: Principal, role: UserRole): void {
  if (principal.role !== role) {
    throw new ForbiddenError(`This action requires the ${role} role`);
  }
}

// Ensure a resource belongs to the principal's organization. Cross-tenant
// access fails closed.
export function assertSameOrganization(
  principal: Principal,
  resourceOrganizationId: string,
): void {
  if (principal.organizationId !== resourceOrganizationId) {
    throw new ForbiddenError("Resource is outside your organization");
  }
}
