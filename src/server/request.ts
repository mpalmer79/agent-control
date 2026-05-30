// Server helper to derive the correlation ID for a server component render.
//
// Reads the incoming x-correlation-id header when present (set by middleware or
// upstream), otherwise generates one. Server components use this so their data
// loads share the request correlation ID.

import { headers } from "next/headers";

import { getCorrelationId } from "@/lib/observability/correlation";

export async function correlationIdFromHeaders(): Promise<string> {
  const headerList = await headers();
  return getCorrelationId(headerList as unknown as Headers);
}
