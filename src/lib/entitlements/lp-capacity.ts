import type { BillingPlan } from "@/generated/prisma/enums";
import { CompetitionStatus } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { ACTIVE_COMPETITION_LIMITS_BY_PLAN } from "@/lib/pricing";

/**
 * LeaguePour active-competition capacity.
 *
 * - Venues created before LP_FREE_ALLOWANCE_CUTOFF keep exactly the rule they signed up under:
 *   their billingPlan's limit whether or not they subscribe (a plan-less venue is STARTER = 2).
 *   That is what preserves existing free allowances and Rachel/Q's grandfathered access - no
 *   per-venue data is needed, and nothing an existing venue could do yesterday stops working.
 * - Venues created from the cutoff on get LP_FREE_ACTIVE_COMPETITIONS without a subscription and
 *   their plan's limit while the subscription is paid or in Stripe's payment-failure grace
 *   (past_due / unpaid - the same grace billingPlan already had: it stays until Stripe deletes
 *   the subscription). incomplete/incomplete_expired (first payment never succeeded), paused and
 *   canceled fall back to the free allowance.
 *
 * Capacity is only ever checked when something is about to become active. Nothing here
 * unpublishes, hides or deletes competitions that are already live.
 */
export const LP_FREE_ALLOWANCE_CUTOFF = new Date("2026-10-26T00:00:00Z");
export const LP_FREE_ACTIVE_COMPETITIONS = 1;

const CAPACITY_STATUSES = new Set(["active", "trialing", "past_due", "unpaid"]);

/** Statuses that hold a slot: live or about to be. Drafts and finished history never count. */
export const CAPACITY_COUNTED_STATUSES: CompetitionStatus[] = [
  CompetitionStatus.PUBLISHED,
  CompetitionStatus.SIGNUP_OPEN,
  CompetitionStatus.SIGNUP_CLOSED,
  CompetitionStatus.IN_PROGRESS,
];

export type CapacityVenue = {
  createdAt: Date;
  billingPlan: BillingPlan;
  subscriptionStatus: string | null;
};

export function isLegacyFreeAllowance(venue: Pick<CapacityVenue, "createdAt">): boolean {
  return venue.createdAt < LP_FREE_ALLOWANCE_CUTOFF;
}

export function hasPaidCapacity(status: string | null | undefined): boolean {
  return CAPACITY_STATUSES.has(status ?? "");
}

export function activeCompetitionLimit(venue: CapacityVenue): number {
  const planLimit = ACTIVE_COMPETITION_LIMITS_BY_PLAN[venue.billingPlan];
  if (isLegacyFreeAllowance(venue)) return planLimit;
  return hasPaidCapacity(venue.subscriptionStatus) ? planLimit : LP_FREE_ACTIVE_COMPETITIONS;
}

/**
 * Runs `fn` while holding a per-venue transaction lock, after checking there is a free slot.
 * Two simultaneous publishes for the same venue serialize here, so the second one sees the
 * first one's competition and can't push the venue over its limit. `excludeCompetitionId` is the
 * competition being published (an edit never counts itself).
 */
export async function withActiveCompetitionSlot<T>(
  venueId: string,
  opts: { excludeCompetitionId?: string },
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<{ ok: true; value: T } | { ok: false; limit: number; activeCount: number }> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`lp-capacity:${venueId}`}, 0))`;
    const venue = await tx.venue.findUnique({
      where: { id: venueId },
      select: { createdAt: true, billingPlan: true, subscriptionStatus: true },
    });
    if (!venue) return { ok: false as const, limit: 0, activeCount: 0 };
    const limit = activeCompetitionLimit(venue);
    const activeCount = await tx.competition.count({
      where: {
        venueId,
        status: { in: CAPACITY_COUNTED_STATUSES },
        ...(opts.excludeCompetitionId ? { id: { not: opts.excludeCompetitionId } } : {}),
      },
    });
    if (Number.isFinite(limit) && activeCount >= limit) {
      return { ok: false as const, limit, activeCount };
    }
    return { ok: true as const, value: await fn(tx) };
  });
}
