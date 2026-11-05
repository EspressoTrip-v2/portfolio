/**
 * The CV generator is Juan's own tool. It is on in `next dev`. In a production build (including
 * Vercel previews) it is on only when the `CV_ACCESS_KEY` passcode is set; otherwise the page and
 * API return 404.
 */
export function cvEnabled() {
  return process.env.NODE_ENV === "development" || Boolean(process.env.CV_ACCESS_KEY);
}
