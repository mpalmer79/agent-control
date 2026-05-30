// Renders a correlation ID in a monospace chip. The correlation ID links a
// request across deployments, costs, audit events, and incidents.
export function CorrelationId({ value }: { value: string }) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
      {value}
    </code>
  );
}
