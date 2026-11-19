import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { TrackView } from "@/components/analytics/track-view";
import { TrackOnce } from "@/components/analytics/track-once";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldHelp } from "@/components/forms/field-help";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { prisma } from "@/lib/db";
import { buildQrDataUrl } from "@/lib/qr";
import { formatDateTime, formatMoney } from "@/lib/utils";
import { RegistrationPaymentBadge } from "@/components/payment/registration-payment-badge";
import { CAP_COUNT_STATUSES } from "@/lib/registration-cap";
import { presentRegistrationPaymentFromRow } from "@/lib/payment-display";
import { venueAppRoutes } from "@/lib/routes";
import {
  resolvePrimaryVenueAccess,
  venueStaffCanCreateAndPublish,
  venueStaffCanEditCompetitionResults,
} from "@/lib/venue-permissions";
import { refundRegistrationPaymentFormAction } from "@/app/venue/registrations/actions";
import {
  addMatchFormAction,
  advanceRoundFormAction,
  closeSignupFormAction,
  duplicateCompetitionFormAction,
  startTournamentFormAction,
  updateMatchScoreFormAction,
  updateStandingRowFormAction,
} from "./actions";
import { FormatGuide } from "@/components/app/format-guide";
import { SampleBracketPreview } from "@/components/app/sample-bracket-preview";
import { BracketKind, CompetitionStatus } from "@/generated/prisma/enums";
import { describeBracket } from "@/lib/tournament";
import {
  findBracketMismatches,
  isSingleEliminationBye,
  planSingleEliminationScore,
  type ScorePlan,
} from "@/lib/single-elimination-results";

const RUNNABLE_BRACKET_KINDS: BracketKind[] = [BracketKind.SINGLE_ELIMINATION, BracketKind.ROUND_ROBIN];

const notices: Record<string, string> = {
  duplicated: "Duplicate created as a draft with fresh signup dates - review and publish when ready.",
  saved: "Competition saved.",
  "at-capacity":
    "Saved as a draft: publishing it would go over your plan's active-competition limit. Finish or archive a live event, or upgrade in Settings → Billing, then publish.",
  "match-saved": "Match scores saved. Bracket view on Standings updates from these rows.",
  "match-added": "Match added - enter the score once it's played.",
  "match-label-required": "Add a short matchup label (e.g. \"Team A vs Team B\") before saving.",
  "standing-saved": "Standings row updated.",
  "invalid-scores": "Scores must be whole numbers between 0 and 999.",
  "elimination-tie": "Single-elimination matches can't end in a tie - settle it (overtime, sudden death, whatever your house rule is) and enter the final score.",
  "invalid-standing": "Check wins, losses, ties, and points.",
  "read-only": "That action is not available for your venue role. Ask an owner or manager if you need it done.",
  "not-editable": "This competition is already running or finished, so its core setup can no longer be edited.",
  "not-deletable": "Only draft competitions with zero registrations can be deleted.",
  "signup-closed": "Signup closed. Start the tournament when you're ready to generate Round 1.",
  "cannot-close-signup": "Signup can only be closed while it's open.",
  "tournament-started": "Tournament started - Round 1 (or the full schedule) is generated below.",
  "cannot-start": "Only competitions with signup open or closed can be started.",
  "format-not-supported":
    "This bracket style isn't supported for automatic generation yet - edit the competition and switch to Single elimination or Round robin.",
  "already-started": "This tournament has already been started - its matches already exist below.",
  "not-enough-participants": "Need at least 2 confirmed registrations before you can start.",
  "start-failed": "Something went wrong generating the tournament - nothing was started. Try again, or contact support if it keeps happening.",
  "round-advanced": "Next round generated from this round's winners.",
  "tournament-completed": "Tournament complete - the winner is set below.",
  "cannot-advance": "Rounds can only be advanced for an in-progress single-elimination tournament.",
  "not-started": "Start the tournament first to generate matches.",
  "already-advanced": "The next round already exists.",
  "round-not-complete": "Every match in the current round needs a score before you can advance.",
  "bracket-corrected": "Result corrected. The bracket, standings and competition status now match it.",
  "bracket-changed": "The bracket changed since that review, so nothing was saved. Check the updated details below.",
  "bracket-out-of-sync": "A saved result doesn't match the later rounds. Review the flagged match below before advancing.",
  "bracket-locked": "This competition is archived, so a correction that changes its bracket can't be made.",
  "bracket-unsupported":
    "This bracket wasn't generated automatically, so a changed winner can't be carried through it. Nothing was saved.",
  "match-not-ready": "This match is waiting on an earlier result, so it can't be scored yet.",
  "correction-failed": "Something went wrong saving that result - nothing was changed. Try again.",
};

type SavePlan = Extract<ScorePlan, { kind: "save" }>;

function parseScoreParam(value: string | undefined): number | null {
  return value && /^\d{1,3}$/.test(value) ? Number(value) : null;
}

function BracketCorrectionPanel({
  competitionId,
  plan,
  teamName,
}: {
  competitionId: string;
  plan: SavePlan;
  teamName: (teamId: string | null) => string;
}) {
  const { match, ranksBefore, ranksAfter } = plan;
  const reopens = plan.statusAfter !== plan.statusBefore;
  const ranksChange =
    ranksBefore.championId !== ranksAfter.championId || ranksBefore.runnerUpId !== ranksAfter.runnerUpId;
  return (
    <div id="bracket-correction" className="scroll-mt-24">
      <Card className="space-y-4 border-lp-accent/50 p-5 md:p-6">
        <CardHeader className="p-0">
          <CardTitle>Confirm this result correction</CardTitle>
          <CardDescription>Nothing has been saved yet. Review what this changes first.</CardDescription>
        </CardHeader>
        <div className="space-y-1 text-sm text-lp-text">
          <p className="font-semibold">
            Round {match.round}: {teamName(match.homeTeamId)} vs {teamName(match.awayTeamId)}
          </p>
          <p>
            Score {match.homeScore ?? "-"}–{match.awayScore ?? "-"} becomes {plan.homeScore}–{plan.awayScore}.
          </p>
          <p>
            {plan.winnerBefore === plan.winnerAfter
              ? `${teamName(plan.winnerAfter)} still wins, but later rounds don't match this result yet.`
              : `Winner changes from ${teamName(plan.winnerBefore)} to ${teamName(plan.winnerAfter)}.`}
          </p>
        </div>
        {plan.laterChanges.length > 0 ? (
          <div>
            <p className="text-sm font-semibold text-lp-text">Later matches affected</p>
            <ul className="mt-2 space-y-2">
              {plan.laterChanges.map((change) => (
                <li
                  key={change.id}
                  className="rounded-[10px] border border-lp-border bg-lp-bg/40 px-3 py-2 text-sm text-lp-text"
                >
                  <span className="font-medium">Round {change.round}:</span> {teamName(change.homeBefore)} vs{" "}
                  {teamName(change.awayBefore)} becomes {teamName(change.homeAfter)} vs {teamName(change.awayAfter)}.
                  {change.clearsResult ? (
                    <span className="text-lp-muted">
                      {" "}
                      Its recorded result
                      {change.scoreBefore ? ` (${change.scoreBefore.home}–${change.scoreBefore.away})` : ""} will be
                      cleared and must be entered again.
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {reopens ? (
          <p className="text-sm text-lp-text">
            The competition goes back to in progress
            {ranksBefore.championId
              ? `, and ${teamName(ranksBefore.championId)} is no longer shown as the winner until the bracket is finished again`
              : ""}
            .
          </p>
        ) : ranksChange ? (
          <p className="text-sm text-lp-text">
            The winner becomes {teamName(ranksAfter.championId)} and the runner-up becomes{" "}
            {teamName(ranksAfter.runnerUpId)}.
          </p>
        ) : null}
        <p className="text-sm text-lp-muted">Registrations, payments and every other match result stay as they are.</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <form action={updateMatchScoreFormAction}>
            <input type="hidden" name="competitionId" value={competitionId} />
            <input type="hidden" name="matchId" value={match.id} />
            <input type="hidden" name="homeScore" value={plan.homeScore} />
            <input type="hidden" name="awayScore" value={plan.awayScore} />
            <input type="hidden" name="confirmFingerprint" value={plan.fingerprint} />
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Confirm correction
            </Button>
          </form>
          <Button variant="secondary" size="lg" asChild>
            <Link href={`${venueAppRoutes.competitions}/${competitionId}`}>Keep current results</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default async function CompetitionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    notice?: string;
    created?: string;
    published?: string;
    correct?: string;
    home?: string;
    away?: string;
  }>;
}) {
  const { id } = await params;
  const { notice, created, published, correct, home, away } = await searchParams;
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");
  const canDuplicate = venueStaffCanCreateAndPublish(access.role);
  const canEditResults = venueStaffCanEditCompetitionResults(access.role);

  const comp = await prisma.competition.findFirst({
    where: { id, venueId: access.venueId },
    include: {
      prizeStructure: true,
      registrations: {
        include: {
          user: { select: { name: true, email: true } },
          payment: { select: { status: true, provider: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      venue: { select: { slug: true, name: true } },
      matches: {
        orderBy: [{ round: "asc" }, { id: "asc" }],
        include: { homeTeam: true, awayTeam: true },
      },
      standings: {
        orderBy: [{ rank: "asc" }, { points: "desc" }],
        include: { team: { select: { name: true } } },
      },
      _count: {
        select: {
          registrations: { where: { status: { in: CAP_COUNT_STATUSES } } },
          teams: true,
          matches: true,
        },
      },
    },
  });
  if (!comp) notFound();

  const confirmedCount = await prisma.competitionRegistration.count({
    where: { competitionId: comp.id, status: "CONFIRMED" },
  });
  const isRunnableFormat = RUNNABLE_BRACKET_KINDS.includes(comp.bracketKind);
  const rounds = comp.matches.length ? Math.max(...comp.matches.map((m) => m.round)) : 0;
  const latestRoundMatches = comp.matches.filter((m) => m.round === rounds);
  const latestRoundComplete = latestRoundMatches.length > 0 && latestRoundMatches.every((m) => m.completedAt);
  const isSingleElimination = comp.bracketKind === BracketKind.SINGLE_ELIMINATION;
  // After a correction the round in play can be earlier than the latest round generated.
  const currentRound = isSingleElimination ? (comp.matches.find((m) => !m.completedAt)?.round ?? rounds) : rounds;
  const currentRoundMatchCount = comp.matches.filter((m) => m.round === currentRound).length;
  const champion = comp.standings.find((s) => s.rank === 1)?.team?.name ?? null;

  const teamNames = new Map<string, string>();
  for (const m of comp.matches) {
    if (m.homeTeam) teamNames.set(m.homeTeam.id, m.homeTeam.name);
    if (m.awayTeam) teamNames.set(m.awayTeam.id, m.awayTeam.name);
  }
  const teamName = (teamId: string | null) => (teamId ? (teamNames.get(teamId) ?? "Unknown") : "TBD");

  const bracketMismatchIds = isSingleElimination ? findBracketMismatches(comp) : [];
  const bracketMismatches = comp.matches.filter((m) => bracketMismatchIds.includes(m.id));
  const correctedHome = parseScoreParam(home);
  const correctedAway = parseScoreParam(away);
  const correctionPlan =
    canEditResults && isSingleElimination && correct && correctedHome !== null && correctedAway !== null
      ? planSingleEliminationScore({
          status: comp.status,
          matches: comp.matches,
          standings: comp.standings,
          matchId: correct,
          homeScore: correctedHome,
          awayScore: correctedAway,
        })
      : null;
  const correction = correctionPlan?.kind === "save" && correctionPlan.requiresConfirmation ? correctionPlan : null;

  const spots =
    comp.participantCap != null ? Math.max(0, comp.participantCap - comp._count.registrations) : null;
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const compPublicUrl = `${base}/c/${comp.venue.slug}/${comp.slug}`;
  const qr = await buildQrDataUrl(compPublicUrl);

  return (
    <div className="space-y-8 md:space-y-10">
      {created === "1" ? (
        <TrackView event="competition_created" params={{ product: "lp", competitionId: comp.id, kind: comp.kind }} />
      ) : null}
      {published === "1" ? (
        <TrackOnce event="competition_published" subject={comp.id} params={{ product: "lp", competitionId: comp.id, kind: comp.kind }} />
      ) : null}
      {notice && notices[notice] ? (
        <div
          className={
            notice === "read-only"
              ? "rounded-[10px] border border-lp-border bg-lp-surface/60 px-4 py-3 text-sm text-lp-text"
              : "rounded-[10px] border border-lp-accent/35 bg-lp-accent/10 px-4 py-3 text-sm font-medium text-lp-text"
          }
        >
          {notices[notice]}
        </div>
      ) : null}

      {correction ? <BracketCorrectionPanel competitionId={comp.id} plan={correction} teamName={teamName} /> : null}

      {canEditResults && bracketMismatches.length > 0 && !correction ? (
        <div className="rounded-[10px] border border-lp-accent/35 bg-lp-accent/10 px-4 py-3 text-sm text-lp-text">
          <p className="font-semibold">Later rounds don&apos;t match a saved result</p>
          <ul className="mt-1 list-disc pl-5">
            {bracketMismatches.map((m) => (
              <li key={m.id}>
                Round {m.round}: {teamName(m.homeTeamId)} vs {teamName(m.awayTeamId)}
              </li>
            ))}
          </ul>
          <p className="mt-1">
            Save the correct score for that match. You&apos;ll see what changes before anything is updated.
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Button variant="ghost" asChild className="-ml-3 mb-2 text-lp-muted">
            <Link href={venueAppRoutes.competitions}>← All competitions</Link>
          </Button>
          <h1 className="lp-page-title text-3xl md:text-4xl">{comp.title}</h1>
          <p className="mt-2 text-base text-lp-muted">
            {comp.venue.name} | {comp.kind.replaceAll("_", " ")}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Badge variant="muted" className="w-fit">
            {comp.status.replaceAll("_", " ")}
          </Badge>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href={`/c/${comp.venue.slug}/${comp.slug}`}>Open public signup page</Link>
          </Button>
          <a
            href={qr}
            download={`${comp.slug}-signup-qr.png`}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-lp-accent hover:underline"
          >
            Download signup QR
          </a>
          {canDuplicate ? (
            <form action={duplicateCompetitionFormAction} className="w-full sm:w-auto">
              <input type="hidden" name="competitionId" value={comp.id} />
              <Button type="submit" variant="secondary" size="lg" className="w-full">
                Duplicate & relaunch
              </Button>
            </form>
          ) : (
            <p className="w-full max-w-xs text-sm text-lp-muted sm:self-center">
              Duplicating events requires an owner or manager.
            </p>
          )}
        </div>
      </div>
      <Card className="flex flex-col gap-5 md:flex-row md:items-start">
        <img
          src={qr}
          alt="Competition signup QR code"
          className="h-28 w-28 shrink-0 rounded border border-lp-border bg-white p-1"
        />
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="lp-kicker">Share &amp; display</p>
            <p className="mt-1 text-sm text-lp-muted">
              Print the QR for tables and the bar, put the scoreboard on a TV, and let players save the date.
            </p>
          </div>
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            <li>
              <Link
                href={`/c/${comp.venue.slug}/${comp.slug}/scoreboard?tv=1`}
                target="_blank"
                className="font-semibold text-lp-accent hover:underline"
              >
                TV scoreboard ↗
              </Link>
              <span className="block text-xs text-lp-muted">
                Open this link in the TV&apos;s browser (or bookmark it). Big-screen layout, refreshes every 30 seconds, shows the signup QR.
              </span>
            </li>
            <li>
              <a href={qr} download={`${comp.slug}-signup-qr.png`} className="font-semibold text-lp-accent hover:underline">
                Signup QR (PNG)
              </a>
              <span className="block text-xs text-lp-muted">Players scan it to open the signup page. No app needed.</span>
            </li>
            <li>
              <a href={`/c/${comp.venue.slug}/${comp.slug}/calendar`} className="font-semibold text-lp-accent hover:underline">
                Add-to-calendar file (.ics)
              </a>
              <span className="block text-xs text-lp-muted">Also linked on the public page for players.</span>
            </li>
            {canEditResults ? (
              <li>
                <span className="font-semibold text-lp-text">Export CSV:</span>{" "}
                {canDuplicate ? (
                  <>
                    <a href={`/venue/competitions/${comp.id}/export/registrations`} className="text-lp-accent hover:underline">
                      registrations
                    </a>
                    {" · "}
                  </>
                ) : null}
                <a href={`/venue/competitions/${comp.id}/export/standings`} className="text-lp-accent hover:underline">
                  standings
                </a>
                {" · "}
                <a href={`/venue/competitions/${comp.id}/export/results`} className="text-lp-accent hover:underline">
                  results
                </a>
                <span className="block text-xs text-lp-muted">Opens in Excel or Google Sheets.</span>
              </li>
            ) : null}
          </ul>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="lp-kicker">Entry</p>
          <p className="mt-2 font-display text-2xl font-bold tabular-nums text-lp-text">
            {formatMoney(comp.entryFeeCents, comp.entryFeeCurrency)}
          </p>
          {comp.entryFeeCents > 0 ? (
            <p className="mt-2 text-xs leading-relaxed text-lp-muted">
              This is the amount on the public page. Players pay through Stripe Checkout; LeaguePour stores status from
              Stripe webhooks.
            </p>
          ) : null}
        </Card>
        <Card>
          <p className="lp-kicker">Signup closes</p>
          <p className="mt-2 font-display text-lg font-bold leading-snug text-lp-text">
            {formatDateTime(comp.signupCloseAt)}
          </p>
        </Card>
        <Card>
          <p className="lp-kicker">Capacity</p>
          <p className="mt-2 font-display text-2xl font-bold tabular-nums text-lp-text">
            {comp._count.registrations}
            {comp.participantCap != null ? (
              <span className="text-base font-semibold text-lp-muted"> / {comp.participantCap}</span>
            ) : null}
          </p>
          {spots != null ? (
            <p className="mt-2 text-sm font-semibold text-lp-success">{spots} spots left</p>
          ) : (
            <p className="mt-2 text-sm text-lp-muted">No cap set</p>
          )}
        </Card>
      </div>

      <FormatGuide bracketKind={comp.bracketKind} />

      {isRunnableFormat && canDuplicate ? (
        <Card className="space-y-4 p-5 md:p-6">
          <CardHeader className="p-0">
            <CardTitle>Tournament control</CardTitle>
            <CardDescription>Your next action for this competition&apos;s current status.</CardDescription>
          </CardHeader>

          {comp.status === CompetitionStatus.SIGNUP_OPEN || comp.status === CompetitionStatus.SIGNUP_CLOSED ? (
            <div className="space-y-4">
              <ul className="list-disc space-y-1 pl-5 text-sm text-lp-muted">
                {describeBracket(
                  comp.bracketKind as "SINGLE_ELIMINATION" | "ROUND_ROBIN",
                  confirmedCount,
                ).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                {comp.status === CompetitionStatus.SIGNUP_OPEN ? (
                  <form action={closeSignupFormAction}>
                    <input type="hidden" name="competitionId" value={comp.id} />
                    <Button type="submit" variant="secondary" size="lg">
                      Close signup
                    </Button>
                  </form>
                ) : null}
                <form action={startTournamentFormAction}>
                  <input type="hidden" name="competitionId" value={comp.id} />
                  <Button type="submit" size="lg" disabled={confirmedCount < 2}>
                    Start tournament - generate {comp.bracketKind === BracketKind.SINGLE_ELIMINATION ? "Round 1" : "full schedule"}
                  </Button>
                </form>
              </div>
              {confirmedCount < 2 ? (
                <p className="text-sm text-lp-muted">Need at least 2 confirmed registrations to start.</p>
              ) : null}
            </div>
          ) : null}

          {comp.status === CompetitionStatus.IN_PROGRESS ? (
            <div className="space-y-3">
              <p className="text-sm text-lp-text">
                Current round: <span className="font-semibold">{currentRound}</span> ({currentRoundMatchCount} match
                {currentRoundMatchCount === 1 ? "" : "es"})
              </p>
              {isSingleElimination ? (
                bracketMismatches.length > 0 ? (
                  <p className="text-sm text-lp-muted">Fix the flagged result before advancing.</p>
                ) : latestRoundComplete ? (
                  <form action={advanceRoundFormAction}>
                    <input type="hidden" name="competitionId" value={comp.id} />
                    <Button type="submit" size="lg">
                      Advance to next round
                    </Button>
                  </form>
                ) : (
                  <p className="text-sm text-lp-muted">
                    Enter every score in the current round below, then come back here to advance.
                  </p>
                )
              ) : (
                <p className="text-sm text-lp-muted">
                  Round robin advances itself - standings below update automatically as scores are entered, and the
                  tournament completes on its own once every scheduled match has a result.
                </p>
              )}
            </div>
          ) : null}

          {comp.status === CompetitionStatus.COMPLETED ? (
            <div className="space-y-1">
              <p className="text-lg font-semibold text-lp-text">
                {champion ? `Winner: ${champion}` : "Tournament complete"}
              </p>
              <p className="text-sm text-lp-muted">Final bracket and match history are below.</p>
            </div>
          ) : null}
        </Card>
      ) : null}

      {isRunnableFormat &&
      (comp.status === CompetitionStatus.DRAFT ||
        comp.status === CompetitionStatus.SIGNUP_OPEN ||
        comp.status === CompetitionStatus.SIGNUP_CLOSED) ? (
        <SampleBracketPreview bracketKind={comp.bracketKind as "SINGLE_ELIMINATION" | "ROUND_ROBIN"} />
      ) : null}

      {!isRunnableFormat ? (
        <FieldHelp title="Automatic bracket generation isn't available for this format yet">
          <p>
            Single elimination and round robin generate matches and standings automatically. This competition is set
            to a different bracket style, so results still need to be entered manually below - edit the competition
            and switch its bracket style to use automatic generation.
          </p>
        </FieldHelp>
      ) : null}

      <FieldHelp title="Results entry (venue)">
        <p>
          Match rows drive bracket cards on Standings. Standings table edits are for round robin / season boards. This
          is venue-only - players never see this copy.
        </p>
      </FieldHelp>

      {!canEditResults && (comp.matches.length > 0 || comp.standings.length > 0) ? (
        <div className="rounded-[10px] border border-lp-border bg-lp-surface/40 px-4 py-3 text-sm text-lp-muted">
          Your venue role can view results here; score entry is limited when staff permissions are missing. Ask an owner
          or manager to confirm your role in venue staff.
        </div>
      ) : null}

      {canEditResults && !isRunnableFormat ? (
        <Card className="space-y-4 p-5 md:p-6">
          <CardHeader className="p-0">
            <CardTitle>Add a match</CardTitle>
            <CardDescription>
              Add each round&apos;s matches here as you set them, then enter scores below once they&apos;re played.
            </CardDescription>
          </CardHeader>
          <form action={addMatchFormAction} className="grid gap-3 sm:grid-cols-[100px_1fr_auto] sm:items-end">
            <input type="hidden" name="competitionId" value={comp.id} />
            <div>
              <Label htmlFor="round">Round</Label>
              <Input id="round" name="round" type="number" min={1} defaultValue={1} className="mt-1.5 min-h-12" required />
            </div>
            <div>
              <Label htmlFor="label">Matchup</Label>
              <Input id="label" name="label" placeholder="Rachel's Team vs The Regulars" className="mt-1.5 min-h-12" required />
            </div>
            <Button type="submit" size="lg" className="min-h-12">
              Add match
            </Button>
          </form>
        </Card>
      ) : null}

      {comp.matches.length > 0 ? (
        <Card className="space-y-6 p-5 md:p-6">
          <CardHeader className="p-0">
            <CardTitle>Matches</CardTitle>
            <CardDescription>
              {canEditResults ? "Save scores when both sides have checked in." : "Scores as entered (read-only)."}
              {canEditResults && isSingleElimination
                ? " If a correction changes a winner after the bracket has moved on, you'll review what it affects before anything is saved."
                : ""}
            </CardDescription>
          </CardHeader>
          <ul className="space-y-6">
            {comp.matches.map((m, i) => {
              const isBye = isSingleElimination
                ? isSingleEliminationBye(m)
                : isRunnableFormat && m.awayTeamId === null && m.homeTeamId !== null;
              const isWaiting = isSingleElimination && m.round > 1 && (!m.homeTeamId || !m.awayTeamId);
              const showRoundHeading = isRunnableFormat && (i === 0 || comp.matches[i - 1].round !== m.round);
              return (
              <li key={m.id}>
                {showRoundHeading ? <p className="lp-kicker mb-2 mt-4 first:mt-0">Round {m.round}</p> : null}
                <div
                  className="rounded-[10px] border border-lp-border bg-lp-bg/40 p-4 md:flex md:flex-wrap md:items-end md:gap-4"
                >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-lp-text">
                    {isBye ? `${m.homeTeam?.name} - bye` : `${m.homeTeam?.name ?? "TBD"} vs ${m.awayTeam?.name ?? "TBD"}`}
                  </p>
                  {isBye ? (
                    <p className="text-sm text-lp-muted">Advances automatically - no match played.</p>
                  ) : isWaiting ? (
                    <p className="text-sm text-lp-muted">Waiting on an earlier result.</p>
                  ) : m.label ? (
                    <p className="text-sm text-lp-muted">{m.label}</p>
                  ) : null}
                  {m.completedAt && !isBye ? (
                    <p className="mt-1 text-xs text-lp-muted">Last saved {formatDateTime(m.completedAt)}</p>
                  ) : null}
                </div>
                {isBye || isWaiting ? null : canEditResults ? (
                  <form action={updateMatchScoreFormAction} className="mt-4 grid max-w-md grid-cols-2 gap-3 md:mt-0">
                    <input type="hidden" name="competitionId" value={comp.id} />
                    <input type="hidden" name="matchId" value={m.id} />
                    <div>
                      <Label htmlFor={`h-${m.id}`}>Home score</Label>
                      <Input
                        id={`h-${m.id}`}
                        name="homeScore"
                        type="number"
                        min={0}
                        max={999}
                        inputMode="numeric"
                        defaultValue={m.homeScore ?? ""}
                        className="mt-1.5 min-h-12 text-base"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`a-${m.id}`}>Away score</Label>
                      <Input
                        id={`a-${m.id}`}
                        name="awayScore"
                        type="number"
                        min={0}
                        max={999}
                        inputMode="numeric"
                        defaultValue={m.awayScore ?? ""}
                        className="mt-1.5 min-h-12 text-base"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Button type="submit" size="lg" className="w-full sm:w-auto">
                        Save match
                      </Button>
                    </div>
                  </form>
                ) : (
                  <p className="mt-4 font-display text-lg font-bold tabular-nums text-lp-text md:mt-0">
                    {m.homeScore ?? "-"} – {m.awayScore ?? "-"}
                  </p>
                )}
                </div>
              </li>
              );
            })}
          </ul>
        </Card>
      ) : null}

      {comp.standings.length > 0 ? (
        <Card className="space-y-6 p-5 md:p-6">
          <CardHeader className="p-0">
            <CardTitle>Standings rows</CardTitle>
            <CardDescription>
              {canEditResults
                ? "Adjust wins / losses / points for leaderboard-style events."
                : "Current board (read-only)."}
            </CardDescription>
          </CardHeader>
          <ul className="space-y-5">
            {comp.standings.map((s) => (
              <li key={s.id} className="rounded-[10px] border border-lp-border bg-lp-bg/40 p-4">
                <p className="font-semibold text-lp-text">{s.team?.name ?? "Individual"}</p>
                {canEditResults ? (
                  <form action={updateStandingRowFormAction} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <input type="hidden" name="competitionId" value={comp.id} />
                    <input type="hidden" name="standingId" value={s.id} />
                    <div>
                      <Label>Wins</Label>
                      <Input
                        name="wins"
                        type="number"
                        min={0}
                        max={99}
                        defaultValue={s.wins}
                        className="mt-1.5 min-h-12 text-base"
                        inputMode="numeric"
                        required
                      />
                    </div>
                    <div>
                      <Label>Losses</Label>
                      <Input
                        name="losses"
                        type="number"
                        min={0}
                        max={99}
                        defaultValue={s.losses}
                        className="mt-1.5 min-h-12 text-base"
                        inputMode="numeric"
                        required
                      />
                    </div>
                    <div>
                      <Label>Ties</Label>
                      <Input
                        name="ties"
                        type="number"
                        min={0}
                        max={99}
                        defaultValue={s.ties}
                        className="mt-1.5 min-h-12 text-base"
                        inputMode="numeric"
                        required
                      />
                    </div>
                    <div>
                      <Label>Points</Label>
                      <Input
                        name="points"
                        type="number"
                        min={0}
                        step="0.5"
                        defaultValue={s.points}
                        className="mt-1.5 min-h-12 text-base"
                        inputMode="decimal"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-5">
                      <Button type="submit" size="lg" className="w-full sm:w-auto">
                        Save standing
                      </Button>
                    </div>
                  </form>
                ) : (
                  <p className="mt-2 text-sm tabular-nums text-lp-muted">
                    W {s.wins} | L {s.losses} | T {s.ties} | Pts {s.points}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
          <CardDescription className="text-lp-muted">{comp.description}</CardDescription>
        </CardHeader>
      </Card>

      {comp.prizeStructure ? (
        <Card>
          <CardHeader>
            <CardTitle>Prize structure</CardTitle>
            <CardDescription>{comp.prizeStructure.summary}</CardDescription>
          </CardHeader>
          {comp.prizeStructure.payoutNotes ? (
            <p className="px-6 pb-6 text-sm text-lp-muted">{comp.prizeStructure.payoutNotes}</p>
          ) : null}
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Registrations</CardTitle>
          <CardDescription>
            {comp._count.registrations} toward cap | {comp._count.teams} teams | includes confirmed signups and anyone
            still finishing Stripe checkout.
          </CardDescription>
        </CardHeader>
        <ul className="divide-y divide-lp-border border-t border-lp-border">
          {comp.registrations.length === 0 ? (
            <li className="px-6 py-8 text-center text-sm text-lp-muted">No signups yet - open the public page.</li>
          ) : (
            comp.registrations.map((r) => {
              const payPres = presentRegistrationPaymentFromRow(r, comp.entryFeeCents);
              return (
                <li key={r.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium">{r.user.name ?? "Player"}</p>
                    <p className="text-sm text-lp-muted">{r.user.email}</p>
                    <p className="mt-2 max-w-md text-xs text-lp-muted">{payPres.description}</p>
                  </div>
                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <div className="flex flex-wrap items-center gap-2">
                      {r.roleLabel ? <Badge variant="accent">{r.roleLabel}</Badge> : null}
                      <Badge variant="muted">{r.status.replaceAll("_", " ")}</Badge>
                      <RegistrationPaymentBadge presentation={payPres} />
                    </div>
                    {venueStaffCanCreateAndPublish(access.role) &&
                    (payPres.ui === "paid" || payPres.ui === "paid_placeholder") ? (
                      <form action={refundRegistrationPaymentFormAction}>
                        <input type="hidden" name="registrationId" value={r.id} />
                        <Button type="submit" variant="ghost" className="h-auto min-h-10 px-2 text-xs text-lp-muted">
                          {r.payment?.provider === "stripe" ? "Issue Stripe refund" : "Mark refunded (test ledger)"}
                        </Button>
                      </form>
                    ) : null}
                  </div>
                </li>
              );
            })
          )}
        </ul>
        <div className="border-t border-lp-border px-6 py-4">
          <Button variant="secondary" size="lg" className="w-full sm:w-auto" asChild>
            <Link href={venueAppRoutes.registrations}>Open full registrations ledger</Link>
          </Button>
          <p className="mt-2 text-xs text-lp-muted">
            Cross-event check-in view - filters by venue, not this competition only.
          </p>
        </div>
      </Card>
    </div>
  );
}
