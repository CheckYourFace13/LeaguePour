"use client";

import { Button } from "@/components/ui/button";

/** Send / schedule entry point from Messages; delivery is gated until ESP wiring ships. */
export function CampaignSendNowButton() {
  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
      <Button type="button" size="lg" className="w-full" disabled title="Email delivery launching soon">
        Send now (in-app)
      </Button>
      <span className="rounded-full border border-lp-border bg-lp-surface/60 px-3 py-1 text-center text-xs font-semibold text-lp-muted sm:text-right">
        Email delivery launching soon
      </span>
    </div>
  );
}
