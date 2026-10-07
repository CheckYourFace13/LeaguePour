import type { Metadata } from "next";
import Link from "next/link";
import { safeJsonLd } from "@/lib/seo/json-ld-builders";
import { FbMinimumCalculator } from "@/components/venuesprocket/tools/fb-minimum-calculator";

const URL = "https://venuesprocket.com/tools/food-beverage-minimum-calculator";

export const metadata: Metadata = {
  title: { absolute: "Food & Beverage Minimum Calculator for Private Events | VenueSprocket" },
  description:
    "Free food and beverage minimum calculator: projected spend, shortfall, service charge, tax, and the guest count or per-guest spend needed to hit a minimum. Shows every step of the math.",
  alternates: { canonical: URL },
  openGraph: {
    siteName: "VenueSprocket",
    title: "Food & Beverage Minimum Calculator",
    description: "Projected spend, shortfall, service charge, and tax for a private event minimum - with the math shown.",
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
        { "@type": "ListItem", position: 3, name: "Food & beverage minimum calculator", item: URL },
      ],
    },
    {
      "@type": "WebApplication",
      name: "Food & Beverage Minimum Calculator",
      url: URL,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any (web browser)",
      isAccessibleForFree: true,
      publisher: { "@type": "Organization", name: "VenueSprocket", url: "https://venuesprocket.com" },
    },
  ],
};

export default function FbMinimumCalculatorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <div className="vs-section px-4 md:px-6">
        <div className="mx-auto max-w-5xl">
          <nav className="mb-8 text-sm text-vs-muted">
            <Link href="/tools" className="hover:text-vs-accent">Free tools</Link>
            {" / "}
            <span className="font-medium text-vs-text-soft">F&amp;B minimum calculator</span>
          </nav>
          <p className="vs-kicker mb-3">Free tool · no login</p>
          <h1 className="vs-page-title text-4xl md:text-5xl mb-5">Food &amp; beverage minimum calculator</h1>
          <p className="mb-10 max-w-3xl text-lg leading-relaxed text-vs-text-soft">
            Plug in a headcount and what a typical guest spends to see whether a group will clear your
            minimum, how big the shortfall would be, and what the bill looks like with service charge and
            tax. Every result shows the formula behind it.
          </p>

          <FbMinimumCalculator />

          <article className="mt-16 max-w-3xl space-y-10">
            <section>
              <h2 className="font-display text-2xl font-bold text-vs-text mb-3">How an F&amp;B minimum works</h2>
              <p className="leading-relaxed text-vs-text-soft">
                A food and beverage minimum is the amount a group agrees to spend on food and drink in
                exchange for a private room or buyout. If they spend more, they pay what they spent. If
                they spend less, the difference is still owed - usually shown on the final bill as a
                &ldquo;minimum shortfall&rdquo; or room charge. It protects the revenue you&apos;d have made
                from that space on a normal night without charging a flat rental fee up front.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-vs-text mb-3">A worked example</h2>
              <p className="leading-relaxed text-vs-text-soft mb-4">
                A group of 40 books your back room with a $2,000 minimum. From past events you expect about
                $28 of food and $18 of drinks per person:
              </p>
              <ul className="space-y-2 rounded-xl border border-vs-border bg-vs-surface p-5 font-mono text-sm text-vs-text-soft">
                <li>Projected spend: 40 × ($28 + $18) = $1,840</li>
                <li>Shortfall: $2,000 − $1,840 = $160</li>
                <li>Billed toward F&amp;B: $2,000 (the higher of the two)</li>
                <li>Service charge at 20%: $400 · tax at 8%: $160</li>
                <li>Estimated F&amp;B total: $2,560</li>
              </ul>
              <p className="mt-4 leading-relaxed text-vs-text-soft">
                The same inputs tell you the group would need 44 guests at that spend to clear the
                minimum on their own (⌈$2,000 ÷ $46⌉), or about $50 per guest at 40 people. That&apos;s a
                useful number to share up front: it lets the host decide whether to upgrade the menu or
                accept a small room charge, instead of being surprised on the night.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-vs-text mb-3">Things to decide before you quote a minimum</h2>
              <ul className="space-y-2 leading-relaxed text-vs-text-soft">
                <li>• <strong className="text-vs-text">What counts toward it.</strong> Food and drink only? Does a cake fee or a corkage fee count? Say so in writing.</li>
                <li>• <strong className="text-vs-text">Pre- or post-tax and service charge.</strong> Most venues set minimums before tax and service charge; whichever you choose, state it on the proposal.</li>
                <li>• <strong className="text-vs-text">Day and season.</strong> A Saturday in December displaces far more regular business than a Tuesday in February. Many venues set different minimums by day of week.</li>
                <li>• <strong className="text-vs-text">How the shortfall is shown.</strong> A line item called &ldquo;room minimum shortfall&rdquo; is clearer for the host than a vague &ldquo;room fee&rdquo; added later.</li>
                <li>• <strong className="text-vs-text">Guest count changes.</strong> If the group shrinks, the minimum usually doesn&apos;t - spell that out in the contract.</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-vs-border-strong bg-vs-surface-2 p-6">
              <h2 className="font-display text-xl font-bold text-vs-text mb-2">Put the minimum on a real proposal</h2>
              <p className="mb-4 leading-relaxed text-vs-text-soft">
                In VenueSprocket, a proposal carries the room fee, the food and beverage minimum, and the
                deposit, and the customer accepts it from a link on their phone.
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <Link href="/start" className="rounded-lg bg-vs-accent px-4 py-2 font-bold text-white hover:bg-vs-accent-hover">Start free</Link>
                <Link href="/tools/event-deposit-calculator" className="rounded-lg border border-vs-border-strong bg-vs-bg px-4 py-2 font-semibold text-vs-text hover:border-vs-accent">Event deposit calculator →</Link>
                <Link href="/templates" className="rounded-lg border border-vs-border-strong bg-vs-bg px-4 py-2 font-semibold text-vs-text hover:border-vs-accent">Proposal checklist →</Link>
              </div>
            </section>
          </article>
        </div>
      </div>
    </>
  );
}
