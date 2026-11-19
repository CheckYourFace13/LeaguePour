/**
 * Single-elimination result corrections, exercised through the real server actions against a REAL
 * Postgres (transactions, locks and rollback need the real thing). Only sign-in and Next's
 * redirect/revalidate are stubbed. No Stripe or email calls.
 *
 *   TEST_DATABASE_URL="postgresql://postgres@127.0.0.1:55432/lpqa?schema=leaguepour_lp" \
 *     npx tsx scripts/check-bracket-corrections.ts
 *
 * Refuses to run unless TEST_DATABASE_URL points at a loopback host: it deletes and seeds venues,
 * users and competitions.
 */
import assert from "node:assert/strict";
import Module from "node:module";

const url = process.env.TEST_DATABASE_URL ?? "";
if (!/@(127\.0\.0\.1|localhost)(:\d+)?\//.test(url)) {
  console.error("TEST_DATABASE_URL must point at a local throwaway database (127.0.0.1/localhost).");
  process.exit(2);
}
process.env.DATABASE_URL = url;

class Redirected extends Error {
  constructor(readonly to: string) {
    super(`redirect ${to}`);
  }
}
let session: unknown = null;
const stubs: Record<string, unknown> = {
  "@/auth": { auth: async () => session },
  "next/cache": { revalidatePath: () => undefined },
  "next/navigation": {
    redirect: (to: string) => {
      throw new Redirected(to);
    },
  },
};
type Loader = (request: string, parent: unknown, isMain: boolean) => unknown;
const loader = Module as unknown as { _load: Loader };
const realLoad = loader._load;
loader._load = (request, parent, isMain) => stubs[request] ?? realLoad(request, parent, isMain);

async function main() {
  const { prisma } = await import("../src/lib/db");
  const actions = await import("../src/app/venue/competitions/[id]/actions");

  let n = 0;
  let seq = 0;
  type Comp = { id: string; venueId: string; slug: string };
  type Row = Awaited<ReturnType<typeof rows>>[number];

  const reset = async () => {
    await prisma.standing.deleteMany({});
    await prisma.match.deleteMany({});
    await prisma.competitionRegistration.deleteMany({});
    await prisma.team.deleteMany({});
    await prisma.competition.deleteMany({});
    await prisma.venueStaff.deleteMany({});
    await prisma.venue.deleteMany({});
    await prisma.user.deleteMany({});
  };
  const check = async (name: string, fn: () => Promise<void>) => {
    await reset();
    await fn();
    n++;
    console.log("ok -", name);
  };

  const submit = async (action: (f: FormData) => Promise<unknown>, fields: Record<string, string | number>) => {
    const form = new FormData();
    for (const [k, v] of Object.entries(fields)) form.set(k, String(v));
    try {
      await action(form);
    } catch (err) {
      if (err instanceof Redirected) return err.to;
      throw err;
    }
    throw new Error("action finished without redirecting");
  };

  const makeVenue = async (role: "OWNER" | "MANAGER" | "COORDINATOR" = "OWNER") => {
    const id = ++seq;
    const user = await prisma.user.create({ data: { email: `staff${id}@example.test`, name: `Staff ${id}` } });
    const venue = await prisma.venue.create({
      data: { name: `QA Venue ${id}`, slug: `qa-venue-${id}`, venueType: "Bar", description: "QA" },
    });
    await prisma.venueStaff.create({ data: { venueId: venue.id, userId: user.id, role } });
    return { user, venue, signIn: () => (session = { user: { id: user.id }, venueAccess: [{ venueId: venue.id, slug: venue.slug }] }) };
  };

  const makeCompetition = async (
    venueId: string,
    entrants: number,
    bracketKind: "SINGLE_ELIMINATION" | "ROUND_ROBIN" | "CUSTOM" = "SINGLE_ELIMINATION",
  ): Promise<Comp> => {
    const id = ++seq;
    const comp = await prisma.competition.create({
      data: {
        venueId,
        title: `Night ${id}`,
        slug: `night-${id}`,
        kind: "DARTS",
        description: "QA",
        signupOpenAt: new Date(),
        signupCloseAt: new Date(Date.now() + 86_400_000),
        startAt: new Date(Date.now() + 2 * 86_400_000),
        endAt: new Date(Date.now() + 3 * 86_400_000),
        teamFormat: "SOLO",
        rules: "QA",
        scheduleKind: "ONE_TIME",
        bracketKind,
        status: "SIGNUP_CLOSED",
      },
    });
    for (let i = 1; i <= entrants; i++) {
      const u = await prisma.user.create({ data: { email: `p${id}-${i}@example.test`, name: `T${i}` } });
      await prisma.competitionRegistration.create({
        data: { competitionId: comp.id, userId: u.id, status: "CONFIRMED", createdAt: new Date(Date.UTC(2026, 0, 1, 0, 0, i)) },
      });
    }
    if (bracketKind !== "CUSTOM") {
      assert.match(await submit(actions.startTournamentFormAction, { competitionId: comp.id }), /tournament-started/);
    }
    return comp;
  };

  const rows = (competitionId: string) =>
    prisma.match.findMany({
      where: { competitionId },
      orderBy: [{ round: "asc" }, { id: "asc" }],
      include: { homeTeam: { select: { name: true } }, awayTeam: { select: { name: true } } },
    });
  const at = async (c: Comp, round: number, slot: number): Promise<Row> => {
    const m = (await rows(c.id)).filter((r) => r.round === round)[slot];
    assert.ok(m, `R${round} slot ${slot} exists`);
    return m;
  };
  const save = async (c: Comp, m: { id: string }, homeScore: number, awayScore: number, extra: Record<string, string> = {}) =>
    submit(actions.updateMatchScoreFormAction, { competitionId: c.id, matchId: m.id, homeScore, awayScore, ...extra });
  const advance = (c: Comp) => submit(actions.advanceRoundFormAction, { competitionId: c.id });
  const status = async (c: Comp) => (await prisma.competition.findUniqueOrThrow({ where: { id: c.id } })).status;
  const teams = (m: Row) => `${m.homeTeam?.name ?? "TBD"} v ${m.awayTeam?.name ?? "TBD"}`;
  const score = (m: Row) => (m.completedAt ? `${m.homeScore}-${m.awayScore}` : null);
  const ranks = async (c: Comp) => {
    const list = await prisma.standing.findMany({
      where: { competitionId: c.id, rank: { not: null } },
      orderBy: { rank: "asc" },
      include: { team: { select: { name: true } } },
    });
    return list.map((s) => `${s.rank}:${s.team?.name}`);
  };
  /** Home side wins every match; the bracket is played and advanced until it completes. */
  const playOut = async (c: Comp) => {
    for (let guard = 0; guard < 8; guard++) {
      const all = await rows(c.id);
      const latest = Math.max(...all.map((m) => m.round));
      for (const m of all.filter((r) => r.round === latest && !r.completedAt)) {
        assert.match(await save(c, m, 5, 1), /match-saved/);
      }
      const to = await advance(c);
      if (/tournament-completed/.test(to)) return;
      assert.match(to, /round-advanced/);
    }
    throw new Error("bracket did not finish");
  };
  /** Plays only round 1 (home wins) and generates round 2. */
  const playRoundOne = async (c: Comp) => {
    for (const m of (await rows(c.id)).filter((r) => r.round === 1 && !r.completedAt)) await save(c, m, 5, 1);
    assert.match(await advance(c), /round-advanced/);
  };
  const snapshot = async (c: Comp) =>
    JSON.stringify({
      matches: (await rows(c.id)).map((m) => [m.id, m.homeTeamId, m.awayTeamId, m.homeScore, m.awayScore, m.completedAt?.getTime() ?? null]),
      ranks: await ranks(c),
      status: await status(c),
    });
  /** Follows the real flow: the first save asks for confirmation, the second carries its fingerprint. */
  const confirmCorrection = async (c: Comp, m: { id: string }, homeScore: number, awayScore: number) => {
    const first = await save(c, m, homeScore, awayScore);
    assert.match(first, /correct=/, `expected a confirmation step, got ${first}`);
    const { planSingleEliminationScore } = await import("../src/lib/single-elimination-results");
    const comp = await prisma.competition.findUniqueOrThrow({ where: { id: c.id }, include: { matches: true, standings: true } });
    const plan = planSingleEliminationScore({ status: comp.status, matches: comp.matches, standings: comp.standings, matchId: m.id, homeScore, awayScore });
    assert.equal(plan.kind, "save");
    if (plan.kind !== "save") throw new Error("unreachable");
    return { plan, to: await save(c, m, homeScore, awayScore, { confirmFingerprint: plan.fingerprint }) };
  };

  // ── The reported failure ───────────────────────────────────────────────────
  await check("changing a winner after advancing does not save until confirmed, and leaves the bracket untouched", async () => {
    const { venue, signIn } = await makeVenue();
    signIn();
    const c = await makeCompetition(venue.id, 4);
    await playRoundOne(c);
    const before = await snapshot(c);
    const to = await save(c, await at(c, 1, 0), 1, 5);
    assert.match(to, /correct=/, `a changed winner must ask for confirmation, got ${to}`);
    assert.equal(await snapshot(c), before);
  });

  await check("confirming a changed winner puts the new winner into the next round and clears its stale result", async () => {
    const { venue, signIn } = await makeVenue();
    signIn();
    const c = await makeCompetition(venue.id, 4);
    await playRoundOne(c);
    await save(c, await at(c, 2, 0), 7, 2);
    const { to, plan } = await confirmCorrection(c, await at(c, 1, 0), 1, 5);
    assert.match(to, /bracket-corrected/);
    assert.equal(plan.laterChanges.length, 1);
    assert.equal(plan.laterChanges[0].clearsResult, true);
    const final = await at(c, 2, 0);
    assert.equal(teams(final), "T2 v T3");
    assert.equal(score(final), null);
    assert.equal(score(await at(c, 1, 0)), "1-5");
    assert.equal(await status(c), "IN_PROGRESS");
  });

  await check("a completed bracket reopens: stale champion and runner-up are removed, status returns to in progress", async () => {
    const { venue, signIn } = await makeVenue();
    signIn();
    const c = await makeCompetition(venue.id, 8);
    await playOut(c);
    assert.equal(await status(c), "COMPLETED");
    assert.deepEqual(await ranks(c), ["1:T1", "2:T5"]);
    const regs = await prisma.competitionRegistration.count({ where: { competitionId: c.id } });
    const teamCount = await prisma.team.count({ where: { competitionId: c.id } });

    const { plan } = await confirmCorrection(c, await at(c, 1, 0), 0, 3);
    assert.equal(plan.statusAfter, "IN_PROGRESS");
    assert.equal(await status(c), "IN_PROGRESS");
    assert.deepEqual(await ranks(c), []);
    assert.equal(await prisma.standing.count({ where: { competitionId: c.id } }), 0, "generated rows are removed");

    assert.equal(teams(await at(c, 2, 0)), "T2 v T3");
    assert.equal(score(await at(c, 2, 0)), null);
    assert.equal(teams(await at(c, 2, 1)), "T5 v T7", "the other semifinal is untouched");
    assert.equal(score(await at(c, 2, 1)), "5-1", "the other semifinal keeps its result");
    assert.equal(teams(await at(c, 3, 0)), "TBD v T5");
    assert.equal(score(await at(c, 3, 0)), null);
    assert.equal(score(await at(c, 1, 2)), "5-1", "other round 1 results are kept");
    assert.equal(await prisma.competitionRegistration.count({ where: { competitionId: c.id } }), regs);
    assert.equal(await prisma.team.count({ where: { competitionId: c.id } }), teamCount);
  });

  await check("after a correction the bracket can be finished normally with the right champion", async () => {
    const { venue, signIn } = await makeVenue();
    signIn();
    const c = await makeCompetition(venue.id, 8);
    await playOut(c);
    await confirmCorrection(c, await at(c, 1, 0), 0, 3);
    assert.match(await save(c, await at(c, 3, 0), 1, 0), /match-not-ready/, "a final missing a team cannot be scored");
    assert.match(await advance(c), /round-not-complete/);
    assert.match(await save(c, await at(c, 2, 0), 2, 9), /match-saved/, "filling an empty slot needs no confirmation");
    assert.equal(teams(await at(c, 3, 0)), "T3 v T5");
    assert.match(await save(c, await at(c, 3, 0), 2, 6), /match-saved/);
    assert.match(await advance(c), /tournament-completed/);
    assert.equal(await status(c), "COMPLETED");
    assert.deepEqual(await ranks(c), ["1:T5", "2:T3"]);
    assert.equal((await rows(c.id)).length, 7, "no duplicate rows");
  });

  // ── What must not be disturbed ─────────────────────────────────────────────
  await check("a score-only edit with the same winner changes only that match", async () => {
    const { venue, signIn } = await makeVenue();
    signIn();
    const c = await makeCompetition(venue.id, 8);
    await playOut(c);
    const edited = await at(c, 1, 0);
    const others = async () => (await rows(c.id)).filter((m) => m.id !== edited.id).map((m) => [m.id, m.homeTeamId, m.awayTeamId, m.homeScore, m.awayScore, m.completedAt?.getTime()]);
    const before = await others();
    assert.match(await save(c, edited, 9, 8), /match-saved/);
    assert.deepEqual(await others(), before);
    assert.equal(score(await at(c, 1, 0)), "9-8");
    assert.equal(await status(c), "COMPLETED");
    assert.deepEqual(await ranks(c), ["1:T1", "2:T5"]);
  });

  await check("a changed winner before the next round exists saves directly", async () => {
    const { venue, signIn } = await makeVenue();
    signIn();
    const c = await makeCompetition(venue.id, 4);
    await save(c, await at(c, 1, 0), 5, 1);
    assert.match(await save(c, await at(c, 1, 0), 1, 5), /match-saved/);
    assert.equal(score(await at(c, 1, 0)), "1-5");
  });

  await check("in a 16-entrant bracket only the corrected match's path changes", async () => {
    const { venue, signIn } = await makeVenue();
    signIn();
    const c = await makeCompetition(venue.id, 16);
    await playOut(c);
    const before = await rows(c.id);
    const { plan } = await confirmCorrection(c, await at(c, 1, 0), 0, 1);
    assert.deepEqual(plan.laterChanges.map((l) => l.round), [2, 3, 4]);
    const after = await rows(c.id);
    const touched = new Set([before.filter((m) => m.round === 1)[0].id, ...plan.laterChanges.map((l) => l.id)]);
    for (const [i, m] of after.entries()) {
      if (touched.has(m.id)) continue;
      assert.equal(score(m), score(before[i]), `result kept on ${m.id}`);
      assert.equal(teams(m), teams(before[i]), `teams kept on ${m.id}`);
    }
    assert.equal(teams(after.filter((m) => m.round === 3)[1]), teams(before.filter((m) => m.round === 3)[1]));
    assert.equal(score(after.filter((m) => m.round === 3)[1]), "5-1", "the unaffected quarterfinal-level result survives");
  });

  await check("byes keep their bracket position when the match beside them is corrected", async () => {
    const { venue, signIn } = await makeVenue();
    signIn();
    const c = await makeCompetition(venue.id, 3);
    await playOut(c);
    assert.deepEqual(await ranks(c), ["1:T1", "2:T2"]);
    await confirmCorrection(c, await at(c, 1, 1), 0, 4);
    const final = await at(c, 2, 0);
    assert.equal(teams(final), "T1 v T3");
    assert.equal(score(final), null);
    assert.equal(score(await at(c, 1, 0)), "1-0", "the bye row is untouched");
  });

  await check("correcting the final swaps champion and runner-up and the competition stays completed", async () => {
    const { venue, signIn } = await makeVenue();
    signIn();
    const c = await makeCompetition(venue.id, 4);
    await playOut(c);
    assert.deepEqual(await ranks(c), ["1:T1", "2:T3"]);
    const { plan, to } = await confirmCorrection(c, await at(c, 2, 0), 0, 2);
    assert.match(to, /bracket-corrected/);
    assert.equal(plan.laterChanges.length, 0);
    assert.deepEqual(await ranks(c), ["1:T3", "2:T1"]);
    assert.equal(await status(c), "COMPLETED");
    const champ = await prisma.standing.findFirstOrThrow({ where: { competitionId: c.id, rank: 1 } });
    assert.equal(champ.wins, 1);
    assert.equal(await prisma.standing.count({ where: { competitionId: c.id } }), 2);
  });

  await check("staff-edited standing numbers survive a correction; only the rank is cleared", async () => {
    const { venue, signIn } = await makeVenue();
    signIn();
    const c = await makeCompetition(venue.id, 4);
    await playOut(c);
    const row = await prisma.standing.findFirstOrThrow({ where: { competitionId: c.id, rank: 1 } });
    await submit(actions.updateStandingRowFormAction, { competitionId: c.id, standingId: row.id, wins: 2, losses: 0, ties: 0, points: 40 });
    await confirmCorrection(c, await at(c, 1, 0), 0, 1);
    const kept = await prisma.standing.findUniqueOrThrow({ where: { id: row.id } });
    assert.equal(kept.rank, null);
    assert.equal(kept.points, 40);
    assert.equal(kept.wins, 2);
  });

  await check("single-elimination ties are still rejected, including on corrections", async () => {
    const { venue, signIn } = await makeVenue();
    signIn();
    const c = await makeCompetition(venue.id, 4);
    await playRoundOne(c);
    const before = await snapshot(c);
    assert.match(await save(c, await at(c, 1, 0), 3, 3), /elimination-tie/);
    assert.equal(await snapshot(c), before);
  });

  await check("round robin saves and recomputes as before, with no confirmation step", async () => {
    const { venue, signIn } = await makeVenue();
    signIn();
    const c = await makeCompetition(venue.id, 4, "ROUND_ROBIN");
    const m = (await rows(c.id))[0];
    assert.match(await save(c, m, 4, 4), /match-saved/, "ties stay legal");
    assert.match(await save(c, m, 5, 1), /match-saved/);
    assert.match(await save(c, m, 1, 5), /match-saved/, "a flipped winner just recomputes");
    const away = await prisma.standing.findFirstOrThrow({ where: { competitionId: c.id, teamId: m.awayTeamId! } });
    assert.equal(away.wins, 1);
    assert.equal(away.points, 3);
  });

  await check("custom-format matches save as before", async () => {
    const { venue, signIn } = await makeVenue();
    signIn();
    const c = await makeCompetition(venue.id, 2, "CUSTOM");
    assert.match(await submit(actions.addMatchFormAction, { competitionId: c.id, round: 1, label: "A vs B" }), /match-added/);
    assert.match(await submit(actions.addMatchFormAction, { competitionId: c.id, round: 2, label: "C vs D" }), /match-added/);
    const [m] = await rows(c.id);
    assert.match(await save(c, m, 2, 2), /match-saved/);
    assert.match(await save(c, m, 1, 3), /match-saved/);
    assert.equal(score(await at(c, 1, 0)), "1-3");
    assert.equal(score(await at(c, 2, 0)), null);
  });

  // ── Safety ─────────────────────────────────────────────────────────────────
  await check("a confirmation made against an older bracket is refused", async () => {
    const { venue, signIn } = await makeVenue();
    signIn();
    const c = await makeCompetition(venue.id, 4);
    await playRoundOne(c);
    const before = await snapshot(c);
    assert.match(await save(c, await at(c, 1, 0), 1, 5, { confirmFingerprint: "stale" }), /notice=bracket-changed/);
    assert.equal(await snapshot(c), before);
  });

  await check("a failure part-way through a correction rolls everything back", async () => {
    const { venue, signIn } = await makeVenue();
    signIn();
    const c = await makeCompetition(venue.id, 4);
    await playOut(c);
    const before = await snapshot(c);
    await prisma.$executeRawUnsafe(`CREATE OR REPLACE FUNCTION leaguepour_lp.qa_fail() RETURNS trigger AS $$ BEGIN RAISE EXCEPTION 'qa failure'; END $$ LANGUAGE plpgsql`);
    await prisma.$executeRawUnsafe(`CREATE TRIGGER qa_fail BEFORE UPDATE ON leaguepour_lp."Competition" FOR EACH ROW EXECUTE FUNCTION leaguepour_lp.qa_fail()`);
    const logged = console.error;
    console.error = () => undefined;
    try {
      const { to } = await confirmCorrection(c, await at(c, 1, 0), 0, 1);
      assert.match(to, /correction-failed/);
    } finally {
      console.error = logged;
      await prisma.$executeRawUnsafe(`DROP TRIGGER qa_fail ON leaguepour_lp."Competition"`);
    }
    assert.equal(await snapshot(c), before);
  });

  await check("simultaneous confirmations and advances cannot corrupt the bracket", async () => {
    const { venue, signIn } = await makeVenue();
    signIn();
    const c = await makeCompetition(venue.id, 8);
    await playRoundOne(c);
    await Promise.all([advance(c).catch(() => ""), advance(c).catch(() => "")]);
    assert.equal((await rows(c.id)).filter((m) => m.round === 3).length, 0, "round 2 is unplayed so nothing advances");
    await save(c, await at(c, 2, 0), 5, 1);
    await save(c, await at(c, 2, 1), 5, 1);
    const results = await Promise.all([advance(c), advance(c)]);
    assert.equal(results.filter((r) => /round-advanced/.test(r)).length, 1, results.join(" | "));
    assert.equal((await rows(c.id)).filter((m) => m.round === 3).length, 1);

    const { planSingleEliminationScore } = await import("../src/lib/single-elimination-results");
    const target = await at(c, 1, 0);
    const comp = await prisma.competition.findUniqueOrThrow({ where: { id: c.id }, include: { matches: true, standings: true } });
    const plan = planSingleEliminationScore({ status: comp.status, matches: comp.matches, standings: comp.standings, matchId: target.id, homeScore: 0, awayScore: 1 });
    assert.equal(plan.kind, "save");
    if (plan.kind !== "save") return;
    const fields = { confirmFingerprint: plan.fingerprint };
    await Promise.all([save(c, target, 0, 1, fields), save(c, target, 0, 1, fields)]);
    assert.equal(teams(await at(c, 2, 0)), "T2 v T3");
    assert.equal(teams(await at(c, 3, 0)), "TBD v T5");
  });

  await check("a bracket already left stale by the old behaviour is flagged, blocks advancing, and can be repaired", async () => {
    const { findBracketMismatches } = await import("../src/lib/single-elimination-results");
    const { venue, signIn } = await makeVenue();
    signIn();
    const c = await makeCompetition(venue.id, 4);
    await playRoundOne(c);
    const r1 = await at(c, 1, 0);
    await prisma.match.update({ where: { id: r1.id }, data: { homeScore: 0, awayScore: 5 } }); // what the old action did
    const load = () => prisma.competition.findUniqueOrThrow({ where: { id: c.id }, include: { matches: true, standings: true } });
    let comp = await load();
    assert.deepEqual(findBracketMismatches(comp), [r1.id]);
    await save(c, await at(c, 2, 0), 5, 1);
    assert.match(await advance(c), /bracket-out-of-sync/);
    assert.equal(await status(c), "IN_PROGRESS");
    await confirmCorrection(c, r1, 0, 5);
    assert.equal(teams(await at(c, 2, 0)), "T2 v T3");
    comp = await load();
    assert.deepEqual(findBracketMismatches(comp), []);
  });

  // ── Authorization ──────────────────────────────────────────────────────────
  await check("another venue cannot correct or confirm, and signed-out users are sent away", async () => {
    const owner = await makeVenue();
    owner.signIn();
    const c = await makeCompetition(owner.venue.id, 4);
    await playRoundOne(c);
    const m = await at(c, 1, 0);
    const before = await snapshot(c);
    const other = await makeVenue();
    other.signIn();
    assert.equal(await save(c, m, 1, 5, { confirmFingerprint: "x" }), "/venue/competitions");
    assert.equal(await advance(c), "/venue/competitions");
    session = null;
    assert.equal(await save(c, m, 1, 5), "/signup/venue");
    assert.equal(await snapshot(c), before);
  });

  await check("a coordinator can correct results, as they can already enter them", async () => {
    const owner = await makeVenue();
    owner.signIn();
    const c = await makeCompetition(owner.venue.id, 4);
    await playRoundOne(c);
    const coordinator = await prisma.user.create({ data: { email: "coord@example.test", name: "Coord" } });
    await prisma.venueStaff.create({ data: { venueId: owner.venue.id, userId: coordinator.id, role: "COORDINATOR" } });
    session = { user: { id: coordinator.id }, venueAccess: [{ venueId: owner.venue.id, slug: owner.venue.slug }] };
    const { to } = await confirmCorrection(c, await at(c, 1, 0), 1, 5);
    assert.match(to, /bracket-corrected/);
  });

  await reset();
  console.log(`\n${n} checks passed`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
