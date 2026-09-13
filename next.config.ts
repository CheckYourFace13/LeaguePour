import type { NextConfig } from "next";
import { VS_HOST, vsExactRewrites, vsCompareRewrite, vsGuidesRewrite } from "./src/lib/vs-routing";

// VS domain rewrites: venuesprocket.com/* → /venuesprocket/* internally.
// This allows a single Next.js deployment to serve both brands. The path list itself lives in
// src/lib/vs-routing.ts, shared with middleware.ts's host-gating - see that file's doc comment.
const vsDomainRewrites = [...vsExactRewrites, vsCompareRewrite, vsGuidesRewrite].map((r) => ({
  ...r,
  has: [{ type: "host" as const, value: VS_HOST }],
}));

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return {
      beforeFiles: vsDomainRewrites,
    };
  },
  async redirects() {
    return [
      // Both brands already have a real content hub at /guides - no separate blog exists, so
      // /blog should land there instead of 404ing for anyone expecting content. Path-based (no
      // host condition needed): each host's own /guides already resolves to that host's own
      // content via the existing rewrite/route setup, so this can't cross brands.
      { source: "/blog", destination: "/guides", permanent: true },
      { source: "/blog/:path*", destination: "/guides", permanent: true },
      // GrokBot audit: venuesprocket.com/privacy and /terms aren't real pages on either brand
      // (both live at /legal/*), so without these they fell through middleware's host-gate to
      // leaguepour.com/privacy and /terms - which don't exist there either, so a plausible alias
      // URL 404'd on the wrong domain. Scoped to the VS host only (LP has never had this alias
      // and isn't part of this cleanup) - the destination is already in vs-routing.ts's
      // exactRules, so it resolves to VenueSprocket's real, correctly-branded legal pages.
      {
        source: "/privacy",
        destination: "/legal/privacy",
        permanent: true,
        has: [{ type: "host", value: VS_HOST }],
      },
      {
        source: "/terms",
        destination: "/legal/terms",
        permanent: true,
        has: [{ type: "host", value: VS_HOST }],
      },
    ];
  },
};

export default nextConfig;
