"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getAppBaseUrl } from "@/lib/stripe/env";
import { getStripe } from "@/lib/stripe/server";
import {
  resolvePrimaryVenueAccess,
  venueStaffCanCreateAndPublish,
} from "@/lib/venue-permissions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function parseUrlOrNull(v: string): string | null {
  const raw = v.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    return u.toString();
  } catch {
    return null;
  }
}

export async function saveVenueProfileAction(formData: FormData) {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");

  const existing = await prisma.venue.findUnique({ where: { id: access.venueId } });
  if (!existing) redirect("/signup/venue");
  const submittedPlaceId = String(formData.get("googlePlaceId") ?? "").trim() || null;
  const lockedPlaceId = existing.googlePlaceId ?? submittedPlaceId;

  await prisma.venue.update({
    where: { id: access.venueId },
    data: {
      name: String(formData.get("name") ?? "").trim() || undefined,
      venueType: String(formData.get("venueType") ?? "").trim() || undefined,
      description: String(formData.get("description") ?? "").trim() || undefined,
      formattedAddress: String(formData.get("formattedAddress") ?? "").trim() || null,
      city: String(formData.get("city") ?? "").trim() || null,
      state: String(formData.get("state") ?? "").trim() || null,
      postalCode: String(formData.get("postalCode") ?? "").trim() || null,
      websiteUrl: parseUrlOrNull(String(formData.get("websiteUrl") ?? "")),
      phone: String(formData.get("phone") ?? "").trim() || null,
      instagramUrl: parseUrlOrNull(String(formData.get("instagramUrl") ?? "")),
      facebookUrl: parseUrlOrNull(String(formData.get("facebookUrl") ?? "")),
      xUrl: parseUrlOrNull(String(formData.get("xUrl") ?? "")),
      tiktokUrl: parseUrlOrNull(String(formData.get("tiktokUrl") ?? "")),
      logoUrl: parseUrlOrNull(String(formData.get("logoUrl") ?? "")),
      googlePlaceId: lockedPlaceId,
      latitude: Number(String(formData.get("latitude") ?? "")) || null,
      longitude: Number(String(formData.get("longitude") ?? "")) || null,
      // billingPlan/platformFeeBps are deliberately NOT written here - they were previously
      // read from this same client-submitted formData, meaning any venue staff member (any
      // role, not just owner) could set their own billingPlan directly, bypassing Stripe
      // entirely and unlocking paid-tier competition limits for free. Real, confirmed exploit
      // found via independent security audit. billingPlan/platformFeeBps must only ever be
      // written by the Stripe webhook handler (src/app/api/webhooks/stripe/route.ts), which is
      // the only place that reflects what was actually paid for.
    },
  });

  revalidatePath("/venue/profile");
  revalidatePath(`/v/${access.slug}`);
  redirect("/venue/profile?notice=saved");
}

export async function createStripeConnectOnboardingAction() {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");
  if (!venueStaffCanCreateAndPublish(access.role)) redirect("/venue/profile?notice=forbidden");

  const venue = await prisma.venue.findUnique({ where: { id: access.venueId } });
  if (!venue) redirect("/signup/venue");

  const stripe = getStripe();
  let accountId = venue.stripeAccountId;
  let link: { url: string };

  try {
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        business_type: "company",
        metadata: { venueId: venue.id },
        company: { name: venue.name },
      });
      accountId = account.id;
      await prisma.venue.update({
        where: { id: venue.id },
        data: { stripeAccountId: account.id },
      });
    }

    const base = getAppBaseUrl();
    link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${base}/venue/profile?notice=connect-refresh`,
      return_url: `${base}/venue/profile?notice=connect-return`,
      type: "account_onboarding",
    });
  } catch (err) {
    // Was a raw, unhandled 500 (opaque Next.js digest, no detail) until this pass caught it live
    // against a fresh test venue - root cause is platform-level (Stripe Connect isn't activated
    // on this Stripe account: "You can only create new accounts if you've signed up for
    // Connect..."), not something this action can fix, but a venue owner should never see a bare
    // crash for it - see the connect-error notice on the profile page for the friendly message.
    console.error("[stripe-connect] onboarding link creation failed", err);
    redirect("/venue/profile?notice=connect-error");
  }

  redirect(link.url);
}

export async function refreshStripeConnectStatusAction() {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");

  const venue = await prisma.venue.findUnique({ where: { id: access.venueId } });
  if (!venue?.stripeAccountId) redirect("/venue/profile?notice=no-connect");

  const stripe = getStripe();
  const acct = await stripe.accounts.retrieve(venue.stripeAccountId);
  await prisma.venue.update({
    where: { id: venue.id },
    data: {
      stripeChargesEnabled: Boolean(acct.charges_enabled),
      stripePayoutsEnabled: Boolean(acct.payouts_enabled),
      stripeDetailsSubmitted: Boolean(acct.details_submitted),
    },
  });
  revalidatePath("/venue/profile");
  redirect("/venue/profile?notice=connect-status");
}
