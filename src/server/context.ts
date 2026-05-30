// Request context shared across services.
//
// Carries the organization scope and the correlation ID. In Phase 2 the
// organization resolves to the demo organization. Phase 3 resolves it from the
// authenticated Clerk principal.

import { seedOrganization } from "@/data/seed";

export interface RequestContext {
  organizationId: string;
  organizationSlug: string;
  correlationId: string;
}

// Build a context for the demo organization. The organizationId is the demo
// slug in mock mode; the database path resolves the real id when configured.
export function getDemoContext(correlationId: string): RequestContext {
  return {
    organizationId: seedOrganization.slug,
    organizationSlug: seedOrganization.slug,
    correlationId,
  };
}
