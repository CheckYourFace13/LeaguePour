import type { DiscoveryComparisonRow } from "@/components/seo/LeaguePourDiscoveryLanding";
import { BRACKET_ENGINE_ROADMAP, formatsWithPickerLabels } from "@/lib/tournament-formats";

export const VENUE_WHY_ITEMS = [
  "Paid signups through Stripe - entry fees go to your venue account",
  "Public venue hub and mobile-friendly competition pages",
  "QR codes for tables, windows, and social posts",
  "Waitlists, team formats, and staff score entry (manual match rows today)",
  "Email campaigns to bring past players back",
  "Local SEO pages so players can find your bar",
];

/** Honest vs generic tools - no overclaim on auto-brackets. */
export const CORE_COMPARISON_ROWS: DiscoveryComparisonRow[] = [
  { feature: "Manual match & score tracking", generic: "Sometimes", leaguepour: true },
  { feature: "Auto-generated bracket trees", generic: true, leaguepour: "Roadmap" },
  { feature: "Standings (W/L/T, points)", generic: true, leaguepour: true },
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
  { feature: "Pool play → playoffs", generic: true, leaguepour: "Planned" },
  { feature: "Swiss pairing", generic: true, leaguepour: "Roadmap" },
  { feature: "Custom registration fields", generic: true, leaguepour: "Planned" },
  { feature: "Station queue display", generic: true, leaguepour: "Roadmap" },
];

export const FEATURE_SPONSOR_PROMO = {
  title: "Feature a sponsor",
  copy: "Highlight prize sponsors, food specials, drink specials, and partner promos on your league or tournament page.",
  ctaHref: "/for-venues",
  ctaLabel: "See venue tools",
};

export const PROMOTE_LEAGUE_PROMO = {
  title: "Promote your league night",
  copy: "Publish signup, share your QR code, and let LeaguePour help players discover your next dart, trivia, or cornhole night.",
  ctaHref: "/signup/venue",
  ctaLabel: "Start hosting events",
};

export const ENTRY_FEE_REVENUE_PROMO = {
  title: "Turn entry fees into recurring revenue",
  bullets: [
    "Collect entry fees before players arrive",
    "Promote food and drink specials",
    "Bring past players back with campaigns",
    "Give sponsors visible placement around the event",
  ],
  ctaHref: "/pricing",
  ctaLabel: "See pricing",
};

export const BRING_PLAYERS_BACK_PROMO = {
  title: "Bring past players back",
  copy: "Email campaigns and venue hubs keep your player list warm between league nights, not just the night of the bracket.",
  ctaHref: "/venue/marketing",
  ctaLabel: "Venue marketing",
};

export const UPGRADE_PROMO = {
  title: "Want more visibility for every league night?",
  copy: "Paid venue plans help events get found, promoted, and repeated - while bracket automation continues to improve.",
  ctaHref: "/pricing",
  ctaLabel: "Compare plans",
};

/** @deprecated Use FEATURE_SPONSOR_PROMO */
export const SPONSOR_PROMO = FEATURE_SPONSOR_PROMO;
/** @deprecated Use ENTRY_FEE_REVENUE_PROMO */
export const REVENUE_PROMO = ENTRY_FEE_REVENUE_PROMO;

export const ROADMAP_ITEMS = [...BRACKET_ENGINE_ROADMAP];

export const DEFAULT_FORMAT_SECTION = {
  title: "Established tournament formats",
  intro:
    "LeaguePour supports familiar bar formats today (manual matches & standings). Auto-bracket generation and advanced controls are on the roadmap - see status labels below.",
  ctaHref: "/features/tournaments",
  ctaLabel: "Full format & bracket guide",
  formats: formatsWithPickerLabels().map((f) => ({
    label: f.pickerLabel ?? f.name,
    status: f.status,
  })),
};

export const BRACKET_ROADMAP_SECTION = {
  title: "Bracket engine roadmap",
  items: ROADMAP_ITEMS,
};

export type DiscoveryRoutePrefix = "bar-leagues" | "events" | "bars";

export function discoveryPath(prefix: DiscoveryRoutePrefix, citySlug: string, gameSlug?: string): string {
  return gameSlug ? `/${prefix}/${citySlug}/${gameSlug}` : `/${prefix}/${citySlug}`;
}
