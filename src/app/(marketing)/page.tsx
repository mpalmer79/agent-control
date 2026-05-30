import Link from "next/link";
import { Boxes, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PRODUCT } from "@/lib/constants/product";
import { ROUTES } from "@/lib/constants/routes";

const CAPABILITIES = [
  {
    title: "Govern every change",
    description:
      "Risk-based approvals and policy checks that fail closed for high-risk actions.",
  },
  {
    title: "See production clearly",
    description:
      "Agent health, cost, evaluations, and incidents in one control plane.",
  },
  {
    title: "Prove what happened",
    description:
      "Append-only audit history linked by correlation IDs across the system.",
  },
  {
    title: "Recover safely",
    description:
      "Versioned prompts and deployments with a clean rollback path.",
  },
];

export default function MarketingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b px-6">
        <div className="flex items-center gap-2">
          <Boxes className="h-6 w-6 text-primary" aria-hidden="true" />
          <span className="font-semibold">{PRODUCT.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={ROUTES.walkthrough}>Start here</Link>
          </Button>
          <Button asChild size="sm">
            <Link href={ROUTES.dashboard}>
              Open control plane
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-16">
        <section className="space-y-4">
          <p className="text-sm font-medium text-muted-foreground">
            {PRODUCT.tagline}
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Operate production AI with control, visibility, and evidence.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            {PRODUCT.name} is a control plane for managing, governing, and
            observing production AI agents. It treats AI operations with the
            same rigor expected of any other production-critical platform.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild>
              <Link href={ROUTES.walkthrough}>
                Start the walkthrough
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={ROUTES.dashboard}>View the dashboard</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {CAPABILITIES.map((capability) => (
            <Card key={capability.title}>
              <CardHeader>
                <CardTitle className="text-lg">{capability.title}</CardTitle>
                <CardDescription>{capability.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Available across the agent lifecycle.
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            The demo story
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            A regression ships to production, evaluations and metrics catch it,
            an incident is raised, governance enforces review on a separate
            high-risk change, and the operator rolls back safely. One
            correlation ID joins the deployment, evaluation, cost spike,
            incident, audit events, and outbox events into a single timeline.
          </p>
        </section>

        <section className="rounded-lg border bg-muted/40 p-6">
          <h2 className="text-lg font-semibold">Safety and simulation</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            This is a portfolio MVP. The runtime is simulated and all telemetry
            is demo-seeded. There are no live AI provider calls, no real
            customer data, and no secrets. The control plane renders without a
            database or authentication keys; configure them to enable
            persistence and login.
          </p>
        </section>
      </main>

      <footer className="border-t px-6 py-6 text-sm text-muted-foreground">
        {PRODUCT.name}. {PRODUCT.tagline}. Repository: {PRODUCT.repository}.
      </footer>
    </div>
  );
}
