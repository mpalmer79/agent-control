# Decision Log

Architecture decision records (ADRs) for Agent Control. Each record captures the
context, decision, and consequences for a significant choice. New decisions are
appended; superseded decisions are marked rather than deleted.

ADR status values: Accepted, Superseded, Deprecated.

## ADR 0001: Modular Monolith First

- Status: Accepted
- Context: The platform spans many domains (agents, prompts, models, deployments, governance, evaluations, observability, costs, audit). A microservice architecture would add operational complexity (deployment, networking, distributed transactions) before the team or scale justifies it.
- Decision: Build the MVP as a modular monolith with strict domain module boundaries. Cross-module communication uses explicit service calls or domain events, not shared database access.
- Consequences: Faster delivery, simpler deployment, and clear boundaries that can be extracted into services later. Requires discipline to avoid hidden coupling. Module boundaries must be enforced in review.

## ADR 0002: PostgreSQL as Source of Truth

- Status: Accepted
- Context: The platform needs strong consistency, relational integrity, and flexible JSON storage for config and state snapshots. Audit and deployment data require durable, queryable history.
- Decision: Use PostgreSQL as the single source of truth for business state. Use JSONB where flexible structure is needed. Redis and object storage are optional and never authoritative.
- Consequences: Strong consistency and simple operations. Specialized stores for high-volume traces or metrics can be added later without changing the source of truth.

## ADR 0003: Simulated Runtime for the MVP

- Status: Accepted
- Context: Live AI provider calls introduce cost, latency, reliability, and abuse risk that undermine a public portfolio demo.
- Decision: Ship a simulated runtime that produces realistic telemetry and mock provider responses. Real provider integration lives behind a protected admin mode.
- Consequences: The demo is reliable and affordable, and attention stays on architecture. Real provider behavior is deferred and must be validated separately when enabled.

## ADR 0004: Seeded Demo Data

- Status: Accepted
- Context: A reviewer needs a coherent, populated environment to understand the platform quickly, without onboarding or real data.
- Decision: Ship seeded demo data covering agents, deployments, incidents, evaluations, approvals, and costs that tells a clear operational story. Use no real customer data and no production secrets.
- Consequences: The demo works immediately and supports the full walkthrough. Seed data must be maintained alongside schema changes.

## ADR 0005: Outbox Pattern for Critical Events

- Status: Accepted
- Context: Event-driven flows risk losing events if a service crashes after writing database state but before publishing. Dual writes to the database and an event bus are not atomic.
- Decision: Write critical events to an outbox table in the same transaction as the business record. A background publisher reads the outbox, publishes to the event bus, and marks rows published.
- Consequences: Database state and emitted events stay consistent. Adds a publisher process and at-least-once delivery semantics that consumers must handle idempotently.

## ADR 0006: Provider Abstraction Layer

- Status: Accepted
- Context: The platform must support multiple model providers (OpenAI, Anthropic, Gemini, local models) and run comparative evaluations without rewriting core logic.
- Decision: Define a common adapter interface (generate, stream, countTokens, estimateCost, healthCheck). Keep provider-specific details inside adapters. No core domain logic depends on a single vendor.
- Consequences: Providers can be swapped or compared with minimal change. Requires maintaining adapters and a stable interface contract.

## ADR 0007: Audit-First Architecture

- Status: Accepted
- Context: The platform exists to make production AI provable and reversible. Trust depends on a complete, tamper-evident history.
- Decision: Record an append-only audit event for every significant action, including actor, action, resource, previous and new state, correlation ID, and organization ID. Never hard-delete or edit audit data. Reserve hash chaining, signed exports, and WORM storage for a future enterprise version.
- Consequences: Strong traceability and incident reconstruction. Audit tables grow and need retention and partitioning strategy at scale. Destructive operations on audit data are prohibited by design.

## ADR 0008: Governance Before Autonomy

- Status: Accepted
- Context: Autonomous remediation is attractive but risky before the platform can reliably show visibility, control, approval, and rollback.
- Decision: Prioritize human-in-the-loop governance and rollback in early phases. Defer self-healing and autonomous remediation to a later roadmap phase.
- Consequences: The platform earns trust through demonstrable control first. Autonomy is added on a proven foundation.

## ADR 0009: Fail-Closed for High-Risk Actions

- Status: Accepted
- Context: When governance or evaluation checks cannot complete, allowing high-risk actions to proceed would defeat the platform purpose.
- Decision: High-risk deployments fail closed when required checks or approvals are unavailable. Low-risk runtime calls may degrade gracefully with delayed telemetry.
- Consequences: Safety is preserved under partial failure. Operators may see blocked high-risk actions during outages, which is the intended behavior.

## ADR 0010: Next.js App Router for the MVP

- Status: Accepted
- Context: The MVP needs one framework that serves the control-plane UI and the API surface with minimal operational overhead, fast delivery, and a clean path to a modular monolith. The architecture documents offer a Next.js option and a separate FastAPI option.
- Decision: Build the MVP on Next.js with the App Router. The frontend renders server-provided state, and API routes back the documented endpoints. The FastAPI option is not pursued for the MVP.
- Consequences: A single deployable application, server components for data-heavy screens, and shared TypeScript types across UI and API. Module boundaries must be enforced in code organization since one process hosts all domains. Service extraction remains possible later.

## ADR 0011: TypeScript Across the Stack

- Status: Accepted
- Context: The MVP shares models and contracts between the UI and the API. Type drift between layers is a common source of defects.
- Decision: Use TypeScript for all application code, with shared types for API request and response shapes and event envelopes.
- Consequences: Compile-time safety and shared contracts reduce integration bugs. Contract tests still verify runtime shapes (see TESTING_STRATEGY.md). Requires disciplined type definitions at module boundaries.

## ADR 0012: Prisma as the ORM and Migration Tool

- Status: Accepted
- Context: The platform needs a typed data access layer over PostgreSQL, reliable migrations, and a schema that is easy to review in a portfolio context. PostgreSQL remains the source of truth (ADR 0002).
- Decision: Use Prisma for schema definition, migrations, and typed data access. Tenant scoping by organization_id is enforced at the data access layer. The outbox row is written in the same transaction as the business record.
- Consequences: Strong typing from schema to query and straightforward migrations. The team must guard against N+1 access patterns and ensure every tenant-owned query is organization-scoped. Raw SQL is available for cases Prisma does not express well.

## ADR 0013: Clerk for Authentication

- Status: Accepted
- Context: The MVP needs authentication that integrates cleanly with Next.js, supports organizations and roles, and avoids building identity infrastructure for a portfolio project. ARCHITECTURE.md lists several candidate providers.
- Decision: Use Clerk for authentication in the MVP. The authenticated principal resolves the organization and role used for tenant scoping and role-based access control. Real provider keys are supplied through environment variables and never committed.
- Consequences: Fast, secure authentication with organization support and minimal custom code. The platform depends on a third-party identity provider for the MVP. Alternative providers (Auth0, Azure AD, Google Workspace) remain documented as future options but are not used now.
