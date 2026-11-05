import type { CvChanges as Changes } from "@/lib/cv/schema";

type Part = { word: string; kind: "same" | "added" | "removed" };

/** Word-level diff (longest common subsequence) between the original fact and the rewritten line. */
function diffWords(before: string, after: string): Part[] {
  const a = before.split(/\s+/);
  const b = after.split(/\s+/);
  const lcs = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  const parts: Part[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      parts.push({ word: b[j], kind: "same" });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      parts.push({ word: a[i++], kind: "removed" });
    } else {
      parts.push({ word: b[j++], kind: "added" });
    }
  }
  while (i < a.length) parts.push({ word: a[i++], kind: "removed" });
  while (j < b.length) parts.push({ word: b[j++], kind: "added" });
  return parts;
}

function Diff({ before, after }: { before: string; after: string }) {
  return (
    <p className="leading-relaxed">
      {diffWords(before, after).map((part, i) => (
        <span key={i}>
          {part.kind === "same" && part.word}
          {part.kind === "added" && <ins className="bg-marker/60 no-underline">{part.word}</ins>}
          {part.kind === "removed" && <del className="text-ink-3">{part.word}</del>}{" "}
        </span>
      ))}
    </p>
  );
}

function Line({ text, originals }: { text: string; originals: string[] }) {
  // A line built from one fact gets a word diff; a merge of several facts shows its sources below.
  if (originals.length === 1) return <Diff before={originals[0]} after={text} />;
  return (
    <div>
      <p>{text}</p>
      <ul className="mt-1 space-y-0.5 border-l-2 border-ink-3/40 pl-3 text-ink-3">
        {originals.map((original) => (
          <li key={original}>From: {original}</li>
        ))}
      </ul>
    </div>
  );
}

/** Which of the spec's keywords now appear word for word in the CV, out of those Juan has. */
function KeywordCoverage({ keywords }: { keywords: Changes["keywords"] }) {
  const matched = keywords.filter((keyword) => keyword.matched);
  const covered = matched.filter((keyword) => keyword.inCv);
  const missing = keywords.filter((keyword) => !keyword.matched);
  return (
    <section className="mt-4">
      <h3 className="font-bold">
        Spec keywords in the CV: {covered.length} of {matched.length} that Juan has
      </h3>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {matched.map((keyword) => (
          <li
            key={keyword.term}
            className={
              keyword.inCv
                ? "cable-marker text-data"
                : "rounded-[4px] border border-red-ink px-2 py-0.5 text-data text-red-ink"
            }
          >
            {keyword.inCv ? keyword.term : `${keyword.term} (not in CV text)`}
          </li>
        ))}
      </ul>
      {missing.length > 0 && (
        <p className="mt-2 text-data text-ink-3">
          Not in Juan&apos;s record, left out: {missing.map((keyword) => keyword.term).join(", ")}
        </p>
      )}
    </section>
  );
}

/** One line on the repair pass: whether it ran, and what it did to keyword coverage. */
function RepairNote({ repair }: { repair: Changes["repair"] }) {
  const text =
    repair.status === "ran"
      ? `${repair.kept ? "kept" : "discarded, no improvement"} (keywords ${repair.coveredBefore} → ${repair.coveredAfter})`
      : {
          "not-needed": "not needed",
          skipped: "out of time, first CV kept",
          failed: "failed, first CV kept",
        }[repair.status];
  return <p className="text-data text-ink-3">Repair pass: {text}.</p>;
}

/**
 * Juan's report: every rewritten line with what it was rewritten from, and the lines that failed the
 * checks and went back to the original wording. Added words are highlighted, removed words struck out.
 */
export function CvChanges({ changes }: { changes: Changes }) {
  const rewritten = changes.roles.flatMap((role) => role.bullets.filter((bullet) => bullet.rewritten));
  return (
    <details open className="chart-paper px-5 py-6 text-small sm:px-8">
      <summary className="cursor-pointer font-bold">
        What changed: {rewritten.length} rewritten line{rewritten.length === 1 ? "" : "s"}, {changes.reverted.length}{" "}
        put back
      </summary>

      <p className="mt-3 text-data text-ink-2">Written by {changes.writtenBy}</p>
      <RepairNote repair={changes.repair} />

      <KeywordCoverage keywords={changes.keywords} />

      <h3 className="mt-5 font-bold">Summary</h3>
      <div className="mt-1">
        <Line text={changes.summary.text} originals={changes.summary.originals} />
      </div>

      {changes.roles.map((role) => {
        const lines = role.bullets.filter((bullet) => bullet.rewritten);
        return (
          <section key={role.roleId} className="mt-5">
            <h3 className="font-bold">
              {role.label}{" "}
              <span className="font-normal text-ink-3">
                ({lines.length} rewritten, {role.bullets.length - lines.length} unchanged)
              </span>
            </h3>
            <ul className="mt-1 space-y-2">
              {lines.map((bullet) => (
                <li key={bullet.text}>
                  <Line text={bullet.text} originals={bullet.originals} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {changes.reverted.length > 0 && (
        <section className="mt-6">
          <h3 className="font-bold">Put back to the original wording</h3>
          <ul className="mt-1 space-y-2">
            {changes.reverted.map((item) => (
              <li key={item.attempted}>
                <p className="text-ink-3 line-through">{item.attempted}</p>
                <p className="text-red-ink">Why: {item.reason}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </details>
  );
}
