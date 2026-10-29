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
    "I design event-driven backends that stay up, scale out and explain themselves.",
  summary: [
    "Results-driven engineer with 12+ years of building software. I started out in electrical engineering, and that is still how I approach systems: understand the load, design for failure, and leave every circuit labelled.",
    "I work mostly in TypeScript and Go, with Python and C++ when a problem needs them. My focus is distributed, event-driven architecture: multi-tenant microservices on Kubernetes, message brokers, typed contracts and the observability that keeps them honest. Right now I'm leading a TypeScript platform rebuild at Alpha7x.",
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
  { value: 14, suffix: "", label: "Services in the platform I led" },
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
      "Ship to AKS through ArgoCD GitOps, with a standard Minikube, Skaffold and Docker Compose development setup across services.",
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
      "Platform company behind tools for building enterprise apps and PowerSync, an offline-first data sync engine.",
    highlights: [
      "Built backend systems and internal tooling across both the JourneyApps platform and PowerSync to improve reliability, visibility and operational insight.",
      "Designed and implemented SDK connection reporting, showing how customers adopt the SDK, how they use it and how their connections behave.",
      "Built Atlas billing and cost-tracking processes that show what drives infrastructure cost and make internal reporting more accurate.",
      "Improved monitoring and observability across platform systems, which made service behaviour easier to see and troubleshooting faster.",
      "Upgraded and maintained services across the platform and fixed security issues in the codebase.",
    ],
    stack: ["TypeScript", "Node.js", "MongoDB", "Kubernetes", "Prometheus", "Grafana", "AWS"],
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
      "Planned a five-stage migration from Nuxt 2 to Nuxt 3 and shipped stage one to production.",
      "Started redesigning the repository architecture for the TPP and Admin front ends, with new standards to make developers more productive.",
      "Set up CircleCI alerts that post AWS Fargate deployment failures to Slack, which reduced production risk and sped up response.",
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
      "Led the rebuild of Wyzetalk as Wyzetalk Next: a multi-tenant platform of 14 event-driven TypeScript services that communicate over 73 RabbitMQ exchanges.",
      "Wrote the shared platform library, shipped in about 2,600 releases. It provides typed publishers and consumers, retry and dead-letter topology, tenant-aware auth middleware and per-tenant database pools.",
      "Built a segmentation engine on Redis set algebra to replace the legacy segmentation filter, removing the bottlenecks that slowed new imports.",
      "Designed a segment-targeted feed, a custom take on fan-out-on-write. Audience changes are pushed when they happen, so each feed read is a single RediSearch query.",
      "Kept the platform vendor-agnostic with adapter interfaces for email, push, SMS and AI, so it stays portable across Azure, AWS, IBM and GCP.",
      "Standardised testing across the platform: 880+ Vitest and Supertest cases that run against in-memory MongoDB replica sets and Redis Stack.",
    ],
    stack: ["TypeScript", "Express", "MongoDB", "Redis Search", "RedisJSON", "RabbitMQ", "BullMQ", "Keycloak", "Vault", "Kubernetes"],
    metric: { value: "14 services", label: "multi-tenant platform" },
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
      "Long-established sawmill group. Built desktop tooling that sat between sales staff and the Sage ERP.",
    highlights: [
      "Built a Windows desktop app that floats over Sage, letting staff copy and auto-paste price-list data with one click.",
      "Added fast customer price-list search with summarised views generated by P2Sys Manager.",
      "Added validation that emails the sales manager, Sage admin and director when price lists are missing or prices don't match.",
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
    { value: "14", label: "Backend services" },
    { value: "117k", label: "Lines of TypeScript" },
    { value: "73", label: "Event exchanges" },
    { value: "96", label: "Event consumers" },
    { value: "148", label: "Documented API operations" },
    { value: "880+", label: "Automated tests" },
    { value: "9", label: "UI languages" },
    { value: "2.6k", label: "Shared-library releases" },
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
        "Every consumer gets the same failure handling from the shared library. Transient errors back off and recover without anyone being paged.",
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
    body: "Services agree on typed contracts before anything else. If the compiler won't accept a payload on the wrong exchange, it can't be sent there.",
    evidence: "70 typed event contracts in a shared package · Zod schemas and generated OpenAPI at Alpha7x",
  },
  {
    title: "Design for failure",
    body: "Every dependency will fail at some point. Retries, backoff and dead-letter paths are the default, not something added later.",
    evidence: "TTL retry queues and dead-letter exchanges · 2 → 32 s backoff · version-conflict retries",
  },
  {
    title: "Isolate tenants by default",
    body: "Tenant boundaries belong in the architecture, not in WHERE clauses that someone will eventually forget.",
    evidence: "Identity realm per tenant · database per tenant · tenant-prefixed Redis keys",
  },
  {
    title: "Readiness reflects reality",
    body: "A pod is ready when its broker, database and cache connections are ready, not when the process starts.",
    evidence: "Readiness gates driven by live RabbitMQ, MongoDB and Redis connection state",
  },
  {
    title: "Test what ships",
    body: "Tests run against real engines in memory, so they catch the bugs that mocks hide.",
    evidence: "880+ Vitest and Supertest cases · in-memory MongoDB replica sets and Redis Stack",
  },
  {
    title: "Developer experience is infrastructure",
    body: "If the stack takes a day to run locally, every production fix takes a week.",
    evidence: "One make deploy for the whole data tier · Minikube, Skaffold and Compose · pattern reused at Alpha7x",
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
    items: ["MongoDB", "Redis", "Redis Search", "RedisJSON", "PostgreSQL", "SQL"],
  },
  {
    title: "Cloud & Platform",
    code: "INFRA",
    items: ["Kubernetes", "AKS", "ArgoCD", "LinkerD", "Vault", "Pulumi", "Skaffold", "Minikube", "AWS", "Azure", "IBM Cloud", "CI/CD"],
  },
  {
    title: "Observability & Identity",
    code: "OPS",
    items: ["OpenTelemetry", "Prometheus", "Grafana", "Datadog", "Jaeger", "Keycloak", "OAuth", "JumpCloud"],
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
      "A five-week proof of concept for an event-driven microservice platform. It has six domains, each split into an API and a service, with TypeScript and Go services talking over gRPC and RabbitMQ. MongoDB, PostgreSQL and RabbitMQ are provisioned by Kubernetes operators, with a LinkerD service mesh and Jaeger tracing.",
    stack: ["TypeScript", "Go", "Kubernetes", "LinkerD", "gRPC", "RabbitMQ"],
    href: "https://github.com/EspressoTrip-v2/concept-application",
  },
];
