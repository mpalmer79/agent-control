import { failureFromUnknown, success } from "@/lib/api/responses";
import { correlationIdFromRequest } from "@/lib/observability/correlation";
import { listApprovals } from "@/server/modules/governance/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const correlationId = correlationIdFromRequest(request);
  try {
    const { data, source } = await listApprovals(correlationId);
    return success(data, correlationId, { meta: { source } });
  } catch (error) {
    return failureFromUnknown(error, correlationId);
  }
}
