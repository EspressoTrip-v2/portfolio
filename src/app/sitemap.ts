import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: siteUrl.toString(), changeFrequency: "monthly", priority: 1 }];
}
