import type { MetadataRoute } from "next";
import { isIndexable, siteUrl } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  if (!isIndexable) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    // API routes aren't pages. /cv stays out of robots.txt so its path isn't advertised; it is noindex.
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
