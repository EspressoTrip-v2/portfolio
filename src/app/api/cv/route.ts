import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getChatEnv } from "@/lib/chat/env";
import { checkRateLimit, clientIp } from "@/lib/chat/rateLimit";
import { assembleCv } from "@/lib/cv/assemble";
import { cvEnabled } from "@/lib/cv/enabled";
import { buildTailorPrompt } from "@/lib/cv/prompt";
import { buildChanges } from "@/lib/cv/changes";
import { type CvEvent, CvRequest, cvLimits, TailorOutput } from "@/lib/cv/schema";
import { verifyDraft } from "@/lib/cv/verify";
import { isAllowedOrigin } from "@/lib/http/origin";

// Runs on the default Node.js runtime (a `runtime` export is not allowed with cacheComponents).
// Sonnet takes longer than the chat models to write a full CV; the generator is local-only for now.
export const maxDuration = 120;

let client: Anthropic | undefined;

/** The model's JSON, or undefined when it was cut short, refused or doesn't match the schema. */
function parseDraft(response: Anthropic.Message) {
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

/** Tailors Juan's CV to a pasted job spec. Local-only for now; see src/lib/cv/enabled.ts. */
export async function POST(request: Request) {
  if (!cvEnabled()) return new Response("Not found", { status: 404 });
  if (!isAllowedOrigin(request)) return error("Forbidden", 403);

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
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: CvEvent) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      try {
        send({ type: "stage", stage: "reading" });
        send({ type: "stage", stage: "rewording" });
        const response = await anthropic.messages.create(
          {
            model: env.cvModel,
            max_tokens: 16_000,
            system: [{ type: "text", text: buildTailorPrompt(), cache_control: { type: "ephemeral" } }],
            output_config: { format: zodOutputFormat(TailorOutput) },
            messages: [{ role: "user", content: `<job_spec>\n${jobSpec}\n</job_spec>` }],
          },
          { signal: request.signal, timeout: 110_000, maxRetries: 1 },
        );
        console.info("[cv] tailor", {
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
        const cv = assembleCv(verified);
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
