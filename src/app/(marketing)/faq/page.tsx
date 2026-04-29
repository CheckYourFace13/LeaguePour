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
    a: "No — it’s for participation events: trivia, leagues, brackets, buy-ins, and structured games.",
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
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
      <h1 className="font-display text-4xl font-bold">FAQ</h1>
      <p className="mt-4 text-lp-muted">Short answers.</p>
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
          Create venue
        </Link>
        . Compare{" "}
        <Link className="font-semibold text-lp-accent hover:underline" href="/pricing">
          pricing
        </Link>
        .
      </p>
    </div>
  );
}
