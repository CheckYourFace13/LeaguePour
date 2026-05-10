import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "History of Billiards & Pool | From Kings to Corner Bars | LeaguePour",
  description:
    "How billiards went from a 15th-century French lawn game to a royal pastime to every dive bar in America — including the story of why we call it 'pool' and when 8-ball became standard.",
  alternates: { canonical: "/history/billiards" },
  keywords: [
    "history of billiards",
    "history of pool",
    "billiards history",
    "pool table history",
    "origin of pool",
    "8-ball history",
    "bar pool league history",
  ],
  openGraph: {
    title: "History of Billiards & Pool | From Kings to Corner Bars | LeaguePour",
    description:
      "A French lawn game, King Louis XI, a mace that became a cue, horse-racing betting pools, and eventually your bar's back room. The full story.",
    url: "/history/billiards",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "History of Billiards & Pool: From Kings to Corner Bars",
  description:
    "The history of billiards from its 15th-century French origins through the development of the cue stick, the naming of pool halls, 8-ball standardization, and the founding of the World Pool-Billiard Association.",
  url: "https://leaguepour.com/history/billiards",
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
  mainEntityOfPage: "https://leaguepour.com/history/billiards",
};

export default function BilliardsHistoryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
        <Link href="/history" className="text-sm text-lp-muted hover:text-lp-accent">
          ← Bar game history
        </Link>

        <p className="lp-kicker mt-6 text-lp-accent">Billiards & Pool</p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          From kings to corner bars
        </h1>
        <p className="mt-5 text-lg text-lp-muted">
          Billiards started as an outdoor lawn game in 15th-century France. Within a century it had moved
          indoors, acquired a royal patron, and begun its long journey toward becoming the game you're
          running leagues for at your bar.
        </p>

        <div className="mt-12 space-y-8 text-lp-text leading-relaxed">
          <section>
            <h2 className="font-display text-2xl font-bold">A lawn game moves indoors</h2>
            <p className="mt-4">
              The earliest billiards was played outdoors, resembling a ground-level croquet-style game
              where a mace — a stick with a wide, flat head — was used to push balls through wickets or
              toward targets on the grass. By the mid-15th century, the game had migrated indoors onto
              wooden tables, with raised edges (the earliest form of rails) to keep the balls from rolling
              off.
            </p>
            <p className="mt-4">
              The indoor version spread quickly among European nobility. King Louis XI of France is among
              the first historical figures recorded as owning a billiard table, with accounts of a table
              in his possession dating to around 1470. From the French court the game spread to England,
              where it was well documented by the 16th century. Shakespeare mentions billiards in
              Antony and Cleopatra (written around 1606), which tells you how common the game had
              become in educated English circles by that point.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">The mace becomes the cue</h2>
            <p className="mt-4">
              The mace — that wide-headed stick — had a practical problem: it was awkward to use near
              the rails. When a ball was resting against the cushion, players would often flip the mace
              around and use its narrow handle end to make the shot. That narrow end eventually got its
              own name: the cue, from the French word "queue," meaning tail.
            </p>
            <p className="mt-4">
              By the late 17th and early 18th centuries, the cue had replaced the mace as the standard
              implement. Leather tips appeared around 1807, credited to a French army officer named
              Mingaud who reportedly had both the time and the inclination to experiment with billiards
              technique while in prison. The leather tip allowed players to apply side spin to the cue
              ball — "English" in American parlance — which transformed the strategic possibilities of
              the game entirely.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">Why it's called "pool"</h2>
            <p className="mt-4">
              Here's the part most people don't know: "pool" has nothing to do with the game itself. The
              word comes from the French "poule," meaning a collective bet or ante — a pool of wagers.
              In 19th-century America, horse-racing betting rooms were called "pool rooms" because
              that's where bettors pooled their money on races.
            </p>
            <p className="mt-4">
              Pool rooms needed something for customers to do between races, and billiard tables filled
              that role. The association stuck. By the late 1800s, "pool room" had become synonymous with
              billiard hall, regardless of whether any horse betting was involved. The game played on the
              tables eventually just became "pool."
            </p>
            <p className="mt-4">
              The Billiard Congress of America notes that the term "pool" in reference to the billiards
              game itself became common in American usage in the latter half of the 19th century,
              while "billiards" remained the more formal term for the cue-ball-only carom games.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">8-ball: the game that took over</h2>
            <p className="mt-4">
              The game of 8-ball — in which one player shoots solids (1–7) and the other shoots
              stripes (9–15), with the 8-ball as the final object — was developed in the early 20th
              century in America. It became the standard game in pool halls by around the 1920s and
              is now by far the most commonly played billiards variant in bars worldwide.
            </p>
            <p className="mt-4">
              9-ball, played with only the 1 through 9 balls and requiring shots to hit the lowest
              numbered ball first, became the dominant tournament format for professional competition
              — partly because it's faster and more telegenic. But 8-ball is what most people learn
              first, and what most bar leagues run.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">The World Pool-Billiard Association</h2>
            <p className="mt-4">
              International competition in pool got its governing body in 1987 with the founding of
              the{" "}
              <a
                href="https://www.wpa-pool.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lp-accent hover:underline"
              >
                World Pool-Billiard Association (WPA)
              </a>
              . The WPA established standardized rules for 8-ball and 9-ball that are now used in
              sanctioned international competition. In the US, the{" "}
              <a
                href="https://www.bca-pool.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lp-accent hover:underline"
              >
                Billiard Congress of America (BCA)
              </a>{" "}
              has served since 1948 as the national authority on equipment standards and competitive
              rules.
            </p>
            <p className="mt-4">
              The American Poolplayers Association (APA), founded in 1981, became one of the largest
              amateur sports organizations in the United States by running handicapped league play
              specifically designed to be accessible to recreational players. Their format — where
              skill levels are assigned so that weaker and stronger players can compete on equal
              footing — is a model that many bar leagues follow today.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">Pool tables in bars</h2>
            <p className="mt-4">
              The pool table became a bar staple in America through the coin-op era. By the mid-20th
              century, coin-operated pool tables were a reliable revenue source for bars and taverns,
              requiring no staff involvement and generating steady income during slow periods. A bar
              with two pool tables in the back could keep a room of eight people occupied for an
              entire evening.
            </p>
            <p className="mt-4">
              That model persists today, though league play has added a layer of regular, recurring
              business that coin-op alone never provided. Pool leagues bring teams back week after week,
              build cross-bar rivalries, and create the kind of loyal customer relationship that's hard
              to manufacture with any other programming.
            </p>
          </section>
        </div>

        <div className="mt-10 rounded-xl border border-lp-border bg-lp-surface/40 p-5 text-sm text-lp-muted">
          <p className="font-semibold text-lp-text">Sources</p>
          <ul className="mt-3 space-y-1">
            <li>
              <a
                href="https://www.bca-pool.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lp-accent hover:underline"
              >
                Billiard Congress of America (bca-pool.com)
              </a>
            </li>
            <li>
              <a
                href="https://www.wpa-pool.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lp-accent hover:underline"
              >
                World Pool-Billiard Association (wpa-pool.com)
              </a>
            </li>
            <li>
              <a
                href="https://en.wikipedia.org/wiki/Billiards"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lp-accent hover:underline"
              >
                Wikipedia — Billiards
              </a>
            </li>
            <li>
              <a
                href="https://en.wikipedia.org/wiki/Pool_(cue_sports)"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lp-accent hover:underline"
              >
                Wikipedia — Pool (cue sports)
              </a>
            </li>
          </ul>
        </div>

        <div className="mt-14 rounded-2xl bg-lp-accent/10 border border-lp-accent/20 p-8">
          <h2 className="font-display text-xl font-bold">Run a pool league at your bar</h2>
          <p className="mt-2 text-lp-muted">
            LeaguePour handles online signup, team registration, entry fees, standings, and communications
            for bar pool leagues. Built for venues that run weekly play.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup/venue">Get started free</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/pool-league-management">See pool league features</Link>
            </Button>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          <Link href="/history/darts" className="font-semibold text-lp-accent hover:underline">
            History of darts →
          </Link>
          <Link href="/history/shuffleboard" className="font-semibold text-lp-accent hover:underline">
            History of shuffleboard →
          </Link>
          <Link href="/rules" className="font-semibold text-lp-accent hover:underline">
            Official pool & billiards rules →
          </Link>
        </div>
      </div>
    </>
  );
}
