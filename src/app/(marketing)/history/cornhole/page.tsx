import { safeJsonLd } from "@/lib/seo/json-ld-builders";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: { absolute: "History of Cornhole | The Origin of America's Backyard Game | LeaguePour" },
  description:
    "The disputed origins of cornhole - Ohio vs Wisconsin claims, German immigrant theories, 19th century rural roots, the ACA's founding in 2005, and how it became a bar league staple.",
  alternates: { canonical: "/history/cornhole" },
  keywords: [
    "history of cornhole",
    "cornhole origin",
    "who invented cornhole",
    "cornhole history",
    "American Cornhole Association history",
    "bar cornhole league",
  ],
  openGraph: {
    title: "History of Cornhole | The Origin of America's Backyard Game | LeaguePour",
    description:
      "Ohio says they invented it. Wisconsin disagrees. The real story of how cornhole went from rural pastime to American institution.",
    url: "/history/cornhole",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "History of Cornhole: The Origin of America's Backyard Game",
  description:
    "The disputed origins of cornhole, from 19th century rural America through the founding of the American Cornhole Association in 2005 and the game's explosion into mainstream popularity.",
  url: "https://leaguepour.com/history/cornhole",
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
  mainEntityOfPage: "https://leaguepour.com/history/cornhole",
};

export default function CornholeHistoryPage() {
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

        <p className="lp-kicker mt-6 text-lp-accent">Cornhole</p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          The origin of America's backyard game
        </h1>
        <p className="mt-5 text-lg text-lp-muted">
          Ask someone from Ohio and ask someone from Wisconsin where cornhole comes from, and you'll get
          two very different answers. Neither has definitive proof. That's been the state of things for a while.
        </p>

        <div className="mt-12 space-y-8 text-lp-text leading-relaxed">
          <section>
            <h2 className="font-display text-2xl font-bold">The competing origin claims</h2>
            <p className="mt-4">
              The state of Ohio claims cornhole as its own, with Cincinnati often cited as the city of
              origin. The most specific story attributes the game to a Midwestern farmer or craftsman in
              the late 19th century who built a simple platform game using dried corn kernels in a bag
              as a throwing object. The dried corn - lighter than a bean bag, slower through the air -
              turned out to be ideal for the purpose.
            </p>
            <p className="mt-4">
              Wisconsin has a competing claim, and some accounts trace a similar game back to German
              immigrants who brought a version of it with them during the great immigration waves of
              the 19th century. The German game - sometimes called "Sackloch" or similar variants - involved
              throwing weighted sacks at a target board. Whether this was a direct ancestor of American
              cornhole or simply a parallel development is genuinely unclear.
            </p>
            <p className="mt-4">
              There are also claims connecting the game to Native American traditions, with some accounts
              describing a game played with bags of dried corn that predates European settlement. These
              claims circulate widely but have limited documentary support. What's not in dispute is
              that the game existed in various forms across rural America well before it had a standardized
              name or ruleset.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">The rural game</h2>
            <p className="mt-4">
              For most of its early history, cornhole was the kind of game that existed without
              organization or written rules. Boards were built in barns and garages, often to whatever
              dimensions seemed reasonable to the person building them. The hole was sometimes a circle,
              sometimes a square. Scoring varied by who you asked. It was a backyard game, a tailgate
              game, a game you played at family reunions when the weather was good.
            </p>
            <p className="mt-4">
              That informality was part of its appeal - low cost, easy setup, no referees required -
              but it also meant the game had no consistent identity. Two people playing "cornhole" in
              Ohio and two people playing it in Kentucky might be playing games that barely resembled
              each other.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">College tailgating and the spread of the game</h2>
            <p className="mt-4">
              Cornhole's route to mainstream recognition ran through college football tailgating. By the
              1990s and early 2000s, the game had become a fixture in parking lots outside Big Ten and
              SEC stadiums. It was portable, social, worked for any group size, and could be packed into
              a truck bed. That's a nearly perfect combination of qualities for a tailgate game.
            </p>
            <p className="mt-4">
              As the game spread through college culture, it picked up players who were less interested
              in informal backyard play and more interested in competitive formats. The question of
              standard dimensions and rules started to matter in a way it hadn't when the game was purely
              casual.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">The American Cornhole Association (2005)</h2>
            <p className="mt-4">
              The{" "}
              <a
                href="https://americancornhole.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lp-accent hover:underline"
              >
                American Cornhole Association (ACA)
              </a>{" "}
              was founded in 2005 specifically to standardize and promote competitive cornhole. The ACA
              established official board dimensions (48 inches by 24 inches), hole size (6 inches in
              diameter), playing distances, and a scoring system. For the first time, cornhole had a
              governing body and a rulebook.
            </p>
            <p className="mt-4">
              The ACA's standardization had immediate practical effects. Tournaments could now be run
              with consistent rules. Boards could be manufactured to spec. The competitive scene grew
              quickly in the years following the ACA's founding, with regional and national tournaments
              drawing players who took the game seriously in a way that would have seemed odd a decade earlier.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">Mainstream recognition</h2>
            <p className="mt-4">
              By the 2010s, cornhole had crossed from regional pastime to national institution. ESPN
              began broadcasting the American Cornhole League, which was founded in 2015 and positioned
              the game as a legitimate competitive sport rather than a backyard novelty. Watching people
              play cornhole on ESPN was jarring to some and entirely natural to others - which, depending
              on your view, says something about both the sport and cable programming in general.
            </p>
            <p className="mt-4">
              The COVID-19 pandemic of 2020 accelerated the game's growth in an unexpected way. Outdoor
              activities that could be played with small groups became extremely popular, and cornhole
              checked every box. Equipment sales reportedly surged during that period, and many people
              who discovered the game during the pandemic continued playing when restrictions lifted.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">Cornhole in bars</h2>
            <p className="mt-4">
              Bars started picking up cornhole seriously as outdoor drinking areas expanded - patios,
              beer gardens, and rooftop spaces that needed activity programming. The game requires almost
              no maintenance, travels well, and draws people into longer stays. It's easy to run as a
              league format without staff needing to learn anything complicated.
            </p>
            <p className="mt-4">
              Bar cornhole leagues today typically run doubles formats with bracket or round-robin play.
              The ACA's standardization means bar leagues can use the same rules as sanctioned tournaments,
              which matters to serious players. And the game's accessibility - genuinely anyone can play
              at a basic level - means it fills tables with players who might not touch darts or pool.
            </p>
          </section>
        </div>

        <div className="mt-10 rounded-xl border border-lp-border bg-lp-surface/40 p-5 text-sm text-lp-muted">
          <p className="font-semibold text-lp-text">Sources</p>
          <ul className="mt-3 space-y-1">
            <li>
              <a
                href="https://americancornhole.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lp-accent hover:underline"
              >
                American Cornhole Association (americancornhole.com)
              </a>
            </li>
            <li>
              <a
                href="https://en.wikipedia.org/wiki/Cornhole"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lp-accent hover:underline"
              >
                Wikipedia - Cornhole
              </a>
            </li>
          </ul>
        </div>

        <div className="mt-14 rounded-2xl bg-lp-accent/10 border border-lp-accent/20 p-8">
          <h2 className="font-display text-xl font-bold">Run a cornhole tournament at your bar</h2>
          <p className="mt-2 text-lp-muted">
            LeaguePour handles online signup, team registration, entry fees, brackets, and standings for
            bar cornhole tournaments - indoor or patio.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup/venue">Start hosting events</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/cornhole-tournament-software">See cornhole tournament features</Link>
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
            Official cornhole rules →
          </Link>
        </div>
      </div>
    </>
  );
}
