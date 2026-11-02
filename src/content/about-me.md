# About Juan Botha

This document is the knowledge base for the "Ask about Juan" assistant on Juan's portfolio site. It covers his professional experience, the systems he has built, how he works, and what he is looking for. It was written from his own project repositories, commit history and public profile. Anything not covered here is unknown, and visitors should ask Juan directly.

## Snapshot

- **Name:** Juan Botha
- **Title:** Lead Backend Engineer
- **Location:** Plettenberg Bay, Western Cape, South Africa (timezone Africa/Johannesburg, UTC+2)
- **Availability:** Open to select opportunities
- **Experience:** 12+ years building software
- **Primary languages:** TypeScript and Go, with Python and C++ where a problem calls for them
- **Specialism:** Distributed, event-driven backend platforms: multi-tenant systems, multi-region data sync infrastructure, typed service contracts, and the observability and cost visibility that keep them dependable
- **Spoken languages:** English (native), Afrikaans (professional)
- **Contact:**
  - Email: juanbo.home@gmail.com
  - GitHub: https://github.com/EspressoTrip-v2 (handle EspressoTrip-v2)
  - LinkedIn: https://www.linkedin.com/in/juanb-14b1b6138

Juan's background is in electrical engineering. He still approaches software the same way: understand the load, design for failure, and document every circuit.

## Career timeline

### Alpha7x: Lead Backend Engineer (June 2026 – present)

**Company:** Alpha7x builds trust infrastructure for mortgage assets: a platform where AI agents run quality-control checks on mortgage loans (post-close QC, appraisal review, post-settlement checks), and people review the evidence, policies and accuracy of those checks.

**Role and scope:** Juan leads the rebuild of a legacy .NET backend as TypeScript services. He wrote most of the core backend himself (about 90% of its commits), created the shared contracts package, wrote the email/communication service, scaffolded the orders and response services, and took over and refactored the document import service and the loan-number service that other developers had started. He also releases his own services through the team's GitOps repository.

**What he built:**

- **Core platform API.** A multi-tenant Fastify API in TypeScript with Zod-typed request and response schemas and generated OpenAPI/Swagger documentation. Each tenant gets its own database. It covers tenants, users, loans, tasks, task evidence, evidence types, canonical fields, policies, loan locks, notes, notifications, accuracy reporting and admin endpoints, plus an internal service-to-service API secured with inter-service JWTs.
- **Identity.** Keycloak authentication and role-based access control, including programmatic tenant provisioning (creating identity realms, adding identity providers, adjusting login flows, account linking and SMTP settings).
- **Real-time updates.** Socket.IO with a Redis adapter pushes live progress to the UI, authenticated with Keycloak tokens that refresh on long-lived connections.
- **Event-driven design.** Kafka event flows between the backend, import, communication, orders and response services, covering task status, task errors, progress, policy results, agent status, evidence, reclassification, uploads and tenant changes. Every consumer has retry topics and a dead-letter queue, and tenant events have version-conflict retry handling. The AI task evaluator reports to the backend over a Kafka topic partitioned per loan.
- **Shared contracts package (`@alpha7x/common-ts`).** An ESM package he created from scratch: the Kafka topic registry (including per-service retry and dead-letter topics), Zod schemas, Keycloak roles and identity types, AI agent role constants, Fastify plugins and a logger. Published to a private Azure Artifacts feed so every service shares one typed contract.
- **Import pipeline.** Authenticated single and bulk document uploads stored in MongoDB GridFS, with background import workflows on BullMQ and Redis, and pluggable storage and secret providers for Azure Blob/Key Vault, AWS S3/Secrets Manager and FTP.
- **Communication service.** Consumes Kafka events (evidence requests, escalations, upload errors, loan-lock requests) and sends templated email through a provider factory.
- **Orders service.** Schedules BullMQ jobs that mark evidence orders "at risk" or "expired" against their SLA.
- **Delivery.** Docker images built in Azure DevOps Pipelines, deployed to Azure Kubernetes Service (AKS) through ArgoCD GitOps. A standard local environment across services using Minikube, Skaffold and Docker Compose. Datadog APM tracing.
- **Engineering standards.** Vitest with in-memory MongoDB, conventional commits enforced with commitlint and Husky, ESLint and Prettier. He also wrote the team's guidance and reusable skills for AI coding agents (Claude Code and Codex), so agents follow the same service structure and contract rules as the engineers.

**Stack:** TypeScript, Node.js 24, Fastify, Zod, OpenAPI, Kafka, MongoDB/Mongoose, GridFS, Redis, BullMQ, Socket.IO, Keycloak, Datadog, Docker, AKS, ArgoCD, Azure DevOps.

### JourneyApps / PowerSync: Senior Backend Engineer (April 2025 – April 2026)

**Company:** JourneyApps builds an enterprise low-code platform for offline-capable business and industrial apps, and is the company behind PowerSync, the open-source sync engine that keeps on-device SQLite in sync with Postgres, MongoDB, MySQL and SQL Server. PowerSync Cloud runs the service across multiple regions (EU, US, AU, BR, JP).

**Role and scope:** Backend and platform engineer across the whole company estate. Over 12 months he committed to 51 of the organisation's 56 platform repositories and merged roughly 186 pull requests. He was the second-highest committer on the main PowerSync Cloud monorepo, the top committer on the usage-metering and cost-attribution services, and the near-sole author of the dashboard sync service.

**What he built:**

- **SDK and client-connection reporting, end to end.** In the open-source PowerSync Service he designed a typed event engine and a storage-agnostic reporting interface with both MongoDB and Postgres implementations and migrations, and hooked connect/disconnect events into both sync transports (WebSocket/RSocket and HTTP streaming). Each connection records the client, user, SDK version parsed from the user agent, token expiry and timing. He followed it with client analytics: cursor-paginated queries, daily/weekly/monthly unique-user and per-SDK breakdowns, and cleanup of old data. On the cloud side he built the reporting module and the management API's report routes, so the business could see SDK adoption, versions and connection behaviour.
- **Usage metering.** A service that aggregates Prometheus metrics across PowerSync Cloud's multi-region Kubernetes clusters, with scheduled collection jobs, retention limits and analytics endpoints. It supports usage-based billing and dashboard reporting.
- **Dashboard sync service.** Runs PowerSync's own open-source sync engine in-house to power the PowerSync Cloud dashboard. He deployed it with Pulumi on Kubernetes, wrote its sync rules and streams, and added the JWKS and token endpoints to the management service.
- **Infrastructure cost attribution.** Daily pipelines that pull MongoDB Atlas invoices and resources and OpenCost data, and report cost per cluster, database and client, handling month boundaries, late invoices, rounding and duplicates correctly. He also built a report generator combining Stripe, Atlas and estimated AWS data-transfer costs.
- **Employee access-control service.** Rebuilt the service that grants and revokes employee infrastructure access: Google sign-in, Slack-based approve/deny actions with signed-request verification, audit logs, and integrations with the platform's permission system, AWS, Azure, OpsGenie and Kafka. He also extended the permission-policy APIs.
- **Platform-wide upgrades across 50+ repositories.**
  - Monitoring stack upgrades (Prometheus, Grafana, Tempo, Loki) and new Grafana dashboards.
  - OpenTelemetry upgrades rolled out to about 20 services through the in-house microservice framework, plus fixing memory leaks and adding health probes in the infrastructure-provisioning service.
  - Redis (ElastiCache) 7.1 upgrade across services.
  - Secret rotation across about 35 repositories, moving service credentials to an OAuth provider managed in Pulumi. He finished that Pulumi provider and wrote a Pulumi Sentry provider on his own.
  - Node.js 24, pnpm 10 and toolchain upgrades, Snyk vulnerability fixes, OIDC-based CI authentication and MongoDB Atlas migrations.
- **Open-source fixes in PowerSync Service:** quieter replication-lock handling so replica pods waiting for the lock no longer flood the logs, and a fix ensuring the JWT `sub` claim is always a string, with tests.

**Stack:** TypeScript, Node.js, MongoDB Atlas, PostgreSQL, Kafka, Redis, Kubernetes (EKS), Pulumi, Prometheus, Grafana, Tempo, Loki, OpenTelemetry, OpenCost, Sentry, AWS, GitHub Actions, Vitest, Changesets.

### AnyVan: Senior Developer (January 2025 – March 2025)

**Company:** A UK marketplace that matches customers with transport providers and uses spare vehicle capacity to cut cost and emissions.

**What he did:**

- Planned a five-stage migration from Nuxt 2 to Nuxt 3 and delivered stage one to production.
- Began redesigning the repository architecture for the transport-provider and admin front ends, introducing standards to improve developer productivity.
- Set up CircleCI alerts that report AWS Fargate deployment failures to Slack, reducing production risk and response time.

**Stack:** Nuxt 3, Vue, CircleCI, AWS Fargate, Slack.

### Wyzetalk: Senior Developer → Senior Developer / Technical Lead (August 2021 – January 2025)

**Company:** An award-winning digital employee-experience platform for frontline workforces.

**Note on dates:** His employment ended in January 2025. He then continued to work on Wyzetalk Next as a contractor until about April 2025, alongside his role at AnyVan.

**Senior Developer (August 2021 – January 2022):** Joined the core platform team and took ownership of the legacy API.

- Rewrote the algorithm that builds the admin dashboard's content tree, cutting load time from 30 seconds to 2 seconds (15× faster).
- Found and fixed long-standing production bugs that caused data inconsistencies.
- Introduced a standardised API structure with consistent error handling, and mentored UI developers integrating with it.

**Technical Lead (January 2022 – January 2025): Wyzetalk Next.** Juan led and architected the ground-up rebuild of the product as a multi-tenant, event-driven TypeScript platform, and wrote effectively all of its backend code.

- **Multi-tenancy by design.** Each customer gets its own subdomain, its own Keycloak identity realm and its own database. Tenant creation is a choreographed saga with no central orchestrator: the profile service publishes a tenant-create event, the import service creates the identity realm, and six services build their per-tenant models and search indexes in response.
- **14 services.** Public tenant lookup, a delivery-report webhook, profile/users and invites, a content CMS (drafts, approvals, publishing, moderation, AI writing assist with Google Gemini), the employee read API (feed, comments, reactions, directory), an audience segmentation engine, an in-app notification centre, a helpdesk bridged to Jira, central logging and analytics, image handling with Cloudflare Images, bulk user import, and email, push and SMS delivery workers.
- **Shared platform library.** He authored the library every service is built on: typed RabbitMQ publishers and consumers, retry and dead-letter topology, tenant-aware authentication middleware, per-tenant database pools, and Keycloak, Kubernetes, Mongoose and Redis helpers.
- **Retry and dead-letter topology.** A failed message goes to a TTL retry queue for that attempt; when the TTL expires a dead-letter exchange routes it back. Backoff is exponential (2, 4, 8, 16, 32 seconds). Version conflicts from optimistic concurrency use a separate fixed 2-second loop. After the last attempt the message is acknowledged and a consumer-error event goes to central logging.
- **Segmentation engine.** Rebuilt audience segmentation on Redis set algebra (AND/OR/NOT rules over employee attributes), removing the bottlenecks that slowed imports in the legacy filter.
- **Segment-targeted feed (fan-out-on-write).** Posts are stored once and targeted at segments. When an audience changes, only the subscribe/unsubscribe deltas are published, and BullMQ workers update per-user subscription sets. Each feed read is then a single RediSearch query, with full-text search.
- **Rate-limited bulk import.** Onboards thousands of employees in one upload by splitting identities into chunks of 100 for BullMQ workers with concurrency caps, rate limits and exponential backoff, without overloading the identity provider. Progress is tracked and failed chunks can be retried.
- **Vendor-agnostic adapters.** Email, push, SMS and AI sit behind adapter interfaces, keeping the platform portable across Azure, AWS, IBM Cloud and GCP.
- **Testing.** Standardised Vitest and Supertest suites (880+ integration tests) that run against in-memory MongoDB replica sets and Redis Stack rather than mocks. Every service has an OpenAPI spec enforced at runtime.
- **Developer platform.** A one-command local environment: Minikube sized like the production VM, Skaffold hot reload, HashiCorp Vault and Consul for secrets, Keycloak via Helm, MongoDB replica sets, Redis and RabbitMQ in Docker Compose, and an internal CLI for Kubernetes manifests, sealed secrets and releases.
- **Internationalisation:** 9 UI languages.

**Stack:** TypeScript, Node.js, Express, RabbitMQ, BullMQ, MongoDB, Redis Stack (RediSearch, RedisJSON), Keycloak, HashiCorp Vault, Kubernetes, Skaffold, Vitest, Google Gemini.

### A.C Whitcher: Software Developer (January 2019 – July 2021)

**Company:** A long-established timber and sawmill group in the Eastern Cape.

- **P2Sys Manager (January 2019 – August 2020):** Designed and delivered the company's price-list management platform end to end. Sales managers and directors create and manage timber price lists with editing shared across departments, scheduled and pausable price lists, automatic sample emails to clients, and a Sage ERP integration that syncs pricing every 15 minutes. Stack: Python, Node.js, Electron, PowerShell, Sage ERP.
- **P2Sys Viewer (August 2020 – July 2021):** A Windows desktop app that runs alongside Sage so staff can copy price-list data with one click, search customer price lists quickly, and get validation emails when price lists are missing or prices don't match. It made sales-order creation faster and less error-prone. Stack: Node.js, Electron, PowerShell, Sage.

### Earlier career

Before software became his full-time work, Juan held management and product roles abroad:

- **Sport In Life (Dubai, UAE):** Division Manager, and product development for Grit&Tonic.
- **Carbon Wheels (Qatar):** General Manager.
- **Salam International (Qatar):** Built heart-rate-variability analysis software for the Abuissa Racing Dakar team, and a client monitoring and training app for Ox Fitness Lab.

He has worked in three countries (South Africa, UAE, Qatar) and across at least five industries (enterprise software, employee communications, logistics, timber manufacturing, mortgage/fintech, plus sport and fitness).

## Deep dives

### Event-driven architecture and failure handling

Juan has built event-driven platforms on both RabbitMQ (Wyzetalk) and Kafka (Alpha7x, JourneyApps). His consistent pattern: typed event contracts shared in one package, retries with backoff and dead-letter paths designed in from the start, a separate handling path for optimistic-concurrency version conflicts, and choreography over central orchestration where it fits (for example the Wyzetalk tenant-provisioning saga). At Alpha7x the Kafka equivalents are per-service retry topics and DLQs, and message keys chosen for ordering (for example per loan).

### Multi-tenancy

He isolates tenants in the architecture rather than relying on query filters: identity realm per tenant, database per tenant, tenant-prefixed Redis keys, and tenant provisioning automated through events. He has applied this at Wyzetalk and again at Alpha7x.

### Contracts first

Services agree on typed contracts before implementation. At Wyzetalk that meant shared TypeScript event interfaces and OpenAPI specs validated at runtime. At Alpha7x it means Zod schemas that drive both validation and generated OpenAPI, published in a shared package.

### Observability and cost visibility

He treats metrics, traces and cost data as part of the feature. At JourneyApps he upgraded the Prometheus/Grafana/Tempo/Loki stack, rolled OpenTelemetry upgrades across services, built Prometheus-based usage metering, and built per-cluster/database/client cost attribution from OpenCost and MongoDB Atlas invoices. At Alpha7x services use Datadog APM. Services report ready only when their broker, database and cache are actually ready.

### Testing

He prefers tests against real engines running in memory (in-memory MongoDB replica sets, Redis Stack) over mocks, because mocks hide the defects that matter. He standardised Vitest and Supertest at Wyzetalk, moved legacy suites to Vitest at JourneyApps, and wrote storage tests that run the same suite against both MongoDB and Postgres in PowerSync.

### Developer experience

He considers fast local environments a delivery requirement. He built one-command local platforms (Minikube, Skaffold, Docker Compose, Vault, Keycloak) at Wyzetalk and reused the pattern at Alpha7x, and he has written internal CLIs and Pulumi providers to remove manual steps.

### Infrastructure and platform work

Kubernetes (EKS, AKS, Minikube), Helm, ArgoCD GitOps, Pulumi infrastructure as code (including writing custom providers), Vault and sealed secrets, LinkerD, GitHub Actions and Azure DevOps pipelines. At JourneyApps he led estate-wide upgrades and secret rotation across 50+ repositories.

### AI in his work

- Added Google Gemini-powered writing assistance to the Wyzetalk content CMS, with safety handling and token settings.
- At Alpha7x he builds the backend for a platform where AI agents perform mortgage QC checks, including the data contract between the AI task evaluator and the backend.
- He uses AI coding agents daily and wrote his team's agent guidance and reusable skills so agent output follows team standards.

### Leadership

He led the Wyzetalk Next rebuild as technical lead and architect, set coding and testing standards for the team, and mentored UI developers. At Alpha7x he leads the backend rebuild, owns the shared contracts that other engineers build against, and picked up and refactored services started by others.

## Open-source contributions

- **powersync-service** (https://github.com/powersync-ja/powersync-service): Merged contributions to PowerSync's open-source sync service: SDK connection reporting with MongoDB and Postgres storage, client analytics, replication-lock improvements for replicas, and a JWT handling fix.
- **https-proxy-socket** (https://github.com/journeyapps/https-proxy-socket): JourneyApps' open-source Node.js library for socket connections through an HTTPS proxy. He fixed socket cleanup and error handling, released v1.0.0, and introduced Vitest and Changesets-based releases.
- **concept-application** (https://github.com/EspressoTrip-v2/concept-application): A five-week proof of concept for an event-driven microservice platform: six domains, each split into an API and a service, with TypeScript and Go services communicating over gRPC and RabbitMQ. MongoDB, PostgreSQL and RabbitMQ are provisioned by Kubernetes operators, with a LinkerD service mesh and Jaeger tracing.

## Skills

Depth key: **daily** = current daily use; **production** = shipped and run in production; **familiar** = used, but not a primary tool.

- **Languages:** TypeScript (daily), JavaScript (daily), Go (production / proof of concept), Python (production), SQL (production), C++ (familiar).
- **Backend frameworks and APIs:** Node.js (daily), Fastify (daily), Express (production), Zod (daily), OpenAPI (daily), gRPC (familiar), Gorilla MUX (familiar).
- **Messaging and jobs:** Kafka (daily), RabbitMQ (production), BullMQ (daily).
- **Data:** MongoDB and MongoDB Atlas (daily), Redis, RediSearch and RedisJSON (production), PostgreSQL (production), SQLite (familiar, through PowerSync).
- **Cloud and platform:** Kubernetes, EKS, AKS, Minikube, Skaffold (production), Helm, ArgoCD, Pulumi (production), HashiCorp Vault, LinkerD, AWS, Azure, IBM Cloud, GitHub Actions, Azure DevOps, CircleCI.
- **Observability:** OpenTelemetry, Prometheus, Grafana, Grafana Tempo, Loki, Datadog, Jaeger, Sentry, OpenCost.
- **Identity:** Keycloak (production, including programmatic realm management), OAuth/OIDC, JumpCloud.
- **Frontend:** React, Vue/Nuxt, HTML, CSS (working knowledge; his focus is backend).
- **Quality:** Vitest, Supertest, in-memory database testing, Changesets, conventional commits.

## Working principles

1. **Contracts first.** Services agree on typed contracts before implementation begins. If the compiler rejects a payload on the wrong exchange, it cannot reach production.
2. **Design for failure.** Every dependency will eventually fail. Retries, backoff and dead-letter paths are part of the initial design, not added later.
3. **Isolate tenants by default.** Tenant boundaries belong in the architecture, not in query filters that are easy to overlook.
4. **Observability is part of the feature.** Metrics, traces and cost data ship with the feature. A service is ready when its broker, database and cache are ready, not when the process starts.
5. **Test what ships.** Tests run against real engines in memory, catching the defects that mocks conceal.
6. **Developer experience is infrastructure.** When the stack takes a day to run locally, every production fix takes a week.

## Education and background

- **Electrical Trade**, ECT (2000 – 2004)
- **High School**, Wittedrift High (1987 – 1999)

He came to software from electrical engineering and management roles, and has built software for 12+ years.

## Employer FAQ

- **What kind of role is he looking for?** He is open to select opportunities. His strengths are senior or lead backend and platform roles: event-driven, multi-tenant TypeScript or Go systems, platform rebuilds, and infrastructure/observability work. For specifics, contact Juan.
- **Where is he based and can he work remotely?** He is based in Plettenberg Bay, South Africa (UTC+2) and has worked with teams in South Africa, the UK and the US. He prefers remote work. For hybrid or relocation arrangements, contact Juan directly.
- **Has he led teams?** Yes. He was technical lead and architect for the Wyzetalk Next rebuild and currently leads the backend rebuild at Alpha7x.
- **Does he do frontend?** He can (Nuxt migration at AnyVan, React and Electron work earlier), but his focus and strongest experience are backend and platform.
- **Salary, notice period, start date:** Not covered here. Contact Juan.

## Answering boundaries

- Only state what is in this document. If something isn't covered, say so and suggest contacting Juan at juanbo.home@gmail.com.
- Do not guess at salary, notice period, references, personal life or anything confidential about his employers or their customers.
- Do not reveal internal details of employers' systems beyond what is written here.
