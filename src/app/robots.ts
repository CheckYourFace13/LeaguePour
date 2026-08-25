import type { MetadataRoute } from "next";
import { getPublicSiteUrl } from "@/lib/site-url";

// Matches VS's robots.txt route handler's explicit 1h Cache-Control - this project has been bitten
// before by the Hostinger CDN serving stale HTML for up to days on prerendered pages with the
// framework default (effectively far-future) cache lifetime; SEO-critical documents like this one
// get an explicit, short revalidate window instead of trusting the default.
export const revalidate = 3600;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/venue/",
        "/player/",
        "/app/",
        "/api/",
        "/internal/",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/embed/",
        "/deposit/",
        "/proposal/",
        "/sign/",
      ],
    },
    sitemap: `${getPublicSiteUrl()}/sitemap.xml`,
  };
}
