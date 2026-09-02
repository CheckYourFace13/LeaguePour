import { safeJsonLd } from "@/lib/seo/json-ld-builders";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: { absolute: "History of Shuffleboard | Five Centuries at the Table | LeaguePour" },
  description:
    "Shuffleboard has been a tavern game since Tudor England - Henry VIII banned it in 1532 and people kept playing anyway. The full history from 'shovelboard' to bar staple.",
  alternates: { canonical: "/history/shuffleboard" },
  keywords: [
    "history of shuffleboard",
    "shuffleboard history",
    "table shuffleboard history",
    "shovelboard history",
    "Henry VIII shuffleboard",
    "bar shuffleboard history",
  ],
  openGraph: {
    title: "History of Shuffleboard | Five Centuries at the Table | LeaguePour",
    description:
      "Henry VIII banned it. Tudor tavern-keepers kept running it anyway. Five centuries of shuffleboard history.",
    url: "/history/shuffleboard",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "History of Shuffleboard: Five Centuries at the Table",
  description:
    "The history of shuffleboard from its 15th-century English origins as 'shovelboard', through Henry VIII's 1532 ban, the development of the table version, and its 20th-century establishment as a bar staple.",
  url: "https://leaguepour.com/history/shuffleboard",
  publisher: {
    "@type": "Organization",
    name: "LeaguePour",
    url: "https://leaguepour.com",
  },
  datePublished: "2025-05-10",
  author: {
    "@type": "Organization",
    name: "LeaguePour",
  },
  mainEntityOfPage: "https://leaguepour.com/history/shuffleboard",
};

export default function ShuffleboardHistoryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
        <Link href="/history" className="text-sm text-lp-muted hover:text-lp-accent">
          ← Bar game history
        </Link>

        <p className="lp-kicker mt-6 text-lp-accent">Shuffleboard</p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          Five centuries at the table
        </h1>
        <p className="mt-5 text-lg text-lp-muted">
          Of all the games in this series, shuffleboard has the longest unbroken tradition as a tavern
          game. Henry VIII tried to ban it in 1532. It survived him.
        </p>

        <div className="mt-12 space-y-8 text-lp-text leading-relaxed">
          <section>
            <h2 className="font-display text-2xl font-bold">Shovelboard in Tudor England</h2>
            <p className="mt-4">
              The game appears in English records as far back as the 15th century under the name
              "shove-groat" or "slide-groat" - a reference to the coin (a groat) that players would
              push along a table or bench toward a target zone. The goal was simple: slide your coin
              or disk as close to the far end of the table as possible without falling off. The game
              required a steady hand and an understanding of how the surface played - not unlike what
              your regulars are doing on your shuffleboard table right now.
            </p>
            <p className="mt-4">
              The name evolved over time. "Shovelboard" and "shuffle-board" appear in 16th-century
              documents, and the game was clearly widespread enough to attract attention from the
              Crown. In 1532, Henry VIII issued a proclamation banning the game - along with bowls
              and several other recreations - for servants and laborers. The concern was not that the
              games were inherently harmful but that they were pulling workers away from archery
              practice. England's military strategy depended on skilled archers, and idle entertainment
              was seen as a direct threat to that readiness.
            </p>
            <p className="mt-4">
              The ban didn't work particularly well. Henry himself is reported to have lost substantial
              sums playing shovelboard, which gives the prohibition a somewhat ironic quality. The game
              continued through the Tudor and Stuart periods, played in taverns and great halls alike.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">A game for all classes</h2>
            <p className="mt-4">
              What made shovelboard persist across class lines was its scalability. The basic equipment -
              a smooth, long table or bench and disks to push - could be assembled cheaply. A tavern
              could build a shovelboard table from planks; a great house could commission an elaborate
              one in fine wood. Both were playing essentially the same game.
            </p>
            <p className="mt-4">
              Shakespeare mentions the game in The Merry Wives of Windsor, written around 1597, where
              Slender offers to play "at shovel-board" with a character who owes him money. That's a
              useful cultural marker: by Shakespeare's time, shovelboard was familiar enough that the
              reference required no explanation.
            </p>
            <p className="mt-4">
              The game spread with English colonists to North America in the 17th century, where it
              appeared in taverns along the eastern seaboard. Like many British imports, it took root
              and developed its own American character over time.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">The table version develops</h2>
            <p className="mt-4">
              The floor or deck version of shuffleboard - where players use long-handled cues to push
              weighted pucks toward scoring zones painted on the ground - developed as a variant, likely
              in the 19th century. This version became popular on cruise ships and in outdoor settings,
              and it's what most people picture when they hear "shuffleboard" today.
            </p>
            <p className="mt-4">
              The table version, though, is the direct descendant of the original shovelboard. Players
              stand at one end of a long, narrow table - typically 9 to 22 feet long - and push weighted
              pucks toward the scoring zones at the far end. The table's surface is coated with a
              powdered silicone or shuffleboard wax (called "shuffleboard sand" or "cheese") that
              reduces friction and allows the pucks to glide smoothly.
            </p>
            <p className="mt-4">
              The table version found a strong market in American bars in the mid-20th century, when
              manufacturers began producing standardized commercial tables. The American Shuffleboard
              Company, founded in Newark, New Jersey in the 1930s, was among the earliest commercial
              manufacturers to produce tables at scale for the bar and recreation market.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">Mid-century bar staple</h2>
            <p className="mt-4">
              By the 1940s and 1950s, shuffleboard tables were fixtures in American bars and VFW halls
              across the country. The table occupied a cultural position somewhat like the pool table:
              it was equipment that turned a bar into a destination, something to do while you drank
              that was social and competitive without requiring the precision of darts or the athletic
              commitment of billiards.
            </p>
            <p className="mt-4">
              Shuffleboard's popularity in bars waned somewhat during the latter half of the 20th
              century, as pool tables and video games competed for floor space. The tables take up
              significant room - a full-size competitive table is 22 feet long - which made them
              impractical as bars got smaller or rearranged for other purposes.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">The revival</h2>
            <p className="mt-4">
              Shuffleboard has come back strongly in the last fifteen years, driven partly by the craft
              bar and gastropub movement. Venues investing in game programming have found that a
              shuffleboard table - placed in a dedicated games area with good lighting and comfortable
              seating nearby - generates long dwell times and social energy that other games don't quite
              replicate. It's slower than darts, more conversational, easier on the back than pool.
            </p>
            <p className="mt-4">
              Organized shuffleboard leagues have grown alongside the revival. The National Shuffleboard
              Association maintains rules and competitive standards for organized play. Bar leagues
              typically run doubles formats, with teams alternating shots and competing in match play
              over an evening.
            </p>
            <p className="mt-4">
              Five centuries after Henry VIII tried to shut it down, shuffleboard is still filling
              taverns. Some games just don't quit.
            </p>
          </section>
        </div>

        <div className="mt-10 rounded-xl border border-lp-border bg-lp-surface/40 p-5 text-sm text-lp-muted">
          <p className="font-semibold text-lp-text">Sources</p>
          <ul className="mt-3 space-y-1">
            <li>
              <a
                href="https://en.wikipedia.org/wiki/Shuffleboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lp-accent hover:underline"
              >
                Wikipedia - Shuffleboard
              </a>
            </li>
            <li>
              <a
                href="https://en.wikipedia.org/wiki/Table_shuffleboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lp-accent hover:underline"
              >
                Wikipedia - Table shuffleboard
              </a>
            </li>
          </ul>
        </div>

        <div className="mt-14 rounded-2xl bg-lp-accent/10 border border-lp-accent/20 p-8">
          <h2 className="font-display text-xl font-bold">Run a shuffleboard league at your bar</h2>
          <p className="mt-2 text-lp-muted">
            LeaguePour handles online signup, team registration, entry fees, standings, and player
            communications for bar shuffleboard leagues.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup/venue">Start hosting events</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/shuffleboard-league-software">See shuffleboard features</Link>
            </Button>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          <Link href="/history/billiards" className="font-semibold text-lp-accent hover:underline">
            History of billiards & pool →
          </Link>
          <Link href="/history/darts" className="font-semibold text-lp-accent hover:underline">
            History of darts →
          </Link>
          <Link href="/rules" className="font-semibold text-lp-accent hover:underline">
            Official shuffleboard rules →
          </Link>
        </div>
      </div>
    </>
  );
}
