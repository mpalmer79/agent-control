import { failureFromUnknown, success } from "@/lib/api/responses";
import { correlationIdFromRequest } from "@/lib/observability/correlation";
import { promoteDeployment } from "@/server/modules/deployments/service";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const correlationId = correlationIdFromRequest(request);
  try {
    const { id } = await params;
    const result = await promoteDeployment(correlationId, { deploymentId: id });
    return success(result, correlationId, {
      status: result.status === "blocked" ? 422 : 200,
    });
  } catch (error) {
    return failureFromUnknown(error, correlationId);
  }
}
