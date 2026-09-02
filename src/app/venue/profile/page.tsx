import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VenueEntryFeeFlowCard } from "@/components/venue/venue-entry-fee-flow-card";
import { VenueProfileForm } from "@/components/venue/venue-profile-form";
import { prisma } from "@/lib/db";
import { buildQrDataUrl } from "@/lib/qr";
import { getPublicSiteUrl } from "@/lib/site-url";
import { resolvePrimaryVenueAccess } from "@/lib/venue-permissions";
import { redirect } from "next/navigation";
import { getStripe } from "@/lib/stripe/server";
import { CONNECT_STATUS_COPY, deriveConnectStatus } from "@/lib/stripe/connect-status";
import {
  createStripeConnectOnboardingAction,
  refreshStripeConnectStatusAction,
} from "./actions";
import { TrackView } from "@/components/analytics/track-view";
import { TrackClick } from "@/components/analytics/track-click";

export default async function VenueProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");
  const { notice } = await searchParams;
  const venue = await prisma.venue.findUnique({ where: { id: access.venueId } });
  if (!venue) redirect("/signup/venue");
  const publicPath = `/v/${venue.slug}`;
  const publicUrl = `${getPublicSiteUrl()}${publicPath}`;
  const qr = await buildQrDataUrl(publicUrl);

  // Fetched live rather than trusting only the cached charges/payouts/detailsSubmitted booleans
  // (which depend on a webhook actually reaching us - see the Connect webhook audit) - this way
  // the venue owner always sees Stripe's real, current state on every profile page load, with
  // no dependency on webhook delivery.
  let connectStatus = deriveConnectStatus(null);
  if (venue.stripeAccountId) {
    try {
      const acct = await getStripe().accounts.retrieve(venue.stripeAccountId);
      connectStatus = deriveConnectStatus(acct);
      // Opportunistically keep the cached booleans (used by the dashboard banner and the
      // paid-registration gate) in sync with what we just read from Stripe directly - this way
      // an owner returning from onboarding doesn't need the Connect webhook to actually reach
      // us, or a manual "Sync status" click, for the rest of the app to reflect reality.
      const chargesEnabled = Boolean(acct.charges_enabled);
      const payoutsEnabled = Boolean(acct.payouts_enabled);
      const detailsSubmitted = Boolean(acct.details_submitted);
      if (
        chargesEnabled !== venue.stripeChargesEnabled ||
        payoutsEnabled !== venue.stripePayoutsEnabled ||
        detailsSubmitted !== venue.stripeDetailsSubmitted
      ) {
        await prisma.venue.update({
          where: { id: venue.id },
          data: {
            stripeChargesEnabled: chargesEnabled,
            stripePayoutsEnabled: payoutsEnabled,
            stripeDetailsSubmitted: detailsSubmitted,
          },
        });
      }
    } catch (err) {
      console.error("[venue-profile] failed to fetch live Connect status", err);
      // Fall back to the cached booleans rather than showing nothing.
      connectStatus = deriveConnectStatus({
        charges_enabled: venue.stripeChargesEnabled,
        payouts_enabled: venue.stripePayoutsEnabled,
        details_submitted: venue.stripeDetailsSubmitted,
      });
    }
  }
  const statusCopy = CONNECT_STATUS_COPY[connectStatus];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="lp-page-title text-3xl md:text-4xl">Venue profile</h1>
        <p className="mt-2 text-lp-muted">Public page, QR, Stripe Connect, plan, and socials.</p>
      </div>
      {notice === "saved" ? (
        <div className="rounded-[10px] border border-lp-accent/35 bg-lp-accent/10 px-4 py-3 text-sm font-medium text-lp-text">
          Profile saved.
        </div>
      ) : null}
      {notice === "connect-return" ? (
        <>
          {connectStatus === "ready" ? <TrackView event="stripe_connect_completed" params={{ product: "lp" }} /> : null}
          <div className="rounded-[10px] border border-lp-border bg-lp-surface/60 px-4 py-3 text-sm text-lp-text">
            Back from Stripe. Current status: <strong>{statusCopy.label}</strong> - {statusCopy.message}
          </div>
        </>
      ) : null}
      {notice === "connect-error" ? (
        <div className="rounded-[10px] border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm font-medium text-lp-text">
          We couldn&apos;t open Stripe setup right now. Your LeaguePour account is safe - please try
          again shortly or contact support if this keeps happening.
        </div>
      ) : null}
      {notice === "connect-in-progress" ? (
        <div className="rounded-[10px] border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm font-medium text-lp-text">
          Stripe setup is already being started (another tab or a fast double-click) - wait a
          second and try again.
        </div>
      ) : null}
      {notice === "connect-refresh" ? (
        <div className="rounded-[10px] border border-lp-border bg-lp-surface/60 px-4 py-3 text-sm text-lp-text">
          Your Stripe setup link expired. Click Continue Stripe setup below to get a new secure
          link.
        </div>
      ) : null}
      <Card className="space-y-5">
        <div>
          <p className="lp-kicker text-lp-accent">QR code</p>
          <h2 className="mt-2 font-display text-xl font-bold text-lp-text">One scan → your public venue page</h2>
          <p className="mt-2 text-sm text-lp-muted">Table tents, posters, coasters. Same link players share in group chat.</p>
        </div>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <img
            src={qr}
            alt="QR code that opens your public venue page when scanned"
            className="h-40 w-40 rounded-lg border border-lp-border-strong bg-white p-2 shadow-lg shadow-black/30"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <p className="break-all font-mono text-xs text-lp-accent md:text-sm">{publicUrl}</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg" variant="secondary">
                <Link href={publicPath}>Open public page</Link>
              </Button>
              <Button size="lg" variant="primary" asChild>
                <a href={qr} download={`${venue.slug}-leaguepour-qr.png`}>
                  Download QR (PNG)
                </a>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="space-y-5 p-5">
        <p className="lp-kicker">Stripe Connect</p>
        <p className="text-sm">
          <span
            className={
              statusCopy.tone === "success"
                ? "font-semibold text-lp-accent"
                : statusCopy.tone === "danger"
                  ? "font-semibold text-red-500"
                  : statusCopy.tone === "warning"
                    ? "font-semibold text-amber-500"
                    : "font-semibold text-lp-text"
            }
          >
            {statusCopy.label}
          </span>
          <span className="text-lp-muted"> - {statusCopy.message}</span>
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          {statusCopy.cta ? (
            <form action={createStripeConnectOnboardingAction}>
              <TrackClick event="stripe_connect_started" params={{ product: "lp" }}>
                <Button type="submit" size="lg">
                  {statusCopy.cta}
                </Button>
              </TrackClick>
            </form>
          ) : null}
          {venue.stripeAccountId ? (
            <form action={refreshStripeConnectStatusAction}>
              <Button type="submit" size="lg" variant="secondary">
                Sync status
              </Button>
            </form>
          ) : null}
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <VenueEntryFeeFlowCard connectStatus={connectStatus} />
      </Card>

      <Card className="space-y-4 p-5">
        <VenueProfileForm
          initial={{
            name: venue.name,
            venueType: venue.venueType,
            description: venue.description,
            formattedAddress: venue.formattedAddress ?? "",
            city: venue.city ?? "",
            state: venue.state ?? "",
            postalCode: venue.postalCode ?? "",
            websiteUrl: venue.websiteUrl ?? "",
            phone: venue.phone ?? "",
            instagramUrl: venue.instagramUrl ?? "",
            facebookUrl: venue.facebookUrl ?? "",
            xUrl: venue.xUrl ?? "",
            tiktokUrl: venue.tiktokUrl ?? "",
            logoUrl: venue.logoUrl ?? "",
            googlePlaceId: venue.googlePlaceId ?? "",
            latitude: venue.latitude ? String(venue.latitude) : "",
            longitude: venue.longitude ? String(venue.longitude) : "",
            billingPlan: venue.billingPlan,
          }}
        />
      </Card>
    </div>
  );
}
