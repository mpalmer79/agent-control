import { failureFromUnknown, success } from "@/lib/api/responses";
import { correlationIdFromRequest } from "@/lib/observability/correlation";
import { getTraceDetail } from "@/server/views";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ correlationId: string }> },
) {
  const requestCorrelationId = correlationIdFromRequest(request);
  try {
    const { correlationId } = await params;
    const { data, source } = await getTraceDetail(
      requestCorrelationId,
      correlationId,
    );
    return success(data, requestCorrelationId, { meta: { source } });
  } catch (error) {
    return failureFromUnknown(error, requestCorrelationId);
  }
}
