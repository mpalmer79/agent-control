import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { DetailCard, DetailList } from "@/components/shared/detail-card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PRODUCT } from "@/lib/constants/product";
import { env, isClerkConfigured, isDatabaseConfigured } from "@/lib/config/env";
import { getDemoStatus } from "@/server/modules/demo/service";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  const demo = getDemoStatus();
  const clerk = isClerkConfigured();
  const database = isDatabaseConfigured();

  return (
    <>
      <PageHeader
        title="Settings"
        description="Environment, demo mode, and platform status."
      />

      <DetailCard title="Environment">
        <DetailList
          items={[
            { label: "Product", value: PRODUCT.name },
            { label: "Version", value: env.appVersion },
            {
              label: "Environment",
              value: <span className="capitalize">{env.environmentLabel}</span>,
            },
            {
              label: "Demo mode",
              value: (
                <Badge variant={demo.demoMode ? "warning" : "secondary"}>
                  {demo.demoMode ? "On" : "Off"}
                </Badge>
              ),
            },
            {
              label: "Database",
              value: (
                <Badge variant={database ? "success" : "secondary"}>
                  {database ? "Configured" : "Not configured"}
                </Badge>
              ),
            },
            {
              label: "Authentication (Clerk)",
              value: (
                <Badge variant={clerk ? "success" : "secondary"}>
                  {clerk ? "Configured" : "Not configured"}
                </Badge>
              ),
            },
          ]}
        />
      </DetailCard>

      <Alert>
        <AlertTitle>Simulation notice</AlertTitle>
        <AlertDescription>
          When no database is configured, data is served from a seeded demo
          scenario and workflow actions return simulated results. There are no
          live AI provider calls. Configure DATABASE_URL and Clerk keys to
          enable persistence and authentication.
        </AlertDescription>
      </Alert>

      <DetailCard
        title="Platform endpoints"
        description="Operational endpoints for status checks"
      >
        <ul className="space-y-2 text-sm">
          <li>
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              GET /api/health
            </code>{" "}
            service, environment, version, and database status.
          </li>
          <li>
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              GET /api/demo/status
            </code>{" "}
            demo mode and reset eligibility.
          </li>
          <li>
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              POST /api/demo/reset
            </code>{" "}
            guarded demo dataset reset (development or demo mode only).
          </li>
        </ul>
      </DetailCard>

      <DetailCard
        title="Planned configuration"
        description="Arriving with persistence and authentication hardening"
      >
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Members and role-based access control management.</li>
          <li>
            Model registry editing with provider, cost, and risk metadata.
          </li>
          <li>
            Environment configuration for development, staging, and production.
          </li>
          <li>Clerk-backed organization and role mapping.</li>
        </ul>
      </DetailCard>
    </>
  );
}
