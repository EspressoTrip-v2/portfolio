export type Link = {
  label: string;
  href: string;
  handle: string;
};

export type ExternalLink = {
  label: string;
  href: string;
};

export type Role = {
  role: string;
  company: string;
  links?: ExternalLink[];
  start: string;
  end: string;
  location: string;
  blurb: string;
  highlights: string[];
  stack: string[];
  metric?: { value: string; label: string };
  caseStudy?: string;
};

export type EarlierRole = {
  company: string;
  location: string;
  roles: { text: string; link?: ExternalLink }[];
};

export type Project = {
  name: string;
  description: string;
  stack: string[];
  href: string;
};

export type ServiceLane = "edge" | "core" | "worker";

export type Service = {
  name: string;
  lane: ServiceLane;
  role: string;
  tech: string[];
};

export type Flow = {
  id: string;
  title: string;
  summary: string;
  steps: { actor: string; text: string }[];
  backoff?: number[];
};

export const profile = {
  name: "Juan Botha",
  firstName: "Juan",
  lastName: "Botha",
  title: "Lead Backend Engineer",
  location: "Plettenberg Bay, Western Cape, ZA",
  timezone: "Africa/Johannesburg",
  available: true,
  availability: "Open to select opportunities",
  tagline:
    "I design and build event-driven backend platforms that are reliable, observable and built to scale.",
  summary: [
    "Backend engineer with 12+ years of experience building software. My background is in electrical engineering, and I still approach systems the same way: understand the load, design for failure and document every circuit.",
    "I work primarily in TypeScript and Go, with Python and C++ where a problem calls for them. I specialise in distributed, event-driven architecture: multi-tenant platforms, multi-region data sync infrastructure, typed service contracts, and the observability and cost visibility that keep them dependable. I have led ground-up platform rebuilds and supported large multi-region production estates. I currently lead a TypeScript platform rebuild at Alpha7x.",
  ],
  links: {
    email: {
      label: "Email",
      href: "mailto:juanbo.home@gmail.com",
      handle: "juanbo.home@gmail.com",
    },
    github: {
      label: "GitHub",
      href: "https://github.com/EspressoTrip-v2",
      handle: "EspressoTrip-v2",
    },
    linkedin: {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/juanb-14b1b6138",
      handle: "in/juanb-14b1b6138",
    },
  } satisfies Record<string, Link>,
};

export const stats = [
  { value: 12, suffix: "+", label: "Years building software" },
  { value: 15, suffix: "×", label: "Faster admin content tree" },
  { value: 5, suffix: "", label: "Industries served" },
  { value: 3, suffix: "", label: "Countries worked in" },
];

export const experience: Role[] = [
  {
    role: "Lead Backend Engineer",
    company: "Alpha7x",
    links: [{ label: "Alpha7x", href: "https://alpha7x.com" }],
    start: "Jun 2026",
    end: "Present",
    location: "Plettenberg Bay, ZA",
    blurb: "Trust infrastructure for mortgage assets.",
    highlights: [
      "Leading the rebuild of a legacy .NET backend as TypeScript services on Fastify, with Zod-typed contracts and generated OpenAPI documentation.",
      "Designed Kafka event flows across the backend, import, communication, orders and response services, with retry and version-conflict handling for tenant events.",
      "Built the import pipeline: authenticated document uploads into MongoDB GridFS, BullMQ background workflows and pluggable Azure, AWS and FTP storage providers.",
      "Created @alpha7x/common-ts, the shared ESM contracts package for roles, identity, Kafka topics and error schemas, published to a private Azure Artifacts feed.",
      "Delivering to AKS through ArgoCD GitOps, with a standard Minikube, Skaffold and Docker Compose development environment across services.",
    ],
    stack: ["TypeScript", "Fastify", "Zod", "Kafka", "MongoDB", "BullMQ", "Redis", "Keycloak", "Datadog", "AKS", "ArgoCD"],
  },
  {
    role: "Senior Backend Engineer",
    company: "JourneyApps",
    links: [
      { label: "JourneyApps", href: "https://www.journeyapps.com" },
      { label: "PowerSync", href: "https://www.powersync.com" },
    ],
    start: "Apr 2025",
    end: "Apr 2026",
    location: "Cape Town, ZA",
    blurb:
      "Enterprise application platform and the company behind PowerSync, the open-source engine that keeps on-device SQLite in sync with Postgres, MongoDB, MySQL and SQL Server.",
    highlights: [
      "Delivered SDK and client-connection reporting end to end, from the open-source PowerSync Service through the cloud management API to usage storage, giving the business visibility into SDK adoption, versions and connection behaviour.",
      "Built usage metering that aggregates Prometheus metrics across PowerSync Cloud's multi-region Kubernetes clusters, supporting usage-based billing and dashboard reporting.",
      "Designed and delivered the dashboard sync service, which runs PowerSync's own sync engine in-house to power the PowerSync Cloud dashboard.",
      "Built infrastructure cost attribution across OpenCost, MongoDB Atlas invoices and AWS spend, reported per cluster, database and client, with scheduled pipelines that handle month boundaries and late invoices correctly.",
      "Led platform-wide upgrades across 50+ repositories, covering Node.js and toolchains, an OAuth provider migration, secret rotation, OIDC-based CI authentication, Redis and MongoDB Atlas migrations, and observability upgrades on regional clusters.",
      "Rebuilt the employee access-control service with Slack-based approvals and signed-request verification, and extended the platform's permission-policy APIs.",
    ],
    stack: ["TypeScript", "Node.js", "MongoDB Atlas", "PostgreSQL", "Kubernetes", "Pulumi", "Prometheus", "Grafana", "OpenTelemetry", "AWS"],
    metric: { value: "50+", label: "platform repositories" },
  },
  {
    role: "Senior Developer",
    company: "AnyVan",
    links: [{ label: "AnyVan", href: "https://www.anyvan.com" }],
    start: "Jan 2025",
    end: "Mar 2025",
    location: "Cape Town, ZA",
    blurb:
      "UK marketplace that matches customers with transport providers and uses spare vehicle capacity to cut cost and emissions.",
    highlights: [
      "Planned a five-stage migration from Nuxt 2 to Nuxt 3 and delivered stage one to production.",
      "Began redesigning the repository architecture for the TPP and Admin front ends, introducing standards to improve developer productivity.",
      "Set up CircleCI alerts that report AWS Fargate deployment failures to Slack, reducing production risk and shortening response times.",
    ],
    stack: ["Nuxt 3", "Vue", "CircleCI", "AWS Fargate", "Slack"],
  },
  {
    role: "Senior Developer / Technical Lead",
    company: "Wyzetalk",
    links: [{ label: "Wyzetalk", href: "https://www.wyzetalk.com" }],
    start: "Jan 2022",
    end: "Jan 2025",
    location: "Stellenbosch, ZA",
    blurb:
      "Award-winning digital employee experience platform for frontline workforces.",
    highlights: [
      "Led the ground-up rebuild of Wyzetalk as Wyzetalk Next: a multi-tenant, event-driven TypeScript platform on RabbitMQ, isolated per tenant from identity realm to database.",
      "Authored the shared platform library underpinning every service: typed publishers and consumers, retry and dead-letter topology, tenant-aware authentication middleware and per-tenant database pools.",
      "Built a segmentation engine on Redis set algebra to replace the legacy segmentation filter, removing the bottlenecks that slowed new imports.",
      "Designed a segment-targeted feed based on fan-out-on-write. Audience changes are applied as they happen, so each feed read is a single RediSearch query.",
      "Kept the platform vendor-agnostic through adapter interfaces for email, push, SMS and AI, keeping it portable across Azure, AWS, IBM and GCP.",
      "Standardised testing across the platform with Vitest and Supertest suites that run against in-memory MongoDB replica sets and Redis Stack rather than mocks.",
    ],
    stack: ["TypeScript", "Express", "MongoDB", "Redis Search", "RedisJSON", "RabbitMQ", "BullMQ", "Keycloak", "Vault", "Kubernetes"],
    metric: { value: "Greenfield", label: "multi-tenant platform rebuild" },
    caseStudy: "#case-study",
  },
  {
    role: "Senior Developer",
    company: "Wyzetalk",
    links: [{ label: "Wyzetalk", href: "https://www.wyzetalk.com" }],
    start: "Aug 2021",
    end: "Jan 2022",
    location: "Stellenbosch, ZA",
    blurb: "Joined the core platform team and took ownership of the legacy API.",
    highlights: [
      "Rewrote the algorithm that builds the admin dashboard's content tree, cutting its load time from 30 seconds to 2 seconds.",
      "Found and fixed long-standing production bugs that had been causing data inconsistencies.",
      "Introduced a standardised API structure with consistent error handling.",
      "Mentored UI developers as they integrated the new API.",
    ],
    stack: ["TypeScript", "Node.js", "MongoDB", "REST APIs"],
    metric: { value: "30s → 2s", label: "content tree load time" },
  },
  {
    role: "Software Developer · P2Sys Viewer",
    company: "A.C Whitcher",
    links: [{ label: "A.C Whitcher", href: "https://www.acwhitcher.co.za" }],
    start: "Aug 2020",
    end: "Jul 2021",
    location: "Eastern Cape, ZA",
    blurb:
      "Long-established timber and sawmill group. Built desktop tooling that connected sales staff with the Sage ERP.",
    highlights: [
      "Built a Windows desktop application that runs alongside Sage, letting staff copy and paste price-list data with one click.",
      "Added fast customer price-list search with summarised views generated by P2Sys Manager.",
      "Added validation that emails the sales manager, Sage admin and director when price lists are missing or prices do not match.",
      "Made sales order creation faster and less error-prone by automating manual steps.",
    ],
    stack: ["Node.js", "Electron", "PowerShell", "Sage"],
  },
  {
    role: "Software Developer · P2Sys Manager",
    company: "A.C Whitcher",
    links: [{ label: "A.C Whitcher", href: "https://www.acwhitcher.co.za" }],
    start: "Jan 2019",
    end: "Aug 2020",
    location: "Eastern Cape, ZA",
    blurb:
      "Designed and delivered the company's price-list management platform end to end.",
    highlights: [
      "Gave sales managers and directors one tool to create and manage timber price lists, with editing shared across departments.",
      "Added scheduled and pausable price lists for targeted pricing, with automatic emails that send sample price lists to clients.",
      "Built a Sage ERP integration that syncs pricing every 15 minutes.",
    ],
    stack: ["Python", "Node.js", "Electron", "PowerShell", "Sage ERP"],
    metric: { value: "15 min", label: "automated ERP sync cadence" },
  },
];

export const earlier: EarlierRole[] = [
  {
    company: "Sport In Life",
    location: "Dubai, UAE",
    roles: [
      { text: "Division Manager" },
      { text: "Product development for", link: { label: "Grit&Tonic", href: "https://gritandtonic.com/" } },
    ],
  },
  {
    company: "Carbon Wheels",
    location: "Qatar",
    roles: [{ text: "General Manager" }],
  },
  {
    company: "Salam International",
    location: "Qatar",
    roles: [
      {
        text: "HRV analysis software for",
        link: { label: "Abuissa Racing (Dakar)", href: "https://www.instagram.com/abuissaracing/" },
      },
      {
        text: "Client monitoring & training app for",
        link: { label: "Ox Fitness Lab", href: "https://www.oxfitnesslab.com/" },
      },
    ],
  },
];

export const caseStudy = {
  name: "Wyzetalk Next",
  period: "2022 – 2025",
  summary:
    "A ground-up rebuild of a frontline employee-communication product as a multi-tenant platform. Each customer gets its own subdomain, identity realm and database. Admins target posts at audience segments, and employees get a personalised feed with comments, reactions, notifications and support.",
  metrics: [
    { value: "1:1", label: "Tenant to identity realm" },
    { value: "1:1", label: "Tenant to database" },
    { value: "0", label: "Central orchestrators" },
    { value: "1", label: "Query per feed read" },
    { value: "2→32s", label: "Exponential retry backoff" },
    { value: "4", label: "Swappable provider adapters" },
    { value: "9", label: "UI languages" },
    { value: "880+", label: "Integration tests" },
  ],
  services: [
    { name: "public", lane: "edge", role: "Unauthenticated tenant lookup that starts the login flow.", tech: ["Express"] },
    { name: "report", lane: "edge", role: "Public webhook that receives SMS delivery reports.", tech: ["Express"] },
    { name: "profile", lane: "core", role: "Users and tenants admin, invites, imports and state workflows.", tech: ["Keycloak admin", "Mongoose"] },
    { name: "content", lane: "core", role: "Post CMS: drafts, approvals, publishing, moderation and AI writing assist.", tech: ["Mongoose", "Gemini"] },
    { name: "interface", lane: "core", role: "Employee read API: feed, comments, reactions, tags and directory.", tech: ["RedisJSON", "RediSearch"] },
    { name: "grouping", lane: "core", role: "Audience segmentation engine built on Redis set algebra.", tech: ["Redis", "redis-om", "BullMQ"] },
    { name: "communication", lane: "core", role: "In-app notification centre with counts and approval actions.", tech: ["Mongoose"] },
    { name: "support", lane: "core", role: "Helpdesk tickets bridged to Jira.", tech: ["Mongoose", "Jira"] },
    { name: "logging", lane: "core", role: "Central log sink and analytics API for users, posts and segments.", tech: ["Winston", "Axiom", "Papertrail"] },
    { name: "file", lane: "core", role: "Image upload and lifecycle, with per-device variants.", tech: ["Cloudflare Images", "BullMQ"] },
    { name: "import", lane: "worker", role: "Bulk user import and per-tenant identity realm creation.", tech: ["Keycloak admin", "BullMQ"] },
    { name: "email", lane: "worker", role: "Templated email delivery behind a provider adapter.", tech: ["AWS SES", "BullMQ"] },
    { name: "push", lane: "worker", role: "Mobile and web push behind a provider adapter.", tech: ["FCM", "BullMQ"] },
    { name: "sms", lane: "worker", role: "SMS delivery behind a provider adapter.", tech: ["HTTP provider", "BullMQ"] },
  ] satisfies Service[],
  flows: [
    {
      id: "tenant",
      title: "Tenant provisioning saga",
      summary:
        "Creating a tenant is a choreographed saga. No central orchestrator runs it: each service reacts to an event, does its part and reports back.",
      steps: [
        { actor: "profile", text: "Publishes tenant.create when an operator adds a customer." },
        { actor: "import", text: "Creates a dedicated Keycloak realm for the tenant and replies with tenant.create-success." },
        { actor: "profile", text: "Fans out create-model, add-data and create-index events." },
        { actor: "6 services", text: "Communication, content, grouping, interface, logging and support each build their per-tenant models and search indexes." },
      ],
    },
    {
      id: "feed",
      title: "Segment-targeted feed",
      summary:
        "Posts are stored once and targeted at audience segments. Membership changes are pushed when they happen, so a feed read is one indexed query.",
      steps: [
        { actor: "admin", text: "Defines a segment as AND / OR / NOT rules over employee attributes." },
        { actor: "grouping", text: "Evaluates the rules with Redis set algebra and diffs the old audience against the new one." },
        { actor: "workers", text: "Only the subscribe and unsubscribe deltas are published. BullMQ workers update per-user subscription sets in pipelines." },
        { actor: "interface", text: "Serves the feed with one RediSearch query over the user's segments, sorted by publish date, with full-text search." },
      ],
    },
    {
      id: "retry",
      title: "Retry & dead-letter topology",
      summary:
        "Every consumer inherits the same failure handling from the shared library. Transient errors back off and recover without manual intervention.",
      steps: [
        { actor: "consumer", text: "Sends a failed message to a TTL retry queue for that attempt." },
        { actor: "broker", text: "When the TTL expires, a dead-letter exchange routes the message back to the main queue." },
        { actor: "consumer", text: "Version conflicts from optimistic concurrency take a separate fixed 2 s loop instead." },
        { actor: "logging", text: "After the last attempt the message is acknowledged and a consumer-error event goes to central logging." },
      ],
      backoff: [2, 4, 8, 16, 32],
    },
    {
      id: "import",
      title: "Rate-limited bulk import",
      summary:
        "Onboards thousands of employees in one upload without overloading the identity provider.",
      steps: [
        { actor: "profile", text: "Accepts the upload and records an import document to track progress." },
        { actor: "import", text: "Splits identities into chunks of 100 for BullMQ workers, with concurrency caps, rate limits and exponential backoff." },
        { actor: "keycloak", text: "Creates users in the tenant's own realm, and grouping indexes them for segmentation." },
        { actor: "profile", text: "Reports identity and segment progress. Failed chunks can be retried from the API." },
      ],
    },
  ] satisfies Flow[],
  stack: ["TypeScript", "Express", "RabbitMQ", "BullMQ", "MongoDB", "Redis Stack", "Keycloak", "Vault", "Kubernetes", "Skaffold", "Vitest"],
};

export const principles = [
  {
    title: "Contracts first",
    body: "Services agree on typed contracts before implementation begins. If the compiler rejects a payload on the wrong exchange, it cannot reach production.",
    evidence: "Shared typed event contracts at Wyzetalk · Zod schemas and generated OpenAPI at Alpha7x",
  },
  {
    title: "Design for failure",
    body: "Every dependency will eventually fail. Retries, backoff and dead-letter paths are part of the initial design, not added later.",
    evidence: "TTL retry queues and dead-letter exchanges · 2 → 32 s backoff · cost pipelines with retry limits, chunked writes and reprocessing",
  },
  {
    title: "Isolate tenants by default",
    body: "Tenant boundaries belong in the architecture, not in query filters that are easy to overlook.",
    evidence: "Identity realm per tenant · database per tenant · tenant-prefixed Redis keys",
  },
  {
    title: "Observability is part of the feature",
    body: "Metrics, traces and cost data are delivered with the feature. A service is ready when its broker, database and cache are ready, not when the process starts.",
    evidence: "Readiness gated on live broker, database and cache state · Prometheus usage metering and per-cluster cost attribution at PowerSync",
  },
  {
    title: "Test what ships",
    body: "Tests run against real engines in memory, catching the defects that mocks conceal.",
    evidence: "Vitest and Supertest against in-memory MongoDB replica sets and Redis Stack · legacy suites moved to Vitest at JourneyApps",
  },
  {
    title: "Developer experience is infrastructure",
    body: "When the stack takes a day to run locally, every production fix takes a week. Fast local environments are a delivery requirement.",
    evidence: "One make deploy for the whole data tier · an internal CLI for Kubernetes manifests, sealed secrets and releases · pattern reused at Alpha7x",
  },
];

export const skillGroups = [
  {
    title: "Languages",
    code: "LANG",
    items: ["TypeScript", "JavaScript", "Go", "Python", "C++", "SQL"],
  },
  {
    title: "Backend & Messaging",
    code: "CORE",
    items: ["Node.js", "Fastify", "Express", "Gorilla MUX", "gRPC", "OpenAPI", "Zod", "RabbitMQ", "Kafka", "BullMQ"],
  },
  {
    title: "Data",
    code: "DATA",
    items: ["MongoDB", "MongoDB Atlas", "Redis", "Redis Search", "RedisJSON", "PostgreSQL", "SQLite", "SQL"],
  },
  {
    title: "Cloud & Platform",
    code: "INFRA",
    items: ["Kubernetes", "EKS", "AKS", "Helm", "ArgoCD", "LinkerD", "Vault", "Pulumi", "Skaffold", "Minikube", "AWS", "Azure", "IBM Cloud", "GitHub Actions", "CI/CD"],
  },
  {
    title: "Observability & Identity",
    code: "OPS",
    items: ["OpenTelemetry", "Prometheus", "Grafana", "Grafana Tempo", "Datadog", "Jaeger", "Sentry", "OpenCost", "Keycloak", "OAuth", "JumpCloud"],
  },
  {
    title: "Frontend & Quality",
    code: "UI/QA",
    items: ["React", "Nuxt", "HTML", "CSS", "Vitest", "Supertest", "Agile", "OOP"],
  },
];

export const education = [
  { name: "Electrical Trade", issuer: "ECT", period: "2000 – 2004" },
  { name: "High School", issuer: "Wittedrift High", period: "1987 – 1999" },
];

export const languages = [
  { name: "English", level: "Native" },
  { name: "Afrikaans", level: "Professional" },
];

export const projects: Project[] = [
  {
    name: "concept-application",
    description:
      "A five-week proof of concept for an event-driven microservice platform. Six domains, each split into an API and a service, with TypeScript and Go services communicating over gRPC and RabbitMQ. MongoDB, PostgreSQL and RabbitMQ are provisioned by Kubernetes operators, with a LinkerD service mesh and Jaeger tracing.",
    stack: ["TypeScript", "Go", "Kubernetes", "LinkerD", "gRPC", "RabbitMQ"],
    href: "https://github.com/EspressoTrip-v2/concept-application",
  },
  {
    name: "powersync-service",
    description:
      "Merged contributions to PowerSync's open-source sync service, which keeps on-device SQLite in sync with Postgres, MongoDB and MySQL. Contributions include SDK reporting, client analytics, replication replicas and a JWT handling fix.",
    stack: ["TypeScript", "Node.js", "PostgreSQL", "MongoDB", "MySQL"],
    href: "https://github.com/powersync-ja/powersync-service",
  },
  {
    name: "https-proxy-socket",
    description:
      "JourneyApps' open-source Node.js library for socket connections through an HTTPS proxy. Fixed socket cleanup and error handling, released v1.0.0, and introduced Vitest and changeset-based releases.",
    stack: ["TypeScript", "Node.js", "Vitest", "Changesets", "GitHub Actions"],
    href: "https://github.com/journeyapps/https-proxy-socket",
  },
];
