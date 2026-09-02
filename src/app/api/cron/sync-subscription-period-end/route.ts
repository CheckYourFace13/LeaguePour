import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * One-purpose repair tool for the subscriptionPeriodEnd-nulling bug fixed in the Stripe webhook
 * (see handleSubscriptionUpsert/extractCurrentPeriodEnd in src/app/api/webhooks/stripe/route.ts).
 * Reads the venue's real LP subscriptionId, retrieves that subscription live from Stripe, and -
 * only with ?confirm=1 - writes ONLY Venue.subscriptionPeriodEnd back to the value Stripe
 * reports. Touches no other field (not status, not billingPlan, not anything else), and never
 * touches business/bank/personal information - this is a single billing-metadata timestamp.
 * Matched by exact venue name only. Always requires CRON_SECRET.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET is not configured." }, { status: 500 });
  }
  const url = new URL(request.url);
  const given = url.searchParams.get("secret") ?? request.headers.get("authorization")?.replace("Bearer ", "");
  if (given !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const venueName = url.searchParams.get("venue");
  if (!venueName) {
    return NextResponse.json({ ok: false, error: "Missing ?venue=<exact name>" }, { status: 400 });
  }
  const confirm = url.searchParams.get("confirm") === "1";

  const venue = await prisma.venue.findFirst({
    where: { name: venueName },
    select: { id: true, subscriptionId: true, subscriptionPeriodEnd: true },
  });
  if (!venue) return NextResponse.json({ ok: false, error: "Venue not found" }, { status: 404 });
  if (!venue.subscriptionId) {
    return NextResponse.json({ ok: false, error: "Venue has no subscriptionId" }, { status: 400 });
  }

  try {
    const sub = await getStripe().subscriptions.retrieve(venue.subscriptionId);
    const topLevel = (sub as unknown as { current_period_end?: number | null }).current_period_end;
    const itemLevel = (sub.items?.data?.[0] as unknown as { current_period_end?: number | null } | undefined)
      ?.current_period_end;
    const raw = typeof topLevel === "number" ? topLevel : typeof itemLevel === "number" ? itemLevel : null;
    if (!raw) {
      return NextResponse.json({ ok: false, error: "Stripe subscription has no current_period_end at either level" }, { status: 422 });
    }
    const correctPeriodEnd = new Date(raw * 1000);

    if (!confirm) {
      return NextResponse.json({
        ok: true,
        dryRun: true,
        currentlyStored: venue.subscriptionPeriodEnd,
        wouldSetTo: correctPeriodEnd.toISOString(),
        note: "Dry run only - pass ?confirm=1 to actually write.",
      });
    }

    await prisma.venue.update({
      where: { id: venue.id },
      data: { subscriptionPeriodEnd: correctPeriodEnd },
    });

    return NextResponse.json({ ok: true, dryRun: false, setTo: correctPeriodEnd.toISOString() });
  } catch (err) {
    console.error("[sync-subscription-period-end] failed", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Sync failed." },
      { status: 500 },
    );
  }
}
