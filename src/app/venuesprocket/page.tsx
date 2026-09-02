import { safeJsonLd } from "@/lib/seo/json-ld-builders";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: "VenueSprocket — Book More Private Events. Run Them Better." },
  description:
    "VenueSprocket helps restaurants, breweries, bars, taprooms, and event spaces capture inquiries, send proposals, sign contracts, collect deposits, and create BEOs. Start free.",
  alternates: { canonical: "https://venuesprocket.com" },
  openGraph: {
    title: { absolute: "VenueSprocket — Book More Private Events. Run Them Better." },
    description:
      "Simple private event software for restaurants, bars, breweries, and taprooms. Inquiries, proposals, contracts, deposits, and BEOs in one place.",
    url: "https://venuesprocket.com",
    images: ["/venuesprocket/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: { absolute: "VenueSprocket — Book More Private Events. Run Them Better." },
    description:
      "Simple private event software for restaurants, bars, breweries, and taprooms. Inquiries, proposals, contracts, deposits, and BEOs in one place.",
    images: ["/venuesprocket/opengraph-image"],
  },
};

const features = [
  {
    icon: "📋",
    title: "Inquiry form in minutes",
    body: "Publish a public event booking page for your venue in under ten minutes. No setup wizard, no required fields — just a page customers can find and use.",
  },
  {
    icon: "📄",
    title: "Send proposals fast",
    body: "Build a proposal from your event details. Add packages, room fees, minimums, and deposit amounts. Send a secure link. Customer accepts in one click.",
  },
  {
    icon: "✍️",
    title: "Contracts signed online",
    body: "Customers sign on their phone with a typed signature. Timestamp, IP, and user agent recorded. PDF copy sent automatically. No DocuSign required.",
  },
  {
    icon: "💳",
    title: "Collect deposits through Stripe",
    body: "Customers pay their deposit immediately after signing. Stripe handles the payment. You see the money in your account. No invoicing, no chasing.",
  },
  {
    icon: "📑",
    title: "BEOs from the same data",
    body: "Generate a BEO from your event details automatically. Food, beverage, setup, timeline, staffing, AV — all populated from what you already entered.",
  },
  {
    icon: "📣",
    title: "One inquiry page for every event type",
    body: "Every venue gets a public inquiry page for birthday parties, corporate events, holiday parties, and more — share it anywhere and inquiries feed straight into your pipeline.",
  },
];

const pipeline = [
  { stage: "New Inquiry", desc: "Customer submits a booking request" },
  { stage: "Contacted", desc: "You reach out to discuss details" },
  { stage: "Proposal Sent", desc: "Customer receives your proposal link" },
  { stage: "Contract Sent", desc: "Contract delivered for signature" },
  { stage: "Deposit Pending", desc: "Awaiting deposit payment" },
  { stage: "Booked", desc: "Signed and paid — it's on the calendar" },
  { stage: "BEO Ready", desc: "Staff have everything they need" },
  { stage: "Completed", desc: "Event done, follow-up triggered" },
];

const whyUs = [
  "Easier to start than Tripleseat, Perfect Venue, or Planning Pod",
  "More affordable for restaurants, bars, breweries, and taprooms",
  "One shareable inquiry page — no setup required",
  "BEOs, contracts, deposits, and follow-up in one place",
  "No enterprise complexity or 90-minute onboarding calls",
  "Add LeaguePour to fill slow nights with leagues and game nights",
];

const venueTypes = [
  { label: "Restaurants", emoji: "🍽️" },
  { label: "Breweries", emoji: "🍺" },
  { label: "Bars & Taprooms", emoji: "🥃" },
  { label: "Banquet Rooms", emoji: "🏛️" },
  { label: "Event Spaces", emoji: "🎉" },
  { label: "Private Dining", emoji: "🕯️" },
];

export default function VsSprocketHome() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "VenueSprocket",
    applicationCategory: "BusinessApplication",
    description:
      "Private event booking, BEOs, contracts, deposits, and venue marketing software for restaurants, bars, breweries, and event spaces.",
    url: "https://venuesprocket.com",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free plan available. Paid plans from $29/mo.",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="vs-hero-wash vs-section px-4 md:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <p className="vs-kicker mb-3">Private event management for local venues</p>
          <h1 className="vs-page-title text-5xl md:text-6xl lg:text-7xl text-vs-text">
            Book more private events.
            <br />
            <span className="text-vs-accent">Run them better.</span>
          </h1>
          <p className="vs-page-sub mx-auto mt-6 text-center text-lg md:text-xl">
            VenueSprocket helps restaurants, breweries, bars, taprooms, and event spaces capture inquiries,
            send proposals, sign contracts, collect deposits, create BEOs, and market their event space.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/start"
              className="rounded-xl bg-vs-accent px-8 py-4 text-lg font-bold text-white hover:bg-vs-accent-hover transition-colors shadow-lg"
            >
              Start Free
            </Link>
            <Link
              href="/features"
              className="rounded-xl border border-vs-border-strong bg-vs-surface px-8 py-4 text-lg font-bold text-vs-text hover:border-vs-accent transition-colors"
            >
              See How It Works
            </Link>
            <Link
              href="/leaguepour"
              className="text-base font-semibold text-vs-accent hover:underline"
            >
              Add LeaguePour for Game Nights →
            </Link>
          </div>
          <p className="mt-5 text-sm text-vs-muted">
            Free plan available. No credit card required to start.
          </p>
        </div>
      </section>

      {/* ── Venue types ────────────────────────────────────────────────── */}
      <section className="border-y border-vs-border bg-vs-surface py-8 px-4 md:px-6">
        <div className="mx-auto max-w-5xl">
          <p className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-vs-muted">
            Built for local hospitality venues
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {venueTypes.map((v) => (
              <div
                key={v.label}
                className="flex flex-col items-center gap-2 rounded-xl border border-vs-border bg-vs-bg px-4 py-4 text-center"
              >
                <span className="text-2xl">{v.emoji}</span>
                <span className="text-sm font-semibold text-vs-text-soft">{v.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Value pitch ────────────────────────────────────────────────── */}
      <section className="vs-section px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="vs-kicker mb-4">The simple path from inquiry to BEO</p>
          <h2 className="font-display text-3xl font-bold md:text-4xl text-vs-text">
            Stop managing private events through email and spreadsheets
          </h2>
          <p className="mt-4 text-vs-text-soft leading-relaxed">
            Most venues lose private event leads because they respond too slowly, send confusing PDFs,
            or never follow up. VenueSprocket gives you a fast inquiry form, a simple proposal builder,
            online contract signing, Stripe deposit collection, and BEO generation — all from the
            same event record. No separate tools, no copy-pasting between systems.
          </p>
          <div className="mt-8 rounded-2xl border border-vs-border bg-vs-surface p-6 text-left">
            <p className="text-sm font-bold text-vs-accent uppercase tracking-widest mb-4">
              If VenueSprocket helps you book one extra party, it pays for itself.
            </p>
            <p className="text-vs-text-soft text-sm leading-relaxed">
              A single private event booked at $500–$3,000+ covers your monthly plan cost many times
              over. The inquiry form is free. The leads start immediately.
            </p>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section className="vs-section bg-vs-surface px-4 md:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="vs-kicker text-center mb-3">What's included</p>
          <h2 className="text-center font-display text-3xl font-bold md:text-4xl text-vs-text mb-12">
            Everything from inquiry to BEO
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-vs-border bg-vs-bg p-6 hover:border-vs-accent transition-colors"
              >
                <span className="text-3xl">{f.icon}</span>
                <h3 className="mt-4 font-semibold text-lg text-vs-text">{f.title}</h3>
                <p className="mt-2 text-sm text-vs-text-soft leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/features"
              className="font-semibold text-vs-accent hover:underline"
            >
              See all features →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Lead pipeline ──────────────────────────────────────────────── */}
      <section className="vs-section px-4 md:px-6">
        <div className="mx-auto max-w-5xl">
          <p className="vs-kicker text-center mb-3">Lead pipeline</p>
          <h2 className="text-center font-display text-3xl font-bold md:text-4xl text-vs-text mb-4">
            Turn leads into booked events
          </h2>
          <p className="text-center text-vs-text-soft mb-10 max-w-2xl mx-auto">
            Every inquiry goes into a simple pipeline. Move leads through stages as the booking progresses.
            Nothing falls through the cracks.
          </p>
          <div className="relative overflow-x-auto">
            <div className="flex gap-3 min-w-max md:min-w-0 md:flex-wrap md:justify-center">
              {pipeline.map((p, i) => (
                <div
                  key={p.stage}
                  className="flex flex-col gap-1 rounded-xl border border-vs-border bg-vs-surface px-4 py-4 text-center min-w-[130px] md:min-w-0 md:flex-1"
                >
                  <span className="text-xs font-bold text-vs-accent uppercase tracking-wide">
                    {i + 1}
                  </span>
                  <p className="text-sm font-semibold text-vs-text">{p.stage}</p>
                  <p className="text-xs text-vs-muted">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Marketing engine ───────────────────────────────────────────── */}
      <section className="vs-section bg-vs-surface px-4 md:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="vs-kicker mb-3">Marketing engine</p>
              <h2 className="font-display text-3xl font-bold md:text-4xl text-vs-text mb-4">
                Generate leads, not just manage them
              </h2>
              <p className="text-vs-text-soft leading-relaxed mb-6">
                Most event platforms start after you have a lead. VenueSprocket also gives you a
                ready-to-share public inquiry page for birthday parties, corporate events, holiday
                parties, rehearsal dinners, and more — link it from your website, socials, or Google
                Business Profile and inquiries land straight in your pipeline.
              </p>
              <ul className="space-y-2">
                {[
                  "One public inquiry page for every event type you host",
                  "Every submission becomes a lead in your pipeline instantly",
                  "Automated follow-up for new inquiries",
                  "Customer confirmation the moment they submit",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-vs-text-soft">
                    <span className="mt-0.5 text-vs-accent font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-vs-border bg-vs-bg p-6 space-y-3">
              <p className="text-sm font-bold text-vs-text">Inquiries come in for events like:</p>
              {[
                "Birthday parties",
                "Corporate events",
                "Holiday parties",
                "Rehearsal dinners",
                "Private dining",
              ].map((ex) => (
                <div
                  key={ex}
                  className="rounded-lg border border-vs-border bg-vs-surface px-4 py-3 text-sm text-vs-text-soft"
                >
                  {ex}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── LeaguePour module ──────────────────────────────────────────── */}
      <section className="vs-section px-4 md:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-vs-border-strong bg-vs-surface p-8 md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="flex-1">
                <p className="vs-kicker mb-2">LeaguePour by VenueSprocket</p>
                <h2 className="font-display text-2xl font-bold text-vs-text md:text-3xl mb-3">
                  Fill slow nights with leagues and game nights
                </h2>
                <p className="text-vs-text-soft leading-relaxed mb-4">
                  Private events bring bigger bookings. LeaguePour brings repeat weekly traffic.
                  Add the LeaguePour module to run dart leagues, cornhole tournaments, trivia nights,
                  pool leagues, and bar game competitions — with QR signups, standings, and player
                  payments built in.
                </p>
                <ul className="space-y-1 mb-6">
                  {[
                    "Dart leagues, cornhole, trivia, pool, euchre, poker",
                    "QR code signup posted at the bar",
                    "Online entry fee collection",
                    "Live standings and scoreboards",
                    "Player email list for ongoing marketing",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-vs-text-soft">
                      <span className="text-vs-accent font-bold">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/leaguepour"
                  className="inline-flex items-center gap-2 rounded-xl bg-vs-accent px-6 py-3 font-bold text-white hover:bg-vs-accent-hover transition-colors"
                >
                  Add LeaguePour for Game Nights
                </Link>
              </div>
              <div className="shrink-0 text-center">
                <div className="inline-block rounded-2xl border-2 border-vs-accent/20 bg-vs-surface-2 px-8 py-6">
                  <p className="font-display text-xl font-extrabold text-vs-text">
                    League<span className="text-vs-accent">Pour</span>
                  </p>
                  <p className="mt-1 text-xs font-semibold text-vs-muted uppercase tracking-wide">
                    by VenueSprocket
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why VenueSprocket ──────────────────────────────────────────── */}
      <section className="vs-section bg-vs-surface px-4 md:px-6">
        <div className="mx-auto max-w-4xl">
          <p className="vs-kicker text-center mb-3">Why venues choose VenueSprocket</p>
          <h2 className="text-center font-display text-3xl font-bold md:text-4xl text-vs-text mb-10">
            Built for small and midsize venues, not hotel chains
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {whyUs.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-xl border border-vs-border bg-vs-bg px-5 py-4"
              >
                <span className="mt-0.5 text-lg text-vs-accent">✓</span>
                <p className="text-sm font-medium text-vs-text-soft">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/compare/tripleseat"
              className="text-sm font-semibold text-vs-accent hover:underline"
            >
              See how VenueSprocket compares to Tripleseat, Perfect Venue, and others →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pricing teaser ─────────────────────────────────────────────── */}
      <section className="vs-section px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="vs-kicker mb-3">Pricing</p>
          <h2 className="font-display text-3xl font-bold md:text-4xl text-vs-text mb-4">
            Start free. Upgrade when you need contracts, deposits, and BEOs.
          </h2>
          <p className="text-vs-text-soft mb-8">
            The free plan gets your inquiry form live. Upgrade to Pro for proposals, contracts,
            Stripe deposits, BEOs, and customer CRM. No surprise fees.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/start"
              className="rounded-xl bg-vs-accent px-8 py-4 text-lg font-bold text-white hover:bg-vs-accent-hover transition-colors"
            >
              Start Free
            </Link>
            <Link
              href="/pricing"
              className="rounded-xl border border-vs-border-strong bg-vs-surface px-8 py-4 text-lg font-bold text-vs-text hover:border-vs-accent transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
