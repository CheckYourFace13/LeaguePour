/**
 * Pure double-elimination bracket math for the free /tools generator. Nothing here is wired to live
 * competitions: LeaguePour's competition engine runs SINGLE_ELIMINATION and ROUND_ROBIN only (see
 * tournament.ts). The winners bracket starts from the same round-1 builder as those brackets, so
 * byes and pairing order match the single elimination tool.
 *
 * Structure for a bracket of size P = 2^k: k winners rounds, 2(k - 1) losers rounds, then the grand
 * final. A pairing missing a side (a first-round bye, or a losers pairing fed by one) is not a
 * match: whoever is present moves on without playing. That always leaves 2n - 2 matches before the
 * grand final's possible reset: every entrant but the champion loses twice, and the champion loses
 * at most once.
 */
import { buildSingleEliminationRound1, type Participant } from "@/lib/tournament";

export const DE_MIN_ENTRANTS = 4;
export const DE_MAX_ENTRANTS = 64;
const MAX_SHARED_NAME_LENGTH = 80;
/** Fits 64 maximum-length names in any script, and bounds the work done on an untrusted link. */
const MAX_SHARE_PAYLOAD_LENGTH = 48_000;

export type DeSource =
  | { kind: "entrant"; entrant: number }
  | { kind: "winner"; match: number }
  | { kind: "loser"; match: number };

export type DeMatch = {
  /** 1-based and in a playable order: a match only depends on lower-numbered matches. */
  id: number;
  bracket: "winners" | "losers" | "final";
  a: DeSource;
  b: DeSource;
  isReset: boolean;
};

export type DeRound = { key: string; label: string; bracket: DeMatch["bracket"]; matches: DeMatch[] };

export type DeBracket = {
  entrantCount: number;
  bracketSize: number;
  /** Entrant indexes that skip winners round 1. */
  byes: number[];
  matches: DeMatch[];
  rounds: DeRound[];
  grandFinalId: number;
  resetId: number;
};

/** 0 = undecided, 1 = side a won, 2 = side b won. Indexed by match id - 1. */
export type DePick = 0 | 1 | 2;

export type DeMatchState = {
  a: number | null;
  b: number | null;
  winner: number | null;
  loser: number | null;
  side: DePick;
  /** False only for the reset when the winners-bracket champion has already won the grand final. */
  needed: boolean;
};

export type DeResult = {
  states: DeMatchState[];
  champion: number | null;
  runnerUp: number | null;
  /** Losses per entrant so far. */
  losses: number[];
  decided: number;
  /** Matches this bracket needs given the results so far. */
  required: number;
};

function pairAdjacent<T>(items: T[]): [T, T][] {
  const pairs: [T, T][] = [];
  for (let i = 0; i < items.length; i += 2) pairs.push([items[i], items[i + 1]]);
  return pairs;
}

/**
 * Where a winners round's losers land in the losers bracket. Flipping or rotating each drop keeps
 * them away from the side of the bracket they just came from, which delays rematches.
 */
function dropOrder<T>(losers: T[], dropRound: number): T[] {
  if (dropRound % 2 === 1) return [...losers].reverse();
  const half = losers.length / 2;
  return [...losers.slice(half), ...losers.slice(0, half)];
}

export function buildDoubleElimination(entrantCount: number): DeBracket {
  if (!Number.isInteger(entrantCount) || entrantCount < DE_MIN_ENTRANTS || entrantCount > DE_MAX_ENTRANTS) {
    throw new RangeError(`Double elimination needs ${DE_MIN_ENTRANTS}-${DE_MAX_ENTRANTS} entrants`);
  }
  const participants: Participant[] = Array.from({ length: entrantCount }, (_, i) => ({ id: String(i), name: "" }));
  const { bracketSize, pairings } = buildSingleEliminationRound1(participants);
  const roundsTotal = Math.log2(bracketSize);

  const matches: DeMatch[] = [];
  const rounds: DeRound[] = [];
  let winnersRound = 0;
  let losersRound = 0;

  /** Adds one round, skipping pairings without two sides, and returns who moves on from each. */
  const addRound = (bracket: DeMatch["bracket"], pairs: [DeSource | null, DeSource | null][], isReset = false) => {
    const round: DeMatch[] = [];
    const winners: (DeSource | null)[] = [];
    const losers: (DeSource | null)[] = [];
    for (const [a, b] of pairs) {
      if (a && b) {
        const match: DeMatch = { id: matches.length + 1, bracket, a, b, isReset };
        matches.push(match);
        round.push(match);
        winners.push({ kind: "winner", match: match.id });
        losers.push({ kind: "loser", match: match.id });
      } else {
        winners.push(a ?? b);
        losers.push(null);
      }
    }
    if (round.length > 0) {
      const n = bracket === "winners" ? ++winnersRound : bracket === "losers" ? ++losersRound : 0;
      const label =
        bracket === "final" ? (isReset ? "Grand final reset" : "Grand final") : `${bracket === "winners" ? "Winners" : "Losers"} round ${n}`;
      rounds.push({ key: `${bracket}-${n}-${isReset ? "reset" : "main"}`, label, bracket, matches: round });
    }
    return { winners, losers };
  };

  const first = addRound(
    "winners",
    pairings.map((p) => [
      { kind: "entrant", entrant: Number(p.home.id) },
      p.away ? { kind: "entrant", entrant: Number(p.away.id) } : null,
    ]),
  );
  let winnersAlive = first.winners;
  let losersAlive = addRound("losers", pairAdjacent(first.losers)).winners;

  for (let drop = 1; drop < roundsTotal; drop++) {
    const winners = addRound("winners", pairAdjacent(winnersAlive));
    winnersAlive = winners.winners;
    const dropped = dropOrder(winners.losers, drop);
    losersAlive = addRound(
      "losers",
      losersAlive.map((survivor, i): [DeSource | null, DeSource | null] => [dropped[i], survivor]),
    ).winners;
    if (drop < roundsTotal - 1) losersAlive = addRound("losers", pairAdjacent(losersAlive)).winners;
  }

  const finalists: [DeSource | null, DeSource | null] = [winnersAlive[0], losersAlive[0]];
  addRound("final", [finalists]);
  const grandFinalId = matches.length;
  addRound("final", [finalists], true);

  const lastOf = (bracket: DeMatch["bracket"]) => rounds.filter((r) => r.bracket === bracket).at(-1);
  lastOf("winners")!.label = "Winners final";
  lastOf("losers")!.label = "Losers final";

  return {
    entrantCount,
    bracketSize,
    byes: pairings.filter((p) => !p.away).map((p) => Number(p.home.id)),
    matches,
    rounds,
    grandFinalId,
    resetId: matches.length,
  };
}

export function emptyPicks(bracket: DeBracket): DePick[] {
  return bracket.matches.map(() => 0);
}

/** Works out every match from the picks. A pick on a match that can't be played yet is ignored. */
export function resolveBracket(bracket: DeBracket, picks: readonly DePick[]): DeResult {
  const states: DeMatchState[] = [];
  const value = (source: DeSource): number | null => {
    if (source.kind === "entrant") return source.entrant;
    const state = states[source.match - 1];
    return source.kind === "winner" ? state.winner : state.loser;
  };

  for (const match of bracket.matches) {
    const a = value(match.a);
    const b = value(match.b);
    // The reset is played only if the losers-bracket champion won the first grand final.
    const needed = !match.isReset || states[bracket.grandFinalId - 1].side === 2;
    const pick = picks[match.id - 1];
    const side: DePick = needed && a !== null && b !== null && (pick === 1 || pick === 2) ? pick : 0;
    states.push({
      a,
      b,
      side,
      needed,
      winner: side === 1 ? a : side === 2 ? b : null,
      loser: side === 1 ? b : side === 2 ? a : null,
    });
  }

  const grandFinal = states[bracket.grandFinalId - 1];
  const reset = states[bracket.resetId - 1];
  const deciding = grandFinal.side === 1 ? grandFinal : grandFinal.side === 2 && reset.side !== 0 ? reset : null;
  const losses = Array.from({ length: bracket.entrantCount }, () => 0);
  for (const state of states) if (state.loser !== null) losses[state.loser]++;

  return {
    states,
    champion: deciding?.winner ?? null,
    runnerUp: deciding?.loser ?? null,
    losses,
    decided: states.filter((s) => s.side !== 0).length,
    required: states.filter((s) => s.needed).length,
  };
}

/** Sets (or, if repeated, clears) a result and clears every later result that depended on it. */
export function setMatchWinner(bracket: DeBracket, picks: readonly DePick[], matchId: number, side: 1 | 2): DePick[] {
  const next = [...picks];
  next[matchId - 1] = picks[matchId - 1] === side ? 0 : side;
  const dirty = new Set([matchId]);
  const dependsOnDirty = (s: DeSource) => s.kind !== "entrant" && dirty.has(s.match);
  for (const match of bracket.matches) {
    if (match.id <= matchId) continue;
    if (dependsOnDirty(match.a) || dependsOnDirty(match.b) || (match.isReset && dirty.has(bracket.grandFinalId))) {
      dirty.add(match.id);
      next[match.id - 1] = 0;
    }
  }
  return next;
}

export function describeSource(source: DeSource, names: readonly string[]): string {
  if (source.kind === "entrant") return names[source.entrant] ?? "";
  return `${source.kind === "winner" ? "Winner" : "Loser"} of M${source.match}`;
}

/**
 * URL-safe share payload for the link's #fragment. Browsers leave the fragment out of HTTP requests,
 * but page scripts can read it and anyone holding the link can decode it: it is not private.
 */
export function encodeBracketState(names: readonly string[], picks: readonly DePick[]): string {
  const json = JSON.stringify({ v: 1, n: names.map((n) => n.slice(0, MAX_SHARED_NAME_LENGTH).trim()), r: picks.join("") });
  let binary = "";
  for (const byte of new TextEncoder().encode(json)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Returns null for anything that isn't a valid bracket - shared links are untrusted input. */
export function decodeBracketState(encoded: string): { names: string[]; picks: DePick[] } | null {
  if (!encoded || encoded.length > MAX_SHARE_PAYLOAD_LENGTH || !/^[A-Za-z0-9_-]+$/.test(encoded)) return null;
  try {
    const binary = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const data: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    if (typeof data !== "object" || data === null) return null;
    const { v, n, r } = data as { v?: unknown; n?: unknown; r?: unknown };
    if (v !== 1 || !Array.isArray(n) || typeof r !== "string") return null;
    if (n.length < DE_MIN_ENTRANTS || n.length > DE_MAX_ENTRANTS) return null;
    const valid = n.every(
      (name) => typeof name === "string" && name.trim() === name && name.length > 0 && name.length <= MAX_SHARED_NAME_LENGTH && !/[\r\n]/.test(name),
    );
    if (!valid) return null;
    const bracket = buildDoubleElimination(n.length);
    if (r.length !== bracket.matches.length || !/^[012]*$/.test(r)) return null;
    const picks = [...r].map((c) => Number(c) as DePick);
    // Drop any result a hand-edited link claims for a match that can't have been played.
    const { states } = resolveBracket(bracket, picks);
    return { names: n as string[], picks: states.map((s) => s.side) };
  } catch {
    return null;
  }
}
