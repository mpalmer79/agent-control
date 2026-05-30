import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { DemoModeBanner } from "@/components/shared/demo-mode-banner";
import { EmptyState } from "@/components/shared/empty-state";
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
import { getTraceList } from "@/server/views";

export const metadata: Metadata = { title: "Traces" };

export default async function TracesPage() {
  const correlationId = await correlationIdFromHeaders();
  const { data: traces, source } = await getTraceList(correlationId);

  return (
    <>
      <PageHeader
        title="Traces"
        description="Correlation-ID evidence across audit, deployment, cost, incident, and outbox records."
      />
      <DemoModeBanner source={source} />

      {traces.length === 0 ? (
        <EmptyState title="No traces" />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Correlation</TableHead>
                  <TableHead>Context</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Latest</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {traces.map((trace) => (
                  <TableRow key={trace.correlationId}>
                    <TableCell className="font-mono text-xs">
                      <Link
                        href={`/traces/${trace.correlationId}`}
                        className="text-primary hover:underline"
                      >
                        {trace.correlationId}
                      </Link>
                    </TableCell>
                    <TableCell>{trace.label}</TableCell>
                    <TableCell>{trace.entryCount}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {trace.latest ? formatDate(trace.latest) : "n/a"}
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
