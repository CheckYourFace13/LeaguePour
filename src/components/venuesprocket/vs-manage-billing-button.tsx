"use client";

import { useState } from "react";

/** Opens the Stripe billing portal for a venue that already has a VenueSprocket subscription. */
export function VsManageBillingButton({ label = "Manage subscription" }: { label?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/venue/stripe/billing-portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product: "vs" }),
    }).catch(() => null);
    const data = res ? ((await res.json().catch(() => ({}))) as { url?: string; error?: string }) : {};
    if (!res?.ok || !data.url) {
      setError(data.error ?? "Could not open billing. Try again.");
      setLoading(false);
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div>
      <button
        type="button"
        onClick={open}
        disabled={loading}
        className="rounded-lg border border-[var(--vs-accent)] px-4 py-2 text-sm font-semibold text-[var(--vs-accent)] hover:bg-[var(--vs-surface)] disabled:opacity-60"
      >
        {loading ? "Opening…" : label}
      </button>
      {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
