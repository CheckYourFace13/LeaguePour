import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: "Terms of Service | VenueSprocket" },
  description: "VenueSprocket terms of service for venues using private event management software.",
  alternates: { canonical: "https://venuesprocket.com/legal/terms" },
};

export default function VsTermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
      <h1 className="font-display text-4xl font-extrabold text-[var(--vs-text)]">Terms of Service</h1>
      <p className="mt-3 text-sm text-[var(--vs-muted)]">Last updated: June 29, 2026</p>

      <div className="mt-10 space-y-8 text-sm text-[var(--vs-text-soft)] leading-relaxed">

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-[var(--vs-text)]">What VenueSprocket provides</h2>
          <p>
            VenueSprocket is software for managing private events at bars, breweries, restaurants, taprooms, and event spaces.
            Features include online inquiry forms, proposal creation, e-signature contracts, deposit tracking, BEO builders,
            and a customer CRM. VenueSprocket is software only — we do not plan, host, or guarantee the outcome of any event.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-[var(--vs-text)]">Venue responsibilities</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Provide accurate event details, pricing, and contract terms to customers</li>
            <li>Honor the terms of any proposal or contract sent through VenueSprocket</li>
            <li>Comply with all local laws regarding alcohol service, food handling, and event permitting</li>
            <li>Protect customer data collected through your inquiry pages</li>
            <li>Maintain a valid payment method for your VenueSprocket subscription</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-[var(--vs-text)]">Customer data</h2>
          <p>
            When customers submit inquiries through your VenueSprocket-powered inquiry page, their information is stored
            securely and shared only with you, the venue. VenueSprocket does not sell, rent, or market to your customers.
            You are the data controller for your customers' information.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-[var(--vs-text)]">Electronic signatures</h2>
          <p>
            VenueSprocket's contract signing feature produces electronic signatures that are legally binding in the United
            States under the Electronic Signatures in Global and National Commerce Act (ESIGN) and Uniform Electronic
            Transactions Act (UETA). By using the signing feature, both venues and customers agree that typed signatures
            carry the same legal weight as handwritten signatures.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-[var(--vs-text)]">Payments and subscriptions</h2>
          <p>
            VenueSprocket subscription fees are billed monthly or annually depending on your plan. Subscriptions
            auto-renew until cancelled. You may cancel at any time from your account settings; cancellation takes effect
            at the end of the current billing period. We do not offer refunds for partial billing periods.
          </p>
          <p>
            Deposit collection from your event customers (when available) is processed through Stripe. VenueSprocket
            does not hold event deposits — funds flow between your customers and your Stripe account directly.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-[var(--vs-text)]">Acceptable use</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Do not use VenueSprocket to send spam, unsolicited marketing, or deceptive communications</li>
            <li>Do not use the platform for illegal events or services</li>
            <li>Do not attempt to reverse-engineer, scrape, or copy the platform</li>
            <li>One account per venue location; contact us for multi-location arrangements</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-[var(--vs-text)]">Limitation of liability</h2>
          <p>
            VenueSprocket provides software tools and is not liable for disputes between venues and their customers,
            event cancellations, deposit disagreements, or the legal enforceability of specific contract terms you create.
            We recommend consulting a local attorney for contract language specific to your state and business type.
            Our total liability to you in any month shall not exceed the fees you paid to VenueSprocket in that month.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-[var(--vs-text)]">Changes to these terms</h2>
          <p>
            We may update these terms from time to time. We will notify you by email or in-app notice at least 14 days
            before material changes take effect. Continued use of VenueSprocket after that date constitutes acceptance.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-[var(--vs-text)]">Contact</h2>
          <p>
            Questions about these terms?{" "}
            <Link href="/contact" className="text-[var(--vs-accent)] hover:underline font-semibold">
              Contact us
            </Link>
            .
          </p>
        </section>

      </div>
    </div>
  );
}
