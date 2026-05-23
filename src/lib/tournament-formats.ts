/**
 * Established tournament formats — product roadmap + marketing copy source of truth.
 * Status reflects the current codebase (competition builder, Match, Standing models).
 */

import type { BracketKind } from "@/generated/prisma/enums";

export type FormatStatus = "Live" | "Designed for" | "Planned" | "Roadmap";

export type TournamentFormatDef = {
  id: string;
  name: string;
  status: FormatStatus;
  /** Short picker label on /features/tournaments */
  pickerLabel?: string;
  bestFor: string;
  summary: string;
  /** What works in LeaguePour today */
  liveToday: string;
  /** What the bracket engine still needs */
  engineNext: string;
  bracketKind?: BracketKind;
};

export const TOURNAMENT_FORMATS: TournamentFormatDef[] = [
  {
    id: "single-elimination",
    name: "Single elimination",
    status: "Designed for",
    pickerLabel: "Fastest night: Single elimination",
    bestFor: "Fast one-night events — one loss and out. Good when speed matters.",
    summary: "Classic knockout bracket. Winner advances; loser is done.",
    liveToday:
      "Select Single elimination when creating a competition. Enter match rows and scores in the venue dashboard; bracket cards appear on Standings when teams are assigned to matches.",
    engineNext:
      "Auto-generate seeds and bracket tree from registrations, advance winners automatically, and support printable bracket layouts.",
    bracketKind: "SINGLE_ELIMINATION",
  },
  {
    id: "double-elimination",
    name: "Double elimination",
    status: "Designed for",
    pickerLabel: "Most fair for competitive events: Double elimination",
    bestFor: "Competitive bar tournaments — common for darts, pool, cornhole, and esports-style nights.",
    summary: "Winners bracket and losers bracket; optional grand final reset when the losers-bracket champion beats the winners-bracket champion.",
    liveToday:
      "Select Double elimination as the competition format. Track matches and scores manually; use match labels for winners vs losers bracket rounds.",
    engineNext:
      "Auto-build winners/losers trees, route losers correctly, and handle grand final reset rules.",
    bracketKind: "DOUBLE_ELIMINATION",
  },
  {
    id: "round-robin",
    name: "Round robin",
    status: "Designed for",
    pickerLabel: "Everyone plays more: Round robin",
    bestFor: "Small leagues or groups where everyone should play everyone.",
    summary: "Balanced schedule — supports points, wins/losses, ties, and standings-based tiebreakers.",
    liveToday:
      "Select Round robin and maintain standings (wins, losses, ties, points, rank) from the venue dashboard. Ideal when you schedule rounds yourself.",
    engineNext:
      "Auto-generate round-robin schedules, apply point differential and head-to-head tiebreakers, and surface standings on public pages.",
    bracketKind: "ROUND_ROBIN",
  },
  {
    id: "pool-play-playoffs",
    name: "Pool play into playoff bracket",
    status: "Planned",
    pickerLabel: "Best for medium events: Pool play into playoffs",
    bestFor: "Medium/large tournaments — teams split into pools, round robin within each pool, top teams advance to elimination playoffs.",
    summary: "Group stage → single or double elimination playoff.",
    liveToday:
      "Run pool stages using Season or Custom format plus standings tables today; playoff bracket is managed manually.",
    engineNext:
      "Pool assignment, per-pool standings, advancement rules, and one-click playoff bracket generation.",
  },
  {
    id: "swiss",
    name: "Swiss",
    status: "Roadmap",
    pickerLabel: "Best for large events: Swiss",
    bestFor: "Larger fields where everyone should play multiple rounds but full round robin is too large.",
    summary: "Pair teams with similar records each round; avoid repeat matchups where possible; optional top cut into playoffs.",
    liveToday: "Not a bracket kind in the builder yet — use Custom or Round robin for smaller fields until Swiss pairing ships.",
    engineNext: "Swiss pairing by record, rematch avoidance, round caps, and optional playoff cut.",
  },
  {
    id: "ladder",
    name: "Ladder / challenge ladder",
    status: "Designed for",
    bestFor: "Ongoing venue rankings — players or teams challenge nearby ranked opponents (darts, pool, bags, chess).",
    summary: "Ranked ladder with challenge rules instead of a fixed bracket night.",
    liveToday: "Select Ladder as the format and maintain standings over time. Challenge flow and rank swaps are manual today.",
    engineNext: "Challenge requests, rank swap rules, inactivity drops, and public ladder boards.",
    bracketKind: "LADDER",
  },
  {
    id: "points-race",
    name: "Points race / leaderboard season",
    status: "Designed for",
    pickerLabel: "Best for recurring nights: Points race / leaderboard season",
    bestFor: "Trivia, music bingo, recurring league nights, and long-running venue competitions.",
    summary: "Accumulate points across multiple dates; weekly results, season totals, prizes, and optional playoffs.",
    liveToday:
      "Select Points leaderboard or Season standings. Update standings rows across weeks; describe prizes in rules and prize structure.",
    engineNext: "Weekly score import, season splits, automatic playoff seeding from season totals.",
    bracketKind: "POINTS",
  },
  {
    id: "best-of-series",
    name: "Best-of series",
    status: "Roadmap",
    bestFor: "Playoff rounds or competitive sets — best-of-1, 3, 5, or 7 (darts sets, pool races, finals).",
    summary: "A match is a series of games; first to required wins advances.",
    liveToday: "Track as a single match row with aggregate score today, or split into labeled sub-matches manually.",
    engineNext: "Best-of-N match type, per-leg scoring, and series win detection.",
  },
  {
    id: "consolation",
    name: "Consolation bracket",
    status: "Roadmap",
    bestFor: "Keeping eliminated teams playing so the venue stays busy longer.",
    summary: "Optional secondary bracket for non-medal teams.",
    liveToday: "Run as a separate competition or manual match labels until consolation trees are built in.",
    engineNext: "Opt-in consolation bracket alongside main elimination.",
  },
  {
    id: "third-place",
    name: "Third-place match",
    status: "Roadmap",
    bestFor: "Prize tournaments that award top three.",
    summary: "Semifinal losers play for bronze.",
    liveToday: "Add a labeled match row for the third-place game on the competition page.",
    engineNext: "Auto-create third-place match when elimination bracket reaches semifinals.",
  },
];

export type WizardRecommendation = {
  scenario: string;
  inputs: string;
  recommends: string;
  formatId: string;
  status: FormatStatus;
};

/** Smart setup wizard — recommendations (engine: Planned). */
export const FORMAT_WIZARD_EXAMPLES: WizardRecommendation[] = [
  {
    scenario: "8 teams, 2 hours, one-night darts",
    inputs: "8 teams · ~2 hours · one night · darts",
    recommends: "Single elimination",
    formatId: "single-elimination",
    status: "Designed for",
  },
  {
    scenario: "16 teams, competitive cornhole",
    inputs: "16 teams · competitive · cornhole",
    recommends: "Double elimination",
    formatId: "double-elimination",
    status: "Designed for",
  },
  {
    scenario: "12 teams, patio tournament",
    inputs: "12 teams · patio · medium field",
    recommends: "Pool play into playoff bracket",
    formatId: "pool-play-playoffs",
    status: "Planned",
  },
  {
    scenario: "20+ teams, everyone needs multiple games",
    inputs: "20+ teams · multiple games each",
    recommends: "Swiss → playoff cut",
    formatId: "swiss",
    status: "Roadmap",
  },
  {
    scenario: "6 teams, weekly pool league",
    inputs: "6 teams · weekly · recurring",
    recommends: "Round robin season",
    formatId: "round-robin",
    status: "Designed for",
  },
  {
    scenario: "Weekly trivia",
    inputs: "Weekly · recurring · points",
    recommends: "Points race / leaderboard season",
    formatId: "points-race",
    status: "Designed for",
  },
];

export const BRACKET_ENGINE_ROADMAP = [
  "Auto-generate brackets from confirmed registrations (single, double, round robin)",
  "Drag-and-drop seeding and bulk participant import",
  "Pool play groups with advancement into elimination playoffs",
  "Swiss pairing with rematch limits and optional top cut",
  "Best-of-3 / best-of-5 series matches",
  "Consolation bracket and third-place match options",
  "Grand final reset for double elimination",
  "Station/board assignment and public queue display",
  "Smart format wizard in the competition builder",
] as const;

export function getFormatById(id: string): TournamentFormatDef | undefined {
  return TOURNAMENT_FORMATS.find((f) => f.id === id);
}

export function formatsWithPickerLabels(): TournamentFormatDef[] {
  return TOURNAMENT_FORMATS.filter((f) => f.pickerLabel);
}
