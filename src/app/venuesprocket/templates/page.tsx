import type { Metadata } from "next";
import Link from "next/link";
import { safeJsonLd } from "@/lib/seo/json-ld-builders";
import { PrintButton } from "@/components/venuesprocket/tools/print-button";

const URL = "https://venuesprocket.com/templates";

export const metadata: Metadata = {
  title: { absolute: "Free Private Event Templates & Checklists (BEO, Proposal, Contract) | VenueSprocket" },
  description:
    "Free, ungated private event templates for restaurants, bars, and event spaces: a BEO template, a proposal checklist, a private event contract checklist, and an inquiry form template.",
  alternates: { canonical: URL },
  openGraph: {
    siteName: "VenueSprocket",
    title: "Free private event templates & checklists",
    description: "BEO template, proposal checklist, contract checklist, and inquiry form template - no email required.",
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
        { "@type": "ListItem", position: 2, name: "Templates", item: URL },
      ],
    },
    {
      "@type": "Article",
      headline: "Free Private Event Templates & Checklists",
      description:
        "A proposal checklist and a private event contract checklist for venues, plus links to a BEO template and an inquiry form template.",
      author: { "@type": "Organization", name: "VenueSprocket" },
      publisher: { "@type": "Organization", name: "VenueSprocket", url: "https://venuesprocket.com" },
      url: URL,
      datePublished: "2026-10-07",
      dateModified: "2026-10-07",
    },
  ],
};

const linked = [
  {
    href: "/guides/beo-template",
    title: "Banquet Event Order (BEO) template",
    body: "Every field your team looks for on event day, marked required or optional, with a filled-out example.",
  },
  {
    href: "/guides/private-event-inquiry-form-template",
    title: "Private event inquiry form template",
    body: "The fields to ask for on your inquiry form, an example submission, and what to do in the first hour.",
  },
  {
    href: "/guides/sample-proposal-and-contract",
    title: "Sample proposal & contract",
    body: "A fictional proposal and signed contract, so you can see the whole document set side by side.",
  },
];

const proposalChecklist: { group: string; items: string[] }[] = [
  {
    group: "Event basics",
    items: [
      "Host name, phone, and email",
      "Event type and occasion",
      "Date, arrival time, and end time (and setup/teardown windows if they matter)",
      "Room or area being booked, and whether it's a full buyout",
      "Expected guest count - and the date by which the final count is due",
    ],
  },
  {
    group: "Pricing",
    items: [
      "Room fee or buyout fee, if you charge one",
      "Food and beverage minimum, and whether it's before or after tax and service charge",
      "What counts toward the minimum (food and drink only? cake or corkage fees?)",
      "Service charge or auto-gratuity percentage",
      "Sales tax treatment",
      "Estimated total, labeled as an estimate",
    ],
  },
  {
    group: "Commitment",
    items: [
      "Deposit amount and when it's due",
      "When the remaining balance is due and how it's paid",
      "How long the proposal is valid before the date is released",
      "A clear next step: accept, then sign the contract, then pay the deposit",
    ],
  },
];

const contractChecklist: { group: string; items: string[] }[] = [
  {
    group: "Parties and event",
    items: [
      "Legal business name of the venue and the host's full name",
      "Event date, times, room or area, and expected guest count",
      "Reference to the accepted proposal (or the pricing restated)",
    ],
  },
  {
    group: "Money",
    items: [
      "Deposit amount, and that it's applied to the final bill",
      "Food and beverage minimum and how a shortfall is charged",
      "Service charge, gratuity, and tax terms",
      "Balance due date and accepted payment methods",
      "Who pays for damage, extra cleaning, or overtime past the end time",
    ],
  },
  {
    group: "Changes and cancellation",
    items: [
      "Final guest count deadline, and whether the minimum changes if the count drops",
      "Cancellation schedule: what's refundable, and until when",
      "Rescheduling: whether the deposit transfers, and for how long",
      "What happens if the venue has to cancel (closure, emergency, weather)",
    ],
  },
  {
    group: "House rules",
    items: [
      "Outside food, cake, and alcohol policy (and any corkage or cake-cutting fee)",
      "Decor restrictions (confetti, candles, adhesives) and vendor access times",
      "Responsible alcohol service: ID checks and the right to refuse service",
      "Music and noise limits, and the hard end time",
    ],
  },
  {
    group: "Signature",
    items: [
      "Signer's printed name, signature, and date",
      "A line confirming the signer has authority to book for their group or company",
    ],
  },
];

function Checklist({ data }: { data: { group: string; items: string[] }[] }) {
  return (
    <div className="space-y-5">
      {data.map((g) => (
        <div key={g.group}>
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-vs-muted">{g.group}</h3>
          <ul className="space-y-2">
            {g.items.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-vs-text-soft">
                <span className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded border border-vs-border-strong" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default function VsTemplatesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <div className="vs-section px-4 md:px-6">
        <div className="mx-auto max-w-4xl">
          <p className="vs-kicker mb-3">Free templates · no email required</p>
          <h1 className="vs-page-title text-4xl md:text-5xl mb-5">Private event templates &amp; checklists</h1>
          <p className="mb-10 max-w-3xl text-lg leading-relaxed text-vs-text-soft">
            The documents behind a smooth private event, free to copy, print, or adapt. Use the
            checklists below to make sure your proposal and contract cover what usually causes
            disputes - before the night, not after.
          </p>

          <section className="mb-14 grid gap-4 md:grid-cols-3 print:hidden">
            {linked.map((t) => (
              <Link key={t.href} href={t.href} className="group rounded-2xl border border-vs-border bg-vs-surface p-5 transition-colors hover:border-vs-accent">
                <h2 className="font-display text-lg font-bold text-vs-text group-hover:text-vs-accent">{t.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-vs-text-soft">{t.body}</p>
              </Link>
            ))}
          </section>

          <section id="proposal-checklist" className="mb-14 rounded-2xl border border-vs-border-strong bg-vs-surface p-6 md:p-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-bold text-vs-text">Private event proposal checklist</h2>
              <PrintButton />
            </div>
            <p className="mb-6 text-sm leading-relaxed text-vs-text-soft">
              A proposal should let the host say yes without a follow-up call. If any of these are
              missing, expect a back-and-forth email.
            </p>
            <Checklist data={proposalChecklist} />
          </section>

          <section id="contract-checklist" className="mb-14 rounded-2xl border border-vs-border-strong bg-vs-surface p-6 md:p-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-bold text-vs-text">Private event contract checklist</h2>
              <PrintButton />
            </div>
            <p className="mb-6 text-sm leading-relaxed text-vs-text-soft">
              Use this to review your own contract terms. It&apos;s a checklist of topics, not legal
              language - have an attorney draft or review the actual wording for your state.
            </p>
            <Checklist data={contractChecklist} />
          </section>

          <section className="rounded-2xl border border-vs-border bg-vs-surface-2 p-6 print:hidden">
            <h2 className="font-display text-xl font-bold text-vs-text mb-2">Run the numbers too</h2>
            <p className="mb-4 text-sm leading-relaxed text-vs-text-soft">
              Work out a minimum or a deposit with the free calculators, or see how VenueSprocket turns
              these documents into one workflow your customer completes on their phone.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <Link href="/tools" className="rounded-lg border border-vs-border-strong bg-vs-bg px-4 py-2 font-semibold text-vs-text hover:border-vs-accent">Free calculators →</Link>
              <Link href="/demo" className="rounded-lg border border-vs-border-strong bg-vs-bg px-4 py-2 font-semibold text-vs-text hover:border-vs-accent">Sample workflow →</Link>
              <Link href="/start" className="rounded-lg bg-vs-accent px-4 py-2 font-bold text-white hover:bg-vs-accent-hover">Start free</Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
