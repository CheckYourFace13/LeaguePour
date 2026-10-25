import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolvePrimaryVenueAccess } from "@/lib/venue-permissions";
import { claimConversion } from "@/lib/conversions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Claims the signed-in venue's pending subscription conversion (lib/conversions.ts) for one
 * product. Only the single request that wins the claim gets `counted` back - that is the only
 * response the browser turns into a `subscription_activated` analytics event.
 */
export async function POST(req: Request) {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) return NextResponse.json({ status: "none" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { product?: string };
  const product = body.product === "vs" ? "vs" : "lp";
  const venue = await prisma.venue.findUnique({
    where: { id: access.venueId },
    select: { subscriptionId: true, vsConfig: { select: { vsSubscriptionId: true } } },
  });
  const subscriptionId = product === "vs" ? venue?.vsConfig?.vsSubscriptionId : venue?.subscriptionId;
  const claimed = await claimConversion(subscriptionId);
  if (!claimed || claimed.product !== product) return NextResponse.json({ status: "none" });
  return NextResponse.json({ status: "counted", ...claimed });
}
