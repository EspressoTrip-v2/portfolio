/**
 * The CV generator is local-only for now: on in `next dev`, off in production builds
 * (including Vercel previews) unless `CV_GENERATOR=on` is set explicitly.
 */
export function cvEnabled() {
  return process.env.NODE_ENV === "development" || process.env.CV_GENERATOR === "on";
}
