"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getAppBaseUrl } from "@/lib/stripe/env";
import { getStripe } from "@/lib/stripe/server";
import { MANAGED_RISK_CONTROLLER } from "@/lib/stripe/connect-controller";
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

// Fixed namespace for the per-venue Stripe Connect setup advisory lock (paired with
// hashtext(venueId) as the second key - see the lock acquisition below). Arbitrary constant,
// just needs to not collide with the other lock namespaces in src/lib/outreach-email.ts
// (729_312_400_1xx) - this one is unrelated to those, so any distinct value works.
const CONNECT_SETUP_LOCK_NAMESPACE = 842_910_100;

class ConnectSetupInProgressError extends Error {}
class VenueNotFoundError extends Error {}

export async function createStripeConnectOnboardingAction() {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");
  if (!venueStaffCanCreateAndPublish(access.role)) redirect("/venue/profile?notice=forbidden");

  const stripe = getStripe();
  const base = getAppBaseUrl();
  let link: { url: string };

  try {
    link = await prisma.$transaction(
      async (tx) => {
        // Transaction-scoped advisory lock, keyed per-venue (hashtext(venueId) as the second
        // int4 key) - always releases when the transaction ends, so it can't leak stuck.
        // Without this, a double-click, a second browser tab, or a slow first request plus a
        // retry could all read stripeAccountId as null before any of them had written it back,
        // each creating its own separate (orphaned, unused) Stripe Express account for the same
        // venue.
        const [{ locked }] = await tx.$queryRaw<{ locked: boolean }[]>`
          SELECT pg_try_advisory_xact_lock(${CONNECT_SETUP_LOCK_NAMESPACE}, hashtext(${access.venueId})) AS locked
        `;
        if (!locked) throw new ConnectSetupInProgressError();

        const venue = await tx.venue.findUnique({ where: { id: access.venueId } });
        if (!venue) throw new VenueNotFoundError();

        let accountId = venue.stripeAccountId;
        if (!accountId) {
          // business_type is deliberately omitted - LeaguePour venues span LLCs, corporations,
          // sole proprietors, and individual operators. Forcing "company" here made Stripe's
          // hosted onboarding ask every venue for company-specific paperwork even when that's
          // wrong for them; leaving it unset lets Stripe's own onboarding flow ask the venue to
          // self-select the correct type and collect the right fields for it.
          const account = await stripe.accounts.create({
            controller: MANAGED_RISK_CONTROLLER,
            metadata: { venueId: venue.id },
          });
          accountId = account.id;
          await tx.venue.update({
            where: { id: venue.id },
            data: { stripeAccountId: account.id },
          });
        }

        return stripe.accountLinks.create({
          account: accountId,
          refresh_url: `${base}/venue/profile?notice=connect-refresh`,
          return_url: `${base}/venue/profile?notice=connect-return`,
          type: "account_onboarding",
        });
      },
      { timeout: 30_000 },
    );
  } catch (err) {
    if (err instanceof ConnectSetupInProgressError) {
      redirect("/venue/profile?notice=connect-in-progress");
    }
    if (err instanceof VenueNotFoundError) {
      redirect("/signup/venue");
    }
    // Was a raw, unhandled 500 (opaque Next.js digest, no detail) until this pass caught it live
    // against a fresh test venue - root cause was platform-level (Stripe Connect wasn't
    // activated on this Stripe account: "You can only create new accounts if you've signed up
    // for Connect..."), now resolved. A venue owner should still never see a bare crash for
    // whatever future failure reaches here - see the connect-error notice for the friendly
    // message.
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
