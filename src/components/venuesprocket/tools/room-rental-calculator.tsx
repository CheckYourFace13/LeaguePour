"use client";

import { useState } from "react";
import { NumberField, ResultRow, num, usd } from "./calc-ui";

/**
 * Room rental pricing calculator. It does NOT output "the right price" - it computes a floor from
 * what the space would otherwise earn plus the costs the booking adds, and shows the equivalent
 * food & beverage minimum. Pure arithmetic on the visitor's own inputs.
 */
export function RoomRentalCalculator() {
  const [normalRevenue, setNormalRevenue] = useState("1500");
  const [normalMargin, setNormalMargin] = useState("35");
  const [hours, setHours] = useState("5");
  const [staffCost, setStaffCost] = useState("250");
  const [setupCost, setSetupCost] = useState("100");
  const [cushion, setCushion] = useState("20");
  const [eventMargin, setEventMargin] = useState("45");

  const displaced = num(normalRevenue) * (num(normalMargin) / 100);
  const added = num(staffCost) + num(setupCost);
  const floor = displaced + added;
  const withCushion = floor * (1 + num(cushion) / 100);
  const perHour = num(hours) > 0 ? withCushion / num(hours) : 0;
  const equivMinimum = num(eventMargin) > 0 ? withCushion / (num(eventMargin) / 100) : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4 rounded-2xl border border-vs-border bg-vs-surface p-6">
        <h2 className="font-display text-lg font-bold text-vs-text">What the space earns without the event</h2>
        <NumberField
          id="normalRevenue"
          label="Typical sales from this space in that time slot"
          prefix="$"
          value={normalRevenue}
          onChange={setNormalRevenue}
          hint="For the same day of week and hours. Use 0 for a room that would otherwise sit empty."
        />
        <NumberField
          id="normalMargin"
          label="What you keep from those sales after food, drink, and hourly labor"
          suffix="%"
          value={normalMargin}
          onChange={setNormalMargin}
        />

        <h2 className="pt-2 font-display text-lg font-bold text-vs-text">What the booking adds</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField id="staffCost" label="Extra staff for the event" prefix="$" value={staffCost} onChange={setStaffCost} />
          <NumberField id="setupCost" label="Setup, cleaning, rentals" prefix="$" value={setupCost} onChange={setSetupCost} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField id="hours" label="Hours blocked (incl. setup)" value={hours} onChange={setHours} />
          <NumberField id="cushion" label="Cushion on top" suffix="%" value={cushion} onChange={setCushion} hint="For the hassle, the risk, and a profit." />
        </div>
        <NumberField
          id="eventMargin"
          label="What you keep from event food & drink sales"
          suffix="%"
          value={eventMargin}
          onChange={setEventMargin}
          hint="Used only to convert the room fee into an equivalent F&B minimum."
        />
      </div>

      <div className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-vs-border-strong bg-vs-surface">
          <ResultRow
            label="Profit you give up by closing the space"
            value={usd(displaced)}
            math={`${usd(num(normalRevenue))} × ${num(normalMargin)}%`}
          />
          <ResultRow label="Costs the booking adds" value={usd(added)} math={`${usd(num(staffCost))} + ${usd(num(setupCost))}`} />
          <ResultRow label="Break-even room fee" value={usd(floor)} math={`${usd(displaced)} + ${usd(added)}`} />
          <ResultRow
            label="Room fee with your cushion"
            value={usd(withCushion)}
            math={`${usd(floor)} × (1 + ${num(cushion)}%)`}
            strong
          />
          <ResultRow label="Per hour blocked" value={num(hours) > 0 ? usd(perHour) : "—"} math={`${usd(withCushion)} ÷ ${num(hours)} h`} />
        </div>
        <div className="overflow-hidden rounded-2xl border border-vs-border bg-vs-surface-2">
          <ResultRow
            label="Or, as a food & beverage minimum instead of a room fee"
            value={num(eventMargin) > 0 ? usd(equivMinimum) : "—"}
            math={`${usd(withCushion)} ÷ ${num(eventMargin)}%`}
          />
        </div>
        <p className="text-xs leading-relaxed text-vs-muted">
          This is a floor, not a recommended price. It tells you the least the booking has to bring in
          to beat a normal night; what you can actually charge depends on your market, the day, and
          demand for the date. The break-even fee assumes the event brings in no food and drink
          profit of its own - if it will, the minimum is usually the better way to price. Arithmetic
          on your inputs only.
        </p>
      </div>
    </div>
  );
}
