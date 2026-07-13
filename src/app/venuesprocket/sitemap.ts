import type { MetadataRoute } from "next";

const BASE = "https://venuesprocket.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    { path: "", priority: 1.0 },
    { path: "/features", priority: 0.9 },
    { path: "/pricing", priority: 0.9 },
    { path: "/start", priority: 0.9 },
    { path: "/leaguepour", priority: 0.85 },
    { path: "/contact", priority: 0.8 },
    { path: "/private-event-booking-software", priority: 0.85 },
    { path: "/beo-software", priority: 0.85 },
    { path: "/event-contract-software", priority: 0.85 },
    { path: "/event-deposit-software", priority: 0.85 },
    { path: "/venue-marketing-software", priority: 0.85 },
    { path: "/restaurant-event-management-software", priority: 0.85 },
    { path: "/brewery-event-management-software", priority: 0.85 },
    { path: "/bar-event-management-software", priority: 0.85 },
    { path: "/taproom-event-management-software", priority: 0.85 },
    { path: "/banquet-hall-software", priority: 0.85 },
    { path: "/compare/tripleseat", priority: 0.9 },
    { path: "/compare/perfect-venue", priority: 0.9 },
    { path: "/compare/planning-pod", priority: 0.9 },
    { path: "/compare/caterease", priority: 0.9 },
    { path: "/compare/event-temple", priority: 0.9 },
    { path: "/compare/honeybook", priority: 0.9 },
    { path: "/compare/google-forms", priority: 0.9 },
    { path: "/compare/email-pdf", priority: 0.9 },
    { path: "/legal/terms", priority: 0.4 },
    { path: "/legal/privacy", priority: 0.4 },
  ];

  return pages.map(({ path, priority }) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority,
  }));
}
