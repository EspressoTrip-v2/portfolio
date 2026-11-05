/**
 * General technology terms that a more specific fact proves. A sentence may use the general term
 * when its sources name one of the specific ones: AKS is managed Kubernetes, so "Kubernetes" is
 * true of AKS work. Only true implications belong here, never "similar" technologies.
 */
export const EQUIVALENTS: Record<string, string[]> = {
  Kubernetes: ["AKS", "EKS", "Minikube", "Helm"],
  AWS: ["EKS", "S3"],
  Azure: ["AKS"],
  PostgreSQL: ["Postgres"],
  Redis: ["RediSearch", "Redis Search", "RedisJSON", "Redis Stack"],
  MongoDB: ["GridFS", "MongoDB Atlas"],
  "Node.js": ["Fastify", "Express"],
};

/** The equivalents as prompt text, e.g. "Kubernetes (for AKS, EKS, Minikube, Helm)". */
export function equivalentsForPrompt() {
  return Object.entries(EQUIVALENTS)
    .map(([general, specific]) => `${general} (for ${specific.join(", ")})`)
    .join("; ");
}
