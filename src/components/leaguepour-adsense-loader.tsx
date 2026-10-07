"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const VS_HOST = "venuesprocket.com";
const ADSENSE_CLIENT_ID = "ca-pub-9572509189594279";

// Only these path prefixes are substantial, original editorial content - the guides hub and
// articles, the game history pages, and the rules hub. The per-game software landing pages were
// removed in the October 2026 review: they're product/conversion pages with signup CTAs, not
// editorial. Everything else (home, pricing, demo, signup, login,
// the authenticated venue/player dashboards, checkout/payment flows) stays ad-free: AdSense's own
// policies (and this site's "Needs attention: Low value content" flag) treat ads next to thin
// utility screens or right on top of a conversion flow as a quality problem, not just a UX one.
const LP_AD_ELIGIBLE_PREFIXES = ["/guides", "/history", "/rules"];

// VS's own guides hub + articles are the only substantial, original editorial content on that
// brand - the ~10 vertical/keyword landing pages (private-event-booking-software etc.) are
// templated variations, and home/pricing/contact/start are pure conversion pages. Same "Needs
// attention: Low value content" AdSense reasoning as LP above applies here too (both brands share
// one AdSense publisher account, so a quality flag on one is a shared-account risk for both).
const VS_AD_ELIGIBLE_PREFIXES = ["/guides"];

function isAdEligiblePath(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Loads the AdSense script only on each brand's substantial editorial pages. Previously this
 * loaded unconditionally in the root layout - on every page in the app, including
 * venuesprocket.com (this root layout wraps VS too, see the comment in app/layout.tsx) and every
 * authenticated /venue, /player, and checkout/payment screen. VS's own layout separately loaded an
 * unconditional AdSense <Script> with the same gap; both are now handled by this one component.
 * The host check has to read window.location client-side (matching the LeaguePourGoogleTags
 * pattern next to this) so layouts stay statically prerenderable, but the path check uses
 * next/navigation's usePathname() (not window.location.pathname in a mount-only effect) so this
 * actually re-runs on client-side route changes - App Router navigation doesn't remount this
 * component.
 */
export function LeaguePourAdsenseLoader() {
  const pathname = usePathname();
  const [isEligibleHost, setIsEligibleHost] = useState<"lp" | "vs" | null>(null);

  useEffect(() => {
    setIsEligibleHost(window.location.hostname.replace(/^www\./, "") === VS_HOST ? "vs" : "lp");
  }, []);

  const prefixes = isEligibleHost === "vs" ? VS_AD_ELIGIBLE_PREFIXES : LP_AD_ELIGIBLE_PREFIXES;
  if (!isEligibleHost || !isAdEligiblePath(pathname, prefixes)) return null;

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
    />
  );
}
