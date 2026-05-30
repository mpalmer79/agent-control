import { failureFromUnknown, success } from "@/lib/api/responses";
import { correlationIdFromRequest } from "@/lib/observability/correlation";
import { listDeployments } from "@/server/views";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const correlationId = correlationIdFromRequest(request);
  try {
    const { data, source } = await listDeployments(correlationId);
    return success(data, correlationId, { meta: { source } });
  } catch (error) {
    return failureFromUnknown(error, correlationId);
  }
}
