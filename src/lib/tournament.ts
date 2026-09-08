/**
 * Pure bracket/schedule math for the two bracket kinds LeaguePour can actually run end-to-end:
 * SINGLE_ELIMINATION and ROUND_ROBIN. No DB access here - callers (server actions) resolve real
 * participants (Team rows) and persist Match/Standing rows using this module's output. Kept pure
 * and dependency-free so it's easy to unit-reason-about and reuse for the "preview with sample
 * participants" panel (same functions, fake names, never written to the DB).
 *
 * Deterministic by design: seeding is registration order (oldest first), never random - so
 * "Generate Round 1" always produces the same bracket for the same registrant list, and a
 * accidental double-click can be safely rejected by checking whether Round 1 already exists
 * (see startTournamentFormAction) rather than by re-randomizing.
 */

export type Participant = { id: string; name: string };

export type BracketPairing = {
  /** Bracket position, 0-indexed, stable across rounds so winners re-pair predictably. */
  slot: number;
  home: Participant;
  /** null away = a bye: home advances automatically, no match is actually played. */
  away: Participant | null;
};

function nextPowerOfTwo(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

/**
 * Standard bye placement: with n entrants and bracketSize the next power of two, the first
 * (bracketSize - n) seeds (by registration order) get a first-round bye. Everyone else plays in
 * round 1. This guarantees round 2 onward is always a clean power of two - no byes after round 1.
 */
export function buildSingleEliminationRound1(participants: Participant[]): {
  bracketSize: number;
  byeCount: number;
  pairings: BracketPairing[];
} {
  const n = participants.length;
  const bracketSize = nextPowerOfTwo(Math.max(2, n));
  const byeCount = bracketSize - n;
  const pairings: BracketPairing[] = [];

  let slot = 0;
  let i = 0;
  // Bye slots first, in registration order.
  for (; i < byeCount; i++) {
    pairings.push({ slot: slot++, home: participants[i], away: null });
  }
  // Remaining entrants paired up in registration order.
  for (; i < n; i += 2) {
    pairings.push({ slot: slot++, home: participants[i], away: participants[i + 1] ?? null });
  }
  return { bracketSize, byeCount, pairings };
}

/**
 * Pairs winners from one completed round into the next round, in bracket order (slot 0&1 -> next
 * slot 0, slot 2&3 -> next slot 1, ...). Callers pass winners in the same slot order the previous
 * round's matches were created in.
 */
export function pairNextRound(winnersInSlotOrder: Participant[]): BracketPairing[] {
  const pairings: BracketPairing[] = [];
  for (let i = 0; i < winnersInSlotOrder.length; i += 2) {
    pairings.push({ slot: i / 2, home: winnersInSlotOrder[i], away: winnersInSlotOrder[i + 1] ?? null });
  }
  return pairings;
}

/** Total rounds (including the final) for a single-elimination bracket of n entrants. */
export function singleEliminationRoundCount(n: number): number {
  return Math.max(1, Math.ceil(Math.log2(Math.max(2, n))));
}

/** Human round name counting DOWN from the final - e.g. roundsRemaining=0 -> "Final". */
export function roundName(roundsRemaining: number): string {
  if (roundsRemaining <= 0) return "Final";
  if (roundsRemaining === 1) return "Semifinal";
  if (roundsRemaining === 2) return "Quarterfinal";
  return `Round of ${2 ** (roundsRemaining + 1)}`;
}

/**
 * Full round-robin schedule via the standard "circle method": fix one entrant, rotate the rest.
 * Odd counts get a phantom bye seat that rotates too - whoever sits opposite the bye that round
 * simply has no match. Returns every round up front (round-robin doesn't "advance" - the whole
 * schedule is known before anyone plays).
 */
export function buildRoundRobinSchedule(participants: Participant[]): {
  rounds: Array<Array<{ home: Participant; away: Participant }>>;
  totalMatches: number;
} {
  const list = [...participants];
  const hasBye = list.length % 2 === 1;
  if (hasBye) list.push({ id: "__bye__", name: "Bye" });
  const n = list.length;
  const roundCount = n - 1;
  const half = n / 2;

  const rounds: Array<Array<{ home: Participant; away: Participant }>> = [];
  const arr = [...list];
  for (let r = 0; r < roundCount; r++) {
    const roundMatches: Array<{ home: Participant; away: Participant }> = [];
    for (let i = 0; i < half; i++) {
      const a = arr[i];
      const b = arr[n - 1 - i];
      if (a.id !== "__bye__" && b.id !== "__bye__") {
        // Alternate home/away by round so nobody is permanently "away" against the same rival.
        roundMatches.push(r % 2 === 0 ? { home: a, away: b } : { home: b, away: a });
      }
    }
    rounds.push(roundMatches);
    // Rotate everyone except the fixed first seat.
    arr.splice(1, 0, arr.pop()!);
  }

  const totalMatches = rounds.reduce((sum, r) => sum + r.length, 0);
  return { rounds, totalMatches };
}

/** Dynamic, format-aware "how this works" summary text - no generic copy that can be wrong. */
export function describeBracket(
  bracketKind: "SINGLE_ELIMINATION" | "ROUND_ROBIN",
  participantCount: number,
): string[] {
  if (participantCount < 2) {
    return ["Needs at least 2 confirmed participants before a bracket or schedule can be generated."];
  }
  if (bracketKind === "SINGLE_ELIMINATION") {
    const { bracketSize, byeCount } = buildSingleEliminationRound1(
      Array.from({ length: participantCount }, (_, i) => ({ id: String(i), name: String(i) })),
    );
    const totalRounds = singleEliminationRoundCount(participantCount);
    const lines: string[] = [];
    let remaining = bracketSize;
    for (let r = 0; r < totalRounds; r++) {
      const roundsLeft = totalRounds - 1 - r;
      const matchesThisRound = remaining / 2;
      lines.push(`Round ${r + 1} (${roundName(roundsLeft)}): ${matchesThisRound} match${matchesThisRound === 1 ? "" : "es"}`);
      remaining = matchesThisRound;
    }
    const summary = `${participantCount} entrant${participantCount === 1 ? "" : "s"} -> ${lines.join(" -> ")}.`;
    return byeCount > 0
      ? [summary, `${byeCount} entrant${byeCount === 1 ? "" : "s"} get a first-round bye (earliest registrants) and skip straight to Round 2.`]
      : [summary];
  }
  const { rounds, totalMatches } = buildRoundRobinSchedule(
    Array.from({ length: participantCount }, (_, i) => ({ id: String(i), name: String(i) })),
  );
  const byeNote = participantCount % 2 === 1 ? " One entrant sits out each round on a rotating basis." : "";
  return [
    `${participantCount} entrants -> ${rounds.length} round${rounds.length === 1 ? "" : "s"}, ${totalMatches} total match${totalMatches === 1 ? "" : "es"}.${byeNote}`,
    "Standings update automatically from entered scores as each match is completed.",
  ];
}
