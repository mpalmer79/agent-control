# API Contracts

Planned HTTP API for Agent Control. This document defines resources, routes,
request and response structure, and the error model. It is a contract, not an
implementation. Routes align with SYSTEM_DESIGN.md section 9.

## Phase 2 Foundation Endpoints

Phase 2 implements read-only foundation endpoints under `src/app/api`. They use
a consistent envelope (see `src/lib/api/responses.ts`):

```json
{
  "success": true,
  "data": {},
  "meta": { "correlationId": "string", "source": "database | mock" }
}
```

Errors use the matching shape with `success: false` and `error.code`. Every
response sets the `x-correlation-id` header. Endpoints serve database data when
DATABASE_URL is configured and seed-derived demo data otherwise.

Phase 2 implemented: `GET /api/health`, `GET /api/demo/status`,
`POST /api/demo/reset` (guarded), and list reads for the core resources.

Phase 3 added read-only detail and summary endpoints, all using the same
envelope and correlation ID: `GET /api/agents/[id]`, `GET /api/agents/[id]/versions`,
`GET /api/agents/[id]/deployments`, `GET /api/agents/[id]/incidents`,
`GET /api/prompts/[id]`, `GET /api/prompts/[id]/versions`, `GET /api/models`,
`GET /api/deployments/[id]`, `GET /api/approvals/summary`,
`GET /api/evaluations/summary`, `GET /api/incidents/summary`, and
`GET /api/audit-events/resource?resourceId=...`.

Phase 4 added guarded mutation endpoints that return a typed workflow result
(`src/types/workflows.ts`) in the standard envelope: `POST /api/approvals/[id]/approve`,
`POST /api/approvals/[id]/reject` (reason required), `POST /api/deployments/request-promotion`,
`POST /api/deployments/[id]/promote`, `POST /api/deployments/[id]/rollback`, and
`GET /api/deployments/[id]/rollback-candidates`. These validate the body with
zod, resolve the principal, enforce permission in the service layer, and return
status 422 when policy blocks the action. A blocked action mutates nothing.
Without a database the result is `simulated` and carries no persisted evidence
IDs. Authorization is enforced via the role-to-permission model; full
Clerk-backed role mapping is a future hardening step.

Phase 5 added read-only operational evidence endpoints (standard envelope and
correlation ID): `GET /api/observability/overview`,
`GET /api/observability/agent-health`, `GET /api/observability/provider-health`,
`GET /api/observability/outbox`, `GET /api/traces`,
`GET /api/traces/[correlationId]`, `GET /api/incidents/[id]`,
`GET /api/costs/summary`, `GET /api/costs/by-agent`,
`GET /api/costs/by-provider`, `GET /api/costs/by-environment`,
`GET /api/evaluations/trends`, and
`GET /api/audit-events/correlation/[correlationId]`. The only Phase 5 mutation
is `POST /api/incidents/evaluate-signals`, which is permission-guarded, reports
incident candidates, and never claims persisted creation it did not perform.

## Conventions

- Format: JSON request and response bodies.
- Authentication: bearer token; see SECURITY.md.
- Tenant scope: the organization is resolved from the authenticated principal; all reads and writes are scoped by organization_id.
- Correlation: the gateway injects a correlation_id and returns it in the X-Correlation-Id response header.
- Timestamps: ISO 8601 UTC.
- Identifiers: UUID strings.
- Idempotency: write endpoints that create important resources accept an Idempotency-Key header (see SYSTEM_DESIGN.md section 12.1).
- Pagination: list endpoints accept limit and cursor query parameters and return a next_cursor.

## Resources and Routes

### Agents

```
GET    /api/agents
POST   /api/agents
GET    /api/agents/{agent_id}
PATCH  /api/agents/{agent_id}
GET    /api/agents/{agent_id}/versions
POST   /api/agents/{agent_id}/versions
```

### Prompts

```
GET    /api/prompts
POST   /api/prompts
GET    /api/prompts/{prompt_id}
POST   /api/prompts/{prompt_id}/versions
GET    /api/prompts/{prompt_id}/versions
GET    /api/prompts/{prompt_id}/versions/{version_id}
```

### Models

```
GET    /api/models
POST   /api/models
GET    /api/models/{model_id}
PATCH  /api/models/{model_id}
```

### Deployments

```
GET    /api/deployments
POST   /api/deployments
GET    /api/deployments/{deployment_id}
POST   /api/deployments/{deployment_id}/promote
POST   /api/deployments/{deployment_id}/rollback
```

### Approvals

```
GET    /api/approvals
GET    /api/approvals/{approval_id}
POST   /api/approvals/{approval_id}/approve
POST   /api/approvals/{approval_id}/reject
```

### Evaluations

```
GET    /api/evaluations
POST   /api/evaluations/run
GET    /api/evaluations/{evaluation_run_id}
```

### Observability

```
GET    /api/metrics/agents/{agent_id}
GET    /api/metrics/models/{model_id}
GET    /api/incidents
GET    /api/incidents/{incident_id}
GET    /api/traces/{correlation_id}
```

### Costs

```
GET    /api/costs/summary
GET    /api/costs/agents/{agent_id}
```

### Audit

```
GET    /api/audit-events
GET    /api/audit-events/{audit_event_id}
GET    /api/audit-events/export
```

## Request Structure

### Create Agent

```
POST /api/agents
```

```json
{
  "name": "Customer Support Agent",
  "description": "Handles tier-1 support questions",
  "owner_user_id": "uuid",
  "risk_level": "medium"
}
```

### Create Prompt Version

```
POST /api/prompts/{prompt_id}/versions
```

```json
{
  "template_text": "You are a support assistant. {context}",
  "variables_json": { "context": "string" },
  "change_reason": "Improved refusal behavior"
}
```

### Request Deployment

```
POST /api/deployments
Idempotency-Key: <client-generated-key>
```

```json
{
  "agent_id": "uuid",
  "agent_version_id": "uuid",
  "environment": "production"
}
```

### Record Approval Decision

```
POST /api/approvals/{approval_id}/approve
```

```json
{
  "decision_reason": "Passed evaluation and policy checks"
}
```

### Run Evaluation

```
POST /api/evaluations/run
Idempotency-Key: <client-generated-key>
```

```json
{
  "agent_version_id": "uuid",
  "suite_name": "safety-v2"
}
```

## Response Structure

### Single Resource

```json
{
  "data": {
    "id": "uuid",
    "type": "agent",
    "attributes": {},
    "created_at": "2026-05-30T15:42:10Z"
  },
  "correlation_id": "uuid"
}
```

### Collection

```json
{
  "data": [{ "id": "uuid", "type": "deployment", "attributes": {} }],
  "page": { "next_cursor": "opaque-cursor-or-null", "limit": 50 },
  "correlation_id": "uuid"
}
```

### Deployment Gate Result

A blocked production deployment returns a structured reason so the UI can explain
exactly which gate failed.

```json
{
  "error": {
    "code": "deployment_blocked",
    "message": "Production deployment blocked by failed quality gates",
    "details": {
      "gates": [
        { "name": "prompt_approved", "passed": true },
        { "name": "model_enabled_for_production", "passed": true },
        { "name": "evaluations_passing", "passed": false },
        { "name": "no_critical_policy_violations", "passed": true },
        { "name": "human_approval", "passed": false }
      ]
    }
  },
  "correlation_id": "uuid"
}
```

## Error Model

All errors share a consistent shape.

```json
{
  "error": {
    "code": "string_machine_code",
    "message": "Human readable explanation",
    "details": {}
  },
  "correlation_id": "uuid"
}
```

### Status Codes

- 200 OK: successful read or action.
- 201 Created: resource created.
- 202 Accepted: long-running work accepted (for example, evaluation run).
- 400 Bad Request: validation error.
- 401 Unauthorized: missing or invalid authentication.
- 403 Forbidden: authenticated but not permitted by role.
- 404 Not Found: resource does not exist or is out of tenant scope.
- 409 Conflict: idempotency conflict or state conflict (for example, prompt version edit attempt).
- 422 Unprocessable Entity: request well formed but violates a business rule or policy.
- 429 Too Many Requests: rate limited.
- 500 Internal Server Error: unexpected failure.
- 503 Service Unavailable: dependency unavailable; high-risk actions fail closed.

### Error Codes (initial set)

- validation_error
- unauthorized
- forbidden
- not_found
- idempotency_conflict
- prompt_version_immutable
- deployment_blocked
- approval_required
- policy_violation
- model_disabled
- rate_limited
- dependency_unavailable

## Authorization Mapping

Endpoint access follows the role model in SYSTEM_DESIGN.md section 10. Examples:

- agents:create and prompts:create: Platform Engineer, Administrator.
- deployments:promote: Platform Engineer, Administrator.
- approvals:approve: Reviewer, Administrator.
- audit:read: Auditor, Administrator.
- costs:read: Executive, Administrator.
- users:manage: Administrator.
