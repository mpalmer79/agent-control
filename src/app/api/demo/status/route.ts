import { success } from "@/lib/api/responses";
import { correlationIdFromRequest } from "@/lib/observability/correlation";
import { getDemoStatus } from "@/server/modules/demo/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const correlationId = correlationIdFromRequest(request);
  return success(getDemoStatus(), correlationId);
}
