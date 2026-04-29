import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
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
  duplicateCompetitionFormAction,
  updateMatchScoreFormAction,
  updateStandingRowFormAction,
} from "./actions";

const notices: Record<string, string> = {
  duplicated: "Duplicate created as a draft with fresh signup dates — review and publish when ready.",
  "match-saved": "Match scores saved. Bracket view on Standings updates from these rows.",
  "standing-saved": "Standings row updated.",
  "invalid-scores": "Scores must be whole numbers between 0 and 999.",
  "invalid-standing": "Check wins, losses, ties, and points.",
  "read-only": "That action is not available for your venue role. Ask an owner or manager if you need it done.",
};

export default async function CompetitionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const { id } = await params;
  const { notice } = await searchParams;
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
        },
      },
    },
  });
  if (!comp) notFound();

  const spots =
    comp.participantCap != null ? Math.max(0, comp.participantCap - comp._count.registrations) : null;
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const compPublicUrl = `${base}/c/${comp.venue.slug}/${comp.slug}`;
  const qr = await buildQrDataUrl(compPublicUrl);

  return (
    <div className="space-y-8 md:space-y-10">
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

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Button variant="ghost" asChild className="-ml-3 mb-2 text-lp-muted">
            <Link href={venueAppRoutes.competitions}>← All competitions</Link>
          </Button>
          <h1 className="lp-page-title text-3xl md:text-4xl">{comp.title}</h1>
          <p className="mt-2 text-base text-lp-muted">
            {comp.venue.name} · {comp.kind.replaceAll("_", " ")}
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
      <img src={qr} alt="Competition signup QR code" className="h-24 w-24 rounded border border-lp-border bg-lp-bg p-1" />

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

      <FieldHelp title="Results entry (venue)">
        <p>
          Match rows drive bracket cards on Standings. Standings table edits are for round robin / season boards. This
          is venue-only — players never see this copy.
        </p>
      </FieldHelp>

      {!canEditResults && (comp.matches.length > 0 || comp.standings.length > 0) ? (
        <div className="rounded-[10px] border border-lp-border bg-lp-surface/40 px-4 py-3 text-sm text-lp-muted">
          Your venue role can view results here; score entry is limited when staff permissions are missing. Ask an owner
          or manager to confirm your role in venue staff.
        </div>
      ) : null}

      {comp.matches.length > 0 ? (
        <Card className="space-y-6 p-5 md:p-6">
          <CardHeader className="p-0">
            <CardTitle>Matches</CardTitle>
            <CardDescription>
              {canEditResults ? "Save scores when both sides have checked in." : "Scores as entered (read-only)."}
            </CardDescription>
          </CardHeader>
          <ul className="space-y-6">
            {comp.matches.map((m) => (
              <li
                key={m.id}
                className="rounded-[10px] border border-lp-border bg-lp-bg/40 p-4 md:flex md:flex-wrap md:items-end md:gap-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-lp-text">
                    {m.homeTeam?.name ?? "TBD"} vs {m.awayTeam?.name ?? "TBD"}
                  </p>
                  {m.label ? <p className="text-sm text-lp-muted">{m.label}</p> : null}
                  {m.completedAt ? (
                    <p className="mt-1 text-xs text-lp-muted">Last saved {formatDateTime(m.completedAt)}</p>
                  ) : null}
                </div>
                {canEditResults ? (
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
                    {m.homeScore ?? "—"} – {m.awayScore ?? "—"}
                  </p>
                )}
              </li>
            ))}
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
                    W {s.wins} · L {s.losses} · T {s.ties} · Pts {s.points}
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
            {comp._count.registrations} toward cap · {comp._count.teams} teams · includes confirmed signups and anyone
            still finishing Stripe checkout.
          </CardDescription>
        </CardHeader>
        <ul className="divide-y divide-lp-border border-t border-lp-border">
          {comp.registrations.length === 0 ? (
            <li className="px-6 py-8 text-center text-sm text-lp-muted">No signups yet — open the public page.</li>
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
            Cross-event check-in view — filters by venue, not this competition only.
          </p>
        </div>
      </Card>
    </div>
  );
}
