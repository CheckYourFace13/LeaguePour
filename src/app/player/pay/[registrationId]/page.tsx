import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { PaymentStatus, RegistrationStatus } from "@/generated/prisma/enums";
import { CheckoutReturnPoller } from "@/components/player/checkout-return-poller";
import { isStripePaymentsConfigured } from "@/lib/stripe/env";
import { getStripe } from "@/lib/stripe/server";
import { playerAppRoutes } from "@/lib/routes";
import { formatMoney } from "@/lib/utils";
import { startStripeCheckoutForRegistrationFormAction } from "./actions";

export const dynamic = "force-dynamic";

const notices: Record<string, string> = {
  stripe_sync_failed:
    "We could not verify that Stripe checkout session. Wait a few seconds and refresh, or open My competitions.",
  stripe_cancel: "Checkout was cancelled — you have not been charged.",
  stripe_not_configured: "Stripe is not configured on this server yet (missing STRIPE_SECRET_KEY).",
  stripe_session_failed: "Stripe did not return a checkout URL. Try again in a moment.",
  paid: "This registration is already paid and confirmed.",
  session_mismatch: "That Stripe session does not match this registration.",
  venue_connect_required:
    "This venue has not finished Stripe Connect (charges + payouts). Entry fees cannot be collected until they do — ask the venue to open Venue profile and complete Connect.",
};

export default async function PayRegistrationPage({
  params,
  searchParams,
}: {
  params: Promise<{ registrationId: string }>;
  searchParams: Promise<{
    session_id?: string;
    stripe_cancel?: string;
    notice?: string;
    awaiting_webhook?: string;
  }>;
}) {
  const { registrationId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/player/pay/${registrationId}`)}`);
  }

  const sp = await searchParams;

  /** Stripe success_url — verify session belongs to this user; fulfillment is webhook-only (no DB writes here). */
  if (sp.session_id) {
    try {
      if (!isStripePaymentsConfigured()) {
        redirect(`/player/pay/${registrationId}?notice=stripe_not_configured`);
      }
      const stripe = getStripe();
      const checkoutSession = await stripe.checkout.sessions.retrieve(sp.session_id);
      if (checkoutSession.metadata?.registrationId !== registrationId) {
        redirect(`/player/pay/${registrationId}?notice=session_mismatch`);
      }
      if (checkoutSession.metadata?.playerUserId !== session.user.id) {
        redirect(`/player/pay/${registrationId}?notice=session_mismatch`);
      }
      redirect(`/player/pay/${registrationId}?awaiting_webhook=1`);
    } catch (e) {
      console.error("[player/pay] checkout session verify failed", e);
      redirect(`/player/pay/${registrationId}?notice=stripe_sync_failed`);
    }
  }

  const reg = await prisma.competitionRegistration.findFirst({
    where: { id: registrationId, userId: session.user.id },
    include: {
      payment: true,
      competition: {
        include: {
          venue: {
            select: {
              name: true,
              slug: true,
              stripeAccountId: true,
              stripeChargesEnabled: true,
              stripePayoutsEnabled: true,
            },
          },
        },
      },
    },
  });
  if (!reg) notFound();

  const feeCents = reg.competition.entryFeeCents;
  const stripeReady = isStripePaymentsConfigured();
  const venueConnectReady =
    Boolean(reg.competition.venue.stripeAccountId) &&
    reg.competition.venue.stripeChargesEnabled &&
    reg.competition.venue.stripePayoutsEnabled;
  const canStartCheckout = stripeReady && venueConnectReady;

  if (feeCents <= 0) {
    redirect("/player/competitions");
  }

  const paidAndConfirmed =
    reg.status === RegistrationStatus.CONFIRMED &&
    reg.payment?.status === PaymentStatus.SUCCEEDED;

  if (paidAndConfirmed) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 md:px-6 md:py-16">
        <p className="lp-kicker">Entry paid</p>
        <h1 className="lp-page-title mt-3 text-3xl md:text-4xl">You are confirmed</h1>
        <p className="mt-3 text-base text-lp-muted">{reg.competition.venue.name}</p>
        <Card className="mt-8 space-y-4 p-6">
          <p className="font-display text-xl font-bold text-lp-text">{reg.competition.title}</p>
          <p className="text-sm text-lp-muted">
            Payment is complete — nothing else to do here. Head back to your competitions or the public event page.
          </p>
          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href={playerAppRoutes.competitions}>My competitions</Link>
            </Button>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto" asChild>
              <Link href={`/c/${reg.competition.venue.slug}/${reg.competition.slug}`}>Public event page</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (reg.status !== RegistrationStatus.PENDING_PAYMENT || !reg.payment) {
    redirect("/player/competitions");
  }

  const awaitingWebhook = sp.awaiting_webhook === "1";

  return (
    <div className="mx-auto max-w-lg px-4 py-12 md:px-6 md:py-16">
      <p className="lp-kicker">{stripeReady ? "Stripe checkout" : "Payments unavailable"}</p>
      <h1 className="lp-page-title mt-3 text-3xl md:text-4xl">Pay entry fee</h1>
      <p className="mt-3 text-base text-lp-muted">{reg.competition.venue.name}</p>

      {sp.notice && notices[sp.notice] ? (
        <div
          className={
            sp.notice === "stripe_cancel" ||
            sp.notice === "stripe_sync_failed" ||
            sp.notice === "stripe_not_configured" ||
            sp.notice === "venue_connect_required"
              ? "mt-6 rounded-[10px] border border-lp-border bg-lp-surface/60 px-4 py-3 text-sm text-lp-text"
              : "mt-6 rounded-[10px] border border-lp-accent/35 bg-lp-accent/10 px-4 py-3 text-sm font-medium text-lp-text"
          }
        >
          {notices[sp.notice]}
        </div>
      ) : null}

      {stripeReady && !venueConnectReady ? (
        <div className="mt-6 rounded-[10px] border border-lp-border bg-lp-surface/60 px-4 py-3 text-sm text-lp-text">
          This venue is still setting up Stripe Connect. Paid checkout stays off until charges and payouts are enabled.
        </div>
      ) : null}

      {awaitingWebhook ? (
        <div className="mt-6 space-y-3 rounded-[10px] border border-lp-accent/35 bg-lp-accent/10 px-4 py-4 text-sm text-lp-text">
          <p className="font-semibold text-lp-text">Finishing up with Stripe</p>
          <p className="leading-relaxed text-lp-muted">
            You returned from Stripe. We finalize your registration as soon as the payment is confirmed (usually within
            a few seconds). This page refreshes automatically — you can also refresh manually.
          </p>
          <CheckoutReturnPoller />
        </div>
      ) : null}

      <Card className="mt-8 space-y-5 p-6">
        <div>
          <p className="font-display text-xl font-bold text-lp-text">{reg.competition.title}</p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-lp-text">
            {formatMoney(reg.payment.amountCents, reg.payment.currency)}
          </p>
        </div>
        {stripeReady ? (
          <>
            <Badge variant="accent">Secured by Stripe</Badge>
            <p className="text-sm leading-relaxed text-lp-muted">
              You will pay on Stripe. Your registration confirms here right after the payment succeeds (this page
              refreshes automatically when you return).
            </p>
            <form action={startStripeCheckoutForRegistrationFormAction} className="pt-1">
              <input type="hidden" name="registrationId" value={registrationId} />
              <Button type="submit" size="lg" className="w-full min-h-12 text-base" disabled={!canStartCheckout}>
                Continue to Stripe Checkout
              </Button>
            </form>
          </>
        ) : (
          <>
            <Badge variant="muted">Stripe not configured</Badge>
            <p className="text-sm leading-relaxed text-lp-muted">
              This environment is missing Stripe keys, so checkout cannot start. Add STRIPE_SECRET_KEY and related env
              vars, then reload.
            </p>
          </>
        )}
        <Button variant="ghost" className="w-full min-h-12 text-base" asChild>
          <Link href={`/c/${reg.competition.venue.slug}/${reg.competition.slug}`}>Back to event</Link>
        </Button>
      </Card>
    </div>
  );
}
