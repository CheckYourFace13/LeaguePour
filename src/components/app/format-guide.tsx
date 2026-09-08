import { FieldHelp } from "@/components/forms/field-help";
import type { BracketKind } from "@/generated/prisma/enums";

/**
 * Plain-language "how this format works" for a first-time organizer, keyed by the bracket/
 * standings style they picked at setup. Honest about what LeaguePour actually does today:
 * match/round setup is entered by the organizer on the Standings/brackets page (there is no
 * auto-generated bracket yet) - this explains the real workflow, not an aspirational one.
 */
const FORMAT_COPY: Record<BracketKind, { how: string; rounds: string; winner: string }> = {
  ROUND_ROBIN: {
    how: "Every team/player plays every other team/player once (or the number of times you set). There's no elimination - everyone keeps playing the full schedule.",
    rounds: "You decide the pairings for each round and enter results as they finish.",
    winner: "Whoever has the best record (or points) once every scheduled match is played.",
  },
  SINGLE_ELIMINATION: {
    how: "A bracket where one loss ends a team's run. Winners advance to the next round, losers are out.",
    rounds: "Each round is half the field of the round before it - set up the next round's matchups once the current round's results are in.",
    winner: "The team left standing after the final match.",
  },
  DOUBLE_ELIMINATION: {
    how: "Like single elimination, but a team isn't out until they've lost twice - a winners' bracket and a losers' bracket run side by side.",
    rounds: "More rounds than single elimination since eliminated teams get a second shot through the losers' bracket, until both brackets converge on a final.",
    winner: "Whoever wins the final match between the winners'-bracket champion and the losers'-bracket champion.",
  },
  LADDER: {
    how: "Teams/players are ranked on a ladder. A lower-ranked team can challenge one ranked just above them and swap positions if they win.",
    rounds: "There's no fixed round schedule - you record challenge results as they happen and standings update live.",
    winner: "Whoever holds the top rung when the competition period ends.",
  },
  SEASON: {
    how: "A recurring schedule across multiple weeks, tracked like a league - similar to round robin but spread over your set schedule instead of one night.",
    rounds: "Each week is its own round - enter that week's results, and the season standings carry the running total.",
    winner: "Whoever leads the season standings once the final week's results are in.",
  },
  POINTS: {
    how: "No bracket at all - every match or scoring event adds points to each team/player's total.",
    rounds: "You log each scoring event as it happens; there's no fixed round structure to advance through.",
    winner: "Whoever has the most points when the competition period ends.",
  },
  CUSTOM: {
    how: "You're running a custom or hybrid format - the House rules field on this competition is what players and staff should follow.",
    rounds: "Set up and record rounds/matches however fits your custom format.",
    winner: "Determined by whatever you defined in House rules.",
  },
};

export function FormatGuide({ bracketKind }: { bracketKind: BracketKind }) {
  const copy = FORMAT_COPY[bracketKind];
  return (
    <FieldHelp title="How this format works">
      <p>{copy.how}</p>
      <p>
        <span className="font-medium text-lp-text">Running each round:</span> {copy.rounds} Use{" "}
        <span className="font-medium text-lp-text">Add a match</span> below to create each round&apos;s
        matchups (LeaguePour doesn&apos;t generate a bracket automatically yet), then enter the score once
        a match is played - each score entry updates the leaderboard on the Standings page.
      </p>
      <p>
        <span className="font-medium text-lp-text">Winner:</span> {copy.winner}
      </p>
    </FieldHelp>
  );
}
