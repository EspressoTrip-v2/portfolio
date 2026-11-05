import type Anthropic from "@anthropic-ai/sdk";

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}. See the "Chat assistant" section of README.md.`);
  return value;
}

type Effort = NonNullable<Anthropic.Beta.BetaOutputConfig["effort"]>;
const efforts = ["low", "medium", "high", "xhigh", "max"] as const satisfies readonly Effort[];

/** `CV_EFFORT`, defaulting to high. A set but unknown value fails loudly rather than silently becoming high. */
function cvEffort(value: string | undefined) {
  if (!value) return "high";
  const effort = efforts.find((candidate) => candidate === value);
  if (!effort) throw new Error(`CV_EFFORT must be one of ${efforts.join(", ")}; got "${value}".`);
  return effort;
}

/**
 * Chat configuration. Read on first request rather than at import, so `next build`
 * succeeds without the secrets, and a missing variable fails loudly at runtime.
 */
export function getChatEnv() {
  return {
    apiKey: required("CLAUDE_API_KEY"),
    model: required("CLAUDE_MODEL"),
    guardModel: required("CLAUDE_GUARD_MODEL"),
    /** Model for the CV generator; tailoring benefits from the strongest model. */
    cvModel: process.env.CV_MODEL || "claude-opus-5-5",
    /** Effort for the CV generator. Opus 5.5 defaults to medium, so it is set explicitly. */
    cvEffort: cvEffort(process.env.CV_EFFORT),
  };
}
