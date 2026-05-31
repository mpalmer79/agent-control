# Architecture Map

A text map of how a request flows through Agent Control. It complements
ARCHITECTURE.md and SYSTEM_DESIGN.md with a concrete, code-level view.

## Layered Flow

```
Browser
  |
  v
Next.js App Router (src/app)
  |  Server components (pages) and Route handlers (src/app/api)
  |  Pages read the correlation ID via correlationIdFromHeaders()
  v
View service (src/server/views)            API routes (src/app/api/.../route.ts)
  |  getOperationalOverview, getTraceDetail   |  use src/lib/api/responses.ts
  |  listAgents, getDeploymentDetail, ...     |  standard envelope + correlation ID
  v                                           v
Domain services (src/server/modules/<domain>/service.ts)
  |  resolve principal, enforce permission, evaluate policy
  |  read via repositories or seed-derived builders
  v
Data source selection (src/server/data-source.ts: load())
  |  database configured ----> Repositories (src/server/repositories)
  |                                   |
  |                                   v
  |                              Prisma client (src/lib/prisma/client.ts)
  |                                   |
  |                                   v
  |                              PostgreSQL
  |
  +-- not configured / read fails ----> Seed-derived builders
                                          (src/server/views/demo-views.ts,
                                           src/server/views/observability-views.ts)
                                          from src/data/seed
```

## Governance Workflow Path (write)

```
POST /api/{approvals|deployments}/...           (src/app/api)
  |  parse + validate (zod), resolve correlation ID
  v
Service (governance/service.ts, deployments/service.ts)
  |  getPrincipal() -> requirePermission()      (src/server/auth)
  |  gather facts:
  |    database -> src/server/workflows/fact-source.ts
  |    demo     -> src/server/workflows/facts.ts
  |  evaluatePolicy() (pure)                     (governance/policy-engine.ts)
  |
  +-- blocked -> typed blocked result (422), no mutation, no events
  |
  +-- allowed and database configured:
  |     prisma.$transaction:
  |       business state change (deploymentRepository / approvalRepository)
  |       + append-only audit event (auditRepository)
  |       + pending outbox event (outboxRepository)
  |     -> success result with evidence IDs
  |
  +-- allowed and no database:
        simulated result, clearly labeled, no evidence IDs
```

## Observability Evidence Path (read)

```
Incident detail / Trace detail / Observability (src/app/(app))
  |
  v
View service (src/server/views/index.ts)
  |
  v
Seed-derived observability builders (observability-views.ts)
  |  buildTraceDetail(correlationId) joins:
  |    audit events + deployments + approvals + cost records
  |    + incidents + outbox events
  |  ordered by time
  v
TraceDetailView / IncidentDetailView -> evidence timeline UI
```

## Component Boundaries

- UI components (`src/components`) render server-provided view models. They never
  import Prisma or call repositories directly.
- Services (`src/server/modules`) are the only callers of repositories.
- Repositories (`src/server/repositories`) are the only callers of the Prisma
  client. Every tenant-owned query is organization-scoped.
- Pure logic (policy engine, incident rules) takes facts in and returns decisions
  or candidates out, with no data access.

## Cross-Cutting

- Correlation ID: generated or read from `x-correlation-id`
  (`src/lib/observability/correlation.ts`), propagated through logs, audit
  events, outbox events, incidents, and traces.
- Structured logging: `src/lib/observability/logger.ts` (redacts secrets).
- Errors: typed application errors (`src/lib/errors`) mapped to safe API
  responses; stack traces are never exposed.
- Authorization: role-to-permission model (`src/server/auth/principal.ts`)
  enforced in services (`src/server/auth/permissions.ts`).
