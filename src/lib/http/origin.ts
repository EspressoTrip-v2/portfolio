import { siteUrl } from "@/config/site";

const bare = (host: string) => host.replace(/^www\./, "");

/**
 * True when a browser request comes from this site's own pages.
 * The apex domain redirects to www (or the other way round), so both count as the site;
 * Vercel preview deployments and local dev serve from their own hosts.
 */
export function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || !URL.canParse(origin)) return false;
  const { host } = new URL(origin);
  if (bare(host) === bare(siteUrl.host)) return true;
  return host === process.env.VERCEL_URL || (process.env.NODE_ENV === "development" && host.startsWith("localhost:"));
}
