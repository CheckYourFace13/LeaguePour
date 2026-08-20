import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: "Guides & Resources for Private Event Venues | VenueSprocket" },
  description:
    "Free guides on running private events at restaurants, bars, breweries, and taprooms - BEOs, contracts, inquiry forms, and the practical documents venues actually need.",
  alternates: { canonical: "https://venuesprocket.com/guides" },
  openGraph: {
    title: "Guides & Resources for Private Event Venues | VenueSprocket",
    description:
      "Free guides and templates for restaurants, bars, breweries, and taprooms booking private events.",
    url: "https://venuesprocket.com/guides",
  },
};

const guides = [
  {
    href: "/guides/what-is-a-beo",
    title: "What Is a BEO (Banquet Event Order)?",
    description:
      "What a BEO is, what it includes, and how it fits between your contract and event day - explained for venues that have never used one.",
    tag: "BEO",
  },
  {
    href: "/guides/beo-template",
    title: "Banquet Event Order (BEO) Template",
    description:
      "A free, copyable BEO template with realistic field names, an example filled-out version, and a pre-event checklist.",
    tag: "Template",
  },
  {
    href: "/guides/beo-vs-contract",
    title: "BEO vs. Event Contract: What's the Difference?",
    description:
      "A BEO and a contract serve completely different purposes. Here's what each one actually does - and why a BEO can't replace a signed contract.",
    tag: "BEO",
  },
  {
    href: "/guides/private-event-inquiry-form-template",
    title: "Private Event Inquiry Form Template",
    description:
      "The fields every private event inquiry form needs, a filled-out example, and what to do in the first hour after a lead comes in.",
    tag: "Template",
  },
];

export default function VsGuidesIndexPage() {
  return (
    <div className="vs-section px-4 md:px-6">
      <div className="mx-auto max-w-4xl">
        <p className="vs-kicker mb-3">Free resources</p>
        <h1 className="vs-page-title text-4xl md:text-5xl mb-4">
          Guides for booking and running private events
        </h1>
        <p className="vs-page-sub max-w-2xl mb-12">
          Practical guides and copyable templates for restaurants, bars, breweries, and taprooms
          managing private event inquiries, proposals, contracts, and BEOs - useful whether or not
          you use VenueSprocket.
        </p>

        <div className="space-y-4">
          {guides.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="block rounded-xl border border-vs-border bg-vs-surface p-6 transition-colors hover:border-vs-accent/40 hover:bg-vs-surface-2"
            >
              <div className="flex items-start gap-4">
                <span className="mt-0.5 shrink-0 rounded-full bg-vs-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-vs-accent">
                  {guide.tag}
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold text-vs-text">{guide.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-vs-text-soft">{guide.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center rounded-2xl border border-vs-border bg-vs-surface p-10">
          <h2 className="font-display text-2xl font-bold text-vs-text mb-3">
            Ready to run this in one place?
          </h2>
          <p className="text-vs-text-soft mb-6 max-w-xl mx-auto">
            VenueSprocket connects inquiries, proposals, contracts, deposits, and BEOs into one
            workflow - no more piecing it together from email and Word documents.
          </p>
          <Link
            href="/start"
            className="inline-flex rounded-xl bg-vs-accent px-8 py-4 text-lg font-bold text-white hover:bg-vs-accent-hover transition-colors"
          >
            Start free
          </Link>
        </div>
      </div>
    </div>
  );
}
