import { getStripe } from "@/lib/stripe/server";
import { prisma } from "@/lib/db";
import { VsEventStatus } from "@/generated/prisma/enums";
import { TrackView } from "@/components/analytics/track-view";

export const dynamic = "force-dynamic";

export default async function DepositSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    session_id?: string;
    token?: string;
    already_paid?: string;
    no_deposit?: string;
  }>;
}) {
  const { session_id, already_paid, no_deposit } = await searchParams;

  if (no_deposit === "1") {
    return <SuccessView message="No deposit required. Your contract is signed and the venue will be in touch." />;
  }

  if (already_paid === "1") {
    return <SuccessView message="Your deposit is already on file. The venue will be in touch with next steps." />;
  }

  if (!session_id) {
    return <ErrorView message="Missing payment session. If you completed payment, the venue has been notified." />;
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return <ErrorView message="Payment not completed. If you were charged, please contact the venue." />;
    }

    const vsPaymentId = session.metadata?.vsPaymentId;
    let justPaid = false;
    if (vsPaymentId) {
      const payment = await prisma.vsPayment.findUnique({ where: { id: vsPaymentId } });
      if (payment && payment.status !== "PAID") {
        justPaid = true;
        const piId = typeof session.payment_intent === "string" ? session.payment_intent : null;
        await prisma.vsPayment.update({
          where: { id: vsPaymentId },
          data: {
            status: "PAID",
            paidAt: new Date(),
            ...(piId ? { stripePaymentIntentId: piId } : {}),
          },
        });
        await prisma.privateEvent.updateMany({
          where: { id: payment.privateEventId },
          data: { status: VsEventStatus.CONFIRMED },
        });
      }
    }

    return (
      <>
        {justPaid && vsPaymentId ? (
          <TrackView event="deposit_paid" params={{ product: "vs", paymentId: vsPaymentId }} />
        ) : null}
        <SuccessView message="Your deposit has been received and your event date is confirmed." />
      </>
    );
  } catch (err) {
    console.error("[deposit success]", err);
    return <ErrorView message="Could not verify your payment. The venue has been notified — you will not be double-charged." />;
  }
}

function SuccessView({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center space-y-5">
      <div className="text-6xl">🎉</div>
      <h1 className="font-display text-2xl font-bold text-[var(--vs-text)]">You're all set!</h1>
      <p className="text-[var(--vs-text-soft)] leading-relaxed">{message}</p>
      <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface-2)] px-5 py-4 text-sm text-[var(--vs-muted)] text-left space-y-2">
        <p>A receipt from Stripe will arrive in your email shortly.</p>
        <p>The venue team will reach out to confirm the details of your event.</p>
      </div>
    </div>
  );
}

function ErrorView({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center space-y-4">
      <div className="text-5xl">⚠️</div>
      <h1 className="font-display text-2xl font-bold text-[var(--vs-text)]">Payment issue</h1>
      <p className="text-[var(--vs-text-soft)]">{message}</p>
    </div>
  );
}
