import type { Metadata } from "next";
import Link from "next/link";
import { safeJsonLd } from "@/lib/seo/json-ld-builders";

const URL = "https://venuesprocket.com/bundle";
const DESCRIPTION =
  "VenueSprocket and LeaguePour are separate products with separate subscriptions. Add the second while subscribed to the first and it's 50% off - here's how the discount works.";

export const metadata: Metadata = {
  title: { absolute: "VenueSprocket + LeaguePour: 50% Off the Second Product | VenueSprocket" },
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { siteName: "VenueSprocket", images: [{ url: "/venuesprocket/opengraph-image", alt: "VenueSprocket - private event management software" }], title: "VenueSprocket + LeaguePour bundle discount", description: DESCRIPTION, url: URL },
};

// Every statement here is checked against the billing code (the VSBUNDLE50 coupon applied at
// checkout in src/app/api/venuesprocket/subscribe and src/app/api/venue/stripe/subscribe) and
// src/lib/content-engine/facts.ts. The two products share a login and nothing else.
const faqs = [
  {
    q: "Is LeaguePour included with VenueSprocket?",
    a: "No. They are separate products with separate subscriptions. Neither one is part of any plan of the other.",
  },
  {
    q: "How does the 50% discount work?",
    a: "If your venue's subscription to one product is active or in a trial at the moment you subscribe to the other, the second subscription is 50% off. It's applied automatically at checkout - there's no code to enter - and it can't be combined with another promotion code.",
  },
  {
    q: "Which product gets the discount?",
    a: "Whichever one you add second. If you already pay for LeaguePour and add VenueSprocket, VenueSprocket is 50% off, and the reverse is true too.",
  },
  {
    q: "Do the two products share data?",
    a: "No. They use the same venue login, but private event leads and customers in VenueSprocket and players and competitions in LeaguePour are separate. There's no combined customer list or combined reporting.",
  },
  {
    q: "Do I need both?",
    a: "Only if you do both things. VenueSprocket is for private events you book - parties, corporate events, buyouts. LeaguePour is for recurring public competitions - leagues, tournaments, trivia nights. Plenty of venues only need one.",
  },
  {
    q: "How long does the discount last?",
    a: "It's a recurring discount: the second subscription stays 50% off on every renewal. It's set when you buy the second product - today it remains on that subscription even if you later cancel the first one. If you cancel the discounted subscription and subscribe again later, the discount applies again only if your other subscription is active or in a trial at that time.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "VenueSprocket", item: "https://venuesprocket.com" },
        { "@type": "ListItem", position: 2, name: "LeaguePour bundle", item: URL },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ],
};

const products = [
  {
    name: "VenueSprocket",
    for: "Private events you book",
    points: [
      "Public inquiry page and lead pipeline",
      "Proposals with a room fee, F&B minimum, and deposit",
      "Typed e-signature contracts",
      "Stripe deposits paid to your own account",
      "Banquet Event Orders with a print-ready view",
    ],
    href: "/features",
    cta: "VenueSprocket features",
    external: false,
  },
  {
    name: "LeaguePour",
    for: "Recurring public competitions",
    points: [
      "Leagues, tournaments, and trivia nights",
      "Player signup from a link or QR code",
      "Entry fees through Stripe",
      "Single elimination and round robin schedules",
      "Scores and public standings",
    ],
    href: "https://leaguepour.com",
    cta: "Visit leaguepour.com",
    external: true,
  },
];

export default function VsBundlePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <div className="vs-section px-4 md:px-6">
        <div className="mx-auto max-w-4xl">
          <p className="vs-kicker mb-3">Two products · 50% off the second</p>
          <h1 className="vs-page-title text-4xl md:text-5xl mb-5">VenueSprocket + LeaguePour</h1>
          <p className="mb-10 max-w-3xl text-lg leading-relaxed text-vs-text-soft">
            Private events fill a room for a night. Leagues and game nights fill it every week.
            VenueSprocket and LeaguePour are separate products for those two jobs, each with its own
            subscription - and if you&apos;re subscribed to one when you add the other, the second is 50% off.
          </p>

          <div className="grid gap-5 md:grid-cols-2">
            {products.map((p) => (
              <div key={p.name} className="flex flex-col rounded-2xl border border-vs-border bg-vs-surface p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-vs-muted">{p.for}</p>
                <h2 className="mt-2 font-display text-2xl font-bold text-vs-text">{p.name}</h2>
                <ul className="mt-4 flex-1 space-y-2">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2 text-sm text-vs-text-soft">
                      <span className="mt-0.5 shrink-0 font-bold text-vs-accent">✓</span>
                      {pt}
                    </li>
                  ))}
                </ul>
                {p.external ? (
                  <a href={p.href} target="_blank" rel="noopener noreferrer" className="mt-5 text-sm font-semibold text-vs-accent hover:underline">
                    {p.cta} ↗
                  </a>
                ) : (
                  <Link href={p.href} className="mt-5 text-sm font-semibold text-vs-accent hover:underline">
                    {p.cta} →
                  </Link>
                )}
              </div>
            ))}
          </div>

          <section className="mt-12 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-vs-border-strong bg-vs-surface-2 p-6">
              <h2 className="font-display text-xl font-bold text-vs-text mb-3">What you get with both</h2>
              <ul className="space-y-2 text-sm leading-relaxed text-vs-text-soft">
                <li>• One venue login for both products</li>
                <li>• 50% off the second subscription on every renewal, applied automatically at checkout</li>
                <li>• Each product billed as its own subscription</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-vs-border bg-vs-surface p-6">
              <h2 className="font-display text-xl font-bold text-vs-text mb-3">What isn&apos;t connected</h2>
              <ul className="space-y-2 text-sm leading-relaxed text-vs-text-soft">
                <li>• No shared customer or player list</li>
                <li>• No combined revenue reporting</li>
                <li>• League players aren&apos;t automatically invited to book private events</li>
              </ul>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-vs-text mb-5">Questions</h2>
            <div className="space-y-3">
              {faqs.map((f) => (
                <details key={f.q} className="rounded-xl border border-vs-border bg-vs-surface p-5">
                  <summary className="cursor-pointer list-none font-semibold text-vs-text [&::-webkit-details-marker]:hidden">{f.q}</summary>
                  <p className="mt-3 text-sm leading-relaxed text-vs-text-soft">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <div className="mt-12 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup/venue" className="rounded-xl bg-vs-accent px-6 py-3 text-center font-bold text-white hover:bg-vs-accent-hover transition-colors">
              Start with VenueSprocket
            </Link>
            <Link href="/pricing" className="rounded-xl border border-vs-border-strong bg-vs-bg px-6 py-3 text-center font-bold text-vs-text hover:border-vs-accent transition-colors">
              VenueSprocket pricing
            </Link>
            <Link href="/leaguepour" className="rounded-xl border border-vs-border-strong bg-vs-bg px-6 py-3 text-center font-bold text-vs-text hover:border-vs-accent transition-colors">
              More about LeaguePour
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
