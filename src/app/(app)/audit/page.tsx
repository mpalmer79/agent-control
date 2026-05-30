import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { DemoModeBanner } from "@/components/shared/demo-mode-banner";
import { CorrelationId } from "@/components/shared/correlation-id";
import { EmptyState } from "@/components/shared/empty-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { correlationIdFromHeaders } from "@/server/request";
import { listAuditEvents } from "@/server/views";

export const metadata: Metadata = { title: "Audit" };

export default async function AuditPage() {
  const correlationId = await correlationIdFromHeaders();
  const { data: events, source } = await listAuditEvents(correlationId);

  return (
    <>
      <PageHeader
        title="Audit"
        description="Append-only history of significant actions, linked by correlation ID."
      />
      <DemoModeBanner source={source} />

      <Alert>
        <AlertTitle>Immutable evidence</AlertTitle>
        <AlertDescription>
          Audit records are append-only. They are never edited or deleted.
          Filtering and export arrive in a later phase; the controls below are a
          shell preview.
        </AlertDescription>
      </Alert>

      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Filter by actor (coming in a later phase)"
          disabled
          className="max-w-xs"
        />
        <Input
          placeholder="Filter by action (coming in a later phase)"
          disabled
          className="max-w-xs"
        />
      </div>

      {events.length === 0 ? (
        <EmptyState title="No audit events" />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Correlation</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">
                      {event.action}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {event.actor}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {event.resourceType}: {event.resourceId}
                    </TableCell>
                    <TableCell>
                      <CorrelationId value={event.correlationId} />
                    </TableCell>
                    <TableCell>
                      {event.hasStateSnapshot ? (
                        <Badge variant="outline">Snapshot</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          n/a
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(event.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
