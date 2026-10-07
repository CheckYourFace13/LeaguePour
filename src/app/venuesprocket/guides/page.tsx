import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: { absolute: "Guides & Resources for Private Event Venues | VenueSprocket" },
  description:
    "Free guides on running private events at restaurants, bars, breweries, and taprooms - BEOs, contracts, inquiry forms, and the practical documents venues actually need.",
  alternates: { canonical: "https://venuesprocket.com/guides" },
  openGraph: {
    siteName: "VenueSprocket",
    title: "Guides & Resources for Private Event Venues | VenueSprocket",
    description:
      "Free guides and templates for restaurants, bars, breweries, and taprooms booking private events.",
    url: "https://venuesprocket.com/guides",
  },
};

const coreGuides = [
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
  {
    href: "/guides/sample-proposal-and-contract",
    title: "Sample Event Proposal & Contract",
    description:
      "See what a proposal and e-signature contract actually look like, with a made-up event and customer - no login required.",
    tag: "Sample",
  },
];

export default async function VsGuidesIndexPage() {
  const generated = await prisma.guide
    .findMany({
      where: { brand: "VS", status: "PUBLISHED" },
      select: { slug: true, title: true, description: true, category: true, datePublished: true },
      orderBy: { datePublished: "desc" },
    })
    .catch(() => []);

  const byCategory = new Map<string, typeof generated>();
  for (const g of generated) {
    const list = byCategory.get(g.category) ?? [];
    list.push(g);
    byCategory.set(g.category, list);
  }
  const newest = generated.slice(0, 3);

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

        <h2 className="font-display text-xl font-bold text-vs-text mb-4">Core resources</h2>
        <div className="space-y-4">
          {coreGuides.map((guide) => (
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
                  <h3 className="font-display text-lg font-bold text-vs-text">{guide.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-vs-text-soft">{guide.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <h2 className="font-display text-xl font-bold text-vs-text mt-16 mb-4">Free tools &amp; templates</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { href: "/tools/food-beverage-minimum-calculator", title: "F&B minimum calculator", body: "Projected spend, shortfall, service charge, and tax - with the math shown." },
            { href: "/tools/event-deposit-calculator", title: "Event deposit calculator", body: "Deposit, remaining balance, due date, and a card-processing estimate." },
            { href: "/templates#proposal-checklist", title: "Proposal checklist", body: "Everything a host needs to say yes without a follow-up call." },
            { href: "/templates#contract-checklist", title: "Contract checklist", body: "The topics that cause disputes when a contract leaves them out." },
          ].map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="block rounded-xl border border-vs-border bg-vs-surface p-5 transition-colors hover:border-vs-accent/40 hover:bg-vs-surface-2"
            >
              <h3 className="font-display text-base font-bold text-vs-text">{t.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-vs-text-soft">{t.body}</p>
            </Link>
          ))}
        </div>

        {newest.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-xl font-bold text-vs-text mb-4">Newest guides</h2>
            <div className="space-y-4">
              {newest.map((g) => (
                <Link
                  key={g.slug}
                  href={`/guides/${g.slug}`}
                  className="block rounded-xl border border-vs-border bg-vs-surface p-6 transition-colors hover:border-vs-accent/40 hover:bg-vs-surface-2"
                >
                  <h3 className="font-display text-lg font-bold text-vs-text">{g.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-vs-text-soft">{g.description}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {[...byCategory.entries()].map(([category, guides]) => (
          <div key={category} className="mt-16">
            <h2 className="font-display text-xl font-bold text-vs-text mb-4">{category}</h2>
            <div className="space-y-4">
              {guides.map((g) => (
                <Link
                  key={g.slug}
                  href={`/guides/${g.slug}`}
                  className="block rounded-xl border border-vs-border bg-vs-surface p-6 transition-colors hover:border-vs-accent/40 hover:bg-vs-surface-2"
                >
                  <h3 className="font-display text-lg font-bold text-vs-text">{g.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-vs-text-soft">{g.description}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}

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
