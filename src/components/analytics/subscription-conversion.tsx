"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Reports `subscription_activated` at most once per Stripe subscription. The server decides
 * (POST /api/billing/conversion claims a webhook-armed marker atomically), so a reload, another
 * tab, or a revisited return URL gets "none". Right after Checkout (`poll`) it retries for a
 * minute in case the webhook lands after the redirect.
 */
export function SubscriptionConversion({ product, poll }: { product: "lp" | "vs"; poll: boolean }) {
  useEffect(() => {
    let stopped = false;
    let attempts = 0;
    const maxAttempts = poll ? 20 : 1;
    async function check() {
      attempts++;
      const res = await fetch("/api/billing/conversion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product }),
      }).catch(() => null);
      const data = res?.ok ? ((await res.json().catch(() => null)) as {
        status?: string;
        subscriptionId?: string;
        plan?: string;
        interval?: string;
      } | null) : null;
      if (stopped) return;
      if (data?.status === "counted") {
        trackEvent("subscription_activated", {
          product,
          transaction_id: data.subscriptionId,
          plan: data.plan,
          interval: data.interval,
        });
        return;
      }
      if (attempts < maxAttempts) setTimeout(check, 3000);
    }
    void check();
    return () => {
      stopped = true;
    };
  }, [product, poll]);
  return null;
}
