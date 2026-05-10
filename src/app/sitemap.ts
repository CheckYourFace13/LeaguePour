import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { getPublicSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getPublicSiteUrl();
  let venues: { slug: string; updatedAt: Date }[] = [];
  let competitions: { slug: string; updatedAt: Date; venue: { slug: string } }[] = [];
  try {
    [venues, competitions] = await Promise.all([
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
    ]);
  } catch {
    venues = [];
    competitions = [];
  }

  const staticPages: MetadataRoute.Sitemap = [
    "",
    "/features",
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
    "/bar-leagues/chicago",
    "/bar-leagues/nashville",
    "/bar-leagues/austin",
    "/bar-leagues/denver",
    "/bar-leagues/dallas",
    "/bar-leagues/houston",
    "/bar-leagues/phoenix",
    "/bar-leagues/philadelphia",
    "/bar-leagues/portland",
    "/bar-leagues/seattle",
    "/bar-leagues/atlanta",
    "/bar-leagues/miami",
    "/bar-leagues/boston",
    "/bar-leagues/las-vegas",
    "/bar-leagues/new-orleans",
    "/bar-leagues/pittsburgh",
    "/bar-leagues/kansas-city",
    "/bar-leagues/minneapolis",
    "/bar-leagues/columbus",
    "/bar-leagues/indianapolis",
    "/bar-leagues/st-louis",
    "/bar-leagues/milwaukee",
    "/bar-leagues/charlotte",
    "/bar-leagues/san-antonio",
    "/bar-leagues/detroit",
    "/legal/terms",
    "/legal/privacy",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
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
