# Architecture.md

# Agent Control

Agent Control began as the AI Deployment Command Center concept, but Agent Control is the public product name.

## Executive Summary

Agent Control is an enterprise platform for managing, governing, monitoring, and operating production AI systems at scale.

The platform provides a centralized control plane for AI agents, workflows, prompts, models, deployments, evaluations, human approvals, observability, and operational risk management.

Unlike a traditional chatbot application, Agent Control focuses on the operational lifecycle of AI systems. It enables engineering teams, product leaders, compliance stakeholders, and executives to understand how AI systems behave in production and intervene when necessary.

The system is designed around five core principles:

1. Observability First
2. Human Oversight by Default
3. Auditability Everywhere
4. Vendor Agnostic Architecture
5. Production Reliability

## Problem Statement

Organizations are rapidly deploying AI systems into production environments.

Most teams lack visibility into:

- Which models are deployed
- Which prompts are active
- How much AI systems cost
- Why failures occur
- Whether outputs comply with policy
- When human intervention is required

Current tools typically focus on experimentation rather than operational governance.

Agent Control serves as the operational control layer for enterprise AI.

## Goals

### Primary Goals

- Manage AI agents from a central platform
- Monitor AI system health
- Track operational costs
- Provide human approval workflows
- Maintain complete audit history
- Support multiple AI providers
- Enable safe production deployments

### Non Goals

- Training foundation models
- Building custom LLMs
- Replacing existing CI/CD systems
- Replacing cloud monitoring platforms

## System Architecture

### High Level Architecture

Frontend Control Plane
Next.js, TypeScript, Tailwind CSS

API Gateway
Authentication, routing, request validation, tenant resolution, rate limiting

Core Platform Services
Agent Service
Prompt Service
Model Service
Deployment Service
Governance Service
Evaluation Service
Observability Service
Cost Service
Audit Service

Infrastructure Layer
PostgreSQL
Redis
Event Bus
Object Storage
Background Workers

External AI Providers
OpenAI
Anthropic
Google Gemini
Local Models

## Architectural Style

The system should begin as a modular monolith for the portfolio MVP and evolve toward distributed services only when scale or team boundaries justify it.

This decision is intentional.

A modular monolith allows the project to show clean boundaries without creating unnecessary operational complexity too early.

Core modules should be isolated by domain:

- Agents
- Prompts
- Models
- Deployments
- Governance
- Evaluations
- Observability
- Costs
- Audit

Each module should own its business rules, validation, and persistence logic.

Cross-module communication should happen through explicit service calls or domain events, not direct database coupling.

## Core Domains

## Agent Registry

Maintains metadata for every deployed agent.

Stores:

- Agent name
- Agent version
- Owner
- Environment
- Status
- Associated prompts
- Associated models
- Runtime configuration
- Risk classification

Example:

Agent:
CustomerSupportAgent

Version:
v3.4.2

Owner:
AI Platform Team

Status:
Production

Environment:
Production

Risk Level:
Medium

## Prompt Registry

Prompts are treated as versioned production assets.

Capabilities:

- Version history
- Rollback support
- Approval workflow
- Change tracking
- Prompt diff review
- Environment-specific activation

Every prompt change produces:

- Author
- Timestamp
- Reason
- Diff
- Related agent
- Approval status

Prompt versions should be immutable.

Editing a prompt creates a new version rather than modifying an existing production artifact.

## Model Registry

Tracks all approved models and provider-specific metadata.

Examples:

- Claude Opus
- Claude Sonnet
- GPT
- Gemini
- Local Models

Metadata:

- Provider
- Model key
- Cost
- Latency expectation
- Context window
- Risk rating
- Production approval status
- Supported environments

The platform should avoid hard-coding business logic to one model provider.

All model access should flow through provider adapters.

## Deployment Management

Supports:

- Development
- Staging
- Production

Deployment actions:

- Promote
- Rollback
- Archive
- Disable
- Compare

Every deployment produces an audit record.

A production deployment should require:

- Approved agent version
- Approved prompt version
- Approved model
- Passing evaluation results
- No unresolved critical policy violations
- Required human approval when risk level demands it

## Governance and Policy

The governance layer manages risk controls.

Responsibilities:

- Policy checks
- Approval rules
- Risk classification
- Human review requirements
- Blocking unsafe deployments
- Maintaining policy history

Policy examples:

- High-risk agents cannot deploy without human approval.
- Production prompts cannot be edited in place.
- Disabled models cannot be selected for production.
- Failed evaluations block deployment.
- Cost spikes trigger an incident.
- Audit records cannot be deleted.

## Human Approval Framework

High-risk actions require review.

Examples:

- Financial recommendations
- Legal analysis
- Medical outputs
- Customer-facing escalations
- Production model changes
- High-cost agents
- Policy override requests

Approval states:

- Pending
- Approved
- Rejected
- Expired
- Canceled

Audit records are immutable.

An approval decision should capture:

- Reviewer
- Decision
- Timestamp
- Reason
- Related resource
- Correlation ID

## Observability Platform

Observability is treated as a first-class capability.

### Request Metrics

- Request volume
- Response time
- Error rate
- Success rate
- Retry count

### Model Metrics

- Token usage
- Cost
- Latency
- Provider reliability
- Rate-limit events

### Agent Metrics

- Task completion rate
- Escalation rate
- Retry count
- Failure rate
- Evaluation pass rate

### User and Review Metrics

- Feedback score
- Approval frequency
- Rejection frequency
- Escalation frequency
- Average approval time

The goal is to make AI behavior explainable from an operational point of view.

## Event Driven Architecture

All significant system activity generates events.

Examples:

- AgentCreated
- PromptVersionCreated
- PromptUpdated
- ModelRegistered
- DeploymentRequested
- DeploymentPromoted
- DeploymentRolledBack
- ApprovalRequested
- ApprovalGranted
- ApprovalRejected
- EvaluationCompleted
- EvaluationFailed
- CostRecorded
- IncidentCreated

Events support:

- Decoupled services
- Replay capability
- Audit generation
- Analytics support
- Future automation
- Real-time dashboard updates

Critical events should use the outbox pattern so that database state and emitted events remain consistent.

## Audit Architecture

Every significant action is recorded.

Audit records contain:

- Actor
- Timestamp
- Action
- Resource type
- Resource ID
- Previous state
- New state
- Correlation ID
- Organization ID

Audit data is append-only.

Deletion is prohibited.

For a future enterprise-grade version, audit records can be strengthened with:

- Hash chaining
- Signed exports
- Retention policies
- WORM storage
- Compliance reports

## Evaluation Framework

Agents must continuously prove effectiveness.

Evaluation types:

### Functional Evaluation

Did the agent complete the task?

### Safety Evaluation

Did the agent violate policy?

### Cost Evaluation

Was execution economically acceptable?

### Quality Evaluation

Was output useful?

### Regression Evaluation

Did the new version perform worse than the previous version?

### Format Evaluation

Did the output match expected structure?

Evaluation results are stored historically.

Trend analysis should be supported so teams can identify whether an agent is improving or degrading over time.

## Runtime Execution Model

Agent Control should distinguish between management control and runtime execution.

The platform owns:

- Agent metadata
- Active deployment versions
- Prompt versions
- Provider selection
- Cost records
- Audit records
- Evaluation results

The runtime adapter owns:

- Loading active deployment configuration
- Resolving prompt and model settings
- Calling the provider adapter
- Recording latency and token usage
- Emitting telemetry events
- Returning response to the caller

This keeps the operational control plane separate from application-specific AI business logic.

## Provider Adapter Layer

The provider adapter layer abstracts external AI providers.

Each adapter should expose a common interface:

- generate()
- stream()
- countTokens()
- estimateCost()
- healthCheck()

Provider-specific details should remain inside the adapter.

Examples:

- OpenAIAdapter
- AnthropicAdapter
- GeminiAdapter
- LocalModelAdapter

This design allows the system to switch providers or run comparative evaluations without rewriting core platform logic.

## Reliability Strategy

### Circuit Breakers

Protect downstream model providers.

If a provider starts failing repeatedly, the circuit breaker opens and prevents additional requests for a cooldown period.

### Retry Policies

Handle transient failures.

Retryable failures:

- Network timeout
- Rate limit
- Temporary provider outage

Non-retryable failures:

- Invalid prompt variables
- Unauthorized request
- Policy violation
- Disabled model
- Invalid deployment configuration

### Queue-Based Processing

Long-running work should be handled through background workers.

Examples:

- Evaluations
- Report generation
- Audit export
- Cost aggregation
- Incident analysis

### Graceful Degradation

The platform should degrade safely.

If observability storage fails, low-risk runtime calls may continue with delayed telemetry.

If governance checks fail, high-risk deployments should fail closed.

If a provider fails, a configured fallback model may be used only when policy allows it.

## Security

### Authentication

Use OAuth 2.0 or OpenID Connect.

Potential providers:

- Auth0
- Clerk
- Azure AD
- Google Workspace

### Authorization

Use Role-Based Access Control.

Roles:

- Administrator
- Platform Engineer
- Reviewer
- Auditor
- Executive

### Tenant Isolation

Every organization-owned record should include organization_id.

All queries must be scoped by organization.

Cross-tenant access must fail closed.

### Secrets

Secrets never belong in source code.

Secrets should be managed through:

- Environment variables for MVP
- Cloud secret manager for production
- Kubernetes secrets for enterprise deployment

### Data Protection

Sensitive data should be minimized.

The demo version should avoid real customer data, real secrets, and real production prompts.

## Data Model

Core entities:

- Organization
- User
- Agent
- AgentVersion
- Prompt
- PromptVersion
- Model
- Deployment
- Approval
- EvaluationRun
- AuditEvent
- CostRecord
- Incident
- Environment

PostgreSQL should be the source of truth for business state.

Redis can be used for:

- Cache
- Rate limits
- Idempotency keys
- Short-lived workflow state

Object storage can be used for:

- Evaluation datasets
- Exported reports
- Large trace payloads
- Long AI responses
- JSONL test sets

## Technology Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- React Query
- Recharts
- shadcn/ui

### Backend (MVP)

The MVP backend is the Next.js App Router application with TypeScript and Prisma. There is no separate Python backend for the MVP.

- Next.js App Router (API routes and server components)
- TypeScript
- Prisma
- PostgreSQL
- Clerk for authentication

### Backend (Future Service Extraction Option)

A separate backend service can be extracted later if scale or team boundaries justify it. This is a future option only, not the MVP path.

- FastAPI
- Python
- Pydantic
- SQLAlchemy

### Database

- PostgreSQL

### Cache

- Redis

### Messaging

- NATS
- Kafka
- Redis Streams

For the MVP, Redis Streams or a simple database-backed outbox is enough.

### Observability

- OpenTelemetry
- Prometheus
- Grafana
- Structured JSON logs

### Infrastructure

- Docker
- GitHub Actions
- Railway
- Vercel

Future production option:

- Kubernetes
- Managed PostgreSQL
- Managed Redis
- Cloud secret manager
- S3-compatible object storage

## Deployment Strategy

### MVP Deployment

Recommended:

- Frontend on Vercel
- Backend on Railway
- PostgreSQL on Railway
- Redis on Railway
- Seeded demo data
- Simulated AI runtime
- Protected admin mode for real provider calls

This keeps the project reviewable, affordable, and reliable.

### Production Deployment

Recommended:

- Frontend on Vercel or CDN-backed hosting
- API services on Kubernetes
- Background workers on Kubernetes
- Managed PostgreSQL
- Managed Redis
- Event bus through Kafka or NATS
- Object storage through S3
- OpenTelemetry for traces
- Prometheus and Grafana for metrics
- Centralized logging

## MVP Scope

The MVP should prove operational maturity without overbuilding.

### Included

- Agent Registry
- Prompt Registry
- Prompt Versioning
- Model Registry
- Deployment Timeline
- Manual Approval Queue
- Evaluation Results Page
- Cost Dashboard
- Audit Log
- Seeded Demo Data
- Simulated Runtime Metrics
- Rollback Demo Flow

### Excluded

- Full enterprise SSO
- True multi-tenant billing
- Kubernetes deployment
- Custom model hosting
- Real-time streaming traces
- Advanced policy language
- Production customer data
- Unrestricted public AI provider calls

## Future Roadmap

### Phase 1

- Single-agent management
- Prompt registry
- Deployment tracking
- Audit logging
- Seeded demo data

### Phase 2

- Multi-agent orchestration
- Human approval workflows
- Evaluation framework
- Rollback simulation

### Phase 3

- Cost intelligence
- Executive dashboards
- Risk scoring
- Incident management

### Phase 4

- Autonomous remediation
- Self-healing workflows
- Policy enforcement engine
- Cross-organization governance
- Provider failover

## Success Metrics

### Operational Metrics

- 99.9% platform availability target for production
- Less than 500ms median API latency for control-plane requests
- Less than 1% failed control-plane requests
- Full audit coverage for critical actions

### AI Operations Metrics

- Deployment approval time
- Evaluation pass rate
- Agent failure rate
- Rollback frequency
- Cost per agent
- Provider failure rate
- Human escalation rate

### Business Metrics

- Reduced AI operational costs
- Faster deployment approvals
- Improved audit readiness
- Increased stakeholder trust
- Reduced time to detect failures
- Reduced time to rollback unsafe changes

## Engineering Tradeoffs

### Modular Monolith First

A modular monolith is the correct starting point.

It avoids premature distributed-system complexity while still allowing clean domain boundaries.

### Simulated Runtime First

The first public demo should use simulated AI telemetry.

This prevents runaway API costs and makes the demo reliable.

### PostgreSQL First

PostgreSQL should be used before adding specialized data stores.

It provides strong consistency, relational integrity, JSONB support, and simple operational overhead.

### Governance Before Autonomy

Autonomous remediation should come later.

The first version should prove visibility, control, approval, and rollback before adding self-healing behavior.

## Guiding Principle

AI systems should be operated with the same rigor, observability, governance, and reliability standards expected of any other production-critical software platform.

Agent Control exists to make production AI visible, governable, measurable, and reversible.
