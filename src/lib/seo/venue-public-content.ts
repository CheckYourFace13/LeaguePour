import { prisma } from "@/lib/db";
import { isPlaceholderCompetition } from "@/lib/seo/is-placeholder-competition";

/**
 * Statuses that represent a real public event - upcoming, running, or finished. Drafts and
 * archived records don't count. A venue hub with at least one such (non-placeholder) competition
 * has meaningful public content; one without is just a profile shell, so it stays reachable for
 * the venue and its players but is noindexed and kept out of the sitemap.
 */
export const PUBLIC_COMPETITION_STATUSES = ["PUBLISHED", "SIGNUP_OPEN", "SIGNUP_CLOSED", "IN_PROGRESS", "COMPLETED"] as const;

export async function venueHasPublicContent(venueId: string): Promise<boolean> {
  const rows = await prisma.competition.findMany({
    where: { venueId, status: { in: [...PUBLIC_COMPETITION_STATUSES] } },
    select: { title: true, slug: true },
    take: 25,
  });
  return rows.some((c) => !isPlaceholderCompetition(c));
}
