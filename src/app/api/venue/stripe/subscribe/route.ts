import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { BillingPlan } from "@/generated/prisma/enums";
import { resolvePrimaryVenueAccess } from "@/lib/venue-permissions";
import {
  createSubscriptionCheckoutUrl,
  getOrCreateBillingCustomer,
  type BillingInterval,
} from "@/lib/stripe/billing";
import { isStripePaymentsConfigured } from "@/lib/stripe/env";

export async function POST(req: Request) {
  if (!isStripePaymentsConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let plan: BillingPlan;
  let interval: BillingInterval;
  try {
    const body = await req.json();
    plan = body.plan as BillingPlan;
    interval = (body.interval ?? "monthly") as BillingInterval;
    if (!Object.values(BillingPlan).includes(plan)) throw new Error("bad plan");
    if (interval !== "monthly" && interval !== "annual") throw new Error("bad interval");
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const venue = await prisma.venue.findUnique({
    where: { id: access.venueId },
    select: { id: true, name: true, stripeBillingCustomerId: true },
  });
  if (!venue) return NextResponse.json({ error: "Venue not found" }, { status: 404 });

  const userEmail = session?.user?.email ?? "";

  let customerId = venue.stripeBillingCustomerId;
  if (!customerId) {
    customerId = await getOrCreateBillingCustomer(venue.id, venue.name, userEmail);
    await prisma.venue.update({
      where: { id: venue.id },
      data: { stripeBillingCustomerId: customerId },
    });
  }

  try {
    const url = await createSubscriptionCheckoutUrl({ customerId, plan, interval, venueId: venue.id });
    return NextResponse.json({ url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[billing subscribe]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
