import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { getAllCompareSlugs } from "@/lib/seo/compare-pages";
import { getSitemapCityGamePaths } from "@/lib/seo/discovery-data";
import { getAllFindSlugs } from "@/lib/seo/render-find-page";
import { getAllSoftwareSlugs } from "@/lib/seo/render-software-page";
import { getAllOutreachCitySlugs } from "@/lib/seo/outreach-city-slugs";
import { getPublicSiteUrl } from "@/lib/site-url";


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getPublicSiteUrl();
  const citySlugs = getAllOutreachCitySlugs();

  let venues: { slug: string; updatedAt: Date }[] = [];
  let competitions: { slug: string; updatedAt: Date; venue: { slug: string } }[] = [];
  let cityGamePaths: string[] = [];

  try {
    [venues, competitions, cityGamePaths] = await Promise.all([
      prisma.venue.findMany({
        where: { isDisabled: false },
        select: { slug: true, updatedAt: true },
        take: 2000,
      }),
      prisma.competition.findMany({
        where: {
          status: { in: ["SIGNUP_OPEN", "PUBLISHED", "IN_PROGRESS"] },
          venue: { isDisabled: false },
        },
        select: { slug: true, updatedAt: true, venue: { select: { slug: true } } },
        take: 5000,
      }),
      getSitemapCityGamePaths(["bar-leagues", "events", "bars"]),
    ]);
  } catch {
    venues = [];
    competitions = [];
    cityGamePaths = [];
  }

  const discoveryPrefixes = ["bar-leagues", "events", "bars"] as const;
  const cityDiscoveryPaths = discoveryPrefixes.flatMap((prefix) =>
    citySlugs.map((s) => `/${prefix}/${s}`),
  );

  const staticPages: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/features",
    "/features/tournaments",
    "/for-venues",
    "/for-players",
    "/pricing",
    "/faq",
    "/how-it-works",
    "/contact",
    "/dart-league-software",
    "/cornhole-tournament-software",
    "/bar-trivia-software",
    "/pool-league-management",
    "/shuffleboard-league-software",
    "/poker-tournament-software",
    "/music-bingo-software",
    "/euchre-tournament-software",
    ...getAllSoftwareSlugs().map((s) => `/software/${s}`),
    ...getAllCompareSlugs().map((s) => `/compare/${s}`),
    ...getAllFindSlugs().map((s) => `/find/${s}`),
    "/guides",
    "/guides/how-to-run-a-dart-league-at-your-bar",
    "/guides/cornhole-tournament-ideas-for-bars",
    "/guides/bar-trivia-night-guide",
    "/guides/how-to-collect-entry-fees-at-your-bar",
    "/guides/bar-competition-ideas",
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
    lastModified: new Date(),
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

  return [...staticPages, ...venuePages, ...compPages];
}
