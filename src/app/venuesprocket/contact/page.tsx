import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact & Demo | VenueSprocket",
  description:
    "Book a free 20-minute demo of VenueSprocket and see how we help bars, breweries, and restaurants manage private events end-to-end.",
};

export default function VsContactPage() {
  return (
    <main className="vs-bg min-h-screen">
      {/* Hero */}
      <section className="vs-hero-wash py-16 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="vs-kicker">Contact & demo</p>
          <h1 className="vs-page-title mt-3">See VenueSprocket in action</h1>
          <p className="vs-page-sub mt-4">
            Get a free 20-minute walkthrough. We'll show you how to capture inquiries,
            send proposals, collect e-signatures, and build BEOs — all in one place.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-2 items-start">

          {/* Contact form */}
          <div className="vs-card p-8">
            <h2 className="font-display text-xl font-bold text-[var(--vs-text)] mb-6">Book a demo</h2>
            <form
              action="https://formsubmit.co/hello@venuesprocket.com"
              method="POST"
              className="space-y-4"
            >
              <input type="hidden" name="_subject" value="VenueSprocket demo request" />
              <input type="hidden" name="_next" value="https://venuesprocket.com/contact?sent=1" />
              <input type="hidden" name="_captcha" value="false" />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-[var(--vs-text)] mb-1">First name</label>
                  <input
                    type="text"
                    name="first_name"
                    required
                    className="w-full rounded-lg border border-[var(--vs-border)] bg-[var(--vs-bg)] px-3 py-2.5 text-sm focus:border-[var(--vs-accent)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--vs-text)] mb-1">Last name</label>
                  <input
                    type="text"
                    name="last_name"
                    required
                    className="w-full rounded-lg border border-[var(--vs-border)] bg-[var(--vs-bg)] px-3 py-2.5 text-sm focus:border-[var(--vs-accent)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--vs-text)] mb-1">Work email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full rounded-lg border border-[var(--vs-border)] bg-[var(--vs-bg)] px-3 py-2.5 text-sm focus:border-[var(--vs-accent)] focus:outline-none"
                  placeholder="you@yourvenue.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--vs-text)] mb-1">Venue / business name</label>
                <input
                  type="text"
                  name="venue_name"
                  required
                  className="w-full rounded-lg border border-[var(--vs-border)] bg-[var(--vs-bg)] px-3 py-2.5 text-sm focus:border-[var(--vs-accent)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--vs-text)] mb-1">Venue type</label>
                <select
                  name="venue_type"
                  className="w-full rounded-lg border border-[var(--vs-border)] bg-[var(--vs-bg)] px-3 py-2.5 text-sm focus:border-[var(--vs-accent)] focus:outline-none"
                >
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
                <label className="block text-sm font-semibold text-[var(--vs-text)] mb-1">
                  How many private events do you host per month?
                </label>
                <select
                  name="events_per_month"
                  className="w-full rounded-lg border border-[var(--vs-border)] bg-[var(--vs-bg)] px-3 py-2.5 text-sm focus:border-[var(--vs-accent)] focus:outline-none"
                >
                  <option value="">Select...</option>
                  <option>0–2 (just getting started)</option>
                  <option>3–10</option>
                  <option>11–25</option>
                  <option>26+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--vs-text)] mb-1">
                  Anything else you'd like us to know?
                </label>
                <textarea
                  name="message"
                  rows={3}
                  className="w-full rounded-lg border border-[var(--vs-border)] bg-[var(--vs-bg)] px-3 py-2.5 text-sm focus:border-[var(--vs-accent)] focus:outline-none"
                  placeholder="Current tools, pain points, questions..."
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[var(--vs-accent)] py-3.5 text-sm font-bold text-white hover:bg-[var(--vs-accent-hover)] transition-colors"
              >
                Request demo →
              </button>

              <p className="text-center text-xs text-[var(--vs-muted)]">
                No sales pressure. Just a helpful walkthrough.
              </p>
            </form>
          </div>

          {/* Info sidebar */}
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-xl font-bold text-[var(--vs-text)] mb-4">What to expect</h2>
              <ul className="space-y-4">
                {[
                  ["📬", "20-minute screen share", "We'll walk through the full inquiry-to-BEO workflow live."],
                  ["🎯", "Tailored to your venue", "We'll focus on the features most relevant to your venue type and volume."],
                  ["🚀", "Free trial available", "Start your free plan the same day — no credit card required."],
                  ["💬", "Honest answers", "We'll tell you if VenueSprocket is or isn't the right fit."],
                ].map(([icon, title, desc]) => (
                  <li key={String(title)} className="flex gap-3">
                    <span className="text-xl shrink-0">{icon}</span>
                    <div>
                      <p className="font-semibold text-[var(--vs-text)]">{title}</p>
                      <p className="text-sm text-[var(--vs-muted)]">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="vs-card p-5">
              <p className="font-semibold text-[var(--vs-text)] mb-2">Already have a LeaguePour account?</p>
              <p className="text-sm text-[var(--vs-muted)] mb-3">
                VenueSprocket is built into your venue dashboard. Just go to <strong>Private Events</strong> to activate it.
              </p>
              <Link href="/app/dashboard" className="inline-flex rounded-lg border border-[var(--vs-accent)] px-4 py-2 text-sm font-semibold text-[var(--vs-accent)] hover:bg-[var(--vs-surface-2)]">
                Open dashboard →
              </Link>
            </div>

            <div>
              <p className="text-sm font-semibold text-[var(--vs-text)] mb-1">General questions?</p>
              <p className="text-sm text-[var(--vs-muted)]">Use the form and we'll get back to you within 1–2 business days.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
