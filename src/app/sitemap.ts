import type { MetadataRoute } from "next";
import { isPlaceholderCompetition } from "@/lib/seo/is-placeholder-competition";
import { getManagedFeed } from "@/lib/gravyblock-managed";
import { prisma } from "@/lib/db";
import { getAllCompareSlugs } from "@/lib/seo/compare-pages";
import { getSitemapCityGamePaths, getSitemapCityOnlyPaths } from "@/lib/seo/discovery-data";
import { getIndexableFindPaths } from "@/lib/seo/render-find-page";
import { getAllSoftwareSlugs, REDIRECTED_SOFTWARE_SLUGS } from "@/lib/seo/render-software-page";
import { PUBLIC_COMPETITION_STATUSES } from "@/lib/seo/venue-public-content";
import { getAllOutreachCitySlugs } from "@/lib/seo/outreach-city-slugs";
import { getPublicSiteUrl } from "@/lib/site-url";

// Computed once at module load (i.e. once per deploy/instance start), not per-request - static
// pages only actually change on a deploy, so their lastmod should reflect that, not report "just
// modified" to every crawler hit that happens to land on a warm instance.
const BUILD_TIME = new Date();

// Explicit short revalidate window, same reasoning as src/app/robots.ts - dynamic venue/
// competition data means this route was never subject to the far-future default anyway, but
// making it explicit removes any doubt after the CDN-staleness incident.
export const revalidate = 300; // short: content-engine guides publish between deploys

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getPublicSiteUrl();
  const citySlugs = getAllOutreachCitySlugs();

  let venues: { slug: string; updatedAt: Date }[] = [];
  let competitions: { slug: string; title: string; updatedAt: Date; venue: { slug: string } }[] = [];
  let cityGamePaths: string[] = [];
  let cityDiscoveryPaths: string[] = [];

  const discoveryPrefixes = ["bar-leagues", "events", "bars"] as const;

  try {
    [venues, competitions, cityGamePaths, cityDiscoveryPaths] = await Promise.all([
      // Only venue hubs with real public competitions (see venue-public-content.ts); empty
      // profiles stay reachable but noindexed, so they're not listed here either.
      prisma.venue
        .findMany({
          where: { isDisabled: false, competitions: { some: { status: { in: [...PUBLIC_COMPETITION_STATUSES] } } } },
          select: {
            slug: true,
            updatedAt: true,
            competitions: { where: { status: { in: [...PUBLIC_COMPETITION_STATUSES] } }, select: { title: true, slug: true }, take: 25 },
          },
          take: 2000,
        })
        .then((rows) =>
          rows
            .filter((v) => v.competitions.some((c) => !isPlaceholderCompetition(c)))
            .map((v) => ({ slug: v.slug, updatedAt: v.updatedAt })),
        ),
      prisma.competition.findMany({
        where: {
          status: { in: ["SIGNUP_OPEN", "PUBLISHED", "IN_PROGRESS"] },
          venue: { isDisabled: false },
        },
        select: { slug: true, title: true, updatedAt: true, venue: { select: { slug: true } } },
        take: 5000,
      }).then((rows) => rows.filter((c) => !isPlaceholderCompetition(c))),
      getSitemapCityGamePaths(["bar-leagues", "events", "bars"]),
      getSitemapCityOnlyPaths([...discoveryPrefixes], citySlugs),
    ]);
  } catch {
    venues = [];
    competitions = [];
    cityGamePaths = [];
    cityDiscoveryPaths = [];
  }

  const findPaths = await getIndexableFindPaths().catch(() => [] as string[]);

  const staticPages: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/features",
    "/features/tournaments",
    "/for-venues",
    "/for-players",
    "/pricing",
    "/demo",
    "/faq",
    "/how-it-works",
    "/contact",
    "/dart-league-software",
    "/cornhole-tournament-software",
    "/bar-trivia-software",
    "/bar-league-standings",
    "/pool-league-management",
    "/shuffleboard-league-software",
    "/poker-tournament-software",
    "/music-bingo-software",
    "/euchre-tournament-software",
    ...getAllSoftwareSlugs().filter((s) => !REDIRECTED_SOFTWARE_SLUGS.has(s)).map((s) => `/software/${s}`),
    ...getAllCompareSlugs().map((s) => `/compare/${s}`),
    // Only /find pages with at least one real listing - empty ones are noindex (render-find-page.tsx).
    ...findPaths,
    "/tools",
    "/tools/single-elimination-bracket-generator",
    "/tools/round-robin-schedule-generator",
    "/tools/standings-calculator",
    "/guides",
    "/guides/how-to-run-a-dart-league-at-your-bar",
    "/guides/cornhole-tournament-ideas-for-bars",
    "/guides/bar-trivia-night-guide",
    "/guides/how-to-collect-entry-fees-at-your-bar",
    "/guides/bar-competition-ideas",
    "/guides/how-to-start-a-pool-league",
    "/guides/how-to-increase-bar-traffic-on-slow-nights",
    "/guides/round-robin-vs-single-elimination",
    "/guides/how-standings-and-points-work",
    "/guides/managing-no-shows-and-forfeits",
    "/guides/how-to-celebrate-the-end-of-a-league-season",
    "/history",
    "/history/darts",
    "/history/cornhole",
    "/history/billiards",
    "/history/trivia",
    "/history/shuffleboard",
    "/rules",
    ...cityDiscoveryPaths,
    ...cityGamePaths,
    "/legal/terms",
    "/legal/privacy",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: BUILD_TIME,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : path.includes("/compare/") || path.includes("/software/") ? 0.85 : 0.8,
  }));

  const venuePages = venues.map((v) => ({
    url: `${base}/v/${v.slug}`,
    lastModified: v.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const compPages = competitions.map((c) => ({
    url: `${base}/c/${c.venue.slug}/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  const managedItems = (await getManagedFeed())?.items ?? [];
  const managedPages: MetadataRoute.Sitemap = managedItems.map((i) => ({ url: `${base}/insights/${i.slug}`, lastModified: new Date(i.publishedAt), changeFrequency: "monthly" as const, priority: 0.6 }));

  const generatedGuides = await prisma.guide
    .findMany({ where: { brand: "LP", status: "PUBLISHED" }, select: { slug: true, dateModified: true, createdAt: true } })
    .catch(() => []);
  const generatedGuidePages: MetadataRoute.Sitemap = generatedGuides.map((g) => ({
    url: `${base}/guides/${g.slug}`,
    lastModified: g.dateModified ?? g.createdAt,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [...staticPages, ...venuePages, ...compPages, ...managedPages, ...generatedGuidePages];
}
