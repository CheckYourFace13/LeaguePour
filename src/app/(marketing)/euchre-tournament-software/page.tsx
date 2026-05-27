import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Euchre Tournament Software for Bars | LeaguePour",
  description:
    "Run euchre tournaments and euchre leagues at your bar with LeaguePour. Online signup, entry fees via Stripe, standings, and bracket management — no spreadsheets.",
  alternates: { canonical: "/euchre-tournament-software" },
  keywords: [
    "euchre tournament software",
    "bar euchre league",
    "euchre tournament management",
    "euchre league software",
    "bar euchre night app",
    "euchre tournament registration",
  ],
  openGraph: {
    title: "Euchre Tournament Software for Bars | LeaguePour",
    description:
      "Run euchre tournaments and leagues at your bar — online signup, entry fees, standings, and brackets. No spreadsheets.",
    url: "/euchre-tournament-software",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "LeaguePour — Euchre Tournament Software",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://leaguepour.com/euchre-tournament-software",
      description:
        "Euchre tournament and league management software for bars. Run euchre events with team signup, entry fees, standings, and bracket generation.",
      offers: {
        "@type": "AggregateOffer",
        lowPrice: "29",
        highPrice: "299",
        priceCurrency: "USD",
        offerCount: "4",
      },
      keywords: "euchre tournament software, bar euchre league, euchre tournament management",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What euchre format works best for a bar tournament?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Progressive euchre (also called 'traveling euchre') is the most popular bar format. Partners rotate after each hand based on win/loss, so players interact with everyone in the room over the course of the night. Fixed-partner tournaments are better for more competitive events where established teams want to stay together throughout.",
          },
        },
        {
          "@type": "Question",
          name: "How many players do I need to run an euchre tournament?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Euchre is a 4-player game (2 partnerships of 2), so you need a minimum of 8 players (2 tables) to run a proper event. Most bar euchre tournaments run comfortably with 16–40 players (4–10 tables). Progressive formats work best when you have at least 12 players.",
          },
        },
        {
          "@type": "Question",
          name: "Can LeaguePour track euchre season standings?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. You can run a euchre league where players accumulate points across weekly nights toward a season championship. LeaguePour tracks standings, updates them after each event, and displays them publicly so players can follow the season race.",
          },
        },
        {
          "@type": "Question",
          name: "How do players sign up for a bar euchre tournament?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Players visit your venue's public LeaguePour page, select the euchre event, register individually or as a pair, pay the entry fee via Stripe Checkout, and receive a confirmation email. No app download required. You see a confirmed player list in your dashboard before the event.",
          },
        },
      ],
    },
  ],
};

const features = [
  {
    title: "Online player signup",
    body: "Individual or partner registration — players sign up before tournament night. Know your exact table count and plan setup accordingly.",
  },
  {
    title: "Entry fees via Stripe",
    body: "Collect tournament buy-ins automatically. Funds go directly to your venue's bank account — no cash envelopes, no end-of-night reconciliation headaches.",
  },
  {
    title: "Season standings",
    body: "Run a euchre league with weekly points accumulation. Publish a standings page that keeps the season race competitive all the way to the final night.",
  },
  {
    title: "Bracket management",
    body: "Fixed-partner elimination brackets for competitive events. Round-robin for social leagues. Set the format when you create the event.",
  },
  {
    title: "Player notifications",
    body: "Email confirmed players with event reminders, updated standings, and upcoming dates — from your LeaguePour dashboard with one click.",
  },
  {
    title: "Waitlists",
    body: "Cap the tournament at your table count. Additional players go on a waitlist and are notified automatically if spots open before the event.",
  },
];

export default function EuchreTournamentSoftwarePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-20">
        <p className="lp-kicker text-lp-accent">Euchre tournament software</p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          Run euchre tournaments at your bar.<br />
          <span className="text-lp-accent">No spreadsheets.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-lp-muted">
          LeaguePour handles euchre tournament signup, entry fees, standings, and player
          communications — all in one platform built for bars that want to turn card night into a
          weekly institution.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/signup/venue">Start your euchre tournament</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/pricing">See pricing</Link>
          </Button>
        </div>

        <div className="mt-20">
          <h2 className="font-display text-2xl font-bold">Everything you need to run a euchre tournament</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-lp-border bg-lp-surface/40 p-5">
                <h3 className="font-semibold text-lp-text">{f.title}</h3>
                <p className="mt-2 text-sm text-lp-muted leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 rounded-2xl bg-lp-surface/40 border border-lp-border p-8">
          <h2 className="font-display text-2xl font-bold">How it works for euchre tournaments</h2>
          <ol className="mt-6 space-y-5">
            {[
              {
                n: 1,
                title: "Create your euchre event",
                body: "Set the format (progressive euchre night, fixed-partner tournament, or season league), max players, entry fee, and date. Table count sets automatically based on registrations.",
              },
              {
                n: 2,
                title: "Share the signup link",
                body: "Post it on social, display a QR code at the bar, or email your existing euchre regulars directly. Players register and pay before the night — you arrive with a confirmed field.",
              },
              {
                n: 3,
                title: "Run the event",
                body: "Check in registered players, seat them by your format's table assignments, and enter results round by round. Season standings update automatically.",
              },
              {
                n: 4,
                title: "Build your league",
                body: "Email all players the updated leaderboard after each night. Players who are in contention for the season title show up every week — the standings create the incentive.",
              },
            ].map((s) => (
              <li key={s.n} className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-lp-accent/20 text-sm font-bold text-lp-accent">
                  {s.n}
                </span>
                <div>
                  <p className="font-semibold text-lp-text">{s.title}</p>
                  <p className="mt-1 text-sm text-lp-muted leading-relaxed">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-20">
          <h2 className="font-display text-2xl font-bold">Why euchre leagues work for bars</h2>
          <div className="mt-5 space-y-4 text-lp-text leading-relaxed">
            <p>
              Euchre has one of the most dedicated fanbases of any card game, particularly in the
              Midwest. Players who love euchre really love euchre — and they're always looking for
              organized places to play. A bar that hosts a regular euchre night becomes a destination
              for a demographic that is often underserved by typical bar events.
            </p>
            <p>
              The progressive euchre format (where partners rotate each round) is uniquely suited to
              the bar environment because it forces players to interact with everyone in the room over
              the course of an evening. By the end of a progressive night, a room of strangers has become
              a group of people who've played with each other, competed against each other, and had
              conversations at every table. That social experience is what turns a first-time attendee
              into a weekly regular.
            </p>
            <p>
              Euchre nights also run long. A proper progressive euchre night with 20–30 players runs
              3–4 hours, with multiple rounds and a final scoring ceremony. That's among the highest
              average stay times of any bar competition format, which translates directly to bar spend.
            </p>
            <p>
              If you're in euchre country and you're not running a regular event, you're leaving a
              dedicated, returning-customer crowd to find somewhere else to play. The bar that hosts
              the best euchre night in the area earns a loyal base that is difficult for competitors
              to replicate.
            </p>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="font-display text-2xl font-bold">Frequently asked questions</h2>
          <div className="mt-6 space-y-4">
            {[
              {
                q: "What euchre format works best for a bar tournament?",
                a: "Progressive euchre is the most popular bar format — partners rotate after each hand, so players interact with everyone over the night. Fixed-partner tournaments are better for competitive events where established teams want to stay together.",
              },
              {
                q: "How many players do I need to run a euchre tournament?",
                a: "Minimum 8 players (2 tables). Most bar euchre tournaments run comfortably with 16–40 players. Progressive formats work best with at least 12 players.",
              },
              {
                q: "Can LeaguePour track euchre season standings?",
                a: "Yes. Run a euchre league with weekly points accumulation toward a season championship. LeaguePour tracks standings, updates them after each event, and displays them publicly.",
              },
              {
                q: "How do players sign up for a bar euchre tournament?",
                a: "Players visit your venue's public LeaguePour page, select the euchre event, register individually or as a pair, pay the entry fee via Stripe, and receive a confirmation email. No app download required.",
              },
            ].map((f) => (
              <details key={f.q} className="rounded-xl border border-lp-border bg-lp-surface/40 px-5 py-4">
                <summary className="cursor-pointer list-none font-semibold text-lp-text [&::-webkit-details-marker]:hidden">
                  {f.q}
                </summary>
                <p className="mt-3 text-sm text-lp-muted leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-16 rounded-2xl bg-lp-accent/10 border border-lp-accent/20 p-8 text-center">
          <h2 className="font-display text-2xl font-bold">Ready to launch your euchre tournament?</h2>
          <p className="mt-2 text-lp-muted">Set up in minutes. Free to start, no credit card required.</p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/signup/venue">Start hosting events</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/how-it-works">See how it works</Link>
            </Button>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          <Link href="/poker-tournament-software" className="font-semibold text-lp-accent hover:underline">Poker tournament software →</Link>
          <Link href="/dart-league-software" className="font-semibold text-lp-accent hover:underline">Dart league software →</Link>
          <Link href="/pool-league-management" className="font-semibold text-lp-accent hover:underline">Pool league management →</Link>
        </div>
      </div>
    </>
  );
}
