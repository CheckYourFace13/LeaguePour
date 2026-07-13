import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/venue/", "/api/", "/login", "/signup"],
    },
    sitemap: "https://venuesprocket.com/sitemap.xml",
  };
}
