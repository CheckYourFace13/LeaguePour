"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlanSelectLink } from "@/components/analytics/plan-select-link";

export type PlanCard = {
  plan: string; // lower-case plan key
  name: string;
  monthlyCents: number;
  annualCents: number;
  featured?: boolean;
  limitLabel: string;
};

const usd = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;

/**
 * LeaguePour plan cards with a real monthly/annual choice. The chosen interval travels in the
 * signup link (&interval=annual) and from there into Stripe Checkout, so "annual" on this page is
 * what the venue is actually billed.
 */
export function PricingPlanGrid({ plans }: { plans: PlanCard[] }) {
  const [interval, setInterval] = useState<"monthly" | "annual">("monthly");
  const annual = interval === "annual";

  return (
    <>
      <div role="radiogroup" aria-label="Billing interval" className="mt-10 inline-flex rounded-full border border-lp-border bg-lp-surface/60 p-1">
        {(["monthly", "annual"] as const).map((i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={interval === i}
            onClick={() => setInterval(i)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              interval === i ? "bg-lp-accent text-white" : "text-lp-text-soft hover:text-lp-text"
            }`}
          >
            {i === "monthly" ? "Monthly" : "Annual - 2 months free"}
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4 md:gap-6">
        {plans.map((t) => (
          <Card key={t.plan} className={`lp-pricing-card ${t.featured ? "lp-feature-ring border-lp-accent/40 md:-translate-y-1" : ""}`}>
            {t.featured ? <p className="lp-kicker text-lp-accent">Most popular</p> : <p className="lp-kicker">Plan</p>}
            <p className="mt-2 font-display text-[1.85rem] font-extrabold tracking-tight text-lp-text">{t.name}</p>
            {annual ? (
              <>
                <p className="mt-5 font-display text-4xl font-extrabold tracking-tight text-lp-text md:text-[2.75rem]">
                  {usd(t.annualCents)}
                  <span className="text-[1.02rem] font-bold text-lp-text-soft"> /yr</span>
                </p>
                <p className="mt-1.5 text-base text-lp-text-soft">
                  About {usd(Math.round(t.annualCents / 12))}/mo, billed yearly ·{" "}
                  <span className="font-semibold text-lp-accent">save {usd(t.monthlyCents * 12 - t.annualCents)}</span>
                </p>
              </>
            ) : (
              <>
                <p className="mt-5 font-display text-4xl font-extrabold tracking-tight text-lp-text md:text-[2.75rem]">
                  {usd(t.monthlyCents)}
                  <span className="text-[1.02rem] font-bold text-lp-text-soft"> /mo</span>
                </p>
                <p className="mt-1.5 text-base text-lp-text-soft">Billed monthly · cancel anytime</p>
              </>
            )}
            <ul className="mt-8 space-y-2.5 text-[1.02rem] leading-snug text-lp-text-soft">
              <li className="flex gap-2">
                <span className="text-lp-accent">|</span>
                <span>{t.limitLabel}</span>
              </li>
              <li className="flex gap-2">
                <span className="text-lp-accent">|</span>
                <span>Stripe Connect entry fees</span>
              </li>
              <li className="flex gap-2">
                <span className="text-lp-accent">|</span>
                <span>Campaigns & audience</span>
              </li>
            </ul>
            <Button className="mt-10 w-full text-[1.05rem]" variant={t.featured ? "primary" : "secondary"} asChild>
              <PlanSelectLink href={`/signup/venue?plan=${t.plan}&interval=${interval}`} plan={t.plan} product="lp">
                Choose {t.name}
              </PlanSelectLink>
            </Button>
          </Card>
        ))}
      </div>
    </>
  );
}
