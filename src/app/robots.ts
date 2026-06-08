import type { MetadataRoute } from "next";
import { getPublicSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/venue/",
        "/player/",
        "/api/",
        "/internal/",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/embed/",
      ],
    },
    sitemap: `${getPublicSiteUrl()}/sitemap.xml`,
  };
}
