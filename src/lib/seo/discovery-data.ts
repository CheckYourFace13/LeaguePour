import type { CompetitionKind } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { getPublicSiteUrl } from "@/lib/site-url";
import type { OutreachCityRecord } from "@/lib/seo/outreach-city-slugs";

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

/** Nationwide patron discovery — real published rows only. */
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

/** Sitemap helper: discovery paths for city+game pairs with real venue or competition data. */
export async function getSitemapCityGamePaths(
  prefixes: ("bar-leagues" | "events" | "bars")[],
): Promise<string[]> {
  const { getOutreachCitySlug } = await import("@/lib/seo/outreach-city-slugs");
  const { getDiscoveryGameByKind } = await import("@/lib/seo/discovery-games");

  const paths = new Set<string>();
  try {
    const [venues, competitions] = await Promise.all([
      prisma.venue.findMany({
        where: { isDisabled: false, city: { not: null }, state: { not: null } },
        select: { city: true, state: true, competitions: { select: { kind: true }, take: 1 } },
        take: 2000,
      }),
      prisma.competition.findMany({
        where: {
          status: { in: [...ACTIVE_STATUSES] },
          venue: { isDisabled: false, city: { not: null }, state: { not: null } },
        },
        select: { kind: true, venue: { select: { city: true, state: true } } },
        take: 5000,
      }),
    ]);

    const addPair = (city: string, state: string, kind?: CompetitionKind) => {
      const citySlug = getOutreachCitySlug(city, state);
      const kinds = kind ? [kind] : [];
      for (const k of kinds.length ? kinds : []) {
        const game = getDiscoveryGameByKind(k);
        if (!game) continue;
        for (const prefix of prefixes) {
          paths.add(`/${prefix}/${citySlug}/${game.slug}`);
        }
      }
    };

    for (const v of venues) {
      if (!v.city || !v.state) continue;
      for (const c of v.competitions) {
        addPair(v.city, v.state, c.kind);
      }
    }

    for (const c of competitions) {
      if (c.venue.city && c.venue.state) addPair(c.venue.city, c.venue.state, c.kind);
    }
  } catch {
    return [];
  }

  return [...paths];
}
