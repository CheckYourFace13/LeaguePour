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
import {
  createStripeConnectOnboardingAction,
  refreshStripeConnectStatusAction,
} from "./actions";

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
        <p className="text-sm text-lp-muted">
          Charges {venue.stripeChargesEnabled ? "on" : "off"} · Payouts {venue.stripePayoutsEnabled ? "on" : "off"}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <form action={createStripeConnectOnboardingAction}>
            <Button type="submit" size="lg">
              {venue.stripeAccountId ? "Continue Stripe setup" : "Connect Stripe"}
            </Button>
          </form>
          <form action={refreshStripeConnectStatusAction}>
            <Button type="submit" size="lg" variant="secondary">
              Sync status
            </Button>
          </form>
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <VenueEntryFeeFlowCard
          platformFeeBps={venue.platformFeeBps}
          stripeChargesEnabled={venue.stripeChargesEnabled}
          stripePayoutsEnabled={venue.stripePayoutsEnabled}
          stripeAccountId={venue.stripeAccountId}
        />
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
            platformFeePercent: venue.platformFeeBps / 100,
          }}
        />
      </Card>
    </div>
  );
}
