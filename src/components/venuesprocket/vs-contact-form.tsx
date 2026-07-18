"use client";

import { useState } from "react";

const inputCls =
  "w-full rounded-lg border border-[var(--vs-border)] bg-[var(--vs-bg)] px-3 py-2.5 text-sm focus:border-[var(--vs-accent)] focus:outline-none";
const labelCls = "block text-sm font-semibold text-[var(--vs-text)] mb-1";

export function VsContactForm() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setSubmitting(true);
    try {
      const details = [
        fd.get("venue_type") ? `Venue type: ${fd.get("venue_type")}` : null,
        fd.get("events_per_month") ? `Events per month: ${fd.get("events_per_month")}` : null,
        fd.get("message") ? `\n${fd.get("message")}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${fd.get("first_name")} ${fd.get("last_name")}`.trim(),
          email: fd.get("email"),
          venue: fd.get("venue_name"),
          topic: fd.get("topic"),
          message: details || "(no message)",
          product: "venuesprocket",
        }),
      });
      setSent(true);
      form.reset();
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-[var(--vs-accent)] bg-[var(--vs-surface-2)] p-6 text-sm text-[var(--vs-text)]">
        Sent — we'll reply by email within 1–2 business days.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>First name</label>
          <input type="text" name="first_name" required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Last name</label>
          <input type="text" name="last_name" required className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Work email</label>
        <input type="email" name="email" required className={inputCls} placeholder="you@yourvenue.com" />
      </div>

      <div>
        <label className={labelCls}>Venue / business name</label>
        <input type="text" name="venue_name" required className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>What's this about?</label>
        <select name="topic" className={inputCls} defaultValue="Book a demo">
          <option>Book a demo</option>
          <option>General question</option>
          <option>Feature request / change</option>
          <option>Report a problem</option>
          <option>Billing &amp; upgrades</option>
        </select>
      </div>

      <div>
        <label className={labelCls}>Venue type</label>
        <select name="venue_type" className={inputCls}>
          <option value="">Select...</option>
          <option>Bar / sports bar</option>
          <option>Brewery / taproom</option>
          <option>Restaurant</option>
          <option>Banquet hall / event space</option>
          <option>Hotel / resort</option>
          <option>Other</option>
        </select>
      </div>

      <div>
        <label className={labelCls}>How many private events do you host per month?</label>
        <select name="events_per_month" className={inputCls}>
          <option value="">Select...</option>
          <option>0–2 (just getting started)</option>
          <option>3–10</option>
          <option>11–25</option>
          <option>26+</option>
        </select>
      </div>

      <div>
        <label className={labelCls}>Anything else you'd like us to know?</label>
        <textarea
          name="message"
          rows={3}
          className={inputCls}
          placeholder="Current tools, pain points, questions..."
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-[var(--vs-accent)] py-3.5 text-sm font-bold text-white hover:bg-[var(--vs-accent-hover)] transition-colors disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Send →"}
      </button>

      <p className="text-center text-xs text-[var(--vs-muted)]">
        No sales pressure. Just a helpful reply.
      </p>
    </form>
  );
}
