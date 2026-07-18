import type { NextConfig } from "next";

// VS domain rewrites: venuesprocket.com/* → /venuesprocket/* internally.
// This allows a single Next.js deployment to serve both brands.
const VS_HOST = process.env.VENUESPROCKET_HOST ?? "venuesprocket.com";

const vsDomainRewrites = [
  { source: "/", destination: "/venuesprocket" },
  { source: "/favicon.ico", destination: "/venuesprocket/icon.png" },
  { source: "/features", destination: "/venuesprocket/features" },
  { source: "/pricing", destination: "/venuesprocket/pricing" },
  { source: "/start", destination: "/venuesprocket/start" },
  { source: "/leaguepour", destination: "/venuesprocket/leaguepour" },
  { source: "/compare/:slug", destination: "/venuesprocket/compare/:slug" },
  { source: "/private-event-booking-software", destination: "/venuesprocket/private-event-booking-software" },
  { source: "/beo-software", destination: "/venuesprocket/beo-software" },
  { source: "/event-contract-software", destination: "/venuesprocket/event-contract-software" },
  { source: "/event-deposit-software", destination: "/venuesprocket/event-deposit-software" },
  { source: "/venue-marketing-software", destination: "/venuesprocket/venue-marketing-software" },
  { source: "/restaurant-event-management-software", destination: "/venuesprocket/restaurant-event-management-software" },
  { source: "/brewery-event-management-software", destination: "/venuesprocket/brewery-event-management-software" },
  { source: "/bar-event-management-software", destination: "/venuesprocket/bar-event-management-software" },
  { source: "/taproom-event-management-software", destination: "/venuesprocket/taproom-event-management-software" },
  { source: "/banquet-hall-software", destination: "/venuesprocket/banquet-hall-software" },
  { source: "/contact", destination: "/venuesprocket/contact" },
  { source: "/legal/terms", destination: "/venuesprocket/legal/terms" },
  { source: "/legal/privacy", destination: "/venuesprocket/legal/privacy" },
  { source: "/sitemap.xml", destination: "/venuesprocket/sitemap.xml" },
  { source: "/robots.txt", destination: "/venuesprocket/robots.txt" },
].map((r) => ({ ...r, has: [{ type: "host" as const, value: VS_HOST }] }));

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return {
      beforeFiles: vsDomainRewrites,
    };
  },
};

export default nextConfig;
