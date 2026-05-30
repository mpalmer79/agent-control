import { failureFromUnknown, success } from "@/lib/api/responses";
import { parseJson } from "@/lib/api/parse";
import { rollbackSchema } from "@/lib/validation";
import { correlationIdFromRequest } from "@/lib/observability/correlation";
import { rollbackDeployment } from "@/server/modules/deployments/service";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const correlationId = correlationIdFromRequest(request);
  try {
    const { id } = await params;
    const body = await parseJson(request, rollbackSchema);
    const result = await rollbackDeployment(correlationId, {
      deploymentId: id,
      targetDeploymentId: body.targetDeploymentId,
    });
    return success(result, correlationId, {
      status: result.status === "blocked" ? 422 : 200,
    });
  } catch (error) {
    return failureFromUnknown(error, correlationId);
  }
}
