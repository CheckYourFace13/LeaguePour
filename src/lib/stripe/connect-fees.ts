/**
 * Stripe Connect destination charges: `application_fee_amount` must be less than the charge amount
 * when funds are transferred to the connected account. We floor on bps and cap defensively.
 */
export function connectApplicationFeeCents(amountCents: number, platformFeeBps: number): number {
  if (amountCents <= 0 || platformFeeBps <= 0) return 0;
  const raw = Math.floor((amountCents * platformFeeBps) / 10_000);
  const maxFee = Math.max(0, amountCents - 1);
  return Math.min(raw, maxFee);
}
