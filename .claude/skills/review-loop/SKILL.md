---
name: review-loop
description: Iterative QA and code-standards review of a change to the portfolio. Runs the qa-tester and code-standards-reviewer agents in parallel, fixes what they find, and repeats for a set number of rounds (default 3). Use when Juan asks to "test the work", "check code standards", or "iterate with the agents".
---

# Review loop

Each round puts a finished change through two independent reviewers, fixes what they find, then sends the change back to them. Use this before merging a feature branch.

## Inputs

- **Rounds**: the number Juan asks for, otherwise 3.
- **Scope**: by default, the uncommitted working tree on the current branch. Run `git status` and `git diff`, and include untracked files.

## Before round 1

1. Make sure the change builds: `pnpm lint`, `npx tsc --noEmit -p .`, `npx prettier --check .`, `pnpm build`.
2. Write the intent of the change in a few bullets. Each agent brief gets these bullets, so the agents know what to check. Brief them on the code and the intent, not on your own conclusions.
3. If the plan checklist in `plans/*.md` has a review step, mark it in progress.

## Each round

1. **Launch both agents in parallel** (one message, two Agent calls, run in the background):
   - **QA**: `general-purpose`, told to act as `.claude/agents/qa-tester.md` (read that file and follow it). Give it:
     - the scratchpad path;
     - the intent bullets;
     - the constraints: no real Claude generations, don't print `.env`, and don't hit the real rate limiter more than necessary.
   - **Standards**: `general-purpose`, told to act as `.claude/agents/code-standards-reviewer.md`. Give it:
     - the scope;
     - the intent bullets;
     - the same constraints.
   - From round 2 on, continue the same agents with SendMessage instead of spawning new ones. List what changed since their last report, and ask them to confirm whether each earlier finding is resolved before they look for new issues.
2. **Wait for both reports.** Don't predict or summarise results before they arrive.
3. **Triage every finding:**
   - **Fix**: correctness, security, privacy, repo-convention or content-consistency issues, and cheap maintainability wins.
   - **Ask Juan**: anything that is his decision, such as personal data on public pages, wording about his career, or design changes. Use AskUserQuestion.
   - **Decline**: findings that are wrong or out of scope. Record the reason for each.
4. **Apply the fixes.** Then re-run lint, tsc, prettier and `pnpm build`, and spot-check the changed behaviour yourself, for example with `curl` against `next start` or `pdftotext` on the PDF.
5. **Report the round to Juan** in one or two lines: what was found, what was fixed, and what's waiting on him.

## After the last round

- Summarise all rounds:
  - findings per round and how each was resolved;
  - anything declined, with the reason;
  - anything still open.
- Commit only when Juan has asked for a commit. Merge or push only on his go-ahead.

## Rules

- Never let an agent edit files. All fixes go through you.
- Never use the word "electrician" in portfolio copy.
- If a round finds nothing new, say so and stop early. Don't make work to fill the remaining rounds.
