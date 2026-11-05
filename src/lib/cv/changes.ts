import { factBank } from "./factBank";
import type { CvChanges, CvKeyword, Reverted, TailoredCv } from "./schema";

const original = (ids: string[]) => ids.flatMap((id) => factBank.factById.get(id)?.text ?? []);

// Loose match, as screening tools do: case, punctuation and a trailing ".js" don't matter, but word
// boundaries do, so "API" isn't found inside "rapid" or "Agile" inside "fragile".
const words = (value: string) =>
  ` ${value
    .toLowerCase()
    .replace(/\.js\b/g, "")
    .replace(/[^a-z0-9+#]+/g, " ")
    .trim()} `;

/** Each keyword with whether it appears, as whole words, in the CV's summary, skills or bullets. */
export function keywordCoverage(cv: TailoredCv, keywords: CvKeyword[]) {
  const text = words(
    [cv.summary, ...cv.skills, ...cv.roles.flatMap((role) => role.bullets.map((bullet) => bullet.text))].join(" "),
  );
  return keywords.map((keyword) => ({ ...keyword, inCv: text.includes(words(keyword.term)) }));
}

/** How many keywords Juan has that appear in the CV. */
export function coveredCount(coverage: ReturnType<typeof keywordCoverage>) {
  return coverage.filter((keyword) => keyword.matched && keyword.inCv).length;
}

/**
 * Juan's report on the passcode-locked page: each line of the finished CV next to the original
 * facts it was rewritten from, the lines put back to the original wording, and keyword coverage.
 */
export function buildChanges(
  cv: TailoredCv,
  verified: { summarySources: string[]; reverted: Reverted[]; keywords: CvKeyword[] },
  meta: Pick<CvChanges, "writtenBy" | "repair">,
): CvChanges {
  return {
    ...meta,
    keywords: keywordCoverage(cv, verified.keywords),
    summary: { text: cv.summary, originals: original(verified.summarySources) },
    roles: cv.roles.map((role) => ({
      roleId: role.id,
      label: `${role.role}, ${role.company}`,
      bullets: role.bullets.map((bullet) => {
        const originals = original(bullet.sources);
        return { text: bullet.text, originals, rewritten: !(originals.length === 1 && originals[0] === bullet.text) };
      }),
    })),
    reverted: verified.reverted,
  };
}
