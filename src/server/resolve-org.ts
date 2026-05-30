// Resolve the active organization id for database-backed reads.
//
// The demo context carries the organization slug. The database path resolves it
// to the real organization id. If the organization is not present, the caller
// falls back to the mock data source.

import { NotFoundError } from "@/lib/errors";
import { organizationRepository } from "@/server/repositories";

export async function resolveOrganizationId(slug: string): Promise<string> {
  const organization = await organizationRepository.findBySlug(slug);
  if (!organization) {
    throw new NotFoundError("Organization not found");
  }
  return organization.id;
}
