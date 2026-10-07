"use client";

import { useState } from "react";
import { NumberField, ResultRow, num, usd } from "./calc-ui";

/**
 * Event deposit calculator. Pure arithmetic on the visitor's own inputs; the card-fee defaults are
 * editable placeholders, not a statement of anyone's actual Stripe pricing.
 */
export function DepositCalculator() {
  const [total, setTotal] = useState("2400");
  const [mode, setMode] = useState<"percent" | "flat">("percent");
  const [percent, setPercent] = useState("25");
  const [flat, setFlat] = useState("500");
  const [eventDate, setEventDate] = useState("");
  const [balanceDays, setBalanceDays] = useState("7");
  const [feePct, setFeePct] = useState("2.9");
  const [feeFixed, setFeeFixed] = useState("0.30");

  const t = num(total);
  const rawDeposit = mode === "percent" ? t * (num(percent) / 100) : num(flat);
  const deposit = Math.min(rawDeposit, t);
  const balance = Math.max(0, t - deposit);
  const fee = deposit > 0 ? deposit * (num(feePct) / 100) + num(feeFixed) : 0;
  const net = Math.max(0, deposit - fee);

  let balanceDue = "";
  if (eventDate) {
    const d = new Date(`${eventDate}T12:00:00`);
    if (!Number.isNaN(d.getTime())) {
      d.setDate(d.getDate() - Math.round(num(balanceDays)));
      balanceDue = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4 rounded-2xl border border-vs-border bg-vs-surface p-6">
        <h2 className="font-display text-lg font-bold text-vs-text">Your numbers</h2>
        <NumberField id="total" label="Estimated event total" prefix="$" value={total} onChange={setTotal} />

        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold text-vs-text">Deposit type</legend>
          <div className="grid grid-cols-2 gap-2">
            {(["percent", "flat"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={
                  mode === m
                    ? "rounded-lg bg-vs-accent px-3 py-2.5 text-sm font-bold text-white"
                    : "rounded-lg border border-vs-border-strong bg-vs-bg px-3 py-2.5 text-sm font-semibold text-vs-text-soft"
                }
              >
                {m === "percent" ? "Percent of total" : "Flat amount"}
              </button>
            ))}
          </div>
        </fieldset>

        {mode === "percent" ? (
          <NumberField id="percent" label="Deposit percent" suffix="%" value={percent} onChange={setPercent} />
        ) : (
          <NumberField id="flat" label="Deposit amount" prefix="$" value={flat} onChange={setFlat} />
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="eventDate" className="mb-1.5 block text-sm font-semibold text-vs-text">
              Event date (optional)
            </label>
            <input
              id="eventDate"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full rounded-lg border border-vs-border-strong bg-vs-bg px-3 py-2.5 text-base text-vs-text outline-none focus:border-vs-accent"
            />
          </div>
          <NumberField id="balanceDays" label="Balance due (days before)" value={balanceDays} onChange={setBalanceDays} step="1" />
        </div>

        <details className="rounded-lg border border-vs-border bg-vs-bg p-4">
          <summary className="cursor-pointer text-sm font-semibold text-vs-text">Card processing estimate</summary>
          <p className="mt-2 mb-3 text-xs text-vs-muted">
            Defaults are a common US card rate as a placeholder - replace them with the rate on your own
            Stripe or merchant account.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField id="feePct" label="Percent fee" suffix="%" value={feePct} onChange={setFeePct} />
            <NumberField id="feeFixed" label="Fixed fee per charge" prefix="$" value={feeFixed} onChange={setFeeFixed} />
          </div>
        </details>
      </div>

      <div className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-vs-border-strong bg-vs-surface">
          <ResultRow
            label="Deposit due at signing"
            value={usd(deposit)}
            math={mode === "percent" ? `${usd(t)} × ${num(percent)}%` : `flat amount (capped at the event total)`}
            strong
          />
          <ResultRow label="Remaining balance" value={usd(balance)} math={`${usd(t)} − ${usd(deposit)}`} />
          {balanceDue && (
            <ResultRow label="Balance due by" value={balanceDue} math={`event date − ${Math.round(num(balanceDays))} days`} />
          )}
          <ResultRow
            label="Estimated card processing on the deposit"
            value={usd(fee)}
            math={`${usd(deposit)} × ${num(feePct)}% + ${usd(num(feeFixed))}`}
          />
          <ResultRow label="Estimated deposit after processing" value={usd(net)} math={`${usd(deposit)} − ${usd(fee)}`} />
        </div>
        <p className="text-xs leading-relaxed text-vs-muted">
          Arithmetic on your inputs only - not legal, tax, or financial advice. Whether a deposit can
          be non-refundable, and how it&apos;s described in your contract, depends on your state&apos;s
          rules; have an attorney review your deposit and cancellation terms.
        </p>
      </div>
    </div>
  );
}
