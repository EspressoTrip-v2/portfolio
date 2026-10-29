/**
 * Public base URL of the site.
 *
 * `SITE_URL` wins when set, which is useful for a custom domain.
 * Otherwise the URL comes from Vercel's system environment variables: the
 * production domain for production builds, and the deployment URL for
 * previews. Local builds fall back to the dev server.
 */
function resolveSiteUrl() {
  const { SITE_URL, VERCEL_ENV, VERCEL_PROJECT_PRODUCTION_URL, VERCEL_URL } = process.env;
  if (SITE_URL) return SITE_URL;
  if (VERCEL_ENV === "production" && VERCEL_PROJECT_PRODUCTION_URL) return `https://${VERCEL_PROJECT_PRODUCTION_URL}`;
  if (VERCEL_URL) return `https://${VERCEL_URL}`;
  return "http://localhost:3030";
}

export const siteUrl = new URL(resolveSiteUrl());

/** Only production deployments should be indexed; previews and local builds stay hidden. */
export const isIndexable = process.env.VERCEL_ENV === "production" || Boolean(process.env.SITE_URL);
