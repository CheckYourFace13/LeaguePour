import Link from "next/link";
import { RoundRobinScheduler } from "@/components/marketing/tools/round-robin-scheduler";
import { ToolPage, toolMetadata } from "@/components/marketing/tools/tool-page";

const PATH = "/tools/round-robin-schedule-generator";

export const metadata = toolMetadata({
  path: PATH,
  title: "Free Round Robin Schedule Generator for Leagues | LeaguePour",
  ogTitle: "Free round robin schedule generator",
  description:
    "Paste your teams and get a full round robin schedule where everyone plays everyone once, with rotating byes for odd numbers. Free, printable, no signup.",
});

const faqs = [
  {
    q: "How many rounds and matches does a round robin need?",
    a: "With an even number of teams, it takes one fewer round than there are teams. With an odd number, it takes as many rounds as teams, because one team sits out each round. Total matches are teams × (teams − 1) ÷ 2: 6 teams is 15 matches, 8 teams is 28.",
  },
  {
    q: "What happens with an odd number of teams?",
    a: "One team sits out each round on a rotating basis, and every team sits out exactly once. The schedule shows who sits out under each round.",
  },
  {
    q: "Can I run one round per week?",
    a: "Yes - that's the usual league format. Each round here is one league night, so the number of rounds is the length of your season before any playoffs.",
  },
  {
    q: "Does this save my schedule?",
    a: "No. Nothing is stored or sent anywhere, and refreshing the page resets it. Print it to keep it.",
  },
];

export default function RoundRobinGeneratorPage() {
  return (
    <ToolPage
      path={PATH}
      name="Round robin schedule generator"
      title="Round robin schedule generator"
      intro="Paste your teams or players, one per line, and get the whole season: every round, every matchup, and who sits out when the count is odd. Everyone plays everyone exactly once."
      faqs={faqs}
      article={
        <>
          <section>
            <h2>How the schedule is built</h2>
            <p>
              This uses the same &ldquo;circle method&rdquo; LeaguePour runs for a live league: one
              entrant stays fixed and the rest rotate one seat each round, which guarantees every
              pairing happens exactly once. The first-listed side of each match alternates by round.
              With an odd count, a phantom &ldquo;bye&rdquo; seat rotates too, and whoever is opposite
              it has the night off.
            </p>
          </section>
          <section>
            <h2>When round robin is the right format</h2>
            <ul>
              <li>• <strong>Weekly leagues.</strong> One round per night gives you a season of a known length.</li>
              <li>• <strong>Small fields.</strong> With 4 to 8 teams, everyone gets real playing time.</li>
              <li>• <strong>You want regulars back every week.</strong> Nobody is eliminated, so nobody stops coming.</li>
            </ul>
            <p>
              It gets long fast: 12 teams is 66 matches. For a big one-night field, a{" "}
              <Link href="/tools/single-elimination-bracket-generator" className="font-semibold text-lp-accent hover:underline">single elimination bracket</Link>{" "}
              is the practical choice. See{" "}
              <Link href="/guides/round-robin-vs-single-elimination" className="font-semibold text-lp-accent hover:underline">round robin vs. single elimination</Link>{" "}
              for the trade-offs.
            </p>
          </section>
          <section>
            <h2>Planning the season around it</h2>
            <ul>
              <li>• Count your boards or tables: matches per round ÷ boards = how many waves each night needs.</li>
              <li>• Decide the standings rule up front. LeaguePour uses 3 points for a win, 1 for a tie, 0 for a loss - try it in the{" "}
                <Link href="/tools/standings-calculator" className="font-semibold text-lp-accent hover:underline">standings calculator</Link>.</li>
              <li>• Have a forfeit rule for missed weeks before the season starts. Our guide to{" "}
                <Link href="/guides/managing-no-shows-and-forfeits" className="font-semibold text-lp-accent hover:underline">no-shows and forfeits</Link> covers the options.</li>
            </ul>
          </section>
        </>
      }
    >
      <RoundRobinScheduler />
    </ToolPage>
  );
}
