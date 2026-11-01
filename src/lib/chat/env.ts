function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}. See the "Chat assistant" section of README.md.`);
  return value;
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
  };
}
