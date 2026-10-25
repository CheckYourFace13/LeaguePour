import { safeJsonLd } from "@/lib/seo/json-ld-builders";
import type { Metadata } from "next";
import { applyManagedMetadata } from "@/lib/gravyblock-managed";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getPublicSiteUrl } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  return applyManagedMetadata("/cornhole-tournament-software", {
  title: { absolute: "Cornhole Tournament Software for Bars | LeaguePour" },
  description:
    "Cornhole tournament software for bars: doubles signup by link or QR code, Stripe entry fees, automatic brackets, live standings, and a worked 16-team example. Free for one event at a time.",
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
  openGraph: { siteName: "LeaguePour", images: [{ url: "/opengraph-image", alt: "LeaguePour - venue competition software for bars" }],
    title: "Cornhole Tournament Software for Bars | LeaguePour",
    description:
      "Doubles signup, entry fees, automatic brackets and live standings for bar cornhole tournaments and leagues.",
    url: "/cornhole-tournament-software",
  },
});
}

// Visible FAQ and FAQPage schema come from this one list so they can't drift apart.
const faqs = [
  {
    q: "Can I run both one-night tournaments and weekly leagues?",
    a: "Yes. A one-night tournament is a single competition with one date. For a weekly league, set the schedule to recurring and note the night (for example, Thursdays for 8 weeks); when a season ends, duplicate it to open the next one with fresh signup dates.",
  },
  {
    q: "Does LeaguePour support doubles teams?",
    a: "Yes - doubles is the most common cornhole format. One player registers as captain and invites their partner, or players sign up solo and you pair them on the night.",
  },
  {
    q: "How are entry fees handled?",
    a: "Players pay by card when they register, through Stripe on your own connected Stripe account. A team registered by its captain pays one entry. LeaguePour keeps 5% of the entry fee and the player pays a $1.50 service fee at checkout; Stripe's processing fee comes out of your share. $0 events have no fees at all.",
  },
  {
    q: "Can I cap the number of teams?",
    a: "Yes. Set a maximum team count - for example, your board count times the teams you can run per wave - and signup closes automatically once it's reached.",
  },
  {
    q: "What does it cost?",
    a: "A new venue can run one competition at a time free. Starter ($29/mo) runs 2 at once, Growth 9, Pro 19, and Elite unlimited - every plan has every feature.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "LeaguePour - Cornhole Tournament Software",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: `${getPublicSiteUrl()}/cornhole-tournament-software`,
      description:
        "Cornhole and bag toss tournament management for bars. Handle team registration, entry fees, bracket generation, and standings in one platform.",
      offers: {
        "@type": "AggregateOffer",
        lowPrice: "0",
        highPrice: "299",
        priceCurrency: "USD",
        offerCount: "5",
      },
      keywords: "cornhole tournament software, bag toss league, cornhole bracket management",
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ],
};

const features = [
  { title: "Doubles & team signup", body: "Cornhole is a pairs game - captain-led team registration so partners sign up together." },
  { title: "Entry fee collection", body: "Collect buy-ins online before event night, charged on your own connected Stripe account and paid out to your bank on your Stripe schedule." },
  { title: "Bracket generation", body: "Single elimination or round-robin brackets, generated automatically from registrations (seeded in signup order)." },
  { title: "Team caps", body: "Limit entries to your board count - signup closes automatically when the bracket is full." },
  { title: "Public standings", body: "Live leaderboard on your venue's public page - players check the board from their seats." },
  { title: "Player messaging", body: "Announce schedule changes, results, and next tournament to opted-in players." },
];

export default function CornholeTournamentSoftwarePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <div className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-20">
        <p className="lp-kicker text-lp-accent">Cornhole & bag toss software</p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          Cornhole tournaments,<br />
          <span className="text-lp-accent">run professionally.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-lp-muted">
          LeaguePour handles cornhole and bag toss tournament registration, entry fees, brackets, standings,
          and player communication - built for bars running weekly or seasonal events.
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
              { n: 2, title: "Players register online", body: "Share a link or QR code. Teams register and pay before showing up - no cash handling on event night." },
              { n: 3, title: "Run brackets on the night", body: "Close signup, start the tournament to generate the bracket (byes are handled for odd fields), enter each game's score, and put the live scoreboard on your TV." },
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
          <h2 className="font-display text-2xl font-bold">Worked example: a 16-team doubles tournament on 4 boards</h2>
          <p className="mt-3 text-lp-muted leading-relaxed">
            A typical Saturday bracket, with the numbers you&apos;d actually plan around. The entry fee and timings are
            examples - set your own.
          </p>
          <div className="mt-6 overflow-hidden rounded-xl border border-lp-border">
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Entry fee per team", "$20.00"],
                  ["Team pays at checkout ($20 + $1.50 service fee)", "$21.50"],
                  ["Venue receives per team ($20 minus the 5% platform fee)", "$19.00, before Stripe processing"],
                  ["16 teams", "$304.00 to the venue, before Stripe processing"],
                  ["Single-elimination games (16 teams)", "15 games over 4 rounds"],
                  ["Waves on 4 boards (8 + 4 + 2 + 1 games)", "5 waves"],
                  ["At ~20 minutes a wave", "About 1 hour 40 minutes of play"],
                ].map(([k, v], i) => (
                  <tr key={k} className={i % 2 === 0 ? "bg-lp-surface/40" : ""}>
                    <th scope="row" className="px-4 py-3 text-left font-medium text-lp-text-soft">{k}</th>
                    <td className="px-4 py-3 text-right font-semibold text-lp-text">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-lp-muted leading-relaxed">
            <li>
              <strong className="text-lp-text">Fewer teams than a full bracket?</strong> With 12 teams the bracket gives 4 byes in
              round one, so you play 11 games instead of 15.
            </li>
            <li>
              <strong className="text-lp-text">Want everyone to play more than once?</strong> Round robin guarantees games for every
              team but grows fast: 6 teams is 15 games, 16 teams would be 120. For a big field, run a single-elimination
              bracket, or split teams into pools and run each pool as its own round robin.
            </li>
            <li>
              <strong className="text-lp-text">Cap signups at what your boards can handle.</strong> Four boards and a two-hour window
              comfortably fit 16 doubles teams in single elimination.
            </li>
          </ul>
          <p className="mt-5 text-sm text-lp-muted">
            Try the numbers first with the free{" "}
            <Link href="/tools/single-elimination-bracket-generator" className="font-semibold text-lp-accent hover:underline">bracket generator</Link>{" "}
            or{" "}
            <Link href="/tools/round-robin-schedule-generator" className="font-semibold text-lp-accent hover:underline">round robin generator</Link>
            , and see{" "}
            <Link href="/guides/round-robin-vs-single-elimination" className="font-semibold text-lp-accent hover:underline">round robin vs. single elimination</Link>{" "}
            for which format fits your night.
          </p>
        </div>

        <div className="mt-20">
          <h2 className="font-display text-2xl font-bold">Frequently asked questions</h2>
          <div className="mt-6 space-y-4">
            {faqs.map((f) => (
              <details key={f.q} className="rounded-xl border border-lp-border bg-lp-surface/40 px-5 py-4">
                <summary className="cursor-pointer list-none font-semibold text-lp-text [&::-webkit-details-marker]:hidden">{f.q}</summary>
                <p className="mt-3 text-sm text-lp-muted leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-16 rounded-2xl bg-lp-accent/10 border border-lp-accent/20 p-8 text-center">
          <h2 className="font-display text-2xl font-bold">Ready to run your first tournament?</h2>
          <p className="mt-2 text-lp-muted">Create your venue and publish your first tournament free - no card needed.</p>
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
          <Link href="/guides/cornhole-tournament-ideas-for-bars" className="font-semibold text-lp-accent hover:underline">Cornhole tournament ideas for bars →</Link>
          <Link href="/guides/how-to-price-entry-fees-for-a-bar-league-or-tournament" className="font-semibold text-lp-accent hover:underline">How to price entry fees →</Link>
          <Link href="/dart-league-software" className="font-semibold text-lp-accent hover:underline">Dart league software →</Link>
          <Link href="/bar-trivia-software" className="font-semibold text-lp-accent hover:underline">Bar trivia software →</Link>
          <Link href="/pool-league-management" className="font-semibold text-lp-accent hover:underline">Pool league management →</Link>
        </div>
      </div>
    </>
  );
}
