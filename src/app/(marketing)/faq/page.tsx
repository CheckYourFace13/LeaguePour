import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "LeaguePour FAQ | Bar Tournament Platform Questions",
  description:
    "Answers about LeaguePour venue competition software, entry fee tournaments, team registration, and league management for bars.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "LeaguePour FAQ",
    description: "FAQ for bar event registration software and tournament signup workflows.",
    url: "/faq",
  },
};

const faqs = [
  {
    q: "Is LeaguePour for concerts or DJs?",
    a: "No - it's for participation events: trivia, leagues, brackets, buy-ins, and structured games.",
  },
  {
    q: "Can we collect entry fees?",
    a: "Yes. Venues use Stripe Connect; players pay through Stripe Checkout. LeaguePour confirms registration when payment succeeds.",
  },
  {
    q: "How do teams and captains work?",
    a: "Per event you pick solo signup, captain-led teams, or roster invites. The builder labels each path.",
  },
  {
    q: "What about compliance and spam?",
    a: "Built around consent and preferences. Venues choose email-only or email + SMS; players control what they receive.",
  },
  {
    q: "Does it handle multi-location groups?",
    a: "Venues can be linked in a parent/child structure for groups that grow past one room.",
  },
  {
    q: "What sports and games does LeaguePour support?",
    a: "Any participation event: dart leagues, cornhole/bags tournaments, trivia nights, pool leagues, shuffleboard, euchre, poker, music bingo, and more. You pick the format and LeaguePour handles the signup and fees.",
  },
  {
    q: "How does the entry fee split work?",
    a: "Venues keep the full entry fee minus a 5% platform fee. Players pay a $1.50 service fee on top of the entry price. Funds are deposited directly to the venue's connected bank account via Stripe.",
  },
  {
    q: "Do players need to create an account?",
    a: "Yes - players create a free LeaguePour account to register for competitions, view their history, and manage alerts. Sign-up takes under a minute.",
  },
  {
    q: "Can I run free events with no entry fee?",
    a: "Yes. Set the entry fee to $0 and players register without a payment. The platform is free to use for free events - you only pay the subscription plan for your venue.",
  },
  {
    q: "What happens if I need to cancel an event?",
    a: "Refunds are processed through Stripe. You can issue full refunds from your Stripe dashboard, and players' registrations are updated to cancelled automatically.",
  },
  {
    q: "Who is LeaguePour for?",
    a: "Bars, breweries, restaurants, and taprooms that host participation events: trivia, dart leagues, cornhole, pool, cards, and similar game nights. Players use LeaguePour to find events and register. LeaguePour is not for concerts, DJs, or general ticketing.",
  },
  {
    q: "Where is LeaguePour available?",
    a: "Venues can sign up self-serve in the United States. Player discovery shows real venues and competitions as they publish events. There is no fake directory data.",
  },
  {
    q: "How do I contact LeaguePour?",
    a: "Email hello@leaguepour.com or use the contact form at leaguepour.com/contact. We typically reply within 1-2 business days.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.a,
    },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
        <h1 className="font-display text-4xl font-bold">FAQ</h1>
        <p className="mt-4 text-lp-muted">Short answers about LeaguePour venue competition software.</p>
        <div className="mt-10 space-y-4">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="rounded-xl border border-lp-border bg-lp-surface/40 px-5 py-4"
            >
              <summary className="cursor-pointer list-none font-semibold text-lp-text [&::-webkit-details-marker]:hidden">
                {f.q}
              </summary>
              <p className="mt-3 text-sm text-lp-muted leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-10 text-sm text-lp-muted">
          Ready to launch?{" "}
          <Link className="font-semibold text-lp-accent hover:underline" href="/signup/venue">
            Start hosting events
          </Link>
          . Compare{" "}
          <Link className="font-semibold text-lp-accent hover:underline" href="/pricing">
            pricing
          </Link>
          . See{" "}
          <Link className="font-semibold text-lp-accent hover:underline" href="/how-it-works">
            how it works
          </Link>
          .
        </p>
      </div>
    </>
  );
}
