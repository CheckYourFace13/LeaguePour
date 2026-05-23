import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LeaguePourDiscoveryLanding } from "@/components/seo/LeaguePourDiscoveryLanding";
import {
  fetchDiscoveryCompetitionsForKind,
  fetchDiscoveryVenuesForKind,
} from "@/lib/seo/discovery-data";
import type { CompetitionKind } from "@/generated/prisma/enums";
import {
  buildBreadcrumbJsonLd,
  buildFaqPageJsonLd,
  buildSoftwareApplicationJsonLd,
} from "@/lib/seo/json-ld-builders";
import { getDiscoveryGameBySlug } from "@/lib/seo/discovery-games";
import {
  BRACKET_ROADMAP_SECTION,
  BRING_PLAYERS_BACK_PROMO,
  CORE_COMPARISON_ROWS,
  DEFAULT_FORMAT_SECTION,
  ENTRY_FEE_REVENUE_PROMO,
  FEATURE_SPONSOR_PROMO,
  PROMOTE_LEAGUE_PROMO,
  UPGRADE_PROMO,
} from "@/lib/seo/discovery-shared";

export type SoftwarePageSlug =
  | "bar-tournament-software"
  | "dart-league-software"
  | "cornhole-tournament-software"
  | "trivia-night-signup-software";

const SOFTWARE: Record<
  SoftwarePageSlug,
  {
    title: string;
    description: string;
    heroTitle: string;
    heroIntro: string;
    legacyPath: string;
    gameSlug?: string;
    kind?: CompetitionKind;
  }
> = {
  "bar-tournament-software": {
    title: "Bar Tournament Software | LeaguePour",
    description:
      "Bar tournament software, league management, paid signups, QR codes, venue event hubs, and local event discovery for bars and breweries.",
    heroTitle: "Bar tournament software built for venues",
    heroIntro:
      "LeaguePour is venue-first tournament and league software — signups, Stripe entry fees, brackets, venue hubs, and public discovery for players.",
    legacyPath: "/features/tournaments",
  },
  "dart-league-software": {
    title: "Dart League Software for Bars | LeaguePour",
    description:
      "Dart league software with paid signups, QR codes, venue hubs, and local discovery. Run bar dart leagues without spreadsheets.",
    heroTitle: "Dart league software for bars",
    heroIntro: "Run weekly dart leagues with online signup, entry fees, standings, and player marketing.",
    legacyPath: "/dart-league-software",
    gameSlug: "darts",
    kind: "DARTS",
  },
  "cornhole-tournament-software": {
    title: "Cornhole Tournament Software for Bars | LeaguePour",
    description:
      "Cornhole tournament software for bars — team signup, entry fees, brackets, and local event discovery.",
    heroTitle: "Cornhole tournament software for bars",
    heroIntro: "Run cornhole tournaments and leagues with paid signups and public event pages.",
    legacyPath: "/cornhole-tournament-software",
    gameSlug: "cornhole",
    kind: "CORNHOLE",
  },
  "trivia-night-signup-software": {
    title: "Trivia Night Signup Software for Bars | LeaguePour",
    description:
      "Trivia night signup software — team caps, paid entry, QR signup, and venue hubs for bar trivia.",
    heroTitle: "Trivia night signup software",
    heroIntro: "Confirm teams before trivia night with signup windows, waitlists, and Stripe entry fees.",
    legacyPath: "/bar-trivia-software",
    gameSlug: "trivia",
    kind: "TRIVIA",
  },
};

export function getAllSoftwareSlugs(): SoftwarePageSlug[] {
  return Object.keys(SOFTWARE) as SoftwarePageSlug[];
}

export async function buildSoftwareMetadata(slug: SoftwarePageSlug): Promise<Metadata> {
  const page = SOFTWARE[slug];
  if (!page) return {};
  const path = `/software/${slug}`;
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: path },
    openGraph: { title: page.title, description: page.description, url: path },
    robots: { index: true, follow: true },
  };
}

export async function SoftwareDiscoveryPage({ slug }: { slug: SoftwarePageSlug }) {
  const page = SOFTWARE[slug];
  if (!page) notFound();

  const path = `/software/${slug}`;
  const game = page.gameSlug ? getDiscoveryGameBySlug(page.gameSlug) : null;

  const [venues, competitions] = page.kind
    ? await Promise.all([
        fetchDiscoveryVenuesForKind(page.kind),
        fetchDiscoveryCompetitionsForKind(page.kind),
      ])
    : [[], []];

  const faqs = [
    {
      q: "Is LeaguePour only for tournaments?",
      a: "No — run one-night tournaments and recurring weekly leagues from the same venue dashboard.",
    },
    {
      q: "Where do entry fees go?",
      a: "To your connected Stripe account. LeaguePour charges a platform fee on paid entry (see Pricing).",
    },
    {
      q: "Does LeaguePour auto-generate brackets?",
      a: "You can select established formats (single/double elimination, round robin, ladder, season, points) and enter matches and scores today. Auto-generated bracket trees and advanced seeding are on the roadmap.",
    },
  ];

  const jsonLd = [
    buildSoftwareApplicationJsonLd({
      name: page.title,
      description: page.description,
      path,
    }),
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Software", path: "/software/bar-tournament-software" },
      { name: page.heroTitle, path },
    ]),
    buildFaqPageJsonLd(faqs),
  ];

  return (
    <LeaguePourDiscoveryLanding
      kicker="Venue software"
      heroTitle={page.heroTitle}
      heroIntro={page.heroIntro}
      primaryCta={{ href: "/signup/venue", label: "Create your venue" }}
      secondaryCta={{ href: "/pricing", label: "See pricing" }}
      venues={venues}
      competitions={competitions}
      whyLeaguePour={{
        title: "Why LeaguePour",
        items: [
          "Venue-first — not a hobby bracket toy",
          "Paid signups, QR codes, and public venue hubs",
          "Local SEO and city/game discovery pages",
          "Campaigns to bring past players back",
        ],
      }}
      formatSection={DEFAULT_FORMAT_SECTION}
      comparison={{
        title: "LeaguePour vs generic tournament software",
        intro: "Generic bracket tools organize matchups. LeaguePour helps venues fill the room — with bracket automation improving over time.",
        rows: CORE_COMPARISON_ROWS,
      }}
      faqs={faqs}
      relatedLinks={[
        { href: page.legacyPath, label: "Full product page" },
        { href: "/features/tournaments", label: "Tournament features" },
        ...(game ? [{ href: game.findPath, label: game.patronHeadline }] : []),
        { href: "/compare/challonge", label: "vs Challonge" },
      ]}
      sponsorPromo={FEATURE_SPONSOR_PROMO}
      revenuePromo={ENTRY_FEE_REVENUE_PROMO}
      leagueNightPromo={PROMOTE_LEAGUE_PROMO}
      reactivationPromo={BRING_PLAYERS_BACK_PROMO}
      upgradePromo={UPGRADE_PROMO}
      roadmap={BRACKET_ROADMAP_SECTION}
      jsonLdGraphs={jsonLd}
    />
  );
}
