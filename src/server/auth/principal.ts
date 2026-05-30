// Authenticated principal groundwork.
//
// Phase 3 establishes the principal model without enforcing role-based access.
// When Clerk is configured, the principal can be mapped from the Clerk user in
// a later phase. Without Clerk, a safe demo principal is returned so the static
// shell and the portfolio demo remain reviewable without login.
//
// Full role enforcement (RBAC on routes and actions) arrives in Phase 4.

import { seedOrganization } from "@/data/seed";
import { isClerkConfigured } from "@/lib/config/env";
import type { UserRole } from "@/types/domain";

export interface Principal {
  userId: string;
  fullName: string;
  email: string;
  role: UserRole;
  organizationId: string;
  organizationSlug: string;
  isDemo: boolean;
}

const DEMO_PRINCIPAL: Principal = {
  userId: "demo-user",
  fullName: "Demo Reviewer",
  email: "demo.reviewer@example.com",
  role: "administrator",
  organizationId: seedOrganization.slug,
  organizationSlug: seedOrganization.slug,
  isDemo: true,
};

// Return the demo principal. This is the safe default for the portfolio demo.
export function getDemoPrincipal(): Principal {
  return DEMO_PRINCIPAL;
}

// Resolve the current principal. In Phase 3 this returns the demo principal.
// When Clerk is configured, Phase 4 will map the Clerk user and organization
// here. The function is async to keep that future mapping non-breaking.
export async function getPrincipal(): Promise<Principal> {
  if (!isClerkConfigured()) {
    return DEMO_PRINCIPAL;
  }
  // Clerk is configured. Mapping the Clerk session to a Principal (including
  // organization and role resolution) lands in Phase 4. Until then the demo
  // principal keeps the experience working without blocking review.
  return DEMO_PRINCIPAL;
}
