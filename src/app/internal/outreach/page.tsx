"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  getOutreachStats,
  sweepNextCity,
  updateContactStatus,
  getContacts,
  getSweptCityList,
} from "./sweep-actions";

type Contact = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string | null;
  website: string | null;
  rating: number | null;
  status: string;
  emailSentAt: Date | null;
  notes: string | null;
};

type Stats = {
  totalCities: number;
  sweptCities: number;
  totalContacts: number;
  notContacted: number;
  emailSent: number;
  responded: number;
  signedUp: number;
  notInterested: number;
  nextCity: { city: string; state: string; country: string; query: string } | null;
  allSwept: boolean;
};

const EMAIL_TEMPLATE = (barName: string) =>
  `Subject: Run dart leagues & tournaments at ${barName} - free to try

Hi ${barName} team,

I wanted to reach out about LeaguePour, a platform built specifically for bars like yours to run dart leagues, cornhole tournaments, trivia nights, pool leagues, and more.

Here's what it does:
• Online player signup (no more paper sheets or phone calls)
• Entry fee collection via Stripe - funds go directly to your account
• Standings, brackets, and player messaging built in
• Players get confirmation emails automatically

Setup takes about 10 minutes and the first competition is free.

If you're already running any kind of weekly event or league night, LeaguePour will save you hours and help you fill seats faster through word-of-mouth and repeat player marketing.

Happy to answer any questions - or you can just try it at leaguepour.com/signup/venue.

Best,
Chris
LeaguePour
https://leaguepour.com`;

const STATUS_LABELS: Record<string, string> = {
  NOT_CONTACTED: "Not contacted",
  EMAIL_SENT: "Emailed",
  RESPONDED: "Responded",
  SIGNED_UP: "Signed up",
  NOT_INTERESTED: "Not interested",
};

const STATUS_COLORS: Record<string, string> = {
  NOT_CONTACTED: "bg-zinc-500/10 text-zinc-400",
  EMAIL_SENT: "bg-blue-500/10 text-blue-400",
  RESPONDED: "bg-yellow-500/10 text-yellow-400",
  SIGNED_UP: "bg-green-500/10 text-green-400",
  NOT_INTERESTED: "bg-red-500/10 text-red-400",
};

export default function OutreachPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sweptCities, setSweptCities] = useState<{ city: string; state: string }[]>([]);
  const [sweeping, setSweeping] = useState(false);
  const [sweepResult, setSweepResult] = useState<string | null>(null);
  const [autoSweep, setAutoSweep] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const PAGE_SIZE = 50;

  const loadStats = useCallback(async () => {
    const s = await getOutreachStats();
    setStats(s as Stats);
  }, []);

  const loadContacts = useCallback(async () => {
    const result = await getContacts({
      city: cityFilter || undefined,
      status: statusFilter || undefined,
      page,
      pageSize: PAGE_SIZE,
    });
    setContacts(result.contacts as Contact[]);
    setTotal(result.total);
  }, [cityFilter, statusFilter, page]);

  const loadSweptCities = useCallback(async () => {
    const rows = await getSweptCityList();
    setSweptCities(rows);
  }, []);

  useEffect(() => {
    void loadStats();
    void loadSweptCities();
  }, [loadStats, loadSweptCities]);

  useEffect(() => {
    void loadContacts();
  }, [loadContacts]);

  async function runSweep() {
    setSweeping(true);
    setSweepResult(null);
    try {
      const result = await sweepNextCity();
      if (result.error) {
        setSweepResult(`Error: ${result.error}`);
      } else if (result.allDone) {
        setSweepResult("All cities complete - restarting from Chicago.");
      } else {
        setSweepResult(
          `Swept ${result.city?.city}, ${result.city?.state}: ${result.added} new contacts added, ${result.skipped} already known.`,
        );
      }
      await Promise.all([loadStats(), loadContacts(), loadSweptCities()]);
    } finally {
      setSweeping(false);
    }
  }

  // Auto-sweep: trigger next sweep after a short delay when enabled
  useEffect(() => {
    if (!autoSweep || sweeping) return;
    const t = setTimeout(() => {
      void runSweep();
    }, 1500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSweep, sweeping, stats?.sweptCities]);

  function copyEmail(c: Contact) {
    navigator.clipboard.writeText(EMAIL_TEMPLATE(c.name));
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function setStatus(contact: Contact, status: string) {
    startTransition(async () => {
      await updateContactStatus(
        contact.id,
        status as "NOT_CONTACTED" | "EMAIL_SENT" | "RESPONDED" | "SIGNED_UP" | "NOT_INTERESTED",
      );
      setContacts((prev) => prev.map((c) => (c.id === contact.id ? { ...c, status } : c)));
      await loadStats();
    });
  }

  const pct = stats ? Math.round((stats.sweptCities / stats.totalCities) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-lp-text">Bar Outreach</h1>
          <p className="mt-1 text-lp-muted text-sm">
            Automated sweep - {stats?.sweptCities ?? 0} of {stats?.totalCities ?? 0} cities covered
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-lp-muted cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-4 h-4 accent-lp-accent"
              checked={autoSweep}
              onChange={(e) => setAutoSweep(e.target.checked)}
            />
            Auto-sweep
          </label>
          <Button size="lg" onClick={runSweep} disabled={sweeping || autoSweep}>
            {sweeping ? "Sweeping…" : "Sweep next city"}
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6 rounded-xl border border-lp-border bg-lp-surface/40 p-5">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-lp-text font-medium">
            {stats?.nextCity
              ? `Next: ${stats.nextCity.city}, ${stats.nextCity.state}`
              : "All cities swept"}
          </span>
          <span className="text-lp-muted">{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-lp-border overflow-hidden">
          <div
            className="h-full rounded-full bg-lp-accent transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        {sweepResult && (
          <p className="mt-3 text-sm text-lp-muted">{sweepResult}</p>
        )}
      </div>

      {/* Stat cards */}
      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {[
            { label: "Contacts found", value: stats.totalContacts },
            { label: "Not contacted", value: stats.notContacted },
            { label: "Emailed", value: stats.emailSent },
            { label: "Responded", value: stats.responded },
            { label: "Signed up", value: stats.signedUp },
            { label: "Not interested", value: stats.notInterested },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-lp-border bg-lp-surface/40 p-4 text-center"
            >
              <p className="text-2xl font-bold text-lp-text">{s.value.toLocaleString()}</p>
              <p className="mt-1 text-xs text-lp-muted">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="mt-8 flex flex-wrap gap-3">
        <select
          value={cityFilter}
          onChange={(e) => { setCityFilter(e.target.value); setPage(0); }}
          className="rounded-lg border border-lp-border bg-lp-bg px-3 py-2 text-sm text-lp-text focus:outline-none focus:ring-2 focus:ring-lp-accent"
        >
          <option value="">All cities</option>
          {sweptCities.map((c) => (
            <option key={`${c.city}|${c.state}`} value={c.city}>
              {c.city}, {c.state}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="rounded-lg border border-lp-border bg-lp-bg px-3 py-2 text-sm text-lp-text focus:outline-none focus:ring-2 focus:ring-lp-accent"
        >
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <span className="ml-auto text-sm text-lp-muted self-center">
          {total.toLocaleString()} contacts
        </span>
      </div>

      {/* Contact list */}
      <div className="mt-4 space-y-3">
        {contacts.length === 0 && (
          <div className="rounded-xl border border-lp-border bg-lp-surface/20 p-10 text-center">
            <p className="text-lp-muted text-sm">
              {stats?.sweptCities === 0
                ? 'No contacts yet - hit "Sweep next city" to start.'
                : "No contacts match the current filter."}
            </p>
          </div>
        )}
        {contacts.map((bar) => (
          <div
            key={bar.id}
            className="rounded-xl border border-lp-border bg-lp-surface/40 p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-lp-text">{bar.name}</p>
                  {bar.rating && (
                    <span className="text-xs text-lp-muted">★ {bar.rating}</span>
                  )}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[bar.status] ?? ""}`}
                  >
                    {STATUS_LABELS[bar.status] ?? bar.status}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-lp-muted">{bar.address}</p>
                <div className="mt-1.5 flex flex-wrap gap-3 text-xs">
                  {bar.phone && <span className="text-lp-muted">{bar.phone}</span>}
                  {bar.website && (
                    <a
                      href={bar.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lp-accent hover:underline truncate max-w-[260px]"
                    >
                      {bar.website.replace(/^https?:\/\//, "").split("/")[0]}
                    </a>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <Button
                  size="md"
                  variant="secondary"
                  onClick={() => copyEmail(bar)}
                >
                  {copiedId === bar.id ? "Copied!" : "Copy email"}
                </Button>
                {bar.status === "NOT_CONTACTED" && (
                  <Button
                    size="md"
                    onClick={() => setStatus(bar, "EMAIL_SENT")}
                    disabled={isPending}
                  >
                    Mark emailed
                  </Button>
                )}
                {bar.status === "EMAIL_SENT" && (
                  <Button
                    size="md"
                    variant="secondary"
                    onClick={() => setStatus(bar, "RESPONDED")}
                    disabled={isPending}
                  >
                    Mark responded
                  </Button>
                )}
                {(bar.status === "EMAIL_SENT" || bar.status === "RESPONDED") && (
                  <Button
                    size="md"
                    onClick={() => setStatus(bar, "SIGNED_UP")}
                    disabled={isPending}
                  >
                    Signed up!
                  </Button>
                )}
                {bar.status !== "NOT_INTERESTED" && bar.status !== "SIGNED_UP" && (
                  <button
                    onClick={() => setStatus(bar, "NOT_INTERESTED")}
                    disabled={isPending}
                    className="text-xs text-lp-muted hover:text-red-400 px-2 py-1"
                  >
                    Not interested
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="mt-6 flex justify-center gap-3">
          <Button
            size="md"
            variant="secondary"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </Button>
          <span className="self-center text-sm text-lp-muted">
            Page {page + 1} of {Math.ceil(total / PAGE_SIZE)}
          </span>
          <Button
            size="md"
            variant="secondary"
            disabled={(page + 1) * PAGE_SIZE >= total}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Email template */}
      <div className="mt-10 rounded-xl border border-lp-border bg-lp-surface/40 p-6">
        <h2 className="font-semibold text-lp-text mb-3">Outreach email template</h2>
        <pre className="whitespace-pre-wrap text-xs text-lp-muted leading-relaxed font-mono">
          {EMAIL_TEMPLATE("[Bar Name]")}
        </pre>
      </div>
    </div>
  );
}
