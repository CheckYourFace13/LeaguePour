import type { Metadata } from "next";
import Link from "next/link";
import { safeJsonLd } from "@/lib/seo/json-ld-builders";

const URL = "https://venuesprocket.com/faq";

export const metadata: Metadata = {
  title: { absolute: "VenueSprocket FAQ — Private Event Management Questions Answered" },
  description:
    "Straight answers about VenueSprocket: inquiries, proposals, e-signature contracts, Stripe deposits, BEOs, pricing, and what the product does not do yet.",
  alternates: { canonical: URL },
  openGraph: {
    siteName: "VenueSprocket",
    title: "VenueSprocket FAQ",
    description: "Straight answers about inquiries, proposals, contracts, deposits, BEOs, and pricing.",
    url: URL,
  },
};

type Faq = { q: string; a: string };

// Every answer here is checked against what the product does today (see
// src/lib/content-engine/facts.ts). The FAQPage JSON-LD below is generated from this same array,
// so the structured data always matches the visible text exactly.
const groups: { title: string; faqs: Faq[] }[] = [
  {
    title: "The basics",
    faqs: [
      {
        q: "What is VenueSprocket?",
        a: "VenueSprocket is private event management software for restaurants, breweries, bars, taprooms, banquet rooms, and event spaces. It covers the booking workflow from the first inquiry to event day: inquiry form, lead pipeline, proposal, e-signature contract, Stripe deposit, and a Banquet Event Order (BEO).",
      },
      {
        q: "Who is it built for?",
        a: "Independent and small-group hospitality venues that book birthday parties, corporate events, holiday parties, rehearsal dinners, showers, buyouts, and private dining - usually run by an owner, a manager, or one events person rather than a dedicated sales team.",
      },
      {
        q: "Do my customers need to create an account?",
        a: "No. Customers submit an inquiry, open a proposal link, sign the contract, and pay the deposit without creating an account or downloading anything.",
      },
    ],
  },
  {
    title: "Inquiries and proposals",
    faqs: [
      {
        q: "How do inquiries reach me?",
        a: "Every venue gets a public inquiry page you can link from your website, social profiles, or Google Business Profile. Each submission becomes a lead in your pipeline, the customer gets a confirmation email, and you get a notification at the email address set in your VenueSprocket settings.",
      },
      {
        q: "What happens if I forget to answer an inquiry?",
        a: "If a new inquiry sits untouched for a couple of days, VenueSprocket emails your venue a reminder. The same daily check reminds you about proposals that haven't been accepted, contracts that haven't been signed, and deposits that haven't been paid.",
      },
      {
        q: "Does VenueSprocket send automatic follow-up emails to my customers?",
        a: "No. Reminders go to your venue, not to the customer. Customers receive transactional emails only: the inquiry confirmation, the proposal link, the contract link, the deposit receipt, and a refund notice if you refund a deposit. Any follow-up message to the customer comes from you.",
      },
      {
        q: "What goes on a proposal?",
        a: "A proposal carries a room fee, a food and beverage minimum, and the deposit amount, and shows the customer an estimated total. They open it from a secure link and accept with one click. There's no itemized menu-package builder; menu and bar details go in the event notes and on the BEO.",
      },
    ],
  },
  {
    title: "Contracts and deposits",
    faqs: [
      {
        q: "How does contract signing work?",
        a: "After the customer accepts the proposal, you send a contract built from the same event details and your venue's contract text. The customer types their name and checks a confirmation box; VenueSprocket records the typed signature, timestamp, IP address, and device information with the contract.",
      },
      {
        q: "Is a typed e-signature legally binding?",
        a: "Typed electronic signatures are generally recognized in the United States under the federal ESIGN Act and state UETA laws, but enforceability depends on your contract and jurisdiction. VenueSprocket doesn't provide legal advice - have an attorney review your contract terms.",
      },
      {
        q: "How are deposits collected?",
        a: "Through Stripe Checkout, charged directly on your venue's own connected Stripe account, right after the contract is signed. VenueSprocket takes no percentage of the deposit; Stripe's standard processing fee applies.",
      },
      {
        q: "Can I collect the remaining balance through VenueSprocket?",
        a: "Not today. VenueSprocket collects the deposit online and shows whether it's pending, paid, or refunded. The remaining balance is settled however you normally take final payment.",
      },
      {
        q: "Can I refund a deposit?",
        a: "Yes. An owner or manager can refund a paid deposit from the Payments screen; the refund is processed through Stripe and the customer gets a refund email.",
      },
    ],
  },
  {
    title: "Event day",
    faqs: [
      {
        q: "What is a BEO, and does VenueSprocket make one?",
        a: "A Banquet Event Order is the one-page operating plan your team works from on event day. VenueSprocket starts each BEO from the event record - name, date, time, guest count, and contact details carry over - and you fill in food, beverage, room setup, staffing, AV, allergies, and timeline.",
      },
      {
        q: "Can my staff see the BEO on their phones?",
        a: "Anyone logged in to your venue account can open the BEO on a phone, and there's a print-ready view for the kitchen and bar. There isn't a separate staff-only login or role.",
      },
      {
        q: "Can I manage several rooms or event spaces?",
        a: "Not as separate spaces. VenueSprocket doesn't have room-by-room calendars, capacities, or availability. Most venues name the room in the event details and BEO and set a room fee on each proposal.",
      },
      {
        q: "Does it sync with Google Calendar or my POS?",
        a: "No. VenueSprocket doesn't have calendar sync or POS integrations today. Events are listed in your dashboard by date.",
      },
    ],
  },
  {
    title: "Pricing and LeaguePour",
    faqs: [
      {
        q: "Is there a free plan?",
        a: "Yes. The free plan includes the public inquiry form and lead dashboard with no credit card required. Paid plans are billed monthly - see the pricing page for current plans.",
      },
      {
        q: "Does VenueSprocket take a cut of my event revenue?",
        a: "No. You pay a flat monthly plan fee. VenueSprocket takes no percentage of deposits or event revenue.",
      },
      {
        q: "Is LeaguePour included with VenueSprocket?",
        a: "No. LeaguePour is a separate companion product, with its own subscription, for running leagues, tournaments, and trivia nights. It uses the same venue login, and if you have an active subscription to either product you get 50% off the other.",
      },
    ],
  },
];

const allFaqs = groups.flatMap((g) => g.faqs);

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "VenueSprocket", item: "https://venuesprocket.com" },
        { "@type": "ListItem", position: 2, name: "FAQ", item: URL },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: allFaqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function VsFaqPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <div className="vs-section px-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          <p className="vs-kicker mb-3">FAQ</p>
          <h1 className="vs-page-title text-4xl md:text-5xl mb-6">Frequently asked questions</h1>
          <p className="text-vs-text-soft text-lg leading-relaxed mb-12">
            Straight answers about what VenueSprocket does - and what it doesn&apos;t do yet. Don&apos;t
            see your question?{" "}
            <Link href="/contact" className="text-vs-accent hover:underline">Ask us</Link>.
          </p>

          <div className="space-y-12">
            {groups.map((g) => (
              <section key={g.title}>
                <h2 className="font-display text-2xl font-bold text-vs-text mb-5">{g.title}</h2>
                <div className="space-y-3">
                  {g.faqs.map((f) => (
                    <details key={f.q} className="group rounded-xl border border-vs-border bg-vs-surface p-5">
                      <summary className="cursor-pointer list-none font-semibold text-vs-text flex items-start justify-between gap-4">
                        <span>{f.q}</span>
                        <span className="text-vs-accent transition-transform group-open:rotate-45" aria-hidden>+</span>
                      </summary>
                      <p className="mt-3 text-sm leading-relaxed text-vs-text-soft">{f.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-16 rounded-2xl border border-vs-border-strong bg-vs-surface-2 p-8 text-center">
            <h2 className="font-display text-xl font-bold text-vs-text mb-3">See the workflow first</h2>
            <p className="text-vs-text-soft mb-5">
              Walk through a sample booking from inquiry to BEO - no account needed.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/demo" className="rounded-xl bg-vs-accent px-6 py-3 font-bold text-white hover:bg-vs-accent-hover transition-colors">
                View the sample workflow
              </Link>
              <Link href="/pricing" className="rounded-xl border border-vs-border-strong bg-vs-bg px-6 py-3 font-bold text-vs-text hover:border-vs-accent transition-colors">
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
