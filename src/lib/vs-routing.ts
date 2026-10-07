/**
 * Single source of truth for which root-relative paths belong to VenueSprocket when the
 * venuesprocket.com host rewrites them into /venuesprocket/* internally (see next.config.ts).
 * middleware.ts uses this same list to enforce the other half of brand/domain separation: any
 * path NOT in this list must not render on the VS host, and /venuesprocket/* must not render on
 * the LP host - previously nothing enforced that, so e.g. venuesprocket.com/about rendered the
 * full LeaguePour-branded page (wrong Organization schema, wrong nav/footer) at a VS URL, and
 * leaguepour.com/venuesprocket/pricing rendered VS content on the LP domain. Kept as one shared
 * list (rather than duplicating it in next.config.ts and middleware.ts separately) so the two
 * can't drift out of sync.
 */
export const VS_HOST = process.env.VENUESPROCKET_HOST ?? "venuesprocket.com";
export const LP_HOST = process.env.LEAGUEPOUR_HOST ?? "leaguepour.com";

type VsPathRule = { source: string; destination: string };

const exactRules: VsPathRule[] = [
  { source: "/", destination: "/venuesprocket" },
  { source: "/favicon.ico", destination: "/venuesprocket/icon.png" },
  { source: "/about", destination: "/venuesprocket/about" },
  { source: "/features", destination: "/venuesprocket/features" },
  { source: "/pricing", destination: "/venuesprocket/pricing" },
  { source: "/start", destination: "/venuesprocket/start" },
  { source: "/leaguepour", destination: "/venuesprocket/leaguepour" },
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
  { source: "/guides", destination: "/venuesprocket/guides" },
  { source: "/contact", destination: "/venuesprocket/contact" },
  { source: "/faq", destination: "/venuesprocket/faq" },
  { source: "/demo", destination: "/venuesprocket/demo" },
  { source: "/compare", destination: "/venuesprocket/compare" },
  { source: "/templates", destination: "/venuesprocket/templates" },
  { source: "/tools", destination: "/venuesprocket/tools" },
  { source: "/tools/food-beverage-minimum-calculator", destination: "/venuesprocket/tools/food-beverage-minimum-calculator" },
  { source: "/tools/event-deposit-calculator", destination: "/venuesprocket/tools/event-deposit-calculator" },
  { source: "/llms.txt", destination: "/venuesprocket/llms.txt" },
  // The root app/manifest.ts file convention emits <link rel="manifest" href="/manifest.webmanifest">
  // on every page, which takes precedence over venuesprocket/layout.tsx's own metadata.manifest -
  // so on the VS host that URL itself has to serve the VenueSprocket manifest.
  { source: "/manifest.webmanifest", destination: "/venuesprocket/manifest.webmanifest" },
  { source: "/legal/terms", destination: "/venuesprocket/legal/terms" },
  { source: "/legal/privacy", destination: "/venuesprocket/legal/privacy" },
  { source: "/sitemap.xml", destination: "/venuesprocket/sitemap.xml" },
  { source: "/robots.txt", destination: "/venuesprocket/robots.txt" },
];

// Path prefixes with a dynamic segment - Next.js rewrite syntax (:slug, :path*) lives in
// next.config.ts itself since that's the only place that needs the placeholder syntax;
// middleware only needs to know the literal prefix to test against.
const prefixRules = ["/compare/", "/guides/"];

export const vsExactRewrites: VsPathRule[] = exactRules;
export const vsCompareRewrite = { source: "/compare/:slug", destination: "/venuesprocket/compare/:slug" };
export const vsGuidesRewrite = { source: "/guides/:path*", destination: "/venuesprocket/guides/:path*" };

/** True if this root-relative path is one VenueSprocket's host rewrite serves. */
export function isVsPath(pathname: string): boolean {
  if (exactRules.some((r) => r.source === pathname)) return true;
  return prefixRules.some((p) => pathname.startsWith(p));
}
