import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { DemoModeBanner } from "@/components/shared/demo-mode-banner";
import { DetailCard } from "@/components/shared/detail-card";
import { CostSignalBadge } from "@/components/observability/cost-signal-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { correlationIdFromHeaders } from "@/server/request";
import { getCostDetail } from "@/server/views";

export const metadata: Metadata = { title: "Costs" };

function Breakdown({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; estimatedCost: number }[];
}) {
  return (
    <DetailCard title={title}>
      <ul className="space-y-2">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-center justify-between text-sm capitalize"
          >
            <span>{row.label}</span>
            <span className="text-muted-foreground">
              {formatCurrency(row.estimatedCost)}
            </span>
          </li>
        ))}
      </ul>
    </DetailCard>
  );
}

export default async function CostsPage() {
  const correlationId = await correlationIdFromHeaders();
  const { data: cost, source } = await getCostDetail(correlationId);

  return (
    <>
      <PageHeader
        title="Costs"
        description="Estimated spend by agent, provider, and environment, with budget signals."
      />
      <DemoModeBanner source={source} />

      <Alert>
        <AlertTitle>Estimated and demo-seeded</AlertTitle>
        <AlertDescription>
          Cost values are estimated from seeded token usage and model pricing.
          No billing APIs are connected.
        </AlertDescription>
      </Alert>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estimated daily cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {formatCurrency(cost.estimatedDaily)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estimated monthly cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {formatCurrency(cost.estimatedMonthly)}
            </p>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Breakdown title="By agent" rows={cost.byAgent} />
        <Breakdown title="By provider" rows={cost.byProvider} />
        <Breakdown title="By environment" rows={cost.byEnvironment} />
      </div>

      <DetailCard
        title="Budget signals"
        description="Estimated spend against the configured budget"
      >
        <ul className="space-y-2">
          {cost.budgetSignals.map((signal) => (
            <li
              key={signal.scope}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span>{signal.scope}</span>
              <span className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  {formatCurrency(signal.estimatedCost)} of{" "}
                  {formatCurrency(signal.threshold)}
                </span>
                <CostSignalBadge level={signal.level} />
              </span>
            </li>
          ))}
        </ul>
      </DetailCard>
    </>
  );
}
