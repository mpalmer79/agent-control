import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { DemoModeBanner } from "@/components/shared/demo-mode-banner";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  EVALUATION_STATUS_INTENT,
  EVALUATION_STATUS_LABELS,
  evaluationPassIntent,
  evaluationPassLabel,
} from "@/lib/constants/status";
import { formatPercent } from "@/lib/utils";
import { correlationIdFromHeaders } from "@/server/request";
import { getEvaluationSummary, listEvaluations } from "@/server/views";

export const metadata: Metadata = { title: "Evaluations" };

export default async function EvaluationsPage() {
  const correlationId = await correlationIdFromHeaders();
  const [{ data: summary, source }, { data: evaluations }] = await Promise.all([
    getEvaluationSummary(correlationId),
    listEvaluations(correlationId),
  ]);

  const cards = [
    { label: "Pass rate", value: formatPercent(summary.passRate) },
    { label: "Completed", value: String(summary.total) },
    { label: "Passed", value: String(summary.passed) },
    { label: "Failed", value: String(summary.failed) },
  ];

  return (
    <>
      <PageHeader
        title="Evaluations"
        description="Functional, safety, and regression results. Failed evaluations block production promotion."
      />
      <DemoModeBanner source={source} />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {evaluations.length === 0 ? (
        <EmptyState title="No evaluation runs" />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Suite</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Gate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluations.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.agentName}</TableCell>
                    <TableCell>{e.suiteName}</TableCell>
                    <TableCell>{e.version}</TableCell>
                    <TableCell>
                      <StatusBadge
                        label={EVALUATION_STATUS_LABELS[e.status]}
                        intent={EVALUATION_STATUS_INTENT[e.status]}
                      />
                    </TableCell>
                    <TableCell>
                      {e.score === null ? "n/a" : e.score.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={evaluationPassLabel(e.passed)}
                        intent={evaluationPassIntent(e.passed)}
                      />
                    </TableCell>
                    <TableCell>
                      {e.blocksDeployment ? (
                        <Badge variant="destructive">Blocks deployment</Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Clear
                        </span>
                      )}
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
