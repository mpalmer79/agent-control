import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { DemoModeBanner } from "@/components/shared/demo-mode-banner";
import { EmptyState } from "@/components/shared/empty-state";
import { OutboxStatusBadge } from "@/components/observability/outbox-status-badge";
import { TraceLink } from "@/components/observability/trace-link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
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
import { getOutboxSummary } from "@/server/views";

export const metadata: Metadata = { title: "Outbox" };

export default async function OutboxPage() {
  const correlationId = await correlationIdFromHeaders();
  const { data: outbox, source } = await getOutboxSummary(correlationId);

  return (
    <>
      <PageHeader
        title="Outbox"
        description="Domain events written transactionally with business state changes, awaiting publication."
      />
      <DemoModeBanner source={source} />

      <Alert>
        <AlertTitle>No external publisher yet</AlertTitle>
        <AlertDescription>
          Outbox events are written in the same transaction as the workflow
          state change. A background publisher to external systems is a later
          phase, so events remain pending in the MVP.
        </AlertDescription>
      </Alert>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-semibold">{outbox.pending}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-semibold">{outbox.published}</p>
            <p className="text-sm text-muted-foreground">Published</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-semibold">{outbox.failed}</p>
            <p className="text-sm text-muted-foreground">Failed</p>
          </CardContent>
        </Card>
      </section>

      {outbox.recent.length === 0 ? (
        <EmptyState title="No outbox events" />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event type</TableHead>
                  <TableHead>Aggregate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Correlation</TableHead>
                  <TableHead>Occurred</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outbox.recent.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">
                      {event.eventType}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {event.aggregateType}: {event.aggregateId}
                    </TableCell>
                    <TableCell>
                      <OutboxStatusBadge status={event.status} />
                    </TableCell>
                    <TableCell>
                      <TraceLink correlationId={event.correlationId} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(event.occurredAt)}
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
