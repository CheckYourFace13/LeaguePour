import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolvePrimaryVenueAccess } from "@/lib/venue-permissions";
import { createBillingPortalUrl } from "@/lib/stripe/billing";
import { isStripePaymentsConfigured } from "@/lib/stripe/env";

export async function POST() {
  if (!isStripePaymentsConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const venue = await prisma.venue.findUnique({
    where: { id: access.venueId },
    select: { stripeBillingCustomerId: true },
  });

  if (!venue?.stripeBillingCustomerId) {
    return NextResponse.json({ error: "No billing account found. Subscribe to a plan first." }, { status: 404 });
  }

  try {
    const url = await createBillingPortalUrl(venue.stripeBillingCustomerId);
    return NextResponse.json({ url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[billing portal]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
