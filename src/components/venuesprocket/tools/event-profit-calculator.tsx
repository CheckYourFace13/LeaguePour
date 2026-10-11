"use client";

import { useState } from "react";
import { NumberField, ResultRow, num, usd } from "./calc-ui";

/**
 * Event profit calculator: revenue minus the costs an event actually adds. Pure arithmetic on the
 * visitor's own inputs - no benchmarks or "typical" margins are asserted.
 */
export function EventProfitCalculator() {
  const [guests, setGuests] = useState("40");
  const [food, setFood] = useState("30");
  const [drinks, setDrinks] = useState("20");
  const [roomFee, setRoomFee] = useState("200");
  const [foodCost, setFoodCost] = useState("32");
  const [bevCost, setBevCost] = useState("22");
  const [staff, setStaff] = useState("4");
  const [hours, setHours] = useState("6");
  const [wage, setWage] = useState("18");
  const [other, setOther] = useState("75");
  const [cardPct, setCardPct] = useState("2.9");
  const [displaced, setDisplaced] = useState("0");

  const g = num(guests);
  const foodRev = g * num(food);
  const bevRev = g * num(drinks);
  const revenue = foodRev + bevRev + num(roomFee);
  const foodCogs = foodRev * (num(foodCost) / 100);
  const bevCogs = bevRev * (num(bevCost) / 100);
  const labor = num(staff) * num(hours) * num(wage);
  const card = revenue * (num(cardPct) / 100);
  const costs = foodCogs + bevCogs + labor + num(other) + card;
  const profit = revenue - costs;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
  const perGuest = g > 0 ? profit / g : 0;
  const vsNormal = profit - num(displaced);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4 rounded-2xl border border-vs-border bg-vs-surface p-6">
        <h2 className="font-display text-lg font-bold text-vs-text">Revenue</h2>
        <NumberField id="guests" label="Guests" value={guests} onChange={setGuests} step="1" />
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField id="food" label="Food revenue per guest" prefix="$" value={food} onChange={setFood} />
          <NumberField id="drinks" label="Beverage revenue per guest" prefix="$" value={drinks} onChange={setDrinks} />
        </div>
        <NumberField id="roomFee" label="Room or buyout fee" prefix="$" value={roomFee} onChange={setRoomFee} />

        <h2 className="pt-2 font-display text-lg font-bold text-vs-text">Costs this event adds</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField id="foodCost" label="Food cost" suffix="% of food" value={foodCost} onChange={setFoodCost} />
          <NumberField id="bevCost" label="Beverage cost" suffix="% of bev" value={bevCost} onChange={setBevCost} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <NumberField id="staff" label="Extra staff" value={staff} onChange={setStaff} step="1" />
          <NumberField id="hours" label="Hours each" value={hours} onChange={setHours} />
          <NumberField id="wage" label="Hourly cost" prefix="$" value={wage} onChange={setWage} />
        </div>
        <NumberField
          id="other"
          label="Other event costs"
          prefix="$"
          value={other}
          onChange={setOther}
          hint="Linens, rentals, decor, extra cleaning - anything you only pay because of this event."
        />
        <NumberField id="cardPct" label="Card processing" suffix="%" value={cardPct} onChange={setCardPct} hint="Use the rate on your own merchant account." />
        <NumberField
          id="displaced"
          label="Profit this space normally makes in that time (optional)"
          prefix="$"
          value={displaced}
          onChange={setDisplaced}
          hint="What you'd have earned from regular business if you hadn't booked the event."
        />
      </div>

      <div className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-vs-border-strong bg-vs-surface">
          <ResultRow
            label="Event revenue"
            value={usd(revenue)}
            math={`${g} × (${usd(num(food))} + ${usd(num(drinks))}) + ${usd(num(roomFee))} room fee`}
          />
          <ResultRow label="Food cost" value={usd(foodCogs)} math={`${usd(foodRev)} × ${num(foodCost)}%`} />
          <ResultRow label="Beverage cost" value={usd(bevCogs)} math={`${usd(bevRev)} × ${num(bevCost)}%`} />
          <ResultRow label="Extra labor" value={usd(labor)} math={`${num(staff)} staff × ${num(hours)} h × ${usd(num(wage))}`} />
          <ResultRow label="Other event costs" value={usd(num(other))} />
          <ResultRow label="Card processing" value={usd(card)} math={`${usd(revenue)} × ${num(cardPct)}%`} />
          <ResultRow label="Event profit (contribution)" value={usd(profit)} math={`${usd(revenue)} − ${usd(costs)}`} strong />
        </div>
        <div className="overflow-hidden rounded-2xl border border-vs-border bg-vs-surface-2">
          <ResultRow label="Margin on event revenue" value={revenue > 0 ? `${margin.toFixed(1)}%` : "—"} math={`${usd(profit)} ÷ ${usd(revenue)}`} />
          <ResultRow label="Profit per guest" value={g > 0 ? usd(perGuest) : "—"} math={`${usd(profit)} ÷ ${g} guests`} />
          {num(displaced) > 0 && (
            <ResultRow
              label="Compared with a normal night in that space"
              value={`${vsNormal >= 0 ? "+" : "−"}${usd(Math.abs(vsNormal))}`}
              math={`${usd(profit)} − ${usd(num(displaced))} normally earned`}
            />
          )}
        </div>
        <p className="text-xs leading-relaxed text-vs-muted">
          This is contribution - revenue minus the costs the event itself adds. Rent, salaried
          managers, utilities, and other overhead you pay either way aren&apos;t included. Service
          charges and tips passed to staff aren&apos;t counted as revenue. It&apos;s arithmetic on your
          inputs, not accounting or tax advice.
        </p>
      </div>
    </div>
  );
}
