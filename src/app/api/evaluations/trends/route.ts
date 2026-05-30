import { failureFromUnknown, success } from "@/lib/api/responses";
import { correlationIdFromRequest } from "@/lib/observability/correlation";
import { getEvaluationTrends } from "@/server/views";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const correlationId = correlationIdFromRequest(request);
  try {
    const { data, source } = await getEvaluationTrends(correlationId);
    return success(data, correlationId, { meta: { source } });
  } catch (error) {
    return failureFromUnknown(error, correlationId);
  }
}
