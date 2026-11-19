import { createHash } from "node:crypto";
import type { Prisma } from "@/generated/prisma/client";
import { CompetitionStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { pairNextRound } from "@/lib/tournament";

/**
 * Result entry for live single-elimination brackets.
 *
 * Match rows carry no pointer to the match that feeds them: a match's place in the bracket is its
 * position inside its round (rows sort by round, then by chronologically ordered id). So slot s of
 * a round is fed by slots 2s and 2s+1 of the round before it. Corrections therefore update rows in
 * place - deleting and recreating one would move it to the end of its round and scramble the
 * bracket. From round 2 on a missing team means "waiting on an earlier result"; only round 1 can
 * contain a bye.
 */

export type BracketMatch = {
  id: string;
  round: number;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeScore: number | null;
  awayScore: number | null;
  completedAt: Date | null;
};

export type BracketStanding = {
  id: string;
  teamId: string | null;
  rank: number | null;
  wins: number;
  losses: number;
  ties: number;
  points: number;
};

export type BracketRanks = { championId: string | null; runnerUpId: string | null };

export type LaterMatchChange = {
  id: string;
  round: number;
  homeBefore: string | null;
  awayBefore: string | null;
  homeAfter: string | null;
  awayAfter: string | null;
  scoreBefore: { home: number; away: number } | null;
  clearsResult: boolean;
};

export type ScorePlan =
  | { kind: "not-found" | "not-ready" | "unsupported" | "locked" }
  | {
      kind: "save";
      match: BracketMatch;
      homeScore: number;
      awayScore: number;
      winnerBefore: string | null;
      winnerAfter: string | null;
      laterChanges: LaterMatchChange[];
      ranksBefore: BracketRanks;
      ranksAfter: BracketRanks;
      statusBefore: CompetitionStatus;
      statusAfter: CompetitionStatus;
      requiresConfirmation: boolean;
      fingerprint: string;
    };

export function isSingleEliminationBye(m: Pick<BracketMatch, "round" | "homeTeamId" | "awayTeamId">): boolean {
  return m.round === 1 && m.homeTeamId !== null && m.awayTeamId === null;
}

function hasResult(m: BracketMatch): boolean {
  return m.completedAt !== null && m.homeScore !== null && m.awayScore !== null;
}

/** A stored tie goes to the away side: that is how such a result advanced before ties were rejected. */
function winnerOf(m: BracketMatch): string | null {
  if (isSingleEliminationBye(m)) return m.homeTeamId;
  if (!hasResult(m) || !m.homeTeamId || !m.awayTeamId) return null;
  return m.homeScore! > m.awayScore! ? m.homeTeamId : m.awayTeamId;
}

function compareIds(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Rounds in slot order, or null when the rows aren't the shape the bracket engine generates. */
function bracketRounds(matches: BracketMatch[]): BracketMatch[][] | null {
  if (matches.length === 0) return null;
  const sorted = [...matches].sort((a, b) => a.round - b.round || compareIds(a.id, b.id));
  const rounds: BracketMatch[][] = [];
  for (const m of sorted) {
    if (m.round === rounds.length) rounds[rounds.length - 1].push(m);
    else if (m.round === rounds.length + 1) rounds.push([m]);
    else return null;
  }
  const first = rounds[0];
  if ((first.length & (first.length - 1)) !== 0 || first.some((m) => !m.homeTeamId)) return null;
  for (let r = 1; r < rounds.length; r++) {
    if (rounds[r].length * 2 !== rounds[r - 1].length) return null;
  }
  return rounds;
}

function expectedSides(rounds: BracketMatch[][], round: number, slot: number) {
  const feeders = rounds[round - 1];
  return { home: winnerOf(feeders[slot * 2]), away: winnerOf(feeders[slot * 2 + 1]) };
}

function storedRanks(standings: BracketStanding[]): BracketRanks {
  const teamAt = (rank: number) => standings.find((s) => s.rank === rank)?.teamId ?? null;
  return { championId: teamAt(1), runnerUpId: teamAt(2) };
}

/** Champion and runner-up the matches support, or null while any result is still missing. */
function finishedRanks(rounds: BracketMatch[][]): BracketRanks | null {
  const last = rounds[rounds.length - 1];
  if (last.length !== 1 || rounds.some((round) => round.some((m) => winnerOf(m) === null))) return null;
  const final = last[0];
  const championId = winnerOf(final);
  return { championId, runnerUpId: final.homeTeamId === championId ? final.awayTeamId : final.homeTeamId };
}

/**
 * Matches whose saved result disagrees with what the bracket shows after them - left behind by
 * score edits made before corrections were reconciled. Saving one of them runs the normal
 * confirmation and repairs everything downstream.
 */
export function findBracketMismatches(input: {
  status: CompetitionStatus;
  matches: BracketMatch[];
  standings: BracketStanding[];
}): string[] {
  const rounds = bracketRounds(input.matches);
  if (!rounds) return [];
  const found = new Set<string>();
  for (let r = 1; r < rounds.length; r++) {
    rounds[r].forEach((m, slot) => {
      const expected = expectedSides(rounds, r, slot);
      if (m.homeTeamId !== expected.home) found.add(rounds[r - 1][slot * 2].id);
      if (m.awayTeamId !== expected.away) found.add(rounds[r - 1][slot * 2 + 1].id);
    });
  }
  if (input.status === CompetitionStatus.COMPLETED) {
    const final = rounds[rounds.length - 1];
    const stored = storedRanks(input.standings);
    if (final.length === 1 && winnerOf(final[0]) !== stored.championId) found.add(final[0].id);
  }
  return [...found];
}

/**
 * Works out everything saving this score would change, without writing anything. Only the path
 * from the saved match to the final can be affected, and the walk stops as soon as a later match
 * keeps both of its teams - every other result in the bracket stands.
 */
export function planSingleEliminationScore(input: {
  status: CompetitionStatus;
  matches: BracketMatch[];
  standings: BracketStanding[];
  matchId: string;
  homeScore: number;
  awayScore: number;
}): ScorePlan {
  const { status, matchId, homeScore, awayScore } = input;
  const match = input.matches.find((m) => m.id === matchId);
  if (!match) return { kind: "not-found" };

  const saved: BracketMatch = { ...match, homeScore, awayScore, completedAt: match.completedAt ?? new Date(0) };
  const winnerBefore = winnerOf(match);
  const winnerAfter = winnerOf(saved);
  const ranksBefore = storedRanks(input.standings);
  const laterChanges: LaterMatchChange[] = [];
  let ranksAfter = ranksBefore;
  let statusAfter = status;

  const rounds = bracketRounds(input.matches);
  if (rounds) {
    if (!match.homeTeamId || (!match.awayTeamId && !isSingleEliminationBye(match))) return { kind: "not-ready" };

    const next = rounds.map((round) => round.map((m) => (m.id === matchId ? saved : { ...m })));
    let round = match.round - 1;
    let slot = rounds[round].findIndex((m) => m.id === matchId);
    while (round + 1 < next.length) {
      round += 1;
      slot = Math.floor(slot / 2);
      const later = next[round][slot];
      const expected = expectedSides(next, round, slot);
      if (later.homeTeamId === expected.home && later.awayTeamId === expected.away) break;
      const hadResult = later.completedAt !== null || later.homeScore !== null || later.awayScore !== null;
      laterChanges.push({
        id: later.id,
        round: later.round,
        homeBefore: later.homeTeamId,
        awayBefore: later.awayTeamId,
        homeAfter: expected.home,
        awayAfter: expected.away,
        scoreBefore:
          later.homeScore !== null && later.awayScore !== null ? { home: later.homeScore, away: later.awayScore } : null,
        clearsResult: hadResult,
      });
      Object.assign(later, {
        homeTeamId: expected.home,
        awayTeamId: expected.away,
        homeScore: null,
        awayScore: null,
        completedAt: null,
      });
    }

    if (status === CompetitionStatus.COMPLETED) {
      const finished = finishedRanks(next);
      ranksAfter = finished ?? { championId: null, runnerUpId: null };
      if (!finished) statusAfter = CompetitionStatus.IN_PROGRESS;
    }
  } else {
    // Rows the engine didn't generate: scores still save, but there is no reliable way to tell
    // which later match a changed winner feeds, so that one change is refused rather than guessed.
    const hasLaterRounds = input.matches.some((m) => m.round > match.round);
    const changesWinner = winnerBefore !== null && winnerBefore !== winnerAfter;
    if (changesWinner && (hasLaterRounds || status === CompetitionStatus.COMPLETED)) return { kind: "unsupported" };
  }

  const ranksChange =
    ranksBefore.championId !== ranksAfter.championId || ranksBefore.runnerUpId !== ranksAfter.runnerUpId;
  // Filling an empty slot destroys nothing. Replacing a team, clearing a result, or changing the
  // outcome of a finished event does, so staff see it first.
  const requiresConfirmation =
    ranksChange ||
    statusAfter !== status ||
    laterChanges.some((c) => c.clearsResult || (c.homeBefore && c.homeBefore !== c.homeAfter) || (c.awayBefore && c.awayBefore !== c.awayAfter));
  if (requiresConfirmation && status !== CompetitionStatus.IN_PROGRESS && status !== CompetitionStatus.COMPLETED) {
    return { kind: "locked" };
  }

  // Binds a confirmation to exactly what was shown: any change to it invalidates the confirmation.
  const fingerprint = createHash("sha256")
    .update(
      JSON.stringify([
        matchId,
        homeScore,
        awayScore,
        match.homeScore,
        match.awayScore,
        laterChanges,
        ranksBefore,
        ranksAfter,
        status,
        statusAfter,
      ]),
    )
    .digest("hex")
    .slice(0, 32);

  return {
    kind: "save",
    match,
    homeScore,
    awayScore,
    winnerBefore,
    winnerAfter,
    laterChanges,
    ranksBefore,
    ranksAfter,
    statusBefore: status,
    statusAfter,
    requiresConfirmation,
    fingerprint,
  };
}

/** Serializes every result write for one bracket until the transaction ends. */
async function lockBracket(tx: Prisma.TransactionClient, competitionId: string) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`lp-bracket:${competitionId}`}, 0))`;
}

function loadBracket(tx: Prisma.TransactionClient, competitionId: string, venueId: string) {
  return tx.competition.findFirst({
    where: { id: competitionId, venueId },
    select: { slug: true, status: true, bracketKind: true, matches: true, standings: true },
  });
}

async function setRank(tx: Prisma.TransactionClient, competitionId: string, teamId: string, rank: number) {
  const row = await tx.standing.findFirst({ where: { competitionId, teamId } });
  if (row) await tx.standing.update({ where: { id: row.id }, data: { rank } });
  else await tx.standing.create({ data: { competitionId, teamId, rank, wins: rank === 1 ? 1 : 0 } });
}

/**
 * Rows the bracket generated on completion are removed; a row staff have since edited keeps its
 * numbers and only loses its rank.
 */
async function clearRanks(tx: Prisma.TransactionClient, standings: BracketStanding[]) {
  for (const s of standings) {
    if (s.rank === null) continue;
    const untouched = s.wins === (s.rank === 1 ? 1 : 0) && s.losses === 0 && s.ties === 0 && s.points === 0;
    if (untouched) await tx.standing.delete({ where: { id: s.id } });
    else await tx.standing.update({ where: { id: s.id }, data: { rank: null } });
  }
}

export type SaveScoreResult =
  | { kind: "not-found" | "not-ready" | "unsupported" | "locked" | "needs-confirmation" | "changed" | "saved" }
  | { kind: "corrected"; competitionSlug: string };

export async function saveSingleEliminationScore(input: {
  competitionId: string;
  venueId: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  confirmFingerprint: string | null;
}): Promise<SaveScoreResult> {
  const { competitionId, venueId, matchId, homeScore, awayScore, confirmFingerprint } = input;
  return prisma.$transaction(async (tx) => {
    await lockBracket(tx, competitionId);
    const comp = await loadBracket(tx, competitionId, venueId);
    if (!comp) return { kind: "not-found" };

    const plan = planSingleEliminationScore({
      status: comp.status,
      matches: comp.matches,
      standings: comp.standings,
      matchId,
      homeScore,
      awayScore,
    });
    if (plan.kind !== "save") return { kind: plan.kind };
    if (plan.requiresConfirmation && confirmFingerprint !== plan.fingerprint) {
      return { kind: confirmFingerprint ? "changed" : "needs-confirmation" };
    }

    await tx.match.update({ where: { id: matchId }, data: { homeScore, awayScore, completedAt: new Date() } });
    for (const change of plan.laterChanges) {
      await tx.match.update({
        where: { id: change.id },
        data: {
          homeTeamId: change.homeAfter,
          awayTeamId: change.awayAfter,
          homeScore: null,
          awayScore: null,
          completedAt: null,
        },
      });
    }
    if (
      plan.ranksBefore.championId !== plan.ranksAfter.championId ||
      plan.ranksBefore.runnerUpId !== plan.ranksAfter.runnerUpId
    ) {
      await clearRanks(tx, comp.standings);
      if (plan.ranksAfter.championId) await setRank(tx, competitionId, plan.ranksAfter.championId, 1);
      if (plan.ranksAfter.runnerUpId) await setRank(tx, competitionId, plan.ranksAfter.runnerUpId, 2);
    }
    if (plan.statusAfter !== plan.statusBefore) {
      await tx.competition.update({ where: { id: competitionId }, data: { status: plan.statusAfter } });
    }
    return plan.requiresConfirmation ? { kind: "corrected", competitionSlug: comp.slug } : { kind: "saved" };
  });
}

export type AdvanceResult =
  | "not-found"
  | "cannot-advance"
  | "not-started"
  | "bracket-out-of-sync"
  | "round-not-complete"
  | "tournament-completed"
  | "round-advanced";

/**
 * Generates the next round from the latest round's winners or, when that round was the final,
 * records the champion and completes the competition. Requires every match in the latest round to
 * have a result, so a repeated click finds the new round unplayed and changes nothing.
 */
export async function advanceSingleEliminationRound(competitionId: string, venueId: string): Promise<AdvanceResult> {
  return prisma.$transaction(async (tx) => {
    await lockBracket(tx, competitionId);
    const comp = await loadBracket(tx, competitionId, venueId);
    if (!comp) return "not-found";
    if (comp.status !== CompetitionStatus.IN_PROGRESS || comp.bracketKind !== "SINGLE_ELIMINATION") {
      return "cannot-advance";
    }
    if (comp.matches.length === 0) return "not-started";
    if (findBracketMismatches(comp).length > 0) return "bracket-out-of-sync";

    const currentRound = Math.max(...comp.matches.map((m) => m.round));
    const current = comp.matches
      .filter((m) => m.round === currentRound)
      .sort((a, b) => compareIds(a.id, b.id));
    const winners = current.map(winnerOf);
    if (current.some((m) => !hasResult(m)) || winners.some((w) => w === null)) return "round-not-complete";

    if (current.length === 1) {
      const championId = winners[0]!;
      const final = current[0];
      await setRank(tx, competitionId, championId, 1);
      const runnerUpId = final.homeTeamId === championId ? final.awayTeamId : final.homeTeamId;
      if (runnerUpId) await setRank(tx, competitionId, runnerUpId, 2);
      await tx.competition.update({ where: { id: competitionId }, data: { status: CompetitionStatus.COMPLETED } });
      return "tournament-completed";
    }

    // Created one at a time so id order - and therefore bracket slot order - is preserved.
    for (const pairing of pairNextRound(winners.map((id) => ({ id: id!, name: id! })))) {
      await tx.match.create({
        data: { competitionId, round: currentRound + 1, homeTeamId: pairing.home.id, awayTeamId: pairing.away?.id ?? null },
      });
    }
    return "round-advanced";
  });
}
