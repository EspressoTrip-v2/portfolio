import Anthropic from "@anthropic-ai/sdk";
import { getChatEnv } from "@/lib/chat/env";
import { checkRateLimit, clientIp } from "@/lib/chat/rateLimit";
import { hasCvAccess } from "@/lib/cv/access";
import { assembleCv } from "@/lib/cv/assemble";
import { cvEnabled } from "@/lib/cv/enabled";
import { buildChanges, coveredCount, keywordCoverage } from "@/lib/cv/changes";
import { type CvChanges, type CvEvent, CvRequest, cvLimits, type Reverted, type TailorOutput } from "@/lib/cv/schema";
import { REPAIR_EFFORT, repairDraft, type Writer, writeDraft } from "@/lib/cv/tailor";
import { verifyDraft } from "@/lib/cv/verify";
import { isAllowedOrigin } from "@/lib/http/origin";

// Runs on the default Node.js runtime (a `runtime` export is not allowed with cacheComponents).
// Opus at high effort can take a few minutes to write a full CV.
export const maxDuration = 300;
// Time budget inside maxDuration: the first draft must finish by 180 s. The repair pass runs only
// if it gets at least 30 s and must finish by 260 s, leaving room for its 30 s check.
const TAILOR_DEADLINE_MS = 180_000;
const REPAIR_BUDGET_END_MS = 260_000;
const MIN_REPAIR_MS = 30_000;

let client: Anthropic | undefined;

function error(message: string, status: number, headers: Record<string, string> = {}) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

/**
 * The repair pass and its check. Any failure or timeout returns a status instead of throwing (except when Juan disconnects):
 * the first verified CV still stands, so a failed repair never costs Juan his CV.
 */
async function tryRepair(
  writer: Writer,
  clientSignal: AbortSignal,
  guardModel: string,
  ...args: [jobSpec: string, draft: TailorOutput, reverted: Reverted[], missing: string[]]
) {
  try {
    const { draft, model } = await repairDraft(writer, ...args);
    if (!draft) return { status: "failed" as const };
    // No retry here: the repair runs late in the time budget, and failing just keeps the first CV.
    const verified = await verifyDraft(writer.client, guardModel, draft, 0);
    return { status: "ran" as const, verified, model };
  } catch (cause) {
    // Juan left: rethrow so the route closes quietly instead of reporting to nobody.
    if (clientSignal.aborted) throw cause;
    // Only an abort from the repair's own time limit counts as out of time, not a later guard error.
    if (cause instanceof Anthropic.APIUserAbortError && writer.signal.aborted) {
      console.warn("[cv] repair skipped: out of time");
      return { status: "skipped" as const };
    }
    console.error("[cv] repair failed", cause instanceof Anthropic.APIError ? `${cause.status} ${cause.name}` : cause);
    return { status: "failed" as const };
  }
}

/** Tailors Juan's CV to a pasted job spec. Passcode-locked; see src/lib/cv/enabled.ts and access.ts. */
export async function POST(request: Request) {
  if (!cvEnabled()) return new Response("Not found", { status: 404 });
  if (!isAllowedOrigin(request)) return error("Forbidden", 403);
  // Before the rate limit, so wrong guesses can't use up the shared daily cap and lock Juan out.
  // The key is long and random, so guessing it isn't feasible anyway.
  if (!hasCvAccess(request)) return error("Wrong passcode.", 401);

  const limit = await checkRateLimit(clientIp(request), "cv");
  if (!limit.ok) {
    return "unavailable" in limit
      ? error("The CV is unavailable right now. Try again later.", 503)
      : error("That's the limit for now. Try again in an hour.", 429, { "Retry-After": String(limit.retryAfter) });
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > cvLimits.maxBodyBytes) return error("The job spec is too long.", 413);
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return error("Invalid request.", 400);
  }
  const parsed = CvRequest.safeParse(json);
  if (!parsed.success) {
    return error(
      `Paste a job spec of ${cvLimits.minSpecChars} to ${cvLimits.maxSpecChars.toLocaleString("en-GB")} characters.`,
      400,
    );
  }

  const env = getChatEnv();
  client ??= new Anthropic({ apiKey: env.apiKey });
  const anthropic = client;
  const jobSpec = parsed.data.jobSpec;

  // Newline-delimited JSON: progress stages while the CV is being written, then the result.
  const encoder = new TextEncoder();
  const startedAt = Date.now();
  const deadline = AbortSignal.timeout(TAILOR_DEADLINE_MS);
  const writer: Writer = { client: anthropic, model: env.cvModel, signal: AbortSignal.any([request.signal, deadline]) };
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: CvEvent) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      try {
        send({ type: "stage", stage: "reading" });
        send({ type: "stage", stage: "rewording" });
        const { output: draft, model } = await writeDraft(writer, env.cvEffort, jobSpec);
        if (!draft) {
          send({ type: "error", message: "Couldn't get the CV for that job spec. Try again." });
          return controller.close();
        }
        let writtenBy = `${model} · effort ${env.cvEffort}`;

        send({ type: "stage", stage: "checking" });
        let verified = await verifyDraft(anthropic, env.cvGuardModel, draft);
        // The phone number only goes on CVs returned behind the passcode, never on public pages.
        let cv = assembleCv(verified, { includePhone: true });
        let repair: CvChanges["repair"] = { status: "not-needed" };

        // Repair pass: fix lines that failed a check and work in keywords Juan has that are missing.
        const coverage = keywordCoverage(cv, verified.keywords);
        const missing = coverage.filter((keyword) => keyword.matched && !keyword.inCv).map((keyword) => keyword.term);
        const repairMs = REPAIR_BUDGET_END_MS - (Date.now() - startedAt);
        if (verified.reverted.length > 0 || missing.length > 0) {
          if (repairMs < MIN_REPAIR_MS) {
            repair = { status: "skipped" };
          } else {
            send({ type: "stage", stage: "repairing" });
            const result = await tryRepair(
              { ...writer, signal: AbortSignal.any([request.signal, AbortSignal.timeout(repairMs)]) },
              request.signal,
              env.cvGuardModel,
              jobSpec,
              draft,
              verified.reverted,
              missing,
            );
            if (result.status !== "ran") {
              repair = result;
            } else {
              const repairedCv = assembleCv(result.verified, { includePhone: true });
              const before = coveredCount(coverage);
              const after = coveredCount(keywordCoverage(repairedCv, result.verified.keywords));
              // Keep the repaired CV when it covers more keywords, or as many with fewer lines put back.
              const kept =
                after > before || (after === before && result.verified.reverted.length < verified.reverted.length);
              repair = { status: "ran", kept, coveredBefore: before, coveredAfter: after };
              if (kept) {
                verified = result.verified;
                cv = repairedCv;
                writtenBy += ` (repair: ${result.model} · effort ${REPAIR_EFFORT})`;
              }
            }
          }
        }

        console.info("[cv] keywords", {
          matched: verified.keywords.filter((keyword) => keyword.matched).map((keyword) => keyword.term),
          missing: verified.keywords.filter((keyword) => !keyword.matched).map((keyword) => keyword.term),
          repair,
        });
        if (verified.reverted.length > 0) console.info("[cv] reverted", verified.reverted);
        // The page is passcode-locked, so Juan sees the full change report there.
        send({ type: "result", cv, changes: buildChanges(cv, verified, { writtenBy, repair }) });
      } catch (cause) {
        if (request.signal.aborted) return controller.close();
        // Only an abort caused by the deadline counts as "too long", not any error after 180 s.
        if (cause instanceof Anthropic.APIUserAbortError && deadline.aborted) {
          console.error("[cv] deadline", { ms: TAILOR_DEADLINE_MS });
          send({ type: "error", message: "That took too long. Try again." });
          return controller.close();
        }
        console.error("[cv] failed", cause instanceof Anthropic.APIError ? `${cause.status} ${cause.name}` : cause);
        const busy = cause instanceof Anthropic.RateLimitError;
        send({
          type: "error",
          message: busy
            ? "The service is busy. Try again in a minute."
            : "Something went wrong getting the CV. Try again.",
        });
      }
      controller.close();
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
