import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { GUARD_PROMPT } from "./prompt";
import type { ChatMessage } from "./schema";

const Verdict = z.object({ on_topic: z.boolean() });

type GuardResult = "on-topic" | "off-topic" | "error";

/**
 * Cheap topic check that runs before the main call. Only the latest visitor message
 * and a truncated previous answer are sent; the about-me document is not.
 * Fails closed: any error, refusal or unparsable output returns "error".
 */
export async function checkTopic(client: Anthropic, model: string, messages: ChatMessage[]): Promise<GuardResult> {
  const latest = messages[messages.length - 1];
  const previous = messages.length > 1 ? messages[messages.length - 2] : undefined;
  const context = previous ? `<previous_answer>\n${previous.content.slice(0, 500)}\n</previous_answer>\n\n` : "";

  try {
    const response = await client.messages.parse(
      {
        model,
        max_tokens: 64,
        system: GUARD_PROMPT,
        output_config: { effort: "low", format: zodOutputFormat(Verdict) },
        messages: [{ role: "user", content: `${context}<visitor_message>\n${latest.content}\n</visitor_message>` }],
      },
      { timeout: 5_000, maxRetries: 1 },
    );

    const verdict = response.stop_reason === "refusal" ? null : response.parsed_output;
    console.info("[chat] guard", {
      verdict: verdict?.on_topic ?? null,
      stop: response.stop_reason,
      input: response.usage.input_tokens,
      output: response.usage.output_tokens,
    });
    if (!verdict) return "error";
    return verdict.on_topic ? "on-topic" : "off-topic";
  } catch (error) {
    console.error("[chat] guard failed", error instanceof Anthropic.APIError ? `${error.status} ${error.name}` : error);
    return "error";
  }
}
