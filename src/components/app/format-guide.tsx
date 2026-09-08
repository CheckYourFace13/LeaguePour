import { FieldHelp } from "@/components/forms/field-help";
import type { BracketKind } from "@/generated/prisma/enums";

/**
 * Plain-language "how this format works" for a first-time organizer, keyed by the bracket/
 * standings style they picked at setup. Honest about what LeaguePour actually does today:
 * SINGLE_ELIMINATION and ROUND_ROBIN generate their own matches and standings automatically
 * (see the "Tournament control" card and src/lib/tournament.ts). Every other bracket kind has no
 * generation logic behind it yet and is no longer offered on the setup form for new competitions
 * - CUSTOM is the one exception, since "run it yourself" is its actual intended behavior, not a
 * missing feature.
 */
const FORMAT_COPY: Record<BracketKind, { how: string; rounds: string; winner: string }> = {
  ROUND_ROBIN: {
    how: "Every registered team/player plays every other one once. There's no elimination - everyone plays the full schedule.",
    rounds:
      "Press \"Start tournament\" once signup is closed and LeaguePour generates the complete round-by-round schedule automatically from your registrations - no matchup typing required.",
    winner:
      "Whoever has the best record once every scheduled match is played - standings update automatically as scores are entered, and the tournament completes itself.",
  },
  SINGLE_ELIMINATION: {
    how: "A bracket where one loss ends a team's run. Winners advance to the next round, losers are out.",
    rounds:
      "Press \"Start tournament\" to generate Round 1 automatically from your registrations (byes are handled automatically for odd counts). Once every match in a round has a score, press \"Advance to next round\" to generate the next round's matchups from that round's winners - no matchup typing required.",
    winner: "The team left standing after the final match - declared automatically when the final is scored.",
  },
  DOUBLE_ELIMINATION: {
    how: "Like single elimination, but a team isn't out until they've lost twice - a winners' bracket and a losers' bracket run side by side.",
    rounds:
      "Not supported for automatic generation yet - this bracket style isn't available when setting up a new competition. Edit this competition and switch to Single elimination or Round robin to get automatic match generation.",
    winner: "N/A until this format is supported.",
  },
  LADDER: {
    how: "Teams/players are ranked on a ladder. A lower-ranked team can challenge one ranked just above them and swap positions if they win.",
    rounds:
      "Not supported for automatic generation yet - this bracket style isn't available when setting up a new competition. Edit this competition and switch to Single elimination or Round robin to get automatic match generation.",
    winner: "N/A until this format is supported.",
  },
  SEASON: {
    how: "A recurring schedule across multiple weeks, tracked like a league.",
    rounds:
      "Not supported for automatic generation yet - this bracket style isn't available when setting up a new competition. Edit this competition and switch to Single elimination or Round robin to get automatic match generation.",
    winner: "N/A until this format is supported.",
  },
  POINTS: {
    how: "No bracket at all - every match or scoring event adds points to each team/player's total.",
    rounds:
      "Not supported for automatic generation yet - this bracket style isn't available when setting up a new competition. Edit this competition and switch to Single elimination or Round robin to get automatic match generation.",
    winner: "N/A until this format is supported.",
  },
  CUSTOM: {
    how: "You're running a custom or hybrid format - the House rules field on this competition is what players and staff should follow.",
    rounds: "This is intentionally manual: use \"Add a match\" below to create each round's matchups yourself, then enter scores as they're played.",
    winner: "Determined by whatever you defined in House rules.",
  },
};

export function FormatGuide({ bracketKind }: { bracketKind: BracketKind }) {
  const copy = FORMAT_COPY[bracketKind];
  return (
    <FieldHelp title="How this format works">
      <p>{copy.how}</p>
      <p>
        <span className="font-medium text-lp-text">Running each round:</span> {copy.rounds}
      </p>
      <p>
        <span className="font-medium text-lp-text">Winner:</span> {copy.winner}
      </p>
    </FieldHelp>
  );
}
