import { z } from "zod";

export const cvLimits = {
  minSpecChars: 200,
  maxSpecChars: 12_000,
  maxBodyBytes: 64_000,
  maxBulletsPerRole: 8,
  maxSkills: 24,
  maxKeywords: 30,
};

/** Collapses padding from pasted specs: runs of spaces or tabs, trailing spaces and extra blank lines. */
export function tidySpec(spec: string) {
  return spec
    .replace(/[ \t ]+/g, " ")
    .replace(/ ?\r?\n ?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export const CvRequest = z.object({
  jobSpec: z.string().transform(tidySpec).pipe(z.string().min(cvLimits.minSpecChars).max(cvLimits.maxSpecChars)),
});

/**
 * What the model returns. Length limits are enforced after parsing (by trimming), not in the
 * schema: structured outputs drop string and array constraints and the SDK would then reject
 * the whole answer for one long bullet.
 */
export const TailorOutput = z.object({
  keywords: z.array(
    z.object({
      term: z.string(),
      matched: z.boolean(),
      evidence: z.array(z.string()).describe("Fact ids that show Juan has this; empty when unmatched"),
    }),
  ),
  summary: z.object({ text: z.string(), sources: z.array(z.string()) }),
  roles: z.array(
    z.object({
      roleId: z.string(),
      bullets: z.array(z.object({ text: z.string(), sources: z.array(z.string()) })),
    }),
  ),
  skills: z.array(z.string()),
});

export type TailorOutput = z.infer<typeof TailorOutput>;

export type CvBullet = { text: string; sources: string[] };

export type CvRole = {
  id: string;
  role: string;
  company: string;
  dates: string;
  location: string;
  /** One line about the company, verbatim from profile.ts. */
  blurb: string;
  bullets: CvBullet[];
};

/** A complete CV, ready to preview or render to PDF. */
export type TailoredCv = {
  name: string;
  title: string;
  location: string;
  /** Phone comes from the CV_PHONE env var so it never lives in the repo; omitted when unset. */
  contact: { email: string; phone?: string; github: string; linkedin: string };
  summary: string;
  skills: string[];
  roles: CvRole[];
  earlier: { company: string; location: string; roles: string[] }[];
  education: { name: string; issuer: string; period: string }[];
  languages: { name: string; level: string }[];
  portfolio: { name: string; href: string; description: string }[];
};

export type CvKeyword = { term: string; matched: boolean };

/** A bullet that failed verification and was replaced by its original text. */
export type Reverted = { roleId: string; attempted: string; reason: string };

/** Dev-only report of what the rewrite changed, so Juan can check every line against its source. */
export type CvChanges = {
  summary: { text: string; originals: string[] };
  roles: { roleId: string; label: string; bullets: { text: string; originals: string[]; rewritten: boolean }[] }[];
  reverted: Reverted[];
  /** The spec's keywords: whether Juan has each one, and whether it now appears in the CV text. */
  keywords: { term: string; matched: boolean; inCv: boolean }[];
};

/** Progress stages the API streams while it works, then the result or an error. */
export type CvStage = "reading" | "rewording" | "checking";
export type CvEvent =
  | { type: "stage"; stage: CvStage }
  | { type: "result"; cv: TailoredCv; changes?: CvChanges }
  | { type: "error"; message: string };
