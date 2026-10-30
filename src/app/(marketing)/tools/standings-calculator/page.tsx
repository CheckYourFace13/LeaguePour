import Link from "next/link";
import { StandingsCalculator } from "@/components/marketing/tools/standings-calculator";
import { ToolPage, toolMetadata } from "@/components/marketing/tools/tool-page";

const PATH = "/tools/standings-calculator";

export const metadata = toolMetadata({
  path: PATH,
  title: "Free League Standings Calculator | LeaguePour",
  ogTitle: "Free league standings calculator",
  description:
    "Enter match scores and get a ranked standings table with wins, losses, ties, score difference, and points (3 for a win, 1 for a tie). Free, printable, no signup.",
});

const faqs = [
  {
    q: "How are points awarded?",
    a: "3 points for a win, 1 point for a tie, and 0 for a loss - the same rule LeaguePour uses for its live standings.",
  },
  {
    q: "How are ties in the standings broken?",
    a: "Teams are sorted by points, then by number of wins. This calculator then uses score difference (points scored minus points allowed) as a final tiebreak. If your league uses head-to-head or another rule, apply it by hand for the tied teams.",
  },
  {
    q: "Can I use it for a game where there are no ties?",
    a: "Yes. If no match ends level, the tie column simply stays at zero and standings are effectively ranked by wins.",
  },
  {
    q: "Does this save my standings?",
    a: "No. Nothing is stored or sent anywhere, and refreshing the page resets it. Print it to post at the bar.",
  },
];

export default function StandingsCalculatorPage() {
  return (
    <ToolPage
      path={PATH}
      name="Standings calculator"
      title="League standings calculator"
      intro="List your teams, enter the scores, and get a ranked table: played, wins, losses, ties, score difference, and points. Handy for checking a spreadsheet or settling an argument at the bar."
      faqs={faqs}
      article={
        <>
          <section>
            <h2>How to use it</h2>
            <ul>
              <li>• Type your teams or players, one per line.</li>
              <li>• Press <strong>Fill round robin fixtures</strong> to list every matchup, or add results one at a time.</li>
              <li>• Enter the score for each match played. Matches without both scores are ignored.</li>
              <li>• The table re-ranks as you type. Print it when you&apos;re done.</li>
            </ul>
          </section>
          <section>
            <h2>Why 3 points for a win</h2>
            <p>
              With 2 points for a win and 1 for a tie, two ties are worth the same as a win and a loss,
              which rewards playing it safe. Three points for a win makes a win clearly worth more than
              two ties, so teams keep playing to win late in a close match. If your game never ends in
              a tie, the choice doesn&apos;t matter - standings come out in order of wins either way. Our
              guide to{" "}
              <Link href="/guides/how-standings-and-points-work" className="font-semibold text-lp-accent hover:underline">how standings and points work</Link>{" "}
              goes deeper.
            </p>
          </section>
          <section>
            <h2>Decide your tiebreak before the season</h2>
            <p>
              The argument is never about the points - it&apos;s about what happens when two teams finish
              level. Pick the order (wins, then score difference, then head-to-head, or whatever suits
              your game), write it on the league sheet, and announce it on night one. Need the
              fixtures first? Use the{" "}
              <Link href="/tools/round-robin-schedule-generator" className="font-semibold text-lp-accent hover:underline">round robin schedule generator</Link>.
            </p>
          </section>
        </>
      }
    >
      <StandingsCalculator />
    </ToolPage>
  );
}
