import type { Metadata } from "next";
import Link from "next/link";
import { safeJsonLd } from "@/lib/seo/json-ld-builders";
import { EventProfitCalculator } from "@/components/venuesprocket/tools/event-profit-calculator";

const URL = "https://venuesprocket.com/tools/event-profit-calculator";
const DESCRIPTION =
  "Free private event profit calculator for restaurants, bars, and event spaces: revenue minus food, beverage, labor, and card costs, with margin and profit per guest. Every formula shown.";

export const metadata: Metadata = {
  title: { absolute: "Private Event Profit Calculator for Venues | VenueSprocket" },
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { siteName: "VenueSprocket", images: [{ url: "/venuesprocket/opengraph-image", alt: "VenueSprocket - private event management software" }], title: "Private event profit calculator", description: DESCRIPTION, url: URL },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "VenueSprocket", item: "https://venuesprocket.com" },
        { "@type": "ListItem", position: 2, name: "Free tools", item: "https://venuesprocket.com/tools" },
        { "@type": "ListItem", position: 3, name: "Event profit calculator", item: URL },
      ],
    },
    {
      "@type": "WebApplication",
      name: "Private Event Profit Calculator",
      url: URL,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any (web browser)",
      isAccessibleForFree: true,
      publisher: { "@type": "Organization", name: "VenueSprocket", url: "https://venuesprocket.com" },
    },
  ],
};

export default function EventProfitCalculatorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <div className="vs-section px-4 md:px-6">
        <div className="mx-auto max-w-5xl">
          <nav className="mb-8 text-sm text-vs-muted">
            <Link href="/tools" className="hover:text-vs-accent">Free tools</Link>
            {" / "}
            <span className="font-medium text-vs-text-soft">Event profit calculator</span>
          </nav>
          <p className="vs-kicker mb-3">Free tool · no login</p>
          <h1 className="vs-page-title text-4xl md:text-5xl mb-5">Private event profit calculator</h1>
          <p className="mb-10 max-w-3xl text-lg leading-relaxed text-vs-text-soft">
            A $2,200 party isn&apos;t $2,200 of profit. Enter what the event brings in and what it costs
            you to run, and see what&apos;s left - in total, per guest, and against a normal night in that
            space. Every result shows its formula.
          </p>

          <EventProfitCalculator />

          <article className="mt-16 max-w-3xl space-y-10">
            <section>
              <h2 className="font-display text-2xl font-bold text-vs-text mb-3">A worked example</h2>
              <p className="mb-4 leading-relaxed text-vs-text-soft">
                Forty guests spend $30 on food and $20 on drinks each, and you charge a $200 room fee:
              </p>
              <ul className="space-y-2 rounded-xl border border-vs-border bg-vs-surface p-5 font-mono text-sm text-vs-text-soft">
                <li>Revenue: 40 × ($30 + $20) + $200 = $2,200</li>
                <li>Food cost at 32%: $1,200 × 32% = $384</li>
                <li>Beverage cost at 22%: $800 × 22% = $176</li>
                <li>Extra labor: 4 staff × 6 h × $18 = $432</li>
                <li>Other event costs: $75</li>
                <li>Card processing at 2.9%: $2,200 × 2.9% = $63.80</li>
                <li>Event profit: $2,200 − $1,130.80 = $1,069.20 (48.6%, $26.73 per guest)</li>
              </ul>
              <p className="mt-4 leading-relaxed text-vs-text-soft">
                Those percentages are placeholders to show the math - use your own food cost, pour
                cost, and wages. The useful comparison is the last input: if that room would have
                made $600 on a normal Saturday, the party is worth about $469 more than staying open
                to the public; if it would have made $1,300, you lost money by booking it.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-vs-text mb-3">What to do with the number</h2>
              <ul className="space-y-2 leading-relaxed text-vs-text-soft">
                <li>• <strong className="text-vs-text">Set minimums by day.</strong> Run it for a slow Tuesday and a busy Saturday. The gap is why many venues charge different minimums by day of week.</li>
                <li>• <strong className="text-vs-text">Find your smallest worthwhile party.</strong> Lower the guest count until the event stops beating a normal night - that&apos;s the size where you need a room fee or a minimum.</li>
                <li>• <strong className="text-vs-text">Price labor honestly.</strong> Setup and teardown hours count. Events that look great on revenue often lose their margin here.</li>
                <li>• <strong className="text-vs-text">Leave gratuities out.</strong> A service charge you pass to staff isn&apos;t revenue to the house.</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-vs-border-strong bg-vs-surface-2 p-6">
              <h2 className="font-display text-xl font-bold text-vs-text mb-2">Turn the number into a quote</h2>
              <p className="mb-4 leading-relaxed text-vs-text-soft">
                Use the result to set a room fee or a food and beverage minimum, then put it on a
                proposal the host can accept from their phone.
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <Link href="/tools/room-rental-pricing-calculator" className="rounded-lg border border-vs-border-strong bg-vs-bg px-4 py-2 font-semibold text-vs-text hover:border-vs-accent">Room rental pricing calculator →</Link>
                <Link href="/tools/food-beverage-minimum-calculator" className="rounded-lg border border-vs-border-strong bg-vs-bg px-4 py-2 font-semibold text-vs-text hover:border-vs-accent">F&amp;B minimum calculator →</Link>
                <Link href="/start" className="rounded-lg bg-vs-accent px-4 py-2 font-bold text-white hover:bg-vs-accent-hover">Start free</Link>
              </div>
            </section>
          </article>
        </div>
      </div>
    </>
  );
}
