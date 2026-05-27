import { formatUsdCents } from "@/lib/pricing";
import {
  connectApplicationFeeCents,
  PLATFORM_FEE_BPS,
  PLAYER_SERVICE_FEE_CENTS,
  playerTotalCents,
} from "@/lib/stripe/connect-fees";

type Props = {
  stripeChargesEnabled: boolean;
  stripePayoutsEnabled: boolean;
  stripeAccountId: string | null;
};

const EXAMPLE_ENTRY_CENTS = 1000; // $10 example

export function VenueEntryFeeFlowCard({ stripeChargesEnabled, stripePayoutsEnabled, stripeAccountId }: Props) {
  const entry = EXAMPLE_ENTRY_CENTS;
  const serviceFee = PLAYER_SERVICE_FEE_CENTS;
  const platformPct = PLATFORM_FEE_BPS / 100;
  const playerTotal = playerTotalCents(entry);
  const appFee = connectApplicationFeeCents(entry, true);
  const venueFeeOnly = appFee - serviceFee; // the 5% portion from venue's share
  const venueReceives = playerTotal - appFee;
  const connectLive = Boolean(stripeAccountId) && stripeChargesEnabled && stripePayoutsEnabled;

  return (
    <div className="space-y-5">
      <div>
        <p className="lp-kicker text-lp-accent">How entry fee payments work</p>
        <p className="mt-2 text-sm leading-relaxed text-lp-muted">
          LeaguePour uses <strong className="text-lp-text">Stripe Connect</strong> - entry fees go straight to your bank
          account, we never hold your money. Two small fees apply: a{" "}
          <strong className="text-lp-text">{platformPct}% venue fee</strong> deducted from your payout, plus a{" "}
          <strong className="text-lp-text">{formatUsdCents(serviceFee)} service fee</strong> added on top for the
          player. Stripe's processing costs come out of the service fee - you don't pay them.
        </p>
      </div>

      <div className="rounded-[10px] border border-lp-border bg-lp-bg/60 p-4 text-sm space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-lp-muted">
          Example - {formatUsdCents(entry)} entry fee
        </p>

        <div className="space-y-1.5">
          <div className="flex justify-between font-medium text-lp-text">
            <span>Player pays at checkout</span>
            <span className="font-mono">{formatUsdCents(playerTotal)}</span>
          </div>
          <div className="flex justify-between text-lp-muted pl-3">
            <span>Entry fee</span>
            <span className="font-mono">{formatUsdCents(entry)}</span>
          </div>
          <div className="flex justify-between text-lp-muted pl-3">
            <span>LeaguePour service fee</span>
            <span className="font-mono">+{formatUsdCents(serviceFee)}</span>
          </div>
        </div>

        <div className="border-t border-lp-border pt-3 space-y-1.5">
          <div className="flex justify-between font-semibold text-lp-text">
            <span>You receive (deposited by Stripe)</span>
            <span className="font-mono text-lp-accent">{formatUsdCents(venueReceives)}</span>
          </div>
          <div className="flex justify-between text-lp-muted pl-3">
            <span>LeaguePour venue fee ({platformPct}%)</span>
            <span className="font-mono">−{formatUsdCents(venueFeeOnly)}</span>
          </div>
        </div>
      </div>

      <p className="text-sm">
        Connect status:{" "}
        <span className={connectLive ? "font-semibold text-lp-accent" : "font-semibold text-amber-500"}>
          {connectLive
            ? "Ready - players can pay entry fees"
            : stripeAccountId
              ? "Stripe account exists but setup is incomplete - click Continue Stripe setup"
              : "Not connected - complete Stripe setup so players can pay"}
        </span>
      </p>
    </div>
  );
}
