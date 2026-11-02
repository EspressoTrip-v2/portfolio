import { factBank } from "./factBank";
import type { CvChanges, CvKeyword, Reverted, TailoredCv } from "./schema";

const original = (ids: string[]) => ids.flatMap((id) => factBank.factById.get(id)?.text ?? []);

/**
 * Dev-only report: each line of the finished CV next to the original facts it was rewritten from,
 * plus the lines that failed verification and were put back to the original wording.
 */
export function buildChanges(
  cv: TailoredCv,
  summarySources: string[],
  reverted: Reverted[],
  keywords: CvKeyword[],
): CvChanges {
  // Loose match, as screening tools do: case, spacing, punctuation and a trailing ".js" don't matter.
  const squash = (value: string) =>
    value
      .toLowerCase()
      .replace(/\.js\b/g, "")
      .replace(/[^a-z0-9+#]/g, "");
  const text = squash(
    [cv.summary, ...cv.skills, ...cv.roles.flatMap((role) => role.bullets.map((bullet) => bullet.text))].join(" "),
  );
  return {
    keywords: keywords.map((keyword) => ({ ...keyword, inCv: text.includes(squash(keyword.term)) })),
    summary: { text: cv.summary, originals: original(summarySources) },
    roles: cv.roles.map((role) => ({
      roleId: role.id,
      label: `${role.role}, ${role.company}`,
      bullets: role.bullets.map((bullet) => {
        const originals = original(bullet.sources);
        return { text: bullet.text, originals, rewritten: !(originals.length === 1 && originals[0] === bullet.text) };
      }),
    })),
    reverted,
  };
}
