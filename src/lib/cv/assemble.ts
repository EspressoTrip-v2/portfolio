import { earlier, profile, projects, skillGroups } from "@/content/profile";
import { type CvRoleRecord, cvIdentity, factBank } from "./factBank";
import type { CvBullet, TailoredCv } from "./schema";

function dates(role: CvRoleRecord) {
  const range = `${role.start} – ${role.end}`;
  return role.contractUntil ? `${range} (contract to ${role.contractUntil})` : range;
}

/** The bullets of the untailored CV: each role's highlights in their original order. */
export function originalBullets(role: CvRoleRecord): CvBullet[] {
  return role.highlightIds.map((id) => ({ text: factBank.factById.get(id)!.text, sources: [id] }));
}

/**
 * Builds a CV from verified content. Name, contact, titles, companies, dates, locations,
 * earlier roles, education and languages always come straight from profile.ts.
 */
export function assembleCv(content: {
  summary: string;
  skills: string[];
  bullets: Map<string, CvBullet[]>;
}): TailoredCv {
  return {
    name: cvIdentity.name,
    title: cvIdentity.title,
    location: cvIdentity.location,
    contact: {
      email: cvIdentity.email,
      phone: process.env.CV_PHONE?.trim() || undefined,
      github: cvIdentity.github,
      linkedin: cvIdentity.linkedin,
    },
    summary: content.summary,
    skills: content.skills,
    roles: factBank.roles.map((role) => ({
      id: role.id,
      role: role.role,
      company: role.company,
      dates: dates(role),
      location: role.location,
      blurb: factBank.factById.get(`${role.id}.blurb`)!.text,
      bullets: content.bullets.get(role.id) ?? originalBullets(role),
    })),
    earlier: earlier.map((entry) => ({
      company: entry.company,
      location: entry.location,
      roles: entry.roles.map((role) => (role.link ? `${role.text} ${role.link.label}` : role.text)),
    })),
    education: cvIdentity.education,
    languages: cvIdentity.languages,
    portfolio: projects.map((project) => ({
      name: project.name,
      href: project.href,
      description: project.description,
    })),
  };
}

/** Juan's standard CV, straight from profile.ts with no AI involved. */
export function baseCv(): TailoredCv {
  return assembleCv({
    summary: profile.summary.join(" "),
    // The curated skill list, not every tool named in a role stack.
    skills: [...new Set(skillGroups.flatMap((group) => group.items))],
    bullets: new Map(),
  });
}
