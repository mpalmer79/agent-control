// Shared repository helpers.
//
// Repositories provide typed, foundation-level data access over Prisma. Every
// tenant-owned query is scoped by organizationId. Cross-tenant access fails
// closed: a query that does not match the organization returns nothing.

export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 100;

// Clamp a requested limit into the allowed range.
export function clampLimit(limit?: number): number {
  if (!limit || Number.isNaN(limit) || limit <= 0) {
    return DEFAULT_PAGE_SIZE;
  }
  return Math.min(Math.floor(limit), MAX_PAGE_SIZE);
}

// Build a tenant-scoped where clause. Always include organizationId so queries
// cannot accidentally read across tenants.
export function tenantWhere<T extends Record<string, unknown>>(
  organizationId: string,
  where?: T,
): T & { organizationId: string } {
  return { ...(where ?? ({} as T)), organizationId };
}
