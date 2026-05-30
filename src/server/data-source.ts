// Data source selection for the service layer.
//
// Services prefer the database when it is configured, and fall back to the
// mock source built from seed data when it is not, or when a database read
// fails. This keeps the shell and the foundation API reviewable without a
// database while remaining ready for real persistence in Phase 3.

import { isDatabaseConfigured } from "@/lib/config/env";
import { logger } from "@/lib/observability/logger";
import type { DataSource } from "@/types/resources";

export interface Loaded<T> {
  data: T;
  source: DataSource;
}

export async function load<T>(
  correlationId: string,
  dbLoader: () => Promise<T>,
  mockLoader: () => T,
): Promise<Loaded<T>> {
  if (!isDatabaseConfigured()) {
    return { data: mockLoader(), source: "mock" };
  }
  try {
    return { data: await dbLoader(), source: "database" };
  } catch (error) {
    logger.warn("database read failed, serving mock data", {
      correlationId,
      reason: error instanceof Error ? error.message : "unknown",
    });
    return { data: mockLoader(), source: "mock" };
  }
}

// Lowercase a Prisma enum value into the domain union form. The domain unions
// use snake_case lowercase that matches Prisma upper snake case lowercased.
export function toDomainEnum<T extends string>(value: string): T {
  return value.toLowerCase() as T;
}
