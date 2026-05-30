import { failureFromUnknown, notFound, success } from "@/lib/api/responses";
import { correlationIdFromRequest } from "@/lib/observability/correlation";
import { getAgentDetail } from "@/server/views";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const correlationId = correlationIdFromRequest(request);
  try {
    const { id } = await params;
    const { data, source } = await getAgentDetail(correlationId, id);
    if (!data) {
      return notFound("Agent not found", correlationId);
    }
    return success(data.incidents, correlationId, { meta: { source } });
  } catch (error) {
    return failureFromUnknown(error, correlationId);
  }
}
