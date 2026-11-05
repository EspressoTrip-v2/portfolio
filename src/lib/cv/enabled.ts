/**
 * The CV generator is Juan's own tool. It is on in `next dev`. In a production build (including
 * Vercel previews) it is on only when `CV_GENERATOR=on` and a `CV_ACCESS_KEY` passcode are both
 * set; otherwise the page and API return 404.
 */
export function cvEnabled() {
  if (process.env.NODE_ENV === "development") return true;
  return process.env.CV_GENERATOR === "on" && Boolean(process.env.CV_ACCESS_KEY);
}
