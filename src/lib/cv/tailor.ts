import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";
import type { Effort } from "@/lib/chat/env";
import { buildRepairMessage, buildTailorPrompt } from "./prompt";
import { RepairOutput, type Reverted, TailorOutput } from "./schema";

/** The repair edits a few lines rather than writing the whole CV, so it needs less effort. */
export const REPAIR_EFFORT: Effort = "medium";
/** What every CV-writing call needs: the client, the model and the signal that cancels it. */
export type Writer = { client: Anthropic; model: string; signal: AbortSignal };

/** The model's JSON, or undefined when it was cut short, refused or doesn't match the schema. */
function parse<T extends z.ZodType>(schema: T, response: Anthropic.Beta.BetaMessage, label: string) {
  if (response.stop_reason !== "end_turn") return undefined;
  const text = response.content.flatMap((block) => (block.type === "text" ? [block.text] : [])).join("");
  try {
    const result = schema.safeParse(JSON.parse(text));
    if (!result.success) console.error(`[cv] ${label} does not match the schema`, result.error.issues.slice(0, 3));
    return result.success ? result.data : undefined;
  } catch {
    console.error(`[cv] ${label} is not valid JSON`, { length: text.length });
    return undefined;
  }
}

/**
 * One streamed call with the tailoring system prompt. Streamed so a long high-effort run can't hit
 * an HTTP timeout; only the final message is used. `fallbacks: "default"` re-runs a safety-classifier
 * decline on a suitable model in the same call, so the answering model is returned with the output.
 */
async function call<T extends z.ZodType>(
  writer: Writer,
  request: { schema: T; effort: Effort; content: string; label: string; cache: boolean },
) {
  const system = buildTailorPrompt();
  const response = await writer.client.beta.messages
    .stream(
      {
        model: writer.model,
        max_tokens: 32_000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        // Only the draft caches the prompt: the repair's different output schema changes the cached
        // prefix, so marking it would pay the cache-write premium for a cache it never reads.
        system: [{ type: "text", text: system, ...(request.cache ? { cache_control: { type: "ephemeral" } } : {}) }],
        output_config: { effort: request.effort, format: betaZodOutputFormat(request.schema) },
        messages: [{ role: "user", content: request.content }],
      },
      { signal: writer.signal, maxRetries: 0 },
    )
    .finalMessage();
  console.info(`[cv] ${request.label}`, {
    model: response.model,
    stop: response.stop_reason,
    input: response.usage.input_tokens,
    cacheRead: response.usage.cache_read_input_tokens,
    output: response.usage.output_tokens,
  });
  return { output: parse(request.schema, response, request.label), model: response.model };
}

/** First draft: the whole CV rewritten for the spec. */
export function writeDraft(writer: Writer, effort: Effort, jobSpec: string) {
  const content = `<job_spec>\n${jobSpec}\n</job_spec>`;
  return call(writer, { schema: TailorOutput, effort, content, label: "tailor", cache: true });
}

/**
 * Second pass: the model fixes the lines that failed a check and works in keywords Juan has that
 * are still missing. Returns the draft with the repaired roles and summary merged in (or undefined)
 * and the model that answered.
 */
export async function repairDraft(
  writer: Writer,
  jobSpec: string,
  draft: TailorOutput,
  reverted: Reverted[],
  missingKeywords: string[],
) {
  const failed = reverted.map((item) => ({ roleId: item.roleId, text: item.attempted, reason: item.reason }));
  const content = buildRepairMessage(jobSpec, draft, failed, missingKeywords);
  const { output, model } = await call(writer, {
    schema: RepairOutput,
    effort: REPAIR_EFFORT,
    content,
    label: "repair",
    cache: false,
  });
  if (!output) return { draft: undefined, model };
  const repaired = new Map(output.roles.map((role) => [role.roleId, role.bullets]));
  const merged: TailorOutput = {
    ...draft,
    summary: output.summary ?? draft.summary,
    roles: draft.roles.map((role) => ({ ...role, bullets: repaired.get(role.roleId) ?? role.bullets })),
  };
  return { draft: merged, model };
}
