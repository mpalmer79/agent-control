import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { demoIncidents } from "@/lib/mock/demo-data";
import {
  INCIDENT_SEVERITY_INTENT,
  INCIDENT_SEVERITY_LABELS,
} from "@/lib/constants/status";
import { formatDate } from "@/lib/utils";

export function IncidentPreview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Incidents</CardTitle>
        <CardDescription>Open and recently resolved incidents</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {demoIncidents.map((incident) => (
          <div
            key={incident.id}
            className="flex items-start justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
          >
            <div className="space-y-1">
              <p className="text-sm font-medium">{incident.title}</p>
              <p className="text-xs text-muted-foreground">
                {incident.agentName}, {formatDate(incident.createdAt)},{" "}
                <span className="capitalize">{incident.status}</span>
              </p>
            </div>
            <StatusBadge
              label={INCIDENT_SEVERITY_LABELS[incident.severity]}
              intent={INCIDENT_SEVERITY_INTENT[incident.severity]}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
