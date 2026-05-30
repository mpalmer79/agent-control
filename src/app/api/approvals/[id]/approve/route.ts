import { failureFromUnknown, success } from "@/lib/api/responses";
import { parseJson } from "@/lib/api/parse";
import { approveSchema } from "@/lib/validation";
import { correlationIdFromRequest } from "@/lib/observability/correlation";
import { approveApproval } from "@/server/modules/governance/service";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const correlationId = correlationIdFromRequest(request);
  try {
    const { id } = await params;
    const body = await parseJson(request, approveSchema);
    const result = await approveApproval(correlationId, id, body.reason);
    return success(result, correlationId, {
      status: result.status === "blocked" ? 422 : 200,
    });
  } catch (error) {
    return failureFromUnknown(error, correlationId);
  }
}
