import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { FieldHelp, FieldHint } from "@/components/forms/field-help";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { venueAppRoutes } from "@/lib/routes";
import { cta } from "@/lib/brand";
import { resolvePrimaryVenueAccess, venueStaffCanCreateAndPublish } from "@/lib/venue-permissions";
import { createCompetitionAction } from "./actions";

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

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
};

const builderSteps = ["Basics", "Schedule & fees", "Teams", "Format", "Rules & prizes", "Publish"];

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

const brackets = [
  ["ROUND_ROBIN", "Round robin"],
  ["SINGLE_ELIMINATION", "Single elimination"],
  ["DOUBLE_ELIMINATION", "Double elimination"],
  ["LADDER", "Ladder"],
  ["SEASON", "Season standings"],
  ["POINTS", "Points leaderboard"],
  ["CUSTOM", "Custom / hybrid"],
] as const;

const schedules = [
  ["ONE_TIME", "One night / one weekend"],
  ["RECURRING", "Recurring league or season"],
] as const;

export default async function NewCompetitionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");
  if (!venueStaffCanCreateAndPublish(access.role)) redirect("/venue/competitions?notice=read-only");

  const sp = await searchParams;
  const err = sp.error;
  const errMessage = err ? builderErrorMessages[err] ?? `Check your inputs (${err}).` : null;

  const now = new Date();
  const endD = addDays(now, 21);
  endD.setHours(endD.getHours() + 4);
  const defaults = {
    signupOpen: toDatetimeLocalValue(addDays(now, 1)),
    signupClose: toDatetimeLocalValue(addDays(now, 14)),
    start: toDatetimeLocalValue(addDays(now, 21)),
    end: toDatetimeLocalValue(endD),
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-lp-muted">Competition builder</p>
          <h1 className="lp-page-title text-3xl md:text-4xl">Create competition</h1>
          <p className="mt-2 text-sm text-lp-muted">
            Detailed helper copy lives here — your public signup page stays clean.
          </p>
        </div>
        <Button variant="secondary" asChild>
          <Link href={venueAppRoutes.competitions}>Back to list</Link>
        </Button>
      </div>

      {errMessage ? (
        <Card className="border-lp-warning/40 bg-lp-warning/10 px-4 py-3 text-base text-lp-text">{errMessage}</Card>
      ) : null}

      <div className="rounded-2xl border border-lp-border bg-lp-surface/40 px-4 py-4 md:px-5">
        <p className="text-xs font-bold uppercase tracking-wider text-lp-muted">Builder flow</p>
        <ol className="mt-3 flex flex-wrap gap-2">
          {builderSteps.map((label, i) => (
            <li
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-lp-border bg-lp-bg/60 px-3 py-1.5 text-xs font-semibold text-lp-muted"
            >
              <span className="flex size-5 items-center justify-center rounded-full bg-lp-accent/20 text-[10px] text-lp-accent">
                {i + 1}
              </span>
              {label}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-lp-muted">
          One page, guided sections — {cta.buildCompetition.toLowerCase()} without losing context.
        </p>
      </div>

      <form action={createCompetitionAction} className="space-y-10">
        <Card className="space-y-5">
          <h2 className="lp-page-title text-xl">Basics</h2>
          <div>
            <Label htmlFor="title">Competition title</Label>
            <Input id="title" name="title" className="mt-1.5" placeholder="Friday Blind Draw Darts" required />
            <FieldHint>Shown on your public page and reminders. Keep it specific.</FieldHint>
          </div>
          <div>
            <Label htmlFor="slug">URL slug (optional)</Label>
            <Input id="slug" name="slug" className="mt-1.5" placeholder="friday-blind-draw" />
            <FieldHint>We generate one from the title if you leave this blank.</FieldHint>
          </div>
          <div>
            <Label htmlFor="kind">Competition type</Label>
            <select
              id="kind"
              name="kind"
              className="mt-1.5 flex w-full min-h-12 rounded-[10px] border border-lp-border bg-lp-bg/80 px-4 text-base text-lp-text outline-none focus:border-lp-accent/60 focus:ring-2 focus:ring-lp-accent/25"
              defaultValue="DARTS"
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
            <Textarea id="description" name="description" placeholder="What should players know before they pay?" />
          </div>
        </Card>

        <Card className="space-y-5">
          <h2 className="lp-page-title text-xl">Signup window & run dates</h2>
          <FieldHelp
            title="Best practice"
            example="Open signup 10–14 days before start for new formats; longer for leagues with travel teams."
          >
            <p>
              Signup close should be <span className="font-medium text-lp-text">before</span> you need
              brackets or schedules finalized. Players should always see a clear deadline.
            </p>
          </FieldHelp>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="signupOpenAt">Signup opens</Label>
              <Input
                id="signupOpenAt"
                name="signupOpenAt"
                type="datetime-local"
                className="mt-1.5"
                defaultValue={defaults.signupOpen}
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
                defaultValue={defaults.signupClose}
                required
              />
            </div>
            <div>
              <Label htmlFor="startAt">Competition starts</Label>
              <Input id="startAt" name="startAt" type="datetime-local" className="mt-1.5" defaultValue={defaults.start} required />
            </div>
            <div>
              <Label htmlFor="endAt">Competition ends</Label>
              <Input id="endAt" name="endAt" type="datetime-local" className="mt-1.5" defaultValue={defaults.end} required />
            </div>
          </div>
        </Card>

        <Card className="space-y-5">
          <h2 className="lp-page-title text-xl">Entry fee & capacity</h2>
          <FieldHelp title="What the entry fee affects">
            <p>
              The amount is shown on the public signup page and in player dashboards. When the fee is greater than zero,
              players complete payment on Stripe Checkout; LeaguePour records success from Stripe webhooks.
            </p>
          </FieldHelp>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="entryFee">Entry fee (USD)</Label>
              <Input id="entryFee" name="entryFee" type="number" min={0} step={0.01} className="mt-1.5" defaultValue={15} />
            </div>
            <div>
              <Label htmlFor="participantCap">Participant / team cap</Label>
              <Input id="participantCap" name="participantCap" type="number" min={1} className="mt-1.5" placeholder="16" />
              <FieldHint>Leave empty for open field.</FieldHint>
            </div>
          </div>
          <label className="flex items-center gap-3 text-sm font-medium">
            <input type="checkbox" name="waitlistEnabled" defaultChecked className="size-4 rounded border-lp-border" />
            Enable waitlist when cap is hit
          </label>
        </Card>

        <Card className="space-y-5">
          <h2 className="lp-page-title text-xl">Teams & captains</h2>
          <FieldHelp
            title="Captain required"
            example="Cornhole doubles: captain pays for pair, invites partner. Trivia: captain locks six-top roster."
          >
            <p>
              <span className="font-medium text-lp-text">Captain-led</span> teams mean one person
              registers and owns the roster. <span className="font-medium text-lp-text">Solo</span> is
              for blind draws or singles brackets.
            </p>
          </FieldHelp>
          <div>
            <Label htmlFor="teamFormat">Registration format</Label>
            <select
              id="teamFormat"
              name="teamFormat"
              className="mt-1.5 flex w-full min-h-12 rounded-[10px] border border-lp-border bg-lp-bg/80 px-4 text-base text-lp-text outline-none focus:border-lp-accent/60 focus:ring-2 focus:ring-lp-accent/25"
              defaultValue="SOLO"
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
            <Input id="teamSize" name="teamSize" type="number" min={1} max={20} className="mt-1.5" placeholder="2" />
            <FieldHint>For solo nights you can still use 2 for blind draw pairs.</FieldHint>
          </div>
          <label className="flex items-center gap-3 text-sm font-medium">
            <input type="checkbox" name="captainRequired" className="size-4 rounded border-lp-border" />
            Captain required to complete roster
          </label>
        </Card>

        <Card className="space-y-5">
          <h2 className="lp-page-title text-xl">Format & schedule</h2>
          <FieldHelp title="Round robin vs elimination">
            <p>
              Round robin spreads losses across weeks — great for loyalty. Single elimination is
              fast drama on one stage. Double elimination keeps top teams alive longer.
            </p>
          </FieldHelp>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="scheduleKind">Schedule</Label>
              <select id="scheduleKind" name="scheduleKind" className="mt-1.5 flex w-full min-h-12 rounded-[10px] border border-lp-border bg-lp-bg/80 px-4 text-base text-lp-text outline-none focus:border-lp-accent/60 focus:ring-2 focus:ring-lp-accent/25" defaultValue="ONE_TIME">
                {schedules.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="bracketKind">Bracket / standings style</Label>
              <select id="bracketKind" name="bracketKind" className="mt-1.5 flex w-full min-h-12 rounded-[10px] border border-lp-border bg-lp-bg/80 px-4 text-base text-lp-text outline-none focus:border-lp-accent/60 focus:ring-2 focus:ring-lp-accent/25" defaultValue="ROUND_ROBIN">
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
            <Input id="recurringRule" name="recurringRule" placeholder="Every Thursday · 8 weeks + finals" />
          </div>
        </Card>

        <Card className="space-y-5">
          <h2 className="lp-page-title text-xl">Rules, prizes, waiver</h2>
          <div>
            <Label htmlFor="rules">House rules</Label>
            <Textarea id="rules" name="rules" placeholder="Equipment, forfeit policy, pace-of-play…" />
          </div>
          <div>
            <Label htmlFor="prizeSummary">Prize structure summary</Label>
            <Input id="prizeSummary" name="prizeSummary" placeholder="$300 pot + finals bar tab" />
            <FieldHint>Short line for cards and emails. Details can live in payout notes.</FieldHint>
          </div>
          <div>
            <Label htmlFor="payoutNotes">Payout notes (optional)</Label>
            <Textarea id="payoutNotes" name="payoutNotes" placeholder="70/20/10 split after fees…" />
          </div>
          <div>
            <Label htmlFor="waiverText">Waiver / terms (optional)</Label>
            <Textarea id="waiverText" name="waiverText" placeholder="Participation at your own risk…" />
          </div>
        </Card>

        <Card className="space-y-4">
          <label className="flex items-center gap-3 text-sm font-medium">
            <input type="checkbox" name="publishNow" className="size-4 rounded border-lp-border" />
            Publish and open signup now
          </label>
          <FieldHint>If unchecked, competition saves as draft — only staff can see it.</FieldHint>
          <Button type="submit" size="lg" className="w-full sm:w-auto">
            Save competition
          </Button>
        </Card>
      </form>
    </div>
  );
}
