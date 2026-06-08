import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Bar Competition Guides | LeaguePour",
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

const guides = [
  {
    href: "/guides/how-to-run-a-dart-league-at-your-bar",
    title: "How to Run a Dart League at Your Bar",
    description:
      "Everything from choosing a format (501, Cricket, round-robin) and setting entry fees to scheduling nights, handling disputes, and building a loyal regular player base.",
    tag: "Darts",
  },
  {
    href: "/guides/cornhole-tournament-ideas-for-bars",
    title: "Cornhole Tournament Ideas for Bars",
    description:
      "Bracket formats, team sizes, prize ideas, sponsorship strategies, seasonal themes, and promotion tips to make your cornhole events the talk of the neighborhood.",
    tag: "Cornhole",
  },
  {
    href: "/guides/bar-trivia-night-guide",
    title: "How to Run Trivia Night at Your Bar",
    description:
      "Hosting tips, theme ideas, team sizes, scoring systems, prizes, and the secrets to keeping a full room of regulars coming back every week.",
    tag: "Trivia",
  },
  {
    href: "/guides/how-to-collect-entry-fees-at-your-bar",
    title: "How to Collect Entry Fees at Your Bar (The Right Way)",
    description:
      "Why cash is a headache, the legal considerations, how online payment tools like Stripe work, how to communicate fees to players, and how to handle refunds gracefully.",
    tag: "Operations",
  },
  {
    href: "/guides/bar-competition-ideas",
    title: "25 Bar Competition Ideas That Fill Seats",
    description:
      "A full list of competition formats - darts, cornhole, trivia, pool, poker, shuffleboard, cards, and more - with a brief description of what makes each one work.",
    tag: "Ideas",
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
          details that actually matter - practical notes for operators using LeaguePour or planning their first league
          night.
        </p>

        <div className="mt-12 space-y-4">
          {guides.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="block rounded-xl border border-lp-border bg-lp-surface/40 p-6 transition-colors hover:border-lp-accent/40 hover:bg-lp-surface/60"
            >
              <div className="flex items-start gap-4">
                <span className="mt-0.5 shrink-0 rounded-full bg-lp-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-lp-accent">
                  {guide.tag}
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold text-lp-text">{guide.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-lp-muted">{guide.description}</p>
                </div>
              </div>
            </Link>
          ))}
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
