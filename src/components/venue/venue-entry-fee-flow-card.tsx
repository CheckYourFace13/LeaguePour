import { formatUsdCents } from "@/lib/pricing";
import { connectApplicationFeeCents } from "@/lib/stripe/connect-fees";

type Props = {
  platformFeeBps: number;
  stripeChargesEnabled: boolean;
  stripePayoutsEnabled: boolean;
  stripeAccountId: string | null;
};

const EXAMPLE_GROSS_CENTS = 10_000;

export function VenueEntryFeeFlowCard({
  platformFeeBps,
  stripeChargesEnabled,
  stripePayoutsEnabled,
  stripeAccountId,
}: Props) {
  const pctLabel = (platformFeeBps / 100).toLocaleString("en-US", { maximumFractionDigits: 2 });
  const platformKeeps = connectApplicationFeeCents(EXAMPLE_GROSS_CENTS, platformFeeBps);
  const venueTransfer = EXAMPLE_GROSS_CENTS - platformKeeps;
  const connectLive =
    Boolean(stripeAccountId) && stripeChargesEnabled && stripePayoutsEnabled;

  return (
    <div className="space-y-4 rounded-[10px] border border-lp-border bg-lp-surface/30 p-5">
      <div>
        <p className="lp-kicker">Entry fees (Stripe Connect)</p>
        <p className="mt-2 text-sm leading-relaxed text-lp-muted">
          Paid registrations use a <strong className="text-lp-text">destination charge</strong> on your connected
          account. LeaguePour takes your platform fee as Stripe’s <code className="text-xs">application_fee_amount</code>
          ; the remainder is transferred to the venue.
        </p>
      </div>
      <div className="rounded-[10px] border border-lp-border bg-lp-bg/60 p-4 text-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-lp-muted">Example (card total)</p>
        <p className="mt-2 font-mono text-lp-text">{formatUsdCents(EXAMPLE_GROSS_CENTS)} charged to player</p>
        <ul className="mt-3 space-y-2 text-lp-muted">
          <li>
            <span className="text-lp-text">LeaguePour</span> · platform fee ({pctLabel}%) ·{" "}
            <span className="font-mono tabular-nums text-lp-text">{formatUsdCents(platformKeeps)}</span>
          </li>
          <li>
            <span className="text-lp-text">Venue (Connect)</span> · transfer (gross − platform fee) ·{" "}
            <span className="font-mono tabular-nums text-lp-text">{formatUsdCents(venueTransfer)}</span>
          </li>
        </ul>
      </div>
      <p className="text-xs leading-relaxed text-lp-muted">
        <strong className="text-lp-text">Stripe processing fees</strong> are recorded on the underlying charge. With
        destination charges, Stripe typically debits those fees from the platform’s balance; exact cents per payment
        appear under <strong className="text-lp-text">Stripe Dashboard → Payments → Balance transactions</strong> (they
        vary by card and pricing).
      </p>
      <p className="text-xs text-lp-muted">
        Connect payouts:{" "}
        <span className={connectLive ? "font-semibold text-lp-accent" : "font-semibold text-lp-text"}>
          {connectLive ? "Ready to collect entry fees" : "Finish Connect (charges + payouts) before players can pay"}
        </span>
        .
      </p>
    </div>
  );
}
