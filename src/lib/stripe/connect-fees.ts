/** LeaguePour takes 5% of the venue's listed entry fee (deducted before the venue receives funds). */
export const PLATFORM_FEE_BPS = 500;

/** Flat service fee charged to the player on top of the entry fee — covers Stripe processing + platform margin. */
export const PLAYER_SERVICE_FEE_CENTS = 150;

/**
 * Stripe Connect destination charges: `application_fee_amount` must be less than the charge amount.
 * Combines the venue-side platform fee (% of entry) + the full player service fee.
 * Both flow through the platform account; only the entry fee portion transfers to the venue.
 */
export function connectApplicationFeeCents(entryFeeCents: number, serviceFeeIncluded = true): number {
  if (entryFeeCents <= 0) return serviceFeeIncluded ? PLAYER_SERVICE_FEE_CENTS : 0;
  const venueFee = Math.floor((entryFeeCents * PLATFORM_FEE_BPS) / 10_000);
  const total = venueFee + (serviceFeeIncluded ? PLAYER_SERVICE_FEE_CENTS : 0);
  const maxFee = Math.max(0, entryFeeCents + (serviceFeeIncluded ? PLAYER_SERVICE_FEE_CENTS : 0) - 1);
  return Math.min(total, maxFee);
}

/** Total amount charged to the player: entry fee + service fee. */
export function playerTotalCents(entryFeeCents: number): number {
  return entryFeeCents + PLAYER_SERVICE_FEE_CENTS;
}
