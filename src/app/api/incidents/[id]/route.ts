import { failureFromUnknown, notFound, success } from "@/lib/api/responses";
import { correlationIdFromRequest } from "@/lib/observability/correlation";
import { getIncidentDetail } from "@/server/views";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const correlationId = correlationIdFromRequest(request);
  try {
    const { id } = await params;
    const { data, source } = await getIncidentDetail(correlationId, id);
    if (!data) {
      return notFound("Incident not found", correlationId);
    }
    return success(data, correlationId, { meta: { source } });
  } catch (error) {
    return failureFromUnknown(error, correlationId);
  }
}
