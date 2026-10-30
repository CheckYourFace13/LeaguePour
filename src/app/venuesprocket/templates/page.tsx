import type { Metadata } from "next";
import Link from "next/link";
import { safeJsonLd } from "@/lib/seo/json-ld-builders";

const URL = "https://venuesprocket.com/templates";

export const metadata: Metadata = {
  title: { absolute: "Free Proposal, Contract & BEO Templates | VenueSprocket" },
  description:
    "Free, ungated private event templates for restaurants, bars, and event spaces: proposal, contract checklist, BEO, inquiry form, and run of show. Copy or print - no email required.",
  alternates: { canonical: URL },
  openGraph: {
    siteName: "VenueSprocket", images: [{ url: "/venuesprocket/opengraph-image", alt: "VenueSprocket - private event management software" }],
    title: "Free private event templates",
    description: "Proposal, contract checklist, BEO, inquiry form, and run of show - no email required.",
    url: URL,
  },
};

// In the order a booking uses them.
const templates = [
  {
    href: "/guides/private-event-inquiry-form-template",
    step: "1 · Inquiry",
    title: "Inquiry form template",
    body: "The fields to ask for, an example submission, and what to do in the first hour after a lead comes in.",
  },
  {
    href: "/templates/event-proposal-template",
    step: "2 · Proposal",
    title: "Proposal template",
    body: "A one-page, copy-and-fill proposal with a filled-in example and a pre-send checklist.",
  },
  {
    href: "/templates/private-event-contract-checklist",
    step: "3 · Contract",
    title: "Contract checklist",
    body: "Every topic your contract should cover, plus sample deposit, cancellation, and guest-count wording.",
  },
  {
    href: "/guides/beo-template",
    step: "4 · Event order",
    title: "BEO template",
    body: "Every field your team looks for on event day, marked required or optional, with a filled-out example.",
  },
  {
    href: "/templates/run-of-show-template",
    step: "5 · Event day",
    title: "Run of show template",
    body: "A printable timeline with an owner for every step, and an example for a four-hour party.",
  },
];

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
      "@type": "ItemList",
      name: "Free private event templates",
      itemListElement: templates.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: t.title,
        url: `https://venuesprocket.com${t.href}`,
      })),
    },
  ],
};

export default function VsTemplatesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <div className="vs-section px-4 md:px-6">
        <div className="mx-auto max-w-4xl">
          <p className="vs-kicker mb-3">Free templates · no email required</p>
          <h1 className="vs-page-title text-4xl md:text-5xl mb-5">Private event templates</h1>
          <p className="mb-10 max-w-3xl text-lg leading-relaxed text-vs-text-soft">
            The five documents behind a smooth private event, in the order a booking uses them. Each
            one is free to copy, print, or adapt - no sign-up, no download gate.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((t) => (
              <Link key={t.href} href={t.href} className="group rounded-2xl border border-vs-border bg-vs-surface p-6 transition-colors hover:border-vs-accent">
                <p className="text-xs font-bold uppercase tracking-wider text-vs-muted">{t.step}</p>
                <h2 className="mt-2 font-display text-xl font-bold text-vs-text group-hover:text-vs-accent">{t.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-vs-text-soft">{t.body}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-vs-accent">Open the template →</span>
              </Link>
            ))}
            <Link href="/guides/sample-proposal-and-contract" className="group rounded-2xl border border-dashed border-vs-border-strong bg-vs-surface-2 p-6 transition-colors hover:border-vs-accent">
              <p className="text-xs font-bold uppercase tracking-wider text-vs-muted">See it together</p>
              <h2 className="mt-2 font-display text-xl font-bold text-vs-text group-hover:text-vs-accent">Sample proposal &amp; contract</h2>
              <p className="mt-2 text-sm leading-relaxed text-vs-text-soft">A fictional proposal and signed contract side by side, as a customer would see them.</p>
            </Link>
          </div>

          <section className="mt-12 rounded-2xl border border-vs-border bg-vs-surface-2 p-6">
            <h2 className="font-display text-xl font-bold text-vs-text mb-2">Run the numbers too</h2>
            <p className="mb-4 text-sm leading-relaxed text-vs-text-soft">
              Work out a minimum, a deposit, a room price, or what an event actually makes with the
              free calculators - or see how VenueSprocket turns these documents into one workflow your
              customer completes on their phone.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <Link href="/tools" className="rounded-lg border border-vs-border-strong bg-vs-bg px-4 py-2 font-semibold text-vs-text hover:border-vs-accent">Free calculators →</Link>
              <Link href="/demo" className="rounded-lg border border-vs-border-strong bg-vs-bg px-4 py-2 font-semibold text-vs-text hover:border-vs-accent">Sample workflow →</Link>
              <Link href="/signup/venue" className="rounded-lg bg-vs-accent px-4 py-2 font-bold text-white hover:bg-vs-accent-hover">Start free</Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
