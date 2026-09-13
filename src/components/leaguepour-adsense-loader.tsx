"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const VS_HOST = "venuesprocket.com";
const ADSENSE_CLIENT_ID = "ca-pub-9572509189594279";

// Only these path prefixes are substantial, original editorial content - the guides hub/articles
// and the per-game software landing pages. Everything else (home, pricing, demo, signup, login,
// the authenticated venue/player dashboards, checkout/payment flows) stays ad-free: AdSense's own
// policies (and this site's "Needs attention: Low value content" flag) treat ads next to thin
// utility screens or right on top of a conversion flow as a quality problem, not just a UX one.
const AD_ELIGIBLE_PREFIXES = [
  "/guides",
  "/dart-league-software",
  "/cornhole-tournament-software",
  "/bar-trivia-software",
  "/pool-league-management",
  "/shuffleboard-league-software",
  "/poker-tournament-software",
  "/music-bingo-software",
  "/euchre-tournament-software",
  "/bar-league-standings",
];

function isAdEligiblePath(pathname: string): boolean {
  return AD_ELIGIBLE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Loads the AdSense script only on leaguepour.com's substantial editorial pages. Previously this
 * loaded unconditionally in the root layout - on every page in the app, including
 * venuesprocket.com (this root layout wraps VS too, see the comment in app/layout.tsx) and every
 * authenticated /venue, /player, and checkout/payment screen. The host check has to read
 * window.location client-side (matching the LeaguePourGoogleTags pattern next to this) so the
 * root layout stays statically prerenderable, but the path check uses next/navigation's
 * usePathname() (not window.location.pathname in a mount-only effect) so this actually re-runs on
 * client-side route changes - App Router navigation doesn't remount this component.
 */
export function LeaguePourAdsenseLoader() {
  const pathname = usePathname();
  const [isLpHost, setIsLpHost] = useState(false);

  useEffect(() => {
    setIsLpHost(window.location.hostname.replace(/^www\./, "") !== VS_HOST);
  }, []);

  if (!isLpHost || !isAdEligiblePath(pathname)) return null;

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
    />
  );
}
