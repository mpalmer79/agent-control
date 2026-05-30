import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { DetailCard } from "@/components/shared/detail-card";
import { TraceLink } from "@/components/observability/trace-link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Walkthrough" };

interface Step {
  n: number;
  title: string;
  detail: string;
  href: string;
  linkLabel: string;
}

const STEPS: Step[] = [
  {
    n: 1,
    title: "Start at the dashboard",
    detail:
      "The operational health score is reduced by an open incident and a failed evaluation. The attention banner points you at the problem.",
    href: "/dashboard",
    linkLabel: "Open dashboard",
  },
  {
    n: 2,
    title: "Open the high-risk agent",
    detail:
      "The Fraud Triage Agent is high risk with an elevated error rate. Its active version is v3.",
    href: "/agents/fraud",
    linkLabel: "Open Fraud Triage Agent",
  },
  {
    n: 3,
    title: "Review the deployment evidence",
    detail:
      "The v3 production deployment has a failed safety evaluation. A prior stable v2 deployment is preserved as a rollback target.",
    href: "/deployments/fraud-v3-prod",
    linkLabel: "Open deployment detail",
  },
  {
    n: 4,
    title: "Open the incident",
    detail:
      "A high-severity incident records the cost spike and elevated error rate, with the triggering signal and a recommended action.",
    href: "/incidents/fraud-cost",
    linkLabel: "Open incident detail",
  },
  {
    n: 5,
    title: "Follow the correlation trace",
    detail:
      "One correlation ID joins the deployment, the failed evaluation, the cost record, the incident, the audit events, and the outbox event into one time-ordered timeline.",
    href: "/traces/corr_fraud_v3",
    linkLabel: "Open the trace",
  },
  {
    n: 6,
    title: "Review the governance story",
    detail:
      "A separate high-risk change (Billing Assistant v2) is pending approval. Approvals are immutable, reason-required for rejection, and fail closed.",
    href: "/governance",
    linkLabel: "Open governance",
  },
  {
    n: 7,
    title: "Confirm the audit trail",
    detail:
      "Every significant action is append-only audit evidence, linked by correlation ID. This is what makes the platform provable.",
    href: "/audit",
    linkLabel: "Open audit",
  },
];

export default function WalkthroughPage() {
  return (
    <>
      <PageHeader
        title="Reviewer walkthrough"
        description="A guided path through the operational evidence story. Follow the steps in order."
      />

      <Alert>
        <AlertTitle>Demo-seeded and simulated</AlertTitle>
        <AlertDescription>
          This walkthrough runs on seeded demo data with a simulated runtime.
          There are no live AI provider calls and no real customer data. The
          demo spine follows correlation ID{" "}
          <TraceLink correlationId="corr_fraud_v3" />.
        </AlertDescription>
      </Alert>

      <ol className="space-y-4">
        {STEPS.map((step) => (
          <li key={step.n}>
            <DetailCard title={`${step.n}. ${step.title}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">{step.detail}</p>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  <Link href={step.href}>
                    {step.linkLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </DetailCard>
          </li>
        ))}
      </ol>

      <DetailCard title="Why Agent Control matters">
        <p className="text-sm text-muted-foreground">
          Production AI needs the same operational rigor as any critical
          software platform: control, visibility, policy, human review, cost
          awareness, versioning, rollback, and evidence. Agent Control shows a
          regression shipping, being detected, governed, audited, and reversed,
          with a single correlation ID proving the whole story.
        </p>
      </DetailCard>
    </>
  );
}
