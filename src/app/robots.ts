import type { MetadataRoute } from "next";
import { getPublicSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/venue/", "/player/", "/api/"],
    },
    sitemap: `${getPublicSiteUrl()}/sitemap.xml`,
  };
}
