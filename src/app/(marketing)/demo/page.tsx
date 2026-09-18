import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BracketPreview } from "@/components/app/bracket-preview";
import { buildSingleEliminationRound1, pairNextRound, type Participant } from "@/lib/tournament";
import { buildQrDataUrl } from "@/lib/qr";
import { getPublicSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: { absolute: "See LeaguePour In Action | Demo" },
  description:
    "A sample LeaguePour venue page - bracket, live standings, results, and player signup - so you can see how competitions look before you sign up.",
  alternates: { canonical: "/demo" },
  openGraph: {
    title: "See LeaguePour In Action",
    description: "A sample venue competition page - bracket, standings, and results.",
    url: "/demo",
  },
};

const DEMO_STANDINGS = [
  { rank: 1, team: "High Fives", w: 5, l: 1, pts: 15 },
  { rank: 2, team: "Pool Sharks", w: 4, l: 2, pts: 12 },
  { rank: 3, team: "Brew Crew", w: 3, l: 3, pts: 9 },
  { rank: 4, team: "Last Call", w: 2, l: 4, pts: 6 },
  { rank: 5, team: "Chalk Talk", w: 1, l: 5, pts: 3 },
];

const DEMO_RESULTS = [
  { round: "Round 5", match: "High Fives vs. Last Call", score: "3 - 1" },
  { round: "Round 5", match: "Pool Sharks vs. Chalk Talk", score: "3 - 0" },
  { round: "Round 4", match: "Brew Crew vs. High Fives", score: "1 - 3" },
];

// Same 8-team single-elimination bracket a venue would get from Start Tournament - built with the
// real bracket math (buildSingleEliminationRound1 / pairNextRound), just fed fictional names and
// never written to the database. Illustrates bracket *shape*, not a real result, so each round's
// "home" seed is carried forward mechanically rather than picking a winner - matching the same
// non-claim the sample-bracket preview inside the app itself makes.
const BRACKET_TEAMS: Participant[] = [
  "The Board Room",
  "Rack Attack",
  "Chalk Talk",
  "Last Call",
  "Brew Crew",
  "High Fives",
  "Pool Sharks",
  "Sharkbait",
].map((name, i) => ({ id: String(i), name }));

function buildDemoBracketRows() {
  const rows: { id: string; round: number; homeName: string; awayName: string | null; label: string | null }[] = [];
  let { pairings } = buildSingleEliminationRound1(BRACKET_TEAMS);
  let round = 1;
  while (pairings.length > 0) {
    for (const p of pairings) {
      rows.push({
        id: `${round}-${p.slot}`,
        round,
        homeName: p.home.name,
        awayName: p.away?.name ?? null,
        label: null,
      });
    }
    const winners = pairings.map((p) => p.home);
    if (pairings.length === 1) break;
    pairings = pairNextRound(winners);
    round += 1;
  }
  return rows;
}

export default async function DemoPage() {
  const bracketRows = buildDemoBracketRows();
  const qrDataUrl = await buildQrDataUrl(`${getPublicSiteUrl()}/demo`);
  return (
    <div className="lp-section mx-auto max-w-4xl px-4 md:px-6">
      <div className="text-center">
        <Badge variant="accent" className="mx-auto">Demo</Badge>
        <h1 className="lp-page-title mt-4 text-4xl md:text-5xl">See a LeaguePour venue in action</h1>
        <p className="lp-page-sub mx-auto mt-5 max-w-2xl text-lg text-lp-text-soft">
          Below is a sample competition page showing standings, results, and signup - the same
          kind of public page your venue gets on LeaguePour. All names and scores here are made up
          for illustration; this isn&apos;t a real venue or a real competition.
        </p>
      </div>

      {/* Sample venue header */}
      <div className="mt-14 rounded-2xl border border-lp-border bg-lp-surface/40 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="lp-kicker">Sample venue</p>
            <p className="mt-1 font-display text-2xl font-extrabold tracking-tight text-lp-text">The Alley House</p>
            <p className="mt-1 text-sm text-lp-text-soft">Wednesday Night Pool League - Round Robin</p>
          </div>
          <Badge variant="success">Signup open (demo)</Badge>
        </div>

        {/* Standings */}
        <div className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-lp-muted">Live standings</h2>
          <div className="mt-3 overflow-x-auto rounded-xl border border-lp-border">
            <table className="w-full min-w-[420px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-lp-border bg-lp-bg-elevated/60 text-lp-muted">
                  <th className="px-4 py-2.5 font-bold">#</th>
                  <th className="px-4 py-2.5 font-bold">Team</th>
                  <th className="px-4 py-2.5 font-bold">W</th>
                  <th className="px-4 py-2.5 font-bold">L</th>
                  <th className="px-4 py-2.5 font-bold">PTS</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_STANDINGS.map((row) => (
                  <tr key={row.rank} className="border-b border-lp-border/60 last:border-0">
                    <td className="px-4 py-2.5 font-bold text-lp-accent">{row.rank}</td>
                    <td className="px-4 py-2.5 font-semibold text-lp-text">{row.team}</td>
                    <td className="px-4 py-2.5 text-lp-text-soft">{row.w}</td>
                    <td className="px-4 py-2.5 text-lp-text-soft">{row.l}</td>
                    <td className="px-4 py-2.5 font-semibold text-lp-text">{row.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent results */}
        <div className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-lp-muted">Recent results</h2>
          <ul className="mt-3 space-y-2">
            {DEMO_RESULTS.map((r, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-xl border border-lp-border bg-lp-bg-elevated/40 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-lp-text">{r.match}</p>
                  <p className="text-xs text-lp-muted">{r.round}</p>
                </div>
                <p className="font-display font-bold text-lp-accent">{r.score}</p>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-center text-xs text-lp-muted">
          Sample data shown for demonstration only. This page updates automatically and can be
          displayed on a TV behind the bar as a live scoreboard.
        </p>
      </div>

      {/* Sample bracket + QR signup - a different sample competition, single elimination format */}
      <div className="mt-8 rounded-2xl border border-lp-border bg-lp-surface/40 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="lp-kicker">Sample venue</p>
            <p className="mt-1 font-display text-2xl font-extrabold tracking-tight text-lp-text">The Alley House</p>
            <p className="mt-1 text-sm text-lp-text-soft">Friday Night Darts Shootout - Single Elimination</p>
          </div>
          <Badge variant="accent">8-team bracket (demo)</Badge>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-lp-muted">Tournament bracket</h2>
            <BracketPreview title="Sample bracket" matches={bracketRows.map((r) => ({ ...r, homeScore: null, awayScore: null, completed: false }))} />
          </div>
          <div className="flex flex-col items-center gap-3 lg:w-48">
            <h2 className="text-sm font-bold uppercase tracking-widest text-lp-muted">Scan to sign up</h2>
            {/* eslint-disable-next-line @next/next/no-img-element -- a generated data: URL, not a static asset Next/Image can optimize */}
            <img src={qrDataUrl} alt="QR code linking to this demo page" className="size-40 rounded-xl border border-lp-border" />
            <p className="text-center text-xs text-lp-muted">
              A real, working QR code - scan it to open this page. On a real competition it links straight to team signup.
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-lp-muted">
          Sample bracket for illustration only - built with the same bracket logic every single-elimination
          competition uses, with placeholder team names.
        </p>
      </div>

      {/* What you're looking at */}
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-lp-border bg-lp-surface/40 p-5">
          <h2 className="font-semibold text-lp-text">What players see</h2>
          <p className="mt-2 text-sm text-lp-text-soft leading-relaxed">
            Players find this page from a link or QR code, register their team, and check back here
            to follow standings and results - no login needed just to view it, and no app to
            download.
          </p>
        </div>
        <div className="rounded-xl border border-lp-border bg-lp-surface/40 p-5">
          <h2 className="font-semibold text-lp-text">What venues control</h2>
          <p className="mt-2 text-sm text-lp-text-soft leading-relaxed">
            The venue sets the format, entry fee, and schedule when they create the competition, then
            enters match scores as the night happens. Everything above - the standings table, the
            results list - updates automatically from those scores.
          </p>
        </div>
        <div className="rounded-xl border border-lp-border bg-lp-surface/40 p-5">
          <h2 className="font-semibold text-lp-text">How standings work</h2>
          <p className="mt-2 text-sm text-lp-text-soft leading-relaxed">
            The table above uses the standard 3-1-0 points system (3 for a win, 1 for a tie),
            re-ranking automatically after every result.{" "}
            <Link href="/guides/how-standings-and-points-work" className="text-lp-accent hover:underline">
              Read how the scoring works →
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-14 rounded-2xl bg-lp-accent/10 border border-lp-accent/20 p-8 text-center">
        <h2 className="font-display text-2xl font-bold text-lp-text">Ready to set this up for your venue?</h2>
        <p className="mt-2 text-lp-text-soft">Free to start. Your own competition page in minutes.</p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/signup/venue">Start free</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/pricing">See pricing</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
