"use client";

import { startDepositCheckout } from "@/lib/actions/vs-deposit";

export function DepositCheckoutForm({ token }: { token: string }) {
  return (
    <form action={startDepositCheckout}>
      <input type="hidden" name="token" value={token} />
      <button
        type="submit"
        className="w-full rounded-xl bg-[var(--vs-accent)] py-4 text-base font-bold text-white hover:bg-[var(--vs-accent-hover)] transition-colors"
      >
        Pay deposit with card →
      </button>
      <p className="text-center text-xs text-[var(--vs-muted)] mt-3">
        Secure payment via Stripe. You will not be charged until you confirm on the next screen.
      </p>
    </form>
  );
}
