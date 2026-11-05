---
name: recruiter-review
description: Reviews the live portfolio from an employment agency's point of view. Runs the recruiter-reviewer agent against the live site and the chat assistant, verifies its claims, and turns its suggestions into questions and a plan for Juan. Use when Juan asks to "test the site as an agency/recruiter/employer" or wants hiring-side feedback.
---

# Recruiter review

## Steps

1. **Launch the reviewer** in the background: a `general-purpose` agent told to act as `.claude/agents/recruiter-reviewer.md` (read that file and follow it).
   - Add any context it needs, such as a new feature to look at or placement advice to give.
   - Don't hand it your own opinions about the site.
2. **Wait for the report.** While it runs, carry on with other work. Don't predict its findings.
3. **Spot-check before relaying.** Check the two or three claims that matter most against the source or the live site, e.g. dates, a duplicated year or a missing line. Mark which ones you checked.
4. **Report to Juan:**
   - the verdict;
   - suggestions ranked by impact, split into two groups:
     - **Needs facts only Juan knows**: notice period, contract types, right to work, rate stance, team sizes, reasons for moving.
     - **Changes I can make myself**: copy, layout, SEO, share image.
5. **Ask, don't guess.**
   - Collect the facts and decisions with AskUserQuestion, at most 4 questions per call, with sensible options plus "Other" for exact numbers or wording.
   - Show a mockup (in the AskUserQuestion `preview` field) before any visible design change.
6. **Plan.** Add the approved items to the plan checklist in `plans/*.md`. Then implement and verify them with the `review-loop` skill.

## Rules

- Don't invent career facts. Anything not in `profile.ts` or `about-me.md` comes from Juan.
- Never use the word "electrician" in portfolio copy; say "the electrical trade".
- Keep "Open to select opportunities" as the availability wording unless Juan changes it.
