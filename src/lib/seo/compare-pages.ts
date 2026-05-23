import type { DiscoveryComparisonRow } from "@/components/seo/LeaguePourDiscoveryLanding";

export type ComparePageConfig = {
  slug: string;
  title: string;
  description: string;
  heroTitle: string;
  heroIntro: string;
  theirStrength: string;
  leaguePourFocus: string;
  rows: DiscoveryComparisonRow[];
  faqs: { q: string; a: string }[];
};

const VENUE_ROWS: DiscoveryComparisonRow[] = [
  { feature: "Auto-generated brackets", generic: true, leaguepour: "Roadmap" },
  { feature: "Manual match & standings", generic: "Sometimes", leaguepour: true },
  { feature: "Paid signup to venue Stripe", generic: "Sometimes", leaguepour: true },
  { feature: "Public venue event hub", generic: false, leaguepour: true },
  { feature: "QR code signup", generic: "Limited", leaguepour: true },
  { feature: "Local SEO event pages", generic: false, leaguepour: true },
  { feature: "City/game discovery", generic: false, leaguepour: true },
  { feature: "Repeat-player email campaigns", generic: false, leaguepour: true },
  { feature: "Sponsor & food/drink promo", generic: "Limited", leaguepour: true },
  { feature: "Purpose-built for bars & breweries", generic: false, leaguepour: true },
];

export const COMPARE_PAGES: ComparePageConfig[] = [
  {
    slug: "challonge",
    title: "LeaguePour vs Challonge for Bar Tournaments | LeaguePour",
    description:
      "Challonge excels at brackets. LeaguePour is venue-first bar tournament software with paid signups, QR codes, venue hubs, and local discovery.",
    heroTitle: "LeaguePour vs Challonge for bars & breweries",
    heroIntro:
      "Challonge is strong for general tournaments and brackets. LeaguePour is purpose-built for bars, breweries, restaurants, taprooms, and local venues that need signups, payments, and repeat customers — not just a bracket draw.",
    theirStrength:
      "Challonge is a mature bracket platform with deep tournament formats, seeding tools, and a large community of organizers.",
    leaguePourFocus:
      "LeaguePour focuses on paid signups, QR codes, venue hubs, local event discovery, repeat-player campaigns, sponsor/prize promotion, food/drink specials, and venue revenue — while improving bracket automation for venue-first operations.",
    rows: [
      ...VENUE_ROWS,
      { feature: "Bulk import & drag-drop seeding", generic: true, leaguepour: "Roadmap" },
      { feature: "Embeddable bracket widgets", generic: true, leaguepour: "Roadmap" },
    ],
    faqs: [
      {
        q: "Should my bar use Challonge or LeaguePour?",
        a: "If you only need a free bracket for a one-off hobby event, a bracket-focused tool may be enough. If you run paid bar leagues, need Stripe payouts, public signup pages, and marketing to fill the next night, LeaguePour is built for that.",
      },
      {
        q: "Does LeaguePour replace Challonge's bracket depth?",
        a: "Challonge leads on auto-generated brackets and deep seeding today. LeaguePour supports established formats with manual match rows and standings now, and is building auto-bracket generation, pool play, and Swiss on the roadmap — while signups, payments, venue hubs, and player discovery are live.",
      },
    ],
  },
  {
    slug: "generic-bracket-generators",
    title: "LeaguePour vs Generic Bracket Generators | LeaguePour",
    description:
      "Generic bracket generators draw matchups. LeaguePour helps bars fill the room with paid signups, venue hubs, and repeat-player marketing.",
    heroTitle: "LeaguePour vs generic bracket generators",
    heroIntro:
      "Free bracket generators are fine for drawing matchups. LeaguePour is venue software that helps you collect signups, take entry fees, and bring players back.",
    theirStrength: "Fast, free bracket visuals with minimal setup.",
    leaguePourFocus:
      "Stripe signups, waitlists, staff scoring, public venue pages, and campaigns to past players.",
    rows: VENUE_ROWS,
    faqs: [
      {
        q: "Can I still run a bracket on LeaguePour?",
        a: "Yes — match rows drive bracket cards on Standings. Staff enter scores from the venue dashboard.",
      },
    ],
  },
  {
    slug: "spreadsheets",
    title: "LeaguePour vs Spreadsheets for Bar Leagues | LeaguePour",
    description:
      "Stop running bar leagues on spreadsheets. LeaguePour handles signups, payments, standings, and player communication.",
    heroTitle: "LeaguePour vs spreadsheets",
    heroIntro:
      "Spreadsheets work until they don't — lost tabs, manual payments, and no public signup page. LeaguePour gives players a link and gives you a check-in list.",
    theirStrength: "Familiar, flexible, zero software cost.",
    leaguePourFocus: "Online signup, Stripe entry fees, public standings, and email to past players.",
    rows: [
      { feature: "Public signup page", generic: false, leaguepour: true },
      { feature: "Card payments", generic: false, leaguepour: true },
      { feature: "Automatic waitlist", generic: false, leaguepour: true },
      { feature: "Live standings page", generic: "Manual", leaguepour: true },
      { feature: "Player marketing", generic: false, leaguepour: true },
    ],
    faqs: [
      {
        q: "Can I export data?",
        a: "Registration and payment records live in your venue dashboard. Exports are expanding — you are never locked into a spreadsheet as the only source of truth for signups.",
      },
    ],
  },
  {
    slug: "facebook-events",
    title: "LeaguePour vs Facebook Events for Bar Leagues | LeaguePour",
    description:
      "Facebook Events promote a night. LeaguePour runs signups, entry fees, brackets, and repeat-player lists for bar competitions.",
    heroTitle: "LeaguePour vs Facebook Events",
    heroIntro:
      "Facebook is great for reach. LeaguePour is where players actually register, pay entry, and see standings.",
    theirStrength: "Social distribution and casual RSVPs.",
    leaguePourFocus: "Paid registration, caps, waitlists, brackets, and a venue-owned player list.",
    rows: [
      { feature: "Paid entry collection", generic: "Limited", leaguepour: true },
      { feature: "Team registration", generic: "Limited", leaguepour: true },
      { feature: "Bracket & standings", generic: false, leaguepour: true },
      { feature: "Venue-owned audience", generic: false, leaguepour: true },
      { feature: "QR signup at the bar", generic: false, leaguepour: true },
    ],
    faqs: [
      {
        q: "Should I stop using Facebook?",
        a: "No — post on Facebook and link to your LeaguePour signup page so RSVPs turn into confirmed, paid registrations.",
      },
    ],
  },
  {
    slug: "eventbrite",
    title: "LeaguePour vs Eventbrite for Bar Tournaments | LeaguePour",
    description:
      "Eventbrite sells tickets to events. LeaguePour runs ongoing bar leagues with brackets, teams, standings, and venue hubs.",
    heroTitle: "LeaguePour vs Eventbrite",
    heroIntro:
      "Eventbrite fits ticketed one-off events. LeaguePour fits weekly dart leagues, cornhole seasons, and bar brackets with teams and standings.",
    theirStrength: "Ticketing, discovery marketplace, and large-scale events.",
    leaguePourFocus: "Recurring leagues, team formats, brackets, venue hub, and bar-specific workflows.",
    rows: [
      { feature: "Recurring league nights", generic: "Limited", leaguepour: true },
      { feature: "Team & captain signup", generic: "Limited", leaguepour: true },
      { feature: "Bracket management", generic: false, leaguepour: true },
      { feature: "Venue competition hub", generic: false, leaguepour: true },
      { feature: "Lower fees on bar entry", generic: "Varies", leaguepour: true },
    ],
    faqs: [
      {
        q: "Does LeaguePour sell general admission tickets?",
        a: "LeaguePour focuses on competition registration and entry fees, not broad event ticketing. Merch add-ons are on the roadmap.",
      },
    ],
  },
  {
    slug: "tournament-software",
    title: "LeaguePour vs Generic Tournament Software | LeaguePour",
    description:
      "Compare venue-first bar tournament software with generic tournament platforms. Paid signups, QR codes, local discovery, and repeat players.",
    heroTitle: "LeaguePour vs generic tournament software",
    heroIntro:
      "Generic tournament software organizes matchups for any sport. LeaguePour is built for bars and breweries running local leagues with real money and repeat crowds.",
    theirStrength: "Broad tournament features and organizer tooling.",
    leaguePourFocus:
      "Venue hubs, bar-game templates, Stripe Connect payouts, and marketing that fills the next league night.",
    rows: VENUE_ROWS,
    faqs: [
      {
        q: "What makes LeaguePour venue-first?",
        a: "Every public page ties back to a venue hub, real competition signups, and tools to re-engage players who already visited your bar — not just a standalone bracket URL.",
      },
    ],
  },
];

export function getComparePage(slug: string): ComparePageConfig | null {
  return COMPARE_PAGES.find((p) => p.slug === slug) ?? null;
}

export function getAllCompareSlugs(): string[] {
  return COMPARE_PAGES.map((p) => p.slug);
}
