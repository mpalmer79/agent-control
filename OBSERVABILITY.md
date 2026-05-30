# Observability

The observability strategy for Agent Control: logs, metrics, traces, correlation
IDs, dashboards, and incidents. This aligns with ARCHITECTURE.md (Observability
Platform) and SYSTEM_DESIGN.md sections 4.9 and 16. Observability is a
first-class capability, not an afterthought.

## MVP Telemetry Strategy

The MVP uses a simulated runtime. Telemetry is generated from seeded and
simulated activity so the demo is reliable and free of live provider
dependencies. The shape of the telemetry matches what a real runtime would
produce, so the transition to real providers (behind a protected admin mode)
does not change the observability model.

Principles:

- Structured logs, numeric metrics, and traces share a correlation ID.
- Telemetry never blocks safe core operations; if observability storage degrades, low-risk runtime calls continue with delayed telemetry.
- Incidents are derived from metrics and recorded as durable records in PostgreSQL.

## Correlation IDs

- The API gateway attaches a correlation_id to every request.
- The correlation_id flows through service logs, provider calls, cost records, audit events, traces, and incidents.
- A single correlation_id lets an operator reconstruct an entire request lifecycle. The trace lookup endpoint is GET /api/traces/{correlation_id}.

## Logs

Logs are JSON structured. Every log line carries service, message, level, and
correlation_id, plus relevant resource identifiers.

```json
{
  "level": "info",
  "service": "deployment-service",
  "message": "deployment promoted",
  "deployment_id": "uuid",
  "agent_id": "uuid",
  "environment": "production",
  "correlation_id": "uuid"
}
```

Logging rules:

- No secrets, no full prompt payloads, and no sensitive customer data in logs.
- Use consistent field names across modules.
- Log at the boundary of significant actions and at error points.

## Metrics

Minimum required metrics (per SYSTEM_DESIGN.md section 16.3):

- api_request_count
- api_request_latency_ms
- agent_runtime_latency_ms
- model_provider_error_count
- model_provider_latency_ms
- deployment_success_count
- deployment_failure_count
- approval_queue_depth
- evaluation_pass_rate
- estimated_cost_usd

Additional operational metrics from the architecture:

- request volume, error rate, success rate, retry count.
- token usage, cost per request, cost per agent, provider failure rate.
- task completion rate, escalation rate, evaluation pass rate.
- approval frequency, rejection frequency, average approval time.

Latency is tracked at P50, P95, and P99 where applicable.

## Traces

- Use OpenTelemetry for distributed traces.
- Spans cover the API gateway, service handler, database query, provider adapter, evaluation runner, and event publisher.
- Each span carries the correlation_id so traces join logs and audit records.

## Dashboards

The MVP surfaces dashboards through the web control plane:

- Executive Summary: cost trends, risk overview, reliability at a glance.
- Cost Dashboard: cost per agent, aggregate spend, and budget signals (simulated data).
- Agent Metrics: request volume, latency, error rate, evaluation pass rate per agent.
- Approval Queue: pending approvals and queue depth.
- Incident Dashboard: open and resolved incidents.
- Audit Explorer: searchable audit history.

Dashboards render server-provided state and call the observability and cost APIs.
They contain no business rules.

## Incidents

Incidents are durable records created when observability detects a condition that
warrants attention.

Triggers for the MVP:

- Cost spike: spend exceeds an expected threshold for an agent or environment.
- Elevated error rate: error rate crosses a configured threshold.
- Bad prompt deployment: post-promotion regression detected by evaluation or metrics.
- Provider outage: provider error rate triggers the circuit breaker.

Each incident records severity, status, title, description, agent reference,
correlation_id, created_at, and resolved_at. Incident creation emits an
IncidentCreated event and writes an audit event. Incident lifecycle changes are
audited.

## Graceful Degradation

- If observability storage is temporarily unavailable, low-risk runtime calls continue and telemetry is delayed, not dropped silently where avoidable.
- High-risk actions still depend on governance checks; observability degradation does not relax governance.
- Provider failures open a circuit breaker and may create an incident.

## Future Production Observability

- OpenTelemetry collectors, Prometheus for metrics, and Grafana for dashboards.
- Centralized logging.
- Object storage for large trace payloads.
- Data retention lifecycle for high-volume telemetry, distinct from audit retention.
