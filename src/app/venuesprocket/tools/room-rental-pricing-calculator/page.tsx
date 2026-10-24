import type { Metadata } from "next";
import Link from "next/link";
import { safeJsonLd } from "@/lib/seo/json-ld-builders";
import { RoomRentalCalculator } from "@/components/venuesprocket/tools/room-rental-calculator";

const URL = "https://venuesprocket.com/tools/room-rental-pricing-calculator";
const DESCRIPTION =
  "Free room rental pricing calculator for restaurants, bars, and event spaces: find the break-even room fee from what the space normally earns plus the costs a booking adds. Method and formulas shown.";

export const metadata: Metadata = {
  title: { absolute: "Room Rental Pricing Calculator for Private Events | VenueSprocket" },
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { siteName: "VenueSprocket", images: [{ url: "/venuesprocket/opengraph-image", alt: "VenueSprocket - private event management software" }], title: "Room rental pricing calculator", description: DESCRIPTION, url: URL },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "VenueSprocket", item: "https://venuesprocket.com" },
        { "@type": "ListItem", position: 2, name: "Free tools", item: "https://venuesprocket.com/tools" },
        { "@type": "ListItem", position: 3, name: "Room rental pricing calculator", item: URL },
      ],
    },
    {
      "@type": "WebApplication",
      name: "Room Rental Pricing Calculator",
      url: URL,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any (web browser)",
      isAccessibleForFree: true,
      publisher: { "@type": "Organization", name: "VenueSprocket", url: "https://venuesprocket.com" },
    },
  ],
};

export default function RoomRentalCalculatorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <div className="vs-section px-4 md:px-6">
        <div className="mx-auto max-w-5xl">
          <nav className="mb-8 text-sm text-vs-muted">
            <Link href="/tools" className="hover:text-vs-accent">Free tools</Link>
            {" / "}
            <span className="font-medium text-vs-text-soft">Room rental pricing calculator</span>
          </nav>
          <p className="vs-kicker mb-3">Free tool · no login</p>
          <h1 className="vs-page-title text-4xl md:text-5xl mb-5">Room rental pricing calculator</h1>
          <p className="mb-10 max-w-3xl text-lg leading-relaxed text-vs-text-soft">
            There&apos;s no single correct price for a room. There is a floor: the least a booking has to
            bring in before you&apos;d have been better off staying open as usual. This works that floor
            out from your own numbers and shows the method.
          </p>

          <RoomRentalCalculator />

          <article className="mt-16 max-w-3xl space-y-10">
            <section>
              <h2 className="font-display text-2xl font-bold text-vs-text mb-3">The method</h2>
              <ol className="list-decimal space-y-2 pl-6 leading-relaxed text-vs-text-soft">
                <li><strong className="text-vs-text">What you give up.</strong> Typical sales from that space in that time slot, times the share you keep after food, drink, and hourly labor.</li>
                <li><strong className="text-vs-text">What the booking adds.</strong> Extra staff, setup, cleaning, rentals.</li>
                <li><strong className="text-vs-text">Break-even.</strong> Add the two. Below this, the booking loses to a normal night.</li>
                <li><strong className="text-vs-text">Your cushion.</strong> A percentage on top for the risk and the work - your call, not a rule.</li>
              </ol>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-vs-text mb-3">A worked example</h2>
              <ul className="space-y-2 rounded-xl border border-vs-border bg-vs-surface p-5 font-mono text-sm text-vs-text-soft">
                <li>Normal sales in that slot: $1,500, of which you keep 35% = $525</li>
                <li>Costs the booking adds: $250 staff + $100 setup = $350</li>
                <li>Break-even room fee: $525 + $350 = $875</li>
                <li>With a 20% cushion: $875 × 1.20 = $1,050 ($210 per hour over 5 hours)</li>
                <li>As an F&amp;B minimum at a 45% event margin: $1,050 ÷ 45% = $2,333</li>
              </ul>
              <p className="mt-4 leading-relaxed text-vs-text-soft">
                The last line is why many venues quote a minimum instead of a rental fee: a host
                hears &ldquo;spend $2,333 on food and drink&rdquo; more easily than &ldquo;pay $1,050 for the
                room&rdquo;, and you end up in the same place. For a room that would otherwise sit empty,
                enter $0 for normal sales and the floor is just your added costs.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-vs-text mb-3">What the calculator can&apos;t tell you</h2>
              <ul className="space-y-2 leading-relaxed text-vs-text-soft">
                <li>• What other venues near you charge, or what your market will bear.</li>
                <li>• How much more a December Saturday is worth than a February Tuesday - run it separately for each.</li>
                <li>• Whether a lower price is worth it to win a repeat corporate client. That&apos;s a judgment call the floor only informs.</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-vs-border-strong bg-vs-surface-2 p-6">
              <h2 className="font-display text-xl font-bold text-vs-text mb-2">Put the price on a proposal</h2>
              <p className="mb-4 leading-relaxed text-vs-text-soft">
                A VenueSprocket proposal carries a room fee, a food and beverage minimum, and the
                deposit, and the host accepts it from a link.
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <Link href="/tools/event-profit-calculator" className="rounded-lg border border-vs-border-strong bg-vs-bg px-4 py-2 font-semibold text-vs-text hover:border-vs-accent">Event profit calculator →</Link>
                <Link href="/templates/event-proposal-template" className="rounded-lg border border-vs-border-strong bg-vs-bg px-4 py-2 font-semibold text-vs-text hover:border-vs-accent">Proposal template →</Link>
                <Link href="/signup/venue" className="rounded-lg bg-vs-accent px-4 py-2 font-bold text-white hover:bg-vs-accent-hover">Start free</Link>
              </div>
            </section>
          </article>
        </div>
      </div>
    </>
  );
}
