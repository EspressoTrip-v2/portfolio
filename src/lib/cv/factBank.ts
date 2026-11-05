import { education, experience, languages, profile, projects, type Role, skillGroups } from "@/content/profile";

/** One citable statement from Juan's real record. The model may only reword these. */
export type Fact = {
  id: string;
  /** The role the fact belongs to; undefined for summary and project facts. */
  roleId?: string;
  kind: "summary" | "blurb" | "highlight" | "metric" | "team" | "project";
  text: string;
};

/** A role's fixed details. These are copied onto the CV verbatim and never pass through the model. */
export type CvRoleRecord = {
  id: string;
  role: string;
  company: string;
  start: string;
  end: string;
  contractUntil?: string;
  location: string;
  engagement?: string;
  team?: string;
  stack: string[];
  /** Highlights in their original order: the untailored bullets. */
  highlightIds: string[];
};

function roleId(role: Role) {
  return `${role.company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${role.start.slice(-4)}`;
}

function buildFactBank() {
  const facts: Fact[] = [];
  const roles: CvRoleRecord[] = [];

  profile.summary.forEach((text, i) => facts.push({ id: `summary.${i + 1}`, kind: "summary", text }));
  facts.push({ id: "summary.tagline", kind: "summary", text: profile.tagline });

  for (const role of experience) {
    const id = roleId(role);
    facts.push({ id: `${id}.blurb`, roleId: id, kind: "blurb", text: role.cv?.company ?? role.blurb });
    if (role.team) facts.push({ id: `${id}.team`, roleId: id, kind: "team", text: role.team });
    if (role.metric) {
      facts.push({ id: `${id}.metric`, roleId: id, kind: "metric", text: `${role.metric.value} ${role.metric.label}` });
    }
    const highlightIds = [...role.highlights, ...(role.cv?.highlights ?? [])].map((text, i) => {
      const factId = `${id}.h${i + 1}`;
      facts.push({ id: factId, roleId: id, kind: "highlight", text });
      return factId;
    });
    roles.push({
      id,
      role: role.role,
      company: role.company,
      start: role.start,
      end: role.end,
      contractUntil: role.contractUntil,
      location: role.location,
      engagement: role.engagement,
      team: role.team,
      stack: role.stack,
      highlightIds,
    });
  }

  for (const project of projects) {
    facts.push({ id: `project.${project.name}`, kind: "project", text: `${project.name}: ${project.description}` });
  }

  // Every technology Juan has actually used, from skills, role stacks and projects.
  const skills = [
    ...new Set([
      ...skillGroups.flatMap((group) => group.items),
      ...experience.flatMap((role) => role.stack),
      ...projects.flatMap((project) => project.stack),
    ]),
  ];

  return { facts, roles, skills, factById: new Map(facts.map((fact) => [fact.id, fact])) };
}

export const factBank = buildFactBank();

/** Fixed CV header and footer details, straight from profile.ts. */
export const cvIdentity = {
  name: profile.name,
  title: profile.title,
  location: profile.location,
  workLine: [profile.workMode, profile.available ? profile.availability : undefined, profile.notice]
    .filter(Boolean)
    .join(" · "),
  email: profile.links.email.handle,
  github: profile.links.github.href,
  linkedin: profile.links.linkedin.href,
  education,
  languages,
};

/** The fact bank as the model sees it: ids, role headers and fact text. */
export function factBankForPrompt() {
  const roleBlocks = factBank.roles.map((role) => {
    const lines = factBank.facts.filter((fact) => fact.roleId === role.id).map((fact) => `  [${fact.id}] ${fact.text}`);
    return `<role id="${role.id}" title="${role.role}" company="${role.company}" dates="${role.start} to ${role.end}" stack="${role.stack.join(", ")}">\n${lines.join("\n")}\n</role>`;
  });
  const general = factBank.facts.filter((fact) => !fact.roleId).map((fact) => `[${fact.id}] ${fact.text}`);
  return [
    `<general_facts>\n${general.join("\n")}\n</general_facts>`,
    ...roleBlocks,
    `<known_skills>\n${factBank.skills.join(", ")}\n</known_skills>`,
  ].join("\n\n");
}
