import {
  failureFromUnknown,
  success,
  validationError,
} from "@/lib/api/responses";
import { correlationIdFromRequest } from "@/lib/observability/correlation";
import { getAuditEventsForResource } from "@/server/views";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const correlationId = correlationIdFromRequest(request);
  try {
    const url = new URL(request.url);
    const resourceId = url.searchParams.get("resourceId");
    if (!resourceId) {
      return validationError(
        "The resourceId query parameter is required",
        correlationId,
      );
    }
    const { data, source } = await getAuditEventsForResource(
      correlationId,
      resourceId,
    );
    return success(data, correlationId, { meta: { source } });
  } catch (error) {
    return failureFromUnknown(error, correlationId);
  }
}
