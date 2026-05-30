# Security

Security assumptions and expectations for Agent Control: authentication,
authorization, secrets management, tenant isolation, and audit integrity. This
aligns with ARCHITECTURE.md (Security) and SYSTEM_DESIGN.md sections 10 and 11.

This document describes the security model. It is not a vulnerability disclosure
policy. For the MVP, the platform handles no real customer data and no production
secrets.

## Authentication Assumptions

- The MVP uses Clerk for authentication. This decision is locked (see DECISIONS.md ADR 0013).
- Clerk provides organization and user identity; the authenticated principal resolves the organization and role used for tenant scoping and role-based access control.
- The application enforces authentication on every request and rejects unauthenticated requests with 401.
- Full enterprise SSO is out of MVP scope. Alternative providers (Auth0, Azure AD, Google Workspace) remain documented as future options only.
- Clerk keys are supplied through environment variables and never committed (see .env.example).

## Authorization Assumptions

- Authorization uses role-based access control.
- Roles: Administrator, Platform Engineer, Reviewer, Auditor, Executive.
- Permissions follow SYSTEM_DESIGN.md section 10. Examples:
  - agents:create, prompts:create, deployments:promote: Platform Engineer, Administrator.
  - approvals:approve: Reviewer, Administrator.
  - audit:read: Auditor, Administrator.
  - costs:read: Executive, Administrator.
  - users:manage: Administrator.
- A requester cannot approve their own approval request.
- Authorization failures return 403 and are distinguishable from authentication failures (401).

## Secrets Management

- Secrets never belong in source code, configuration files committed to the repository, or database rows.
- MVP: secrets are provided through platform environment variables (Vercel for the application, Railway for the database, and Clerk keys). See .env.example for the contract using safe placeholders only.
- Production: secrets are managed through a cloud secret manager or Kubernetes secrets.
- The repository ignores .env files (except .env.example) via .gitignore.
- No real provider keys are committed or used in the public demo; real provider calls require a protected admin mode with operator-supplied credentials.

## Tenant Isolation

- Every tenant-owned record includes organization_id.
- All reads and writes are scoped by organization at the data access layer.
- Cross-tenant access fails closed; a resource outside the caller's organization is treated as not found (404) rather than leaking existence.
- The organization is derived from the authenticated principal, never from a client-supplied value alone.

## Audit Integrity

- Audit records are append-only; no API exposes update or delete for audit data.
- Corrections are new audit events that reference the prior record.
- Audit retention is stronger than telemetry retention (see AUDIT_MODEL.md).
- Future enterprise integrity options: hash chaining, signed exports, WORM storage, and formal retention and legal-hold policies.

## Data Protection

- The demo avoids real customer data, real secrets, and real production prompts.
- Sensitive data is minimized throughout.
- Logs exclude secrets, full prompt payloads, and sensitive customer data.
- Object storage is used only for non-sensitive artifacts in the MVP (evaluation datasets, exported reports, large traces).

## Reliability as a Security Property

- High-risk governance failures fail closed (see GOVERNANCE.md).
- Idempotency keys on important write endpoints prevent duplicate actions during retries.
- Circuit breakers protect downstream providers and limit blast radius during provider failures.

## Responsible Use Boundaries

- No unrestricted public AI provider calls in the MVP.
- Real provider integration is gated behind a protected admin mode to prevent abuse and runaway cost.
- The platform is for authorized operational use within an organization; access is controlled by role.

## Reporting

For a production deployment, establish a security contact and a private channel
for reporting issues. This is out of scope for the portfolio MVP and should be
added before any real data is handled.
