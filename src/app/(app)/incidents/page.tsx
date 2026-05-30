import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { DemoModeBanner } from "@/components/shared/demo-mode-banner";
import { StatusBadge } from "@/components/shared/status-badge";
import { TraceLink } from "@/components/observability/trace-link";
import { EmptyState } from "@/components/shared/empty-state";
import { DetailCard } from "@/components/shared/detail-card";
import {
  INCIDENT_SEVERITY_INTENT,
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_STATUS_INTENT,
  INCIDENT_STATUS_LABELS,
} from "@/lib/constants/status";
import { formatDate } from "@/lib/utils";
import { correlationIdFromHeaders } from "@/server/request";
import { listIncidents } from "@/server/views";

export const metadata: Metadata = { title: "Incidents" };

export default async function IncidentsPage() {
  const correlationId = await correlationIdFromHeaders();
  const { data: incidents, source } = await listIncidents(correlationId);

  return (
    <>
      <PageHeader
        title="Incidents"
        description="Operational incidents raised from cost spikes, error rates, and provider issues."
      />
      <DemoModeBanner source={source} />

      {incidents.length === 0 ? (
        <EmptyState title="No incidents" />
      ) : (
        <div className="space-y-4">
          {incidents.map((incident) => (
            <DetailCard
              key={incident.id}
              title={incident.title}
              description={`Severity ${incident.severity}`}
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    label={INCIDENT_SEVERITY_LABELS[incident.severity]}
                    intent={INCIDENT_SEVERITY_INTENT[incident.severity]}
                  />
                  <StatusBadge
                    label={INCIDENT_STATUS_LABELS[incident.status]}
                    intent={INCIDENT_STATUS_INTENT[incident.status]}
                  />
                  <span className="text-sm text-muted-foreground">
                    {incident.agentName}
                  </span>
                </div>
                {incident.description ? (
                  <p className="text-sm">{incident.description}</p>
                ) : null}
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span>Created {formatDate(incident.createdAt)}</span>
                  {incident.resolvedAt ? (
                    <span>Resolved {formatDate(incident.resolvedAt)}</span>
                  ) : (
                    <span>Unresolved</span>
                  )}
                  <span className="flex items-center gap-1">
                    Correlation{" "}
                    <TraceLink correlationId={incident.correlationId} />
                  </span>
                  <Link
                    href={`/incidents/${incident.id}`}
                    className="text-primary hover:underline"
                  >
                    View detail
                  </Link>
                </div>
              </div>
            </DetailCard>
          ))}
        </div>
      )}
    </>
  );
}
