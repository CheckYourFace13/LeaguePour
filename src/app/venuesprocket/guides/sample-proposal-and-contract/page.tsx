import { safeJsonLd } from "@/lib/seo/json-ld-builders";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: "Sample Event Proposal & Contract | VenueSprocket" },
  description:
    "See what a VenueSprocket proposal and e-signature contract actually look like, with a sample event and made-up customer - no login required.",
  alternates: { canonical: "https://venuesprocket.com/guides/sample-proposal-and-contract" },
  openGraph: {
    title: "Sample Event Proposal & Contract | VenueSprocket",
    description: "A sample proposal and contract preview - made-up event, made-up customer.",
    url: "https://venuesprocket.com/guides/sample-proposal-and-contract",
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
        { "@type": "ListItem", position: 3, name: "Sample Proposal & Contract", item: "https://venuesprocket.com/guides/sample-proposal-and-contract" },
      ],
    },
    {
      "@type": "Article",
      headline: "Sample Event Proposal & Contract",
      description:
        "A sample VenueSprocket proposal and e-signature contract, using a made-up event and customer.",
      author: { "@type": "Organization", name: "VenueSprocket" },
      publisher: { "@type": "Organization", name: "VenueSprocket", url: "https://venuesprocket.com" },
      url: "https://venuesprocket.com/guides/sample-proposal-and-contract",
      datePublished: "2026-09-13",
      dateModified: "2026-09-13",
    },
  ],
};

const lineItems = [
  { label: "Taproom back patio rental (4 hours)", amount: "$300.00" },
  { label: "Taco bar package (45 guests × $28)", amount: "$1,260.00" },
  { label: "Open bar, beer/wine/well (4-hour limit)", amount: "$540.00" },
  { label: "Deposit due today", amount: "$400.00", highlight: true },
];

export default function SampleProposalContractGuide() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <div className="vs-section px-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          <nav className="mb-8 text-sm text-vs-muted">
            <Link href="/guides" className="hover:text-vs-accent">Guides</Link>
            {" / "}
            <span className="text-vs-text-soft font-medium">Sample Proposal & Contract</span>
          </nav>

          <p className="vs-kicker mb-3">Sample - not a real customer</p>
          <h1 className="vs-page-title text-4xl md:text-5xl mb-6">
            What a proposal and contract look like
          </h1>
          <p className="text-vs-text-soft text-lg leading-relaxed mb-10">
            Below is a made-up example - a fictional birthday buyout for a fictional customer - so
            you can see what your own customers would see, without creating a real account. Nothing
            on this page is a working form; it&apos;s a preview only.
          </p>

          {/* Sample proposal */}
          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-vs-text mb-4">Sample proposal</h2>
            <div className="rounded-2xl border border-vs-border-strong bg-vs-surface-2 p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                <div>
                  <p className="font-display text-lg font-bold text-vs-text">Marino 40th Birthday Buyout</p>
                  <p className="text-sm text-vs-muted">Saturday, October 17 · The Blue Line Taproom</p>
                </div>
                <span className="rounded-full bg-vs-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-vs-accent">
                  Sample
                </span>
              </div>
              <div className="space-y-2 mb-6">
                {lineItems.map((item) => (
                  <div
                    key={item.label}
                    className={
                      item.highlight
                        ? "flex items-center justify-between rounded-lg bg-vs-accent/10 px-4 py-3 text-sm font-bold text-vs-text"
                        : "flex items-center justify-between px-4 py-2 text-sm text-vs-text-soft"
                    }
                  >
                    <span>{item.label}</span>
                    <span>{item.amount}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-vs-muted mb-4">
                Prepared for Dana Marino (dana.marino@email.com) · Sample data for illustration only
              </p>
              <span
                aria-disabled="true"
                className="inline-flex cursor-default select-none rounded-xl bg-vs-accent/40 px-6 py-3 text-base font-bold text-white"
              >
                Accept Proposal (preview only)
              </span>
            </div>
          </section>

          {/* Sample contract */}
          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-vs-text mb-4">Sample contract signature</h2>
            <div className="rounded-2xl border border-vs-border-strong bg-vs-surface-2 p-6 md:p-8">
              <p className="text-sm text-vs-text-soft leading-relaxed mb-5">
                Once a customer accepts a proposal, VenueSprocket generates a contract from the same
                event details. They review it and sign with a typed signature - no printing, no
                DocuSign account.
              </p>
              <div className="rounded-xl border border-vs-border bg-vs-bg p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-vs-muted mb-2">Signature</p>
                <p className="font-display text-2xl text-vs-text mb-1" style={{ fontStyle: "italic" }}>
                  Dana Marino
                </p>
                <p className="text-xs text-vs-muted">
                  Signed October 2, 2026 · 3:14 PM · Sample IP and device recorded for real signatures
                </p>
              </div>
            </div>
          </section>

          <div className="mt-14 rounded-2xl border border-vs-border-strong bg-vs-surface-2 p-8">
            <h2 className="font-display text-xl font-bold text-vs-text mb-3">
              See it with your own venue
            </h2>
            <p className="text-vs-text-soft mb-5">
              Proposals are available starting on the Starter plan; contracts, Stripe deposits, and
              BEOs are part of Pro and above.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/start"
                className="inline-flex rounded-xl bg-vs-accent px-6 py-3 text-base font-bold text-white hover:bg-vs-accent-hover transition-colors"
              >
                Start Free
              </Link>
              <Link
                href="/pricing"
                className="inline-flex rounded-xl border border-vs-border-strong bg-vs-bg px-6 py-3 text-base font-bold text-vs-text hover:border-vs-accent transition-colors"
              >
                See Pricing
              </Link>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-4 text-sm">
            <Link href="/guides" className="font-semibold text-vs-accent hover:underline">← All guides</Link>
            <Link href="/guides/beo-template" className="font-semibold text-vs-accent hover:underline">Sample BEO →</Link>
            <Link href="/guides/beo-vs-contract" className="font-semibold text-vs-accent hover:underline">BEO vs. contract →</Link>
          </div>
        </div>
      </div>
    </>
  );
}
