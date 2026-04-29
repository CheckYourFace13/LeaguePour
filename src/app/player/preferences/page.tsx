import Link from "next/link";
import { auth } from "@/auth";
import { FieldHelp } from "@/components/forms/field-help";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { prisma } from "@/lib/db";
import { updateCommunicationPreferences } from "./actions";
import { PREFERENCE_EVENT_TYPES } from "@/lib/player-preference-event-types";
import { updateEventTypeWeightsFormAction } from "./event-type-actions";

function prefNotice(n?: string) {
  if (n === "types-saved") return "Event type weights saved.";
  if (n === "invalid-weights") return "Use whole numbers between 1 and 5 for each type you edit.";
  return null;
}

export default async function PlayerPreferencesPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const session = await auth();
  const sp = await searchParams;
  const banner = prefNotice(sp.notice);

  const [prefs, types] = await Promise.all([
    prisma.communicationPreference.findUnique({ where: { userId: session!.user.id } }),
    prisma.eventTypePreference.findMany({ where: { userId: session!.user.id } }),
  ]);

  const weightByKind = new Map(types.map((t) => [t.kind, t.weight]));

  return (
    <div className="space-y-8 md:space-y-10">
      <div>
        <h1 className="lp-page-title text-3xl md:text-4xl">Preferences</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-lp-muted md:text-lg">
          Control how rooms reach you and which event types you want surfaced.
        </p>
      </div>
      <FieldHelp title="Why this matters">
        <p>
          Venues grow when players trust the channel. Global opt-out stops promotional sends; you may still get
          transactional updates about events you joined.
        </p>
      </FieldHelp>

      {banner ? (
        <div className="rounded-[10px] border border-lp-accent/35 bg-lp-accent/10 px-4 py-3 text-sm font-medium text-lp-text">
          {banner}
        </div>
      ) : null}

      {prefs ? (
        <Card className="space-y-8">
          <form action={updateCommunicationPreferences} className="space-y-8">
            <fieldset className="space-y-5">
              <legend className="lp-kicker">Communication</legend>
              <label className="flex min-h-12 cursor-pointer items-start gap-4 rounded-[10px] border border-lp-border bg-lp-bg/50 px-4 py-3">
                <input
                  type="checkbox"
                  name="emailOffers"
                  value="on"
                  defaultChecked={prefs.emailOffers}
                  className="mt-1 size-5 shrink-0 rounded border-lp-border text-lp-accent focus:ring-lp-accent/40"
                />
                <span>
                  <span className="font-semibold text-lp-text">Email offers & recaps</span>
                  <span className="mt-1 block text-sm text-lp-muted">Venue campaigns and league updates by email.</span>
                </span>
              </label>
              <label className="flex min-h-12 cursor-pointer items-start gap-4 rounded-[10px] border border-lp-border bg-lp-bg/50 px-4 py-3">
                <input
                  type="checkbox"
                  name="smsOffers"
                  value="on"
                  defaultChecked={prefs.smsOffers}
                  className="mt-1 size-5 shrink-0 rounded border-lp-border text-lp-accent focus:ring-lp-accent/40"
                />
                <span>
                  <span className="font-semibold text-lp-text">SMS offers & alerts</span>
                  <span className="mt-1 block text-sm text-lp-muted">Day-of reminders when the venue enables SMS.</span>
                </span>
              </label>
              <label className="flex min-h-12 cursor-pointer items-start gap-4 rounded-[10px] border border-lp-border bg-lp-bg/50 px-4 py-3">
                <input
                  type="checkbox"
                  name="eventReminders"
                  value="on"
                  defaultChecked={prefs.eventReminders}
                  className="mt-1 size-5 shrink-0 rounded border-lp-border text-lp-accent focus:ring-lp-accent/40"
                />
                <span>
                  <span className="font-semibold text-lp-text">Event reminders</span>
                  <span className="mt-1 block text-sm text-lp-muted">Signup closing, start time changes, and results.</span>
                </span>
              </label>
              <label className="flex min-h-12 cursor-pointer items-start gap-4 rounded-[10px] border border-lp-warning/35 bg-lp-warning/5 px-4 py-3">
                <input
                  type="checkbox"
                  name="globalOptOut"
                  value="on"
                  defaultChecked={prefs.globalOptOut}
                  className="mt-1 size-5 shrink-0 rounded border-lp-border text-lp-accent focus:ring-lp-accent/40"
                />
                <span>
                  <span className="font-semibold text-lp-text">Global promotional opt-out</span>
                  <span className="mt-1 block text-sm text-lp-muted">Stops marketing-style messages across venues.</span>
                </span>
              </label>
            </fieldset>

            <div>
              <Label htmlFor="frequency" className="text-base font-semibold text-lp-text-soft">
                Frequency
              </Label>
              <select
                id="frequency"
                name="frequency"
                defaultValue={prefs.frequency}
                className="mt-3 flex w-full min-h-12 rounded-[10px] border border-lp-border bg-lp-bg px-4 text-base font-medium text-lp-text outline-none focus:border-lp-accent/60 focus:ring-2 focus:ring-lp-accent/25"
              >
                <option value="quiet">Quiet — only essentials</option>
                <option value="normal">Normal</option>
                <option value="loud">Loud — tell me everything</option>
              </select>
            </div>

            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Save communication
            </Button>
          </form>
        </Card>
      ) : (
        <Card className="p-6">
          <p className="text-base text-lp-muted">
            No preference row on file yet.{" "}
            <Link href="/signup/player" className="font-semibold text-lp-accent hover:underline">
              Complete player signup
            </Link>{" "}
            to initialize defaults.
          </p>
        </Card>
      )}

      <Card className="space-y-6 p-6 md:p-8">
        <div>
          <h2 className="lp-page-title text-xl md:text-2xl">Favorite event types</h2>
          <p className="mt-2 text-sm text-lp-muted md:text-base">
            Weight 1–5 per type (higher surfaces more in discover and venue tooling). Leave blank to skip updating a row.
          </p>
        </div>
        <form action={updateEventTypeWeightsFormAction} className="grid gap-4 sm:grid-cols-2">
          {PREFERENCE_EVENT_TYPES.map((kind) => (
            <div key={kind}>
              <Label htmlFor={`w-${kind}`} className="text-sm font-semibold text-lp-text-soft">
                {kind.replaceAll("_", " ")}
              </Label>
              <Input
                id={`w-${kind}`}
                name={`w_${kind}`}
                type="number"
                min={1}
                max={5}
                defaultValue={weightByKind.get(kind) ?? 2}
                inputMode="numeric"
                className="mt-2 min-h-12 text-base"
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Save event types
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
