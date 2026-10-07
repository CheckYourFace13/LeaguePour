import type { Metadata } from "next";
import Link from "next/link";
import { safeJsonLd } from "@/lib/seo/json-ld-builders";
import { DepositCalculator } from "@/components/venuesprocket/tools/deposit-calculator";

const URL = "https://venuesprocket.com/tools/event-deposit-calculator";

export const metadata: Metadata = {
  title: { absolute: "Event Deposit Calculator for Venues | VenueSprocket" },
  description:
    "Free event deposit calculator for restaurants, bars, and event spaces: deposit amount (percent or flat), remaining balance, balance due date, and an estimate of card processing - with the math shown.",
  alternates: { canonical: URL },
  openGraph: {
    siteName: "VenueSprocket",
    title: "Event Deposit Calculator",
    description: "Deposit, remaining balance, balance due date, and card processing estimate - with the math shown.",
    url: URL,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "VenueSprocket", item: "https://venuesprocket.com" },
        { "@type": "ListItem", position: 2, name: "Free tools", item: "https://venuesprocket.com/tools" },
        { "@type": "ListItem", position: 3, name: "Event deposit calculator", item: URL },
      ],
    },
    {
      "@type": "WebApplication",
      name: "Event Deposit Calculator",
      url: URL,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any (web browser)",
      isAccessibleForFree: true,
      publisher: { "@type": "Organization", name: "VenueSprocket", url: "https://venuesprocket.com" },
    },
  ],
};

export default function DepositCalculatorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <div className="vs-section px-4 md:px-6">
        <div className="mx-auto max-w-5xl">
          <nav className="mb-8 text-sm text-vs-muted">
            <Link href="/tools" className="hover:text-vs-accent">Free tools</Link>
            {" / "}
            <span className="font-medium text-vs-text-soft">Event deposit calculator</span>
          </nav>
          <p className="vs-kicker mb-3">Free tool · no login</p>
          <h1 className="vs-page-title text-4xl md:text-5xl mb-5">Event deposit calculator</h1>
          <p className="mb-10 max-w-3xl text-lg leading-relaxed text-vs-text-soft">
            Work out the deposit to ask for, what&apos;s left to collect, when the balance is due, and
            roughly what card processing takes out of the deposit. Every result shows its formula.
          </p>

          <DepositCalculator />

          <article className="mt-16 max-w-3xl space-y-10">
            <section>
              <h2 className="font-display text-2xl font-bold text-vs-text mb-3">Percent or flat?</h2>
              <p className="leading-relaxed text-vs-text-soft">
                A percentage deposit scales with the size of the booking, which keeps the commitment
                proportional - a $6,000 holiday party and a $900 birthday dinner aren&apos;t asked for the
                same amount. A flat deposit is simpler to explain and works well when most of your events
                are a similar size, or for a room that&apos;s always booked on the same terms. Some venues
                combine them: a percentage with a floor (&ldquo;25% or $250, whichever is greater&rdquo;).
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-vs-text mb-3">A worked example</h2>
              <ul className="space-y-2 rounded-xl border border-vs-border bg-vs-surface p-5 font-mono text-sm text-vs-text-soft">
                <li>Estimated event total: $2,400</li>
                <li>Deposit at 25%: $2,400 × 25% = $600</li>
                <li>Remaining balance: $2,400 − $600 = $1,800</li>
                <li>Card processing at 2.9% + $0.30: $600 × 2.9% + $0.30 = $17.70</li>
                <li>Deposit after processing: $600 − $17.70 = $582.30</li>
              </ul>
              <p className="mt-4 leading-relaxed text-vs-text-soft">
                The processing numbers are a placeholder - use the rate on your own account. The point of
                running them is to know what actually lands in your account if you later have to refund
                or keep a deposit.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-vs-text mb-3">Write the terms down next to the number</h2>
              <ul className="space-y-2 leading-relaxed text-vs-text-soft">
                <li>• <strong className="text-vs-text">What the deposit does.</strong> Holds the date and is applied to the final bill.</li>
                <li>• <strong className="text-vs-text">When it stops being refundable.</strong> A specific number of days before the event, in plain language.</li>
                <li>• <strong className="text-vs-text">When the balance is due.</strong> Before the event, at the event, or within a set time after - and how it&apos;s paid.</li>
                <li>• <strong className="text-vs-text">What happens on a reschedule.</strong> Whether the deposit transfers to a new date, and for how long.</li>
              </ul>
              <p className="mt-4 text-sm leading-relaxed text-vs-muted">
                Deposit and cancellation rules vary by state - have an attorney review your terms.
              </p>
            </section>

            <section className="rounded-2xl border border-vs-border-strong bg-vs-surface-2 p-6">
              <h2 className="font-display text-xl font-bold text-vs-text mb-2">Collect the deposit online</h2>
              <p className="mb-4 leading-relaxed text-vs-text-soft">
                In VenueSprocket, the customer pays the deposit through Stripe right after signing the
                contract, straight to your venue&apos;s own Stripe account, with no percentage taken by
                VenueSprocket.
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <Link href="/start" className="rounded-lg bg-vs-accent px-4 py-2 font-bold text-white hover:bg-vs-accent-hover">Start free</Link>
                <Link href="/tools/food-beverage-minimum-calculator" className="rounded-lg border border-vs-border-strong bg-vs-bg px-4 py-2 font-semibold text-vs-text hover:border-vs-accent">F&amp;B minimum calculator →</Link>
                <Link href="/templates" className="rounded-lg border border-vs-border-strong bg-vs-bg px-4 py-2 font-semibold text-vs-text hover:border-vs-accent">Contract checklist →</Link>
              </div>
            </section>
          </article>
        </div>
      </div>
    </>
  );
}
