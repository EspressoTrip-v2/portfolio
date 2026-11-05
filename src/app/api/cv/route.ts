import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { getChatEnv } from "@/lib/chat/env";
import { checkRateLimit, clientIp } from "@/lib/chat/rateLimit";
import { hasCvAccess } from "@/lib/cv/access";
import { assembleCv } from "@/lib/cv/assemble";
import { cvEnabled } from "@/lib/cv/enabled";
import { buildTailorPrompt } from "@/lib/cv/prompt";
import { buildChanges } from "@/lib/cv/changes";
import { type CvEvent, CvRequest, cvLimits, TailorOutput } from "@/lib/cv/schema";
import { verifyDraft } from "@/lib/cv/verify";
import { isAllowedOrigin } from "@/lib/http/origin";

// Runs on the default Node.js runtime (a `runtime` export is not allowed with cacheComponents).
// Opus at high effort can take a few minutes to write a full CV.
export const maxDuration = 300;
/** Leaves room for the checking pass (up to about a minute with its retry) inside maxDuration. */
const TAILOR_DEADLINE_MS = 225_000;

let client: Anthropic | undefined;

/** The model's JSON, or undefined when it was cut short, refused or doesn't match the schema. */
function parseDraft(response: Anthropic.Beta.BetaMessage) {
  if (response.stop_reason !== "end_turn") return undefined;
  const text = response.content.flatMap((block) => (block.type === "text" ? [block.text] : [])).join("");
  try {
    const result = TailorOutput.safeParse(JSON.parse(text));
    if (!result.success) console.error("[cv] draft does not match the schema", result.error.issues.slice(0, 3));
    return result.success ? result.data : undefined;
  } catch {
    console.error("[cv] draft is not valid JSON", { length: text.length });
    return undefined;
  }
}

function error(message: string, status: number, headers: Record<string, string> = {}) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store", ...headers } });
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
  const deadline = AbortSignal.timeout(TAILOR_DEADLINE_MS);
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: CvEvent) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      try {
        send({ type: "stage", stage: "reading" });
        send({ type: "stage", stage: "rewording" });
        // Streamed so a long high-effort run can't hit an HTTP timeout; only the final message is used.
        // `fallbacks: "default"` re-runs a safety-classifier decline on a suitable model in the same call.
        const response = await anthropic.beta.messages
          .stream(
            {
              model: env.cvModel,
              max_tokens: 32_000,
              betas: ["server-side-fallback-2026-07-01"],
              fallbacks: "default",
              system: [{ type: "text", text: buildTailorPrompt(), cache_control: { type: "ephemeral" } }],
              output_config: { effort: env.cvEffort, format: betaZodOutputFormat(TailorOutput) },
              messages: [{ role: "user", content: `<job_spec>\n${jobSpec}\n</job_spec>` }],
            },
            // One deadline for the whole stream, leaving time for the checking pass before maxDuration.
            { signal: AbortSignal.any([request.signal, deadline]), maxRetries: 0 },
          )
          .finalMessage();
        console.info("[cv] tailor", {
          model: response.model,
          stop: response.stop_reason,
          blocks: response.content.map((block) => block.type),
          input: response.usage.input_tokens,
          cacheRead: response.usage.cache_read_input_tokens,
          output: response.usage.output_tokens,
        });
        const draft = parseDraft(response);
        if (!draft) {
          send({ type: "error", message: "Couldn't get the CV for that job spec. Try again." });
          return controller.close();
        }

        send({ type: "stage", stage: "checking" });
        const verified = await verifyDraft(anthropic, env.guardModel, draft);
        // The phone number only goes on CVs returned behind the passcode, never on public pages.
        const cv = assembleCv(verified, { includePhone: true });
        // Keyword match and the change report are for Juan only: server logs, and the page in dev.
        console.info("[cv] keywords", {
          matched: verified.keywords.filter((keyword) => keyword.matched).map((keyword) => keyword.term),
          missing: verified.keywords.filter((keyword) => !keyword.matched).map((keyword) => keyword.term),
        });
        if (verified.reverted.length > 0) console.info("[cv] reverted", verified.reverted);
        const changes =
          process.env.NODE_ENV === "development"
            ? buildChanges(cv, verified.summarySources, verified.reverted, verified.keywords)
            : undefined;
        send({ type: "result", cv, changes });
      } catch (cause) {
        if (request.signal.aborted) return controller.close();
        if (deadline.aborted) {
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
