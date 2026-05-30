# Deployment

How Agent Control is deployed for the MVP and how it evolves toward production.
This aligns with ARCHITECTURE.md (Deployment Strategy) and SYSTEM_DESIGN.md
section 17.

## MVP Deployment

The MVP optimizes for portfolio speed, low cost, and reliability. It uses a
simulated runtime, so there is no dependency on live AI providers.

| Component | Platform |
| --- | --- |
| Frontend | Vercel |
| Backend API | Railway |
| Database | Railway PostgreSQL |
| Cache (optional) | Railway Redis |
| Background workers | Railway |
| Object storage (optional) | S3-compatible storage |

### MVP Characteristics

- Seeded demo data loaded on setup (see SEED_DATA_PLAN.md).
- Simulated AI runtime; no unrestricted public provider calls.
- Real provider calls available only behind a protected admin mode.
- Daily PostgreSQL backups.
- Environment configuration via platform variables, never committed secrets (see .env.example and SECURITY.md).

### MVP Deployment Steps (high level)

1. Provision PostgreSQL on Railway and capture the connection string as a platform variable.
2. Deploy the backend API and background workers to Railway with environment variables set from the .env.example contract.
3. Run database migrations.
4. Run the seed harness to load demo data.
5. Deploy the frontend to Vercel, pointing it at the backend API base URL.
6. Verify the DEMO_SCRIPT.md walkthrough end to end.

### Environments

- development: local, for engineering work.
- staging: optional pre-demo verification.
- production: the public portfolio demo (still simulated runtime, no real customer data).

## Future Production Deployment

The production topology scales the same modular monolith and extracts services
only when justified. It introduces managed infrastructure and a dedicated event
bus.

| Component | Platform |
| --- | --- |
| Frontend | Vercel or CDN-backed hosting (for example, CloudFront) |
| API services | Kubernetes |
| Background workers | Kubernetes |
| Database | Managed PostgreSQL |
| Cache | Managed Redis |
| Event bus | Kafka or NATS |
| Object storage | S3 |
| Observability | OpenTelemetry, Prometheus, Grafana |
| Secrets | Cloud secret manager |

### Production Considerations

- Managed PostgreSQL with read replicas and a backup and retention policy stronger than the MVP.
- Dedicated event bus replaces the simple database-backed outbox publisher target; the outbox pattern remains the producer-side guarantee.
- Worker autoscaling for evaluations, exports, cost aggregation, and incident analysis.
- Centralized logging and distributed tracing via OpenTelemetry.
- Secrets managed through a cloud secret manager or Kubernetes secrets, never in source or database rows.
- Partitioned audit tables and a data retention lifecycle for high-volume telemetry, distinct from audit retention.

## Migration Path

The transition from MVP to production does not require rewriting core logic:

- The provider abstraction layer already isolates vendor specifics.
- The outbox pattern already decouples writes from event delivery, so swapping the event transport is contained.
- PostgreSQL remains the source of truth in both topologies.
- Domain modules can be extracted into separate services when scale or team boundaries justify it.

## Operational Runbook (MVP baseline)

- Backups: daily PostgreSQL backups; verify restore periodically.
- Migrations: apply forward migrations in deploy; never destructive to audit data.
- Rollback: application rollback redeploys the prior build; data rollbacks rely on backups and never delete audit records.
- Health: a health check endpoint reports service and database readiness.
