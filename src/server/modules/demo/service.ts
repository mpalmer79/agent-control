import { seedOrganization } from "@/data/seed";
import { env, isDatabaseConfigured } from "@/lib/config/env";
import { ForbiddenError } from "@/lib/errors";
import { logger } from "@/lib/observability/logger";
import { prisma } from "@/lib/prisma/client";
import { auditRepository, organizationRepository } from "@/server/repositories";
import { runDemoSeed, type SeedCounts } from "./seed-runner";

export interface DemoStatus {
  demoMode: boolean;
  environment: string;
  databaseConfigured: boolean;
  seededDataExpected: boolean;
  resetAllowed: boolean;
}

export function getDemoStatus(): DemoStatus {
  const isProduction = env.nodeEnv === "production";
  const resetAllowed =
    (env.demoMode || env.allowDemoReset) &&
    (!isProduction || env.allowDemoReset);
  return {
    demoMode: env.demoMode,
    environment: env.environmentLabel,
    databaseConfigured: isDatabaseConfigured(),
    seededDataExpected: env.demoMode,
    resetAllowed,
  };
}

export interface ResetResult {
  reset: boolean;
  reason: string;
  counts: SeedCounts | null;
}

// Reset the demo dataset. Guarded so it cannot run in production unless
// explicitly allowed, and only when demo mode or the reset flag is set. When a
// database is not configured there is nothing to reset.
export async function resetDemoData(
  correlationId: string,
): Promise<ResetResult> {
  const isProduction = env.nodeEnv === "production";

  if (isProduction && !env.allowDemoReset) {
    throw new ForbiddenError(
      "Demo reset is disabled in production. Set ALLOW_DEMO_RESET to enable it.",
    );
  }

  if (!env.demoMode && !env.allowDemoReset) {
    throw new ForbiddenError(
      "Demo reset requires demo mode or ALLOW_DEMO_RESET to be enabled.",
    );
  }

  logger.info("demo reset requested", { correlationId });

  if (!isDatabaseConfigured()) {
    return {
      reset: false,
      reason: "Database is not configured; there is nothing to reset.",
      counts: null,
    };
  }

  const counts = await runDemoSeed(prisma);

  const organization = await organizationRepository.findBySlug(
    seedOrganization.slug,
  );
  if (organization) {
    await auditRepository.create({
      organizationId: organization.id,
      action: "demo.reset",
      resourceType: "organization",
      resourceId: organization.id,
      correlationId,
    });
  }

  logger.info("demo reset completed", { correlationId, counts });

  return { reset: true, reason: "Demo dataset reset.", counts };
}
