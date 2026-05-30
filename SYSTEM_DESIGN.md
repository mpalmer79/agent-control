# System_Design.md

# Agent Control

Agent Control began as the AI Deployment Command Center concept, but Agent Control is the public product name.

## Purpose

This document describes the technical system design for Agent Control.

The goal is to define service boundaries, data flow, event contracts, storage strategy, failure handling, scalability constraints, and operational behavior for a production-grade AI operations platform.

This system is designed to manage AI agents, prompts, model providers, deployments, evaluations, approvals, costs, and audit history from one centralized control plane.

## 1. System Overview

Agent Control is a control plane for enterprise AI systems.

It does not replace model providers or application-specific AI workflows. Instead, it manages the operational lifecycle around them.

The platform answers key questions:

- Which agents are deployed?
- Which prompts and models are active?
- What changed recently?
- Who approved the change?
- What failed?
- What did it cost?
- What requires human review?
- Can the system prove what happened later?

## 2. Core Design Principles

### 2.1 Control Plane, Not Business App

The platform manages AI systems. It is not tied to one domain such as healthcare, automotive, finance, or support.

### 2.2 Event-Driven by Default

Every important action emits an event.

This allows the system to support audit trails, dashboards, alerting, replay, analytics, and future automation without tightly coupling every service.

### 2.3 Auditability Over Convenience

The system favors traceability over destructive edits.

Prompt changes, approvals, deployments, evaluations, and policy decisions must be reconstructable later.

### 2.4 Human Oversight for High-Risk AI

The system assumes some AI outputs are not safe to fully automate.

Risk-based approval workflows are built into the platform rather than added later.

### 2.5 Provider-Agnostic AI Layer

The system supports multiple model providers through adapters.

No core domain logic should depend directly on OpenAI, Anthropic, Google, or a single vendor.

## 3. High-Level Architecture

Text diagram:

Frontend Control Plane
Next.js, TypeScript, Tailwind

API Gateway
Auth, routing, rate limits, tenant resolution, correlation IDs

Core Services
Agent Service
Prompt Service
Model Service
Deployment Service
Governance Service
Evaluation Service
Observability Service
Cost Service
Audit Service

Infrastructure
PostgreSQL
Redis
Event Bus
Object Storage
Background Workers

External Providers
OpenAI
Anthropic
Gemini
Local Models

## 4. Service Boundaries

### 4.1 Web Control Plane

Responsible for the user interface.

Primary screens:

- Agent Registry
- Prompt Registry
- Model Registry
- Deployment Timeline
- Approval Queue
- Evaluation Results
- Cost Dashboard
- Audit Explorer
- Incident Dashboard
- Executive Summary View

The frontend should not contain business rules. It should render server-provided state and call APIs.

### 4.2 API Gateway

Responsibilities:

- Authentication enforcement
- Request validation
- Rate limiting
- Tenant resolution
- Request routing
- Basic logging
- Correlation ID injection

The API gateway should attach a correlation_id to every request.

This ID must flow through service logs, events, audit records, and traces.

### 4.3 Agent Service

Owns agent identity and lifecycle metadata.

Responsibilities:

- Create agents
- Update agent metadata
- Register versions
- Track runtime status
- Associate agents with prompts, models, tools, and environments

Does not execute long-running AI workflows directly.

Key entities:

- Agent
- AgentVersion
- AgentTool
- AgentEnvironmentConfig

### 4.4 Prompt Service

Owns prompt assets and prompt version history.

Responsibilities:

- Create prompt templates
- Create immutable prompt versions
- Compare prompt diffs
- Mark active prompt versions
- Roll back prompt versions
- Require approval for production promotion

Prompt versions are immutable after creation.

A new edit creates a new version.

### 4.5 Model Service

Owns model metadata, provider configuration, and allowed usage rules.

Responsibilities:

- Register supported models
- Store cost metadata
- Track provider limits
- Maintain risk levels
- Enable or disable models by environment
- Route provider calls through adapters

Example model metadata:

{
  "model_key": "claude-sonnet-4",
  "provider": "anthropic",
  "context_window": 200000,
  "input_cost_per_million": 3.00,
  "output_cost_per_million": 15.00,
  "risk_level": "medium",
  "enabled_for_production": true
}

### 4.6 Deployment Service

Owns environment promotion and rollback.

Responsibilities:

- Promote agent versions
- Roll back agent versions
- Enforce quality gates
- Require approval for production deployments
- Record deployment state
- Emit deployment events

Deployment environments:

- Development
- Staging
- Production

Production deployments must satisfy:

- Approved prompt version
- Approved model
- Passing evaluation suite
- No unresolved critical policy violations
- Required human approval

### 4.7 Governance Service

Owns policy, risk, approvals, and human-in-the-loop workflows.

Responsibilities:

- Evaluate risk rules
- Create approval requests
- Track approval decisions
- Enforce role-based approval
- Maintain policy versions
- Block unsafe deployments

Approval decisions are immutable.

If a decision was wrong, the system records a new corrective action rather than editing the old one.

### 4.8 Evaluation Service

Owns quality, safety, regression, and cost evaluation.

Responsibilities:

- Run evaluation suites
- Score agent outputs
- Detect regressions
- Compare versions
- Block deployment when quality gates fail
- Store historical evaluation results

Evaluation categories:

- Functional correctness
- Safety compliance
- Hallucination risk
- Cost efficiency
- Latency
- Format compliance
- Tool-use correctness

### 4.9 Observability Service

Owns operational telemetry.

Responsibilities:

- Collect request metrics
- Store traces
- Track error rates
- Track latency
- Track model provider failures
- Track agent failures
- Generate incidents

Important metrics:

- Requests per minute
- P50 latency
- P95 latency
- P99 latency
- Error rate
- Retry count
- Escalation rate
- Approval queue time
- Token usage
- Cost per request
- Cost per agent
- Provider failure rate

### 4.10 Cost Service

Owns cost tracking and budget controls.

Responsibilities:

- Track token usage
- Estimate request cost
- Aggregate provider spend
- Enforce budgets
- Alert on unusual spend
- Forecast monthly cost

Cost records must include:

- Organization
- Agent
- Model
- Provider
- Input tokens
- Output tokens
- Estimated cost
- Timestamp
- Environment

### 4.11 Audit Service

Owns immutable audit records.

Responsibilities:

- Store audit events
- Support filtering and search
- Export audit logs
- Link records to users, deployments, approvals, prompts, and evaluations

Audit events are append-only.

The system should never hard-delete audit data.

## 5. Data Storage Design

### 5.1 PostgreSQL

Primary relational store.

Used for:

- Agents
- Prompts
- Prompt versions
- Models
- Deployments
- Approvals
- Evaluations
- Audit records
- Users
- Organizations
- Environments
- Cost records

PostgreSQL is the source of truth for business state.

### 5.2 Redis

Used for:

- Short-lived cache
- Rate limits
- Idempotency keys
- Session metadata
- Temporary workflow state
- Queue coordination for lightweight workloads

Redis is not the source of truth.

Any critical state must eventually be stored in PostgreSQL.

### 5.3 Object Storage

Used for:

- Large evaluation artifacts
- Exported reports
- Trace payloads
- Uploaded test sets
- Long AI outputs
- JSONL evaluation datasets

Examples:

- S3
- Google Cloud Storage
- Azure Blob Storage

## 6. Core Data Model

### 6.1 Organization

organizations
- id
- name
- slug
- created_at
- updated_at

### 6.2 User

users
- id
- organization_id
- email
- full_name
- role
- status
- created_at
- updated_at

### 6.3 Agent

agents
- id
- organization_id
- name
- description
- owner_user_id
- status
- created_at
- updated_at

### 6.4 Agent Version

agent_versions
- id
- agent_id
- version
- prompt_version_id
- model_id
- config_json
- created_by
- created_at

### 6.5 Prompt

prompts
- id
- organization_id
- name
- description
- created_by
- created_at
- updated_at

### 6.6 Prompt Version

prompt_versions
- id
- prompt_id
- version
- template_text
- variables_json
- change_reason
- created_by
- created_at

### 6.7 Model

models
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

### 6.8 Deployment

deployments
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

### 6.9 Approval

approvals
- id
- organization_id
- resource_type
- resource_id
- requested_by
- assigned_to
- status
- decision_reason
- decided_at
- created_at

### 6.10 Evaluation Run

evaluation_runs
- id
- agent_version_id
- suite_name
- status
- score
- passed
- started_at
- completed_at
- created_by

### 6.11 Audit Event

audit_events
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

### 6.12 Cost Record

cost_records
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

## 7. Event Contracts

All events share a common envelope.

{
  "event_id": "uuid",
  "event_type": "PromptVersionCreated",
  "organization_id": "uuid",
  "actor_user_id": "uuid",
  "correlation_id": "uuid",
  "occurred_at": "2026-05-30T15:42:10Z",
  "payload": {}
}

### 7.1 AgentCreated

{
  "event_type": "AgentCreated",
  "payload": {
    "agent_id": "uuid",
    "name": "Customer Support Agent",
    "owner_user_id": "uuid"
  }
}

### 7.2 PromptVersionCreated

{
  "event_type": "PromptVersionCreated",
  "payload": {
    "prompt_id": "uuid",
    "prompt_version_id": "uuid",
    "version": "v4",
    "change_reason": "Improved refusal behavior"
  }
}

### 7.3 DeploymentRequested

{
  "event_type": "DeploymentRequested",
  "payload": {
    "deployment_id": "uuid",
    "agent_id": "uuid",
    "agent_version_id": "uuid",
    "environment": "production"
  }
}

### 7.4 ApprovalDecisionRecorded

{
  "event_type": "ApprovalDecisionRecorded",
  "payload": {
    "approval_id": "uuid",
    "status": "approved",
    "decision_reason": "Passed evaluation and policy checks"
  }
}

### 7.5 EvaluationCompleted

{
  "event_type": "EvaluationCompleted",
  "payload": {
    "evaluation_run_id": "uuid",
    "agent_version_id": "uuid",
    "score": 0.94,
    "passed": true
  }
}

### 7.6 CostRecorded

{
  "event_type": "CostRecorded",
  "payload": {
    "agent_id": "uuid",
    "model_id": "uuid",
    "input_tokens": 1200,
    "output_tokens": 600,
    "estimated_cost": 0.017
  }
}

## 8. Key System Flows

### 8.1 Create Agent Flow

User
  |
  v
Web Control Plane
  |
  v
API Gateway
  |
  v
Agent Service
  |
  |-- Validate request
  |-- Create agent record
  |-- Create audit event
  |-- Emit AgentCreated

Result:

- Agent exists in registry
- Audit record exists
- Event consumers can update dashboards

### 8.2 Prompt Update Flow

User edits prompt
  |
  v
Prompt Service
  |
  |-- Validate variables
  |-- Create new immutable prompt version
  |-- Mark as draft
  |-- Emit PromptVersionCreated
  |-- Write audit record

Important rule:

Prompt versions are never edited in place.

### 8.3 Production Deployment Flow

User requests production deployment
  |
  v
Deployment Service
  |
  |-- Check agent version exists
  |-- Check prompt approval status
  |-- Check model allowed in production
  |-- Check evaluation results
  |-- Check policy risk level
  |
  |-- If low risk:
  |     |-- Deploy automatically
  |
  |-- If medium or high risk:
        |-- Create approval request

If approved:

Approval recorded
  |
  v
Deployment Service
  |
  |-- Promote version
  |-- Mark deployment active
  |-- Emit DeploymentPromoted
  |-- Write audit record

### 8.4 Rollback Flow

User selects rollback
  |
  v
Deployment Service
  |
  |-- Identify previous stable deployment
  |-- Validate rollback target
  |-- Create rollback deployment record
  |-- Mark old deployment inactive
  |-- Mark rollback deployment active
  |-- Emit DeploymentRolledBack
  |-- Write audit record

Rollback does not delete failed deployment records.

### 8.5 Evaluation Flow

User runs evaluation suite
  |
  v
Evaluation Service
  |
  |-- Load test cases
  |-- Execute agent version
  |-- Score outputs
  |-- Store results
  |-- Emit EvaluationCompleted
  |-- Write audit record

Evaluation failure can block production deployment.

### 8.6 Runtime Request Flow

Application calls managed agent
  |
  v
API Gateway
  |
  |-- Attach correlation ID
  |-- Authenticate request
  |-- Route request
  |
  v
Agent Runtime Adapter
  |
  |-- Load active deployment
  |-- Load prompt version
  |-- Load model config
  |-- Call provider adapter
  |-- Record tokens and latency
  |-- Emit telemetry events
  |-- Return response

## 9. API Design

### 9.1 Agent APIs

GET    /api/agents
POST   /api/agents
GET    /api/agents/{agent_id}
PATCH  /api/agents/{agent_id}
GET    /api/agents/{agent_id}/versions
POST   /api/agents/{agent_id}/versions

### 9.2 Prompt APIs

GET    /api/prompts
POST   /api/prompts
GET    /api/prompts/{prompt_id}
POST   /api/prompts/{prompt_id}/versions
GET    /api/prompts/{prompt_id}/versions
GET    /api/prompts/{prompt_id}/versions/{version_id}

### 9.3 Deployment APIs

GET    /api/deployments
POST   /api/deployments
POST   /api/deployments/{deployment_id}/promote
POST   /api/deployments/{deployment_id}/rollback
GET    /api/deployments/{deployment_id}

### 9.4 Approval APIs

GET    /api/approvals
GET    /api/approvals/{approval_id}
POST   /api/approvals/{approval_id}/approve
POST   /api/approvals/{approval_id}/reject

### 9.5 Evaluation APIs

GET    /api/evaluations
POST   /api/evaluations/run
GET    /api/evaluations/{evaluation_run_id}

### 9.6 Observability APIs

GET    /api/metrics/agents/{agent_id}
GET    /api/metrics/models/{model_id}
GET    /api/incidents
GET    /api/traces/{correlation_id}

### 9.7 Audit APIs

GET    /api/audit-events
GET    /api/audit-events/{audit_event_id}
GET    /api/audit-events/export

## 10. Authorization Model

### 10.1 Roles

Administrator:

Can manage users, roles, organizations, and global platform settings.

Platform Engineer:

Can create agents, prompts, models, evaluations, deployments, and rollbacks.

Reviewer:

Can approve or reject pending approval requests.

Auditor:

Can view audit logs, deployment history, approvals, and reports.

Executive:

Can view dashboards, summaries, risks, costs, and trends.

### 10.2 Permission Examples

agents:create              Platform Engineer, Administrator
prompts:create             Platform Engineer, Administrator
deployments:promote        Platform Engineer, Administrator
approvals:approve          Reviewer, Administrator
audit:read                 Auditor, Administrator
costs:read                 Executive, Administrator
users:manage               Administrator

## 11. Security Design

### 11.1 Authentication

Use OAuth 2.0 or OpenID Connect.

Recommended providers:

- Auth0
- Clerk
- Azure AD
- Google Workspace

### 11.2 Secrets Management

Secrets must not be stored in source code or database rows.

Use:

- Cloud secret manager
- Railway variables for MVP
- Kubernetes secrets for later production deployment

### 11.3 Tenant Isolation

Every tenant-owned table includes organization_id.

All queries must be scoped by organization.

Cross-tenant access should fail closed.

### 11.4 Audit Integrity

Audit records should be append-only.

Future production version should consider:

- Hash chaining audit records
- Signed exports
- WORM storage
- Retention policies

## 12. Reliability Design

### 12.1 Idempotency

All write APIs that create important resources should support idempotency keys.

Examples:

- Deployment request
- Approval decision
- Evaluation run
- Cost record

This prevents duplicate actions during retries.

### 12.2 Circuit Breakers

Provider adapters should use circuit breakers.

If a model provider begins failing, the system should temporarily stop sending traffic to that provider.

### 12.3 Retry Strategy

Retries should be limited and intentional.

Retryable:

- Temporary network failures
- Provider timeout
- 429 rate limits

Not retryable:

- Invalid prompt variables
- Unauthorized request
- Policy violation
- Bad model configuration

### 12.4 Graceful Degradation

If observability storage is temporarily unavailable, core runtime requests should continue when safe.

If governance checks are unavailable, high-risk production actions should fail closed.

### 12.5 Backups

PostgreSQL backups should run daily for MVP and more frequently for production.

Audit and deployment tables require stronger retention guarantees than temporary telemetry.

## 13. Scalability Design

### 13.1 Initial MVP Scale

Expected MVP scale:

- 1 organization
- 5 to 25 agents
- 100 to 1,000 requests per day
- 1 to 5 active users
- Single PostgreSQL database
- Single Redis instance
- Basic background workers

### 13.2 Portfolio Demo Scale

Expected public demo scale:

- Seeded mock data
- Simulated telemetry
- No real customer secrets
- Limited API calls
- Rate-limited AI provider usage

### 13.3 Enterprise Scale Path

Future scale:

- Multi-tenant architecture
- Partitioned audit tables
- Dedicated event bus
- Worker autoscaling
- Read replicas
- Object storage for large traces
- Data retention lifecycle policies

## 14. Failure Modes

### 14.1 Model Provider Outage

Impact:

- Runtime requests may fail
- Evaluations may fail
- Cost tracking may be incomplete

Mitigation:

- Circuit breaker opens
- Fallback model may be used if configured
- Incident created
- Audit event recorded

### 14.2 Event Bus Failure

Impact:

- Downstream projections may lag
- Dashboards may be stale

Mitigation:

- Write source-of-truth state to PostgreSQL first
- Retry event publishing
- Use outbox pattern for critical events

### 14.3 Database Failure

Impact:

- Core system unavailable

Mitigation:

- Backups
- Managed database provider
- Connection pooling
- Read-only degraded mode for dashboards when possible

### 14.4 Bad Prompt Deployment

Impact:

- Agent behavior regresses

Mitigation:

- Evaluation gates
- Human approval
- Version rollback
- Deployment history
- Incident record

### 14.5 Cost Spike

Impact:

- Budget overrun

Mitigation:

- Budget alerts
- Per-agent rate limits
- Provider limits
- Automatic disablement for runaway agents

## 15. Outbox Pattern

Critical events should use the outbox pattern.

Flow:

Service writes business record
  |
  |-- Same transaction writes outbox event
  |
  v
Background publisher reads outbox
  |
  v
Publishes event to event bus
  |
  v
Marks outbox event as published

This prevents losing events when a service crashes after writing database state but before publishing to the event bus.

## 16. Observability Design

### 16.1 Correlation IDs

Every request gets a correlation ID.

The correlation ID links:

- API request
- Service logs
- Provider call
- Cost record
- Audit event
- Trace
- Incident

### 16.2 Structured Logging

Logs should be JSON structured.

Example:

{
  "level": "info",
  "service": "deployment-service",
  "message": "deployment promoted",
  "deployment_id": "uuid",
  "agent_id": "uuid",
  "environment": "production",
  "correlation_id": "uuid"
}

### 16.3 Metrics

Minimum required metrics:

api_request_count
api_request_latency_ms
agent_runtime_latency_ms
model_provider_error_count
model_provider_latency_ms
deployment_success_count
deployment_failure_count
approval_queue_depth
evaluation_pass_rate
estimated_cost_usd

### 16.4 Tracing

Use OpenTelemetry for distributed traces.

Trace spans should include:

- API gateway
- Service handler
- Database query
- Provider adapter
- Evaluation runner
- Event publisher

## 17. Deployment Topology

### 17.1 MVP Deployment

Recommended MVP deployment:

Frontend: Vercel
Backend API: Railway
Database: Railway PostgreSQL
Redis: Railway Redis
Background Workers: Railway
Object Storage: Supabase Storage or S3

This is appropriate for portfolio speed and cost control.

### 17.2 Production Deployment

Recommended production deployment:

Frontend: Vercel or CloudFront
API Services: Kubernetes
Workers: Kubernetes
Database: Managed PostgreSQL
Cache: Managed Redis
Event Bus: Kafka or NATS
Object Storage: S3
Observability: OpenTelemetry, Prometheus, Grafana
Secrets: Cloud Secret Manager

## 18. MVP Scope

The MVP should prove the platform concept without becoming too large.

### 18.1 MVP Features

- Agent Registry
- Prompt Registry
- Prompt Versioning
- Model Registry
- Deployment Timeline
- Manual Approval Queue
- Evaluation Results Page
- Audit Log
- Cost Dashboard with simulated cost data
- Seeded demo data

### 18.2 MVP Exclusions

- True multi-tenant billing
- Full Kubernetes deployment
- Enterprise SSO
- Real-time streaming telemetry
- Advanced policy language
- Custom model hosting
- Production customer data

## 19. Demo Narrative

The portfolio demo should tell a clear story.

Recommended demo flow:

1. Viewer opens dashboard.
2. They see several deployed agents.
3. One agent has elevated cost and error rate.
4. Viewer opens the agent detail page.
5. They inspect recent deployments.
6. They compare prompt versions.
7. They see a failed evaluation.
8. They open the approval request.
9. They review the audit trail.
10. They trigger a rollback in demo mode.

The goal is to show operational thinking, not just UI screens.

## 20. Engineering Tradeoffs

### 20.1 Monolith First, Services Later

For the portfolio MVP, build as a modular monolith.

Reason:

- Faster delivery
- Easier deployment
- Lower complexity
- Clear domain modules
- Still scalable later

Recommended structure:

/app
  /dashboard
  /agents
  /prompts
  /deployments
  /approvals
  /evaluations
  /audit
  /costs

/server
  /modules
    /agents
    /prompts
    /models
    /deployments
    /governance
    /evaluations
    /observability
    /audit
    /costs

Later, modules can be extracted into separate services.

### 20.2 Simulated AI Runtime for MVP

Use simulated telemetry and mock provider calls first.

Reason:

- Avoids unnecessary API costs
- Makes demo reliable
- Focuses attention on architecture
- Prevents public demo abuse

Real provider integration can be added behind a protected admin mode.

### 20.3 PostgreSQL Before Specialized Stores

Start with PostgreSQL for relational data and JSONB where needed.

Reason:

- Easier development
- Strong consistency
- Good audit support
- Easier portfolio review

Specialized stores can be added later for high-volume traces and metrics.

## 21. Staff-Level Review Checklist

This project should demonstrate:

- Clear service boundaries
- Strong audit model
- Versioned prompts
- Deployment lifecycle
- Governance workflow
- Observability by design
- Cost tracking
- Failure handling
- Safe rollback
- Event-driven architecture
- Realistic MVP constraints
- Path from portfolio demo to enterprise system

## 22. Final Design Position

Agent Control should be built as a serious AI operations platform, not as another AI chatbot dashboard.

The strongest version of this project shows that production AI requires:

- Control
- Visibility
- Policy
- Human review
- Cost awareness
- Versioning
- Rollback
- Evidence
- Operational discipline

That is the engineering story this system should tell.
