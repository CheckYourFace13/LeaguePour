import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: { absolute: "Bar Competition Guides | LeaguePour" },
  description:
    "Free guides for bar owners on running dart leagues, cornhole tournaments, trivia nights, and more. Learn how to collect entry fees, fill seats, and keep players coming back.",
  alternates: { canonical: "/guides" },
  keywords: [
    "bar competition guides",
    "how to run a dart league",
    "bar trivia night guide",
    "cornhole tournament ideas for bars",
    "how to collect entry fees at a bar",
    "bar competition ideas",
  ],
  openGraph: {
    title: "Bar Competition Guides | LeaguePour",
    description:
      "Free guides for bar owners on running leagues, tournaments, and trivia nights that fill seats.",
    url: "/guides",
  },
};

type Guide = { href: string; title: string; description: string };
type Category = { name: string; intro: string; guides: Guide[] };

const categories: Category[] = [
  {
    name: "Getting started",
    intro:
      "Deciding what to run at all is the first real decision. Start here if you haven't picked a format yet.",
    guides: [
      {
        href: "/guides/bar-competition-ideas",
        title: "25 Bar Competition Ideas That Fill Seats",
        description:
          "A full list of competition formats - darts, cornhole, trivia, pool, poker, shuffleboard, cards, and more - with a brief description of what makes each one work.",
      },
    ],
  },
  {
    name: "Tournament formats",
    intro:
      "Once you know what game you're running, the format - how matches are structured and scored - decides how the night actually feels.",
    guides: [
      {
        href: "/guides/round-robin-vs-single-elimination",
        title: "Round Robin vs. Single Elimination for Bars",
        description:
          "Which format keeps players (and their tabs) in the room longer, how long each takes to run, and how to choose between them.",
      },
      {
        href: "/guides/how-standings-and-points-work",
        title: "How Standings and Points Systems Work",
        description:
          "The standard 3-1-0 points system, how ties get broken, and why visible standings are one of the cheapest retention tools you have.",
      },
    ],
  },
  {
    name: "Game-specific guides",
    intro: "Deep, format-specific advice for the games bars run most often.",
    guides: [
      {
        href: "/guides/how-to-run-a-dart-league-at-your-bar",
        title: "How to Run a Dart League at Your Bar",
        description:
          "Everything from choosing a format (501, Cricket, round-robin) and setting entry fees to scheduling nights, handling disputes, and building a loyal regular player base.",
      },
      {
        href: "/guides/cornhole-tournament-ideas-for-bars",
        title: "Cornhole Tournament Ideas for Bars",
        description:
          "Bracket formats, team sizes, prize ideas, sponsorship strategies, seasonal themes, and promotion tips to make your cornhole events the talk of the neighborhood.",
      },
      {
        href: "/guides/bar-trivia-night-guide",
        title: "How to Run Trivia Night at Your Bar",
        description:
          "Hosting tips, theme ideas, team sizes, scoring systems, prizes, and the secrets to keeping a full room of regulars coming back every week.",
      },
      {
        href: "/guides/how-to-start-a-pool-league",
        title: "How to Start a Pool League at Your Bar",
        description:
          "Choosing 8-ball or 9-ball, handicapping mixed-skill players, table logistics, entry fees, and how to run league night without the chaos.",
      },
    ],
  },
  {
    name: "Payments & entry fees",
    intro: "Getting paid is the part most bars wing - here's how to do it without the headaches.",
    guides: [
      {
        href: "/guides/how-to-collect-entry-fees-at-your-bar",
        title: "How to Collect Entry Fees at Your Bar (The Right Way)",
        description:
          "Why cash is a headache, the legal considerations, how online payment tools like Stripe work, how to communicate fees to players, and how to handle refunds gracefully.",
      },
    ],
  },
  {
    name: "Promotion & growth",
    intro: "Filling seats consistently is different from filling them once.",
    guides: [
      {
        href: "/guides/how-to-increase-bar-traffic-on-slow-nights",
        title: "How to Increase Bar Traffic on Slow Nights",
        description:
          "Why one-off drink specials don't stick, how to pick one recurring anchor event, and how to build a slow Tuesday into a full one.",
      },
    ],
  },
  {
    name: "Operations & troubleshooting",
    intro: "The day-to-day problems that come up once a league is actually running.",
    guides: [
      {
        href: "/guides/managing-no-shows-and-forfeits",
        title: "Managing No-Shows and Forfeits",
        description:
          "A fair, written forfeit policy: what counts as fair notice, how entry fees cut no-shows dramatically, and how to handle repeat offenders.",
      },
    ],
  },
];

export default function GuidesIndexPage() {
  return (
    <>
      <div className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-20">
        <p className="lp-kicker text-lp-accent">Free resources</p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          Bar competition guides.<br />
          <span className="text-lp-accent">Built for bar owners.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-lp-muted">
          Running leagues and tournaments is one of the best ways to drive consistent foot traffic
          and build a loyal customer base. These guides cover the formats, logistics, and operational
          details that actually matter - practical notes for operators using LeaguePour or planning
          their first league night, organized by the question you&apos;re actually trying to answer.
        </p>

        <div className="mt-14 space-y-14">
          {categories.map((cat) => (
            <div key={cat.name}>
              <h2 className="font-display text-2xl font-bold text-lp-text">{cat.name}</h2>
              <p className="mt-2 max-w-2xl text-sm text-lp-muted leading-relaxed">{cat.intro}</p>
              <div className="mt-6 space-y-4">
                {cat.guides.map((guide) => (
                  <Link
                    key={guide.href}
                    href={guide.href}
                    className="block rounded-xl border border-lp-border bg-lp-surface/40 p-6 transition-colors hover:border-lp-accent/40 hover:bg-lp-surface/60"
                  >
                    <h3 className="font-display text-lg font-bold text-lp-text">{guide.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-lp-muted">{guide.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <h2 className="font-display text-xl font-bold text-lp-text">Explore by game</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {[
              { href: "/dart-league-software", label: "Dart league software" },
              { href: "/bar-trivia-software", label: "Bar trivia software" },
              { href: "/bar-league-standings", label: "Bar league standings" },
              { href: "/pool-league-management", label: "Pool league management" },
              { href: "/cornhole-tournament-software", label: "Cornhole tournament software" },
              { href: "/euchre-tournament-software", label: "Euchre tournament software" },
              { href: "/shuffleboard-league-software", label: "Shuffleboard league software" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full border border-lp-border bg-lp-surface/40 px-4 py-2 text-sm font-semibold text-lp-text-soft hover:border-lp-accent/40 hover:text-lp-accent transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-16 rounded-2xl bg-lp-accent/10 border border-lp-accent/20 p-8 text-center">
          <h2 className="font-display text-2xl font-bold">Ready to run your first competition?</h2>
          <p className="mt-2 text-lp-muted">
            LeaguePour handles signup, entry fees, standings, and player communications - so you
            can focus on running great events.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/signup/venue">Start hosting events - free</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
