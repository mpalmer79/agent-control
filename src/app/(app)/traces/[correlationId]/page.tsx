import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { DemoModeBanner } from "@/components/shared/demo-mode-banner";
import { DetailCard } from "@/components/shared/detail-card";
import { CorrelationId } from "@/components/shared/correlation-id";
import { EvidenceTimeline } from "@/components/observability/evidence-timeline";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { correlationIdFromHeaders } from "@/server/request";
import { getTraceDetail } from "@/server/views";

export const metadata: Metadata = { title: "Trace detail" };

export default async function TraceDetailPage({
  params,
}: {
  params: Promise<{ correlationId: string }>;
}) {
  const { correlationId: traceId } = await params;
  const requestCorrelationId = await correlationIdFromHeaders();
  const { data: trace, source } = await getTraceDetail(
    requestCorrelationId,
    traceId,
  );

  return (
    <>
      <PageHeader
        title="Trace"
        description="Evidence joined by a single correlation ID."
        actions={
          <Link
            href="/traces"
            className="text-sm text-muted-foreground hover:underline"
          >
            Back to traces
          </Link>
        }
      />
      <DemoModeBanner source={source} />

      <Alert>
        <AlertTitle>
          Correlation <CorrelationId value={trace.correlationId} />
        </AlertTitle>
        <AlertDescription>{trace.summary}</AlertDescription>
      </Alert>

      <div className="grid gap-4 sm:grid-cols-3">
        <DetailCard title="Audit records">
          <p className="text-2xl font-semibold">{trace.auditCount}</p>
        </DetailCard>
        <DetailCard title="Outbox records">
          <p className="text-2xl font-semibold">{trace.outboxCount}</p>
        </DetailCard>
        <DetailCard title="Incidents">
          <p className="text-2xl font-semibold">{trace.incidentCount}</p>
        </DetailCard>
      </div>

      <DetailCard
        title="Evidence timeline"
        description="Ordered by time across all evidence sources"
      >
        <EvidenceTimeline entries={trace.entries} />
      </DetailCard>
    </>
  );
}
