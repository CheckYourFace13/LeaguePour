import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolvePrimaryVenueAccess } from "@/lib/venue-permissions";
import { createBillingPortalUrl } from "@/lib/stripe/billing";
import { isStripePaymentsConfigured } from "@/lib/stripe/env";
import { LP_HOST, VS_HOST } from "@/lib/vs-routing";

export async function POST(req: Request) {
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
    // VenueSprocket's billing lives in /app on the domain the venue is signed in on (session
    // cookies are per-domain); LeaguePour's stays on /venue/settings.
    const body = (await req.json().catch(() => ({}))) as { product?: string };
    const host = req.headers.get("host")?.split(":")[0]?.toLowerCase();
    const url =
      body.product === "vs"
        ? await createBillingPortalUrl(
            venue.stripeBillingCustomerId,
            "/app/settings#billing",
            host === LP_HOST ? `https://${LP_HOST}` : `https://${VS_HOST}`,
          )
        : await createBillingPortalUrl(venue.stripeBillingCustomerId);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[billing portal]", err);
    return NextResponse.json({ error: "Could not open the billing portal. Please try again." }, { status: 500 });
  }
}
