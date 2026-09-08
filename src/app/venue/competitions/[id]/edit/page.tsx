import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { FieldHelp, FieldHint } from "@/components/forms/field-help";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/db";
import { venueAppRoutes } from "@/lib/routes";
import { resolvePrimaryVenueAccess, venueStaffCanCreateAndPublish } from "@/lib/venue-permissions";
import { CompetitionStatus } from "@/generated/prisma/enums";
import { updateCompetitionAction } from "../actions";

function toDatetimeLocalValue(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

const builderErrorMessages: Record<string, string> = {
  title: "Add a title so players know which night this is.",
  dates: "Use valid dates for signup open/close and start/end.",
  "upgrade-plan": "Publishing this would put you over your plan's active-events limit. Archive or wrap up another event first, or upgrade your plan.",
};

const kinds = [
  ["TRIVIA", "Trivia"],
  ["DARTS", "Darts"],
  ["CORNHOLE", "Cornhole / bags"],
  ["EUCHRE", "Euchre"],
  ["POKER", "Poker"],
  ["POOL", "Pool"],
  ["SHUFFLEBOARD", "Shuffleboard"],
  ["CUSTOM", "Custom"],
] as const;

const formats = [
  ["SOLO", "Solo signup"],
  ["CAPTAIN_TEAM", "Captain registers team"],
  ["TEAM_MEMBERS", "Team members + invites"],
] as const;

// Only bracket kinds LeaguePour can actually generate matches/standings for automatically
// (src/lib/tournament.ts) are offered for new selections here - plus Custom, which is
// intentionally manual by design. A competition already set to an unsupported kind (from before
// this changed) still shows that value below so the form doesn't silently rewrite it - but
// switching to Single elimination or Round robin is the only way to get automatic generation.
const brackets = [
  ["ROUND_ROBIN", "Round robin"],
  ["SINGLE_ELIMINATION", "Single elimination"],
  ["CUSTOM", "Custom / hybrid (you run it manually)"],
] as const;
const legacyBracketLabels: Record<string, string> = {
  DOUBLE_ELIMINATION: "Double elimination (not supported for auto-generation - switch to save)",
  LADDER: "Ladder (not supported for auto-generation - switch to save)",
  SEASON: "Season standings (not supported for auto-generation - switch to save)",
  POINTS: "Points leaderboard (not supported for auto-generation - switch to save)",
};

const schedules = [
  ["ONE_TIME", "One night / one weekend"],
  ["RECURRING", "Recurring league or season"],
] as const;

export default async function EditCompetitionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");
  if (!venueStaffCanCreateAndPublish(access.role)) redirect("/venue/competitions?notice=read-only");

  const { id } = await params;
  const comp = await prisma.competition.findFirst({
    where: { id, venueId: access.venueId },
    include: { prizeStructure: true },
  });
  if (!comp) notFound();
  const editableStatuses: CompetitionStatus[] = [
    CompetitionStatus.DRAFT,
    CompetitionStatus.PUBLISHED,
    CompetitionStatus.SIGNUP_OPEN,
    CompetitionStatus.SIGNUP_CLOSED,
  ];
  if (!editableStatuses.includes(comp.status)) {
    redirect(`/venue/competitions/${id}?notice=not-editable`);
  }

  const sp = await searchParams;
  const err = sp.error;
  const errMessage = err ? builderErrorMessages[err] ?? `Check your inputs (${err}).` : null;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-lp-muted">Competition builder</p>
          <h1 className="lp-page-title text-3xl md:text-4xl">
            {comp.status === CompetitionStatus.DRAFT ? "Continue setup" : "Edit competition"}
          </h1>
          <p className="mt-2 text-sm text-lp-muted">Change any setting below, then save.</p>
        </div>
        <Button variant="secondary" asChild>
          <Link href={venueAppRoutes.competitions}>Back to list</Link>
        </Button>
      </div>

      {errMessage ? (
        <Card className="border-lp-warning/40 bg-lp-warning/10 px-4 py-3 text-base text-lp-text">{errMessage}</Card>
      ) : null}

      <form action={updateCompetitionAction} className="space-y-10">
        <input type="hidden" name="competitionId" value={comp.id} />
        <Card className="space-y-5">
          <h2 className="lp-page-title text-xl">Basics</h2>
          <div>
            <Label htmlFor="title">Competition title</Label>
            <Input id="title" name="title" className="mt-1.5" defaultValue={comp.title} required />
            <FieldHint>Shown on your public page and reminders. Keep it specific.</FieldHint>
          </div>
          <div>
            <Label htmlFor="slug">URL slug</Label>
            <Input id="slug" name="slug" className="mt-1.5" defaultValue={comp.slug} />
            <FieldHint>Changing this changes your public page URL.</FieldHint>
          </div>
          <div>
            <Label htmlFor="kind">Competition type</Label>
            <select
              id="kind"
              name="kind"
              className="mt-1.5 flex w-full min-h-12 rounded-[10px] border border-lp-border bg-lp-bg/80 px-4 text-base text-lp-text outline-none focus:border-lp-accent/60 focus:ring-2 focus:ring-lp-accent/25"
              defaultValue={comp.kind}
            >
              {kinds.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={comp.description} />
          </div>
        </Card>

        <Card className="space-y-5">
          <h2 className="lp-page-title text-xl">Signup window & run dates</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="signupOpenAt">Signup opens</Label>
              <Input
                id="signupOpenAt"
                name="signupOpenAt"
                type="datetime-local"
                className="mt-1.5"
                defaultValue={toDatetimeLocalValue(comp.signupOpenAt)}
                required
              />
            </div>
            <div>
              <Label htmlFor="signupCloseAt">Signup closes</Label>
              <Input
                id="signupCloseAt"
                name="signupCloseAt"
                type="datetime-local"
                className="mt-1.5"
                defaultValue={toDatetimeLocalValue(comp.signupCloseAt)}
                required
              />
            </div>
            <div>
              <Label htmlFor="startAt">Competition starts</Label>
              <Input
                id="startAt"
                name="startAt"
                type="datetime-local"
                className="mt-1.5"
                defaultValue={toDatetimeLocalValue(comp.startAt)}
                required
              />
            </div>
            <div>
              <Label htmlFor="endAt">Competition ends</Label>
              <Input
                id="endAt"
                name="endAt"
                type="datetime-local"
                className="mt-1.5"
                defaultValue={toDatetimeLocalValue(comp.endAt)}
                required
              />
            </div>
          </div>
        </Card>

        <Card className="space-y-5">
          <h2 className="lp-page-title text-xl">Entry fee & capacity</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="entryFee">Entry fee (USD)</Label>
              <Input
                id="entryFee"
                name="entryFee"
                type="number"
                min={0}
                step={0.01}
                className="mt-1.5"
                defaultValue={comp.entryFeeCents / 100}
              />
            </div>
            <div>
              <Label htmlFor="participantCap">Participant / team cap</Label>
              <Input
                id="participantCap"
                name="participantCap"
                type="number"
                min={1}
                className="mt-1.5"
                defaultValue={comp.participantCap ?? ""}
                placeholder="16"
              />
              <FieldHint>Leave empty for open field.</FieldHint>
            </div>
          </div>
          <label className="flex items-center gap-3 text-sm font-medium">
            <input
              type="checkbox"
              name="waitlistEnabled"
              defaultChecked={comp.waitlistEnabled}
              className="size-4 rounded border-lp-border"
            />
            Enable waitlist when cap is hit
          </label>
        </Card>

        <Card className="space-y-5">
          <h2 className="lp-page-title text-xl">Teams & captains</h2>
          <div>
            <Label htmlFor="teamFormat">Registration format</Label>
            <select
              id="teamFormat"
              name="teamFormat"
              className="mt-1.5 flex w-full min-h-12 rounded-[10px] border border-lp-border bg-lp-bg/80 px-4 text-base text-lp-text outline-none focus:border-lp-accent/60 focus:ring-2 focus:ring-lp-accent/25"
              defaultValue={comp.teamFormat}
            >
              {formats.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="teamSize">Team size</Label>
            <Input
              id="teamSize"
              name="teamSize"
              type="number"
              min={1}
              max={20}
              className="mt-1.5"
              defaultValue={comp.teamSize ?? ""}
              placeholder="2"
            />
          </div>
          <label className="flex items-center gap-3 text-sm font-medium">
            <input
              type="checkbox"
              name="captainRequired"
              defaultChecked={comp.captainRequired}
              className="size-4 rounded border-lp-border"
            />
            Captain required to complete roster
          </label>
        </Card>

        <Card className="space-y-5">
          <h2 className="lp-page-title text-xl">Format & schedule</h2>
          <FieldHelp title="Round robin vs elimination">
            <p>
              Round robin spreads losses across weeks, great for loyalty. Single elimination is
              fast drama on one stage. Double elimination keeps top teams alive longer.
            </p>
          </FieldHelp>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="scheduleKind">Schedule</Label>
              <select
                id="scheduleKind"
                name="scheduleKind"
                className="mt-1.5 flex w-full min-h-12 rounded-[10px] border border-lp-border bg-lp-bg/80 px-4 text-base text-lp-text outline-none focus:border-lp-accent/60 focus:ring-2 focus:ring-lp-accent/25"
                defaultValue={comp.scheduleKind}
              >
                {schedules.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="bracketKind">Bracket / standings style</Label>
              <select
                id="bracketKind"
                name="bracketKind"
                className="mt-1.5 flex w-full min-h-12 rounded-[10px] border border-lp-border bg-lp-bg/80 px-4 text-base text-lp-text outline-none focus:border-lp-accent/60 focus:ring-2 focus:ring-lp-accent/25"
                defaultValue={comp.bracketKind}
              >
                {legacyBracketLabels[comp.bracketKind] ? (
                  <option value={comp.bracketKind}>{legacyBracketLabels[comp.bracketKind]}</option>
                ) : null}
                {brackets.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="recurringRule">Recurring rule (optional)</Label>
            <Input id="recurringRule" name="recurringRule" defaultValue={comp.recurringRule ?? ""} placeholder="Every Thursday | 8 weeks + finals" />
          </div>
        </Card>

        <Card className="space-y-5">
          <h2 className="lp-page-title text-xl">Rules, prizes, waiver</h2>
          <div>
            <Label htmlFor="rules">House rules</Label>
            <Textarea id="rules" name="rules" defaultValue={comp.rules} />
          </div>
          <div>
            <Label htmlFor="prizeSummary">Prize structure summary</Label>
            <Input id="prizeSummary" name="prizeSummary" defaultValue={comp.prizeStructure?.summary ?? ""} placeholder="$300 pot + finals bar tab" />
          </div>
          <div>
            <Label htmlFor="payoutNotes">Payout notes (optional)</Label>
            <Textarea id="payoutNotes" name="payoutNotes" defaultValue={comp.prizeStructure?.payoutNotes ?? ""} />
          </div>
          <div>
            <Label htmlFor="waiverText">Waiver / terms (optional)</Label>
            <Textarea id="waiverText" name="waiverText" defaultValue={comp.waiverText ?? ""} />
          </div>
        </Card>

        <Card className="space-y-4">
          {comp.status === CompetitionStatus.DRAFT ? (
            <>
              <label className="flex items-center gap-3 text-sm font-medium">
                <input type="checkbox" name="publishNow" className="size-4 rounded border-lp-border" />
                Publish and open signup now
              </label>
              <FieldHint>If unchecked, this stays a draft - only staff can see it.</FieldHint>
            </>
          ) : (
            <p className="text-sm text-lp-muted">
              This competition is already live ({comp.status.replaceAll("_", " ").toLowerCase()}) - saving updates it in place.
            </p>
          )}
          <Button type="submit" size="lg" className="w-full sm:w-auto">
            Save changes
          </Button>
        </Card>
      </form>
    </div>
  );
}
