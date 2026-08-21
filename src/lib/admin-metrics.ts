/**
 * Aggregate business metrics for the owner dashboard (src/app/internal/admin/page.tsx).
 * Every number here is a real query against production data - nothing here is estimated
 * except MRR, which is clearly labeled as an approximation (see the comment on
 * approxMonthlyPriceCents below) because per-venue billing interval isn't tracked yet.
 */
import { prisma } from "@/lib/db";
import { BillingPlan } from "@/generated/prisma/enums";
import { PLAN_DEFINITIONS } from "@/lib/pricing";
import { getLatestJobRuns } from "@/lib/job-runs";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * MRR here assumes every active subscriber pays the monthly rate - the DB does not currently
 * record whether an active subscription is billed monthly or annually (Stripe knows, but that
 * would mean a live API call per active venue to compute a dashboard number). This is a stated
 * approximation, not a precise revenue figure - do not treat it as bookkeeping-grade.
 */
const LP_MONTHLY_CENTS: Record<BillingPlan, number> = Object.fromEntries(
  PLAN_DEFINITIONS.map((p) => [p.plan, p.monthlyCents]),
) as Record<BillingPlan, number>;

const VS_MONTHLY_CENTS: Record<string, number> = {
  VS_FREE: 0,
  VS_STARTER: 2900,
  VS_PRO: 7900,
  VS_GROWTH: 14900,
  // VS_ENTERPRISE is custom-priced ("Multi-Location, Contact Us") - excluded from MRR, not zero.
};

const ACTIVE_SUB_STATUSES = ["active", "trialing"];

export async function getLeaguePourMetrics() {
  const now = new Date();
  const d7 = new Date(now.getTime() - 7 * DAY_MS);
  const d30 = new Date(now.getTime() - 30 * DAY_MS);

  const [
    totalVenues,
    paidVenues,
    newVenues7,
    newVenues30,
    activeCompetitions,
    competitionsCreated7,
    competitionsCreated30,
    registrations7,
    registrations30,
    activeBillingPlans,
    outreachEligible,
    outreachSent7,
  ] = await Promise.all([
    prisma.venue.count({ where: { isDisabled: false } }),
    prisma.venue.count({ where: { isDisabled: false, subscriptionStatus: { in: ACTIVE_SUB_STATUSES } } }),
    prisma.venue.count({ where: { isDisabled: false, createdAt: { gte: d7 } } }),
    prisma.venue.count({ where: { isDisabled: false, createdAt: { gte: d30 } } }),
    prisma.competition.count({ where: { status: { in: ["SIGNUP_OPEN", "PUBLISHED", "IN_PROGRESS"] } } }),
    prisma.competition.count({ where: { createdAt: { gte: d7 } } }),
    prisma.competition.count({ where: { createdAt: { gte: d30 } } }),
    prisma.competitionRegistration.count({ where: { createdAt: { gte: d7 } } }),
    prisma.competitionRegistration.count({ where: { createdAt: { gte: d30 } } }),
    prisma.venue.findMany({
      where: { isDisabled: false, subscriptionStatus: { in: ACTIVE_SUB_STATUSES } },
      select: { billingPlan: true },
    }),
    prisma.outreachContact.count({ where: { email: { not: null }, status: "NOT_CONTACTED" } }),
    prisma.outreachContact.count({ where: { emailSentAt: { gte: d7 } } }),
  ]);

  const mrrCents = activeBillingPlans.reduce((sum, v) => sum + (LP_MONTHLY_CENTS[v.billingPlan] ?? 0), 0);

  const jobs = await getLatestJobRuns(["lp-outreach-send"]);

  return {
    totalVenues,
    paidVenues,
    freeVenues: totalVenues - paidVenues,
    newVenues7,
    newVenues30,
    activeCompetitions,
    competitionsCreated7,
    competitionsCreated30,
    registrations7,
    registrations30,
    mrrCents,
    outreachEligible,
    outreachSent7,
    latestOutreachJob: jobs["lp-outreach-send"] ?? null,
  };
}

export async function getVenueSprocketMetrics() {
  const now = new Date();
  const d7 = new Date(now.getTime() - 7 * DAY_MS);
  const d30 = new Date(now.getTime() - 30 * DAY_MS);

  const [
    planCounts,
    newVenues7,
    newVenues30,
    leads7,
    leads30,
    proposals7,
    proposals30,
    contractsSigned7,
    contractsSigned30,
    depositsPaid7,
    depositsPaid30,
    eventsBooked7,
    eventsBooked30,
    vsOutreachEligible,
    vsOutreachSent7,
  ] = await Promise.all([
    prisma.venueVsConfig.groupBy({ by: ["vsPlan"], _count: { id: true } }),
    prisma.venueVsConfig.count({ where: { createdAt: { gte: d7 } } }),
    prisma.venueVsConfig.count({ where: { createdAt: { gte: d30 } } }),
    prisma.privateEventLead.count({ where: { createdAt: { gte: d7 } } }),
    prisma.privateEventLead.count({ where: { createdAt: { gte: d30 } } }),
    // No dedicated "sentAt" field - VsProposal is created already-sent in this flow, so a
    // non-draft proposal's createdAt is the closest real signal.
    prisma.vsProposal.count({ where: { status: { not: "DRAFT" }, createdAt: { gte: d7 } } }),
    prisma.vsProposal.count({ where: { status: { not: "DRAFT" }, createdAt: { gte: d30 } } }),
    prisma.vsContract.count({ where: { status: "SIGNED", signedAt: { gte: d7 } } }),
    prisma.vsContract.count({ where: { status: "SIGNED", signedAt: { gte: d30 } } }),
    prisma.vsPayment.count({ where: { status: "PAID", paidAt: { gte: d7 } } }),
    prisma.vsPayment.count({ where: { status: "PAID", paidAt: { gte: d30 } } }),
    // No dedicated "confirmedAt" timestamp - updatedAt on a CONFIRMED+ event is the closest
    // real signal, though it can also fire on later unrelated edits to an already-booked event.
    prisma.privateEvent.count({ where: { status: { in: ["CONFIRMED", "BEO_DRAFT", "BEO_FINAL", "IN_PROGRESS", "COMPLETED"] }, updatedAt: { gte: d7 } } }),
    prisma.privateEvent.count({ where: { status: { in: ["CONFIRMED", "BEO_DRAFT", "BEO_FINAL", "IN_PROGRESS", "COMPLETED"] }, updatedAt: { gte: d30 } } }),
    prisma.outreachContact.count({ where: { vsEligible: true, email: { not: null }, vsStatus: null } }),
    prisma.outreachContact.count({ where: { vsEmailSentAt: { gte: d7 } } }),
  ]);

  const byPlan = Object.fromEntries(
    planCounts.map((p: { vsPlan: string; _count: { id: number } }) => [p.vsPlan, p._count.id]),
  ) as Record<string, number>;

  const totalVenues = Object.values(byPlan).reduce((a, b) => a + b, 0);
  const mrrCents = Object.entries(byPlan).reduce(
    (sum, [plan, count]) => sum + (VS_MONTHLY_CENTS[plan] ?? 0) * count,
    0,
  );

  const jobs = await getLatestJobRuns(["vs-outreach-send"]);

  return {
    totalVenues,
    freeCount: byPlan["VS_FREE"] ?? 0,
    starterCount: byPlan["VS_STARTER"] ?? 0,
    proCount: byPlan["VS_PRO"] ?? 0,
    growthCount: byPlan["VS_GROWTH"] ?? 0,
    enterpriseCount: byPlan["VS_ENTERPRISE"] ?? 0,
    newVenues7,
    newVenues30,
    leads7,
    leads30,
    proposals7,
    proposals30,
    contractsSigned7,
    contractsSigned30,
    depositsPaid7,
    depositsPaid30,
    eventsBooked7,
    eventsBooked30,
    mrrCents,
    vsOutreachEligible,
    vsOutreachSent7,
    latestVsOutreachJob: jobs["vs-outreach-send"] ?? null,
  };
}

export async function getSystemHealthMetrics() {
  const jobs = await getLatestJobRuns(["lp-outreach-send", "vs-outreach-send"]);
  return { jobs };
}
