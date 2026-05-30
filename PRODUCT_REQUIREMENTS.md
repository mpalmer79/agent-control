# Product Requirements

Agent Control: Enterprise Control Plane for Production AI Agents.

This document defines who the platform serves, what it must do for the MVP, and
how success is measured. It aligns with ARCHITECTURE.md and SYSTEM_DESIGN.md.

## Personas

### Platform Engineer

Owns the operational lifecycle of agents. Creates agents, prompts, and models,
runs evaluations, requests deployments, and performs rollbacks. Needs fast,
reliable visibility into what is live and why a change is safe.

### Reviewer

Approves or rejects high-risk changes. Needs enough context (diffs, evaluation
results, policy findings) to make a defensible decision quickly, with the
decision permanently recorded.

### Auditor

Reviews history for compliance and incident analysis. Needs complete,
append-only records linking actors, actions, resources, and correlation IDs,
plus export capability.

### Executive

Monitors cost, risk, and reliability trends. Needs summary dashboards rather
than operational detail.

### Administrator

Manages users, roles, organizations, and platform settings. Needs control over
access without touching domain data directly.

## Goals

- Provide a single control plane for the full AI operational lifecycle.
- Make production AI visible, governable, measurable, and reversible.
- Enforce human oversight for high-risk actions by default.
- Maintain a complete, immutable audit trail of significant actions.
- Support multiple model providers through a common adapter interface.
- Deliver a reliable, affordable, portfolio-grade demonstration.

## Non-Goals

- Training or hosting foundation models.
- Replacing existing CI/CD systems.
- Replacing cloud monitoring platforms.
- Serving as a domain-specific chatbot or AI wrapper.
- Handling real customer data or production secrets in the MVP.
- Making unrestricted public AI provider calls in the MVP.

## User Stories

### Agent and Prompt Management

- As a Platform Engineer, I can register an agent with owner, environment, status, and risk level so the registry reflects production reality.
- As a Platform Engineer, I can create a new prompt version with a change reason so prompt history is preserved.
- As a Platform Engineer, I can compare two prompt versions so I can review what changed before promotion.
- As a Platform Engineer, I cannot edit a prompt version in place; editing creates a new immutable version.

### Models and Deployments

- As a Platform Engineer, I can register a model with provider, cost, context window, and risk metadata.
- As a Platform Engineer, I can request a deployment to development, staging, or production.
- As the system, I block a production deployment unless it has an approved prompt version, an approved model, passing evaluations, no unresolved critical policy violations, and required human approval.
- As a Platform Engineer, I can roll back to a previous stable deployment without deleting failed deployment records.

### Governance and Approvals

- As the system, I create an approval request when a deployment risk level requires human review.
- As a Reviewer, I can approve or reject a pending request with a reason.
- As the system, I record every approval decision immutably and emit an event.
- As the system, I fail closed when governance checks cannot complete for a high-risk action.

### Evaluations

- As a Platform Engineer, I can run an evaluation suite against an agent version and view a score and pass or fail result.
- As the system, I block production deployment when a required evaluation fails.
- As an Auditor, I can view historical evaluation results to see whether an agent is improving or degrading.

### Observability, Cost, and Incidents

- As an Executive, I can view cost per agent and aggregate spend over time.
- As a Platform Engineer, I can view request volume, latency, and error rate per agent.
- As the system, I create an incident when a cost spike or elevated error rate is detected.
- As an Auditor, I can trace a correlation ID across logs, cost records, audit events, and incidents.

### Audit

- As an Auditor, I can search audit events by actor, action, resource, and time.
- As an Auditor, I can export audit logs.
- As the system, I never hard-delete audit data.

## MVP Scope

### Included

- Agent Registry
- Prompt Registry with versioning, diff, and rollback
- Model Registry
- Deployment Timeline with promote and rollback
- Manual Approval Queue
- Evaluation Results page
- Cost Dashboard with simulated cost data
- Audit Log with search and export
- Incident view
- Seeded demo data
- Simulated runtime telemetry

### Excluded

- Enterprise SSO
- True multi-tenant billing
- Kubernetes deployment
- Custom model hosting
- Real-time streaming traces
- Advanced policy language
- Production customer data
- Unrestricted public AI provider calls

## Acceptance Criteria

- A reviewer can complete the full DEMO_SCRIPT.md walkthrough against seeded data without errors.
- Prompt versions are immutable; an edit attempt produces a new version.
- A production deployment that fails any required gate is blocked with a clear reason.
- A high-risk deployment cannot proceed without a recorded approval decision.
- Every create, promote, rollback, approval, and evaluation action produces an audit event with a correlation ID.
- A rollback restores a prior deployment while preserving the failed deployment record.
- Audit records cannot be edited or deleted through any API.
- All tenant-scoped reads and writes are filtered by organization_id.

## Success Metrics

### Operational

- 99.9 percent platform availability target for production.
- Median control-plane API latency under 500 ms.
- Failed control-plane requests under 1 percent.
- Full audit coverage for critical actions.

### AI Operations

- Deployment approval time.
- Evaluation pass rate.
- Agent failure rate.
- Rollback frequency.
- Cost per agent.
- Provider failure rate.
- Human escalation rate.

### Portfolio

- A reviewer understands the platform within five minutes.
- The demo runs reliably with no live provider dependency.
- The repository demonstrates staff-level operational thinking, not just UI screens.
