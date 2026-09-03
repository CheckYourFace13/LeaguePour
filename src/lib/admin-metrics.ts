/**
 * Aggregate business metrics for the owner dashboard (src/app/internal/admin/page.tsx).
 * Every number here is a real query against production data.
 *
 * MRR: subscriptions created after the interval-tracking fix (see Venue.subscriptionInterval /
 * VenueVsConfig.vsSubscriptionInterval, and src/app/api/webhooks/stripe/route.ts) record whether
 * they're billed monthly or annually, so those contribute a real monthly-equivalent figure
 * (annual price / 12). Older subscriptions predate that tracking and have no recorded interval -
 * those fall back to the monthly rate, the best available assumption for them specifically, not
 * a blanket assumption across every subscriber. legacyIntervalCount on each result tells you how
 * many active subscriptions are still on that fallback, so the dashboard can say so rather than
 * quietly presenting a mixed-precision number as exact.
 */
import { prisma } from "@/lib/db";
import { BillingPlan } from "@/generated/prisma/enums";
import { PLAN_DEFINITIONS } from "@/lib/pricing";
import { getLatestJobRuns } from "@/lib/job-runs";
import { getSetting } from "@/lib/app-settings";

const DAY_MS = 24 * 60 * 60 * 1000;

const LP_PRICE_CENTS: Record<BillingPlan, { monthly: number; annual: number }> = Object.fromEntries(
  PLAN_DEFINITIONS.map((p) => [p.plan, { monthly: p.monthlyCents, annual: p.annualCents }]),
) as Record<BillingPlan, { monthly: number; annual: number }>;

// VenueSprocket plans map onto LP's price catalog (same Stripe prices, different marketing
// names) - see VS_PLAN_MAP in src/app/api/venuesprocket/subscribe/route.ts for the same mapping
// used at checkout time. VS_ENTERPRISE is custom-priced ("Multi-Location, Contact Us") and
// excluded from MRR entirely, not treated as zero.
const VS_TO_LP_PLAN: Record<string, BillingPlan> = {
  VS_STARTER: BillingPlan.STARTER,
  VS_PRO: BillingPlan.GROWTH,
  VS_GROWTH: BillingPlan.PRO,
};

function monthlyEquivalentCents(plan: BillingPlan, interval: string | null): { cents: number; wasLegacy: boolean } {
  const price = LP_PRICE_CENTS[plan];
  if (!price) return { cents: 0, wasLegacy: false };
  if (interval === "annual") return { cents: Math.round(price.annual / 12), wasLegacy: false };
  if (interval === "monthly") return { cents: price.monthly, wasLegacy: false };
  return { cents: price.monthly, wasLegacy: true };
}

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
      select: { billingPlan: true, subscriptionInterval: true },
    }),
    prisma.outreachContact.count({ where: { email: { not: null }, status: "NOT_CONTACTED" } }),
    prisma.outreachContact.count({ where: { emailSentAt: { gte: d7 } } }),
  ]);

  let mrrCents = 0;
  let legacyIntervalCount = 0;
  for (const v of activeBillingPlans) {
    const { cents, wasLegacy } = monthlyEquivalentCents(v.billingPlan, v.subscriptionInterval);
    mrrCents += cents;
    if (wasLegacy) legacyIntervalCount++;
  }

  const jobs = await getLatestJobRuns(["lp-outreach-send", "lp-lifecycle-nudges"]);

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
    legacyIntervalCount,
    outreachEligible,
    outreachSent7,
    latestOutreachJob: jobs["lp-outreach-send"] ?? null,
    latestLifecycleJob: jobs["lp-lifecycle-nudges"] ?? null,
  };
}

export async function getVenueSprocketMetrics() {
  const now = new Date();
  const d7 = new Date(now.getTime() - 7 * DAY_MS);
  const d30 = new Date(now.getTime() - 30 * DAY_MS);

  const [
    planCounts,
    activeVsSubs,
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
    prisma.venueVsConfig.findMany({
      where: { vsSubscriptionStatus: { in: ACTIVE_SUB_STATUSES } },
      select: { vsPlan: true, vsSubscriptionInterval: true },
    }),
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

  // MRR is computed from actually-active subscriptions (vsSubscriptionStatus active/trialing),
  // not from vsPlan alone - vsPlan can lag a cancelled-but-not-yet-webhooked subscription, or a
  // past_due/unpaid one that customer.subscription.updated doesn't reset (only .deleted does).
  let mrrCents = 0;
  let legacyIntervalCount = 0;
  for (const sub of activeVsSubs) {
    const lpPlan = VS_TO_LP_PLAN[sub.vsPlan];
    if (!lpPlan) continue; // VS_FREE contributes 0; VS_ENTERPRISE is custom-priced, excluded
    const { cents, wasLegacy } = monthlyEquivalentCents(lpPlan, sub.vsSubscriptionInterval);
    mrrCents += cents;
    if (wasLegacy) legacyIntervalCount++;
  }

  const jobs = await getLatestJobRuns(["vs-outreach-send", "vs-lifecycle-nudges"]);

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
    legacyIntervalCount,
    vsOutreachEligible,
    vsOutreachSent7,
    latestVsOutreachJob: jobs["vs-outreach-send"] ?? null,
    latestLifecycleJob: jobs["vs-lifecycle-nudges"] ?? null,
  };
}

/**
 * Owner-facing system health, built entirely from data this app already records - no new
 * tracking added. JobRun rows cover the jobs that call runJob() (see src/lib/job-runs.ts);
 * scheduler_* AppSetting keys are written by the in-process scheduler on every tick
 * (src/lib/scheduler.ts); the rest are direct counts against production state. Exists so a
 * customer-blocking issue (a subscription stuck non-active, a Connect account restricted, the
 * scheduler having gone quiet) is visible here without waiting for a support email or a GitHub
 * Actions failure notification.
 */
export async function getSystemHealthMetrics() {
  const [jobs, schedulerLastTick, schedulerStartedAt, subscriptionIssues, connectRestricted, dbHeartbeat] =
    await Promise.all([
      getLatestJobRuns([
        "lp-outreach-send",
        "vs-outreach-send",
        "vs-eligibility-backfill",
        "lp-lifecycle-nudges",
        "vs-lifecycle-nudges",
        "indexnow-submit",
        "resend-webhook-suppress",
        "stripe-dispute-created",
      ]),
      getSetting("scheduler_last_tick", ""),
      getSetting("scheduler_started_at", ""),
      // Active-looking subscriptions whose status Stripe last reported as something other than
      // "active" - past_due/unpaid/incomplete are all customer-blocking states worth a look,
      // not necessarily a crisis, but the kind of thing that should be visible proactively.
      prisma.venue.count({
        where: { subscriptionId: { not: null }, subscriptionStatus: { notIn: ["active", "canceled"] } },
      }),
      // hasAccountId + detailsSubmitted but charges still off for a while is the closest signal
      // available to "Stripe flagged this account" without persisting Stripe's own
      // requirements/disabled_reason fields (which the live-fetch on the profile page already
      // surfaces accurately per-venue - this is just the platform-wide count for the dashboard).
      prisma.venue.count({
        where: { stripeAccountId: { not: null }, stripeDetailsSubmitted: true, stripeChargesEnabled: false },
      }),
      // Key format matches scheduler.ts's own `scheduler_last_run${job.path.replace(/\//g,"_")}`.
      getSetting("scheduler_last_run_api_cron_supabase-heartbeat", ""),
    ]);

  const schedulerStale =
    !schedulerLastTick || Date.now() - new Date(schedulerLastTick).getTime() > 20 * 60 * 1000;
  // dbHeartbeat's stored value is "<ISO timestamp> <outcome text>" (see scheduler.ts's
  // persistStatus calls) - the leading ISO segment is what's compared here.
  const dbHeartbeatStale =
    !dbHeartbeat || Date.now() - new Date(dbHeartbeat.split(" ")[0]).getTime() > 36 * 60 * 60 * 1000;

  return {
    jobs,
    scheduler: {
      lastTick: schedulerLastTick || null,
      startedAt: schedulerStartedAt || null,
      stale: schedulerStale,
    },
    subscriptionIssues,
    connectRestricted,
    dbHeartbeat: dbHeartbeat || null,
    dbHeartbeatStale,
  };
}
