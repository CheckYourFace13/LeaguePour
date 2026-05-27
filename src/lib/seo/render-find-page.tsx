import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LeaguePourProductMockup } from "@/components/marketing/LeaguePourProductMockup";
import { LeaguePourDiscoveryLanding } from "@/components/seo/LeaguePourDiscoveryLanding";
import { DISCOVERY_GAMES, getDiscoveryGameBySlug } from "@/lib/seo/discovery-games";
import {
  fetchDiscoveryCompetitionsForKind,
  fetchDiscoveryVenuesForKind,
} from "@/lib/seo/discovery-data";
import {
  buildBreadcrumbJsonLd,
  buildFaqPageJsonLd,
  buildItemListJsonLd,
} from "@/lib/seo/json-ld-builders";
import { marketingImages } from "@/lib/marketing-images";
import { getAllOutreachCitySlugs } from "@/lib/seo/outreach-city-slugs";
import {
  BRACKET_ROADMAP_SECTION,
  BRING_PLAYERS_BACK_PROMO,
  CORE_COMPARISON_ROWS,
  DEFAULT_FORMAT_SECTION,
  ENTRY_FEE_REVENUE_PROMO,
  FEATURE_SPONSOR_PROMO,
  PROMOTE_LEAGUE_PROMO,
  UPGRADE_PROMO,
  VENUE_WHY_ITEMS,
} from "@/lib/seo/discovery-shared";
import { discoveryRobots } from "@/lib/seo/should-index-discovery-page";

const FIND_SLUG_MAP: Record<string, string> = {
  "dart-leagues": "darts",
  "cornhole-tournaments": "cornhole",
  "trivia-nights": "trivia",
  "euchre-leagues": "euchre",
  "pool-tournaments": "pool",
  "poker-nights": "poker",
  "shuffleboard-leagues": "shuffleboard",
};

export function getAllFindSlugs(): string[] {
  return Object.keys(FIND_SLUG_MAP);
}

export function resolveFindGame(findSlug: string) {
  const gameSlug = FIND_SLUG_MAP[findSlug];
  if (!gameSlug) return null;
  return getDiscoveryGameBySlug(gameSlug);
}

export async function buildFindMetadata(findSlug: string): Promise<Metadata> {
  const game = resolveFindGame(findSlug);
  if (!game) return {};
  const path = game.findPath;
  const [venues, competitions] = await Promise.all([
    fetchDiscoveryVenuesForKind(game.kind, 1),
    fetchDiscoveryCompetitionsForKind(game.kind, 1),
  ]);
  const title = `${game.patronHeadline} | LeaguePour`;
  const description = `Discover real ${game.pluralLabel.toLowerCase()} at partner bars. Bar tournament software with paid signups, QR codes, venue hubs, and local event discovery.`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
    robots: discoveryRobots({
      venueCount: venues.length,
      competitionCount: competitions.length,
      hasEditorialContent: true,
    }),
  };
}

export async function FindDiscoveryPage({ findSlug }: { findSlug: string }) {
  const game = resolveFindGame(findSlug);
  if (!game) notFound();

  const [venues, competitions] = await Promise.all([
    fetchDiscoveryVenuesForKind(game.kind),
    fetchDiscoveryCompetitionsForKind(game.kind),
  ]);

  const citySlugs = getAllOutreachCitySlugs().slice(0, 8);
  const gameLinks = DISCOVERY_GAMES.filter((g) => g.slug !== game.slug).map((g) => ({
    href: g.findPath,
    label: g.patronHeadline,
  }));

  const faqs = [
    {
      q: `How do I find ${game.pluralLabel.toLowerCase()} near me?`,
      a: `Browse partner venues and upcoming competitions on this page, or visit city pages for ${game.pluralLabel.toLowerCase()} in your area. All listings are real LeaguePour venues — nothing fabricated.`,
    },
    {
      q: "Do I need an app?",
      a: "No. Register from your phone browser on the competition signup page.",
    },
    {
      q: "I run a bar — how do I get listed?",
      a: "Sign up on LeaguePour, publish a competition, and your hub appears in discovery.",
    },
  ];

  const path = game.findPath;
  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Find events", path: game.findPath },
    ]),
    buildItemListJsonLd({
      name: game.patronHeadline,
      description: `Partner venues and ${game.pluralLabel.toLowerCase()} on LeaguePour.`,
      path,
      items: [
        ...venues.map((v) => ({ name: v.name, url: `/v/${v.slug}` })),
        ...competitions.map((c) => ({
          name: c.title,
          url: `/c/${c.venueSlug}/${c.slug}`,
        })),
      ],
    }),
    buildFaqPageJsonLd(faqs),
  ];

  return (
    <LeaguePourDiscoveryLanding
      kicker="Player discovery"
      heroTitle={game.patronHeadline}
      heroIntro={`Browse partner bars and upcoming ${game.pluralLabel.toLowerCase()} on LeaguePour — the public discovery engine for local bar competitions. Every venue and event listed here is real.`}
      primaryCta={{ href: "/signup/player", label: "Join as a player" }}
      secondaryCta={{ href: "/signup/venue", label: "Venue signup" }}
      venues={venues}
      competitions={competitions}
      whyLeaguePour={{ title: "Why players use LeaguePour", items: VENUE_WHY_ITEMS }}
      formatSection={DEFAULT_FORMAT_SECTION}
      comparison={{
        title: "LeaguePour vs generic tournament software",
        intro: "Generic bracket tools organize matchups. LeaguePour helps you find real bar events with open signups.",
        rows: CORE_COMPARISON_ROWS,
      }}
      faqs={faqs}
      gameLinks={gameLinks}
      relatedLinks={[
        ...citySlugs.map((s) => ({
          href: `/bar-leagues/${s}/${game.slug}`,
          label: `${game.pluralLabel} by city`,
        })),
        { href: game.softwarePath, label: `${game.label} software for venues` },
        { href: "/player/discover", label: "Player discover" },
      ]}
      emptyState={{
        title: `No ${game.pluralLabel.toLowerCase()} listed yet`,
        body: `Know a bar that runs ${game.pluralLabel.toLowerCase()}? Ask them to publish on LeaguePour, or create a venue if you are the operator.`,
        ctaHref: "/signup/venue",
        ctaLabel: "Start hosting events",
      }}
      sponsorPromo={FEATURE_SPONSOR_PROMO}
      revenuePromo={ENTRY_FEE_REVENUE_PROMO}
      leagueNightPromo={PROMOTE_LEAGUE_PROMO}
      reactivationPromo={BRING_PLAYERS_BACK_PROMO}
      upgradePromo={UPGRADE_PROMO}
      roadmap={BRACKET_ROADMAP_SECTION}
      heroImage={findSlug === "dart-leagues" ? marketingImages.playerDiscovery : undefined}
      afterHero={
        findSlug === "dart-leagues" ? (
          <LeaguePourProductMockup compact className="mt-12 max-w-3xl" />
        ) : undefined
      }
      jsonLdGraphs={jsonLd}
    />
  );
}
