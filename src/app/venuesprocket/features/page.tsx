import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Features — VenueSprocket Private Event Management",
  description:
    "VenueSprocket features: inquiry forms, proposal builder, e-signature contracts, Stripe deposits, BEO builder, customer CRM, marketing pages, and LeaguePour game nights.",
  alternates: { canonical: "https://venuesprocket.com/features" },
};

const modules = [
  {
    id: "inquiries",
    title: "Inquiry & Lead Capture",
    icon: "📬",
    href: "/private-event-booking-software",
    features: [
      "Public inquiry form — no customer account required",
      "Event type selection (birthday, corporate, holiday, etc.)",
      "Date, time, guest count, budget, and special requests",
      "Instant confirmation email to customer",
      "Instant notification to venue staff",
      "Lead assigned to pipeline automatically",
    ],
    body: "Every private event starts with an inquiry. VenueSprocket gives your venue a public booking page customers can find and use in under two minutes. No apps, no accounts, no friction.",
  },
  {
    id: "pipeline",
    title: "Lead Pipeline",
    icon: "📊",
    href: null,
    features: [
      "Simple Kanban-style pipeline",
      "Stages: New → Contacted → Proposal Sent → Contract Sent → Booked → BEO Ready → Completed",
      "Staff can move leads between stages",
      "Notes on each lead",
      "Lost lead tracking",
      "Follow-up reminders",
    ],
    body: "Every inquiry goes into a pipeline. Staff can see what stage every lead is in and move them forward. Nothing gets forgotten.",
  },
  {
    id: "proposals",
    title: "Proposal Builder",
    icon: "📄",
    href: null,
    features: [
      "Build a proposal from your event record",
      "Add packages, room fees, food minimums, and beverage options",
      "Line-item pricing",
      "Set deposit amount and due date",
      "Send a secure public link to the customer",
      "Customer views and accepts in one click",
      "Viewed/accepted timestamps recorded",
    ],
    body: "A proposal can be built and sent in minutes. The customer gets a clean, professional link they can view on their phone and accept with one click.",
  },
  {
    id: "contracts",
    title: "Contract Signing",
    icon: "✍️",
    href: "/event-contract-software",
    features: [
      "Contract generated from event and proposal data",
      "Customer types their name as signature",
      "Checkbox acceptance",
      "Timestamp, IP address, and user agent recorded",
      "PDF copy sent automatically to customer",
      "Works on mobile — no printing required",
    ],
    body: "Customers sign from their phone. No DocuSign subscription needed. The contract is legally recorded with timestamp and IP, and a PDF is sent automatically.",
  },
  {
    id: "deposits",
    title: "Deposit Collection",
    icon: "💳",
    href: "/event-deposit-software",
    features: [
      "Stripe payment link sent after contract signing",
      "Customer pays deposit immediately",
      "Deposit amount set on the proposal",
      "Payment status visible in dashboard",
      "Paid/unpaid labels",
      "Stripe confirmation email to customer",
    ],
    body: "After signing, the customer pays their deposit through Stripe. No invoices, no checks, no chasing. You see the money, the lead moves to Booked.",
  },
  {
    id: "beo",
    title: "BEO Builder",
    icon: "📑",
    href: "/beo-software",
    features: [
      "BEO generated from your event record",
      "Event name, date, time, guest count, contact info",
      "Room setup, food, beverage, staffing, AV",
      "Timeline builder",
      "Allergies and special requests",
      "Internal notes (staff-only)",
      "PDF export and printable version",
      "Mobile-friendly day-of-event staff view",
    ],
    body: "The BEO is built from the same details you already entered for the inquiry and proposal. Change them once — the BEO updates. Staff see everything they need on their phone on event day.",
  },
  {
    id: "crm",
    title: "Customer CRM",
    icon: "👥",
    href: null,
    features: [
      "Customer record created from inquiry",
      "Contact info, company, past events",
      "Tags for filtering and segmentation",
      "Notes",
      "Marketing opt-in status",
      "Past event history and revenue",
    ],
    body: "Every inquiry creates a customer record. See who's booked before, tag your best customers, and follow up with past guests after the event.",
  },
  {
    id: "marketing",
    title: "Marketing Pages",
    icon: "📣",
    href: "/venue-marketing-software",
    features: [
      "Birthday party page for your venue",
      "Corporate event inquiry page",
      "Holiday party landing page",
      "Rehearsal dinner page",
      "City and neighborhood pages",
      "Seasonal campaign pages",
      "All pages feed your inquiry form",
      "SEO-optimized with local targeting",
    ],
    body: "Each venue gets SEO-optimized marketing pages that rank in search for private event searches in their city. Leads come to you.",
  },
  {
    id: "leaguepour",
    title: "LeaguePour Module",
    icon: "🎯",
    href: "/leaguepour",
    features: [
      "Dart leagues, cornhole, trivia, pool, euchre, poker",
      "QR code signup posted at the bar",
      "Online entry fee collection via Stripe",
      "Live standings and scoreboard",
      "Player email list for marketing",
      "Recurring weekly or monthly events",
      "Player registration management",
    ],
    body: "Fill slow nights with organized public events. LeaguePour is the public event engine inside VenueSprocket — players sign up, pay entry fees, compete, and come back every week.",
  },
];

export default function VsFeaturesPage() {
  return (
    <div className="vs-section px-4 md:px-6">
      <div className="mx-auto max-w-5xl">

        {/* Hero */}
        <div className="text-center mb-16">
          <p className="vs-kicker mb-3">Platform features</p>
          <h1 className="vs-page-title text-4xl md:text-5xl mb-4">
            Everything from inquiry to BEO
          </h1>
          <p className="vs-page-sub mx-auto text-center max-w-2xl">
            One connected workflow. Inquiry form, pipeline, proposal, contract, deposit, BEO,
            customer CRM, marketing pages, and LeaguePour public events.
          </p>
        </div>

        {/* Feature modules */}
        <div className="space-y-6">
          {modules.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl border border-vs-border bg-vs-surface p-7"
            >
              <div className="flex flex-col gap-5 md:flex-row md:gap-10">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{m.icon}</span>
                    <h2 className="font-display text-xl font-bold text-vs-text">{m.title}</h2>
                  </div>
                  <p className="text-vs-text-soft leading-relaxed mb-4">{m.body}</p>
                  {m.href && (
                    <Link
                      href={m.href}
                      className="text-sm font-semibold text-vs-accent hover:underline"
                    >
                      Learn more →
                    </Link>
                  )}
                </div>
                <div className="md:w-64 shrink-0">
                  <ul className="space-y-1.5">
                    {m.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-vs-text-soft">
                        <span className="mt-0.5 text-vs-accent font-bold shrink-0">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <h2 className="font-display text-2xl font-bold text-vs-text mb-4">
            Ready to start?
          </h2>
          <p className="text-vs-text-soft mb-8 max-w-xl mx-auto">
            Start free with the inquiry form. Upgrade to Pro when you need contracts, deposits, and BEOs.
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
              className="rounded-xl border border-vs-border-strong bg-vs-bg px-8 py-4 text-lg font-bold text-vs-text hover:border-vs-accent transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
