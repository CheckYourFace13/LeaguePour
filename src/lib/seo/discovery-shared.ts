import type { DiscoveryComparisonRow } from "@/components/seo/LeaguePourDiscoveryLanding";

export const VENUE_WHY_ITEMS = [
  "Paid signups through Stripe — entry fees go to your venue account",
  "Public venue hub and mobile-friendly competition pages",
  "QR codes for tables, windows, and social posts",
  "Waitlists, team formats, and staff score entry",
  "Email campaigns to bring past players back",
  "Local SEO pages so players can find your bar",
];

export const CORE_COMPARISON_ROWS: DiscoveryComparisonRow[] = [
  { feature: "Brackets & standings", generic: true, leaguepour: true },
  { feature: "Paid signup to venue Stripe", generic: "Sometimes", leaguepour: true },
  { feature: "Venue event hub", generic: false, leaguepour: true },
  { feature: "QR code signup", generic: "Limited", leaguepour: true },
  { feature: "Local SEO discovery", generic: false, leaguepour: true },
  { feature: "Repeat-player campaigns", generic: false, leaguepour: true },
  { feature: "Sponsor & promo placement", generic: "Limited", leaguepour: true },
  { feature: "Built for bars & breweries", generic: false, leaguepour: true },
];

export const DEEP_COMPARISON_ROWS: DiscoveryComparisonRow[] = [
  ...CORE_COMPARISON_ROWS,
  { feature: "Bulk participant import", generic: true, leaguepour: "Roadmap" },
  { feature: "Drag-and-drop seeding", generic: true, leaguepour: "Roadmap" },
  { feature: "Custom registration fields", generic: true, leaguepour: "Planned" },
  { feature: "Station queue display", generic: true, leaguepour: "Roadmap" },
  { feature: "API access", generic: true, leaguepour: "Roadmap" },
];

export const SPONSOR_PROMO = {
  title: "Turn sponsors into event revenue",
  copy: "Feature prize sponsors, food specials, drink specials, and partner promos directly around your league or tournament page.",
  ctaHref: "/for-venues",
  ctaLabel: "See venue tools",
};

export const REVENUE_PROMO = {
  title: "More than brackets — built to make the night profitable",
  bullets: [
    "Collect entry fees before players arrive",
    "Promote food and drink specials",
    "Bring past players back with campaigns",
    "Give sponsors visible placement around the event",
  ],
  ctaHref: "/pricing",
  ctaLabel: "See pricing",
};

export const UPGRADE_PROMO = {
  title: "Want more visibility for every league night?",
  copy: "Paid venue plans are built to help events get found, promoted, and repeated — not just bracketed.",
  ctaHref: "/pricing",
  ctaLabel: "Compare plans",
};

export const ROADMAP_ITEMS = [
  "Bulk imports and seeding tools",
  "Board/table/station assignment",
  "Public station queue display",
  "Player-submitted scores with dispute review",
  "Embeddable brackets and event widgets",
  "Sponsor and merch add-ons",
];

export type DiscoveryRoutePrefix = "bar-leagues" | "events" | "bars";

export function discoveryPath(prefix: DiscoveryRoutePrefix, citySlug: string, gameSlug?: string): string {
  return gameSlug ? `/${prefix}/${citySlug}/${gameSlug}` : `/${prefix}/${citySlug}`;
}
