# Data Model

Domain model for Agent Control. This document defines entities, relationships,
and ownership boundaries. It is domain modeling only. It does not specify
database implementation, indexes, or migrations. Attribute lists describe domain
fields that align with SYSTEM_DESIGN.md section 6.

## Modeling Principles

- PostgreSQL is the source of truth for all entities below.
- Every tenant-owned entity carries organization_id and is scoped by organization.
- Prompt versions and approval decisions are immutable once created.
- Audit events and cost records are append-only.
- A module owns its entities; other modules reference them by identifier through service calls or events, not direct database access.

## Ownership Boundaries

| Module | Owns |
| --- | --- |
| Identity (platform) | Organization, User, Environment |
| Agents | Agent, AgentVersion |
| Prompts | Prompt, PromptVersion |
| Models | Model |
| Deployments | Deployment |
| Governance | Approval, Policy |
| Evaluations | EvaluationRun |
| Observability | Incident |
| Costs | CostRecord |
| Audit | AuditEvent |

Cross-module references (for example, AgentVersion referencing PromptVersion and
Model) are by identifier. The referencing module does not read the foreign
module's tables directly; it calls the owning module or consumes its events.

## Entities

### Organization

Tenant boundary for all owned data.

- id
- name
- slug
- created_at
- updated_at

### User

A person who acts in the platform, scoped to an organization.

- id
- organization_id
- email
- full_name
- role (Administrator, Platform Engineer, Reviewer, Auditor, Executive)
- status
- created_at
- updated_at

### Environment

A deployment target (development, staging, production).

- id
- organization_id
- name
- description

### Agent

Identity and lifecycle metadata for a managed agent.

- id
- organization_id
- name
- description
- owner_user_id
- status
- risk_level
- created_at
- updated_at

### AgentVersion

An immutable snapshot of an agent configuration. References a prompt version and
a model.

- id
- agent_id
- version
- prompt_version_id
- model_id
- config_json
- created_by
- created_at

### Prompt

A named prompt asset.

- id
- organization_id
- name
- description
- created_by
- created_at
- updated_at

### PromptVersion

An immutable version of a prompt. Editing creates a new version.

- id
- prompt_id
- version
- template_text
- variables_json
- change_reason
- created_by
- created_at

### Model

Provider-agnostic model metadata and usage rules.

- id
- provider
- model_key
- display_name
- context_window
- input_cost_per_million
- output_cost_per_million
- risk_level
- enabled
- created_at
- updated_at

### Deployment

A record of promoting or rolling back an agent version in an environment.

- id
- agent_id
- agent_version_id
- environment
- status
- deployed_by
- approved_by
- deployed_at
- rollback_from_deployment_id
- created_at

### Approval

A human review request and its immutable decision.

- id
- organization_id
- resource_type
- resource_id
- requested_by
- assigned_to
- status (pending, approved, rejected, expired, canceled)
- decision_reason
- decided_at
- created_at

### Policy

A governance rule with version history.

- id
- organization_id
- name
- description
- rule_json
- version
- enabled
- created_by
- created_at

### EvaluationRun

A scored run of an evaluation suite against an agent version.

- id
- agent_version_id
- suite_name
- status
- score
- passed
- started_at
- completed_at
- created_by

### Incident

An operational event raised by observability (for example, cost spike or error
rate).

- id
- organization_id
- agent_id
- severity
- status
- title
- description
- correlation_id
- created_at
- resolved_at

### CostRecord

An append-only record of estimated spend for a unit of work.

- id
- organization_id
- agent_id
- model_id
- provider
- input_tokens
- output_tokens
- estimated_cost
- environment
- correlation_id
- created_at

### AuditEvent

An append-only record of a significant action.

- id
- organization_id
- actor_user_id
- action
- resource_type
- resource_id
- previous_state_json
- new_state_json
- correlation_id
- created_at

### OutboxEvent

A transactional record of an event to be published. Owned by the platform
infrastructure layer and written in the same transaction as the business record.

- id
- event_type
- aggregate_type
- aggregate_id
- payload_json
- correlation_id
- occurred_at
- published_at

## Relationships

- Organization has many Users, Agents, Prompts, Approvals, Incidents, CostRecords, and AuditEvents.
- Agent has many AgentVersions and many Deployments.
- AgentVersion references one PromptVersion and one Model.
- Prompt has many PromptVersions.
- AgentVersion has many EvaluationRuns.
- Deployment references one AgentVersion and optionally a rollback source Deployment.
- Approval references a target resource by resource_type and resource_id.
- CostRecord references an Agent and a Model and carries a correlation_id.
- Incident references an Agent and carries a correlation_id.
- AuditEvent references any resource by resource_type and resource_id and carries a correlation_id.

## Immutability Summary

- PromptVersion: immutable after creation.
- AgentVersion: immutable after creation.
- Approval decision fields: immutable once a decision is recorded; corrections are new records.
- CostRecord: append-only.
- AuditEvent: append-only, never edited or deleted.

## Cross-Cutting Fields

- correlation_id links a request across logs, events, cost records, audit events, incidents, and traces.
- organization_id enforces tenant isolation on every owned entity.
- created_at and updated_at provide temporal context; updated_at is absent on append-only and immutable entities.
