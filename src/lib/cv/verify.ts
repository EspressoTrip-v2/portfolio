import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { profile } from "@/content/profile";
import { originalBullets } from "./assemble";
import { factBank } from "./factBank";
import { FAITHFULNESS_PROMPT } from "./prompt";
import { type CvBullet, type CvKeyword, cvLimits, type Reverted, type TailorOutput } from "./schema";

/**
 * Technologies Juan has not used but job specs often ask for. Together with his own skills
 * they form the vocabulary that a rewritten sentence may only mention when its sources do.
 */
const COMMON_TECH = [
  "Java",
  "Spring",
  "Spring Boot",
  "Kotlin",
  "Scala",
  "C#",
  "Rust",
  "Ruby",
  "Rails",
  "PHP",
  "Laravel",
  "Elixir",
  "Django",
  "Flask",
  "FastAPI",
  "NestJS",
  "Next.js",
  "Angular",
  "Vue",
  "Svelte",
  "GraphQL",
  "Deno",
  "Bun",
  "GCP",
  "Google Cloud",
  "Terraform",
  "Ansible",
  "Jenkins",
  "GitLab",
  "CircleCI",
  "Docker Swarm",
  "OpenShift",
  "Istio",
  "Envoy",
  "Nomad",
  "Consul",
  "Lambda",
  "DynamoDB",
  "Cassandra",
  "Elasticsearch",
  "OpenSearch",
  "Snowflake",
  "BigQuery",
  "Spark",
  "Airflow",
  "Flink",
  "NATS",
  "Pulsar",
  "SQS",
  "SNS",
  "Kinesis",
  "MSSQL",
  "Oracle",
  "MariaDB",
  "CockroachDB",
  "Neo4j",
  "Splunk",
  "New Relic",
  "Dynatrace",
  "Kibana",
  "Auth0",
  "Okta",
  "Machine Learning",
  "TensorFlow",
  "PyTorch",
  "Salesforce",
  "SAP",
  "Microservices",
];

/**
 * Practice terms rather than products: they restate what a fact describes (CircleCI deployments are
 * CI/CD), so they are left to the faithfulness check instead of the strict technology check.
 */
const PRACTICES = new Set(["CI/CD", "Microservices", "REST APIs", "Agile", "OOP"]);

const vocabulary = [...new Set([...factBank.skills, ...COMMON_TECH])].filter((term) => !PRACTICES.has(term));

function escape(term: string) {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Whole-term match that also works for terms like "C++" or "Node.js". Case-sensitive, so the
 * language "Go" or "Rust" is not confused with the English words "go" or "rust".
 */
function mentions(text: string, term: string) {
  return new RegExp(`(^|[^A-Za-z0-9])${escape(term)}($|[^A-Za-z0-9+#])`).test(text);
}

/** Numbers as written, e.g. "50+", "12", "2", "30". */
function numbers(text: string) {
  return text.match(/\d+(?:[.,]\d+)?/g) ?? [];
}

/**
 * Deterministic checks for one sentence against the facts it cites. Returns a reason when the
 * sentence fails, or undefined when it passes.
 */
function checkClaim(text: string, sources: string[], allowedRoleId: string | undefined, extraContext: string) {
  if (sources.length === 0) return "cites no facts";
  const facts = sources.map((id) => factBank.factById.get(id));
  if (facts.some((fact) => !fact)) return "cites a fact that does not exist";
  if (allowedRoleId && facts.some((fact) => fact!.roleId !== allowedRoleId)) return "cites a fact from another role";

  const sourceText = `${facts.map((fact) => fact!.text).join(" ")} ${extraContext}`;
  const sourceNumbers = new Set(numbers(sourceText));
  const newNumber = numbers(text).find((number) => !sourceNumbers.has(number));
  if (newNumber) return `adds the number ${newNumber}`;

  const newTech = vocabulary.find((term) => mentions(text, term) && !mentions(sourceText, term));
  if (newTech) return `adds ${newTech}`;
  return undefined;
}

const Verdict = z.object({
  unsupported: z.array(z.object({ claim: z.number(), reason: z.string() })),
});

/**
 * Second pass with the cheap model: flags rewritten sentences that claim more than their
 * sources. Throws on failure; the caller fails the request rather than ship unchecked text.
 */
async function checkFaithfulness(
  client: Anthropic,
  model: string,
  claims: { text: string; sources: string[]; extra?: string }[],
) {
  if (claims.length === 0) return new Map<number, string>();
  const body = claims
    .map((claim, i) => {
      const cited = claim.sources.flatMap((id) => factBank.factById.get(id)?.text ?? []);
      const facts = [...cited, ...(claim.extra ? [claim.extra] : [])].map((text) => `- ${text}`).join("\n");
      return `<claim n="${i + 1}">\n<rewritten>${claim.text}</rewritten>\n<facts>\n${facts}\n</facts>\n</claim>`;
    })
    .join("\n\n");

  const response = await client.messages.parse(
    {
      model,
      max_tokens: 2048,
      system: FAITHFULNESS_PROMPT,
      output_config: { effort: "low", format: zodOutputFormat(Verdict) },
      messages: [{ role: "user", content: body }],
    },
    { timeout: 30_000, maxRetries: 1 },
  );
  console.info("[cv] faithfulness", {
    stop: response.stop_reason,
    input: response.usage.input_tokens,
    output: response.usage.output_tokens,
  });
  if (response.stop_reason === "refusal" || !response.parsed_output)
    throw new Error("Faithfulness check returned no verdict");
  return new Map(response.parsed_output.unsupported.map((item) => [item.claim - 1, item.reason]));
}

/**
 * Turns the model's draft into content that is safe to print. Anything that fails a check is
 * replaced by Juan's original wording, so a failure falls back to the real CV, never to invented text.
 */
export async function verifyDraft(client: Anthropic, guardModel: string, draft: TailorOutput) {
  const knownSkillsLine = `Skills Juan has used: ${factBank.skills.join(", ")}.`;
  const reverted: Reverted[] = [];
  const knownSkills = new Map(factBank.skills.map((skill) => [skill.toLowerCase(), skill]));

  // 1. Summary
  // The summary may also name any of Juan's known skills, not only those in the facts it cites.
  const summaryReason = checkClaim(draft.summary.text, draft.summary.sources, undefined, knownSkillsLine);
  let summary = draft.summary.text.trim();
  let summarySources = draft.summary.sources;
  if (summaryReason || summary.length === 0 || summary.length > 700) {
    reverted.push({ roleId: "summary", attempted: summary, reason: summaryReason ?? "summary is empty or too long" });
    summary = profile.summary[0];
    summarySources = ["summary.1"];
  }

  // 2. Bullets per role
  const bullets = new Map<string, CvBullet[]>();
  for (const role of factBank.roles) {
    const drafted = draft.roles.find((entry) => entry.roleId === role.id)?.bullets ?? [];
    const kept: CvBullet[] = [];
    for (const bullet of drafted.slice(0, cvLimits.maxBulletsPerRole)) {
      const text = bullet.text.trim();
      const reason =
        text.length > 400 ? "bullet is too long" : checkClaim(text, bullet.sources, role.id, role.stack.join(" "));
      if (!reason) {
        kept.push({ text, sources: bullet.sources });
        continue;
      }
      reverted.push({ roleId: role.id, attempted: text, reason });
      // Fall back to the original wording of the first highlight it cited, if that is a real fact of this role.
      const original = bullet.sources
        .map((id) => factBank.factById.get(id))
        .find((fact) => fact?.roleId === role.id && fact.kind === "highlight");
      if (original) kept.push({ text: original.text, sources: [original.id] });
    }
    bullets.set(role.id, kept.length > 0 ? kept : originalBullets(role));
  }

  // 3. Model check on everything that passed the deterministic checks
  const claims = [
    { key: "summary", index: -1, text: summary, sources: summarySources, extra: knownSkillsLine },
    ...[...bullets].flatMap(([roleId, list]) => list.map((bullet, index) => ({ key: roleId, index, ...bullet }))),
  ].filter((claim) => !(claim.sources.length === 1 && factBank.factById.get(claim.sources[0])?.text === claim.text));
  const flagged = await checkFaithfulness(client, guardModel, claims);
  for (const [i, reason] of flagged) {
    const claim = claims[i];
    if (!claim) continue;
    reverted.push({ roleId: claim.key, attempted: claim.text, reason });
    if (claim.key === "summary") {
      summary = profile.summary[0];
      summarySources = ["summary.1"];
      continue;
    }
    const list = bullets.get(claim.key)!;
    const original = claim.sources
      .map((id) => factBank.factById.get(id))
      .find((fact) => fact?.roleId === claim.key && fact.kind === "highlight");
    list[claim.index] = original ? { text: original.text, sources: [original.id] } : { text: "", sources: [] };
  }
  for (const [roleId, list] of bullets) {
    const seen = new Set<string>();
    const clean = list.filter((bullet) => bullet.text && !seen.has(bullet.text) && seen.add(bullet.text));
    bullets.set(roleId, clean.length > 0 ? clean : originalBullets(factBank.roles.find((role) => role.id === roleId)!));
  }

  // 4. Skills: only ones Juan has, spelled as in profile.ts
  const skills = [
    ...new Set(
      draft.skills.map((skill) => knownSkills.get(skill.trim().toLowerCase())).filter((skill) => skill !== undefined),
    ),
  ].slice(0, cvLimits.maxSkills);

  // 5. Keywords: "matched" needs real evidence or a known skill. A known skill always counts,
  // even when the model was unsure, and "React.js" counts as "React".
  const normalise = (term: string) =>
    term
      .toLowerCase()
      .replace(/\.js$/, "")
      .replace(/[^a-z0-9+#]/g, "");
  const knownNormalised = new Set(factBank.skills.map(normalise));
  const keywords: CvKeyword[] = draft.keywords.slice(0, cvLimits.maxKeywords).map((keyword) => {
    const evidence = keyword.evidence.some((id) => factBank.factById.has(id));
    const known = knownNormalised.has(normalise(keyword.term));
    return { term: keyword.term.trim(), matched: known || (keyword.matched && evidence) };
  });

  return { summary, summarySources, skills: skills.length > 0 ? skills : factBank.skills, bullets, keywords, reverted };
}
