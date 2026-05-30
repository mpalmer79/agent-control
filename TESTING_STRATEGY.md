# Testing Strategy

The testing approach for Agent Control across unit, integration, contract, demo,
and accessibility layers. This document defines what to test and why. It does not
include implementation; tests are written during the implementation phases.

## Objectives

- Protect the platform invariants: immutability, tenant isolation, audit
  completeness, deployment gates, and fail-closed governance.
- Keep the demo reliable end to end.
- Catch contract drift in events and APIs before consumers break.

## Test Layers

### Phase 4 Tests

Phase 4 adds Vitest coverage for the role-to-permission checks and authorization
utilities, the policy engine (promotion gates, rollback gates, and approval
decision rules), the approval and deployment workflow services on the simulated
path (approve, reject with required reason, double-decision prevention,
promotion blocked by a failed evaluation, production promotion routed to pending
approval, and rollback allowed), the workflow request validation schemas, and
the workflow result alert component (success, simulated, and blocked rendering).
These run without a database against the simulated workflow path.

### Phase 3 Tests

Phase 3 adds Vitest coverage for the demo view builders (agent list and detail,
prompt list and detail, deployment list and detail evidence, approval summary
and risk distribution, evaluation list with deployment-blocking flag and
summary, incident list, and the metrics summary), the dashboard metric card
builder, the status and pass/fail helpers, the updated navigation configuration,
and the Clerk demo principal groundwork. These run without a database against
the seed-derived view layer.

### Phase 2 Tests

Phase 2 adds Vitest coverage for the API response helpers, error utilities, the
correlation ID utility, the structured logger (including redaction), repository
shared helpers (limit clamping and tenant scoping), the seed-derived mock data
source, and seed data integrity (relationships, valid status values, and a check
that no secret-like values are present). Repository database behavior is tested
through the input-shaping helpers; full database integration tests arrive when a
test database is wired in a later phase.

### Tooling (from Phase 1)

The configured test stack is Vitest with React Testing Library and
@testing-library/jest-dom, in a jsdom environment. Tests live in `src/test` and
run with `npm run test`. Phase 1 ships baseline tests for product constants,
navigation configuration, the mock data shapes, and a dashboard component render.

### Unit Testing

Scope: pure business rules in isolation.

Priority cases:

- Prompt version immutability: an edit creates a new version and never mutates an existing one.
- Deployment gate logic: each gate (approved prompt, approved and enabled model, passing evaluations, no critical policy violations, required approval) blocks correctly.
- Risk classification: effective risk is the highest applicable input.
- Approval rules: a requester cannot approve their own request; only Reviewer and Administrator can decide.
- Fail-closed behavior: high-risk actions are blocked when a governance check cannot complete.
- Cost estimation math from token counts and model metadata.

### Integration Testing

Scope: modules working together with a real PostgreSQL instance.

Priority cases:

- Create agent writes the agent, an audit event, and an outbox event in one transaction.
- Prompt update creates a new version, an audit event, and emits PromptVersionCreated.
- Production deployment flow enforces gates and creates approval requests for medium and high risk.
- Approval decision recording updates the deployment path and is immutable.
- Rollback creates a new deployment, marks the old one inactive, preserves the failed record, and writes audit and event records.
- Outbox publisher reads unpublished rows, publishes, and marks them published; at-least-once delivery is handled idempotently.
- Tenant isolation: queries never return cross-organization data.

### Contract Testing

Scope: stable shapes for events and APIs.

Priority cases:

- Event envelope conforms to EVENT_CONTRACTS.md (required fields, types, naming).
- Each registered event payload matches its documented shape.
- API request and response bodies match API_CONTRACTS.md, including the error model and the deployment gate result structure.
- Schema version changes are detected and intentional.

### Demo Validation

Scope: the full DEMO_SCRIPT.md walkthrough against seeded data.

Priority cases:

- Seed harness loads a reproducible environment.
- Each demo step renders the expected data (problem agent, failed evaluation, pending approval, incident, rollback target).
- The live approval and rollback steps produce fresh audit and event records.
- The walkthrough completes without errors in the deployed MVP.

### Accessibility Validation

Scope: primary screens in the web control plane.

Priority cases:

- Keyboard navigation reaches all interactive controls.
- Color is not the only signal for status and risk; text or icons accompany it.
- Sufficient color contrast on key screens.
- Form fields and controls have accessible labels.
- Automated accessibility checks run in CI for primary screens, with manual spot checks for critical flows (approval and rollback).

## Test Data

- Tests use isolated, ephemeral data; they never depend on a shared live environment.
- No real secrets or customer data in fixtures.
- The simulated runtime provides deterministic telemetry for repeatable assertions.

## Continuous Integration

- CI runs lint, type check, unit, integration, and contract tests, plus the build.
- Accessibility checks run on primary screens.
- A phase is not complete until its exit criteria, including the relevant tests, pass.

## Coverage Philosophy

Prioritize coverage of invariants and money paths (deployment gates, governance,
audit, tenancy) over raw percentage targets. A high line-coverage number that
misses an invariant is not acceptable.
