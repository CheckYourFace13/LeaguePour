import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { getPublicSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getPublicSiteUrl();
  const [venues, competitions] = await Promise.all([
    prisma.venue.findMany({ select: { slug: true, updatedAt: true }, take: 2000 }),
    prisma.competition.findMany({
      where: { status: { in: ["SIGNUP_OPEN", "PUBLISHED", "IN_PROGRESS"] } },
      select: { slug: true, updatedAt: true, venue: { select: { slug: true } } },
      take: 5000,
    }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    "",
    "/features",
    "/for-venues",
    "/for-players",
    "/pricing",
    "/faq",
    "/how-it-works",
    "/contact",
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
