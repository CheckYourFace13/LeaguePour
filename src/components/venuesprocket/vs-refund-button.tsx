"use client";

import { refundVsDepositAction } from "@/lib/actions/vs-deposit-refund";

/**
 * Refund control for a PAID VenueSprocket deposit row. A plain form posting to the server action
 * (server does all authorization and the Stripe call); the only job here is the required
 * "Refund $X?" confirmation before submit. The underlying financial row is never deleted - a
 * refund only transitions status.
 */
export function VsRefundButton({ vsPaymentId, amountLabel }: { vsPaymentId: string; amountLabel: string }) {
  return (
    <form
      action={refundVsDepositAction}
      onSubmit={(e) => {
        if (!window.confirm(`Refund ${amountLabel}? This issues a real refund to the customer's card and cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="vsPaymentId" value={vsPaymentId} />
      <button
        type="submit"
        className="rounded-lg border border-[var(--vs-border-strong)] px-3 py-1.5 text-xs font-semibold text-[var(--vs-text)] hover:border-[var(--vs-accent)] hover:text-[var(--vs-accent)]"
      >
        Refund
      </button>
    </form>
  );
}
