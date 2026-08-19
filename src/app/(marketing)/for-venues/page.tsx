import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: { absolute: "For Venues | LeaguePour Bar Competition Software" },
  description:
    "LeaguePour for bars and taprooms: venue competition software, tournament signup software for bars, and player registration with Stripe entry fees.",
  alternates: { canonical: "/for-venues" },
  openGraph: {
    title: "LeaguePour for Venues",
    description: "Bar event registration software for trivia, darts, cornhole, and league nights.",
    url: "/for-venues",
  },
};

const steps = [
  {
    n: "1",
    title: "Start hosting events",
    body: "Sign up in under 2 minutes. Add your venue name, type, and address. Your public signup page is live immediately.",
  },
  {
    n: "2",
    title: "Connect your Stripe account",
    body: 'Click "Connect Stripe" in your venue profile. Stripe walks you through entering your business info and bank account - it takes about 5 minutes. This is how entry fees reach your bank directly. You\'ll need your business name, address, EIN or SSN (for tax purposes), and bank account number.',
  },
  {
    n: "3",
    title: "Build a competition",
    body: "Set your event name, date, entry fee, team format, and participant cap. Publish it and share the link - or print the QR code for tables and door signage.",
  },
  {
    n: "4",
    title: "Players register and pay",
    body: "Players sign up through your public page and pay with any credit or debit card. Entry fees go straight to your Stripe account within 2 business days.",
  },
  {
    n: "5",
    title: "Run the event, then do it again",
    body: "Manage registrations, track standings, and message your player list to fill the next one. Your audience builds automatically.",
  },
];

export default function ForVenuesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20 space-y-16">

      {/* Hero */}
      <div>
        <h1 className="font-display text-4xl font-bold md:text-5xl text-lp-text">
          Run competitions. Collect entry fees. Bring players back.
        </h1>
        <p className="mt-5 text-lg text-lp-muted max-w-xl">
          LeaguePour handles signups, payments, and player messaging so you can focus on running a great event.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/signup/venue">Start hosting events</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/pricing">See pricing</Link>
          </Button>
        </div>
      </div>

      {/* What you get */}
      <div>
        <p className="lp-kicker text-lp-accent">What you get</p>
        <ul className="mt-5 space-y-3 text-lp-muted text-base">
          <li className="flex gap-3">
            <span className="text-lp-accent font-bold">|</span>
            <span>Public signup pages with a shareable link and printable QR code</span>
          </li>
          <li className="flex gap-3">
            <span className="text-lp-accent font-bold">|</span>
            <span>Entry fees paid directly to your bank via Stripe - we never hold your money</span>
          </li>
          <li className="flex gap-3">
            <span className="text-lp-accent font-bold">|</span>
            <span>Team or solo formats, participant caps, and waitlists</span>
          </li>
          <li className="flex gap-3">
            <span className="text-lp-accent font-bold">|</span>
            <span>Standings, brackets, and match tracking</span>
          </li>
          <li className="flex gap-3">
            <span className="text-lp-accent font-bold">|</span>
            <span>Email and SMS campaigns to re-engage your player audience</span>
          </li>
          <li className="flex gap-3">
            <span className="text-lp-accent font-bold">|</span>
            <span>Staff roles so managers and coordinators can help run events</span>
          </li>
        </ul>
      </div>

      {/* How to get set up */}
      <div>
        <p className="lp-kicker text-lp-accent">How to get set up</p>
        <h2 className="mt-2 font-display text-2xl font-bold text-lp-text md:text-3xl">
          From sign-up to collecting entry fees in under 10 minutes
        </h2>
        <p className="mt-3 text-lp-muted">
          The most important step is connecting your Stripe account - that&apos;s what gets money into your bank. Here&apos;s the full flow:
        </p>
        <div className="mt-8 space-y-4">
          {steps.map((s) => (
            <Card key={s.n} className="flex gap-5 items-start">
              <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-lp-accent/15 text-lp-accent font-display font-bold text-lg">
                {s.n}
              </div>
              <div>
                <p className="font-semibold text-lp-text">{s.title}</p>
                <p className="mt-1 text-sm text-lp-muted leading-relaxed">{s.body}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Stripe / payments explainer */}
      <div className="rounded-[10px] border border-lp-border bg-lp-surface/40 p-6 space-y-4">
        <p className="lp-kicker">About Stripe Connect &amp; fees</p>
        <p className="text-sm text-lp-muted leading-relaxed">
          <strong className="text-lp-text">Why do I need a Stripe account?</strong> Stripe is the payment processor
          that moves money from players into your bank. LeaguePour uses Stripe Connect so your bank account is linked
          directly - entry fees never sit in our account. You keep control, and Stripe handles all the security and compliance.
        </p>
        <p className="text-sm text-lp-muted leading-relaxed">
          <strong className="text-lp-text">What does it cost?</strong> LeaguePour charges a{" "}
          <strong className="text-lp-text">5% venue fee</strong> on paid registrations, deducted before your payout.
          Players also pay a <strong className="text-lp-text">$1.50 service fee</strong> added on top of your entry
          price - this covers Stripe&apos;s card processing costs so you don&apos;t have to. Free events have no fees at all.
        </p>
        <div className="rounded-[8px] bg-lp-bg/80 border border-lp-border p-4 text-sm space-y-2">
          <p className="font-semibold text-lp-text">Example: $10 entry fee</p>
          <div className="text-lp-muted space-y-1">
            <div className="flex justify-between">
              <span>Player pays at checkout</span>
              <span className="font-mono font-semibold text-lp-text">$11.50</span>
            </div>
            <div className="flex justify-between pl-4">
              <span>Entry fee</span>
              <span className="font-mono">$10.00</span>
            </div>
            <div className="flex justify-between pl-4">
              <span>Service fee (player-side)</span>
              <span className="font-mono">$1.50</span>
            </div>
            <div className="flex justify-between border-t border-lp-border pt-2 mt-2 font-semibold text-lp-text">
              <span>You receive (deposited by Stripe)</span>
              <span className="font-mono text-lp-accent">$9.50</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-lp-muted leading-relaxed">
          <strong className="text-lp-text">Stripe setup takes about 5 minutes.</strong> You&apos;ll need your business name,
          address, tax ID (EIN for a business, or last 4 of SSN if operating personally), and a bank account number.
          Stripe is PCI-compliant and used by millions of businesses worldwide.
        </p>
      </div>

      {/* VenueSprocket cross-promo */}
      <div className="rounded-xl border border-lp-border bg-lp-surface/60 p-7 flex flex-col sm:flex-row gap-6 items-start">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-lp-muted mb-1">Also from VenueSprocket</p>
          <p className="font-display text-xl font-bold text-lp-text">Need to manage private events?</p>
          <p className="mt-2 text-sm text-lp-muted leading-relaxed">
            <strong className="text-lp-text">VenueSprocket</strong> handles private event bookings — birthday parties,
            corporate buyouts, holiday parties. Collect inquiries online, send proposals, get contracts signed,
            and build BEOs. Built for the same bars and venues that use LeaguePour.
          </p>
        </div>
        <div className="shrink-0">
          <a
            href="https://venuesprocket.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-lg border border-lp-border-strong bg-lp-bg px-5 py-2.5 text-sm font-bold text-lp-text hover:bg-lp-surface whitespace-nowrap"
          >
            See VenueSprocket →
          </a>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4">
        <p className="font-display text-xl font-bold text-lp-text">Ready to fill your next event?</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/signup/venue">Start hosting events</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/how-it-works">See how it works</Link>
          </Button>
        </div>
        <p className="text-sm text-lp-muted">
          Questions?{" "}
          <Link href="/contact" className="font-semibold text-lp-accent hover:underline">
            Get in touch
          </Link>
        </p>
      </div>

    </div>
  );
}
