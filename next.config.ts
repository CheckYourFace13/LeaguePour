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
};

export default nextConfig;
