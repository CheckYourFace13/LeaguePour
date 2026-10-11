import type { Metadata } from "next";
import Link from "next/link";
import { safeJsonLd } from "@/lib/seo/json-ld-builders";

const URL = "https://venuesprocket.com/tools";

export const metadata: Metadata = {
  title: { absolute: "Free Private Event Calculators for Venues | VenueSprocket" },
  description:
    "Free, no-login calculators for restaurants, bars, breweries, and event spaces: F&B minimums, deposits, event profit, and room rental pricing - every formula shown.",
  alternates: { canonical: URL },
  openGraph: {
    siteName: "VenueSprocket", images: [{ url: "/venuesprocket/opengraph-image", alt: "VenueSprocket - private event management software" }], title: "Free private event calculators", description: "F&B minimum, deposit, event profit, and room rental pricing calculators - no login.", url: URL },
};

const tools = [
  {
    href: "/tools/food-beverage-minimum-calculator",
    title: "Food & beverage minimum calculator",
    body: "Projected spend, shortfall against a minimum, service charge and tax, and the headcount or per-guest spend needed to clear it.",
  },
  {
    href: "/tools/event-deposit-calculator",
    title: "Event deposit calculator",
    body: "Deposit as a percent or flat amount, remaining balance, balance due date, and an estimate of card processing on the deposit.",
  },
  {
    href: "/tools/event-profit-calculator",
    title: "Event profit calculator",
    body: "What a private event actually makes after food, beverage, labor, and card costs - in total, per guest, and against a normal night.",
  },
  {
    href: "/tools/room-rental-pricing-calculator",
    title: "Room rental pricing calculator",
    body: "The break-even room fee from what the space normally earns plus what a booking adds, and the equivalent food and beverage minimum.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "VenueSprocket", item: "https://venuesprocket.com" },
    { "@type": "ListItem", position: 2, name: "Free tools", item: URL },
  ],
};

export default function VsToolsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <div className="vs-section px-4 md:px-6">
        <div className="mx-auto max-w-4xl">
          <p className="vs-kicker mb-3">Free tools</p>
          <h1 className="vs-page-title text-4xl md:text-5xl mb-5">Free private event calculators</h1>
          <p className="mb-10 max-w-2xl text-lg leading-relaxed text-vs-text-soft">
            Quick, no-login calculators for the numbers you quote on every private event. They run in
            your browser, store nothing, and show the math behind every result.
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            {tools.map((t) => (
              <Link key={t.href} href={t.href} className="group rounded-2xl border border-vs-border bg-vs-surface p-6 transition-colors hover:border-vs-accent">
                <h2 className="font-display text-xl font-bold text-vs-text group-hover:text-vs-accent">{t.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-vs-text-soft">{t.body}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-vs-accent">Open the calculator →</span>
              </Link>
            ))}
          </div>
          <p className="mt-10 text-sm text-vs-text-soft">
            Writing a cancellation policy? That&apos;s a judgment call, not a calculation - see the{" "}
            <Link href="/guides/event-cancellation-policy-examples-for-restaurants-and-venues" className="font-semibold text-vs-accent hover:underline">four example policies</Link>{" "}
            and when each one fits. Looking for documents instead? See the{" "}
            <Link href="/templates" className="font-semibold text-vs-accent hover:underline">free templates and checklists</Link>{" "}
            or the <Link href="/guides" className="font-semibold text-vs-accent hover:underline">guides</Link>.
          </p>
        </div>
      </div>
    </>
  );
}
