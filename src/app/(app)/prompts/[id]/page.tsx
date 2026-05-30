import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { DemoModeBanner } from "@/components/shared/demo-mode-banner";
import { DetailCard, DetailList } from "@/components/shared/detail-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Timeline } from "@/components/shared/timeline";
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
  PROMPT_VERSION_STATUS_INTENT,
  PROMPT_VERSION_STATUS_LABELS,
} from "@/lib/constants/status";
import { formatDate } from "@/lib/utils";
import { correlationIdFromHeaders } from "@/server/request";
import { getPromptDetail } from "@/server/views";

export const metadata: Metadata = { title: "Prompt detail" };

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const correlationId = await correlationIdFromHeaders();
  const { data: prompt, source } = await getPromptDetail(correlationId, id);

  if (!prompt) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={prompt.name}
        description={prompt.description ?? undefined}
        actions={
          <Link
            href="/prompts"
            className="text-sm text-muted-foreground hover:underline"
          >
            Back to prompts
          </Link>
        }
      />
      <DemoModeBanner source={source} />

      <DetailCard title="Overview">
        <DetailList
          items={[
            { label: "Current version", value: prompt.currentVersion ?? "n/a" },
            {
              label: "Status",
              value: (
                <StatusBadge
                  label={PROMPT_VERSION_STATUS_LABELS[prompt.status]}
                  intent={PROMPT_VERSION_STATUS_INTENT[prompt.status]}
                />
              ),
            },
            { label: "Change reason", value: prompt.changeReason ?? "n/a" },
            {
              label: "Variables",
              value: prompt.variables.join(", ") || "none",
            },
            {
              label: "Related agents",
              value: prompt.relatedAgents.join(", ") || "none",
            },
          ]}
        />
      </DetailCard>

      <DetailCard
        title="Latest template preview"
        description="Prompt versions are immutable. Editing creates a new version."
      >
        <pre className="overflow-x-auto rounded-md bg-muted p-4 text-sm">
          {prompt.templatePreview}
        </pre>
      </DetailCard>

      <DetailCard title="Version history">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Change reason</TableHead>
              <TableHead>Created by</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prompt.versions.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-medium">
                  {v.version}
                  {v.isCurrent ? (
                    <Badge variant="outline" className="ml-2">
                      Current
                    </Badge>
                  ) : null}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={PROMPT_VERSION_STATUS_LABELS[v.status]}
                    intent={PROMPT_VERSION_STATUS_INTENT[v.status]}
                  />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {v.changeReason ?? "n/a"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {v.createdBy}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(v.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DetailCard>

      {prompt.auditEvents.length > 0 ? (
        <DetailCard title="Recent audit events">
          <Timeline
            entries={prompt.auditEvents.map((e) => ({
              id: e.id,
              title: e.action,
              meta: e.actor,
              timestamp: e.createdAt,
            }))}
          />
        </DetailCard>
      ) : null}
    </>
  );
}
