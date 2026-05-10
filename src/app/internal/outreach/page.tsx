"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { searchBarsForOutreach } from "./actions";

type Bar = {
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  placeId: string;
};

const EMAIL_TEMPLATE = (barName: string) =>
  `Subject: Run dart leagues & tournaments at ${barName} — free to try

Hi ${barName} team,

I wanted to reach out about LeaguePour — a platform built specifically for bars like yours to run dart leagues, cornhole tournaments, trivia nights, pool leagues, and more.

Here's what it does:
• Online player signup (no more paper sheets or phone calls)
• Entry fee collection via Stripe — funds go directly to your account
• Standings, brackets, and player messaging built in
• Players get confirmation emails automatically

Setup takes about 10 minutes and the first competition is free.

If you're already running any kind of weekly event or league night, LeaguePour will save you hours and help you fill seats faster through word-of-mouth and repeat player marketing.

Happy to answer any questions — or you can just try it at leaguepour.com/signup/venue.

Best,
Chris
LeaguePour
https://leaguepour.com`;

export default function OutreachPage() {
  const [city, setCity] = useState("");
  const [results, setResults] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [contacted, setContacted] = useState<Set<string>>(new Set());

  async function search() {
    if (!city.trim()) return;
    setLoading(true);
    setError(null);
    const result = await searchBarsForOutreach(city.trim());
    if (result.error) {
      setError(result.error);
    } else {
      setResults(result.bars ?? []);
    }
    setLoading(false);
  }

  function copyEmail(bar: Bar) {
    navigator.clipboard.writeText(EMAIL_TEMPLATE(bar.name));
    setCopiedId(bar.placeId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function markContacted(placeId: string) {
    setContacted((prev) => new Set([...prev, placeId]));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-lp-text">Bar Outreach Tool</h1>
      <p className="mt-2 text-lp-muted">Find bars in any city and generate outreach emails.</p>

      <div className="mt-8 flex gap-3">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="e.g. Nashville TN, Chicago IL, Austin TX"
          className="flex-1 rounded-[10px] border border-lp-border bg-lp-bg px-4 py-3 text-lp-text placeholder:text-lp-muted focus:outline-none focus:ring-2 focus:ring-lp-accent"
        />
        <Button size="lg" onClick={search} disabled={loading}>
          {loading ? "Searching…" : "Find bars"}
        </Button>
      </div>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {results.length > 0 && (
        <div className="mt-8">
          <p className="text-sm text-lp-muted mb-4">{results.length} bars found — {contacted.size} contacted</p>
          <div className="space-y-4">
            {results.map((bar) => {
              const isContacted = contacted.has(bar.placeId);
              return (
                <div
                  key={bar.placeId}
                  className={`rounded-xl border p-5 ${isContacted ? "border-green-500/30 bg-green-500/5 opacity-60" : "border-lp-border bg-lp-surface/40"}`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-lp-text">{bar.name}</p>
                        {bar.rating && (
                          <span className="text-xs text-lp-muted">★ {bar.rating}</span>
                        )}
                        {isContacted && (
                          <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-semibold text-green-500">Contacted</span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-lp-muted">{bar.address}</p>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs">
                        {bar.phone && <span className="text-lp-muted">{bar.phone}</span>}
                        {bar.website && (
                          <a href={bar.website} target="_blank" rel="noopener noreferrer" className="text-lp-accent hover:underline">
                            {bar.website.replace(/^https?:\/\//, "").split("/")[0]}
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="md"
                        variant="secondary"
                        onClick={() => copyEmail(bar)}
                        disabled={isContacted}
                      >
                        {copiedId === bar.placeId ? "Copied!" : "Copy email"}
                      </Button>
                      {!isContacted && (
                        <Button
                          size="md"
                          onClick={() => markContacted(bar.placeId)}
                        >
                          Mark contacted
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-10 rounded-xl border border-lp-border bg-lp-surface/40 p-6">
          <h2 className="font-semibold text-lp-text mb-3">Email template preview</h2>
          <pre className="whitespace-pre-wrap text-xs text-lp-muted leading-relaxed font-mono">
            {EMAIL_TEMPLATE("[Bar Name]")}
          </pre>
        </div>
      )}
    </div>
  );
}
