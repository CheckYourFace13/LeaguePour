import Link from "next/link";
import { BracketGenerator } from "@/components/marketing/tools/bracket-generator";
import { ToolPage, toolMetadata } from "@/components/marketing/tools/tool-page";

const PATH = "/tools/single-elimination-bracket-generator";

export const metadata = toolMetadata({
  path: PATH,
  title: "Free Single Elimination Bracket Generator (2-64 Teams) | LeaguePour",
  ogTitle: "Free single elimination bracket generator",
  description:
    "Paste your teams and get a printable single elimination bracket with byes placed automatically. Free, no signup, works on a phone - 2 to 64 entrants.",
});

const faqs = [
  {
    q: "How are byes decided?",
    a: "The bracket is sized to the next power of two (4, 8, 16, 32, 64). If you have fewer entrants than that, the difference is the number of byes, and they go to the first names in your list. Everyone else plays in Round 1, so Round 2 onward has no byes.",
  },
  {
    q: "How many matches will a single elimination tournament have?",
    a: "Always one fewer than the number of entrants, because every match eliminates exactly one. 16 teams is 15 matches; 11 teams is 10 matches.",
  },
  {
    q: "Can I seed the bracket?",
    a: "Yes - order is the seeding. Put your strongest entrants at the top of the list to give them the byes, or press Shuffle order for a random draw.",
  },
  {
    q: "Does this save my bracket?",
    a: "No. Nothing is stored or sent anywhere, and refreshing the page resets it. Print it or screenshot it to keep it.",
  },
];

export default function BracketGeneratorPage() {
  return (
    <ToolPage
      path={PATH}
      name="Single elimination bracket generator"
      title="Single elimination bracket generator"
      intro="Paste your teams or players, one per line, and get the full bracket: Round 1 matchups, who gets a bye, and how winners meet in each later round. Print it and tape it to the wall."
      faqs={faqs}
      article={
        <>
          <section>
            <h2>How the bracket is built</h2>
            <p>
              This uses the same logic LeaguePour runs for a live tournament. The bracket size is the
              next power of two at or above your entrant count. Any spare slots become first-round
              byes, given to the first names in your list. The remaining entrants are paired in order.
              From Round 2 on, winners meet in bracket order, so the path to the final is fixed
              before the first match is played.
            </p>
          </section>
          <section>
            <h2>When single elimination is the right format</h2>
            <ul>
              <li>• <strong>One night, limited boards or tables.</strong> It needs the fewest matches of any format.</li>
              <li>• <strong>A big or unpredictable field.</strong> It handles 9 teams as easily as 32.</li>
              <li>• <strong>You want a clear winner by closing time.</strong> Every round halves the field.</li>
            </ul>
            <p>
              The trade-off: half the field plays once and goes home. If you want everyone to get
              several games - a weekly league, or a small field - use a{" "}
              <Link href="/tools/round-robin-schedule-generator" className="font-semibold text-lp-accent hover:underline">round robin schedule</Link>{" "}
              instead. Our guide compares{" "}
              <Link href="/guides/round-robin-vs-single-elimination" className="font-semibold text-lp-accent hover:underline">round robin vs. single elimination</Link>{" "}
              in detail.
            </p>
          </section>
          <section>
            <h2>Tips for running it on the night</h2>
            <ul>
              <li>• Close signup before you build the bracket - a late entry changes the byes.</li>
              <li>• Number your boards or tables and write the match number next to each one.</li>
              <li>• Decide the tiebreak and the time limit per match before Round 1, not during it.</li>
              <li>• Announce who has a bye so those players know when they&apos;re actually up.</li>
            </ul>
          </section>
        </>
      }
    >
      <BracketGenerator />
    </ToolPage>
  );
}
