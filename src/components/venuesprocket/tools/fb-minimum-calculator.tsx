"use client";

import { useState } from "react";
import { NumberField, ResultRow, num, usd } from "./calc-ui";

/**
 * Food & beverage minimum calculator. Pure arithmetic on the visitor's own inputs - no
 * recommendations, no benchmarks, nothing stored or sent anywhere.
 */
export function FbMinimumCalculator() {
  const [guests, setGuests] = useState("40");
  const [food, setFood] = useState("28");
  const [drinks, setDrinks] = useState("18");
  const [minimum, setMinimum] = useState("2000");
  const [service, setService] = useState("20");
  const [tax, setTax] = useState("8");

  const g = num(guests);
  const perGuest = num(food) + num(drinks);
  const projected = g * perGuest;
  const min = num(minimum);
  const shortfall = Math.max(0, min - projected);
  const billable = Math.max(projected, min);
  const serviceAmt = billable * (num(service) / 100);
  const taxAmt = billable * (num(tax) / 100);
  const estimate = billable + serviceAmt + taxAmt;
  const breakEvenGuests = perGuest > 0 ? Math.ceil(min / perGuest) : 0;
  const breakEvenSpend = g > 0 ? min / g : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4 rounded-2xl border border-vs-border bg-vs-surface p-6">
        <h2 className="font-display text-lg font-bold text-vs-text">Your numbers</h2>
        <NumberField id="guests" label="Expected guests" value={guests} onChange={setGuests} step="1" />
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField id="food" label="Food spend per guest" prefix="$" value={food} onChange={setFood} />
          <NumberField id="drinks" label="Beverage spend per guest" prefix="$" value={drinks} onChange={setDrinks} />
        </div>
        <NumberField
          id="minimum"
          label="Food & beverage minimum"
          prefix="$"
          value={minimum}
          onChange={setMinimum}
          hint="The pre-tax, pre-service-charge amount the group agrees to spend. Use 0 to just estimate spend."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField id="service" label="Service charge / auto-gratuity" suffix="%" value={service} onChange={setService} />
          <NumberField id="tax" label="Sales tax" suffix="%" value={tax} onChange={setTax} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-vs-border-strong bg-vs-surface">
          <ResultRow
            label="Projected F&B spend"
            value={usd(projected)}
            math={`${g} guests × (${usd(num(food))} + ${usd(num(drinks))})`}
          />
          <ResultRow
            label="Shortfall vs. minimum"
            value={usd(shortfall)}
            math={`max(0, ${usd(min)} − ${usd(projected)})`}
          />
          <ResultRow
            label="Billed toward F&B"
            value={usd(billable)}
            math={`the higher of projected spend and the minimum`}
          />
          <ResultRow label="Service charge" value={usd(serviceAmt)} math={`${usd(billable)} × ${num(service)}%`} />
          <ResultRow label="Tax" value={usd(taxAmt)} math={`${usd(billable)} × ${num(tax)}%`} />
          <ResultRow label="Estimated F&B total" value={usd(estimate)} strong />
        </div>

        <div className="overflow-hidden rounded-2xl border border-vs-border bg-vs-surface-2">
          <ResultRow
            label="Guests needed to reach the minimum at this spend"
            value={perGuest > 0 ? String(breakEvenGuests) : "—"}
            math={perGuest > 0 ? `⌈${usd(min)} ÷ ${usd(perGuest)}⌉` : "enter a per-guest spend"}
          />
          <ResultRow
            label="Spend per guest needed at this headcount"
            value={g > 0 ? usd(breakEvenSpend) : "—"}
            math={g > 0 ? `${usd(min)} ÷ ${g} guests` : "enter a guest count"}
          />
        </div>

        <p className="text-xs leading-relaxed text-vs-muted">
          This assumes service charge and tax apply to the higher of actual spend and the minimum,
          which is common but not universal - some venues charge them only on actual spend, and tax
          rules on service charges vary by state. Room fees aren&apos;t included. It&apos;s arithmetic on
          your inputs, not pricing, tax, or legal advice.
        </p>
      </div>
    </div>
  );
}
