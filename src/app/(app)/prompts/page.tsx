import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { DemoModeBanner } from "@/components/shared/demo-mode-banner";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { listPrompts } from "@/server/views";

export const metadata: Metadata = { title: "Prompts" };

export default async function PromptsPage() {
  const correlationId = await correlationIdFromHeaders();
  const { data: prompts, source } = await listPrompts(correlationId);

  return (
    <>
      <PageHeader
        title="Prompts"
        description="Versioned prompts treated as production assets. Editing creates a new immutable version."
      />
      <DemoModeBanner source={source} />

      {prompts.length === 0 ? (
        <EmptyState title="No prompts yet" />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prompt</TableHead>
                  <TableHead>Current version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Related agents</TableHead>
                  <TableHead>Created by</TableHead>
                  <TableHead>Last changed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prompts.map((prompt) => (
                  <TableRow key={prompt.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/prompts/${prompt.id}`}
                        className="hover:underline"
                      >
                        {prompt.name}
                      </Link>
                    </TableCell>
                    <TableCell>{prompt.currentVersion ?? "n/a"}</TableCell>
                    <TableCell>
                      <StatusBadge
                        label={PROMPT_VERSION_STATUS_LABELS[prompt.status]}
                        intent={PROMPT_VERSION_STATUS_INTENT[prompt.status]}
                      />
                    </TableCell>
                    <TableCell>{prompt.relatedAgentCount}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {prompt.createdBy}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {prompt.lastChanged
                        ? formatDate(prompt.lastChanged)
                        : "n/a"}
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
