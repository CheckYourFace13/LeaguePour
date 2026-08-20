import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buildBreadcrumbJsonLd } from "@/lib/seo/json-ld-builders";

export const metadata: Metadata = {
  title: { absolute: "How to Start a Pool League at Your Bar | LeaguePour" },
  description:
    "A practical guide to starting a bar pool league: choosing 8-ball or 9-ball, handicapping mixed-skill players, table logistics, entry fees, running league night, and filling a season.",
  alternates: { canonical: "/guides/how-to-start-a-pool-league" },
  keywords: [
    "how to start a pool league",
    "bar pool league",
    "8-ball league bar",
    "pool league handicap system",
    "pool tournament bar",
    "billiards league setup",
  ],
  openGraph: {
    title: "How to Start a Pool League at Your Bar | LeaguePour",
    description:
      "Format, handicapping, table logistics, entry fees, and how to run a bar pool league that fills a full season.",
    url: "/guides/how-to-start-a-pool-league",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Guides", path: "/guides" },
      { name: "How to Start a Pool League at Your Bar", path: "/guides/how-to-start-a-pool-league" },
    ]),
    {
      "@type": "Article",
      headline: "How to Start a Pool League at Your Bar",
      description:
        "A practical guide to starting a bar pool league - format, handicapping, table logistics, entry fees, and season operations.",
      author: { "@type": "Organization", name: "LeaguePour" },
      publisher: {
        "@type": "Organization",
        name: "LeaguePour",
        logo: { "@type": "ImageObject", url: "https://leaguepour.com/logo.png" },
      },
      url: "https://leaguepour.com/guides/how-to-start-a-pool-league",
      datePublished: "2026-08-19",
      dateModified: "2026-08-19",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How many pool tables do I need to run a league?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "One table can support a small league (6-8 players on a rotating single-table schedule), but two tables let you run two matches at once and get through a full night's schedule faster. Most bars that run a real weekly league have at least two tables, or block off their tables for pool players during league hours.",
          },
        },
        {
          "@type": "Question",
          name: "Do I need a handicap system for a bar pool league?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "If your players span a wide skill range - which is normal at a neighborhood bar - a handicap system keeps matches competitive and keeps weaker players from dropping out after a few lopsided losses. If your regulars are roughly evenly matched, straight race-to-X play without a handicap is simpler to run and score.",
          },
        },
        {
          "@type": "Question",
          name: "8-ball or 9-ball for a bar league?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "8-ball is the more common choice for casual bar leagues because more players already know how to play it and matches run at a steady, predictable pace. 9-ball rewards more advanced shot-making and position play and tends to draw a smaller, more competitive crowd - it works well as a second, higher-skill division rather than a first league.",
          },
        },
      ],
    },
  ],
};

export default function HowToStartAPoolLeagueGuide() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
        <p className="lp-kicker text-lp-accent">
          <Link href="/guides" className="hover:underline">Guides</Link> / Pool
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          How to Start a Pool League at Your Bar
        </h1>
        <p className="mt-5 text-lg text-lp-muted">
          Pool leagues are one of the longest-running bar traditions for a reason - the table is
          already there, the skill ceiling is high enough to keep regulars invested, and a weekly
          match schedule turns casual players into a standing Tuesday-night crowd. Here's how to set
          one up.
        </p>

        <div className="mt-10 space-y-10 text-lp-text leading-relaxed">

          <section>
            <h2 className="font-display text-2xl font-bold">1. Choose your format: 8-ball, 9-ball, or both</h2>
            <p className="mt-4">
              8-ball is the default choice for a first bar league. Almost every player who's picked up
              a cue knows the rules, matches run at a consistent pace (typically 15-25 minutes per
              race), and it's forgiving for players who aren't precision shot-makers yet.
            </p>
            <p className="mt-4">
              9-ball moves faster per rack but rewards advanced position play and rewards accuracy
              more heavily - a small mistake often ends your turn. It draws a smaller, more
              committed crowd. Many bars that run 9-ball do it as a second division for their more
              serious players once the 8-ball league is established, rather than as the only format.
            </p>
            <p className="mt-4">
              Decide singles or teams up front. Singles leagues are simpler to schedule (one player
              per slot) but teams of 2-4 create built-in social pressure to show up - nobody wants to
              be the reason their team forfeits. Teams also let you seed a mix of skill levels onto
              the same roster, which softens the impact of any one weak or strong player.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">2. Decide whether you need a handicap system</h2>
            <p className="mt-4">
              A neighborhood bar pool league almost never has evenly matched players. If your best
              player wins every match 5-0, your newer players stop showing up within a few weeks -
              nobody sticks around to lose on purpose. A handicap system is the standard fix.
            </p>
            <p className="mt-4">
              The most common recreational approach is a race-to differential: instead of every match
              being race-to-5, a stronger player might need to win 5 games while a weaker player only
              needs 3 or 4. You set the handicap by watching a few matches or by self-reported skill
              level at signup, then adjust it after a few weeks based on actual results. National pool
              leagues run much more formal statistical handicap systems, but for a bar league, a simple
              adjusted race-to system is enough to keep matches close and players engaged.
            </p>
            <p className="mt-4">
              If your regulars are all roughly the same skill level - which happens in bars with a
              tight-knit group of long-time players - skip the handicap entirely. It's one less thing
              to explain and argue about.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">3. Plan your table logistics</h2>
            <p className="mt-4">
              Figure out how many matches you can realistically run in one night before you set a
              schedule. One table gets through roughly 3-4 matches in a two-hour window; two tables
              roughly double that. If you only have one table and a full house of walk-in customers who
              also want to play, block specific hours as "league night" so casual players know not to
              rack up during that window.
            </p>
            <p className="mt-4">
              Build a simple rotation so players aren't standing around waiting. A common approach:
              publish a match schedule for the night (who plays whom, on which table, in what order)
              rather than a first-come-first-served free-for-all. It takes five minutes to plan and
              saves an hour of confusion.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">4. Set entry fees and a prize structure</h2>
            <p className="mt-4">
              A modest weekly or season-long entry fee funds the prize pool and gives players a reason
              to show up consistently - people who've paid upfront skip far less often than people who
              haven't. A simple season structure: collect a flat fee at the start of the season, track
              standings, and pay out a bar tab or cash prize to the top 2-3 finishers at the end.
            </p>
            <p className="mt-4">
              For a one-night bracket tournament instead of a season-long league, a single elimination
              format with 8-16 players and a modest per-player buy-in is easy to run start to finish
              in one evening and works well as a season kickoff or a low-commitment trial before you
              launch a full league.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">5. Run league night without the chaos</h2>
            <p className="mt-4">
              Standings are the thing that keeps a pool league alive week to week - players want to
              know where they stand and what it takes to move up. Track wins, losses, and any handicap
              adjustments somewhere visible, whether that's a whiteboard behind the bar or an online
              standings page players can check from their phone.
            </p>
            <p className="mt-4">
              Have one person responsible for recording results each night. Disputes over "who actually
              won" are much rarer when there's a single source of truth updated in real time rather
              than players self-reporting at the end of the night from memory.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">6. Promote the league to fill a full season</h2>
            <p className="mt-4">
              Start with your existing regulars - the players who already show up to shoot pool
              casually are your easiest signups. A simple sign-up sheet or QR code by the table,
              combined with a post in your bar's social media or regulars' group chat, is usually
              enough to fill a first season.
            </p>
            <p className="mt-4">
              Once the league is running, promote it the same way every week rather than treating it
              as a one-off event - the same night, same time, posted consistently. Recurring
              consistency is what turns a pool league from a novelty into a standing weekly habit for
              your regulars.
            </p>
          </section>

        </div>

        <div className="mt-14 rounded-2xl bg-lp-accent/10 border border-lp-accent/20 p-8">
          <h2 className="font-display text-2xl font-bold">Run your pool league with LeaguePour</h2>
          <p className="mt-2 text-lp-muted">
            Online signup, Stripe entry fees, live standings, and player messaging for your 8-ball or
            9-ball league - no whiteboards or spreadsheets required.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup/venue">Start hosting events - free</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/pool-league-management">See pool league features</Link>
            </Button>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold">Frequently asked questions</h2>
          <div className="mt-5 space-y-4">
            {[
              {
                q: "How many pool tables do I need to run a league?",
                a: "One table works for a small league on a rotating schedule; two tables let you run matches in parallel and get through a full night faster. Most established bar leagues use at least two tables during league hours.",
              },
              {
                q: "Do I need a handicap system for a bar pool league?",
                a: "If your players span a wide skill range, a simple adjusted race-to handicap keeps matches competitive and keeps weaker players from dropping out. If your regulars are evenly matched, skip it and keep scoring simple.",
              },
              {
                q: "8-ball or 9-ball for a bar league?",
                a: "8-ball is the more common first choice - more players already know it and matches run at a predictable pace. 9-ball draws a smaller, more competitive crowd and works well as a second division once your 8-ball league is established.",
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

        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          <Link href="/guides" className="font-semibold text-lp-accent hover:underline">← All guides</Link>
          <Link href="/pool-league-management" className="font-semibold text-lp-accent hover:underline">Pool league management software →</Link>
          <Link href="/guides/how-to-collect-entry-fees-at-your-bar" className="font-semibold text-lp-accent hover:underline">How to collect entry fees →</Link>
        </div>
      </div>
    </>
  );
}
