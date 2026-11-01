import Anthropic from "@anthropic-ai/sdk";
import { siteUrl } from "@/config/site";
import { chatCopy, chatLimits } from "@/lib/chat/copy";
import { getChatEnv } from "@/lib/chat/env";
import { checkTopic } from "@/lib/chat/guard";
import { loadAboutMe } from "@/lib/chat/knowledge";
import { buildSystemPrompt } from "@/lib/chat/prompt";
import { checkRateLimit, clientIp } from "@/lib/chat/rateLimit";
import { ChatRequest } from "@/lib/chat/schema";

// Runs on the default Node.js runtime (a `runtime` export is not allowed with cacheComponents).
export const maxDuration = 60;

let client: Anthropic | undefined;

function text(body: string, status = 200, headers: Record<string, string> = {}) {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", ...headers },
  });
}

function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || !URL.canParse(origin)) return false;
  const { host } = new URL(origin);
  if (host === siteUrl.host) return true;
  // Vercel preview deployments and local dev serve from their own hosts.
  return host === process.env.VERCEL_URL || (process.env.NODE_ENV === "development" && host.startsWith("localhost:"));
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) return text("Forbidden", 403);

  const limit = await checkRateLimit(clientIp(request));
  if (!limit.ok) {
    return "unavailable" in limit
      ? text(chatCopy.failure, 503)
      : text(chatCopy.limit, 429, { "Retry-After": String(limit.retryAfter) });
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > chatLimits.maxBodyBytes) return text("Request too large", 413);

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return text("Invalid JSON", 400);
  }
  const parsed = ChatRequest.safeParse(json);
  if (!parsed.success) return text("Invalid conversation", 400);
  const { messages } = parsed.data;

  const env = getChatEnv();
  client ??= new Anthropic({ apiKey: env.apiKey });

  const topic = await checkTopic(client, env.guardModel, messages);
  if (topic === "error") return text(chatCopy.failure, 503);
  if (topic === "off-topic") return text(chatCopy.offTopic, 200, { "X-Chat-Result": "off-topic" });

  const system = buildSystemPrompt(await loadAboutMe());
  const anthropic = client;
  const encoder = new TextEncoder();

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const stream = anthropic.messages.stream(
        {
          model: env.model,
          max_tokens: 1024,
          system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
          messages,
        },
        { signal: request.signal },
      );
      stream.on("text", (delta) => controller.enqueue(encoder.encode(delta)));

      try {
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") controller.enqueue(encoder.encode(`\n\n${chatCopy.offTopic}`));
        if (final.stop_reason === "max_tokens") controller.enqueue(encoder.encode("…"));
        console.info("[chat] answer", {
          stop: final.stop_reason,
          input: final.usage.input_tokens,
          cacheWrite: final.usage.cache_creation_input_tokens,
          cacheRead: final.usage.cache_read_input_tokens,
          output: final.usage.output_tokens,
        });
      } catch (error) {
        if (request.signal.aborted) return controller.close();
        console.error("[chat] answer failed", error instanceof Anthropic.APIError ? `${error.status} ${error.name}` : error);
        const message = error instanceof Anthropic.RateLimitError ? chatCopy.busy : chatCopy.failure;
        controller.enqueue(encoder.encode(`\n\n${message}`));
      }
      controller.close();
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}
