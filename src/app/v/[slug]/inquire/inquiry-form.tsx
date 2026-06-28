"use client";

import { useState } from "react";
import { createPrivateEventLeadPublic } from "@/lib/actions/vs";

const EVENT_TYPES = [
  { value: "BIRTHDAY", label: "Birthday party" },
  { value: "CORPORATE", label: "Corporate event / happy hour" },
  { value: "HOLIDAY_PARTY", label: "Holiday party" },
  { value: "REHEARSAL_DINNER", label: "Rehearsal dinner" },
  { value: "SHOWER", label: "Bridal or baby shower" },
  { value: "FUNDRAISER", label: "Fundraiser" },
  { value: "BUYOUT", label: "Full venue / room buyout" },
  { value: "TASTING", label: "Private tasting" },
  { value: "ANNIVERSARY", label: "Anniversary" },
  { value: "OTHER", label: "Other" },
];

export default function InquirePageClient({
  venueId,
  venueName,
  venueCity,
}: {
  venueId: string;
  venueName: string;
  venueCity?: string | null;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("venueId", venueId);
    const result = await createPrivateEventLeadPublic(fd);
    setLoading(false);
    if (result && "error" in result) {
      setError(result.error ?? "Something went wrong");
    } else {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--vs-bg)] px-4">
        <div className="max-w-md w-full text-center rounded-2xl border border-[var(--vs-accent)]/30 bg-[var(--vs-surface)] p-10">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="font-display text-2xl font-bold text-[var(--vs-text)] mb-3">
            Inquiry received!
          </h2>
          <p className="text-[var(--vs-text-soft)]">
            Thanks for reaching out to <strong>{venueName}</strong>. Someone from our team will
            be in touch shortly to discuss the details of your event.
          </p>
          <p className="mt-4 text-sm text-[var(--vs-muted)]">
            Keep an eye on your inbox — we'll follow up soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--vs-bg)] px-4 py-12">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--vs-muted)] mb-1">
            Private event inquiry
          </p>
          <h1 className="font-display text-3xl font-extrabold text-[var(--vs-text)]">
            {venueName}
          </h1>
          {venueCity && (
            <p className="mt-1 text-[var(--vs-muted)]">{venueCity}</p>
          )}
          <p className="mt-3 text-[var(--vs-text-soft)]">
            Tell us about your event and we'll get back to you quickly.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-2xl border border-[var(--vs-border)] bg-[var(--vs-surface)] p-7 space-y-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[var(--vs-text)] mb-1.5">
              Your name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="customerName"
              required
              autoComplete="name"
              className="w-full rounded-lg border border-[var(--vs-border)] bg-[var(--vs-bg)] px-4 py-3 text-[var(--vs-text)] focus:border-[var(--vs-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--vs-focus)]"
              placeholder="Jane Smith"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--vs-text)] mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="customerEmail"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-[var(--vs-border)] bg-[var(--vs-bg)] px-4 py-3 text-[var(--vs-text)] focus:border-[var(--vs-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--vs-focus)]"
              placeholder="jane@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--vs-text)] mb-1.5">
              Phone number
            </label>
            <input
              type="tel"
              name="customerPhone"
              autoComplete="tel"
              className="w-full rounded-lg border border-[var(--vs-border)] bg-[var(--vs-bg)] px-4 py-3 text-[var(--vs-text)] focus:border-[var(--vs-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--vs-focus)]"
              placeholder="(555) 000-0000"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--vs-text)] mb-1.5">
              Type of event <span className="text-red-500">*</span>
            </label>
            <select
              name="eventType"
              required
              className="w-full rounded-lg border border-[var(--vs-border)] bg-[var(--vs-bg)] px-4 py-3 text-[var(--vs-text)] focus:border-[var(--vs-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--vs-focus)]"
            >
              <option value="">Select event type...</option>
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-[var(--vs-text)] mb-1.5">
                Preferred date
              </label>
              <input
                type="date"
                name="preferredDate"
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-lg border border-[var(--vs-border)] bg-[var(--vs-bg)] px-4 py-3 text-[var(--vs-text)] focus:border-[var(--vs-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--vs-focus)]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--vs-text)] mb-1.5">
                Estimated guests
              </label>
              <input
                type="number"
                name="guestCount"
                min="1"
                max="2000"
                className="w-full rounded-lg border border-[var(--vs-border)] bg-[var(--vs-bg)] px-4 py-3 text-[var(--vs-text)] focus:border-[var(--vs-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--vs-focus)]"
                placeholder="50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--vs-text)] mb-1.5">
              Approximate budget
            </label>
            <select
              name="budgetRange"
              className="w-full rounded-lg border border-[var(--vs-border)] bg-[var(--vs-bg)] px-4 py-3 text-[var(--vs-text)] focus:border-[var(--vs-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--vs-focus)]"
            >
              <option value="">Prefer not to say</option>
              <option value="Under $500">Under $500</option>
              <option value="$500 – $1,000">$500 – $1,000</option>
              <option value="$1,000 – $2,500">$1,000 – $2,500</option>
              <option value="$2,500 – $5,000">$2,500 – $5,000</option>
              <option value="$5,000+">$5,000+</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--vs-text)] mb-1.5">
              Anything else we should know?
            </label>
            <textarea
              name="notes"
              rows={4}
              className="w-full rounded-lg border border-[var(--vs-border)] bg-[var(--vs-bg)] px-4 py-3 text-[var(--vs-text)] focus:border-[var(--vs-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--vs-focus)]"
              placeholder="Dietary restrictions, special setup, theme, timing preferences..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[var(--vs-accent)] py-4 text-base font-bold text-white hover:bg-[var(--vs-accent-hover)] disabled:opacity-60 transition-colors"
          >
            {loading ? "Sending..." : "Send inquiry"}
          </button>

          <p className="text-center text-xs text-[var(--vs-muted)]">
            Your information is only shared with {venueName} and is not used for marketing.
          </p>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--vs-muted)]">
          Powered by <span className="font-semibold">VenueSprocket</span>
        </p>
      </div>
    </div>
  );
}
