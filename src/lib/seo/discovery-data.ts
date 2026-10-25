import type { CompetitionKind } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { getPublicSiteUrl } from "@/lib/site-url";
import type { OutreachCityRecord } from "@/lib/seo/outreach-city-slugs";
import { isPlaceholderCompetition } from "@/lib/seo/is-placeholder-competition";

const ACTIVE_STATUSES = ["SIGNUP_OPEN", "PUBLISHED", "IN_PROGRESS"] as const;

export type DiscoveryVenueRow = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  state: string | null;
  competitionCount: number;
  venueUrl: string;
};

export type DiscoveryCompetitionRow = {
  id: string;
  title: string;
  slug: string;
  kind: CompetitionKind;
  startAt: Date;
  endAt: Date;
  entryFeeCents: number;
  entryFeeCurrency: string;
  status: string;
  venueName: string;
  venueSlug: string;
  venueCity: string | null;
  signupUrl: string;
};

function cityWhere(city: OutreachCityRecord) {
  return {
    isDisabled: false,
    city: { contains: city.name, mode: "insensitive" as const },
    state: { equals: city.state, mode: "insensitive" as const },
  };
}

/**
 * Content-based indexing for discovery pages (city, city+game, /find/<game>): a page is worth
 * indexing only when it actually lists something a player can sign up for - at least one active,
 * upcoming competition at an enabled venue that isn't a placeholder ("Test", "Demo"...). A venue
 * profile with nothing coming up, or a placeholder event, doesn't make a city page useful. Pages
 * stay reachable either way (noindex,follow); nothing is hidden from venues or players, and the
 * page flips to indexable on its own as soon as a real listing appears. The sitemap uses the same
 * rule so it never lists a URL the page itself marks noindex.
 */
async function indexableCompetitions(where: { city?: OutreachCityRecord; kind?: CompetitionKind } = {}) {
  const now = new Date();
  const rows = await prisma.competition.findMany({
    where: {
      status: { in: [...ACTIVE_STATUSES] },
      OR: [{ signupCloseAt: { gte: now } }, { startAt: { gte: now } }],
      ...(where.kind ? { kind: where.kind } : {}),
      venue: where.city ? cityWhere(where.city) : { isDisabled: false },
    },
    select: { title: true, slug: true, kind: true, venue: { select: { city: true, state: true } } },
    take: 5000,
  });
  return rows.filter((c) => !isPlaceholderCompetition(c));
}

export async function hasIndexableListings(where: { city?: OutreachCityRecord; kind?: CompetitionKind }): Promise<boolean> {
  try {
    return (await indexableCompetitions(where)).length > 0;
  } catch {
    return false;
  }
}

export async function fetchDiscoveryVenuesForCity(
  city: OutreachCityRecord,
  kind?: CompetitionKind,
  take = 24,
): Promise<DiscoveryVenueRow[]> {
  const base = getPublicSiteUrl();
  try {
    const venues = await prisma.venue.findMany({
      where: {
        ...cityWhere(city),
        ...(kind
          ? {
              competitions: {
                some: {
                  kind,
                  status: { in: [...ACTIVE_STATUSES] },
                },
              },
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        state: true,
        _count: {
          select: {
            competitions: {
              where: {
                status: { in: [...ACTIVE_STATUSES] },
                ...(kind ? { kind } : {}),
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
      take,
    });

    return venues.map((v) => ({
      id: v.id,
      name: v.name,
      slug: v.slug,
      city: v.city,
      state: v.state,
      competitionCount: v._count.competitions,
      venueUrl: `${base}/v/${v.slug}`,
    }));
  } catch {
    return [];
  }
}

export async function fetchDiscoveryCompetitionsForCity(
  city: OutreachCityRecord,
  kind?: CompetitionKind,
  take = 24,
): Promise<DiscoveryCompetitionRow[]> {
  const base = getPublicSiteUrl();
  const now = new Date();
  try {
    const rows = await prisma.competition.findMany({
      where: {
        status: { in: [...ACTIVE_STATUSES] },
        venue: cityWhere(city),
        ...(kind ? { kind } : {}),
        OR: [{ signupCloseAt: { gte: now } }, { startAt: { gte: now } }],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        kind: true,
        startAt: true,
        endAt: true,
        entryFeeCents: true,
        entryFeeCurrency: true,
        status: true,
        venue: { select: { name: true, slug: true, city: true } },
      },
      orderBy: { startAt: "asc" },
      take,
    });

    return rows.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      kind: c.kind,
      startAt: c.startAt,
      endAt: c.endAt,
      entryFeeCents: c.entryFeeCents,
      entryFeeCurrency: c.entryFeeCurrency,
      status: c.status,
      venueName: c.venue.name,
      venueSlug: c.venue.slug,
      venueCity: c.venue.city,
      signupUrl: `${base}/c/${c.venue.slug}/${c.slug}`,
    }));
  } catch {
    return [];
  }
}

/** Nationwide patron discovery - real published rows only. */
export async function fetchDiscoveryCompetitionsForKind(
  kind: CompetitionKind,
  take = 32,
): Promise<DiscoveryCompetitionRow[]> {
  const base = getPublicSiteUrl();
  const now = new Date();
  try {
    const rows = await prisma.competition.findMany({
      where: {
        kind,
        status: { in: [...ACTIVE_STATUSES] },
        venue: { isDisabled: false },
        OR: [{ signupCloseAt: { gte: now } }, { startAt: { gte: now } }],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        kind: true,
        startAt: true,
        endAt: true,
        entryFeeCents: true,
        entryFeeCurrency: true,
        status: true,
        venue: { select: { name: true, slug: true, city: true, state: true } },
      },
      orderBy: { startAt: "asc" },
      take,
    });

    return rows.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      kind: c.kind,
      startAt: c.startAt,
      endAt: c.endAt,
      entryFeeCents: c.entryFeeCents,
      entryFeeCurrency: c.entryFeeCurrency,
      status: c.status,
      venueName: c.venue.name,
      venueSlug: c.venue.slug,
      venueCity: c.venue.city,
      signupUrl: `${base}/c/${c.venue.slug}/${c.slug}`,
    }));
  } catch {
    return [];
  }
}

export async function fetchDiscoveryVenuesForKind(
  kind: CompetitionKind,
  take = 24,
): Promise<DiscoveryVenueRow[]> {
  const base = getPublicSiteUrl();
  try {
    const venues = await prisma.venue.findMany({
      where: {
        isDisabled: false,
        competitions: {
          some: { kind, status: { in: [...ACTIVE_STATUSES] } },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        state: true,
        _count: {
          select: {
            competitions: {
              where: { kind, status: { in: [...ACTIVE_STATUSES] } },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take,
    });

    return venues.map((v) => ({
      id: v.id,
      name: v.name,
      slug: v.slug,
      city: v.city,
      state: v.state,
      competitionCount: v._count.competitions,
      venueUrl: `${base}/v/${v.slug}`,
    }));
  } catch {
    return [];
  }
}

/** Cities with at least one indexable listing (see indexableCompetitions), regardless of game. */
export async function getCitySlugsWithRealData(): Promise<Set<string>> {
  const { getOutreachCitySlug } = await import("@/lib/seo/outreach-city-slugs");
  const slugs = new Set<string>();
  try {
    for (const c of await indexableCompetitions()) {
      if (c.venue.city && c.venue.state) slugs.add(getOutreachCitySlug(c.venue.city, c.venue.state));
    }
  } catch {
    return new Set();
  }
  return slugs;
}

/** Sitemap helper: city-only discovery paths that pass the indexing rule. */
export async function getSitemapCityOnlyPaths(
  prefixes: ("bar-leagues" | "events" | "bars")[],
  citySlugs: string[],
): Promise<string[]> {
  const withData = await getCitySlugsWithRealData();
  const paths: string[] = [];
  for (const slug of citySlugs) {
    if (!withData.has(slug)) continue;
    for (const prefix of prefixes) paths.push(`/${prefix}/${slug}`);
  }
  return paths;
}

/** Sitemap helper: city+game discovery paths that pass the indexing rule. */
export async function getSitemapCityGamePaths(
  prefixes: ("bar-leagues" | "events" | "bars")[],
): Promise<string[]> {
  const { getOutreachCitySlug, getOutreachCityBySlug } = await import("@/lib/seo/outreach-city-slugs");
  const { getDiscoveryGameByKind } = await import("@/lib/seo/discovery-games");

  const paths = new Set<string>();
  try {
    for (const c of await indexableCompetitions()) {
      if (!c.venue.city || !c.venue.state) continue;
      const citySlug = getOutreachCitySlug(c.venue.city, c.venue.state);
      // City pages only exist for the fixed outreach-city list (render-city-discovery.tsx 404s
      // anything else), so a venue in an unlisted city (e.g. Carmel, IN) must not add sitemap
      // URLs - they were 404s that Search Console reported as "Not found (404)".
      if (!getOutreachCityBySlug(citySlug)) continue;
      const game = getDiscoveryGameByKind(c.kind);
      if (!game) continue;
      for (const prefix of prefixes) paths.add(`/${prefix}/${citySlug}/${game.slug}`);
    }
  } catch {
    return [];
  }

  return [...paths];
}
