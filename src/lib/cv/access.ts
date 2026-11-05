import { createHash, timingSafeEqual } from "node:crypto";

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

/**
 * Whether the request carries Juan's passcode as `Authorization: Bearer <CV_ACCESS_KEY>`.
 * Digests are compared in constant time. In `next dev` with no key set, every request is allowed.
 */
export function hasCvAccess(request: Request) {
  const key = process.env.CV_ACCESS_KEY;
  if (!key) return process.env.NODE_ENV === "development";
  const header = request.headers.get("authorization") ?? "";
  const given = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  return timingSafeEqual(digest(given), digest(key));
}
