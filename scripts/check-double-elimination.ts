/**
 * Logic checks for the free double-elimination generator. Pure - no DB or network.
 *
 *   npx tsx scripts/check-double-elimination.ts
 */
import assert from "node:assert/strict";
import {
  DE_MAX_ENTRANTS,
  DE_MIN_ENTRANTS,
  buildDoubleElimination,
  decodeBracketState,
  describeSource,
  emptyPicks,
  encodeBracketState,
  resolveBracket,
  setMatchWinner,
  type DeBracket,
  type DePick,
} from "../src/lib/double-elimination";
import { buildSingleEliminationRound1, pairNextRound, type Participant } from "../src/lib/tournament";

let checks = 0;
const check = (name: string, fn: () => void) => {
  fn();
  checks++;
  console.log("ok -", name);
};

// Small deterministic PRNG, so a failure reproduces.
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Chooser = (matchId: number) => 1 | 2;

/** Plays the bracket through the same API the page uses, in match order. */
function play(bracket: DeBracket, choose: Chooser) {
  let picks = emptyPicks(bracket);
  for (const match of bracket.matches) {
    const state = resolveBracket(bracket, picks).states[match.id - 1];
    if (!state.needed) continue;
    assert.notEqual(state.a, null, `M${match.id} side a known when reached`);
    assert.notEqual(state.b, null, `M${match.id} side b known when reached`);
    picks = setMatchWinner(bracket, picks, match.id, choose(match.id));
  }
  return { picks, result: resolveBracket(bracket, picks) };
}

function assertCompleteTournament(bracket: DeBracket, picks: DePick[], label: string) {
  const r = resolveBracket(bracket, picks);
  const n = bracket.entrantCount;
  assert.notEqual(r.champion, null, `${label}: champion`);
  assert.notEqual(r.runnerUp, null, `${label}: runner-up`);
  assert.notEqual(r.champion, r.runnerUp, label);
  r.losses.forEach((count, entrant) => {
    if (entrant === r.champion) assert.ok(count <= 1, `${label}: champion has at most one loss`);
    else assert.equal(count, 2, `${label}: entrant ${entrant} eliminated on exactly two losses`);
  });
  const played = r.states.filter((s) => s.side !== 0).length;
  assert.equal(played, r.losses.reduce((a, b) => a + b, 0), `${label}: one loss per match`);
  assert.equal(played, r.losses[r.champion!] === 1 ? 2 * n - 1 : 2 * n - 2, `${label}: match count`);
  // Nobody plays again after their second loss, or against themselves.
  const seen = Array.from({ length: n }, () => 0);
  r.states.forEach((s, i) => {
    if (s.side === 0) return;
    assert.notEqual(s.a, s.b, `${label}: M${i + 1} self-match`);
    assert.ok(seen[s.a!] < 2 && seen[s.b!] < 2, `${label}: M${i + 1} has an eliminated entrant`);
    seen[s.loser!]++;
  });
}

function assertStructure(n: number) {
  const b = buildDoubleElimination(n);
  assert.equal(b.matches.length, 2 * n - 1, `n=${n}: 2n-2 matches plus the reset`);
  assert.equal(b.grandFinalId, 2 * n - 2);
  assert.equal(b.resetId, 2 * n - 1);
  assert.equal(b.byes.length, b.bracketSize - n, `n=${n}: bye count`);
  assert.equal(b.matches.filter((m) => m.bracket === "winners").length, n - 1, `n=${n}: winners matches`);
  assert.equal(b.matches.filter((m) => m.bracket === "losers").length, n - 2, `n=${n}: losers matches`);
  const usedAsResult = new Map<string, number>();
  const entrants = new Set(b.byes);
  b.matches.forEach((m, i) => {
    assert.equal(m.id, i + 1);
    for (const s of [m.a, m.b]) {
      if (s.kind === "entrant") {
        assert.equal(m.bracket, "winners", `n=${n}: entrants only start in the winners bracket`);
        entrants.add(s.entrant);
      } else {
        assert.ok(s.match < m.id, `n=${n}: M${m.id} depends only on earlier matches`);
        if (m.bracket !== "final") {
          const key = `${s.kind}:${s.match}`;
          usedAsResult.set(key, (usedAsResult.get(key) ?? 0) + 1);
        }
      }
    }
  });
  assert.equal(entrants.size, n, `n=${n}: every entrant is placed`);
  for (const [key, count] of usedAsResult) assert.equal(count, 1, `n=${n}: ${key} feeds one place`);
  const refs = (kind: "winner" | "loser", id: number, bracket: string) =>
    b.matches.filter((x) => x.bracket === bracket && [x.a, x.b].some((s) => s.kind === kind && s.match === id)).length;
  for (const m of b.matches) {
    if (m.bracket === "winners") assert.equal(refs("loser", m.id, "losers"), 1, `n=${n}: M${m.id} loser drops exactly once`);
    if (m.bracket === "losers") assert.equal(refs("loser", m.id, "losers") + refs("loser", m.id, "final"), 0, `n=${n}: M${m.id} loser is out`);
    if (m.bracket !== "final") {
      const onward = refs("winner", m.id, m.bracket) + refs("winner", m.id, "final") / 2;
      assert.equal(onward, 1, `n=${n}: M${m.id} winner advances exactly once`);
    }
  }
}

check("rejects sizes outside 4-64", () => {
  for (const n of [0, 1, 2, 3, 65, 4.5, NaN]) assert.throws(() => buildDoubleElimination(n), RangeError, String(n));
  assert.equal(DE_MIN_ENTRANTS, 4);
  assert.equal(DE_MAX_ENTRANTS, 64);
});

check("4 entrants: exact hand-checked bracket", () => {
  const b = buildDoubleElimination(4);
  const names = ["A", "B", "C", "D"];
  const shape = b.matches.map((m) => `${m.bracket[0]}:${describeSource(m.a, names)}/${describeSource(m.b, names)}`);
  assert.deepEqual(shape, [
    "w:A/B",
    "w:C/D",
    "l:Loser of M1/Loser of M2",
    "w:Winner of M1/Winner of M2",
    "l:Loser of M4/Winner of M3",
    "f:Winner of M4/Winner of M5",
    "f:Winner of M4/Winner of M5",
  ]);
  assert.deepEqual(b.byes, []);
  assert.deepEqual(b.rounds.map((r) => r.label), ["Winners round 1", "Losers round 1", "Winners final", "Losers final", "Grand final", "Grand final reset"]);
});

check("8 entrants: round shapes, no byes", () => {
  const b = buildDoubleElimination(8);
  assert.deepEqual(b.rounds.map((r) => [r.label, r.matches.length]), [
    ["Winners round 1", 4],
    ["Losers round 1", 2],
    ["Winners round 2", 2],
    ["Losers round 2", 2],
    ["Losers round 3", 1],
    ["Winners final", 1],
    ["Losers final", 1],
    ["Grand final", 1],
    ["Grand final reset", 1],
  ]);
  assert.equal(b.byes.length, 0);
});

check("13 entrants: 3 byes go to the first three names, with a 16 bracket", () => {
  const b = buildDoubleElimination(13);
  assert.equal(b.bracketSize, 16);
  assert.deepEqual(b.byes, [0, 1, 2]);
  assert.equal(b.rounds[0].matches.length, 5);
  const firstRoundEntrants = b.rounds[0].matches.flatMap((m) => [m.a, m.b]).map((s) => (s.kind === "entrant" ? s.entrant : -1));
  assert.deepEqual(firstRoundEntrants, [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  // Bye entrants enter at winners round 2 by name, never as "Winner of".
  const secondRound = b.rounds.find((r) => r.label === "Winners round 2")!;
  const direct = secondRound.matches.flatMap((m) => [m.a, m.b]).filter((s) => s.kind === "entrant").map((s) => (s as { entrant: number }).entrant);
  assert.deepEqual(direct, [0, 1, 2]);
});

check("64 entrants: full bracket shape", () => {
  const b = buildDoubleElimination(64);
  assert.equal(b.bracketSize, 64);
  assert.equal(b.byes.length, 0);
  assert.equal(b.matches.length, 127);
  assert.equal(b.rounds.filter((r) => r.bracket === "winners").length, 6);
  assert.equal(b.rounds.filter((r) => r.bracket === "losers").length, 10);
});

check("winners bracket pairs the same way as the single elimination generator", () => {
  for (const n of [4, 5, 8, 13, 31, 64]) {
    const b = buildDoubleElimination(n);
    const people: Participant[] = Array.from({ length: n }, (_, i) => ({ id: `e${i}`, name: `e${i}` }));
    const label = (s: { kind: string; entrant?: number; match?: number }) => (s.kind === "entrant" ? `e${s.entrant}` : `w${s.match}`);
    let current = buildSingleEliminationRound1(people).pairings;
    for (const round of b.rounds.filter((r) => r.bracket === "winners")) {
      const expected = current.filter((p) => p.away);
      assert.deepEqual(round.matches.map((m) => [label(m.a), label(m.b)]), expected.map((p) => [p.home.id, p.away!.id]), `n=${n} ${round.label}`);
      let i = 0;
      current = pairNextRound(current.map((p) => (p.away ? { id: `w${round.matches[i++].id}`, name: "" } : p.home)));
    }
  }
});

check("structure holds for every size from 4 to 64", () => {
  for (let n = DE_MIN_ENTRANTS; n <= DE_MAX_ENTRANTS; n++) assertStructure(n);
});

check("winners champion wins the grand final: no reset, champion has 0 losses", () => {
  for (const n of [4, 8, 13, 64]) {
    const b = buildDoubleElimination(n);
    // Side a of the grand final is always the winners-bracket champion.
    const { picks, result } = play(b, () => 1);
    assert.equal(result.states[b.resetId - 1].needed, false, `n=${n}`);
    assert.equal(result.required, 2 * n - 2, `n=${n}`);
    assert.equal(result.losses[result.champion!], 0, `n=${n}`);
    assert.equal(result.states[b.grandFinalId - 1].winner, result.champion, `n=${n}`);
    assertCompleteTournament(b, picks, `n=${n} no reset`);
  }
});

check("losers champion wins the grand final, then wins the reset", () => {
  for (const n of [4, 8, 13, 64]) {
    const b = buildDoubleElimination(n);
    const { picks, result } = play(b, (id) => (id === b.grandFinalId || id === b.resetId ? 2 : 1));
    const final = result.states[b.grandFinalId - 1];
    assert.equal(result.states[b.resetId - 1].needed, true, `n=${n}`);
    assert.equal(result.required, 2 * n - 1, `n=${n}`);
    assert.equal(result.champion, final.b, `n=${n}: losers-bracket champion takes the title`);
    assert.equal(result.losses[result.champion!], 1, `n=${n}`);
    assert.equal(result.losses[final.a!], 2, `n=${n}: winners champion lost twice`);
    assertCompleteTournament(b, picks, `n=${n} reset to losers side`);
  }
});

check("losers champion forces a reset, winners champion wins it", () => {
  for (const n of [4, 8, 13, 64]) {
    const b = buildDoubleElimination(n);
    const { picks, result } = play(b, (id) => (id === b.grandFinalId ? 2 : 1));
    const final = result.states[b.grandFinalId - 1];
    assert.equal(result.champion, final.a, `n=${n}`);
    assert.equal(result.losses[result.champion!], 1, `n=${n}`);
    assertCompleteTournament(b, picks, `n=${n} reset to winners side`);
  }
});

check("no champion until the reset is decided", () => {
  const b = buildDoubleElimination(8);
  let picks = emptyPicks(b);
  for (const m of b.matches.slice(0, b.grandFinalId - 1)) picks = setMatchWinner(b, picks, m.id, 1);
  assert.equal(resolveBracket(b, picks).champion, null);
  picks = setMatchWinner(b, picks, b.grandFinalId, 2);
  assert.equal(resolveBracket(b, picks).champion, null);
  assert.equal(resolveBracket(b, picks).states[b.resetId - 1].needed, true);
});

check("2,000 random tournaments at every tested size finish correctly", () => {
  for (const n of [4, 5, 6, 7, 8, 9, 13, 16, 17, 31, 32, 33, 63, 64]) {
    const b = buildDoubleElimination(n);
    for (let seed = 0; seed < 2000 / 14; seed++) {
      const random = rng(seed * 1009 + n);
      const { picks } = play(b, () => (random() < 0.5 ? 1 : 2));
      assertCompleteTournament(b, picks, `n=${n} seed=${seed}`);
    }
  }
});

check("a player dropping from winners round 2 never meets the player they just beat in round 1", () => {
  for (const n of [8, 16, 32, 64]) {
    const b = buildDoubleElimination(n);
    for (let seed = 0; seed < 100; seed++) {
      const random = rng(seed + n);
      const { result } = play(b, () => (random() < 0.5 ? 1 : 2));
      const dropRound = b.rounds.find((r) => r.label === "Losers round 2")!;
      for (const m of dropRound.matches) {
        const s = result.states[m.id - 1];
        const earlier = b.rounds[0].matches.map((x) => result.states[x.id - 1]);
        assert.ok(!earlier.some((e) => (e.winner === s.a && e.loser === s.b) || (e.winner === s.b && e.loser === s.a)), `n=${n} M${m.id}`);
      }
    }
  }
});

check("changing a result clears only what depended on it", () => {
  const b = buildDoubleElimination(8);
  const { picks } = play(b, () => 1);
  const changed = setMatchWinner(b, picks, 1, 2);
  assert.equal(changed[0], 2);
  assert.equal(changed[1], picks[1], "M2 is unrelated");
  const r = resolveBracket(b, changed);
  assert.equal(r.champion, null);
  assert.equal(r.states[b.grandFinalId - 1].side, 0);
  // Every remaining decision has both players known.
  r.states.forEach((s) => s.side !== 0 && assert.ok(s.a !== null && s.b !== null));
  // Repeating a pick clears it.
  assert.equal(setMatchWinner(b, changed, 1, 2)[0], 0);
  // Changing the grand final clears the reset.
  const reset = play(b, (id) => (id === b.grandFinalId || id === b.resetId ? 2 : 1)).picks;
  assert.equal(setMatchWinner(b, reset, b.grandFinalId, 1)[b.resetId - 1], 0);
});

check("share state round-trips names (including non-English) and results", () => {
  const names = ["Pool Sharks", "Los Niños", "Café Crew", "Team 🎯", "Fifth"];
  const b = buildDoubleElimination(names.length);
  const { picks } = play(b, (id) => (id % 2 ? 1 : 2));
  const encoded = encodeBracketState(names, picks);
  assert.match(encoded, /^[A-Za-z0-9_-]+$/);
  const decoded = decodeBracketState(encoded);
  assert.deepEqual(decoded?.names, names);
  assert.deepEqual(resolveBracket(b, decoded!.picks).champion, resolveBracket(b, picks).champion);
  const big = Array.from({ length: 64 }, (_, i) => `Team number ${i + 1}`);
  const bigBracket = buildDoubleElimination(64);
  assert.ok(encodeBracketState(big, play(bigBracket, () => 1).picks).length < 2500, "64-entrant link stays a usable length");
});

check("invalid or tampered share links are rejected or sanitized", () => {
  const enc = (v: unknown) => Buffer.from(JSON.stringify(v)).toString("base64url");
  const r4 = "0".repeat(7);
  for (const bad of [
    "",
    "not base64!",
    "AAAA",
    enc({ v: 2, n: ["a", "b", "c", "d"], r: r4 }),
    enc({ v: 1, n: ["a", "b", "c"], r: "0".repeat(5) }),
    enc({ v: 1, n: Array.from({ length: 65 }, (_, i) => `t${i}`), r: "0".repeat(129) }),
    enc({ v: 1, n: ["a", "b", "c", 4], r: r4 }),
    enc({ v: 1, n: ["a", "b", "c", "d\nx"], r: r4 }),
    enc({ v: 1, n: ["a", "b", "c", "d"], r: "012" }),
    enc({ v: 1, n: ["a", "b", "c", "d"], r: "9".repeat(7) }),
  ]) {
    assert.equal(decodeBracketState(bad), null, bad);
  }
  // A result claimed for a match whose players aren't decided is dropped.
  assert.deepEqual(decodeBracketState(enc({ v: 1, n: ["a", "b", "c", "d"], r: "0001110" }))?.picks, [0, 0, 0, 0, 0, 0, 0]);
});

check("share links survive long names and fail safely on hostile input", () => {
  const picks = emptyPicks(buildDoubleElimination(4));
  // Cutting at 80 characters must not leave a trailing space, which the decoder rejects.
  const spaced = `${"x".repeat(79)} tail`;
  assert.equal(decodeBracketState(encodeBracketState([spaced, "B", "C", "D"], picks))?.names[0], "x".repeat(79));
  const longest = Array.from({ length: 64 }, (_, i) => `${i}`.padEnd(40, String.fromCodePoint(0x1f3af)));
  assert.ok(decodeBracketState(encodeBracketState(longest, emptyPicks(buildDoubleElimination(64)))));
  // Markup is only ever data: it round-trips as text for React to escape.
  const markup = "<img src=x onerror=alert(1)>";
  assert.equal(decodeBracketState(encodeBracketState([markup, "B", "C", "D"], picks))?.names[0], markup);
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  for (const bad of [
    "A".repeat(48_001),
    "%3Cscript%3E",
    "<script>alert(1)</script>",
    encode(null),
    encode({ v: 1, n: { length: 4 }, r: "0000000" }),
    encode({ v: 1, n: ["A", "B", "C", 4], r: "0000000" }),
    encode({ v: 1, n: Array(65).fill("A"), r: "0" }),
    encode({ v: 2, n: ["A", "B", "C", "D"], r: "0000000" }),
  ]) assert.equal(decodeBracketState(bad), null, bad.slice(0, 30));
});

console.log(`\n${checks} checks passed`);
