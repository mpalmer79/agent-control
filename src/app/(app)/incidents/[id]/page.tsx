import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { DemoModeBanner } from "@/components/shared/demo-mode-banner";
import { DetailCard, DetailList } from "@/components/shared/detail-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { CorrelationId } from "@/components/shared/correlation-id";
import { EvidenceTimeline } from "@/components/observability/evidence-timeline";
import { TraceLink } from "@/components/observability/trace-link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  INCIDENT_SEVERITY_INTENT,
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_STATUS_INTENT,
  INCIDENT_STATUS_LABELS,
  evaluationPassIntent,
  evaluationPassLabel,
} from "@/lib/constants/status";
import { formatDate } from "@/lib/utils";
import { correlationIdFromHeaders } from "@/server/request";
import { getIncidentDetail } from "@/server/views";

export const metadata: Metadata = { title: "Incident detail" };

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const correlationId = await correlationIdFromHeaders();
  const { data: incident, source } = await getIncidentDetail(correlationId, id);

  if (!incident) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={incident.title}
        description={incident.description ?? undefined}
        actions={
          <Link
            href="/incidents"
            className="text-sm text-muted-foreground hover:underline"
          >
            Back to incidents
          </Link>
        }
      />
      <DemoModeBanner source={source} />

      <DetailCard title="Overview">
        <DetailList
          items={[
            {
              label: "Severity",
              value: (
                <StatusBadge
                  label={INCIDENT_SEVERITY_LABELS[incident.severity]}
                  intent={INCIDENT_SEVERITY_INTENT[incident.severity]}
                />
              ),
            },
            {
              label: "Status",
              value: (
                <StatusBadge
                  label={INCIDENT_STATUS_LABELS[incident.status]}
                  intent={INCIDENT_STATUS_INTENT[incident.status]}
                />
              ),
            },
            { label: "Agent", value: incident.agentName ?? "Platform" },
            { label: "Triggering signal", value: incident.signal },
            {
              label: "Correlation",
              value: <TraceLink correlationId={incident.correlationId} />,
            },
            { label: "Created", value: formatDate(incident.createdAt) },
            {
              label: "Resolved",
              value: incident.resolvedAt
                ? formatDate(incident.resolvedAt)
                : "Unresolved",
            },
          ]}
        />
      </DetailCard>

      <Alert>
        <AlertTitle>What happened</AlertTitle>
        <AlertDescription>{incident.narrative}</AlertDescription>
      </Alert>

      <DetailCard title="Related metrics">
        <DetailList
          items={incident.relatedMetrics.map((m) => ({
            label: m.label,
            value: m.value,
          }))}
        />
      </DetailCard>

      {incident.evaluationEvidence.length > 0 ? (
        <DetailCard title="Evaluation evidence">
          <ul className="space-y-2">
            {incident.evaluationEvidence.map((e) => (
              <li
                key={e.suiteName}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span>{e.suiteName}</span>
                <span className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {e.score === null ? "n/a" : e.score.toFixed(2)}
                  </span>
                  <StatusBadge
                    label={evaluationPassLabel(e.passed)}
                    intent={evaluationPassIntent(e.passed)}
                  />
                </span>
              </li>
            ))}
          </ul>
        </DetailCard>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <DetailCard title="Audit evidence">
          <EvidenceTimeline entries={incident.auditEvidence} />
        </DetailCard>
        <DetailCard title="Outbox evidence">
          <EvidenceTimeline entries={incident.outboxEvidence} />
        </DetailCard>
      </div>

      <Alert>
        <AlertTitle>Recommended action</AlertTitle>
        <AlertDescription>{incident.recommendedAction}</AlertDescription>
      </Alert>
    </>
  );
}
