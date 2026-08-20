import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: "What Is a BEO? Banquet Event Order Explained | VenueSprocket" },
  description:
    "A BEO (Banquet Event Order) is the internal document that tells your staff how to run a private event. Here's what it is, what it includes, and how it differs from an inquiry, proposal, or contract.",
  alternates: { canonical: "https://venuesprocket.com/guides/what-is-a-beo" },
  openGraph: {
    title: "What Is a BEO? Banquet Event Order Explained",
    description:
      "What a BEO is, what it includes, and where it fits in the private event booking process.",
    url: "https://venuesprocket.com/guides/what-is-a-beo",
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
        { "@type": "ListItem", position: 3, name: "What Is a BEO?", item: "https://venuesprocket.com/guides/what-is-a-beo" },
      ],
    },
    {
      "@type": "Article",
      headline: "What Is a BEO? Banquet Event Order Explained",
      description:
        "A BEO (Banquet Event Order) is the internal document that tells your staff how to run a private event - what it is, what it includes, and how it fits into the booking process.",
      author: { "@type": "Organization", name: "VenueSprocket" },
      publisher: { "@type": "Organization", name: "VenueSprocket", url: "https://venuesprocket.com" },
      url: "https://venuesprocket.com/guides/what-is-a-beo",
      datePublished: "2026-08-19",
      dateModified: "2026-08-19",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Who writes the BEO - the venue or the customer?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The venue writes it. A BEO is an internal operations document for your staff, not something the customer fills out or signs. It's built from the details already gathered during the inquiry, proposal, and contract stages.",
          },
        },
        {
          "@type": "Question",
          name: "Does every private event need a BEO?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A small, simple booking with one or two staff involved might not need a formal BEO. Once multiple staff, departments (kitchen, bar, floor), or setup steps are involved, a BEO prevents details from getting lost between the person who booked the event and the people running it.",
          },
        },
        {
          "@type": "Question",
          name: "Is a BEO a legal document?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. A BEO is an internal operational document, not a legal agreement. It isn't signed by the customer and doesn't establish payment or cancellation terms - that's the job of the event contract. Do not rely on a BEO in place of a signed contract.",
          },
        },
      ],
    },
  ],
};

const distinctions = [
  {
    doc: "Inquiry",
    who: "Customer → Venue",
    purpose: "The customer's first request: what kind of event, roughly when, roughly how many guests.",
  },
  {
    doc: "Proposal",
    who: "Venue → Customer",
    purpose: "The venue's offer: packages, pricing, room, and what's included, sent for the customer to review.",
  },
  {
    doc: "Contract",
    who: "Venue ↔ Customer, signed",
    purpose: "The legally binding agreement: price, deposit terms, cancellation policy, both parties' signatures.",
  },
  {
    doc: "Deposit / payment record",
    who: "Customer → Venue",
    purpose: "Proof of payment securing the date - a receipt, not a plan for how the event runs.",
  },
  {
    doc: "BEO",
    who: "Internal, venue staff only",
    purpose: "The operational plan: exact setup, timeline, food and beverage, staffing, and day-of details.",
  },
];

export default function WhatIsABeoGuide() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="vs-section px-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          <nav className="mb-8 text-sm text-vs-muted">
            <Link href="/guides" className="hover:text-vs-accent">Guides</Link>
            {" / "}
            <span className="text-vs-text-soft font-medium">What Is a BEO?</span>
          </nav>

          <p className="vs-kicker mb-3">BEO basics</p>
          <h1 className="vs-page-title text-4xl md:text-5xl mb-6">
            What Is a BEO?
          </h1>
          <p className="text-vs-text-soft text-lg leading-relaxed mb-10">
            BEO stands for <strong className="text-vs-text">Banquet Event Order</strong>. If you've
            never used one, it's the single document that tells your staff exactly what's supposed to
            happen for a private event - the plan the kitchen, bar, and floor staff all work from on
            the day itself.
          </p>

          <div className="space-y-10 text-vs-text-soft leading-relaxed">

            <section>
              <h2 className="font-display text-2xl font-bold text-vs-text mb-4">The short definition</h2>
              <p>
                A BEO is an internal planning document that lays out everything your staff needs to
                execute a booked private event correctly: the event timeline, room setup, food and
                beverage details, staffing assignments, AV or equipment needs, and any special
                instructions. It's written by the venue, for the venue - the customer typically never
                sees it.
              </p>
              <p className="mt-4">
                Think of it as the difference between agreeing to host an event (the contract) and
                actually knowing how to run it (the BEO). A signed contract tells you the event is
                happening and what the customer is paying. A BEO tells your bartender what time to
                start pouring and your kitchen when the entrées need to hit the table.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-vs-text mb-4">What a BEO typically includes</h2>
              <ul className="space-y-2 list-disc pl-5">
                <li>Event name, date, and time, including setup and teardown windows</li>
                <li>Guest count and room or space assignment</li>
                <li>Food and beverage selections, packages, or menus</li>
                <li>A run-of-show timeline: doors open, guest arrival, service start, speeches, last call, teardown</li>
                <li>Staffing notes - who's covering the event and what their responsibilities are</li>
                <li>AV, equipment, or setup requirements (tables, chairs, sound system, decor restrictions)</li>
                <li>Allergies, dietary restrictions, or special requests</li>
                <li>Internal notes for staff only - VIP flags, known issues, manager reminders</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-vs-text mb-4">
                How a BEO is different from an inquiry, proposal, contract, and deposit
              </h2>
              <p className="mb-5">
                These are five different documents that show up at five different stages of booking a
                private event. Confusing them is common if you're new to running private events -
                here's how they differ:
              </p>
              <div className="overflow-x-auto rounded-2xl border border-vs-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-vs-border bg-vs-surface-2">
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-vs-muted">Document</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-vs-muted">Direction</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-vs-muted">Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    {distinctions.map((d, i) => (
                      <tr key={d.doc} className={["border-b border-vs-border/50 last:border-0", i % 2 === 0 ? "bg-vs-surface" : "bg-vs-bg"].join(" ")}>
                        <td className="px-4 py-3 font-semibold text-vs-text">{d.doc}</td>
                        <td className="px-4 py-3 text-vs-text-soft">{d.who}</td>
                        <td className="px-4 py-3 text-vs-text-soft">{d.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-5">
                The most important distinction: a BEO is <strong className="text-vs-text">not</strong>{" "}
                a substitute for a signed contract. A BEO doesn't establish payment terms, cancellation
                policy, or legal liability - it's an operations document, not a binding agreement. Read
                more in{" "}
                <Link href="/guides/beo-vs-contract" className="text-vs-accent hover:underline">
                  BEO vs. Event Contract
                </Link>.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-vs-text mb-4">When a BEO gets created</h2>
              <p>
                A BEO is typically finalized after the contract is signed and the deposit is paid -
                once the booking is confirmed, not before. It's often built directly from the details
                already collected during the inquiry and proposal stages, then refined as the event
                date approaches and specifics (final guest count, menu selections, timeline) are locked
                in, usually a few days to a week before the event.
              </p>
            </section>

          </div>

          <div className="mt-14 rounded-2xl border border-vs-border-strong bg-vs-surface-2 p-8">
            <h2 className="font-display text-xl font-bold text-vs-text mb-3">Ready to build a BEO?</h2>
            <p className="text-vs-text-soft mb-5">
              Use our free copyable template to build your first BEO by hand, or see how VenueSprocket
              generates one automatically from your event details.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/guides/beo-template"
                className="inline-flex rounded-xl bg-vs-accent px-6 py-3 text-base font-bold text-white hover:bg-vs-accent-hover transition-colors"
              >
                Get the free BEO template
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
                  q: "Who writes the BEO - the venue or the customer?",
                  a: "The venue writes it. A BEO is an internal operations document for your staff, not something the customer fills out or signs.",
                },
                {
                  q: "Does every private event need a BEO?",
                  a: "A small, simple booking might not need one. Once multiple staff or departments are involved, a BEO prevents details from getting lost between booking and event day.",
                },
                {
                  q: "Is a BEO a legal document?",
                  a: "No. It's an internal operational document, not a signed legal agreement. Payment and cancellation terms belong in the event contract, not the BEO.",
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
            <Link href="/guides/beo-template" className="font-semibold text-vs-accent hover:underline">BEO template →</Link>
            <Link href="/guides/beo-vs-contract" className="font-semibold text-vs-accent hover:underline">BEO vs. contract →</Link>
          </div>
        </div>
      </div>
    </>
  );
}
