import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Read-only, anonymized health check for real paying subscriptions - built to independently
 * verify the real LP customer's internal consistency (Stripe IDs present, status/plan/interval
 * sane, no cross-brand collision, no duplicate subscription IDs) WITHOUT exposing any PII
 * (venue name, owner email, address) in the response. Never writes anything. Always requires
 * CRON_SECRET.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET is not configured on the server." },
      { status: 500 },
    );
  }
  const url = new URL(request.url);
  const given = url.searchParams.get("secret") ?? request.headers.get("authorization")?.replace("Bearer ", "");
  if (given !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const activeLp = await prisma.venue.findMany({
      where: { subscriptionStatus: "active" },
      select: {
        billingPlan: true,
        subscriptionStatus: true,
        subscriptionInterval: true,
        subscriptionPeriodEnd: true,
        subscriptionId: true,
        isDisabled: true,
        staff: { select: { id: true }, take: 1 },
        vsConfig: { select: { vsSubscriptionId: true, vsSubscriptionStatus: true } },
      },
    });

    const activeVs = await prisma.venueVsConfig.findMany({
      where: { vsSubscriptionStatus: "active" },
      select: { id: true },
    });

    // Duplicate-ID check: subscriptionId/vsSubscriptionId are @unique at the schema level, so
    // this should always be 0 - included as a live assertion, not just trusting the schema.
    const [subIdGroups, vsSubIdGroups] = await Promise.all([
      prisma.venue.groupBy({
        by: ["subscriptionId"],
        where: { subscriptionId: { not: null } },
        _count: { id: true },
        having: { id: { _count: { gt: 1 } } },
      }),
      prisma.venueVsConfig.groupBy({
        by: ["vsSubscriptionId"],
        where: { vsSubscriptionId: { not: null } },
        _count: { id: true },
        having: { id: { _count: { gt: 1 } } },
      }),
    ]);

    // Outreach-suppression cross-check: a real customer's business may or may not be in the
    // outreach prospect list at all (they may have signed up organically). This doesn't identify
    // WHICH contacts, just proves the suppression mechanism has live rows in the state that
    // would exclude them from cold outreach (both send queries structurally exclude non-eligible
    // statuses - see src/lib/outreach-email.ts). Raw query, not a Prisma-level comparison against
    // vsStatus - that column is declared as the OutreachStatus enum in schema.prisma but is
    // actually TEXT in the live DB (same root cause behind the outreach-send query rewrite
    // earlier this session), and any Prisma-built comparison against it throws "operator does
    // not exist". Raw SQL with a fixed literal (no interpolated input) sidesteps Prisma's typed
    // client entirely.
    const outreachSignedUpRows = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT count(*) AS count FROM "leaguepour_lp"."OutreachContact"
      WHERE status = 'SIGNED_UP' OR "vsStatus" = 'SIGNED_UP'
    `;
    const outreachSignedUpCount = Number(outreachSignedUpRows[0]?.count ?? 0);

    return NextResponse.json({
      ok: true,
      activeLpSubscriptions: {
        count: activeLp.length,
        subscriptions: activeLp.map((v) => ({
          plan: v.billingPlan,
          status: v.subscriptionStatus,
          interval: v.subscriptionInterval,
          hasPeriodEnd: v.subscriptionPeriodEnd !== null,
          periodEndInFuture: v.subscriptionPeriodEnd ? v.subscriptionPeriodEnd > new Date() : null,
          hasStripeSubscriptionId: v.subscriptionId !== null,
          hasVenueOwnerStaffRow: v.staff.length > 0,
          isDisabled: v.isDisabled,
          vsCollision: Boolean(v.vsConfig?.vsSubscriptionId) && v.vsConfig?.vsSubscriptionStatus === "active",
        })),
      },
      activeVsSubscriptionCount: activeVs.length,
      duplicateLpSubscriptionIdGroups: subIdGroups.length,
      duplicateVsSubscriptionIdGroups: vsSubIdGroups.length,
      outreachSignedUpSuppressedCount: outreachSignedUpCount,
    });
  } catch (err) {
    console.error("[customer-health] failed", err);
    return NextResponse.json({ ok: false, error: "Query failed." }, { status: 500 });
  }
}
