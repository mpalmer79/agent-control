import { formatDate } from "@/lib/utils";

export interface TimelineEntry {
  id: string;
  title: string;
  meta?: string;
  timestamp?: string | null;
}

// A vertical timeline for audit trails and activity history.
export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="relative space-y-4 border-l pl-6">
      {entries.map((entry) => (
        <li key={entry.id} className="relative">
          <span
            className="absolute -left-[1.6rem] top-1.5 h-2 w-2 rounded-full bg-primary"
            aria-hidden="true"
          />
          <p className="text-sm font-medium">{entry.title}</p>
          {entry.meta ? (
            <p className="text-xs text-muted-foreground">{entry.meta}</p>
          ) : null}
          {entry.timestamp ? (
            <p className="text-xs text-muted-foreground">
              {formatDate(entry.timestamp)}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
