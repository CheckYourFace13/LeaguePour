import { safeJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo/json-ld-builders";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: { absolute: "How Standings and Points Systems Work for Bar Leagues | LeaguePour Guide" },
  description:
    "How points, wins, losses, and ties translate into league standings - the standard 3-1-0 system, tiebreakers, and why visible standings keep players coming back.",
  alternates: { canonical: "/guides/how-standings-and-points-work" },
  keywords: [
    "bar league standings",
    "league points system",
    "how tournament standings work",
    "round robin points system",
    "tiebreaker rules bar league",
  ],
  openGraph: {
    title: "How Standings and Points Systems Work for Bar Leagues | LeaguePour Guide",
    description: "The points system behind league standings, and why visible standings drive attendance.",
    url: "/guides/how-standings-and-points-work",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Guides", path: "/guides" },
      { name: "How Standings and Points Work", path: "/guides/how-standings-and-points-work" },
    ]),
    {
      "@type": "Article",
      headline: "How Standings and Points Systems Work for Bar Leagues",
      description:
        "How league standings are calculated from wins, losses, and ties, the standard 3-1-0 points system, common tiebreakers, and why keeping standings visible matters.",
      author: { "@type": "Organization", name: "LeaguePour" },
      publisher: {
        "@type": "Organization",
        name: "LeaguePour",
        logo: { "@type": "ImageObject", url: "https://leaguepour.com/logos/leaguepour-icon.png" },
      },
      url: "https://leaguepour.com/guides/how-standings-and-points-work",
      datePublished: "2026-09-13",
      dateModified: "2026-09-13",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What points system does LeaguePour use for standings?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Round-robin standings use the standard 3-1-0 system: 3 points for a win, 1 point for a tie, 0 for a loss. Ties in total points are broken by total wins. Standings recompute automatically every time a match score is entered.",
          },
        },
        {
          "@type": "Question",
          name: "Why use 3 points for a win instead of 2?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A 3-1-0 system rewards winning more than drawing, which discourages teams from playing conservatively for a tie late in a season. It's the same system most soccer leagues use worldwide, and it translates cleanly to any bar format with a clear win/loss/tie result.",
          },
        },
        {
          "@type": "Question",
          name: "What happens when two teams are tied in the standings?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The most common first tiebreaker is total wins - a team with more wins ranks higher even with the same points. Head-to-head result and point differential are common secondary tiebreakers used by many leagues, though not every platform automates them.",
          },
        },
        {
          "@type": "Question",
          name: "Should I display standings publicly during the season?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Visible, frequently-updated standings are one of the strongest retention tools available - players who can see they're one good week from moving up are far more likely to keep showing up than players guessing at their own record.",
          },
        },
      ],
    },
  ],
};

export default function StandingsAndPointsGuide() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
        <p className="lp-kicker text-lp-accent">
          <Link href="/guides" className="hover:underline">Guides</Link> / Operations
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          How Standings and Points Systems Work
        </h1>
        <p className="mt-5 text-lg text-lp-muted">
          A league without visible standings is just a series of unrelated match nights. Standings
          are what turn individual matches into a season people care about - here&apos;s how the
          points actually work, and how to set them up so they hold up over a whole season.
        </p>

        <div className="mt-10 space-y-10 text-lp-text leading-relaxed">

          <section>
            <h2 className="font-display text-2xl font-bold">1. The standard points system: 3-1-0</h2>
            <p className="mt-4">
              The most common points system for a round-robin league awards 3 points for a win, 1
              point for a tie, and 0 points for a loss. This is the same scoring convention most
              soccer leagues use worldwide, and it works just as well for darts, cornhole, pool, or
              any bar format with a clear win/loss/tie outcome per match.
            </p>
            <p className="mt-4">
              This is exactly the system LeaguePour uses for automatically-generated round-robin
              standings: a win is worth 3 points, a tie is worth 1, and standings recompute from
              scratch every time a match score is entered - so correcting a mistyped score never
              double-counts a result.
            </p>
            <p className="mt-4">
              The reason 3-1-0 beats a simpler 2-1-0 or 1-0.5-0 system: it rewards winning
              meaningfully more than tying. Under a system where a win and two ties are worth the
              same as two wins and a loss, teams have a real incentive to play for a safe tie late in
              a season instead of going for the win. Weighting wins more heavily keeps every match
              worth trying to win outright.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">2. Wins, losses, and ties behind the points</h2>
            <p className="mt-4">
              Points are the number used to rank the table, but the underlying win/loss/tie record is
              what players actually talk about and remember. Track both - a team sitting in third
              place with an 8-2 record tells a very different story than a team in third with a 5-2-3
              record, even if their point totals happen to be close.
            </p>
            <p className="mt-4">
              Not every format has ties. Single-elimination brackets don&apos;t need a points system
              at all - the bracket itself is the standings, since a team is either still in or already
              out. Points and a running table matter specifically for round-robin leagues and seasons
              where every team keeps playing regardless of result.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">3. Breaking ties in the standings</h2>
            <p className="mt-4">
              Two teams finishing with the same point total is common, especially in shorter seasons.
              The most widely used first tiebreaker is total wins - a team with more wins ranks
              higher even at equal points, since it reflects a stronger overall record.
            </p>
            <p className="mt-4">
              Beyond total wins, common secondary tiebreakers include head-to-head result (whoever won
              when the two tied teams played each other) and point or game differential (margin of
              victory across the season, not just win/loss). Decide your tiebreaker order before the
              season starts and publish it alongside your rules - like a refund policy, a tiebreaker
              rule announced after the fact always feels like a moving target even when it&apos;s fair.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">4. Why visible standings matter more than people expect</h2>
            <p className="mt-4">
              A player who can see they&apos;re three points out of first place with two weeks left has
              a concrete reason to show up next week. A player with no idea where they stand has no
              such pull. Standings are one of the cheapest, most effective retention tools available to
              a bar league - they cost nothing to display and they work on their own, without any extra
              promotion.
            </p>
            <p className="mt-4">
              Update standings the same night results come in, not days later. A table that&apos;s
              stale by the time the next round starts loses most of its pull - players stop checking
              it if it doesn&apos;t reflect what actually happened last week. Automatic recalculation
              (rather than someone manually updating a spreadsheet between rounds) is what keeps this
              reliable over a full season.
            </p>
            <p className="mt-4">
              Display standings somewhere players actually see them: a TV behind the bar in scoreboard
              mode, a printed sheet near the boards or tables, and a link players can check from their
              phone between rounds. The more places a player can casually check their spot, the more
              often they think about your league between matches.
            </p>
          </section>

        </div>

        <div className="mt-14 rounded-2xl bg-lp-accent/10 border border-lp-accent/20 p-8">
          <h2 className="font-display text-2xl font-bold">Automatic standings with LeaguePour</h2>
          <p className="mt-2 text-lp-muted">
            Round-robin standings recompute automatically using the standard 3-1-0 points system every
            time a score is entered, with a public page and TV scoreboard mode players can check
            anytime.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup/venue">Start hosting events - free</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/bar-league-standings">See standings features</Link>
            </Button>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold">Frequently asked questions</h2>
          <div className="mt-5 space-y-4">
            {[
              {
                q: "What points system does LeaguePour use for standings?",
                a: "Round-robin standings use the standard 3-1-0 system: 3 points for a win, 1 for a tie, 0 for a loss. Ties in total points are broken by total wins. Standings recompute automatically every time a score is entered.",
              },
              {
                q: "Why use 3 points for a win instead of 2?",
                a: "A 3-1-0 system rewards winning more than drawing, discouraging teams from playing for a safe tie late in a season. It's the same system most soccer leagues use worldwide.",
              },
              {
                q: "What happens when two teams are tied in the standings?",
                a: "The most common first tiebreaker is total wins. Head-to-head result and point differential are common secondary tiebreakers many leagues use.",
              },
              {
                q: "Should I display standings publicly during the season?",
                a: "Yes. Visible, frequently-updated standings are one of the strongest retention tools available - players who can see they're close to moving up are far more likely to keep showing up.",
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
          <Link href="/guides/round-robin-vs-single-elimination" className="font-semibold text-lp-accent hover:underline">Round robin vs single elimination →</Link>
          <Link href="/bar-league-standings" className="font-semibold text-lp-accent hover:underline">Bar league standings →</Link>
        </div>
      </div>
    </>
  );
}
