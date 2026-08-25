import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { DepositCheckoutForm } from "./deposit-checkout-form";

export const dynamic = "force-dynamic";
// Token-gated customer payment page - never indexable, regardless of who links to it.
export const metadata: Metadata = { robots: { index: false, follow: false } };

const notices: Record<string, string> = {
  stripe_not_configured: "Online payments are not configured yet. The venue will contact you about your deposit.",
  no_stripe: "This venue hasn't connected their payment account yet. They will reach out about collecting the deposit.",
  not_signed: "The contract must be signed before paying the deposit.",
  session_failed: "Could not create a payment session. Please try again.",
  stripe_cancel: "Payment cancelled — you have not been charged.",
};

export default async function DepositPayPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; notice?: string; stripe_cancel?: string }>;
}) {
  const { token, notice, stripe_cancel } = await searchParams;
  if (!token) notFound();

  const contract = await prisma.vsContract.findUnique({
    where: { publicToken: token },
    include: {
      proposal: { select: { depositAmount: true } },
      privateEvent: {
        select: {
          id: true,
          eventName: true,
          eventDate: true,
          venue: { select: { name: true, stripeAccountId: true } },
        },
      },
    },
  });

  if (!contract) notFound();

  const depositAmountCents = contract.proposal?.depositAmount ?? 0;
  const venueName = contract.privateEvent.venue.name;
  const eventName = contract.privateEvent.eventName;
  const eventDate = contract.privateEvent.eventDate;
  const canPay = Boolean(contract.privateEvent.venue.stripeAccountId) && depositAmountCents > 0;
  const noticeMsg = notice ? (notices[notice] ?? null) : stripe_cancel ? notices.stripe_cancel : null;

  if (depositAmountCents === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center space-y-4">
        <div className="text-5xl">✅</div>
        <h1 className="font-display text-2xl font-bold text-[var(--vs-text)]">Contract signed</h1>
        <p className="text-[var(--vs-text-soft)]">
          Your contract with <strong>{venueName}</strong> has been signed. No deposit is required — the venue will reach out about next steps.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-14 space-y-6">
      <div className="text-center">
        <div className="text-5xl mb-3">✅</div>
        <h1 className="font-display text-2xl font-bold text-[var(--vs-text)]">Contract signed!</h1>
        <p className="mt-2 text-[var(--vs-text-soft)]">
          Pay your deposit to hold your date with <strong>{venueName}</strong>.
        </p>
      </div>

      {noticeMsg && (
        <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface-2)] px-4 py-3 text-sm text-[var(--vs-muted)]">
          {noticeMsg}
        </div>
      )}

      <div className="rounded-2xl border border-[var(--vs-border)] bg-[var(--vs-surface)] p-6 space-y-5">
        <div className="flex justify-between items-start border-b border-[var(--vs-border)] pb-4">
          <div>
            <p className="font-semibold text-[var(--vs-text)]">{eventName}</p>
            <p className="text-sm text-[var(--vs-muted)]">{venueName}</p>
            {eventDate && (
              <p className="text-xs text-[var(--vs-muted)] mt-0.5">
                {eventDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[var(--vs-accent)]">
              ${(depositAmountCents / 100).toFixed(2)}
            </p>
            <p className="text-xs text-[var(--vs-muted)]">deposit due</p>
          </div>
        </div>

        {canPay ? (
          <DepositCheckoutForm token={token} />
        ) : (
          <div className="rounded-lg border border-[var(--vs-border)] bg-[var(--vs-surface-2)] p-4 text-sm text-[var(--vs-muted)]">
            The venue will contact you directly with payment instructions for your deposit.
          </div>
        )}
      </div>

      <p className="text-center text-xs text-[var(--vs-muted)]">
        Questions? Contact {venueName} directly.
      </p>
    </div>
  );
}
