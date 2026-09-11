import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: "About VenueSprocket | Private Event Management Software" },
  description:
    "VenueSprocket helps restaurants, breweries, bars, taprooms, banquet rooms, and event spaces book and run private events — inquiry capture, proposals, e-signature contracts, Stripe deposits, and BEOs in one simple, self-serve platform.",
  alternates: { canonical: "https://venuesprocket.com/about" },
  openGraph: {
    title: "About VenueSprocket",
    description:
      "Simple, self-serve private-event management for independent restaurants, breweries, bars, taprooms, banquet rooms, and event spaces — inquiry to BEO in one platform.",
    url: "https://venuesprocket.com/about",
  },
};

export default function VsAboutPage() {
  return (
    <div className="vs-section px-4 md:px-6">
      <div className="mx-auto max-w-3xl">

        {/* Hero */}
        <p className="vs-kicker mb-3 text-center">About</p>
        <h1 className="vs-page-title text-center text-4xl md:text-5xl mb-4">
          Private-event management built<br />
          <span className="text-vs-accent">for independent venues</span>
        </h1>
        <p className="vs-page-sub mx-auto text-center max-w-2xl">
          VenueSprocket is a private-event management platform for restaurants, breweries, bars,
          taprooms, banquet rooms, and event spaces that book birthday parties, corporate events,
          holiday parties, rehearsal dinners, and other private bookings.
        </p>

        {/* Why we built this */}
        <div className="mt-16 space-y-5 text-vs-text-soft leading-relaxed">
          <h2 className="font-display text-2xl font-bold text-vs-text">Why we built this</h2>
          <p>
            Booking a private event at an independent venue usually means a scattered mix of
            email threads, phone calls, paper contracts, and checks or cash for the deposit —
            with the details of who&apos;s coming, what they asked for, and what was agreed to
            living in someone&apos;s inbox instead of one place.
          </p>
          <p>
            VenueSprocket puts the whole process in one connected flow: a customer submits an
            inquiry through your venue&apos;s own page, your team turns it into a proposal, the
            customer reviews and accepts it, signs the contract online, and pays their deposit
            through Stripe — all without printing anything or chasing a check.
          </p>
        </div>

        {/* What VenueSprocket does */}
        <div className="mt-16 space-y-5 text-vs-text-soft leading-relaxed">
          <h2 className="font-display text-2xl font-bold text-vs-text">What VenueSprocket does</h2>
          <ul className="space-y-3 pl-1">
            {[
              { title: "Inquiry capture", body: "A public inquiry page for your venue collects event date, guest count, event type, and budget — no customer account required." },
              { title: "Proposals", body: "Build a proposal from the inquiry with line-item pricing and a deposit amount, then send the customer a link they can review and accept from their phone." },
              { title: "Contracts", body: "Once a proposal is accepted, generate a contract the customer signs online with a typed signature, timestamp, and IP recorded — no printing or scanning." },
              { title: "Stripe deposits", body: "After the contract is signed, the customer pays their deposit through Stripe. Payment status is visible in your dashboard as soon as it clears." },
              { title: "BEO workflow", body: "Build a Banquet Event Order from the same event record — room setup, food and beverage, staffing, and timeline — with a print-ready view for event day." },
            ].map((item) => (
              <li key={item.title} className="rounded-xl border border-vs-border bg-vs-surface px-5 py-4">
                <p className="font-semibold text-vs-text">{item.title}</p>
                <p className="mt-1 text-sm">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Who it's for */}
        <div className="mt-16 space-y-4 text-vs-text-soft leading-relaxed">
          <h2 className="font-display text-2xl font-bold text-vs-text">Who uses VenueSprocket</h2>
          <p>
            <strong className="text-vs-text">Restaurants and bars</strong> — venues that host
            private dining, buyouts, and small parties alongside regular service and want a
            simple way to track inquiries without a full events team.
          </p>
          <p>
            <strong className="text-vs-text">Breweries and taprooms</strong> — venues booking
            birthday parties, corporate happy hours, and community events in a taproom or event
            room.
          </p>
          <p>
            <strong className="text-vs-text">Banquet rooms and event spaces</strong> — venues
            whose private-event bookings are a meaningful part of the business and need proposals,
            contracts, and deposits handled consistently.
          </p>
        </div>

        {/* How we operate */}
        <div className="mt-16 space-y-4 text-vs-text-soft leading-relaxed">
          <h2 className="font-display text-2xl font-bold text-vs-text">How we operate</h2>
          <p>
            VenueSprocket is built to be simple and self-serve: start with the free inquiry form,
            and upgrade only when you need proposals, contracts, deposits, and BEOs. There&apos;s
            no sales call required to get started.
          </p>
          <p>
            <Link href="/leaguepour" className="font-semibold text-vs-accent hover:underline">
              LeaguePour
            </Link>{" "}
            is the companion product for venues that also want to run recurring public events —
            dart leagues, trivia nights, cornhole tournaments — on the same account.
          </p>
        </div>

        {/* CTAs */}
        <div className="mt-16 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
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
          <Link
            href="/contact"
            className="rounded-xl border border-vs-border-strong bg-vs-bg px-8 py-4 text-lg font-bold text-vs-text hover:border-vs-accent transition-colors"
          >
            Get in touch
          </Link>
        </div>

        {/* Links */}
        <div className="mt-12 flex flex-wrap justify-center gap-4 text-sm border-t border-vs-border pt-8">
          <Link href="/features" className="font-semibold text-vs-accent hover:underline">Platform features</Link>
          <Link href="/pricing" className="font-semibold text-vs-accent hover:underline">Pricing</Link>
          <Link href="/leaguepour" className="font-semibold text-vs-accent hover:underline">LeaguePour</Link>
          <Link href="/contact" className="font-semibold text-vs-accent hover:underline">Contact</Link>
        </div>

      </div>
    </div>
  );
}
