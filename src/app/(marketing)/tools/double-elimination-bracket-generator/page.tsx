import Link from "next/link";
import { DoubleEliminationGenerator } from "@/components/marketing/tools/double-elimination-generator";
import { ToolPage, toolMetadata } from "@/components/marketing/tools/tool-page";

const PATH = "/tools/double-elimination-bracket-generator";

export const metadata = toolMetadata({
  path: PATH,
  title: "Free Double Elimination Bracket Generator | LeaguePour",
  ogTitle: "Free double elimination bracket generator",
  description:
    "Build a double elimination bracket for 4 to 64 teams: winners and losers brackets, byes, grand final and reset. Enter results, print it or share a link. Free, no signup.",
});

const faqs = [
  {
    q: "How many matches does a double elimination tournament have?",
    a: "Twice the number of entrants, minus two: 16 teams is 30 matches. If the losers-bracket champion wins the grand final, one reset match makes it 31. Everyone except the champion loses exactly twice, and each match produces one loss.",
  },
  {
    q: "What is the grand final reset?",
    a: "The winners-bracket champion reaches the grand final with no losses, and the losers-bracket champion arrives with one. If the losers-bracket champion wins, both now have one loss, so they play once more for the title. If the winners-bracket champion wins the first match, the tournament is over.",
  },
  {
    q: "How are byes handled?",
    a: "The bracket is sized to the next power of two, and the first names in your list get the first-round byes, the same as our single elimination generator. A bye isn't a win or a loss. Because a bye produces no loser, some losers-bracket pairings have only one team, and that team moves on without playing.",
  },
  {
    q: "How does the share link work?",
    a: "The names and results are stored inside the link itself, after the # sign, and LeaguePour doesn't save the bracket. Anyone who gets the link can read every name in it, and the link can stay in browser history and in whatever app you send it through, so use team names or nicknames if you'd rather not share full names. Browsers leave that part out of page requests, but scripts on a page can read it, so our analytics doesn't run when a shared link is opened. Changes someone makes stay on their screen unless they share a new link.",
  },
  {
    q: "Can LeaguePour run double elimination for a live competition?",
    a: "Not yet. Automatic live brackets in LeaguePour are single elimination and round robin. You can use this page to plan and track a double elimination night, or run one by hand with the Custom format, where you add each match yourself.",
  },
];

export default function DoubleEliminationGeneratorPage() {
  return (
    <ToolPage
      path={PATH}
      name="Double elimination bracket generator"
      title="Double elimination bracket generator"
      intro="Enter 4 to 64 teams or players, one per line, and get the winners bracket, losers bracket and grand final. Tap each match winner to send both teams to their next match, then print the bracket or share a link."
      faqs={faqs}
      cta={{
        title: "Need signups and entry fees for the night?",
        body: "This page is a planning tool. LeaguePour's automatic live brackets are single elimination and round robin; double elimination isn't a live format yet. LeaguePour can still handle QR code signup and entry fees for your event, and its Custom format lets you enter each match by hand.",
        secondaryHref: "/features/tournaments",
        secondaryLabel: "See supported formats",
      }}
      article={
        <>
          <section>
            <h2>How the bracket works</h2>
            <p>
              Everyone starts in the winners bracket. Lose once and you drop to the losers bracket;
              lose again and you&apos;re out. Winners-bracket losers enter the losers bracket in a
              flipped order, which keeps them away from teams they just played for as long as the
              bracket allows. The two bracket champions meet in the grand final.
            </p>
          </section>
          <section>
            <h2>Matches to plan for</h2>
            <ul>
              <li>• <strong>4 entrants:</strong> 6 matches, 7 with a reset</li>
              <li>• <strong>8 entrants:</strong> 14 matches, 15 with a reset</li>
              <li>• <strong>16 entrants:</strong> 30 matches, 31 with a reset</li>
              <li>• <strong>32 entrants:</strong> 62 matches, 63 with a reset</li>
              <li>• <strong>64 entrants:</strong> 126 matches, 127 with a reset</li>
            </ul>
          </section>
          <section>
            <h2>When to choose double elimination</h2>
            <p>
              It guarantees every team at least two matches, so nobody&apos;s night ends after one bad
              game. The cost is about twice as many matches as a{" "}
              <Link href="/tools/single-elimination-bracket-generator" className="font-semibold text-lp-accent hover:underline">single elimination bracket</Link>.
              If you want everyone to play everyone, use a{" "}
              <Link href="/tools/round-robin-schedule-generator" className="font-semibold text-lp-accent hover:underline">round robin schedule</Link>{" "}
              instead. Our guide to{" "}
              <Link href="/guides/round-robin-vs-single-elimination" className="font-semibold text-lp-accent hover:underline">choosing a tournament format</Link>{" "}
              covers the trade-offs.
            </p>
          </section>
        </>
      }
    >
      <DoubleEliminationGenerator />
    </ToolPage>
  );
}
