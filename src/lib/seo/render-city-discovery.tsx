import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  LeaguePourDiscoveryLanding,
  type LeaguePourDiscoveryLandingProps,
} from "@/components/seo/LeaguePourDiscoveryLanding";
import { DISCOVERY_GAMES, getDiscoveryGameBySlug } from "@/lib/seo/discovery-games";
import {
  fetchDiscoveryCompetitionsForCity,
  fetchDiscoveryVenuesForCity,
} from "@/lib/seo/discovery-data";
import {
  buildBreadcrumbJsonLd,
  buildEventJsonLd,
  buildFaqPageJsonLd,
  buildItemListJsonLd,
} from "@/lib/seo/json-ld-builders";
import {
  getAllOutreachCityRecords,
  getAllOutreachCitySlugs,
  getBarsDescription,
  getOutreachCityBySlug,
} from "@/lib/seo/outreach-city-slugs";
import {
  BRACKET_ROADMAP_SECTION,
  BRING_PLAYERS_BACK_PROMO,
  CORE_COMPARISON_ROWS,
  DEFAULT_FORMAT_SECTION,
  discoveryPath,
  ENTRY_FEE_REVENUE_PROMO,
  FEATURE_SPONSOR_PROMO,
  PROMOTE_LEAGUE_PROMO,
  UPGRADE_PROMO,
  VENUE_WHY_ITEMS,
  type DiscoveryRoutePrefix,
} from "@/lib/seo/discovery-shared";
import { discoveryRobots } from "@/lib/seo/should-index-discovery-page";

const PREFIX_COPY: Record<
  DiscoveryRoutePrefix,
  { kicker: string; venueNoun: string; playerCta: string }
> = {
  "bar-leagues": {
    kicker: "Bar leagues near you",
    venueNoun: "bar leagues & tournaments",
    playerCta: "Find competitions to join",
  },
  events: {
    kicker: "Bar events near you",
    venueNoun: "competitions & events",
    playerCta: "Browse upcoming events",
  },
  bars: {
    kicker: "Partner bars near you",
    venueNoun: "partner bars & taprooms",
    playerCta: "Find a partner bar",
  },
};

export function cityDiscoveryStaticParams(gameSlug?: string) {
  const cities = getAllOutreachCitySlugs();
  if (!gameSlug) return cities.map((city) => ({ city }));
  return cities.map((city) => ({ city, game: gameSlug }));
}

export function cityGameDiscoveryStaticParams() {
  const cities = getAllOutreachCitySlugs();
  const games = DISCOVERY_GAMES.map((g) => g.slug);
  return cities.flatMap((city) => games.map((game) => ({ city, game })));
}

export async function buildCityDiscoveryMetadata(
  prefix: DiscoveryRoutePrefix,
  citySlug: string,
  gameSlug?: string,
): Promise<Metadata> {
  const city = getOutreachCityBySlug(citySlug);
  if (!city) return {};
  const game = gameSlug ? getDiscoveryGameBySlug(gameSlug) : null;
  if (gameSlug && !game) return {};

  const path = discoveryPath(prefix, citySlug, gameSlug);
  const bars = getBarsDescription(city);
  const title = game
    ? `${game.pluralLabel} in ${city.name}, ${city.state} | LeaguePour`
    : `${PREFIX_COPY[prefix].venueNoun} in ${city.name} | LeaguePour`;
  const description = game
    ? `Find ${game.pluralLabel.toLowerCase()} at ${bars}. Real venue listings and upcoming signups on LeaguePour - bar tournament software with paid signups, QR codes, and local discovery.`
    : `Find dart leagues, cornhole tournaments, trivia nights, and pool leagues at ${bars}. Bar tournament software, league management, paid signups, QR codes, venue hubs, and local event discovery.`;

  const [venues, competitions] = await Promise.all([
    fetchDiscoveryVenuesForCity(city, game?.kind, 1),
    fetchDiscoveryCompetitionsForCity(city, game?.kind, 1),
  ]);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
    robots: discoveryRobots({
      venueCount: venues.length,
      competitionCount: competitions.length,
    }),
  };
}

export async function CityDiscoveryPage({
  prefix,
  citySlug,
  gameSlug,
}: {
  prefix: DiscoveryRoutePrefix;
  citySlug: string;
  gameSlug?: string;
}) {
  const city = getOutreachCityBySlug(citySlug);
  if (!city) notFound();
  const game = gameSlug ? getDiscoveryGameBySlug(gameSlug) : null;
  if (gameSlug && !game) notFound();

  const path = discoveryPath(prefix, citySlug, gameSlug);
  const bars = getBarsDescription(city);
  const copy = PREFIX_COPY[prefix];

  const [venues, competitions] = await Promise.all([
    fetchDiscoveryVenuesForCity(city, game?.kind),
    fetchDiscoveryCompetitionsForCity(city, game?.kind),
  ]);

  const gameLinks = DISCOVERY_GAMES.map((g) => ({
    href: discoveryPath(prefix, citySlug, g.slug),
    label: g.pluralLabel,
  }));

  const otherCities = getAllOutreachCityRecords()
    .filter((c) => c.slug !== citySlug)
    .slice(0, 8);

  const faqs = [
    {
      q: game
        ? `Where can I find ${game.pluralLabel.toLowerCase()} in ${city.name}?`
        : `What bar competitions run in ${city.name}?`,
      a: game
        ? `Browse partner venues and upcoming ${game.pluralLabel.toLowerCase()} listed on this page - all data comes from real LeaguePour venues, not fabricated listings.`
        : `LeaguePour lists real partner venues and open signups in ${city.name}. Filter by game type or browse upcoming competitions.`,
    },
    {
      q: `How do I run a league at my ${city.name} bar?`,
      a: "Create a venue, connect Stripe for paid entry, publish your competition, and share the signup link or QR code. Most venues launch in under ten minutes.",
    },
    {
      q: "How is LeaguePour different from generic bracket sites?",
      a: "Generic bracket tools organize matchups. LeaguePour helps venues fill the room with paid signups, venue hubs, local SEO, and repeat-player campaigns. Bracket automation is improving; manual matches and standings work today.",
    },
  ];

  // No standalone /bars, /bar-leagues, or /events hub page exists at the bare prefix - that
  // intermediate node used to point rich-result consumers at a 404. Dropped rather than
  // inventing a hub page just to backfill a breadcrumb link.
  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: city.name, path: discoveryPath(prefix, citySlug) },
    ...(game ? [{ name: game.pluralLabel, path }] : []),
  ]);

  const itemList = buildItemListJsonLd({
    name: game ? `${game.pluralLabel} in ${city.name}` : `Bar leagues in ${city.name}`,
    description: `Partner venues and events in ${city.name}, ${city.state}.`,
    path,
    items: [
      ...venues.map((v) => ({ name: v.name, url: `/v/${v.slug}` })),
      ...competitions.map((c) => ({
        name: c.title,
        url: `/c/${c.venueSlug}/${c.slug}`,
      })),
    ],
  });

  const eventGraphs = competitions.slice(0, 10).map((c) =>
    buildEventJsonLd({
      name: c.title,
      description: `${c.title} at ${c.venueName}`,
      startDate: c.startAt.toISOString(),
      endDate: c.endAt.toISOString(),
      url: `/c/${c.venueSlug}/${c.slug}`,
      locationName: c.venueName,
      price: c.entryFeeCents > 0 ? c.entryFeeCents / 100 : undefined,
      currency: c.entryFeeCurrency,
    }),
  );

  const props: LeaguePourDiscoveryLandingProps = {
    kicker: game ? `${game.pluralLabel} | ${city.name}` : copy.kicker,
    heroTitle: game
      ? `${game.pluralLabel} in ${city.name}, ${city.state}`
      : `Bar leagues & tournaments in ${city.name}`,
    heroIntro: game
      ? `Find ${game.pluralLabel.toLowerCase()} at ${bars}. Join open signups or run your own ${game.label.toLowerCase()} on LeaguePour.`
      : `Dart leagues, cornhole tournaments, trivia nights, and pool leagues at ${bars}. LeaguePour is the venue platform and public discovery engine for local bar competitions.`,
    locationLine: game
      ? `${city.name}, ${city.state} | ${game.pluralLabel}`
      : `${city.name}, ${city.state}`,
    primaryCta: { href: "/signup/player", label: copy.playerCta },
    secondaryCta: { href: "/signup/venue", label: "Run events at your bar" },
    venues,
    competitions,
    whyLeaguePour: {
      title: "Why venues choose LeaguePour",
      items: VENUE_WHY_ITEMS,
    },
    formatSection: DEFAULT_FORMAT_SECTION,
    comparison: {
      title: "LeaguePour vs generic tournament software",
      intro:
        "Generic bracket tools organize matchups. LeaguePour helps venues fill the room with signups, payments, and repeat traffic.",
      rows: CORE_COMPARISON_ROWS,
    },
    faqs,
    gameLinks: game ? undefined : gameLinks,
    relatedLinks: [
      ...otherCities.map((c) => ({
        href: discoveryPath(prefix, c.slug),
        label: `${c.name} bar leagues`,
      })),
      { href: "/features/tournaments", label: "Tournament features" },
      { href: "/pricing", label: "Pricing" },
    ],
    emptyState: {
      title: game
        ? `No ${game.pluralLabel.toLowerCase()} listed yet in ${city.name}`
        : `No partner venues listed yet in ${city.name}`,
      body: `Be the first ${game ? `to run ${game.pluralLabel.toLowerCase()}` : "bar"} in ${city.name} on LeaguePour.`,
      ctaHref: "/signup/venue",
      ctaLabel: `Add your ${city.name} venue`,
    },
    sponsorPromo: FEATURE_SPONSOR_PROMO,
    revenuePromo: ENTRY_FEE_REVENUE_PROMO,
    leagueNightPromo: PROMOTE_LEAGUE_PROMO,
    reactivationPromo: BRING_PLAYERS_BACK_PROMO,
    upgradePromo: UPGRADE_PROMO,
    roadmap: BRACKET_ROADMAP_SECTION,
    jsonLdGraphs: [breadcrumbs, itemList, buildFaqPageJsonLd(faqs), ...eventGraphs],
  };

  return <LeaguePourDiscoveryLanding {...props} />;
}
