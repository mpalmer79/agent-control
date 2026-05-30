import { success } from "@/lib/api/responses";
import { env, isDatabaseConfigured } from "@/lib/config/env";
import { PRODUCT } from "@/lib/constants/product";
import { correlationIdFromRequest } from "@/lib/observability/correlation";
import { prisma } from "@/lib/prisma/client";

export const dynamic = "force-dynamic";

type DatabaseStatus = "ok" | "error" | "not_configured";

async function checkDatabase(): Promise<DatabaseStatus> {
  if (!isDatabaseConfigured()) {
    return "not_configured";
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    return "ok";
  } catch {
    return "error";
  }
}

export async function GET(request: Request) {
  const correlationId = correlationIdFromRequest(request);
  const database = await checkDatabase();
  const status = database === "error" ? "degraded" : "ok";

  return success(
    {
      service: PRODUCT.repository,
      status,
      version: env.appVersion,
      environment: env.environmentLabel,
      database,
      timestamp: new Date().toISOString(),
    },
    correlationId,
  );
}
