"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PLAN_DEFINITIONS, formatUsdCents } from "@/lib/pricing";
import { subscriptionStatusLabel, subscriptionIsActive } from "@/lib/stripe/billing";
import type { BillingPlan } from "@/generated/prisma/enums";

type Props = {
  currentPlan: BillingPlan;
  subscriptionStatus: string | null;
  subscriptionPeriodEnd: Date | null;
  hasBillingCustomer: boolean;
};

type Interval = "monthly" | "annual";

export function BillingCard({ currentPlan, subscriptionStatus, subscriptionPeriodEnd, hasBillingCustomer }: Props) {
  const [interval, setInterval] = useState<Interval>("monthly");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isActive = subscriptionIsActive(subscriptionStatus);
  // A past_due/unpaid subscription still has a real Stripe customer and a card Stripe is
  // actively retrying - the billing portal (which only requires a customer id, not an active
  // subscription - see /api/venue/stripe/billing-portal) is where they fix it. Previously these
  // venues fell through to the "choose a plan" signup grid below, which reads as "you have no
  // subscription" even though they do and just need to update a card.
  const needsPaymentFix = (subscriptionStatus === "past_due" || subscriptionStatus === "unpaid") && hasBillingCustomer;

  async function subscribe(plan: BillingPlan) {
    setLoading(plan);
    setError(null);
    const res = await fetch("/api/venue/stripe/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, interval }),
    });
    const data = await res.json().catch(() => ({})) as { url?: string; error?: string };
    if (!res.ok || !data.url) {
      setError(data.error ?? "Something went wrong. Try again.");
      setLoading(null);
      return;
    }
    window.location.href = data.url;
  }

  async function openPortal() {
    setLoading("portal");
    setError(null);
    const res = await fetch("/api/venue/stripe/billing-portal", { method: "POST" });
    const data = await res.json().catch(() => ({})) as { url?: string; error?: string };
    if (!res.ok || !data.url) {
      setError(data.error ?? "Could not open billing portal.");
      setLoading(null);
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="lp-kicker text-lp-accent">Subscription</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <p className="font-display text-xl font-bold text-lp-text capitalize">{currentPlan.toLowerCase()} plan</p>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isActive
                ? "bg-lp-accent/15 text-lp-accent"
                : subscriptionStatus === "past_due" || subscriptionStatus === "unpaid"
                  ? "bg-amber-500/15 text-amber-500"
                  : "bg-lp-border text-lp-muted"
            }`}
          >
            {subscriptionStatusLabel(subscriptionStatus)}
          </span>
        </div>
        {subscriptionPeriodEnd && isActive && (
          <p className="mt-1 text-sm text-lp-muted">
            Renews {new Date(subscriptionPeriodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        )}
      </div>

      {isActive && hasBillingCustomer ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button size="lg" variant="secondary" onClick={openPortal} disabled={loading === "portal"}>
            {loading === "portal" ? "Opening…" : "Manage subscription"}
          </Button>
        </div>
      ) : needsPaymentFix ? (
        <div className="space-y-3">
          <p className="text-sm text-lp-muted">
            Your last payment didn&apos;t go through. Update your payment method to keep your plan active.
          </p>
          <Button size="lg" variant="primary" onClick={openPortal} disabled={loading === "portal"}>
            {loading === "portal" ? "Opening…" : "Update payment method"}
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-lp-muted">
            {subscriptionStatus === "canceled"
              ? "Your subscription has ended. Choose a plan below to reactivate."
              : "Choose a plan to start your subscription and access all features."}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setInterval("monthly")}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                interval === "monthly" ? "bg-lp-accent text-white" : "bg-lp-surface text-lp-muted hover:text-lp-text"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setInterval("annual")}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                interval === "annual" ? "bg-lp-accent text-white" : "bg-lp-surface text-lp-muted hover:text-lp-text"
              }`}
            >
              Annual <span className="text-xs opacity-80">−10%</span>
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PLAN_DEFINITIONS.map((p) => {
              const price = interval === "monthly" ? p.monthlyCents : Math.round(p.annualCents / 12);
              const isCurrent = p.plan === currentPlan;
              return (
                <div
                  key={p.plan}
                  className={`rounded-[10px] border p-4 space-y-3 ${
                    p.featured ? "border-lp-accent/40" : "border-lp-border"
                  }`}
                >
                  <div>
                    <p className="font-semibold text-lp-text">{p.name}</p>
                    <p className="font-mono text-lg font-bold text-lp-text">
                      {formatUsdCents(price)}<span className="text-xs font-normal text-lp-muted">/mo</span>
                    </p>
                    <p className="text-xs text-lp-muted">{p.eventLimitLabel}</p>
                  </div>
                  <Button
                    size="md"
                    variant={isCurrent ? "secondary" : p.featured ? "primary" : "secondary"}
                    className="w-full"
                    onClick={() => subscribe(p.plan)}
                    disabled={loading !== null}
                  >
                    {loading === p.plan ? "Loading…" : isCurrent ? "Current plan" : "Subscribe"}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
