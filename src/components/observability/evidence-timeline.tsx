import {
  Bot,
  FileWarning,
  Rocket,
  ScrollText,
  Send,
  ShieldCheck,
  Banknote,
} from "lucide-react";

import { formatDate } from "@/lib/utils";
import type { TraceEntry, TraceEntryKind } from "@/types/observability";

const KIND_ICON: Record<TraceEntryKind, typeof Bot> = {
  audit: ScrollText,
  outbox: Send,
  incident: FileWarning,
  cost: Banknote,
  deployment: Rocket,
  approval: ShieldCheck,
};

// A vertical evidence timeline used by incident detail and trace detail. Each
// entry shows its kind, title, detail, and timestamp.
export function EvidenceTimeline({ entries }: { entries: TraceEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No evidence recorded.</p>
    );
  }
  return (
    <ol className="relative space-y-4 border-l pl-6">
      {entries.map((entry) => {
        const Icon = KIND_ICON[entry.kind] ?? Bot;
        return (
          <li key={entry.id} className="relative">
            <span
              className="absolute -left-[1.65rem] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-background"
              aria-hidden="true"
            >
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </span>
            <p className="text-sm font-medium capitalize">
              {entry.kind}: {entry.title}
            </p>
            <p className="text-xs text-muted-foreground">{entry.detail}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(entry.timestamp)}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
