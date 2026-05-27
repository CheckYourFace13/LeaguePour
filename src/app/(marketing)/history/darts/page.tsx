import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "History of Darts | From English Pubs to World Sport | LeaguePour",
  description:
    "The real history of darts — medieval English origins, how elm tree cross-sections became boards, Brian Gamlin's number arrangement in 1896, the rise of the WDF, and the Phil Taylor era.",
  alternates: { canonical: "/history/darts" },
  keywords: [
    "history of darts",
    "darts history",
    "origin of darts",
    "Brian Gamlin dartboard",
    "pub darts history",
    "World Darts Federation history",
  ],
  openGraph: {
    title: "History of Darts | From English Pubs to World Sport | LeaguePour",
    description:
      "From medieval English pubs to packed arenas — the real story of how darts became a world sport.",
    url: "/history/darts",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "History of Darts: From English Pubs to World Sport",
  description:
    "The history of darts from medieval English origins through the modern PDC era, including the story of Brian Gamlin's 1896 number arrangement and the founding of the World Darts Federation.",
  url: "https://leaguepour.com/history/darts",
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
  mainEntityOfPage: "https://leaguepour.com/history/darts",
};

export default function DartsHistoryPage() {
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

        <p className="lp-kicker mt-6 text-lp-accent">Darts</p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          From English pubs to world sport
        </h1>
        <p className="mt-5 text-lg text-lp-muted">
          Darts has been a pub game for centuries. The version you play today — with that specific
          number arrangement on the board — was largely settled by 1896.
        </p>

        <div className="mt-12 space-y-8 text-lp-text leading-relaxed">
          <section>
            <h2 className="font-display text-2xl font-bold">Medieval origins</h2>
            <p className="mt-4">
              The earliest evidence of dart-throwing as a game points to medieval England, where soldiers
              are said to have thrown short arrows at the bottom of wine barrels or the cross-sections of
              felled trees. The rings in the wood created natural scoring zones. Whether that story is
              entirely accurate is debated, but what's clear is that by the time written records appear,
              darts was already well established in English drinking establishments.
            </p>
            <p className="mt-4">
              Cross-sections of elm trees — which display concentric rings as they dry and crack — are the
              most commonly cited precursor to the modern dartboard. The wood would split along natural
              lines, forming segments not entirely unlike what you see on a board today. Elm was the
              preferred material for boards well into the 20th century.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">Brian Gamlin's number arrangement (1896)</h2>
            <p className="mt-4">
              The numbering sequence on a standard dartboard — 20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3,
              19, 7, 16, 8, 11, 14, 9, 12, 5 — is widely attributed to a carpenter from Bury,
              Lancashire named Brian Gamlin, who is said to have devised it in 1896. The arrangement
              is deliberately punishing: high numbers are flanked by low ones, which means a slight miss
              to either side costs you dearly. A 20 sits next to a 1 and a 5. A 19 sits next to a 7 and
              a 3.
            </p>
            <p className="mt-4">
              That design philosophy — rewarding accuracy and punishing imprecision — is what separates
              darts from a pure luck game and explains why it has sustained serious competition for well
              over a century. Gamlin died in 1903 before he could patent the arrangement, and the
              attribution itself has been questioned by some historians, but his name remains attached to
              it in most accounts.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">Darts becomes a pub institution</h2>
            <p className="mt-4">
              By the late 19th and early 20th centuries, darts was a fixture of English pub life. In 1908,
              a landlord in Leeds named Anakin successfully defended a darts game against a local
              magistrate's claim that it was a game of chance rather than skill — by having a dart player
              hit the numbers the magistrate called out. The court agreed: darts was a skill game. That
              ruling mattered, because games of chance were subject to gambling restrictions; games of
              skill were not. Pubs could keep their boards.
            </p>
            <p className="mt-4">
              The National Darts Association was founded in Britain in 1924, and the News of the World
              Individual Darts Championship — one of the sport's earliest major competitions — began in
              1927 and ran until 1990. For much of the 20th century, darts was broadcast on British
              television in a format somewhere between sport and light entertainment.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">The World Darts Federation (1976)</h2>
            <p className="mt-4">
              Organized international competition arrived in 1976 with the founding of the{" "}
              <a
                href="https://www.dartswdf.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lp-accent hover:underline"
              >
                World Darts Federation (WDF)
              </a>
              . The first World Darts Championship followed in 1978, held at the Heart of the Midlands
              Club in Nottingham. Leighton Rees of Wales won. The championship quickly became the sport's
              premier event, with the venue later moving to Alexandra Palace in London — which remains
              its home for the BDO/WDF championship to this day.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">The split and the PDC era</h2>
            <p className="mt-4">
              In 1992, sixteen of the world's top players broke away from the WDF's British Darts
              Organisation over disputes about prize money and professionalism. They formed what became
              the{" "}
              <a
                href="https://www.pdc.tv"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lp-accent hover:underline"
              >
                Professional Darts Corporation (PDC)
              </a>
              , which held its first World Championship in 1994.
            </p>
            <p className="mt-4">
              Phil Taylor — "The Power" — dominated the sport from the early 1990s through the 2010s,
              winning 16 PDC World Championship titles. His rivalry with players like John Part, Adrian
              Lewis, and eventually Gary Anderson and Michael van Gerwen raised the sport's profile
              enormously. Taylor is widely considered the greatest darts player of all time, though van
              Gerwen has mounted a serious case for that title in the years since Taylor's retirement.
            </p>
            <p className="mt-4">
              The PDC today runs the most commercially successful darts competitions in the world,
              with the Premier League Darts — a traveling league format played in arenas across the UK
              and Europe — drawing crowds that would have seemed impossible for a pub game thirty years ago.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">Darts in bars today</h2>
            <p className="mt-4">
              Electronic dartboards changed the accessibility of the game significantly — automatic
              scoring, multiple game modes, and coin-op operation made darts viable in any bar, not
              just those with staff who could run manual leagues. But steel-tip darts and traditional
              bristle boards (now made from sisal fiber rather than elm) have maintained their
              following, particularly in league play.
            </p>
            <p className="mt-4">
              Bar dart leagues remain one of the most reliably recurring events on a venue's weekly
              calendar. Teams are small, setup is minimal, and players tend to be loyal — the same
              people show up week after week. That's been true for well over a century, and the game's
              fundamentals haven't changed much since Brian Gamlin arranged those numbers in 1896.
            </p>
          </section>
        </div>

        <div className="mt-10 rounded-xl border border-lp-border bg-lp-surface/40 p-5 text-sm text-lp-muted">
          <p className="font-semibold text-lp-text">Sources</p>
          <ul className="mt-3 space-y-1">
            <li>
              <a
                href="https://en.wikipedia.org/wiki/Darts"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lp-accent hover:underline"
              >
                Wikipedia — Darts
              </a>
            </li>
            <li>
              <a
                href="https://www.dartswdf.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lp-accent hover:underline"
              >
                World Darts Federation (dartswdf.com)
              </a>
            </li>
            <li>
              <a
                href="https://www.pdc.tv"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lp-accent hover:underline"
              >
                Professional Darts Corporation (pdc.tv)
              </a>
            </li>
          </ul>
        </div>

        <div className="mt-14 rounded-2xl bg-lp-accent/10 border border-lp-accent/20 p-8">
          <h2 className="font-display text-xl font-bold">Run a dart league at your bar</h2>
          <p className="mt-2 text-lp-muted">
            LeaguePour handles online signup, entry fees, standings, and player communications for bar
            dart leagues. No spreadsheets.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup/venue">Get started free</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/dart-league-software">See dart league features</Link>
            </Button>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          <Link href="/history/billiards" className="font-semibold text-lp-accent hover:underline">
            History of billiards & pool →
          </Link>
          <Link href="/history/cornhole" className="font-semibold text-lp-accent hover:underline">
            History of cornhole →
          </Link>
          <Link href="/rules" className="font-semibold text-lp-accent hover:underline">
            Official darts rules →
          </Link>
        </div>
      </div>
    </>
  );
}
