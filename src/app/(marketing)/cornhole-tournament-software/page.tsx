import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getPublicSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Cornhole Tournament Software for Bars | LeaguePour",
  description:
    "Run cornhole and bag toss tournaments at your bar with LeaguePour. Online team registration, entry fees via Stripe, brackets, standings, and player alerts.",
  alternates: { canonical: "/cornhole-tournament-software" },
  keywords: [
    "cornhole tournament software",
    "bag toss tournament app",
    "cornhole league management",
    "bar cornhole tournament",
    "bags tournament registration",
    "cornhole bracket software",
    "bag toss league signup",
  ],
  openGraph: {
    title: "Cornhole Tournament Software for Bars | LeaguePour",
    description:
      "Run cornhole and bag toss tournaments at your bar — team signup, entry fees, brackets, and standings.",
    url: "/cornhole-tournament-software",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "LeaguePour — Cornhole Tournament Software",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: `${getPublicSiteUrl()}/cornhole-tournament-software`,
      description:
        "Cornhole and bag toss tournament management for bars. Handle team registration, entry fees, bracket generation, and standings in one platform.",
      offers: {
        "@type": "AggregateOffer",
        lowPrice: "29",
        highPrice: "299",
        priceCurrency: "USD",
        offerCount: "4",
      },
      keywords: "cornhole tournament software, bag toss league, cornhole bracket management",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Can I run both one-night cornhole tournaments and weekly leagues?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. LeaguePour supports one-off tournaments and recurring leagues. Set a single event date for tournaments, or configure weekly signup windows for ongoing cornhole leagues.",
          },
        },
        {
          "@type": "Question",
          name: "Does LeaguePour support doubles cornhole teams?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes — pairs/doubles is the most common cornhole format. One player registers as captain and invites their partner, or both register independently and are paired at check-in.",
          },
        },
      ],
    },
  ],
};

const features = [
  { title: "Doubles & team signup", body: "Cornhole is a pairs game — captain-led team registration so partners sign up together." },
  { title: "Entry fee collection", body: "Collect buy-ins online before event night. Stripe deposits directly to your bar's bank." },
  { title: "Bracket generation", body: "Single elimination or round-robin brackets — auto-seeded from registrations." },
  { title: "Waitlists & caps", body: "Limit entries to your board count. Overflow goes to a waitlist automatically." },
  { title: "Public standings", body: "Live leaderboard on your venue's public page — players check the board from their seats." },
  { title: "Player messaging", body: "Announce schedule changes, results, and next tournament to opted-in players." },
];

export default function CornholeTournamentSoftwarePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-20">
        <p className="lp-kicker text-lp-accent">Cornhole & bag toss software</p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          Cornhole tournaments,<br />
          <span className="text-lp-accent">run professionally.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-lp-muted">
          LeaguePour handles cornhole and bag toss tournament registration, entry fees, brackets, standings,
          and player communication — built for bars running weekly or seasonal events.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/signup/venue">Start your tournament</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/pricing">See pricing</Link>
          </Button>
        </div>

        <div className="mt-20">
          <h2 className="font-display text-2xl font-bold">Everything you need for cornhole events</h2>
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
          <h2 className="font-display text-2xl font-bold">From signup to champion in 4 steps</h2>
          <ol className="mt-6 space-y-5">
            {[
              { n: 1, title: "Create your cornhole event", body: "Set the date, team format (doubles or larger), entry fee, board count cap, and signup deadline." },
              { n: 2, title: "Players register online", body: "Share a link or QR code. Teams register and pay before showing up — no cash handling on event night." },
              { n: 3, title: "Run brackets on the night", body: "Check in teams, auto-generate the bracket, enter scores each round, and display standings on your TV." },
              { n: 4, title: "Build your player base", body: "Every registered player is in your audience. Reach them instantly for the next tournament." },
            ].map((s) => (
              <li key={s.n} className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-lp-accent/20 text-sm font-bold text-lp-accent">{s.n}</span>
                <div>
                  <p className="font-semibold text-lp-text">{s.title}</p>
                  <p className="mt-1 text-sm text-lp-muted leading-relaxed">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-20">
          <h2 className="font-display text-2xl font-bold">Frequently asked questions</h2>
          <div className="mt-6 space-y-4">
            {[
              { q: "Can I run both one-night tournaments and weekly leagues?", a: "Yes. Set a single event date for one-off tournaments, or configure weekly signup windows for ongoing cornhole leagues." },
              { q: "Does LeaguePour support doubles format?", a: "Yes — one player registers as captain and invites their partner. Both get confirmation emails and appear on the bracket." },
              { q: "How are entry fees handled?", a: "Players pay online via Stripe when they register. Funds go directly to your venue. No collecting cash on the night." },
              { q: "Can I cap the number of teams?", a: "Yes. Set a max team count — additional registrations go to an automatic waitlist and get notified if spots open." },
            ].map((f) => (
              <details key={f.q} className="rounded-xl border border-lp-border bg-lp-surface/40 px-5 py-4">
                <summary className="cursor-pointer list-none font-semibold text-lp-text [&::-webkit-details-marker]:hidden">{f.q}</summary>
                <p className="mt-3 text-sm text-lp-muted leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-16 rounded-2xl bg-lp-accent/10 border border-lp-accent/20 p-8 text-center">
          <h2 className="font-display text-2xl font-bold">Ready to run your first tournament?</h2>
          <p className="mt-2 text-lp-muted">Set up in minutes. Free to start.</p>
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
          <Link href="/dart-league-software" className="font-semibold text-lp-accent hover:underline">Dart league software →</Link>
          <Link href="/bar-trivia-software" className="font-semibold text-lp-accent hover:underline">Bar trivia software →</Link>
          <Link href="/pool-league-management" className="font-semibold text-lp-accent hover:underline">Pool league management →</Link>
        </div>
      </div>
    </>
  );
}
