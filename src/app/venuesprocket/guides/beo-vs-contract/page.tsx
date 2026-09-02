import { safeJsonLd } from "@/lib/seo/json-ld-builders";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: "BEO vs. Event Contract: What's the Difference? | VenueSprocket" },
  description:
    "A BEO and an event contract are not the same document and one cannot replace the other. Here's what each one actually does, who signs what, and when each one applies.",
  alternates: { canonical: "https://venuesprocket.com/guides/beo-vs-contract" },
  openGraph: {
    title: "BEO vs. Event Contract: What's the Difference?",
    description:
      "What a BEO does, what a contract does, and why a BEO can't replace a signed event contract.",
    url: "https://venuesprocket.com/guides/beo-vs-contract",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "VenueSprocket", item: "https://venuesprocket.com" },
        { "@type": "ListItem", position: 2, name: "Guides", item: "https://venuesprocket.com/guides" },
        { "@type": "ListItem", position: 3, name: "BEO vs. Contract", item: "https://venuesprocket.com/guides/beo-vs-contract" },
      ],
    },
    {
      "@type": "Article",
      headline: "BEO vs. Event Contract: What's the Difference?",
      description:
        "A BEO and an event contract serve different purposes and one cannot replace the other - a breakdown of what each document does.",
      author: { "@type": "Organization", name: "VenueSprocket" },
      publisher: { "@type": "Organization", name: "VenueSprocket", url: "https://venuesprocket.com" },
      url: "https://venuesprocket.com/guides/beo-vs-contract",
      datePublished: "2026-08-19",
      dateModified: "2026-08-19",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Can a BEO replace a signed contract?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. A BEO is an internal staff document with no signature, no payment terms, and no cancellation policy. It has no legal standing on its own. Always get a signed contract in place before treating a booking as confirmed, regardless of how detailed the BEO is.",
          },
        },
        {
          "@type": "Question",
          name: "Does the customer ever see the BEO?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Usually not. A BEO is written for internal staff - kitchen, bar, floor, and management - and often includes internal notes that aren't meant for the customer. Some venues share a simplified version with the client to confirm details, but the working copy stays internal.",
          },
        },
        {
          "@type": "Question",
          name: "Which comes first, the BEO or the contract?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The contract comes first. A venue typically finalizes the BEO only after the contract is signed and the booking is confirmed - there's no reason to build a detailed operational plan for an event that isn't locked in yet.",
          },
        },
      ],
    },
  ],
};

export default function BeoVsContractGuide() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <div className="vs-section px-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          <nav className="mb-8 text-sm text-vs-muted">
            <Link href="/guides" className="hover:text-vs-accent">Guides</Link>
            {" / "}
            <span className="text-vs-text-soft font-medium">BEO vs. Contract</span>
          </nav>

          <p className="vs-kicker mb-3">BEO basics</p>
          <h1 className="vs-page-title text-4xl md:text-5xl mb-6">
            BEO vs. Event Contract: What's the Difference?
          </h1>
          <p className="text-vs-text-soft text-lg leading-relaxed mb-10">
            These two documents get confused constantly, and the confusion matters: treating a BEO as
            if it were a contract can leave a venue with no real protection if a booking falls through.
            Here's exactly what each one does.
          </p>

          <div className="space-y-10 text-vs-text-soft leading-relaxed">

            <section>
              <h2 className="font-display text-2xl font-bold text-vs-text mb-4">
                The one-sentence version
              </h2>
              <p>
                A <strong className="text-vs-text">contract</strong> is a legal agreement that
                confirms the booking is happening and what happens if it doesn't. A{" "}
                <strong className="text-vs-text">BEO</strong> is an internal plan for how to actually
                run the event once it's confirmed. One protects the business; the other runs the room.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-vs-text mb-4">What an event contract does</h2>
              <ul className="space-y-2 list-disc pl-5">
                <li>Establishes a legally binding agreement between the venue and the customer</li>
                <li>States the total price, deposit amount, and payment schedule</li>
                <li>Defines the cancellation and refund policy</li>
                <li>Is signed by the customer (and often the venue), with a name, date, and often a timestamp/IP record for online signing</li>
                <li>Protects the venue if a customer cancels late, disputes a charge, or doesn't pay the balance</li>
              </ul>
              <p className="mt-4">
                Without a signed contract, a venue has little real recourse if a customer cancels the
                week of the event after the room has been held and staff scheduled.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-vs-text mb-4">What a BEO does</h2>
              <ul className="space-y-2 list-disc pl-5">
                <li>Lays out the operational details staff need: timeline, room setup, food and beverage, AV, staffing</li>
                <li>Is written and used internally - the customer usually never signs or even sees it</li>
                <li>Has no legal weight - it doesn't establish payment terms or cancellation policy</li>
                <li>Gets updated freely as details change, right up until event day, without needing a new signature</li>
              </ul>
              <p className="mt-4">
                A BEO can be as detailed and useful as you want, but it does not substitute for a
                signed agreement. See the full field list in our{" "}
                <Link href="/guides/beo-template" className="text-vs-accent hover:underline">
                  BEO template
                </Link>.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-vs-text mb-4">Side-by-side comparison</h2>
              <div className="overflow-x-auto rounded-2xl border border-vs-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-vs-border bg-vs-surface-2">
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-vs-muted">Question</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-vs-accent">Contract</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-vs-muted">BEO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Is it legally binding?", "Yes", "No"],
                      ["Who signs it?", "Customer (and often venue)", "Nobody - internal only"],
                      ["Does it set payment terms?", "Yes", "No"],
                      ["Does it set a cancellation policy?", "Yes", "No"],
                      ["Does it describe room setup and timeline?", "Rarely in detail", "Yes, in detail"],
                      ["When is it created?", "Before the booking is confirmed", "After the booking is confirmed"],
                      ["Can it change after signing?", "Only with an amendment", "Yes, freely, up to event day"],
                    ].map((row, i) => (
                      <tr key={row[0]} className={["border-b border-vs-border/50 last:border-0", i % 2 === 0 ? "bg-vs-surface" : "bg-vs-bg"].join(" ")}>
                        <td className="px-4 py-3 font-semibold text-vs-text">{row[0]}</td>
                        <td className="px-4 py-3 text-vs-text-soft">{row[1]}</td>
                        <td className="px-4 py-3 text-vs-text-soft">{row[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-vs-text mb-4">
                Why this distinction matters
              </h2>
              <p>
                Some venues skip a formal contract for smaller private events and rely on a detailed
                BEO instead, treating it as proof the event was agreed to. That's a real risk: a BEO
                has no signature and no stated cancellation or payment terms, so it offers little
                protection if a customer disputes a charge or cancels without notice. For any event
                involving a deposit, a room hold, or dedicated staffing, get a signed contract in place
                first - then build the BEO once the booking is confirmed.
              </p>
            </section>

          </div>

          <div className="mt-14 rounded-2xl border border-vs-border-strong bg-vs-surface-2 p-8">
            <h2 className="font-display text-xl font-bold text-vs-text mb-3">
              Get both handled in one workflow
            </h2>
            <p className="text-vs-text-soft mb-5">
              VenueSprocket generates a contract from your event details for online signing, then
              builds the BEO from the same record once the deposit is paid - no re-entering details
              twice.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/event-contract-software"
                className="inline-flex rounded-xl bg-vs-accent px-6 py-3 text-base font-bold text-white hover:bg-vs-accent-hover transition-colors"
              >
                See contract software →
              </Link>
              <Link
                href="/beo-software"
                className="inline-flex rounded-xl border border-vs-border-strong bg-vs-surface px-6 py-3 text-base font-bold text-vs-text hover:border-vs-accent transition-colors"
              >
                See BEO software →
              </Link>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="font-display text-xl font-bold text-vs-text mb-5">Frequently asked questions</h2>
            <div className="space-y-4">
              {[
                {
                  q: "Can a BEO replace a signed contract?",
                  a: "No. A BEO has no signature, payment terms, or cancellation policy and has no legal standing on its own. Always get a signed contract in place first.",
                },
                {
                  q: "Does the customer ever see the BEO?",
                  a: "Usually not - it's an internal staff document, sometimes including notes not meant for the customer. Some venues share a simplified version to confirm details.",
                },
                {
                  q: "Which comes first, the BEO or the contract?",
                  a: "The contract comes first. The BEO is typically finalized only after the contract is signed and the booking is confirmed.",
                },
              ].map((f) => (
                <details key={f.q} className="rounded-xl border border-vs-border bg-vs-surface px-5 py-4">
                  <summary className="cursor-pointer list-none font-semibold text-vs-text [&::-webkit-details-marker]:hidden">
                    {f.q}
                  </summary>
                  <p className="mt-3 text-sm text-vs-text-soft leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-4 text-sm">
            <Link href="/guides" className="font-semibold text-vs-accent hover:underline">← All guides</Link>
            <Link href="/guides/what-is-a-beo" className="font-semibold text-vs-accent hover:underline">What is a BEO? →</Link>
            <Link href="/guides/beo-template" className="font-semibold text-vs-accent hover:underline">BEO template →</Link>
          </div>
        </div>
      </div>
    </>
  );
}
